<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class SavePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'member_profile_id' => ['required', 'integer', 'exists:member_profiles,id'],
            'payment_type_id' => ['required', 'integer', 'exists:payment_types,id'],
            'payment_status_id' => ['required', 'integer', 'exists:payment_statuses,id'],
            'amount_due' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'amount_paid' => ['required', 'numeric', 'min:0', 'lte:amount_due', 'decimal:0,2'],
            'payment_date' => ['nullable', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
