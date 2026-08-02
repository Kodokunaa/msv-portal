<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! collect($roles)->contains(fn (string $role) => $user->hasRole($role))) {
            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
