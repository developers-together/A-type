<?php

require_once __DIR__ . '/../core/Model.php';

class Typing extends Model{

    protected $table='typing_sessions';
    protected $fillable=['user_id','wpm','accuracy'];

}