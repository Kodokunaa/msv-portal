<?php

namespace App\Http\Requests\Disciplinary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveDisciplinaryRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $recordId = $this->route('disciplinaryRecord')?->id;

        return [
            'case_number' => ['nullable', 'string', 'max:60', Rule::unique('disciplinary_records')->ignore($recordId)],
            'member_profile_id' => ['required', 'integer', 'exists:member_profiles,id'],
            'violation_type_id' => ['required', 'integer', 'exists:violation_types,id'],
            'disciplinary_status_id' => ['required', 'integer', 'exists:disciplinary_statuses,id'],
            'incident_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:2000'],
            'action_taken' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['sometimes', 'in:organization,member,private'],
        ];
    }
}
