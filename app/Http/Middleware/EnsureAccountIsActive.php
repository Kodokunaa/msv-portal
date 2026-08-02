<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $status = $user->accountStatus?->code;

        if ($status === 'pending') {
            return redirect()->route('account.pending');
        }

        if ($status === 'rejected' || $status === 'suspended') {
            auth()->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'Your account cannot currently access the member portal.',
                ]);
        }

        if ($status !== 'active') {
            abort(403);
        }

        return $next($request);
    }
}