<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialRecord extends Model
{
    protected $fillable = [
        'financial_category_id', 'provincial_council_id', 'description', 'amount',
        'transaction_date', 'reference_number', 'notes', 'publication_status',
        'published_at', 'created_by', 'voided_at', 'voided_by', 'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
            'published_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function provincialCouncil(): BelongsTo
    {
        return $this->belongsTo(ProvincialCouncil::class);
    }

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->whereNull('voided_at');
    }
}
