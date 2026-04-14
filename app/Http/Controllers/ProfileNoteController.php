<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProfileNoteRequest;
use App\Http\Requests\UpdateProfileNoteRequest;
use App\Models\ProfileNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProfileNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()
            ->profileNotes()
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json(['data' => $notes]);
    }

    public function show(Request $request, ProfileNote $profileNote): JsonResponse
    {
        $this->authorizeNote($request, $profileNote);

        return response()->json(['data' => $profileNote]);
    }

    public function store(StoreProfileNoteRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        $note = $request->user()->profileNotes()->create($validated);

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $note,
            ], 201);
        }

        return redirect()
            ->route('profile.show')
            ->with('status', 'Profile note created.');
    }

    public function update(UpdateProfileNoteRequest $request, ProfileNote $profileNote): JsonResponse|RedirectResponse
    {
        $this->authorizeNote($request, $profileNote);

        $profileNote->update($request->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $profileNote->fresh(),
            ]);
        }

        return redirect()
            ->route('profile.show')
            ->with('status', 'Profile note updated.');
    }

    public function destroy(Request $request, ProfileNote $profileNote): JsonResponse|RedirectResponse
    {
        $this->authorizeNote($request, $profileNote);

        $profileNote->delete();

        if ($request->expectsJson()) {
            return response()->json(['status' => 'success']);
        }

        return redirect()
            ->route('profile.show')
            ->with('status', 'Profile note deleted.');
    }

    private function authorizeNote(Request $request, ProfileNote $profileNote): void
    {
        abort_unless($profileNote->user_id === $request->user()?->id, 403);
    }
}
