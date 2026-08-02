import Pagination from '@/components/msv/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Filter, RotateCcw, ScrollText } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Audit Logs', href: '/audit-logs' }];
type Log = {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    old_values: unknown;
    new_values: unknown;
    ip_address: string | null;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
};
type Filters = { search?: string; action?: string; date_from?: string; date_to?: string };

export default function AuditLogs({ logs, filters, actions }: { logs: Paginated<Log>; filters: Filters; actions: string[] }) {
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        action: filters.action || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });
    const applyFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/audit-logs', filterData, { preserveState: true, replace: true });
    };
    const clearFilters = () => {
        setFilterData({ search: '', action: '', date_from: '', date_to: '' });
        router.get('/audit-logs', {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <main className="msv-page space-y-6">
                <div>
                    <p className="msv-label">Manager access</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#063d1f]">Audit logs</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        A read-only history of authentication, approvals, role changes, status changes, and record modifications.
                    </p>
                </div>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-5">
                            <Input
                                placeholder="User, action, or entity"
                                value={filterData.search}
                                onChange={(e) => setFilterData({ ...filterData, search: e.target.value })}
                            />
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.action}
                                onChange={(e) => setFilterData({ ...filterData, action: e.target.value })}
                            >
                                <option value="">All actions</option>
                                {actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action.replaceAll('.', ' ')}
                                    </option>
                                ))}
                            </select>
                            <Input
                                type="date"
                                value={filterData.date_from}
                                onChange={(e) => setFilterData({ ...filterData, date_from: e.target.value })}
                            />
                            <Input
                                type="date"
                                value={filterData.date_to}
                                onChange={(e) => setFilterData({ ...filterData, date_to: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Button className="flex-1">
                                    <Filter className="size-4" /> Filter
                                </Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    <RotateCcw className="size-4" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <Card className="border-border overflow-hidden shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#063d1f]">
                            <ScrollText className="size-5" /> System activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#eef3eb] text-xs tracking-wide text-[#36523d] uppercase">
                                    <tr>
                                        <th className="px-5 py-3">Date and time</th>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Action</th>
                                        <th className="px-5 py-3">Entity</th>
                                        <th className="px-5 py-3">IP address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border divide-y">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/50">
                                            <td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4 font-medium">
                                                {[log.first_name, log.last_name].filter(Boolean).join(' ') || 'System'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge variant="secondary" className="capitalize">
                                                    {log.action.replaceAll('.', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="text-muted-foreground px-5 py-4">
                                                {log.entity_type.split('\\').pop()} {log.entity_id ? `#${log.entity_id}` : ''}
                                            </td>
                                            <td className="text-muted-foreground px-5 py-4 font-mono text-xs">{log.ip_address || '—'}</td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-muted-foreground px-5 py-12 text-center">
                                                No audit entries match the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={logs.links} from={logs.from} to={logs.to} total={logs.total} />
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
