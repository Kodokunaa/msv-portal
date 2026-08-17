<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Disciplinary\SaveDisciplinaryRecordRequest;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Models\AuditLog;
use App\Models\DisciplinaryRecord;
use App\Models\MemberProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DisciplinaryRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $canManage = $user->canManageRecords();

        $recordQuery = DB::table('disciplinary_records')
            ->whereNull('disciplinary_records.voided_at')
            ->join('member_profiles', 'member_profiles.id', '=', 'disciplinary_records.member_profile_id')
            ->join('users', 'users.id', '=', 'member_profiles.user_id')
            ->join('violation_types', 'violation_types.id', '=', 'disciplinary_records.violation_type_id')
            ->join('disciplinary_statuses', 'disciplinary_statuses.id', '=', 'disciplinary_records.disciplinary_status_id')
            ->select(
                'disciplinary_records.*',
                'users.first_name',
                'users.last_name',
                'violation_types.name as violation_type',
                'disciplinary_statuses.code as status',
                'disciplinary_statuses.name as status_name',
            );

        $search = trim($request->string('search')->toString());
        $recordQuery
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('users.first_name', 'like', "%{$search}%")
                        ->orWhere('users.last_name', 'like', "%{$search}%")
                        ->orWhere('disciplinary_records.case_number', 'like', "%{$search}%")
                        ->orWhere('violation_types.name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('disciplinary_statuses.code', $request->string('status')->toString()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('disciplinary_records.incident_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('disciplinary_records.incident_date', '<=', $request->date('date_to')));

        $memberQuery = DB::table('member_profiles')
            ->join('users', 'users.id', '=', 'member_profiles.user_id')
            ->join('account_statuses', 'account_statuses.id', '=', 'users.account_status_id')
            ->where('account_statuses.code', 'active')
            ->select('member_profiles.id', 'users.first_name', 'users.last_name')
            ->orderBy('users.last_name')->orderBy('users.first_name');

        return Inertia::render('disciplinary-records/index', [
            'records' => $recordQuery->orderByDesc('incident_date')->orderByDesc('disciplinary_records.id')->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'canManage' => $canManage,
            'members' => $canManage ? $memberQuery->get() : [],
            'types' => DB::table('violation_types')->select('id', 'name')->orderBy('name')->get(),
            'statuses' => DB::table('disciplinary_statuses')->select('id', 'code', 'name')->orderBy('id')->get(),
        ]);
    }

    public function store(SaveDisciplinaryRecordRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $profile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [DisciplinaryRecord::class, $profile]);

        $data['visibility'] = 'organization';
        $data['published_at'] = now();
        $record = DisciplinaryRecord::query()->create($data + ['created_by' => $request->user()->id]);
        if (! $record->case_number) {
            $record->update(['case_number' => 'MSV-CASE-'.now()->format('Y').'-'.str_pad((string) $record->id, 5, '0', STR_PAD_LEFT)]);
        }

        AuditLog::record($request, 'disciplinary.created', DisciplinaryRecord::class, $record->id, null, $record->fresh()->toArray());

        return back()->with('success', 'Disciplinary record added.');
    }

    public function update(SaveDisciplinaryRecordRequest $request, DisciplinaryRecord $disciplinaryRecord): RedirectResponse
    {
        $disciplinaryRecord->loadMissing('memberProfile');
        $this->authorize('update', $disciplinaryRecord);

        $data = $request->validated();
        $newProfile = MemberProfile::query()->findOrFail($data['member_profile_id']);
        $this->authorize('create', [DisciplinaryRecord::class, $newProfile]);
        $data['visibility'] = 'organization';
        $data['published_at'] = $disciplinaryRecord->published_at ?? now();

        $old = $disciplinaryRecord->toArray();
        $disciplinaryRecord->update($data);
        AuditLog::record($request, 'disciplinary.updated', DisciplinaryRecord::class, $disciplinaryRecord->id, $old, $disciplinaryRecord->fresh()->toArray());

        return back()->with('success', 'Disciplinary record updated.');
    }

    public function destroy(VoidRecordRequest $request, DisciplinaryRecord $disciplinaryRecord): RedirectResponse
    {
        $disciplinaryRecord->loadMissing('memberProfile');
        $this->authorize('delete', $disciplinaryRecord);
        abort_if($disciplinaryRecord->voided_at, 422, 'This disciplinary record is already voided.');

        $old = $disciplinaryRecord->toArray();
        $disciplinaryRecord->update([
            'voided_at' => now(),
            'voided_by' => $request->user()->id,
            'void_reason' => $request->validated('reason'),
        ]);
        AuditLog::record($request, 'disciplinary.voided', DisciplinaryRecord::class, $disciplinaryRecord->id, $old, $disciplinaryRecord->fresh()->toArray());

        return back()->with('success', 'Disciplinary record voided.');
    }
}
