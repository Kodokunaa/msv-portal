<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\SaveFinancialRecordRequest;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Models\AuditLog;
use App\Models\FinancialRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinancialRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = DB::table('financial_records')
            ->whereNull('financial_records.voided_at')
            ->join('financial_categories', 'financial_categories.id', '=', 'financial_records.financial_category_id')
            ->join('financial_record_types', 'financial_record_types.id', '=', 'financial_categories.financial_record_type_id')
            ->leftJoin('provincial_councils', 'provincial_councils.id', '=', 'financial_records.provincial_council_id')
            ->select(
                'financial_records.*',
                'financial_categories.name as category',
                'financial_record_types.code as type',
                'provincial_councils.name as council',
            );

        if (! $user->isManager()) {
            $query->where('financial_records.publication_status', 'published');
        }

        $search = trim($request->string('search')->toString());
        $query
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('financial_records.description', 'like', "%{$search}%")
                        ->orWhere('financial_records.reference_number', 'like', "%{$search}%")
                        ->orWhere('financial_categories.name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('type'), fn ($query) => $query->where('financial_record_types.code', $request->string('type')->toString()))
            ->when($request->filled('council'), fn ($query) => $query->where('financial_records.provincial_council_id', $request->integer('council')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('financial_records.transaction_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('financial_records.transaction_date', '<=', $request->date('date_to')));

        $summaryRows = DB::query()
            ->fromSub(clone $query, 'filtered_financial_records')
            ->selectRaw('type as summary_type, COALESCE(SUM(amount), 0) as total')
            ->groupBy('type')
            ->pluck('total', 'summary_type');

        $income = (float) ($summaryRows['income'] ?? 0);
        $expenses = (float) ($summaryRows['expense'] ?? 0);

        return Inertia::render('financial-records/index', [
            'records' => $query->orderByDesc('transaction_date')->orderByDesc('financial_records.id')->paginate(20)->withQueryString(),
            'summary' => ['income' => $income, 'expenses' => $expenses, 'balance' => $income - $expenses],
            'filters' => $request->only(['search', 'type', 'council', 'date_from', 'date_to']),
            'categories' => DB::table('financial_categories')
                ->join('financial_record_types', 'financial_record_types.id', '=', 'financial_categories.financial_record_type_id')
                ->select('financial_categories.id', 'financial_categories.name', 'financial_record_types.code as type')
                ->orderBy('financial_categories.name')->get(),
            'councils' => DB::table('provincial_councils')->select('id', 'name')->orderBy('name')->get(),
            'canManage' => $user->isManager(),
        ]);
    }

    public function store(SaveFinancialRecordRequest $request): RedirectResponse
    {
        $this->authorize('create', FinancialRecord::class);
        $data = $request->validated();
        $data['publication_status'] ??= 'published';
        $data['published_at'] = $data['publication_status'] === 'published' ? now() : null;

        $record = FinancialRecord::query()->create($data + ['created_by' => $request->user()->id]);
        AuditLog::record($request, 'financial.created', FinancialRecord::class, $record->id, null, $record->toArray());

        return back()->with('success', 'Financial record added.');
    }

    public function update(SaveFinancialRecordRequest $request, FinancialRecord $financialRecord): RedirectResponse
    {
        $this->authorize('update', $financialRecord);
        $data = $request->validated();
        $data['publication_status'] ??= $financialRecord->publication_status;
        $data['published_at'] = $data['publication_status'] === 'published'
            ? ($financialRecord->published_at ?? now())
            : null;

        $old = $financialRecord->toArray();
        $financialRecord->update($data);
        AuditLog::record($request, 'financial.updated', FinancialRecord::class, $financialRecord->id, $old, $financialRecord->fresh()->toArray());

        return back()->with('success', 'Financial record updated.');
    }

    public function destroy(VoidRecordRequest $request, FinancialRecord $financialRecord): RedirectResponse
    {
        $this->authorize('delete', $financialRecord);
        abort_if($financialRecord->voided_at, 422, 'This financial record is already voided.');

        $old = $financialRecord->toArray();
        $financialRecord->update([
            'voided_at' => now(),
            'voided_by' => $request->user()->id,
            'void_reason' => $request->validated('reason'),
        ]);
        AuditLog::record($request, 'financial.voided', FinancialRecord::class, $financialRecord->id, $old, $financialRecord->fresh()->toArray());

        return back()->with('success', 'Financial record voided and retained in the audit history.');
    }
}
