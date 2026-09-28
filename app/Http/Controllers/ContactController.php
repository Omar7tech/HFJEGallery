<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * The contact page, with a fresh token dating the form.
     */
    public function show(): Response
    {
        return Inertia::render('contact/index', [
            'formToken' => StoreContactMessageRequest::issueFormToken(),
        ]);
    }

    /**
     * Keep a visitor's message for the studio to read in the dashboard.
     */
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        if (! $request->isLikelyBot()) {
            ContactMessage::create($request->safe()->only(['topic', 'name', 'email', 'phone', 'message']));
        }

        return back();
    }
}
