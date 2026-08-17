import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CreditCard, FileWarning, Landmark, ShieldCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Member Dashboard', href: '/member/dashboard' }];
const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

type Props = {
    role: string;
    council: string | null;
    stats: { income: number; expenses: number; balance: number; payments: number };
};

export default function MemberDashboard({ role, council, stats }: Props) {
    const { auth } = usePage<SharedData>().props;
    const cards = [
        {
            title: 'Financial transparency',
            value: money(stats.balance),
            note: 'Published income less expenses',
            icon: Landmark,
            href: '/financial-records',
        },
        {
            title: 'My payments',
            value: String(stats.payments),
            note: 'Personal payment entries',
            icon: CreditCard,
            href: '/payments',
        },
        {
            title: 'Disciplinary records',
            value: 'View',
            note: 'Read-only for members',
            icon: FileWarning,
            href: '/disciplinary-records',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Dashboard" />
            <main className="msv-page space-y-6">
                <section className="relative overflow-hidden rounded-3xl bg-[#063d1f] px-6 py-8 text-white sm:px-9 sm:py-10">
                    <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <Badge className="bg-[#e6c527] text-[#17330e] hover:bg-[#e6c527]">{role}</Badge>
                                <Badge variant="outline" className="border-white/30 text-white">
                                    Active account
                                </Badge>
                            </div>
                            <p className="text-sm font-semibold tracking-[0.16em] text-[#f2d94d] uppercase">MSV Member Portal</p>
                            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {auth.user?.first_name}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                                Review published financial records, your payment history, and disciplinary records. Members cannot edit these records.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                            <p className="text-xs text-white/60">Council</p>
                            <p className="mt-1 font-semibold">{council || 'MSV Organization'}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
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
                            <p>Financial records are visible to approved members. Only the Manager can change them.</p>
                            <p>You can view only your own payment history.</p>
                            <p>Disciplinary records are read-only for members.</p>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </AppLayout>
    );
}
