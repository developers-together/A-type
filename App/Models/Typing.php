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
            MAX(wpm) AS best_wpm,
            MAX(accuracy) AS best_acc,
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

    public function getBestScores($user_id)
    {
        // Get best score (highest WPM) for each mode+amount combination
        // Using a simpler query that groups by mode and amount
        $sql = "SELECT t1.mode, t1.amount, t1.wpm, t1.accuracy
                FROM {$this->table} t1
                INNER JOIN (
                    SELECT mode, amount, MAX(wpm) as max_wpm
                    FROM {$this->table}
                    WHERE user_id = :user_id
                    GROUP BY mode, amount
                ) t2 ON t1.mode = t2.mode AND t1.amount = t2.amount AND t1.wpm = t2.max_wpm
                WHERE t1.user_id = :user_id2
                GROUP BY t1.mode, t1.amount;";

        $params = ['user_id' => $user_id, 'user_id2' => $user_id];

        $data = $this->query($sql, $params);

        return $data;
    }

    public function leaderboard($filter = 'all_time')
    {
        $dateCondition = "";
        if ($filter === 'daily') {
            $dateCondition = "AND session_at >= CURRENT_DATE()";
        }

        $sql = "SELECT t.wpm, t.accuracy, t.mode, t.session_at, users.username
                FROM {$this->table} t
                JOIN users ON t.user_id = users.id
                WHERE t.wpm = (
                    SELECT MAX(t2.wpm)
                    FROM {$this->table} t2
                    WHERE t2.user_id = t.user_id
                    AND t2.mode = :mode
                    AND t2.amount = :amount
                    {$dateCondition}
                )
                AND t.mode = :mode 
                AND t.amount = :amount
                {$dateCondition}
                GROUP BY t.user_id
                ORDER BY t.wpm DESC, t.accuracy DESC
                LIMIT 10";

         $data = ['time' => $this->query($sql, ['mode' => 'time','amount' => '15']),
             'words' => $this->query($sql, ['mode' => 'words','amount' => '15'])
            ];

            return $data;
    }
}
