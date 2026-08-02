<?php

namespace Database\Seeders;

use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class ManagerSeeder extends Seeder
{
    public function run(): void
    {
        $activeId = DB::table('account_statuses')
            ->where('code', 'active')
            ->value('id');
        $managerRoleId = DB::table('roles')
            ->where('code', 'manager')
            ->value('id');
        $councilId = DB::table('provincial_councils')
            ->where('code', 'oriental-mindoro')
            ->value('id');

        if (! $activeId || ! $managerRoleId) {
            throw new RuntimeException('Required access-control reference data is missing.');
        }

        $manager = User::query()->firstOrNew([
            'email' => env('MSV_MANAGER_EMAIL', 'manager@msv.local'),
        ]);
        $isNewManager = ! $manager->exists;

        $manager->first_name = 'MSV';
        $manager->last_name = 'Manager';
        $manager->account_status_id = $activeId;
        $manager->email_verified_at ??= now();

        if ($isNewManager) {
            $password = env('MSV_MANAGER_PASSWORD');

            if (! $password && app()->environment('production')) {
                throw new RuntimeException('MSV_MANAGER_PASSWORD must be set in production.');
            }

            $manager->password = Hash::make($password ?: 'ChangeMe123!');
        }

        $manager->save();

        MemberProfile::query()->updateOrCreate(
            ['user_id' => $manager->id],
            [
                'provincial_council_id' => $councilId,
                'membership_number' => 'MSV-MGR-001',
                'joined_at' => now()->toDateString(),
            ],
        );

        $alreadyManager = DB::table('user_roles')
            ->where('user_id', $manager->id)
            ->where('role_id', $managerRoleId)
            ->where('is_active', true)
            ->exists();

        if ($alreadyManager) {
            return;
        }

        DB::table('user_roles')
            ->where('user_id', $manager->id)
            ->where('is_active', true)
            ->update([
                'is_active' => false,
                'ended_by' => $manager->id,
                'ended_at' => now(),
                'updated_at' => now(),
            ]);

        DB::table('user_roles')->insert([
            'user_id' => $manager->id,
            'role_id' => $managerRoleId,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
