<?php

namespace App\Models;

use App\Core\Model;

class Word extends Model
{
    protected $table = 'words';

    public function words($amount)
    {

        $sql = 'SELECT word FROM words ORDER BY RAND() LIMIT :amount';
        $params['amount'] = $amount;

        $data = $this->query($sql, $params);

        return $data;
    }
}
