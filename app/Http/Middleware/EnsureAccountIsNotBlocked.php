<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsNotBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $status = $request->user()?->accountStatus?->code;

        if (in_array($status, ['rejected', 'suspended', 'deactivated'], true)) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Your account cannot currently access the member portal.',
            ]);
        }

        if (! in_array($status, ['pending', 'active'], true)) {
            abort(403);
        }

        return $next($request);
    }
}
