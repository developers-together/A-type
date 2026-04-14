<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\Unique>>
     */
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }
}
