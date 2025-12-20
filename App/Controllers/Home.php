<?php

namespace App\Controllers;

use App\Core\Controller;

class Home extends Controller
{
    public function index()
    {

        $this->view('home');
    }

    public function typing()
    {

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $userid = $_SESSION['user_id'];
        $data = [
            'user_id' => $userid,
            'wpm' => $_POST['wpm'],
            'accuracy' => $_POST['accuracy'],
            'mode' => $_POST['mode'],
            'amount' => $_POST['amount'],
            'punctuation' => $_POST['punctuation'],
            'numbers' => $_POST['numbers']
        ];
        $typing = $this->model('Typing');
        $typing->insert($data);

        echo json_encode(['status' => 'success']);
    }

    public function words()
    {

        if (
            $_GET['amount'] == 15 || $_GET['amount'] == 30 ||
            $_GET['amount'] == 60 || $_GET['amount'] == 120
        ) {
            header('Content-Type: application/json');
            echo json_encode($this->model('Word')->words((int)$_GET['amount']));
        } else {
            header('Content-Type: application/json');
            echo json_encode($this->model('Word')->words(15));
        }
    }
}
