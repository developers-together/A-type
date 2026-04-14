<?php

namespace Tests\Feature;

use App\Models\ProfileNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileNoteCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_run_full_profile_note_crud_flow(): void
    {
        $user = User::factory()->create();

        $createResponse = $this
            ->actingAs($user)
            ->post('/profile/notes', [
                'title' => 'Daily Practice Goal',
                'body' => 'Hit 80 WPM for three runs.',
                'is_pinned' => true,
            ]);

        $createResponse->assertRedirect(route('profile.show'));

        $this->assertDatabaseHas('profile_notes', [
            'user_id' => $user->id,
            'title' => 'Daily Practice Goal',
            'is_pinned' => 1,
        ]);

        $note = ProfileNote::query()->where('user_id', $user->id)->firstOrFail();

        $indexResponse = $this
            ->actingAs($user)
            ->getJson('/profile/notes');

        $indexResponse
            ->assertOk()
            ->assertJsonPath('data.0.id', $note->id)
            ->assertJsonPath('data.0.title', 'Daily Practice Goal');

        $showResponse = $this
            ->actingAs($user)
            ->getJson("/profile/notes/{$note->id}");

        $showResponse
            ->assertOk()
            ->assertJsonPath('data.body', 'Hit 80 WPM for three runs.');

        $updateResponse = $this
            ->actingAs($user)
            ->putJson("/profile/notes/{$note->id}", [
                'title' => 'Weekly Goal',
                'body' => 'Keep average accuracy above 97%.',
                'is_pinned' => false,
            ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Weekly Goal');

        $this->assertDatabaseHas('profile_notes', [
            'id' => $note->id,
            'title' => 'Weekly Goal',
            'is_pinned' => 0,
        ]);

        $deleteResponse = $this
            ->actingAs($user)
            ->deleteJson("/profile/notes/{$note->id}");

        $deleteResponse
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('profile_notes', ['id' => $note->id]);
    }

    public function test_note_create_and_update_are_validated(): void
    {
        $user = User::factory()->create();

        $createResponse = $this
            ->actingAs($user)
            ->postJson('/profile/notes', [
                'title' => 'ab',
                'body' => '',
            ]);

        $createResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'body']);

        $note = ProfileNote::query()->create([
            'user_id' => $user->id,
            'title' => 'Valid title',
            'body' => 'Valid body',
            'is_pinned' => false,
        ]);

        $updateResponse = $this
            ->actingAs($user)
            ->putJson("/profile/notes/{$note->id}", [
                'title' => '',
                'body' => '',
                'is_pinned' => 'not-a-bool',
            ]);

        $updateResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'body', 'is_pinned']);
    }

    public function test_user_cannot_manage_notes_of_other_users(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $note = ProfileNote::query()->create([
            'user_id' => $owner->id,
            'title' => 'Private note',
            'body' => 'This should not be visible to other users.',
            'is_pinned' => false,
        ]);

        $this
            ->actingAs($intruder)
            ->getJson("/profile/notes/{$note->id}")
            ->assertForbidden();

        $this
            ->actingAs($intruder)
            ->putJson("/profile/notes/{$note->id}", [
                'title' => 'Hacked title',
                'body' => 'Nope',
                'is_pinned' => false,
            ])
            ->assertForbidden();

        $this
            ->actingAs($intruder)
            ->deleteJson("/profile/notes/{$note->id}")
            ->assertForbidden();
    }

    public function test_authenticated_user_can_save_theme_preference(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->putJson('/profile/theme', ['theme' => 'light'])
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('theme_preferences', [
            'user_id' => $user->id,
            'theme' => 'light',
        ]);

        $this
            ->actingAs($user)
            ->putJson('/profile/theme', ['theme' => 'dark'])
            ->assertOk();

        $this->assertDatabaseHas('theme_preferences', [
            'user_id' => $user->id,
            'theme' => 'dark',
        ]);
    }

    public function test_theme_preference_validation_rejects_invalid_values(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->putJson('/profile/theme', ['theme' => 'blue'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['theme']);
    }
}
