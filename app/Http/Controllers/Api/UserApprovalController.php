<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountStatusHistory;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\User;
use App\Notifications\ApplicationDecisionNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserApprovalController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::query()->with(['accountStatus', 'memberProfile', 'activeRoles'])->findOrFail($data['user_id']);
        $this->authorize('manage', $user);
        abort_unless(in_array($user->accountStatus?->code, ['pending', 'rejected'], true), 422, 'Only pending or rejected applications can be approved.');

        DB::transaction(function () use ($request, $user) {
            $activeId = (int) DB::table('account_statuses')->where('code', 'active')->value('id');
            $memberRoleId = DB::table('roles')->where('code', 'member')->value('id');
            abort_unless($activeId && $memberRoleId, 500, 'Required access-control data is missing.');

            $old = ['status' => $user->accountStatus?->code];
            $user->forceFill(['account_status_id' => $activeId])->save();

            $existingProfile = $user->memberProfile;
            $councilId = $existingProfile?->provincial_council_id
                ?? DB::table('provincial_councils')->where('code', 'oriental-mindoro')->value('id');

            MemberProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'provincial_council_id' => $councilId,
                    'membership_number' => $existingProfile?->membership_number ?? 'MSV-'.str_pad((string) $user->id, 5, '0', STR_PAD_LEFT),
                    'joined_at' => $existingProfile?->joined_at?->toDateString() ?? now()->toDateString(),
                ],
            );

            DB::table('user_roles')->where('user_id', $user->id)->where('is_active', true)->update([
                'is_active' => false,
                'ended_by' => $request->user()->id,
                'ended_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $memberRoleId,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            AccountStatusHistory::query()->create([
                'user_id' => $user->id,
                'account_status_id' => $activeId,
                'changed_by' => $request->user()->id,
                'reason' => 'Membership application approved.',
            ]);

            AuditLog::record($request, 'user.approved', User::class, $user->id, $old, ['status' => 'active', 'role' => 'member']);
        });

        try {
            $user->notify(new ApplicationDecisionNotification('approved'));
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json([
            'message' => 'Application approved.',
            'user' => $user->fresh()->toApiArray(),
        ]);
    }
}
