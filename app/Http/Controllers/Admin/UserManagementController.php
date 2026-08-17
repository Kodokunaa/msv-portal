<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Members\ChangeAccountStatusRequest;
use App\Http\Requests\Members\RejectApplicationRequest;
use App\Models\AccountStatusHistory;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\User;
use App\Notifications\AccountStatusChangedNotification;
use App\Notifications\ApplicationDecisionNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $actor = $request->user();
        abort_unless($actor->canManageRecords(), 403);

        $query = User::query()
            ->with([
                'accountStatus:id,code,name',
                'activeRoles:id,code,name',
                'memberProfile.provincialCouncil:id,name',
                'activeCouncilAssignments.provincialCouncil:id,name',
            ])
            ->latest();

        $search = trim($request->string('search')->toString());
        $query
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('memberProfile', fn ($profile) => $profile->where('membership_number', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->whereHas('accountStatus', fn ($status) => $status->where('code', $request->string('status')->toString())))
            ->when($request->filled('role'), fn ($query) => $query->whereHas('activeRoles', fn ($role) => $role->where('code', $request->string('role')->toString())))
            ->when($request->filled('council'), fn ($query) => $query->whereHas('memberProfile', fn ($profile) => $profile->where('provincial_council_id', $request->integer('council'))));

        $users = $query->paginate(20)->withQueryString()->through(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'email_verified' => $user->hasVerifiedEmail(),
            'status' => $user->accountStatus?->code,
            'status_name' => $user->accountStatus?->name,
            'role' => $user->hasRole('admin') && $user->activeCouncilAssignments->isNotEmpty()
                ? 'Provincial Admin'
                : ($user->activeRoles->first()?->name ?? 'Applicant'),
            'role_code' => $user->activeRoles->first()?->code,
            'council' => $user->activeCouncilAssignments->first()?->provincialCouncil?->name
                ?? $user->memberProfile?->provincialCouncil?->name,
            'has_council_scope' => $user->activeCouncilAssignments->isNotEmpty(),
            'created_at' => $user->created_at?->toDateString(),
        ]);

        return Inertia::render('management/members', [
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'role', 'council']),
            'councils' => DB::table('provincial_councils')->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'memberProfile', 'activeRoles', 'activeCouncilAssignments']);
        $this->authorize('manage', $user);
        abort_unless(in_array($user->accountStatus?->code, ['pending', 'rejected'], true), 422, 'Only pending or rejected applications can be approved.');

        DB::transaction(function () use ($request, $user) {
            $activeId = $this->statusId('active');
            $memberRoleId = DB::table('roles')->where('code', 'member')->value('id');
            abort_unless($memberRoleId, 500, 'Member role is missing.');

            $old = ['status' => $user->accountStatus?->code];
            $user->forceFill(['account_status_id' => $activeId])->save();

            $existingProfile = $user->memberProfile;
            $councilId = $existingProfile?->provincial_council_id
                ?? ($request->user()->activeCouncilIds()[0] ?? null)
                ?? DB::table('provincial_councils')->where('code', 'oriental-mindoro')->value('id');

            MemberProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'provincial_council_id' => $councilId,
                    'membership_number' => $existingProfile?->membership_number ?? 'MSV-'.str_pad((string) $user->id, 5, '0', STR_PAD_LEFT),
                    'joined_at' => $existingProfile?->joined_at?->toDateString() ?? now()->toDateString(),
                ],
            );

            $this->endActiveRoles($request, $user);
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $memberRoleId,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->recordStatusHistory($request, $user, $activeId, 'Membership application approved.');
            AuditLog::record($request, 'user.approved', User::class, $user->id, $old, ['status' => 'active', 'role' => 'member']);
        });

        $this->notifySafely($user, new ApplicationDecisionNotification('approved'));

        return back()->with('success', 'Application approved. The member must verify their email before entering the portal.');
    }

    public function reject(RejectApplicationRequest $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'memberProfile']);
        $this->authorize('manage', $user);
        abort_unless($user->accountStatus?->code === 'pending', 422, 'Only pending applications can be rejected.');

        $reason = $request->validated('reason');
        $this->changeStatus($request, $user, 'rejected', $reason, 'user.rejected');
        $this->notifySafely($user, new ApplicationDecisionNotification('rejected', $reason));

        return back()->with('success', 'Application rejected.');
    }

    public function suspend(ChangeAccountStatusRequest $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'memberProfile', 'activeRoles']);
        $this->authorize('manage', $user);
        abort_if($request->user()->is($user), 422, 'You cannot suspend your own account.');
        abort_if($user->isManager(), 422, 'Manager accounts cannot be suspended here.');
        abort_unless($user->accountStatus?->code === 'active', 422, 'Only active accounts can be suspended.');

        $reason = $request->validated('reason');
        $this->changeStatus($request, $user, 'suspended', $reason, 'user.suspended');
        $this->notifySafely($user, new AccountStatusChangedNotification('suspended', $reason));

        return back()->with('success', 'Member account suspended.');
    }

    public function reactivate(ChangeAccountStatusRequest $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'memberProfile']);
        $this->authorize('manage', $user);
        abort_unless(in_array($user->accountStatus?->code, ['suspended', 'deactivated'], true), 422, 'Only suspended or deactivated accounts can be reactivated.');

        $reason = $request->validated('reason');
        $this->changeStatus($request, $user, 'active', $reason, 'user.reactivated');
        $this->notifySafely($user, new AccountStatusChangedNotification('active', $reason));

        return back()->with('success', 'Member account reactivated.');
    }

    public function deactivate(ChangeAccountStatusRequest $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'memberProfile', 'activeRoles']);
        $this->authorize('manage', $user);
        abort_if($request->user()->is($user), 422, 'You cannot deactivate your own account.');
        abort_if($user->isManager(), 422, 'Manager accounts cannot be deactivated here.');
        abort_unless(in_array($user->accountStatus?->code, ['active', 'suspended'], true), 422, 'Only active or suspended accounts can be deactivated.');

        $reason = $request->validated('reason');
        $this->changeStatus($request, $user, 'deactivated', $reason, 'user.deactivated');
        $this->notifySafely($user, new AccountStatusChangedNotification('deactivated', $reason));

        return back()->with('success', 'Member account deactivated. Historical records were preserved.');
    }

    public function promote(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing(['accountStatus', 'activeRoles', 'activeCouncilAssignments']);
        $this->authorize('changeRole', $user);
        abort_if($user->isManager(), 422, 'Managers cannot be changed here.');
        abort_unless($user->accountStatus?->code === 'active', 422, 'Only active members can be promoted.');
        abort_unless($user->hasRole('member'), 422, 'Only Members can be promoted.');

        $this->replaceRole($request, $user, 'admin', 'user.promoted');

        return back()->with('success', 'Member promoted to Admin.');
    }

    public function demote(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing(['activeRoles', 'activeCouncilAssignments']);
        $this->authorize('changeRole', $user);
        abort_unless($user->hasRole('admin'), 422, 'This user is not an Admin.');

        $this->replaceRole($request, $user, 'member', 'user.demoted');

        return back()->with('success', 'Admin demoted to Member.');
    }

    public function assignCouncil(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing(['activeRoles', 'activeCouncilAssignments']);
        $this->authorize('changeRole', $user);
        abort_unless($user->hasRole('admin'), 422, 'Only Admins can receive a provincial scope.');

        $data = $request->validate(['provincial_council_id' => ['required', 'integer', 'exists:provincial_councils,id']]);

        DB::transaction(function () use ($request, $user, $data) {
            $this->endCouncilAssignments($request, $user);
            DB::table('admin_council_assignments')->insert([
                'user_id' => $user->id,
                'provincial_council_id' => $data['provincial_council_id'],
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            AuditLog::record($request, 'admin.scope_assigned', User::class, $user->id, null, $data);
        });

        return back()->with('success', 'Provincial Admin scope assigned.');
    }

    public function removeCouncil(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing(['activeRoles', 'activeCouncilAssignments']);
        $this->authorize('changeRole', $user);
        abort_unless($user->hasRole('admin'), 422, 'Only Admins can have a provincial scope.');

        $oldCouncilIds = $user->activeCouncilIds();
        $this->endCouncilAssignments($request, $user);
        AuditLog::record($request, 'admin.scope_removed', User::class, $user->id, ['provincial_council_ids' => $oldCouncilIds], ['provincial_council_ids' => []]);

        return back()->with('success', 'Provincial scope removed.');
    }

    private function changeStatus(Request $request, User $user, string $statusCode, string $reason, string $action): void
    {
        DB::transaction(function () use ($request, $user, $statusCode, $reason, $action) {
            $statusId = $this->statusId($statusCode);
            $old = ['status' => $user->accountStatus?->code];
            $user->forceFill(['account_status_id' => $statusId])->save();
            $this->recordStatusHistory($request, $user, $statusId, $reason);
            AuditLog::record($request, $action, User::class, $user->id, $old, ['status' => $statusCode, 'reason' => $reason]);
        });
    }

    private function statusId(string $code): int
    {
        $id = DB::table('account_statuses')->where('code', $code)->value('id');
        abort_unless($id, 500, "Account status [{$code}] is missing.");

        return (int) $id;
    }

    private function recordStatusHistory(Request $request, User $user, int $statusId, string $reason): void
    {
        AccountStatusHistory::query()->create([
            'user_id' => $user->id,
            'account_status_id' => $statusId,
            'changed_by' => $request->user()->id,
            'reason' => $reason,
        ]);
    }

    private function replaceRole(Request $request, User $user, string $roleCode, string $action): void
    {
        DB::transaction(function () use ($request, $user, $roleCode, $action) {
            $oldRole = $user->activeRoles()->value('code');
            $oldCouncilIds = $user->activeCouncilIds();
            $roleId = DB::table('roles')->where('code', $roleCode)->value('id');
            abort_unless($roleId, 500, 'Requested role is missing.');

            $this->endActiveRoles($request, $user);
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $roleId,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($roleCode !== 'admin') {
                $this->endCouncilAssignments($request, $user);
            }

            AuditLog::record(
                $request,
                $action,
                User::class,
                $user->id,
                ['role' => $oldRole, 'provincial_council_ids' => $oldCouncilIds],
                ['role' => $roleCode, 'provincial_council_ids' => $roleCode === 'admin' ? $oldCouncilIds : []],
            );
        });
    }

    private function endActiveRoles(Request $request, User $user): void
    {
        DB::table('user_roles')->where('user_id', $user->id)->where('is_active', true)->update([
            'is_active' => false,
            'ended_by' => $request->user()->id,
            'ended_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function endCouncilAssignments(Request $request, User $user): void
    {
        DB::table('admin_council_assignments')->where('user_id', $user->id)->where('is_active', true)->update([
            'is_active' => false,
            'ended_by' => $request->user()->id,
            'ended_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function notifySafely(User $user, object $notification): void
    {
        try {
            $user->notify($notification);
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
