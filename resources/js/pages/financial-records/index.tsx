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
import { Filter, Landmark, Pencil, PlusCircle, RotateCcw, Trash2, TrendingDown, TrendingUp, WalletCards, type LucideIcon } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Financial Records', href: '/financial-records' }];
const money = (value: number | string) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));

type RecordItem = {
    id: number;
    financial_category_id: number;
    provincial_council_id: number | null;
    description: string;
    amount: string;
    transaction_date: string;
    reference_number: string | null;
    category: string;
    type: 'income' | 'expense';
    council: string | null;
    publication_status: 'draft' | 'published';
};
type Category = { id: number; name: string; type: string };
type Council = { id: number; name: string };
type Filters = { search?: string; type?: string; council?: string; date_from?: string; date_to?: string };

export default function FinancialRecords({
    records,
    summary,
    filters,
    categories,
    councils,
    canManage,
}: {
    records: Paginated<RecordItem>;
    summary: { income: number; expenses: number; balance: number };
    filters: Filters;
    categories: Category[];
    councils: Council[];
    canManage: boolean;
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        type: filters.type || '',
        council: filters.council || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });
    const form = useForm({
        financial_category_id: '',
        provincial_council_id: '',
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        reference_number: '',
        notes: '',
        publication_status: 'published',
    });

    const resetForm = () => {
        setEditingId(null);
        form.reset();
        form.setData('transaction_date', new Date().toISOString().slice(0, 10));
        form.setData('publication_status', 'published');
    };
    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const options = { onSuccess: resetForm, preserveScroll: true };
        if (editingId) {
            form.put(`/financial-records/${editingId}`, options);
        } else {
            form.post('/financial-records', options);
        }
    };
    const editRecord = (record: RecordItem) => {
        setEditingId(record.id);
        form.setData({
            financial_category_id: String(record.financial_category_id),
            provincial_council_id: record.provincial_council_id ? String(record.provincial_council_id) : '',
            description: record.description,
            amount: String(record.amount),
            transaction_date: record.transaction_date.slice(0, 10),
            reference_number: record.reference_number || '',
            notes: '',
            publication_status: record.publication_status,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const applyFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/financial-records', filterData, { preserveState: true, replace: true });
    };
    const clearFilters = () => {
        setFilterData({ search: '', type: '', council: '', date_from: '', date_to: '' });
        router.get('/financial-records', {}, { preserveState: true, replace: true });
    };
    const deleteRecord = (record: RecordItem) => {
        const reason = window.prompt('Why should this financial record be voided?');
        if (!reason?.trim()) return;
        router.delete(`/financial-records/${record.id}`, { data: { reason: reason.trim() }, preserveScroll: true });
    };

    const summaryCards: Array<[string, number, LucideIcon, string]> = [
        ['Income', summary.income, TrendingUp, 'bg-emerald-50 text-emerald-800'],
        ['Expenses', summary.expenses, TrendingDown, 'bg-rose-50 text-rose-800'],
        ['Current balance', summary.balance, WalletCards, 'bg-amber-50 text-amber-900'],
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Records" />
            <main className="msv-page space-y-6">
                <div>
                    <p className="msv-label">Transparency module</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#063d1f]">Financial records</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Approved members can view published income and expenses. The Manager controls changes and publication.
                    </p>
                </div>

                <section className="grid gap-4 sm:grid-cols-3">
                    {summaryCards.map(([label, value, Icon, style]) => (
                        <Card key={label} className="border-border shadow-sm">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`flex size-11 items-center justify-center rounded-xl ${style}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">{label}</p>
                                    <p className="text-xl font-bold">{money(value)}</p>
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
                                placeholder="Description, category, or reference"
                                value={filterData.search}
                                onChange={(e) => setFilterData({ ...filterData, search: e.target.value })}
                            />
                            <select
                                className="border-input h-10 rounded-md border bg-white px-3 text-sm"
                                value={filterData.type}
                                onChange={(e) => setFilterData({ ...filterData, type: e.target.value })}
                            >
                                <option value="">All types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
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
                            <div className="flex gap-2 md:col-span-6 md:justify-end">
                                <Button>
                                    <Filter className="size-4" /> Apply filters
                                </Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    <RotateCcw className="size-4" /> Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {canManage && (
                    <Card className="border-[#cbb027]/50 bg-[#fffdf3] shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#063d1f]">
                                <PlusCircle className="size-5" /> {editingId ? 'Edit financial record' : 'Add financial record'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.financial_category_id}
                                        onChange={(e) => form.setData('financial_category_id', e.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.type})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.financial_category_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Council scope</Label>
                                    <select
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.provincial_council_id}
                                        onChange={(e) => form.setData('provincial_council_id', e.target.value)}
                                    >
                                        <option value="">Organization-wide</option>
                                        {councils.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.provincial_council_id} />
                                </div>
                                <div className="space-y-2 xl:col-span-2">
                                    <Label>Description</Label>
                                    <Input required value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                                    <InputError message={form.errors.description} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        value={form.data.amount}
                                        onChange={(e) => form.setData('amount', e.target.value)}
                                    />
                                    <InputError message={form.errors.amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={form.data.transaction_date}
                                        onChange={(e) => form.setData('transaction_date', e.target.value)}
                                    />
                                    <InputError message={form.errors.transaction_date} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Reference number</Label>
                                    <Input
                                        value={form.data.reference_number}
                                        onChange={(e) => form.setData('reference_number', e.target.value)}
                                        placeholder="Optional"
                                    />
                                    <InputError message={form.errors.reference_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Publication</Label>
                                    <select
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.publication_status}
                                        onChange={(e) => form.setData('publication_status', e.target.value)}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                    <InputError message={form.errors.publication_status} />
                                </div>
                                <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
                                    <Button disabled={form.processing}>{editingId ? 'Save changes' : 'Save record'}</Button>
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
                            <Landmark className="size-5" /> Transaction register
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#eef3eb] text-xs tracking-wide text-[#36523d] uppercase">
                                    <tr>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Description</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Council</th>
                                        {canManage && <th className="px-5 py-3">Publication</th>}
                                        <th className="px-5 py-3 text-right">Amount</th>
                                        {canManage && <th className="px-5 py-3" />}
                                    </tr>
                                </thead>
                                <tbody className="divide-border divide-y">
                                    {records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-muted/50">
                                            <td className="text-muted-foreground px-5 py-4 whitespace-nowrap">
                                                {new Date(record.transaction_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium">{record.description}</p>
                                                <p className="text-muted-foreground text-xs">{record.reference_number || 'No reference'}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge
                                                    className={
                                                        record.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }
                                                >
                                                    {record.category}
                                                </Badge>
                                            </td>
                                            <td className="text-muted-foreground px-5 py-4">{record.council || 'Organization-wide'}</td>
                                            {canManage && (
                                                <td className="px-5 py-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {record.publication_status}
                                                    </Badge>
                                                </td>
                                            )}
                                            <td
                                                className={`px-5 py-4 text-right font-bold ${record.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}
                                            >
                                                {record.type === 'income' ? '+' : '−'} {money(record.amount)}
                                            </td>
                                            {canManage && (
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => editRecord(record)}
                                                            className="rounded-md p-2 text-[#075313] hover:bg-[#e9f2e7]"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteRecord(record)}
                                                            className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {records.data.length === 0 && (
                                        <tr>
                                            <td colSpan={canManage ? 7 : 5} className="text-muted-foreground px-5 py-12 text-center">
                                                No financial records available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={records.links} from={records.from} to={records.to} total={records.total} />
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
