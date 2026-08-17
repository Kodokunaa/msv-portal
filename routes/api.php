<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DisciplinaryRecordController;
use App\Http\Controllers\Api\FinancialRecordController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserApprovalController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:api-auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:api-auth');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/financial-records', [FinancialRecordController::class, 'index']);
    Route::get('/disciplinary-records', [DisciplinaryRecordController::class, 'index']);

    Route::middleware('role:admin,manager')->group(function () {
        Route::post('/approve-user', [UserApprovalController::class, 'store']);

        Route::post('/payments', [PaymentController::class, 'store']);
        Route::put('/payments/{payment}', [PaymentController::class, 'update']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

        Route::post('/disciplinary-records', [DisciplinaryRecordController::class, 'store']);
        Route::put('/disciplinary-records/{disciplinaryRecord}', [DisciplinaryRecordController::class, 'update']);
        Route::delete('/disciplinary-records/{disciplinaryRecord}', [DisciplinaryRecordController::class, 'destroy']);
    });

    Route::middleware('role:manager')->group(function () {
        Route::post('/financial-records', [FinancialRecordController::class, 'store']);
        Route::put('/financial-records/{financialRecord}', [FinancialRecordController::class, 'update']);
        Route::delete('/financial-records/{financialRecord}', [FinancialRecordController::class, 'destroy']);
    });
});
