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
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('api-auth', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(5)->by($email.'|'.$request->ip()),
                Limit::perMinute(300)->by($request->ip()),
            ];
        });

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(FinancialRecord::class, FinancialRecordPolicy::class);
        Gate::policy(DisciplinaryRecord::class, DisciplinaryRecordPolicy::class);
    }
}
