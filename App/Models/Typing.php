<?php

namespace App\Models;

use App\Core\Model;

// require_once __DIR__ . '/../core/Model.php';

class Typing extends Model
{
    protected $table = 'typing_sessions';
    protected $fillable = ['user_id', 'wpm', 'accuracy', 'punctuation', 'numbers', 'mode', 'amount'];

    public function avg($user_id)
    {



        $sql = "SELECT 
            AVG(accuracy) AS avg_acc, 
            AVG(wpm) AS avg_wpm,
            SUM(CASE WHEN mode = 'words' THEN 1 ELSE 0 END) AS total_words, 
            SUM(CASE WHEN mode = 'time' THEN 1 ELSE 0 END) AS total_time,
            COUNT(id) AS total_tests 
        FROM typing_sessions 
        WHERE user_id = :user_id;";

        $params['user_id'] = $user_id;

        $data = $this->query($sql, $params);

        return $data;
    }
}
