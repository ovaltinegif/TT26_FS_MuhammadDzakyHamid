<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreDeviceRequest extends FormRequest
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
            'kode' => ['required', 'string', 'regex:/^SNS-[AB][0-9]{2}$/'],
            'nama' => ['required', 'string', 'max:50'],
            'gudang' => ['required', 'in:A,B'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Custom error messages adhering to PRD requirements.
     */
    public function messages(): array
    {
        return [
            'kode.required' => 'Field kode wajib diisi.',
            'kode.regex' => 'Format kode harus SNS-[A/B][2 digit], contoh SNS-A01.',
            'nama.required' => 'Field nama wajib diisi.',
            'nama.max' => 'Nama perangkat maksimal 50 karakter.',
            'gudang.required' => 'Field gudang wajib diisi.',
            'gudang.in' => 'Gudang harus bernilai A atau B.',
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
