<?php

namespace App\Controllers;

use App\Core\Controller;

class Leaderboard extends Controller
{
    public function index()
    {
        $typing = $this->model('Typing');

        $data = $typing->leaderboard();

        $this->view('leaderboard', $data);
    }
}

