<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'member_profile_id', 'payment_type_id', 'payment_status_id', 'amount_due',
        'amount_paid', 'payment_date', 'reference_number', 'notes', 'created_by',
        'voided_at', 'voided_by', 'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'voided_at' => 'datetime',
        ];
    }

    public function memberProfile(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->whereNull('voided_at');
    }
}
