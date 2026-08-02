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
import { FileWarning, Filter, Pencil, PlusCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Disciplinary Records', href: '/disciplinary-records' }];
type RecordItem = {
    id: number;
    case_number: string | null;
    member_profile_id: number;
    violation_type_id: number;
    disciplinary_status_id: number;
    first_name: string;
    last_name: string;
    violation_type: string;
    status: string;
    status_name: string;
    incident_date: string;
    description: string;
    action_taken: string | null;
    visibility: 'organization' | 'member' | 'private';
};
type Option = { id: number; name: string; code?: string; first_name?: string; last_name?: string };
type Filters = { search?: string; status?: string; date_from?: string; date_to?: string };
const statusStyle: Record<string, string> = {
    open: 'bg-rose-100 text-rose-800',
    'under-review': 'bg-amber-100 text-amber-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    dismissed: 'bg-slate-100 text-slate-700',
};

export default function DisciplinaryRecords({
    records,
    filters,
    canManage,
    members,
    types,
    statuses,
}: {
    records: Paginated<RecordItem>;
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
        case_number: '',
        member_profile_id: '',
        violation_type_id: '',
        disciplinary_status_id: '',
        incident_date: new Date().toISOString().slice(0, 10),
        description: '',
        action_taken: '',
        notes: '',
        visibility: 'organization',
    });
    const resetForm = () => {
        setEditingId(null);
        form.reset();
        form.setData('incident_date', new Date().toISOString().slice(0, 10));
        form.setData('visibility', 'organization');
    };
    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const options = { onSuccess: resetForm, preserveScroll: true };
        if (editingId) {
            form.put(`/disciplinary-records/${editingId}`, options);
        } else {
            form.post('/disciplinary-records', options);
        }
    };
    const editRecord = (record: RecordItem) => {
        setEditingId(record.id);
        form.setData({
            case_number: record.case_number || '',
            member_profile_id: String(record.member_profile_id),
            violation_type_id: String(record.violation_type_id),
            disciplinary_status_id: String(record.disciplinary_status_id),
            incident_date: record.incident_date.slice(0, 10),
            description: record.description,
            action_taken: record.action_taken || '',
            notes: '',
            visibility: record.visibility,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const applyFilters: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        router.get('/disciplinary-records', filterData, { preserveState: true, replace: true });
    };
    const clearFilters = () => {
        setFilterData({ search: '', status: '', date_from: '', date_to: '' });
        router.get('/disciplinary-records', {}, { preserveState: true, replace: true });
    };
    const voidRecord = (record: RecordItem) => {
        const reason = window.prompt('Why should this disciplinary record be voided?');
        if (!reason?.trim()) return;
        router.delete(`/disciplinary-records/${record.id}`, { data: { reason: reason.trim() }, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Disciplinary Records" />
            <main className="msv-page space-y-6">
                <div>
                    <p className="msv-label">Disciplinary module</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#063d1f]">Disciplinary records</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Members receive read-only access to published records. Authorized administrators manage records within their assigned council.
                    </p>
                </div>

                <Card className="border-border shadow-sm">
                    <CardContent className="p-5">
                        <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-5">
                            <Input
                                placeholder="Member, case number, or violation"
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
                                <PlusCircle className="size-5" /> {editingId ? 'Edit disciplinary record' : 'Add disciplinary record'}
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
                                    <Label>Violation type</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.violation_type_id}
                                        onChange={(e) => form.setData('violation_type_id', e.target.value)}
                                    >
                                        <option value="">Select type</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.violation_type_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        required
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.disciplinary_status_id}
                                        onChange={(e) => form.setData('disciplinary_status_id', e.target.value)}
                                    >
                                        <option value="">Select status</option>
                                        {statuses.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.disciplinary_status_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Incident date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={form.data.incident_date}
                                        onChange={(e) => form.setData('incident_date', e.target.value)}
                                    />
                                    <InputError message={form.errors.incident_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Case number</Label>
                                    <Input
                                        value={form.data.case_number}
                                        onChange={(e) => form.setData('case_number', e.target.value)}
                                        placeholder="Generated automatically if blank"
                                    />
                                    <InputError message={form.errors.case_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Visibility</Label>
                                    <select
                                        className="border-input h-10 w-full rounded-md border bg-white px-3 text-sm"
                                        value={form.data.visibility}
                                        onChange={(e) => form.setData('visibility', e.target.value)}
                                    >
                                        <option value="organization">All approved members</option>
                                        <option value="member">Affected member only</option>
                                        <option value="private">Administrators only</option>
                                    </select>
                                    <InputError message={form.errors.visibility} />
                                </div>
                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
                                    <Label>Description</Label>
                                    <textarea
                                        required
                                        className="border-input min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                    />
                                    <InputError message={form.errors.description} />
                                </div>
                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
                                    <Label>Action taken</Label>
                                    <textarea
                                        className="border-input min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm"
                                        value={form.data.action_taken}
                                        onChange={(e) => form.setData('action_taken', e.target.value)}
                                    />
                                    <InputError message={form.errors.action_taken} />
                                </div>
                                <div className="flex gap-2 md:col-span-2 xl:col-span-4">
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

                <div className="space-y-4">
                    {records.data.map((record) => (
                        <Card key={record.id} className="border-border shadow-sm">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-bold text-[#063d1f]">
                                                {record.first_name} {record.last_name}
                                            </h2>
                                            <Badge className={`${statusStyle[record.status] || 'bg-slate-100 text-slate-700'} hover:bg-inherit`}>
                                                {record.status_name}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">
                                                {record.visibility}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-[#856f00]">
                                            {record.case_number || `Case #${record.id}`} · {record.violation_type} ·{' '}
                                            {new Date(record.incident_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-muted-foreground mt-4 text-sm leading-6">{record.description}</p>
                                        {record.action_taken && (
                                            <div className="mt-4 rounded-xl bg-[#eef3eb] p-4">
                                                <p className="text-xs font-bold tracking-wide text-[#36523d] uppercase">Action taken</p>
                                                <p className="text-foreground mt-1 text-sm">{record.action_taken}</p>
                                            </div>
                                        )}
                                    </div>
                                    {canManage && (
                                        <div className="flex gap-1 self-start">
                                            <button
                                                type="button"
                                                onClick={() => editRecord(record)}
                                                className="rounded-md p-2 text-[#075313] hover:bg-[#e9f2e7]"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => voidRecord(record)}
                                                className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {records.data.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center py-14 text-center">
                                <FileWarning className="text-muted-foreground size-10" />
                                <p className="mt-3 font-medium">No disciplinary records</p>
                                <p className="text-muted-foreground text-sm">There are no entries to display.</p>
                            </CardContent>
                        </Card>
                    )}
                    <Pagination links={records.links} from={records.from} to={records.to} total={records.total} />
                </div>
            </main>
        </AppLayout>
    );
}
