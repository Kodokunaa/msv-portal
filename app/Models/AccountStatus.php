<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountStatus extends Model
{
    protected $fillable = ['code', 'name'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AccountStatusHistory::class);
    }
}
