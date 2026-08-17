<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing([
                'accountStatus:id,code,name',
                'activeRoles:id,code,name',
                'memberProfile.provincialCouncil:id,name',
                'activeCouncilAssignments.provincialCouncil:id,name',
            ]);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                    'status' => $user->accountStatus?->code,
                    'status_name' => $user->accountStatus?->name,
                    'roles' => $user->activeRoles->pluck('code')->values(),
                    'is_admin' => $user->isAdmin(),
                    'is_manager' => $user->isManager(),
                    'is_provincial_admin' => false,
                    'can_manage_records' => $user->canManageRecords(),
                    'council' => $user->isAdmin()
                        ? null
                        : $user->memberProfile?->provincialCouncil?->name,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
