<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisciplinaryRecord extends Model
{
    protected $fillable = [
        'case_number', 'member_profile_id', 'violation_type_id', 'disciplinary_status_id',
        'incident_date', 'description', 'action_taken', 'notes', 'visibility',
        'published_at', 'created_by', 'voided_at', 'voided_by', 'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'incident_date' => 'date',
            'published_at' => 'datetime',
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
