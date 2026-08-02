<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('provincial_councils')->updateOrInsert(
            ['code' => 'oriental-mindoro'],
            ['name' => 'Oriental Mindoro Provincial Council', 'province' => 'Oriental Mindoro', 'logo_path' => '/images/oriental-mindoro-council-logo.png', 'updated_at' => $now, 'created_at' => $now]
        );

        foreach ([
            ['code' => 'membership-dues', 'name' => 'Membership Dues'],
            ['code' => 'annual-dues', 'name' => 'Annual Dues'],
            ['code' => 'event-contribution', 'name' => 'Event Contribution'],
        ] as $row) DB::table('payment_types')->updateOrInsert(['code' => $row['code']], $row + ['created_at' => $now, 'updated_at' => $now]);

        foreach ([
            ['code' => 'paid', 'name' => 'Paid'],
            ['code' => 'unpaid', 'name' => 'Unpaid'],
            ['code' => 'pending', 'name' => 'Pending'],
            ['code' => 'partial', 'name' => 'Partially Paid'],
        ] as $row) DB::table('payment_statuses')->updateOrInsert(['code' => $row['code']], $row + ['created_at' => $now, 'updated_at' => $now]);

        foreach ([['code'=>'income','name'=>'Income'], ['code'=>'expense','name'=>'Expense']] as $row) {
            DB::table('financial_record_types')->updateOrInsert(['code' => $row['code']], $row + ['created_at' => $now, 'updated_at' => $now]);
        }
        $incomeId = DB::table('financial_record_types')->where('code','income')->value('id');
        $expenseId = DB::table('financial_record_types')->where('code','expense')->value('id');
        foreach ([
            ['financial_record_type_id'=>$incomeId,'code'=>'member-dues','name'=>'Member Dues'],
            ['financial_record_type_id'=>$incomeId,'code'=>'donations','name'=>'Donations'],
            ['financial_record_type_id'=>$incomeId,'code'=>'event-income','name'=>'Event Income'],
            ['financial_record_type_id'=>$expenseId,'code'=>'operations','name'=>'Operations'],
            ['financial_record_type_id'=>$expenseId,'code'=>'community-projects','name'=>'Community Projects'],
            ['financial_record_type_id'=>$expenseId,'code'=>'events','name'=>'Events and Activities'],
        ] as $row) DB::table('financial_categories')->updateOrInsert(['code'=>$row['code']], $row + ['created_at'=>$now,'updated_at'=>$now]);

        foreach ([
            ['code'=>'conduct','name'=>'Code of Conduct'],
            ['code'=>'attendance','name'=>'Attendance'],
            ['code'=>'financial-obligation','name'=>'Financial Obligation'],
        ] as $row) DB::table('violation_types')->updateOrInsert(['code'=>$row['code']], $row + ['created_at'=>$now,'updated_at'=>$now]);

        foreach ([
            ['code'=>'open','name'=>'Open'],
            ['code'=>'under-review','name'=>'Under Review'],
            ['code'=>'resolved','name'=>'Resolved'],
            ['code'=>'dismissed','name'=>'Dismissed'],
        ] as $row) DB::table('disciplinary_statuses')->updateOrInsert(['code'=>$row['code']], $row + ['created_at'=>$now,'updated_at'=>$now]);
    }
}
