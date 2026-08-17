import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CreditCard, FileWarning, Landmark, ShieldCheck, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin Dashboard', href: '/admin/dashboard' }];
const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

type Props = {
    role: string;
    stats: { members: number; pending: number; income: number; expenses: number; balance: number; payments: number };
    recentActivity: Array<{ action: string; entity_type: string; created_at: string; first_name: string | null; last_name: string | null }>;
};

export default function AdminDashboard({ role, stats, recentActivity }: Props) {
    const { auth } = usePage<SharedData>().props;
    const cards = [
        {
            title: 'Financial transparency',
            value: money(stats.balance),
            note: auth.user?.is_manager ? 'Manager can add, edit, and delete' : 'Visible to members; Manager edits only',
            icon: Landmark,
            href: '/financial-records',
        },
        {
            title: 'Payment records',
            value: String(stats.payments),
            note: 'Manage all member payments',
            icon: CreditCard,
            href: '/payments',
        },
        {
            title: 'Approved members',
            value: String(stats.members),
            note: `${stats.pending} pending application(s)`,
            icon: Users,
            href: '/management/members',
        },
        {
            title: 'Disciplinary records',
            value: 'Manage',
            note: 'Add, edit, or delete cases',
            icon: FileWarning,
            href: '/disciplinary-records',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <main className="msv-page space-y-6">
                <section className="relative overflow-hidden rounded-3xl bg-[#063d1f] px-6 py-8 text-white sm:px-9 sm:py-10">
                    <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <Badge className="bg-[#e6c527] text-[#17330e] hover:bg-[#e6c527]">{role}</Badge>
                                <Badge variant="outline" className="border-white/30 text-white">
                                    Organization-wide access
                                </Badge>
                            </div>
                            <p className="text-sm font-semibold tracking-[0.16em] text-[#f2d94d] uppercase">MSV Administration</p>
                            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {auth.user?.first_name}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                                Approve members and manage payment and disciplinary records. Financial changes stay with the Manager.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Link key={card.title} href={card.href} className="group msv-card p-5 transition hover:border-[#c7aa19]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-[#e9f2e7] text-[#075313]">
                                    <card.icon className="size-5" />
                                </div>
                                <ArrowRight className="text-muted-foreground size-4 transition group-hover:translate-x-1 group-hover:text-[#075313]" />
                            </div>
                            <p className="text-muted-foreground mt-5 text-sm font-medium">{card.title}</p>
                            <p className="mt-1 text-2xl font-bold text-[#063d1f]">{card.value}</p>
                            <p className="text-muted-foreground mt-2 text-xs">{card.note}</p>
                        </Link>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-[#063d1f]">Financial overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl bg-emerald-50 p-4">
                                <p className="text-xs font-semibold text-emerald-700">TOTAL INCOME</p>
                                <p className="mt-2 text-xl font-bold text-emerald-900">{money(stats.income)}</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 p-4">
                                <p className="text-xs font-semibold text-rose-700">TOTAL EXPENSES</p>
                                <p className="mt-2 text-xl font-bold text-rose-900">{money(stats.expenses)}</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-4">
                                <p className="text-xs font-semibold text-amber-700">BALANCE</p>
                                <p className="mt-2 text-xl font-bold text-amber-900">{money(stats.balance)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#063d1f]">
                                <ShieldCheck className="size-5" /> Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground space-y-3 text-sm">
                            <p>Admins can approve members and manage all payment and disciplinary records.</p>
                            <p>Only the Manager can create, update, or delete financial records.</p>
                        </CardContent>
                    </Card>
                </section>

                {auth.user?.is_manager && recentActivity.length > 0 && (
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-[#063d1f]">Recent system activity</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-border divide-y">
                            {recentActivity.map((item, index) => (
                                <div key={`${item.action}-${index}`} className="flex flex-col justify-between gap-1 py-3 text-sm sm:flex-row">
                                    <span className="text-foreground font-medium">{item.action.replaceAll('.', ' ')}</span>
                                    <span className="text-muted-foreground">
                                        {[item.first_name, item.last_name].filter(Boolean).join(' ') || 'System'} ·{' '}
                                        {new Date(item.created_at).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </main>
        </AppLayout>
    );
}
