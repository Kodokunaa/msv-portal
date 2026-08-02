<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\AuditLog;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $request->user()->load('memberProfile');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $request->user()->memberProfile,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $old = [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
        ];

        $user->fill($request->safe()->only([
            'first_name',
            'last_name',
            'email',
        ]));

        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        $profile = $user->memberProfile()->firstOrCreate([]);
        $profile->fill($request->safe()->only([
            'middle_name',
            'contact_number',
            'birth_date',
            'address',
            'school',
            'course',
            'graduation_year',
        ]));

        if ($request->hasFile('avatar')) {
            if ($profile->avatar_path) {
                Storage::disk('public')->delete($profile->avatar_path);
            }

            $profile->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        $profile->save();

        AuditLog::record(
            $request,
            'profile.updated',
            get_class($user),
            $user->id,
            $old,
            [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ],
        );

        return to_route('profile.edit')->with(
            'success',
            $emailChanged
                ? 'Profile updated. Verify your new email address before returning to the portal.'
                : 'Profile updated.',
        );
    }
}
