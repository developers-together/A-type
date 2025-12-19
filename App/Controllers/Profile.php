<?php

namespace App\Controllers;

use App\Core\Controller;

class Profile extends Controller
{
    public function index()
    {

        if (isset($_SESSION['user_id'])) {
            $this->profile();
        } else {
            $this->view('login');
        }
    }

    public function register()
    {

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $user = $this->model('User');

        $user_id = $user->insert([
            'username' => $username,
            'email' => $email,
            'password_hash' => $hashed_password
        ]);

        $_SESSION['user_id'] = $user_id;

        $this->view(view: 'home');
    }

    public function login()
    {

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $email = $_POST['email'];
        $password = $_POST['password'];
        // $ashed_password= password_hash($password, PASSWORD_DEFAULT);

        $user = $this->model('User');

        $data = $user->verify($email, $password);

        if ($data === false) {
            $this->view("login");
        } else {
            // if(session_status()=== PHP_SESSION_NONE){
            //     session_start();
            // }

            $_SESSION['user_id'] = $data['id'];

            $this->profile();
        }

        // $data=$user->query('SELECT * FROM users WHERE (email=\'' . $email . '\');');

        // if($data && password_verify($password, $data[0]['password_hash'])){
        //     if(session_status()=== PHP_SESSION_NONE){
        //         session_start();
        //     }

        //     $_SESSION['user_id']= $data[0]['id'];

        //     $this->profile();

        // }
        // else{
        //     $this->view("login");
        // }
    }

    public function profile()
    {
        $data = [];
        $user = $this->model('User');
        $data['user'] = $user->get($_SESSION["user_id"]);
        // $data['username']='s';
        $stats = $this->model('Typing');
        $data['stats'] = $stats->get($_SESSION["user_id"]);
        $data['avg'] = $stats->avg($_SESSION["user_id"]);
        unset($data['user']['password_hash']);
        $this->view('profile', $data);
    }

    public function logout()
    {

        unset($_SESSION['user_id']);
        $this->view('home');
    }
}
