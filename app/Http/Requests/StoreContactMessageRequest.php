<?php

namespace App\Http\Requests;

use App\Enums\ContactTopic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A message from the contact page. The visitor leaves an email, a phone
 * number, or both, so the studio has a way back to them.
 */
class StoreContactMessageRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'topic' => ['required', Rule::enum(ContactTopic::class)],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:255'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:30', 'regex:/^\+?[\d\s\-().]{6,}$/'],
            'message' => ['required', 'string', 'max:3000'],
            // Hidden from people; a bot that fills it in is turned away.
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required_without' => 'Leave an email or a phone number so we can reply.',
            'phone.required_without' => 'Leave an email or a phone number so we can reply.',
            'phone.regex' => 'That doesn’t look like a phone number.',
        ];
    }
}
