<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'code',
        'name',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot([
                'assigned_by',
                'assigned_at',
                'ended_by',
                'ended_at',
                'is_active',
            ])
            ->withTimestamps();
    }
}