<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provincial_councils', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('province');
            $table->string('logo_path')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('provincial_council_id')->nullable()->constrained()->nullOnDelete();
            $table->string('membership_number')->nullable()->unique();
            $table->string('middle_name')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->string('school')->nullable();
            $table->string('course')->nullable();
            $table->unsignedSmallInteger('graduation_year')->nullable();
            $table->string('avatar_path')->nullable();
            $table->date('joined_at')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_council_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provincial_council_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->foreignId('ended_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_status_id')->constrained()->restrictOnDelete();
            $table->decimal('amount_due', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['member_profile_id', 'payment_status_id']);
        });

        Schema::create('financial_record_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('financial_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_record_type_id')->constrained()->restrictOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('financial_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_category_id')->constrained()->restrictOnDelete();
            $table->foreignId('provincial_council_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('amount', 14, 2);
            $table->date('transaction_date');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['transaction_date', 'financial_category_id']);
        });

        Schema::create('violation_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('disciplinary_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('disciplinary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('violation_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('disciplinary_status_id')->constrained()->restrictOnDelete();
            $table->date('incident_date');
            $table->text('description');
            $table->text('action_taken')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(
                ['member_profile_id', 'disciplinary_status_id'],
                'disciplinary_member_status_idx'
            );
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['entity_type', 'entity_id']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('disciplinary_records');
        Schema::dropIfExists('disciplinary_statuses');
        Schema::dropIfExists('violation_types');
        Schema::dropIfExists('financial_records');
        Schema::dropIfExists('financial_categories');
        Schema::dropIfExists('financial_record_types');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_statuses');
        Schema::dropIfExists('payment_types');
        Schema::dropIfExists('admin_council_assignments');
        Schema::dropIfExists('member_profiles');
        Schema::dropIfExists('provincial_councils');
    }
};
