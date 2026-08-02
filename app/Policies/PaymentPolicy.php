<?php

namespace App\Policies;

use App\Models\MemberProfile;
use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function view(User $user, Payment $payment): bool
    {
        if ($payment->memberProfile?->user_id === $user->id) {
            return true;
        }

        return $user->canManageCouncil($payment->memberProfile?->provincial_council_id);
    }

    public function create(User $user, MemberProfile $memberProfile): bool
    {
        return $user->canManageCouncil($memberProfile->provincial_council_id);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->canManageCouncil($payment->memberProfile?->provincial_council_id);
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $this->update($user, $payment);
    }
}
