<?php

namespace Tests\Feature;

use App\Models\MemberProfile;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    public function test_api_registration_creates_a_pending_hashed_account(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'API',
            'last_name' => 'Applicant',
            'email' => 'api-applicant@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertCreated()->assertJsonPath('user.status', 'pending');
        $user = User::query()->where('email', 'api-applicant@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('SecurePassword123!', $user->password));
        $this->assertDatabaseHas('member_profiles', ['user_id' => $user->id]);
    }

    public function test_only_active_accounts_can_obtain_api_tokens(): void
    {
        $pending = User::factory()->create([
            'email' => 'pending-api@example.com',
            'account_status_id' => DB::table('account_statuses')->where('code', 'pending')->value('id'),
        ]);

        $this->postJson('/api/login', ['email' => $pending->email, 'password' => 'password'])
            ->assertForbidden();

        $active = User::factory()->unverified()->create(['email' => 'active-api@example.com']);
        $this->postJson('/api/login', ['email' => $active->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'user']);
    }

    public function test_member_api_only_returns_their_own_payments(): void
    {
        $member = $this->userWithRole('member');
        $other = $this->userWithRole('member');
        $memberProfile = $this->profile($member);
        $otherProfile = $this->profile($other);

        $ownPayment = $this->payment($memberProfile);
        $this->payment($otherProfile);

        Sanctum::actingAs($member);
        $response = $this->getJson('/api/payments')->assertOk();

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ownPayment->id);
    }

    public function test_only_manager_can_create_financial_records_through_api(): void
    {
        $payload = [
            'financial_category_id' => DB::table('financial_categories')->where('code', 'member-dues')->value('id'),
            'description' => 'API income',
            'amount' => 1200,
            'transaction_date' => now()->toDateString(),
            'publication_status' => 'published',
        ];

        Sanctum::actingAs($this->userWithRole('admin'));
        $this->postJson('/api/financial-records', $payload)->assertForbidden();

        Sanctum::actingAs($this->userWithRole('manager'));
        $this->postJson('/api/financial-records', $payload)->assertCreated();
        $this->assertDatabaseHas('financial_records', ['description' => 'API income']);
    }

    public function test_api_void_preserves_payment_and_hides_it_from_lists(): void
    {
        $admin = $this->userWithRole('admin');
        $payment = $this->payment($this->profile($this->userWithRole('member')));

        Sanctum::actingAs($admin);
        $this->deleteJson("/api/payments/{$payment->id}", ['reason' => 'Duplicate entry.'])->assertOk();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'void_reason' => 'Duplicate entry.',
            'voided_by' => $admin->id,
        ]);
        $this->getJson('/api/payments')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_api_collection_page_size_is_bounded(): void
    {
        $member = $this->userWithRole('member');
        $profile = $this->profile($member);
        foreach (range(1, 105) as $index) {
            $this->payment($profile);
        }

        Sanctum::actingAs($member);
        $this->getJson('/api/payments?per_page=1000')
            ->assertOk()
            ->assertJsonCount(100, 'data')
            ->assertJsonPath('meta.per_page', 100)
            ->assertJsonPath('meta.current_page', 1);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        DB::table('user_roles')->insert([
            'user_id' => $user->id,
            'role_id' => DB::table('roles')->where('code', $role)->value('id'),
            'assigned_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $user;
    }

    private function profile(User $user): MemberProfile
    {
        return MemberProfile::query()->create([
            'user_id' => $user->id,
            'provincial_council_id' => DB::table('provincial_councils')->value('id'),
        ]);
    }

    private function payment(MemberProfile $profile): Payment
    {
        return Payment::query()->create([
            'member_profile_id' => $profile->id,
            'payment_type_id' => DB::table('payment_types')->where('code', 'annual-dues')->value('id'),
            'payment_status_id' => DB::table('payment_statuses')->where('code', 'paid')->value('id'),
            'amount_due' => 500,
            'amount_paid' => 500,
            'payment_date' => now()->toDateString(),
        ]);
    }
}
