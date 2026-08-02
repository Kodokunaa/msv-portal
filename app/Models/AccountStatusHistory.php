<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountStatusHistory extends Model
{
    protected $fillable = ['user_id', 'account_status_id', 'changed_by', 'reason'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accountStatus(): BelongsTo
    {
        return $this->belongsTo(AccountStatus::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
