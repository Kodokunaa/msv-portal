<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($this->isApi($request)) {
                abort(401);
            }

            return redirect()->route('login');
        }

        $status = $user->accountStatus?->code;

        if ($status === 'pending') {
            if ($this->isApi($request)) {
                abort(403, 'Your account is pending approval.');
            }

            return redirect()->route('account.pending');
        }

        if (in_array($status, ['rejected', 'suspended', 'deactivated'], true)) {
            if ($this->isApi($request)) {
                abort(403, 'Your account cannot currently access the member portal.');
            }

            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Your account cannot currently access the member portal.',
                ]);
        }

        if ($status !== 'active') {
            abort(403);
        }

        return $next($request);
    }

    private function isApi(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }
}
