<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreReadingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'device_id' => ['required', 'integer'],
            'suhu' => ['required', 'numeric', 'between:-999.99,999.99'],
            'kelembapan' => ['required', 'numeric', 'between:0,100'],
        ];
    }

    /**
     * Custom error messages adhering to PRD requirements.
     */
    public function messages(): array
    {
        return [
            'device_id.required' => 'device_id wajib diisi.',
            'device_id.integer' => 'device_id wajib berupa bilangan bulat.',
            'suhu.required' => 'suhu wajib diisi.',
            'suhu.numeric' => 'suhu wajib berupa angka numerik.',
            'suhu.between' => 'suhu harus berada di antara rentang -999.99 s/d 999.99.',
            'kelembapan.required' => 'kelembapan wajib diisi.',
            'kelembapan.numeric' => 'kelembapan wajib berupa angka numerik.',
            'kelembapan.between' => 'kelembapan wajib berupa angka dalam rentang 0–100.',
        ];
    }

    /**
     * Handle failed validation: return HTTP 400 instead of default 422.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Data tidak valid.',
            'errors' => $validator->errors()
        ], 400));
    }
}
