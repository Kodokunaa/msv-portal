import Pagination from '@/components/msv/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Paginated, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Check,
    Filter,
    MapPin,
    MapPinOff,
    PauseCircle,
    PlayCircle,
    RotateCcw,
    ShieldCheck,
    ShieldMinus,
    UserCheck,
    UserMinus,
    UserRoundX,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Member Management', href: '/management/members' }];
type Council = { id: number; name: string };
type UserRow = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified: boolean;
    status: string;
    status_name: string;
    role: string;
    role_code: string | null;
    council: string | null;
    created_at: string;
    has_council_scope: boolean;
};
type Filters = { search?: string; status?: string; role?: string; council?: string };
const statusStyles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-rose-100 text-rose-800',
    suspended: 'bg-slate-200 text-slate-800',
    deactivated: 'bg-zinc-200 text-zinc-700',
};

export default function Members({ users, filters, councils }: { users: Paginated<UserRow>; filters: Filters; councils: Council[] }) {
    const { auth } = usePage<SharedData>().props;
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        status: filters.status || '',
        role: filters.role || '',
        council: filters.council || '',
    });
    const [councilSelections, setCouncilSelections] = useState<Record<number, string>>({});

    const applyFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/management/members', filterData, { preserveState: true, replace: true });
    };
    const clearFilters = () => {
        setFilterData({ search: '', status: '', role: '', council: '' });
        router.get('/management/members', {}, { preserveState: true, replace: true });
    };
    const askReason = (message: string) => {
        const reason = window.prompt(message);
        return reason?.trim() || null;
    };
    const patchWithReason = (url: string, prompt: string) => {
        const reason = askReason(prompt);
        if (reason) router.patch(url, { reason }, { preserveScroll: true });
    };

    const counts = {
        active: users.data.filter((u) => u.status === 'active').length,
        pending: users.data.filter((u) => u.status === 'pending').length,
        admins: users.data.filter((u) => ['admin', 'manager'].includes(u.role_code || '')).length,
    };
    const summaryCards: Array<[string, number, LucideIcon, string]> = [
        ['Active on this page', counts.active, Users, 'bg-emerald-50 text-emerald-700'],
        ['Pending on this page', counts.pending, UserCheck, 'bg-amber-50 text-amber-700'],
        ['Administrators on page', counts.admins, ShieldCheck, 'bg-[#e9f2e7] text-[#075313]'],
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Management" />
            <main className="msv-page space-y-6">
                <div>
                    <p className="msv-label">Administration</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#063d1f]">Member management</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Review applications, manage account status, and assign role and council access. Every status change is retained in history.
                    </p>
                </div>

                <section className="grid gap-4 sm:grid-cols-3">
                    {summaryCards.map(([label, value, Icon, style]) => (
                        <Card key={String(label)} className="border-border shadow-sm">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`flex size-11 items-center justify-center rounded-xl ${style}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">{label}</p>
                                    <p className="text-2xl font-bold">{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-6">
                            <Input
                                className="md:col-span-2"
                                placeholder="Name, email, or membership number"
                                value={filterData.search}
                                onChange={(e) => setFilterData({ ...filterData, search: e.target.value })}
                            />
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.status}
                                onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                                <option value="deactivated">Deactivated</option>
                            </select>
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.role}
                                onChange={(e) => setFilterData({ ...filterData, role: e.target.value })}
                            >
                                <option value="">All roles</option>
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                            </select>
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.council}
                                onChange={(e) => setFilterData({ ...filterData, council: e.target.value })}
                            >
                                <option value="">All councils</option>
                                {councils.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
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
                        <CardTitle className="text-[#063d1f]">Accounts and applications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#eef3eb] text-xs tracking-wide text-[#36523d] uppercase">
                                    <tr>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Role</th>
                                        <th className="px-5 py-3">Council</th>
                                        <th className="px-5 py-3">Registered</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border divide-y">
                                    {users.data.map((user) => {
                                        const initials = user.name
                                            .split(' ')
                                            .map((p) => p[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase();
                                        return (
                                            <tr key={user.id} className="hover:bg-muted/50 align-top">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9">
                                                            <AvatarImage src={user.avatar || undefined} />
                                                            <AvatarFallback className="bg-[#e6c527] text-xs font-bold text-[#17330e]">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{user.name}</p>
                                                            <p className="text-muted-foreground text-xs">{user.email}</p>
                                                            <p
                                                                className={`mt-1 text-[11px] ${user.email_verified ? 'text-emerald-700' : 'text-amber-700'}`}
                                                            >
                                                                {user.email_verified ? 'Email verified' : 'Email not verified'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        className={`${statusStyles[user.status] || 'bg-slate-100 text-slate-700'} hover:bg-inherit`}
                                                    >
                                                        {user.status_name}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 font-medium">{user.role}</td>
                                                <td className="text-muted-foreground px-5 py-4">{user.council || '—'}</td>
                                                <td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-56 flex-wrap justify-end gap-2">
                                                        {['pending', 'rejected'].includes(user.status) && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.patch(
                                                                        `/management/members/${user.id}/approve`,
                                                                        {},
                                                                        { preserveScroll: true },
                                                                    )
                                                                }
                                                            >
                                                                <Check className="size-4" /> {user.status === 'rejected' ? 'Reconsider' : 'Approve'}
                                                            </Button>
                                                        )}
                                                        {user.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-rose-200 text-rose-700"
                                                                onClick={() =>
                                                                    patchWithReason(
                                                                        `/management/members/${user.id}/reject`,
                                                                        'Why is this application being rejected?',
                                                                    )
                                                                }
                                                            >
                                                                <UserRoundX className="size-4" /> Reject
                                                            </Button>
                                                        )}
                                                        {user.status === 'active' && user.role_code !== 'manager' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        patchWithReason(
                                                                            `/management/members/${user.id}/suspend`,
                                                                            'Why should this account be suspended?',
                                                                        )
                                                                    }
                                                                >
                                                                    <PauseCircle className="size-4" /> Suspend
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-rose-200 text-rose-700"
                                                                    onClick={() =>
                                                                        patchWithReason(
                                                                            `/management/members/${user.id}/deactivate`,
                                                                            'Why should this account be deactivated?',
                                                                        )
                                                                    }
                                                                >
                                                                    <UserMinus className="size-4" /> Deactivate
                                                                </Button>
                                                            </>
                                                        )}
                                                        {['suspended', 'deactivated'].includes(user.status) && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    patchWithReason(
                                                                        `/management/members/${user.id}/reactivate`,
                                                                        'Why is this account being reactivated?',
                                                                    )
                                                                }
                                                            >
                                                                <PlayCircle className="size-4" /> Reactivate
                                                            </Button>
                                                        )}
                                                        {auth.user?.is_manager && user.status === 'active' && user.role_code === 'member' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.patch(
                                                                        `/management/members/${user.id}/promote`,
                                                                        {},
                                                                        { preserveScroll: true },
                                                                    )
                                                                }
                                                            >
                                                                <ShieldCheck className="size-4" /> Promote
                                                            </Button>
                                                        )}
                                                        {auth.user?.is_manager && user.role_code === 'admin' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        router.patch(
                                                                            `/management/members/${user.id}/demote`,
                                                                            {},
                                                                            { preserveScroll: true },
                                                                        )
                                                                    }
                                                                >
                                                                    <ShieldMinus className="size-4" /> Demote
                                                                </Button>
                                                                <select
                                                                    className="border-input h-9 rounded-md border bg-white px-2 text-xs"
                                                                    value={councilSelections[user.id] || ''}
                                                                    onChange={(e) =>
                                                                        setCouncilSelections({ ...councilSelections, [user.id]: e.target.value })
                                                                    }
                                                                >
                                                                    <option value="">Select council</option>
                                                                    {councils.map((c) => (
                                                                        <option key={c.id} value={c.id}>
                                                                            {c.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled={!councilSelections[user.id]}
                                                                    onClick={() =>
                                                                        router.patch(
                                                                            `/management/members/${user.id}/assign-council`,
                                                                            { provincial_council_id: councilSelections[user.id] },
                                                                            { preserveScroll: true },
                                                                        )
                                                                    }
                                                                >
                                                                    <MapPin className="size-4" /> Assign
                                                                </Button>
                                                                {user.has_council_scope && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            router.patch(
                                                                                `/management/members/${user.id}/remove-council`,
                                                                                {},
                                                                                { preserveScroll: true },
                                                                            )
                                                                        }
                                                                    >
                                                                        <MapPinOff className="size-4" /> Remove scope
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-muted-foreground px-5 py-12 text-center">
                                                No users match the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={users.links} from={users.from} to={users.to} total={users.total} />
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
