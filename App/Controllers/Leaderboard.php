<?php

namespace App\Controllers;

use App\Core\Controller;

class Leaderboard extends Controller
{
    public function index()
    {
        $typing = $this->model('Typing');
        $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all_time';

        $data = $typing->leaderboard($filter);
        $data['current_filter'] = $filter;

        $this->view('leaderboard', $data);
    }
}

