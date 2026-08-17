<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Disciplinary\SaveDisciplinaryRecordRequest;
use App\Http\Requests\Members\VoidRecordRequest;
use App\Models\AuditLog;
use App\Models\DisciplinaryRecord;
use App\Models\MemberProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisciplinaryRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $records = DB::table('disciplinary_records')
            ->whereNull('disciplinary_records.voided_at')
            ->join('member_profiles', 'member_profiles.id', '=', 'disciplinary_records.member_profile_id')
            ->join('users', 'users.id', '=', 'member_profiles.user_id')
            ->join('violation_types', 'violation_types.id', '=', 'disciplinary_records.violation_type_id')
            ->join('disciplinary_statuses', 'disciplinary_statuses.id', '=', 'disciplinary_records.disciplinary_status_id')
            ->select(
                'disciplinary_records.id',
                'disciplinary_records.case_number',
                'disciplinary_records.incident_date',
                'disciplinary_records.description',
                'disciplinary_records.action_taken',
                'users.first_name',
                'users.last_name',
                'violation_types.name as violation_type',
                'disciplinary_statuses.code as status',
                'disciplinary_statuses.name as status_name',
            )
            ->orderByDesc('disciplinary_records.incident_date')
            ->orderByDesc('disciplinary_records.id');

        $paginator = $records->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'next_page_url' => $paginator->nextPageUrl(),
                'previous_page_url' => $paginator->previousPageUrl(),
            ],
        ]);
    }

    public function store(SaveDisciplinaryRecordRequest $request): JsonResponse
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

        return response()->json(['data' => $record->fresh()], 201);
    }

    public function update(SaveDisciplinaryRecordRequest $request, DisciplinaryRecord $disciplinaryRecord): JsonResponse
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

        return response()->json(['data' => $disciplinaryRecord->fresh()]);
    }

    public function destroy(VoidRecordRequest $request, DisciplinaryRecord $disciplinaryRecord): JsonResponse
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

        return response()->json(['message' => 'Disciplinary record voided.']);
    }

    private function perPage(Request $request): int
    {
        return max(1, min($request->integer('per_page', 50), 100));
    }
}
