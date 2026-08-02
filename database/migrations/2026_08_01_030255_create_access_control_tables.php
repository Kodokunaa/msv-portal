<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Account statuses
        |--------------------------------------------------------------------------
        |
        | Every registered account begins as "pending".
        |
        */

        Schema::create('account_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        DB::table('account_statuses')->insert([
            [
                'id' => 1,
                'code' => 'pending',
                'name' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'code' => 'active',
                'name' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'code' => 'rejected',
                'name' => 'Rejected',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'code' => 'suspended',
                'name' => 'Suspended',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        |
        | Provincial Admin is not a separate role. It will be an Admin with a
        | provincial council assignment.
        |
        */

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        DB::table('roles')->insert([
            [
                'id' => 1,
                'code' => 'member',
                'name' => 'Member',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'code' => 'admin',
                'name' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'code' => 'manager',
                'name' => 'Manager',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Add account status to users
        |--------------------------------------------------------------------------
        |
        | Status ID 1 is Pending, so every new registration is pending by
        | default.
        |
        */

        Schema::table('users', function (Blueprint $table) {
            $table
                ->foreignId('account_status_id')
                ->default(1)
                ->after('password')
                ->constrained('account_statuses')
                ->restrictOnDelete();
        });

        /*
        |--------------------------------------------------------------------------
        | User role history
        |--------------------------------------------------------------------------
        |
        | Records promotions, demotions, and previous role assignments.
        |
        */

        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table
                ->foreignId('role_id')
                ->constrained()
                ->restrictOnDelete();

            $table
                ->foreignId('assigned_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('assigned_at')->useCurrent();

            $table
                ->foreignId('ended_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['role_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['account_status_id']);
            $table->dropColumn('account_status_id');
        });

        Schema::dropIfExists('roles');
        Schema::dropIfExists('account_statuses');
    }
};