import { performance } from 'node:perf_hooks';
import process from 'node:process';

const baseUrl = process.env.LOAD_BASE_URL ?? 'http://127.0.0.1:8000';
const users = Number(process.env.LOAD_USERS ?? 1000);
const requestTimeoutMs = Number(process.env.LOAD_REQUEST_TIMEOUT_MS ?? 30000);

const loginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: 'member@msv.local', password: 'Password123!' }),
});

if (!loginResponse.ok) {
    throw new Error(`Load-test login failed with HTTP ${loginResponse.status}`);
}

const { token } = await loginResponse.json();
const scenarios = ['/', '/api/financial-records', '/api/payments', '/api/disciplinary-records'];
const results = [];
const startedAt = performance.now();

await Promise.all(
    Array.from({ length: users }, async (_, userIndex) => {
        for (const path of scenarios) {
            const requestStartedAt = performance.now();
            try {
                const response = await fetch(`${baseUrl}${path}`, {
                    signal: AbortSignal.timeout(requestTimeoutMs),
                    headers: path.startsWith('/api/') ? { accept: 'application/json', authorization: `Bearer ${token}` } : { accept: 'text/html' },
                });
                await response.arrayBuffer();
                results.push({
                    user: userIndex,
                    path,
                    status: response.status,
                    duration: performance.now() - requestStartedAt,
                });
            } catch (error) {
                results.push({
                    user: userIndex,
                    path,
                    status: 0,
                    duration: performance.now() - requestStartedAt,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }),
);

const totalDuration = performance.now() - startedAt;
const durations = results.map(({ duration }) => duration).sort((a, b) => a - b);
const percentile = (fraction) => durations[Math.min(durations.length - 1, Math.floor(durations.length * fraction))] ?? 0;
const statusCounts = Object.groupBy(results, ({ status }) => String(status));

await fetch(`${baseUrl}/api/logout`, {
    method: 'POST',
    headers: { accept: 'application/json', authorization: `Bearer ${token}` },
}).catch(() => undefined);

console.log(
    JSON.stringify(
        {
            concurrentUsers: users,
            requestsPerUser: scenarios.length,
            totalRequests: results.length,
            successfulRequests: results.filter(({ status }) => status >= 200 && status < 400).length,
            failedRequests: results.filter(({ status }) => status < 200 || status >= 400).length,
            statusCounts: Object.fromEntries(Object.entries(statusCounts).map(([status, rows]) => [status, rows.length])),
            wallTimeSeconds: Number((totalDuration / 1000).toFixed(2)),
            requestsPerSecond: Number((results.length / (totalDuration / 1000)).toFixed(2)),
            latencyMs: {
                min: Number((durations[0] ?? 0).toFixed(2)),
                median: Number(percentile(0.5).toFixed(2)),
                p95: Number(percentile(0.95).toFixed(2)),
                p99: Number(percentile(0.99).toFixed(2)),
                max: Number((durations.at(-1) ?? 0).toFixed(2)),
            },
            sampleErrors: results.filter(({ error }) => error).slice(0, 5),
        },
        null,
        2,
    ),
);
