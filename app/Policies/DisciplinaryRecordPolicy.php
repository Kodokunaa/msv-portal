<?php

namespace App\Policies;

use App\Models\DisciplinaryRecord;
use App\Models\MemberProfile;
use App\Models\User;

class DisciplinaryRecordPolicy
{
    public function view(User $user, DisciplinaryRecord $record): bool
    {
        if ($user->isManager()) {
            return true;
        }

        if ($user->hasRole('admin')) {
            return $user->canManageCouncil($record->memberProfile?->provincial_council_id);
        }

        return $record->visibility === 'organization'
            || ($record->visibility === 'member' && $record->memberProfile?->user_id === $user->id);
    }

    public function create(User $user, MemberProfile $memberProfile): bool
    {
        return $user->canManageCouncil($memberProfile->provincial_council_id);
    }

    public function update(User $user, DisciplinaryRecord $record): bool
    {
        return $user->canManageCouncil($record->memberProfile?->provincial_council_id);
    }

    public function delete(User $user, DisciplinaryRecord $record): bool
    {
        return $this->update($user, $record);
    }
}
