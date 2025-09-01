<?php

class Model{

    protected $table;
    protected $fillable=[];
    // private $data=[];
    private $dbh;

    public function __construct(){

        include_once 'dbconnect.php';

        $this->dbh = new PDO(DB . ':host=' . DB_URL . ';dbname=' . DB_NAME, DB_USER, DB_PASS, array(
        PDO::ATTR_PERSISTENT => true
        ));

        // if(array_values($this->fillable)){
        //     $n = array_count_values($this->fillable);
        //     for($i=0;$i<$n;$i++){
        //         $data[$this->fillable[$i]]=null;
        //     }
        // }

    }
    public function insert($data){

        
        $fields = array_intersect(array_keys($data),$this->fillable);
        $placeholders = array_map(function($field) { return ':' . $field; }, $fields);

        $sql = "INSERT INTO {$this->table} (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ") ;";
        
        $stmt = $this->dbh->prepare($sql);
        
        // $sth = $this->dbh->query('');
        
        
        foreach ($fields as $field) {
            $stmt->bindValue(':' . $field, $data[$field]);
        }

      return  $stmt->execute();
    }

    public function update($id,$data){

        $fields= array_intersect(array_keys($data),$this->fillable);

        $placeholders= array_map(function ($field){return ':' . $field;},$fields);

        $x = array_map(function ($field,$placeholders){return $field . " = " . $placeholders;},$fields,$placeholders);

        $sql= "UPDATE {$this->table} SET " . implode(',',$x). " WHERE id=:id ;" ;

        $stmt = $this->dbh->prepare($sql);

        foreach($fields as $field){
            $stmt->bindValue(':'.$field,$data[$field]);
        }
        $stmt->bindValue(':id',$id);
       return $stmt->execute();
    }


    public function delete($id){

        $sql = "DELETE FROM {$this->table} WHERE id=:id ;";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(":id",$id);
       return $stmt->execute();


    }

        protected function query($sql)
    {
        $stmt = $this->dbh->prepare($sql);
        return $stmt->execute();
        
    }

    public function get($id){

        $sql= "SELECT * FROM {$this->table} WHERE id=:id ;";

        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(":id",$id);

        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);


    }

    public function get_all($limit){

        $sql="SELECT * FROM {$this->table} LIMIT :LIMIT ;";
        $stmt=$this->dbh->prepare($sql);
        $stmt->bindValue(":LIMIT",$limit,PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    }
}