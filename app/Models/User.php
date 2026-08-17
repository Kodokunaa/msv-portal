<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['first_name', 'last_name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['name', 'avatar'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function getAvatarAttribute(): ?string
    {
        $path = $this->memberProfile?->avatar_path;

        return $path ? asset('storage/'.$path) : null;
    }

    public function accountStatus(): BelongsTo
    {
        return $this->belongsTo(AccountStatus::class);
    }

    public function accountStatusHistories(): HasMany
    {
        return $this->hasMany(AccountStatusHistory::class);
    }

    public function memberProfile(): HasOne
    {
        return $this->hasOne(MemberProfile::class);
    }

    public function councilAssignments(): HasMany
    {
        return $this->hasMany(AdminCouncilAssignment::class);
    }

    public function activeCouncilAssignments(): HasMany
    {
        return $this->councilAssignments()->where('is_active', true);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['assigned_by', 'assigned_at', 'ended_by', 'ended_at', 'is_active'])
            ->withTimestamps();
    }

    public function activeRoles(): BelongsToMany
    {
        return $this->roles()->wherePivot('is_active', true);
    }

    public function hasRole(string $roleCode): bool
    {
        if ($this->relationLoaded('activeRoles')) {
            return $this->activeRoles->contains('code', $roleCode);
        }

        return $this->activeRoles()->where('roles.code', $roleCode)->exists();
    }

    public function activeCouncilIds(): array
    {
        if ($this->relationLoaded('activeCouncilAssignments')) {
            return $this->activeCouncilAssignments
                ->pluck('provincial_council_id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }

        return $this->activeCouncilAssignments()
            ->pluck('provincial_council_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function hasProvincialScope(): bool
    {
        return count($this->activeCouncilIds()) > 0;
    }

    public function canManageCouncil(?int $councilId = null): bool
    {
        return $this->isAdmin();
    }

    public function canManageRecords(): bool
    {
        return $this->isAdmin();
    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isAdmin(): bool
    {
        return $this->isManager() || $this->hasRole('admin');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        $this->loadMissing([
            'accountStatus:id,code,name',
            'activeRoles:id,code,name',
            'memberProfile.provincialCouncil:id,name',
        ]);

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->accountStatus?->code,
            'roles' => $this->activeRoles->pluck('code')->values(),
            'is_admin' => $this->isAdmin(),
            'is_manager' => $this->isManager(),
        ];
    }
}
