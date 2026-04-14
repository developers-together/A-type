<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InertiaPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_inertia_component(): void
    {
        $this->get('/home')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Home'));
    }

    public function test_info_page_renders_inertia_component(): void
    {
        $this->get('/info')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Info'));
    }

    public function test_leaderboard_page_renders_inertia_component(): void
    {
        $this->get('/leaderboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Leaderboard'));
    }

    public function test_guest_can_access_login_component(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
    }

    public function test_authenticated_user_is_redirected_away_from_login(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/login')
            ->assertRedirect(route('profile.show'));
    }

    public function test_authenticated_user_can_access_profile_component(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Profile'));
    }
}
