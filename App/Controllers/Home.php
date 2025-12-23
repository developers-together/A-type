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
        $amount = isset($_GET['amount']) ? (int)$_GET['amount'] : 15;
        
        // Valid amounts: Time mode (15, 30, 60, 120), Words mode (10, 25, 50, 100), and infinite scroll (90)
        $validAmounts = [10, 15, 25, 30, 50, 60, 90, 100, 120];
        
        if (in_array($amount, $validAmounts)) {
            header('Content-Type: application/json');
            echo json_encode($this->model('Word')->words($amount));
        } else {
            // For any other amount, just return that many words (with a reasonable max)
            $amount = min($amount, 200);
            header('Content-Type: application/json');
            echo json_encode($this->model('Word')->words($amount));
        }
    }
}
