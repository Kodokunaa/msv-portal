<?php

namespace Database\Seeders;

use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PrototypeSeeder extends Seeder
{
    public function run(): void
    {
        $active = DB::table('account_statuses')->where('code','active')->value('id');
        $pending = DB::table('account_statuses')->where('code','pending')->value('id');
        $adminRole = DB::table('roles')->where('code','admin')->value('id');
        $memberRole = DB::table('roles')->where('code','member')->value('id');
        $council = DB::table('provincial_councils')->where('code','oriental-mindoro')->value('id');

        $make = function (array $data, int $status, ?int $role, string $number) use ($council) {
            $user = User::query()->firstOrNew(['email' => $data['email']]);
            $user->first_name = $data['first_name'];
            $user->last_name = $data['last_name'];
            $user->password = Hash::make('Password123!');
            $user->account_status_id = $status;
            $user->email_verified_at = now();
            $user->save();
            $profile = MemberProfile::query()->updateOrCreate(['user_id'=>$user->id], [
                'provincial_council_id'=>$council,'membership_number'=>$role ? $number : null,
                'school'=>'Mindoro State University','course'=>'Bachelor of Science in Information Technology',
                'graduation_year'=>2026,'joined_at'=>$role ? now()->subYear()->toDateString() : null,
            ]);
            if ($role) {
                DB::table('user_roles')->where('user_id',$user->id)->delete();
                DB::table('user_roles')->insert(['user_id'=>$user->id,'role_id'=>$role,'assigned_at'=>now(),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()]);
            }
            return [$user,$profile];
        };

        [$admin] = $make(['first_name'=>'Ana','last_name'=>'Santos','email'=>'admin@msv.local'],$active,$adminRole,'MSV-ADM-001');
        DB::table('admin_council_assignments')->updateOrInsert(
            ['user_id' => $admin->id, 'provincial_council_id' => $council, 'is_active' => true],
            ['assigned_at' => now(), 'created_at' => now(), 'updated_at' => now()]
        );
        [$member,$profile] = $make(['first_name'=>'Juan','last_name'=>'Dela Cruz','email'=>'member@msv.local'],$active,$memberRole,'MSV-00001');
        $make(['first_name'=>'Maria','last_name'=>'Reyes','email'=>'pending@msv.local'],$pending,null,'');

        $managerId = User::query()->where('email', env('MSV_MANAGER_EMAIL','manager@msv.local'))->value('id');
        $incomeCat = DB::table('financial_categories')->where('code','member-dues')->value('id');
        $donationCat = DB::table('financial_categories')->where('code','donations')->value('id');
        $expenseCat = DB::table('financial_categories')->where('code','community-projects')->value('id');
        foreach ([
            [$incomeCat,'Membership dues collection',18500,now()->subDays(20),'OR-2026-041'],
            [$donationCat,'Alumni community donation',12000,now()->subDays(12),'DON-2026-008'],
            [$expenseCat,'School supplies outreach',8250,now()->subDays(5),'EXP-2026-014'],
        ] as [$cat,$desc,$amount,$date,$ref]) {
            DB::table('financial_records')->updateOrInsert(['reference_number'=>$ref],[
                'financial_category_id'=>$cat,'provincial_council_id'=>$council,'description'=>$desc,'amount'=>$amount,
                'transaction_date'=>$date->toDateString(),'publication_status'=>'published','published_at'=>now(),'created_by'=>$managerId,'created_at'=>now(),'updated_at'=>now(),
            ]);
        }

        $dues = DB::table('payment_types')->where('code','annual-dues')->value('id');
        $paid = DB::table('payment_statuses')->where('code','paid')->value('id');
        DB::table('payments')->updateOrInsert(['reference_number'=>'PAY-2026-001'],[
            'member_profile_id'=>$profile->id,'payment_type_id'=>$dues,'payment_status_id'=>$paid,
            'amount_due'=>500,'amount_paid'=>500,'payment_date'=>now()->subMonth()->toDateString(),
            'created_by'=>$admin->id,'created_at'=>now(),'updated_at'=>now(),
        ]);

        $violation = DB::table('violation_types')->where('code','attendance')->value('id');
        $resolved = DB::table('disciplinary_statuses')->where('code','resolved')->value('id');
        DB::table('disciplinary_records')->updateOrInsert(['member_profile_id'=>$profile->id,'incident_date'=>now()->subMonths(3)->toDateString()],[
            'case_number'=>'MSV-CASE-2026-00001','violation_type_id'=>$violation,'disciplinary_status_id'=>$resolved,'description'=>'Repeated absence from required council meetings without prior notice.',
            'action_taken'=>'Written reminder and attendance commitment.','visibility'=>'organization','published_at'=>now(),'created_by'=>$admin->id,'created_at'=>now(),'updated_at'=>now(),
        ]);
    }
}
