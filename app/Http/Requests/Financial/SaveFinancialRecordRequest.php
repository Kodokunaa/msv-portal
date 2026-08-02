<?php

namespace App\Http\Requests\Financial;

use Illuminate\Foundation\Http\FormRequest;

class SaveFinancialRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManager() ?? false;
    }

    public function rules(): array
    {
        return [
            'financial_category_id' => ['required', 'integer', 'exists:financial_categories,id'],
            'provincial_council_id' => ['nullable', 'integer', 'exists:provincial_councils,id'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01', 'decimal:0,2'],
            'transaction_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'publication_status' => ['sometimes', 'in:draft,published'],
        ];
    }
}
