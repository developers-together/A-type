<?php

namespace Tests\Feature;

use App\Models\TypingSession;
use App\Models\User;
use App\Models\Word;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TypingAndWordsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_store_typing_session(): void
    {
        $response = $this->postJson('/home/typing', [
            'wpm' => 75,
            'accuracy' => 96.5,
            'mode' => 'time',
            'amount' => 15,
            'punctuation' => false,
            'numbers' => true,
        ]);

        $response
            ->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'User not logged in',
            ]);
    }

    public function test_authenticated_user_can_store_typing_session(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/home/typing', [
                'wpm' => 82,
                'accuracy' => 98.25,
                'mode' => 'words',
                'amount' => 25,
                'punctuation' => true,
                'numbers' => false,
            ]);

        $response
            ->assertOk()
            ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('typing_sessions', [
            'user_id' => $user->id,
            'wpm' => 82,
            'mode' => 'words',
            'amount' => 25,
            'numbers' => 0,
            'punctuation' => 1,
        ]);
    }

    public function test_words_endpoint_returns_requested_count(): void
    {
        $words = [];
        for ($i = 1; $i <= 30; $i++) {
            $words[] = [
                'word' => "word{$i}",
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Word::query()->insert($words);

        $response = $this->getJson('/home/words?amount=15');

        $response->assertOk();
        $this->assertCount(15, $response->json());

        foreach ($response->json() as $item) {
            $this->assertArrayHasKey('word', $item);
            $this->assertNotEmpty($item['word']);
        }
    }

    public function test_leaderboard_page_loads_with_seeded_scores(): void
    {
        $user = User::factory()->create(['username' => 'leader']);

        TypingSession::query()->create([
            'user_id' => $user->id,
            'wpm' => 100,
            'accuracy' => 99.10,
            'mode' => 'time',
            'amount' => 15,
            'numbers' => false,
            'punctuation' => false,
            'session_at' => now(),
        ]);

        $response = $this->get('/leaderboard');

        $response
            ->assertOk()
            ->assertSee('leader');
    }
}
