import InputError from '@/components/input-error';
import Pagination from '@/components/msv/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Filter, Pencil, PlusCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Payment Records', href: '/payments' }];
const money = (value: string | number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));

type Payment = {
    id: number;
    member_profile_id: number;
    payment_type_id: number;
    payment_status_id: number;
    first_name: string;
    last_name: string;
    payment_type: string;
    status: string;
    status_name: string;
    amount_due: string;
    amount_paid: string;
    payment_date: string | null;
    reference_number: string | null;
};
type Option = { id: number; name: string; code?: string; first_name?: string; last_name?: string };
type Filters = { search?: string; status?: string; date_from?: string; date_to?: string };

const statusStyle: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    unpaid: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
    pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    partial: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
};

export default function Payments({
    payments,
    summary,
    filters,
    canManage,
    members,
    types,
    statuses,
}: {
    payments: Paginated<Payment>;
    summary: { entries: number; paid: number; outstanding: number };
    filters: Filters;
    canManage: boolean;
    members: Option[];
    types: Option[];
    statuses: Option[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        status: filters.status || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });
    const form = useForm({
        member_profile_id: '',
        payment_type_id: '',
        payment_status_id: '',
        amount_due: '',
        amount_paid: '',
        payment_date: new Date().toISOString().slice(0, 10),
        reference_number: '',
        notes: '',
    });

    const resetForm = () => {
        setEditingId(null);
        form.reset();
        form.setData('payment_date', new Date().toISOString().slice(0, 10));
    };

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const options = { onSuccess: resetForm, preserveScroll: true };
        if (editingId) {
            form.put(`/payments/${editingId}`, options);
        } else {
            form.post('/payments', options);
        }
    };

    const editPayment = (payment: Payment) => {
        setEditingId(payment.id);
        form.setData({
            member_profile_id: String(payment.member_profile_id),
            payment_type_id: String(payment.payment_type_id),
            payment_status_id: String(payment.payment_status_id),
            amount_due: String(payment.amount_due),
            amount_paid: String(payment.amount_paid),
            payment_date: payment.payment_date?.slice(0, 10) || '',
            reference_number: payment.reference_number || '',
            notes: '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const applyFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/payments', filterData, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilterData({ search: '', status: '', date_from: '', date_to: '' });
        router.get('/payments', {}, { preserveState: true, replace: true });
    };

    const deletePayment = (payment: Payment) => {
        const reason = window.prompt('Why should this payment record be voided?');
        if (!reason?.trim()) return;
        router.delete(`/payments/${payment.id}`, { data: { reason: reason.trim() }, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Records" />
            <main className="msv-page space-y-6">
                <div>
                    <p className="msv-label">Payment module</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#063d1f]">{canManage ? 'Member payment records' : 'My payment history'}</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {canManage
                            ? 'Create, update, filter, and delete member payment entries.'
                            : 'Only payment records connected to your account are displayed.'}
                    </p>
                </div>

                <section className="grid gap-4 sm:grid-cols-3">
                    {[
                        ['Total entries', summary.entries, 'text-[#063d1f]'],
                        ['Amount paid', money(summary.paid), 'text-emerald-700'],
                        ['Outstanding', money(summary.outstanding), 'text-amber-800'],
                    ].map(([label, value, style]) => (
                        <Card key={String(label)} className="border-border shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-muted-foreground text-sm">{label}</p>
                                <p className={`mt-1 text-2xl font-bold ${style}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-5">
                            <Input
                                placeholder="Member, reference, or type"
                                value={filterData.search}
                                onChange={(e) => setFilterData({ ...filterData, search: e.target.value })}
                            />
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.status}
                                onChange={(e) => setFilterData({ ...filterData, status: e.target.value })}
                            >
                                <option value="">All statuses</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={s.code}>
                                        {s.name}
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

                {canManage && (
                    <Card className="border-[#cbb027]/50 bg-[#fffdf3] shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#063d1f]">
                                <PlusCircle className="size-5" /> {editingId ? 'Edit payment record' : 'Add payment record'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Member</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.member_profile_id}
                                        onChange={(e) => form.setData('member_profile_id', e.target.value)}
                                    >
                                        <option value="">Select member</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.first_name} {m.last_name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.member_profile_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment type</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.payment_type_id}
                                        onChange={(e) => form.setData('payment_type_id', e.target.value)}
                                    >
                                        <option value="">Select type</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.payment_type_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.payment_status_id}
                                        onChange={(e) => form.setData('payment_status_id', e.target.value)}
                                    >
                                        <option value="">Select status</option>
                                        {statuses.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.payment_status_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment date</Label>
                                    <Input
                                        type="date"
                                        value={form.data.payment_date}
                                        onChange={(e) => form.setData('payment_date', e.target.value)}
                                    />
                                    <InputError message={form.errors.payment_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount due</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={form.data.amount_due}
                                        onChange={(e) => form.setData('amount_due', e.target.value)}
                                    />
                                    <InputError message={form.errors.amount_due} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount paid</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={form.data.amount_paid}
                                        onChange={(e) => form.setData('amount_paid', e.target.value)}
                                    />
                                    <InputError message={form.errors.amount_paid} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference number</Label>
                                    <Input
                                        value={form.data.reference_number}
                                        onChange={(e) => form.setData('reference_number', e.target.value)}
                                        placeholder="Optional"
                                    />
                                    <InputError message={form.errors.reference_number} />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button className="flex-1" disabled={form.processing}>
                                        {editingId ? 'Save changes' : 'Save payment'}
                                    </Button>
                                    {editingId && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border overflow-hidden shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#063d1f]">
                            <CreditCard className="size-5" /> Payment history
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#eef3eb] text-xs tracking-wide text-[#36523d] uppercase">
                                    <tr>
                                        {canManage && <th className="px-5 py-3">Member</th>}
                                        <th className="px-5 py-3">Payment</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Due</th>
                                        <th className="px-5 py-3 text-right">Paid</th>
                                        {canManage && <th className="px-5 py-3" />}
                                    </tr>
                                </thead>
                                <tbody className="divide-border divide-y">
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted/50">
                                            {canManage && (
                                                <td className="px-5 py-4 font-medium">
                                                    {payment.first_name} {payment.last_name}
                                                </td>
                                            )}
                                            <td className="px-5 py-4">
                                                <p className="font-medium">{payment.payment_type}</p>
                                                <p className="text-muted-foreground text-xs">{payment.reference_number || 'No reference'}</p>
                                            </td>
                                            <td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
                                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className={statusStyle[payment.status] || 'bg-slate-100 text-slate-700'}>
                                                    {payment.status_name}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-right">{money(payment.amount_due)}</td>
                                            <td className="px-5 py-4 text-right font-semibold text-emerald-700">{money(payment.amount_paid)}</td>
                                            {canManage && (
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => editPayment(payment)}
                                                            className="rounded-md p-2 text-[#075313] hover:bg-[#e9f2e7]"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deletePayment(payment)}
                                                            className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                                                            title="Delete record"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {payments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={canManage ? 7 : 5} className="text-muted-foreground px-5 py-12 text-center">
                                                No payment records available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={payments.links} from={payments.from} to={payments.to} total={payments.total} />
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
