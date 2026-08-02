<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $query = DB::table('audit_logs')
            ->leftJoin('users', 'users.id', '=', 'audit_logs.user_id')
            ->select('audit_logs.*', 'users.first_name', 'users.last_name');

        $search = trim($request->string('search')->toString());
        $query
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('audit_logs.action', 'like', "%{$search}%")
                        ->orWhere('audit_logs.entity_type', 'like', "%{$search}%")
                        ->orWhere('users.first_name', 'like', "%{$search}%")
                        ->orWhere('users.last_name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('action'), fn ($query) => $query->where('audit_logs.action', $request->string('action')->toString()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('audit_logs.created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('audit_logs.created_at', '<=', $request->date('date_to')));

        return Inertia::render('audit-logs/index', [
            'logs' => $query->latest('audit_logs.created_at')->paginate(30)->withQueryString(),
            'filters' => $request->only(['search', 'action', 'date_from', 'date_to']),
            'actions' => DB::table('audit_logs')->select('action')->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
