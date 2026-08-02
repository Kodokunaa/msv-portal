<?php

namespace App\Policies;

use App\Models\FinancialRecord;
use App\Models\User;

class FinancialRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isManager();
    }

    public function update(User $user, FinancialRecord $financialRecord): bool
    {
        return $user->isManager();
    }

    public function delete(User $user, FinancialRecord $financialRecord): bool
    {
        return $user->isManager();
    }
}
