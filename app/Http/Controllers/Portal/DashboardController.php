<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\FinancialRecord;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        return $request->user()->isAdmin()
            ? redirect()->route('dashboard.admin')
            : redirect()->route('dashboard.member');
    }

    public function member(Request $request): Response|RedirectResponse
    {
        $user = $request->user()->loadMissing('memberProfile.provincialCouncil');
        if ($user->isAdmin()) {
            return redirect()->route('dashboard.admin');
        }

        $totals = $this->publishedFinancialTotals();

        return Inertia::render('dashboard/member', [
            'role' => 'Member',
            'council' => $user->memberProfile?->provincialCouncil?->name,
            'stats' => [
                ...$totals,
                'payments' => Payment::query()
                    ->current()
                    ->where('member_profile_id', $user->memberProfile?->id ?? 0)
                    ->count(),
            ],
        ]);
    }

    public function admin(Request $request): Response|RedirectResponse
    {
        $user = $request->user()->load([
            'accountStatus', 'activeRoles', 'memberProfile.provincialCouncil',
        ]);

        if (! $user->isAdmin()) {
            return redirect()->route('dashboard.member');
        }

        $totals = $this->publishedFinancialTotals();

        return Inertia::render('dashboard/admin', [
            'role' => $user->isManager() ? 'Manager' : 'Admin',
            'stats' => [
                'members' => User::query()->whereHas('accountStatus', fn ($q) => $q->where('code', 'active'))->count(),
                'pending' => User::query()->whereHas('accountStatus', fn ($q) => $q->where('code', 'pending'))->count(),
                ...$totals,
                'payments' => Payment::query()->current()->count(),
            ],
            'recentActivity' => $user->isManager()
                ? DB::table('audit_logs')
                    ->leftJoin('users', 'users.id', '=', 'audit_logs.user_id')
                    ->select('audit_logs.action', 'audit_logs.entity_type', 'audit_logs.created_at', 'users.first_name', 'users.last_name')
                    ->latest('audit_logs.created_at')->limit(5)->get()
                : [],
        ]);
    }

    /**
     * @return array{income: float, expenses: float, balance: float}
     */
    private function publishedFinancialTotals(): array
    {
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

        return [
            'income' => $income,
            'expenses' => $expenses,
            'balance' => $income - $expenses,
        ];
    }
}
