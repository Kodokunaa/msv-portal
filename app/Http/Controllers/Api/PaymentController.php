<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Http\Requests\Payments\SavePaymentRequest;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $canManage = $user->canManageRecords();

        $query = DB::table('payments')
            ->whereNull('payments.voided_at')
            ->join('member_profiles', 'member_profiles.id', '=', 'payments.member_profile_id')
            ->join('users', 'users.id', '=', 'member_profiles.user_id')
            ->join('payment_types', 'payment_types.id', '=', 'payments.payment_type_id')
            ->join('payment_statuses', 'payment_statuses.id', '=', 'payments.payment_status_id')
            ->select(
                'payments.id',
                'payments.member_profile_id',
                'payments.amount_due',
                'payments.amount_paid',
                'payments.payment_date',
                'payments.reference_number',
                'users.first_name',
                'users.last_name',
                'payment_types.name as payment_type',
                'payment_statuses.code as status',
                'payment_statuses.name as status_name',
            )
            ->orderByDesc('payments.id');

        if (! $canManage) {
            $query->where('users.id', $user->id);
        }

        $paginator = $query->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'next_page_url' => $paginator->nextPageUrl(),
                'previous_page_url' => $paginator->previousPageUrl(),
            ],
        ]);
    }

    public function store(SavePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $profile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [Payment::class, $profile]);

        $payment = Payment::query()->create($data + ['created_by' => $request->user()->id]);
        AuditLog::record($request, 'payment.created', Payment::class, $payment->id, null, $payment->toArray());

        return response()->json(['data' => $payment->fresh()], 201);
    }

    public function update(SavePaymentRequest $request, Payment $payment): JsonResponse
    {
        $payment->loadMissing('memberProfile');
        $this->authorize('update', $payment);

        $data = $request->validated();
        $newProfile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [Payment::class, $newProfile]);

        $old = $payment->toArray();
        $payment->update($data);
        AuditLog::record($request, 'payment.updated', Payment::class, $payment->id, $old, $payment->fresh()->toArray());

        return response()->json(['data' => $payment->fresh()]);
    }

    public function destroy(VoidRecordRequest $request, Payment $payment): JsonResponse
    {
        $payment->loadMissing('memberProfile');
        $this->authorize('delete', $payment);
        abort_if($payment->voided_at, 422, 'This payment is already voided.');

        $old = $payment->toArray();
        $payment->update([
            'voided_at' => now(),
            'voided_by' => $request->user()->id,
            'void_reason' => $request->validated('reason'),
        ]);
        AuditLog::record($request, 'payment.voided', Payment::class, $payment->id, $old, $payment->fresh()->toArray());

        return response()->json(['message' => 'Payment record voided.']);
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 50), 100));
    }
}
