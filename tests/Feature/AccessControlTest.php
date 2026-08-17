<?php

namespace Tests\Feature;

use App\Models\MemberProfile;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    public function test_pending_user_is_redirected_to_pending_page(): void
    {
        $user = User::factory()->state([
            'account_status_id' => DB::table('account_statuses')->where('code', 'pending')->value('id'),
        ])->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('account.pending'));
    }

    public function test_member_cannot_modify_financial_records(): void
    {
        $member = User::factory()->create();
        $this->giveRole($member, 'member');

        $this->actingAs($member)
            ->post('/financial-records', [])
            ->assertForbidden();
    }

    public function test_admin_can_open_member_management_without_a_council_assignment(): void
    {
        $admin = User::factory()->create();
        $this->giveRole($admin, 'admin');

        $this->actingAs($admin)
            ->get(route('members.index'))
            ->assertOk();
    }

    public function test_scoped_admin_can_approve_a_pending_applicant(): void
    {
        $councilId = $this->councilId();
        $admin = User::factory()->create();
        $this->giveRole($admin, 'admin');
        $this->assignCouncil($admin, $councilId);

        $applicant = User::factory()->state([
            'account_status_id' => DB::table('account_statuses')->where('code', 'pending')->value('id'),
        ])->create();
        MemberProfile::query()->create([
            'user_id' => $applicant->id,
            'provincial_council_id' => $councilId,
        ]);

        $this->actingAs($admin)
            ->patch(route('members.approve', $applicant))
            ->assertSessionHasNoErrors();

        $this->assertSame('active', $applicant->fresh()->accountStatus?->code);
        $this->assertTrue($applicant->fresh()->hasRole('member'));
        $this->assertDatabaseHas('account_status_histories', [
            'user_id' => $applicant->id,
            'account_status_id' => DB::table('account_statuses')->where('code', 'active')->value('id'),
        ]);
    }

    public function test_manager_can_create_a_financial_record(): void
    {
        $manager = User::factory()->create();
        $this->giveRole($manager, 'manager');

        $categoryId = DB::table('financial_categories')->where('code', 'member-dues')->value('id');

        $this->actingAs($manager)
            ->post(route('financial.store'), [
                'financial_category_id' => $categoryId,
                'provincial_council_id' => null,
                'description' => 'Test income',
                'amount' => 1000,
                'transaction_date' => now()->toDateString(),
                'reference_number' => 'TEST-001',
                'publication_status' => 'published',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('financial_records', [
            'description' => 'Test income',
            'reference_number' => 'TEST-001',
            'publication_status' => 'published',
        ]);
    }

    public function test_voiding_a_payment_preserves_the_record(): void
    {
        $councilId = $this->councilId();
        $admin = User::factory()->create();
        $this->giveRole($admin, 'admin');
        $this->assignCouncil($admin, $councilId);

        $member = User::factory()->create();
        $this->giveRole($member, 'member');
        $profile = MemberProfile::query()->create([
            'user_id' => $member->id,
            'provincial_council_id' => $councilId,
        ]);

        $payment = Payment::query()->create([
            'member_profile_id' => $profile->id,
            'payment_type_id' => DB::table('payment_types')->where('code', 'annual-dues')->value('id'),
            'payment_status_id' => DB::table('payment_statuses')->where('code', 'paid')->value('id'),
            'amount_due' => 500,
            'amount_paid' => 500,
            'payment_date' => now()->toDateString(),
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->delete(route('payments.destroy', $payment), ['reason' => 'Duplicate entry.'])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'void_reason' => 'Duplicate entry.',
        ]);
        $this->assertNotNull($payment->fresh()->voided_at);
    }

    private function giveRole(User $user, string $roleCode): void
    {
        DB::table('user_roles')->insert([
            'user_id' => $user->id,
            'role_id' => DB::table('roles')->where('code', $roleCode)->value('id'),
            'assigned_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function assignCouncil(User $user, int $councilId): void
    {
        DB::table('admin_council_assignments')->insert([
            'user_id' => $user->id,
            'provincial_council_id' => $councilId,
            'assigned_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function councilId(): int
    {
        return (int) DB::table('provincial_councils')->where('code', 'oriental-mindoro')->value('id');
    }
}
