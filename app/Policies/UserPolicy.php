<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function manage(User $actor, User $target): bool
    {
        if ($actor->isManager()) {
            return true;
        }

        return $actor->canManageCouncil($target->memberProfile?->provincial_council_id);
    }

    public function changeRole(User $actor, User $target): bool
    {
        return $actor->isManager() && ! $actor->is($target);
    }
}
