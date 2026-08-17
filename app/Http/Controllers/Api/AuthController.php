<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountStatusHistory;
use App\Models\AuditLog;
use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($data): User {
            $user = User::query()->create([
                'first_name' => trim($data['first_name']),
                'last_name' => trim($data['last_name']),
                'email' => $data['email'],
                'password' => $data['password'],
            ]);
            $user->refresh();

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

        AuditLog::record($request, 'user.registered', User::class, $user->id, null, ['status' => 'pending']);
        event(new Registered($user));

        return response()->json([
            'message' => 'Registration submitted. An administrator must approve your account before you can log in.',
            'user' => $user->fresh()->toApiArray(),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $status = $user->accountStatus?->code;

        if ($status !== 'active') {
            abort(403, $status === 'pending'
                ? 'Your account is pending approval.'
                : 'Your account cannot currently access the member portal.');
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->toApiArray(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }
}
