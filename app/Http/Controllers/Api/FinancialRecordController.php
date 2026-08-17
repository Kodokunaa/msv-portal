<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\SaveFinancialRecordRequest;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Models\AuditLog;
use App\Models\FinancialRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FinancialRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('financial_records')
            ->whereNull('financial_records.voided_at')
            ->join('financial_categories', 'financial_categories.id', '=', 'financial_records.financial_category_id')
            ->join('financial_record_types', 'financial_record_types.id', '=', 'financial_categories.financial_record_type_id')
            ->leftJoin('provincial_councils', 'provincial_councils.id', '=', 'financial_records.provincial_council_id')
            ->select(
                'financial_records.id',
                'financial_records.description',
                'financial_records.amount',
                'financial_records.transaction_date',
                'financial_records.reference_number',
                'financial_records.publication_status',
                'financial_categories.name as category',
                'financial_record_types.code as type',
                'provincial_councils.name as council',
            )
            ->orderByDesc('financial_records.transaction_date')
            ->orderByDesc('financial_records.id');

        if (! $request->user()->isManager()) {
            $query->where('financial_records.publication_status', 'published');
        }

        $summaryRows = DB::query()
            ->fromSub(clone $query, 'visible_financial_records')
            ->selectRaw('type, COALESCE(SUM(amount), 0) as total')
            ->groupBy('type')
            ->pluck('total', 'type');
        $income = (float) ($summaryRows['income'] ?? 0);
        $expenses = (float) ($summaryRows['expense'] ?? 0);
        $paginator = $query->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'next_page_url' => $paginator->nextPageUrl(),
                'previous_page_url' => $paginator->previousPageUrl(),
            ],
            'summary' => [
                'income' => $income,
                'expenses' => $expenses,
                'balance' => $income - $expenses,
            ],
        ]);
    }

    public function store(SaveFinancialRecordRequest $request): JsonResponse
    {
        $this->authorize('create', FinancialRecord::class);
        $data = $request->validated();
        $data['publication_status'] ??= 'published';
        $data['published_at'] = $data['publication_status'] === 'published' ? now() : null;

        $record = FinancialRecord::query()->create($data + ['created_by' => $request->user()->id]);
        Cache::forget('portal.financial-totals');
        AuditLog::record($request, 'financial.created', FinancialRecord::class, $record->id, null, $record->toArray());

        return response()->json(['data' => $record->fresh()], 201);
    }

    public function update(SaveFinancialRecordRequest $request, FinancialRecord $financialRecord): JsonResponse
    {
        $this->authorize('update', $financialRecord);
        $data = $request->validated();
        $data['publication_status'] ??= $financialRecord->publication_status;
        $data['published_at'] = $data['publication_status'] === 'published'
            ? ($financialRecord->published_at ?? now())
            : null;

        $old = $financialRecord->toArray();
        $financialRecord->update($data);
        Cache::forget('portal.financial-totals');
        AuditLog::record($request, 'financial.updated', FinancialRecord::class, $financialRecord->id, $old, $financialRecord->fresh()->toArray());

        return response()->json(['data' => $financialRecord->fresh()]);
    }

    public function destroy(VoidRecordRequest $request, FinancialRecord $financialRecord): JsonResponse
    {
        $this->authorize('delete', $financialRecord);
        abort_if($financialRecord->voided_at, 422, 'This financial record is already voided.');

        $old = $financialRecord->toArray();
        $financialRecord->update([
            'voided_at' => now(),
            'voided_by' => $request->user()->id,
            'void_reason' => $request->validated('reason'),
        ]);
        Cache::forget('portal.financial-totals');
        AuditLog::record($request, 'financial.voided', FinancialRecord::class, $financialRecord->id, $old, $financialRecord->fresh()->toArray());

        return response()->json(['message' => 'Financial record voided.']);
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 50), 100));
    }
}
