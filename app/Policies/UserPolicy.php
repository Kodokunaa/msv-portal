<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function manage(User $actor, User $target): bool
    {
        return $actor->canManageRecords();
    }

    public function changeRole(User $actor, User $target): bool
    {
        return $actor->isManager() && ! $actor->is($target);
    }
}
