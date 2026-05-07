<?php

namespace App\Core;

define("DB", "mysql");
define("DB_NAME", getenv('DB_NAME') ?: 'atype');
define("DB_USER", getenv('DB_USER') ?: 'root');
define("DB_PASS", getenv('DB_PASSWORD') ?: '');
define("DB_URL", getenv('DB_HOST') ?: 'mariadb');

class Model
{
    protected $table;
    protected $fillable = [];
    // private $data=[];
    private $dbh;

    public function __construct()
    {


        // include_once 'App/Core/dbconnect.php';

        $dsn = DB . ':host=' . DB_URL . ';dbname=' . DB_NAME;
        $options = array(
            \PDO::ATTR_PERSISTENT => true,
        );

        $lastException = null;
        for ($attempt = 1; $attempt <= 10; $attempt++) {
            try {
                $this->dbh = new \PDO($dsn, DB_USER, DB_PASS, $options);
                break;
            } catch (\PDOException $e) {
                $lastException = $e;
                usleep(300000);
            }
        }

        if (!$this->dbh && $lastException) {
            throw $lastException;
        }

        $this->dbh->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

        // if(array_values($this->fillable)){
        //     $n = array_count_values($this->fillable);
        //     for($i=0;$i<$n;$i++){
        //         $data[$this->fillable[$i]]=null;
        //     }
        // }
    }
    public function insert($data)
    {


        $fields = array_intersect(array_keys($data), $this->fillable);
        $placeholders = array_map(function ($field) {
            return ':' . $field;
        }, $fields);

        $sql = "INSERT INTO {$this->table} (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ") ;";

        $stmt = $this->dbh->prepare($sql);

        // $sth = $this->dbh->query('');


        foreach ($fields as $field) {
            $stmt->bindValue(':' . $field, $data[$field]);
        }

        if ($stmt->execute()) {
            return $this->dbh->lastInsertId();
        }
        return false;
    }

    public function update($id, $data)
    {

        $fields = array_intersect(array_keys($data), $this->fillable);

        $placeholders = array_map(function ($field) {
            return ':' . $field;
        }, $fields);

        $x = array_map(function ($field, $placeholders) {
            return $field . " = " . $placeholders;
        }, $fields, $placeholders);

        $sql = "UPDATE {$this->table} SET " . implode(',', $x) . " WHERE id=:id ;" ;

        $stmt = $this->dbh->prepare($sql);

        foreach ($fields as $field) {
            $stmt->bindValue(':' . $field, $data[$field]);
        }
        $stmt->bindValue(':id', $id);
        return $stmt->execute();
    }


    public function delete($id)
    {

        $sql = "DELETE FROM {$this->table} WHERE id=:id ;";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(":id", $id);
        return $stmt->execute();
    }

    public function query($sql, $params = [])
    {
        $stmt = $this->dbh->prepare($sql);
        $n = array_count_values($params);

        $placeholders = array_map(function ($param) {
            return ':' . $param;
        }, array_keys($params));

        foreach (array_keys($params) as $param) {
            $value = $params[$param];
            $type = is_int($value) ? \PDO::PARAM_INT : \PDO::PARAM_STR;
            $stmt->bindValue(':' . $param, $value, $type);
        }

        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function get($id)
    {

        $sql = "SELECT * FROM {$this->table} WHERE id=:id ;";

        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(":id", $id);

        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getAll($limit)
    {

        $sql = "SELECT * FROM {$this->table} LIMIT :LIMIT ;";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(":LIMIT", $limit, \PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
