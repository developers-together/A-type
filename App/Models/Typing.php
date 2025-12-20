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
            FROM {$this->table} 
            WHERE user_id = :user_id;";

        $params['user_id'] = $user_id;

        $data = $this->query($sql, $params);

        return $data;
    }

    public function totalTests($user_id)
    {

        $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id;";

        $params['user_id'] = $user_id;

        $data = $this->query($sql, $params);

        return $data;
    }

    public function leaderboard()
    {
         $sql = "SELECT wpm, accuracy, mode, session_at, users.username
            FROM {$this->table}
            JOIN users ON {$this->table}.user_id = users.id
            WHERE mode = :mode 
              AND amount = :amount
            ORDER BY wpm DESC, accuracy DESC
            LIMIT 10";



         $data = ['time' => $this->query($sql, ['mode' => 'time','amount' => '15']),
             'words' => $this->query($sql, ['mode' => 'words','amount' => '15'])
            ];


            return $data;
    }
}
