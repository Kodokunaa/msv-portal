<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['account_status_id', 'created_at'], 'users_status_created_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['member_profile_id', 'voided_at', 'id'], 'payments_member_current_idx');
            $table->index(['voided_at', 'created_at', 'id'], 'payments_current_created_idx');
        });

        Schema::table('financial_records', function (Blueprint $table) {
            $table->index(
                ['publication_status', 'voided_at', 'transaction_date'],
                'financial_visibility_date_idx',
            );
        });

        Schema::table('disciplinary_records', function (Blueprint $table) {
            $table->index(['voided_at', 'incident_date', 'id'], 'disciplinary_current_date_idx');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['created_at', 'id'], 'audit_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_created_idx');
        });

        Schema::table('disciplinary_records', function (Blueprint $table) {
            $table->dropIndex('disciplinary_current_date_idx');
        });

        Schema::table('financial_records', function (Blueprint $table) {
            $table->dropIndex('financial_visibility_date_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_member_current_idx');
            $table->dropIndex('payments_current_created_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_status_created_idx');
        });
    }
};
