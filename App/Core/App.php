<?php

namespace App\Core;

class App
{
    protected $controller = 'App\\Controllers\\Home';
    protected $method = 'index';
    protected $params = [];


    public function __construct()
    {

        session_start();



        $url = $this->parseUrl();

        if (isset($url[0])) {
            $controller_name = '\\App\\Controllers\\' . ucfirst($url[0]);



            if (class_exists($controller_name)) {
                $this->controller = $controller_name;
                unset($url[0]);
            }
        }

            $this->controller = new $this->controller();

        if (isset($url[1])) {
            if (method_exists($this->controller, $url[1])) {
                $this->method = $url[1];
                unset($url[1]);
            }

            $this->params = $url ? array_values($url) : [];
        }
            call_user_func_array([$this->controller, $this->method], $this->params);




        //    echo $this->controller;
    }

    public function parseUrl()
    {

        if (isset($_GET['url'])) {
            return explode('/', filter_var(rtrim($_GET['url'], '/'), FILTER_SANITIZE_URL));
        } else {
            return ['Home','index'];
        }
    }
}
