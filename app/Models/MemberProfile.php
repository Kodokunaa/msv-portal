<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberProfile extends Model
{
    protected $fillable = [
        'user_id', 'provincial_council_id', 'membership_number', 'middle_name',
        'contact_number', 'birth_date', 'address', 'school', 'course',
        'graduation_year', 'avatar_path', 'joined_at',
    ];

    protected function casts(): array
    {
        return ['birth_date' => 'date', 'joined_at' => 'date'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function provincialCouncil(): BelongsTo { return $this->belongsTo(ProvincialCouncil::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }
    public function disciplinaryRecords(): HasMany { return $this->hasMany(DisciplinaryRecord::class); }
}
