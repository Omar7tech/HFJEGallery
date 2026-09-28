<?php

namespace App\Http\Requests;

use App\Enums\ContactTopic;
use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * A message from the contact page. A phone number, with its country code,
 * is how the studio gets back to the visitor; an email is optional.
 *
 * Besides the rate limit on the route, two quiet checks keep bots out: a
 * hidden field people never fill in, and a signed token recording when the
 * form was opened, since nobody writes a message in under a few seconds.
 */
class StoreContactMessageRequest extends FormRequest
{
    /** Faster than this, the form was filled in by a script. */
    public const int MIN_SECONDS_TO_FILL = 3;

    /** Older than this, the page has been open too long to trust its token. */
    public const int MAX_FORM_AGE_SECONDS = 6 * 60 * 60;

    /** Spam is mostly links; a real message rarely needs more than this. */
    public const int MAX_LINKS = 2;

    /**
     * A token recording when the form was shown, encrypted so it can't be
     * forged or backdated.
     */
    public static function issueFormToken(): string
    {
        return Crypt::encryptString((string) now()->getTimestamp());
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'topic' => ['required', Rule::enum(ContactTopic::class)],
            'name' => ['required', 'string', 'min:2', 'max:100', 'not_regex:/https?:\/\/|www\./i'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^\+[1-9]\d{0,3} [\d\s\-().]+$/', $this->internationalLength(...)],
            'email' => ['nullable', 'email:rfc', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:3000', $this->limitLinks(...)],
            'website' => ['nullable', 'string'],
            'form_token' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.not_regex' => 'Please enter just your name.',
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'That doesn’t look like a phone number.',
            'message.min' => 'Tell us a little more, at least a few words.',
            'form_token.required' => 'This form has expired. Refresh the page and try again.',
        ];
    }

    /**
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $age = $this->formAge();

                if ($this->filled('form_token') && ($age === null || $age > self::MAX_FORM_AGE_SECONDS)) {
                    $validator->errors()->add('form_token', 'This form has expired. Refresh the page and try again.');
                }
            },
        ];
    }

    /**
     * Whether a bot sent this: it filled the hidden field, or it was quicker
     * than any person. The message is dropped, but the sender is told it
     * went through, so there is nothing to learn from the response.
     */
    public function isLikelyBot(): bool
    {
        $age = $this->formAge();

        return $this->filled('website') || ($age !== null && $age < self::MIN_SECONDS_TO_FILL);
    }

    /**
     * Plain text only: tags are stripped and whitespace tidied before the
     * rules run, so what is stored is what was meant.
     */
    protected function prepareForValidation(): void
    {
        $clean = fn (mixed $value): mixed => is_string($value) ? trim(strip_tags($value)) : $value;

        $this->merge([
            'name' => preg_replace('/\s+/u', ' ', (string) $clean($this->input('name'))),
            'email' => $clean($this->input('email')),
            'phone' => $clean($this->input('phone')),
            'message' => $clean($this->input('message')),
        ]);
    }

    /**
     * Seconds since the form was shown, or null when the token is unreadable.
     */
    private function formAge(): ?int
    {
        try {
            $issuedAt = (int) Crypt::decryptString((string) $this->input('form_token'));
        } catch (DecryptException) {
            return null;
        }

        return (int) now()->getTimestamp() - $issuedAt;
    }

    /**
     * An international number runs to 8-15 digits, country code included.
     */
    private function internationalLength(string $attribute, mixed $value, Closure $fail): void
    {
        $digits = strlen((string) preg_replace('/\D/', '', (string) $value));

        if ($digits < 8 || $digits > 15) {
            $fail('That doesn’t look like a phone number.');
        }
    }

    private function limitLinks(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && preg_match_all('/https?:\/\/|www\./i', $value) > self::MAX_LINKS) {
            $fail('Please keep it to '.self::MAX_LINKS.' links or fewer.');
        }
    }
}
