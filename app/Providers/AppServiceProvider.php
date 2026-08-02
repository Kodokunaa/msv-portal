<?php

namespace App\Providers;

use App\Models\DisciplinaryRecord;
use App\Models\FinancialRecord;
use App\Models\Payment;
use App\Models\User;
use App\Policies\DisciplinaryRecordPolicy;
use App\Policies\FinancialRecordPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(FinancialRecord::class, FinancialRecordPolicy::class);
        Gate::policy(DisciplinaryRecord::class, DisciplinaryRecordPolicy::class);
    }
}
