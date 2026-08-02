<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\FinancialRecord;
use App\Models\MemberProfile;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->load([
            'accountStatus', 'activeRoles', 'memberProfile.provincialCouncil',
            'activeCouncilAssignments.provincialCouncil',
        ]);
        $isManager = $user->isManager();
        $isProvincialAdmin = ! $isManager && $user->hasRole('admin') && $user->hasProvincialScope();
        $canManage = $isManager || $isProvincialAdmin;

        $income = (float) FinancialRecord::query()
            ->current()
            ->where('publication_status', 'published')
            ->join('financial_categories', 'financial_categories.id', '=', 'financial_records.financial_category_id')
            ->join('financial_record_types', 'financial_record_types.id', '=', 'financial_categories.financial_record_type_id')
            ->where('financial_record_types.code', 'income')
            ->sum('financial_records.amount');

        $expenses = (float) FinancialRecord::query()
            ->current()
            ->where('publication_status', 'published')
            ->join('financial_categories', 'financial_categories.id', '=', 'financial_records.financial_category_id')
            ->join('financial_record_types', 'financial_record_types.id', '=', 'financial_categories.financial_record_type_id')
            ->where('financial_record_types.code', 'expense')
            ->sum('financial_records.amount');

        $paymentQuery = Payment::query()->current();
        if (! $canManage) {
            $paymentQuery->where('member_profile_id', $user->memberProfile?->id ?? 0);
        } elseif (! $isManager) {
            $profileIds = MemberProfile::query()->whereIn('provincial_council_id', $user->activeCouncilIds())->pluck('id');
            $paymentQuery->whereIn('member_profile_id', $profileIds);
        }

        $memberQuery = User::query()->whereHas('accountStatus', fn ($q) => $q->where('code', 'active'));
        $pendingQuery = User::query()->whereHas('accountStatus', fn ($q) => $q->where('code', 'pending'));
        if ($isProvincialAdmin) {
            $scope = $user->activeCouncilIds();
            $memberQuery->whereHas('memberProfile', fn ($q) => $q->whereIn('provincial_council_id', $scope));
            $pendingQuery->whereHas('memberProfile', fn ($q) => $q->whereIn('provincial_council_id', $scope));
        }

        return Inertia::render('dashboard', [
            'role' => $isManager ? 'Manager' : ($isProvincialAdmin ? 'Provincial Admin' : ($user->hasRole('admin') ? 'Admin — council assignment required' : 'Member')),
            'council' => $isManager
                ? null
                : ($user->activeCouncilAssignments->first()?->provincialCouncil?->name
                    ?? $user->memberProfile?->provincialCouncil?->name),
            'stats' => [
                'members' => $canManage ? $memberQuery->count() : null,
                'pending' => $canManage ? $pendingQuery->count() : null,
                'income' => $income,
                'expenses' => $expenses,
                'balance' => $income - $expenses,
                'payments' => $paymentQuery->count(),
            ],
            'recentActivity' => $isManager
                ? DB::table('audit_logs')
                    ->leftJoin('users', 'users.id', '=', 'audit_logs.user_id')
                    ->select('audit_logs.action', 'audit_logs.entity_type', 'audit_logs.created_at', 'users.first_name', 'users.last_name')
                    ->latest('audit_logs.created_at')->limit(5)->get()
                : [],
        ]);
    }
}
