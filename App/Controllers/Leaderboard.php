<?php
namespace App\Controllers;

use App\Core\Controller;
class Leaderboard extends Controller{

    public function index(){

        $this->view('leaderboard');
    }

}