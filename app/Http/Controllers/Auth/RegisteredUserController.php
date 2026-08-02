<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AccountStatusHistory;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($request): User {
            $user = User::query()->create([
                'first_name' => $request->string('first_name')->trim()->toString(),
                'last_name' => $request->string('last_name')->trim()->toString(),
                'email' => $request->string('email')->lower()->toString(),
                'password' => $request->string('password')->toString(),
            ]);

            MemberProfile::query()->create([
                'user_id' => $user->id,
                'provincial_council_id' => DB::table('provincial_councils')->where('code', 'oriental-mindoro')->value('id'),
            ]);

            AccountStatusHistory::query()->create([
                'user_id' => $user->id,
                'account_status_id' => $user->account_status_id,
                'changed_by' => null,
                'reason' => 'Membership application submitted.',
            ]);

            return $user;
        });

        event(new Registered($user));
        Auth::login($user);
        AuditLog::record($request, 'user.registered', User::class, $user->id, null, ['status' => 'pending']);

        return redirect()->route('account.pending');
    }
}
