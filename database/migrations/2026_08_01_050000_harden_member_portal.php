<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('account_statuses')->updateOrInsert(
            ['code' => 'deactivated'],
            ['name' => 'Deactivated', 'created_at' => now(), 'updated_at' => now()],
        );

        Schema::create('account_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('account_status_id')->constrained('account_statuses')->restrictOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('voided_at')->nullable()->after('notes');
            $table->foreignId('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable()->after('voided_by');
            $table->index(['voided_at', 'payment_status_id']);
        });

        Schema::table('financial_records', function (Blueprint $table) {
            $table->string('publication_status', 20)->default('published')->after('notes');
            $table->timestamp('published_at')->nullable()->after('publication_status');
            $table->timestamp('voided_at')->nullable()->after('published_at');
            $table->foreignId('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable()->after('voided_by');
            $table->index(['publication_status', 'voided_at']);
        });

        Schema::table('disciplinary_records', function (Blueprint $table) {
            $table->string('case_number', 60)->nullable()->unique()->after('id');
            $table->string('visibility', 20)->default('organization')->after('notes');
            $table->timestamp('published_at')->nullable()->after('visibility');
            $table->timestamp('voided_at')->nullable()->after('published_at');
            $table->foreignId('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable()->after('voided_by');
            $table->index(['visibility', 'voided_at']);
        });

        DB::table('financial_records')->whereNull('published_at')->update(['published_at' => now()]);
        DB::table('disciplinary_records')->whereNull('published_at')->update(['published_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('disciplinary_records', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropIndex(['visibility', 'voided_at']);
            $table->dropUnique(['case_number']);
            $table->dropColumn(['case_number', 'visibility', 'published_at', 'voided_at', 'voided_by', 'void_reason']);
        });

        Schema::table('financial_records', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropIndex(['publication_status', 'voided_at']);
            $table->dropColumn(['publication_status', 'published_at', 'voided_at', 'voided_by', 'void_reason']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropIndex(['voided_at', 'payment_status_id']);
            $table->dropColumn(['voided_at', 'voided_by', 'void_reason']);
        });

        Schema::dropIfExists('notifications');
        Schema::dropIfExists('account_status_histories');
        DB::table('account_statuses')->where('code', 'deactivated')->delete();
    }
};
