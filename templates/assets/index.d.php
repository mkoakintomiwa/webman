<?php

class File{

    /**
     * Basename of the uploaded file. e.g. MyFile.txt
     * @var String
     */
    public $name;


    /**
     * Mime type of file e.g. text/plain
     * @var String
     */
    public $type;


    /**
     * Relative path to where the file in temporarily stored. If path vanishes immediately after the execution of the script. e.g. /tmp/php/php1h4j1o
     * @var String
     */
    public $tmp_name;


    /**
     * Error code encountered during the uploading e.g. UPLOAD_ERR_OK  (= 0)
     * @var Int
     */
    public $error;

    /**
     * Size of the file (in bytes)
     *
     * @var [type]
     */
    public $size;
}




class log_dispute_options{
    /**
     * Subject of dispute
     *
     * @var String
     */
    public $subject;

    /**
     * Body of the dispute
     *
     * @var String
     */
    public $body;


    /**
     * uid of the user the logged the dispute
     *
     * @var Int
     */
    public $logged_by;


    /**
     * The role of receivers of the dispute
     *
     * @var String
     */
    public $against;

}



class User{
    public $uid;
    
    public $name;

    public $dp;

    public $phone_number;

    public $email;

    public $is_online;

    public $clearance;

    public $office_id;

    public $office;

    public $fcm_token; 
    
    public $clocked_in;

    public $clocked_out;

    public $salary;

    public $status;
}
?>