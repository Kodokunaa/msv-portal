<?php

namespace App\Policies;

use App\Models\DisciplinaryRecord;
use App\Models\MemberProfile;
use App\Models\User;

class DisciplinaryRecordPolicy
{
    public function view(User $user, DisciplinaryRecord $record): bool
    {
        return true;
    }

    public function create(User $user, MemberProfile $memberProfile): bool
    {
        return $user->canManageRecords();
    }

    public function update(User $user, DisciplinaryRecord $record): bool
    {
        return $user->canManageRecords();
    }

    public function delete(User $user, DisciplinaryRecord $record): bool
    {
        return $this->update($user, $record);
    }
}
