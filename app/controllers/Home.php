<?php

class Home extends Controller{

    public function index(){

        $this->view('home');
       
    }

    public function typing(){

        $userid= $_SESSION['user_id'];
        $data=['user_id'=>$userid,'wpm'=>$_POST['wpm'],'accuracy'=>$_POST['accuracy']];
        $typing= $this->model('Typing');
        $typing->insert($data);

    }
}