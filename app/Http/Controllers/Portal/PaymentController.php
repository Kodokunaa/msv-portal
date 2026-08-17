<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Http\Requests\Payments\SavePaymentRequest;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
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
                'payments.*',
                'users.first_name',
                'users.last_name',
                'payment_types.name as payment_type',
                'payment_statuses.code as status',
                'payment_statuses.name as status_name',
            );

        if (! $canManage) {
            $query->where('users.id', $user->id);
        }

        $search = trim($request->string('search')->toString());
        $query
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('users.first_name', 'like', "%{$search}%")
                        ->orWhere('users.last_name', 'like', "%{$search}%")
                        ->orWhere('payments.reference_number', 'like', "%{$search}%")
                        ->orWhere('payment_types.name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('payment_statuses.code', $request->string('status')->toString()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('payments.payment_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('payments.payment_date', '<=', $request->date('date_to')));

        $summary = DB::query()
            ->fromSub(clone $query, 'filtered_payments')
            ->selectRaw('COUNT(*) as total_entries, COALESCE(SUM(amount_paid), 0) as total_paid, COALESCE(SUM(GREATEST(amount_due - amount_paid, 0)), 0) as outstanding')
            ->first();

        $memberQuery = DB::table('member_profiles')
            ->join('users', 'users.id', '=', 'member_profiles.user_id')
            ->join('account_statuses', 'account_statuses.id', '=', 'users.account_status_id')
            ->where('account_statuses.code', 'active')
            ->select('member_profiles.id', 'users.first_name', 'users.last_name')
            ->orderBy('users.last_name')
            ->orderBy('users.first_name');

        return Inertia::render('payments/index', [
            'payments' => $query
                ->orderByDesc('payments.created_at')
                ->orderByDesc('payments.id')
                ->paginate(20)
                ->withQueryString(),
            'summary' => [
                'entries' => (int) ($summary->total_entries ?? 0),
                'paid' => (float) ($summary->total_paid ?? 0),
                'outstanding' => (float) ($summary->outstanding ?? 0),
            ],
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'canManage' => $canManage,
            'members' => $canManage ? $memberQuery->get() : [],
            'types' => DB::table('payment_types')->select('id', 'name')->orderBy('name')->get(),
            'statuses' => DB::table('payment_statuses')->where('code', '!=', 'partial')->select('id', 'code', 'name')->orderBy('id')->get(),
        ]);
    }

    public function store(SavePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $profile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [Payment::class, $profile]);

        $payment = Payment::query()->create($data + ['created_by' => $request->user()->id]);

        AuditLog::record($request, 'payment.created', Payment::class, $payment->id, null, $payment->toArray());

        return back()->with('success', 'Payment record added.');
    }

    public function update(SavePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $payment->loadMissing('memberProfile');
        $this->authorize('update', $payment);

        $data = $request->validated();
        $newProfile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [Payment::class, $newProfile]);

        $old = $payment->toArray();
        $payment->update($data);

        AuditLog::record($request, 'payment.updated', Payment::class, $payment->id, $old, $payment->fresh()->toArray());

        return back()->with('success', 'Payment record updated.');
    }

    public function destroy(VoidRecordRequest $request, Payment $payment): RedirectResponse
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

        return back()->with('success', 'Payment record voided.');
    }
}
