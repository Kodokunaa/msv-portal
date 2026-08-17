<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\Portal\DisciplinaryRecordController;
use App\Http\Controllers\Portal\FinancialRecordController;
use App\Http\Controllers\Portal\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');
Route::get('/whitepaper', fn () => Inertia::render('whitepaper'))->name('whitepaper');

Route::get('/account/pending', function (Request $request) {
    if ($request->user()?->accountStatus?->code === 'active') {
        return redirect()->route('dashboard');
    }

    return Inertia::render('auth/pending-approval', [
        'emailVerified' => (bool) $request->user()?->hasVerifiedEmail(),
        'status' => $request->session()->get('status'),
    ]);
})
    ->middleware(['auth', 'not-blocked'])
    ->name('account.pending');

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, '__invoke'])->name('dashboard');
    Route::get('/member/dashboard', [DashboardController::class, 'member'])->name('dashboard.member');
    Route::get('/admin/dashboard', [DashboardController::class, 'admin'])->name('dashboard.admin');
    Route::get('/financial-records', [FinancialRecordController::class, 'index'])
        ->name('financial.index');
    Route::get('/payments', [PaymentController::class, 'index'])
        ->name('payments.index');
    Route::get('/disciplinary-records', [DisciplinaryRecordController::class, 'index'])
        ->name('disciplinary.index');

    Route::middleware('role:admin,manager')->group(function () {
        Route::get('/management/members', [UserManagementController::class, 'index'])
            ->name('members.index');
        Route::patch('/management/members/{user}/approve', [UserManagementController::class, 'approve'])
            ->name('members.approve');
        Route::patch('/management/members/{user}/reject', [UserManagementController::class, 'reject'])
            ->name('members.reject');
        Route::patch('/management/members/{user}/suspend', [UserManagementController::class, 'suspend'])
            ->name('members.suspend');
        Route::patch('/management/members/{user}/reactivate', [UserManagementController::class, 'reactivate'])
            ->name('members.reactivate');
        Route::patch('/management/members/{user}/deactivate', [UserManagementController::class, 'deactivate'])
            ->name('members.deactivate');

        Route::post('/payments', [PaymentController::class, 'store'])
            ->name('payments.store');
        Route::put('/payments/{payment}', [PaymentController::class, 'update'])
            ->name('payments.update');
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])
            ->name('payments.destroy');

        Route::post('/disciplinary-records', [DisciplinaryRecordController::class, 'store'])
            ->name('disciplinary.store');
        Route::put('/disciplinary-records/{disciplinaryRecord}', [DisciplinaryRecordController::class, 'update'])
            ->name('disciplinary.update');
        Route::delete('/disciplinary-records/{disciplinaryRecord}', [DisciplinaryRecordController::class, 'destroy'])
            ->name('disciplinary.destroy');
    });

    Route::middleware('role:manager')->group(function () {
        Route::patch('/management/members/{user}/promote', [UserManagementController::class, 'promote'])
            ->name('members.promote');
        Route::patch('/management/members/{user}/demote', [UserManagementController::class, 'demote'])
            ->name('members.demote');
        Route::patch('/management/members/{user}/assign-council', [UserManagementController::class, 'assignCouncil'])
            ->name('members.assign-council');
        Route::patch('/management/members/{user}/remove-council', [UserManagementController::class, 'removeCouncil'])
            ->name('members.remove-council');

        Route::post('/financial-records', [FinancialRecordController::class, 'store'])
            ->name('financial.store');
        Route::put('/financial-records/{financialRecord}', [FinancialRecordController::class, 'update'])
            ->name('financial.update');
        Route::delete('/financial-records/{financialRecord}', [FinancialRecordController::class, 'destroy'])
            ->name('financial.destroy');

        Route::get('/audit-logs', AuditLogController::class)->name('audit.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
