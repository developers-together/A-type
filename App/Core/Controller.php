<?php

namespace App\Core;

class Controller
{
    public function model($model)
    {
        $model = ('\\App\\Models\\') . $model;

        $model = new $model();

         return $model;
    }

    public function view($view, $data = [])
    {
        require_once '../App/Views/' . $view . '.php';
    }
}
