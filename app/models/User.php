<?php

require_once __DIR__ . '/../core/Model.php';

class User extends Model
{
 protected $table = 'users';
    protected $fillable = ['username', 'email', 'password_hash'];


        public function verify($email,$password){

        

        $sql= 'SELECT * FROM users WHERE (email=:email);';

        $params['email']=$email;

        $data=$this->query($sql,$params);
        
        if($data && password_verify($password, $data[0]['password_hash'])){

            return $data[0];
        }
        else{
            return false;
        }
            


    }
    
    
}