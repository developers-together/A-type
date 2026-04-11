<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/auth/register', [
            'username' => 'atype_user',
            'email' => 'atype@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('profile.show'));
        $this->assertAuthenticated();

        $this->assertDatabaseHas('users', [
            'username' => 'atype_user',
            'email' => 'atype@example.com',
        ]);
    }

    public function test_user_can_login_and_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $loginResponse = $this->post('/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertRedirect(route('profile.show'));
        $this->assertAuthenticatedAs($user);

        $logoutResponse = $this->post('/auth/logout');

        $logoutResponse->assertRedirect(route('home'));
        $this->assertGuest();
    }

    public function test_user_can_update_profile_information(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $response = $this
            ->actingAs($user)
            ->put('/profile', [
                'username' => 'updated_name',
                'email' => 'updated@example.com',
                'password' => '',
                'password_confirmation' => '',
            ]);

        $response->assertRedirect(route('profile.show'));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'updated_name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_user_can_delete_account_with_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'current_password' => 'password123',
            ]);

        $response->assertRedirect(route('home'));
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
