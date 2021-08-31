<?php
@session_start();
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once "db.php";
include_once "variables.php";
include_once "phpmailer.php";
include_once "gmail/gmail.php";


/**
 * Potential information about user
 *
 * @param Int $uid
 * @return User
 */
function user($uid=null){
    global $default_user_dp,$offices;
    
    $user = [];

    if ($uid===null && !isset($_SESSION["uid"])){
        return (object)["is_online"=>false];
    }else{
        $user["is_online"] = true;
    }

    if (!$uid) $uid = $_SESSION["uid"];

    $info = db_fetch_one("SELECT * FROM users WHERE uid=?",[$uid]);

    $user["uid"] = $uid;
    $user["surname"] = $info["surname"];
    $user["first_name"] = $info["first_name"];
    $user["other_name"] = $info["other_name"];
    $user["name"] = $info["preferred_name"];
    $user["username"] = $info["username"];
    $user["address"] = $info["address"];
    $user["staff_id"] = $info["staff_id"];
    $user["date_of_birth"] = $info["date_of_birth"];
    $user["detailed_dob"] = date("F j, Y",$user["date_of_birth"]);
    $user["fcm_token"] = $info["fcm_token"];
    $user["clearance"] = $info["clearance"];
    $user["phone_number"] = $info["phone_number"];
    $user["bank_name"] = $info["bank_name"];
    $user["account_number"] = $info["account_number"];
    $user["email"] = $info["email"];
    $user["bvn"] = $info["bvn"];
    $user["office_id"] = $info["clearance"];
    $user["office"] = $offices[$info["clearance"]]["name"];
    $user["status"] = $info["status"];

    if ($info["profile_picture"]!=null && strlen(trim($info["profile_picture"]))>0){
        $dp_file = fs_blob("users","profile_picture",$info["profile_picture"]);
        if ($dp_file->exists()){
            $dp = $dp_file->url();
        }else{
            $dp = $default_user_dp;
        }
    }else{
        $dp = $default_user_dp;
    }

    $user["dp"] = $dp;


    $_v = db_fetch("SELECT * FROM attendance WHERE uid=? ORDER BY id DESC",[$uid]);

    if (count($_v)>0 && $_v[0]["time_out"]===null){
        $user["clocked_in"] = true;
        $user["clocked_out"] = false;
    }else{
        $user["clocked_in"] = false;
        $user["clocked_out"] = true;
    }

    $user["description"] = "$user[office] &bull; Staff ID: $user[staff_id]";


    $payroll = current_values::payroll();

    if (isset($payroll[$uid])) $user["salary"] = $payroll[$uid];
    
    return (object) $user;
}



function user_by($context,$value){
    $_user_ = db_fetch_one("SELECT * FROM users WHERE `$context`=?",[$value]);
    return user($_user_["uid"]);
}



function get_user_password_hash($uid=null){
    if (!$uid) $uid = $_SESSION["uid"];
    return db_fetch_one("SELECT * FROM users WHERE uid=?",[$uid])["password"];
}


function set_user_password($password,$uid=null){
    global $conn;
    if (!$uid) $uid = $_SESSION["uid"];
    $conn->prepare("UPDATE users SET password=? WHERE uid=?")->execute([hash_password($password),$uid]);
}



function set_user_dp($dp_file,$uid=null){

    if (!$uid) $uid = $_SESSION["uid"];

    $time = time();
    
    $valid_dp = $dp_file["size"]>0;

    $dp_blob = false;

    if ($valid_dp){

        $file_extension = file_extension($dp_file["name"]);

        $dp_blob = fs_blob("users","profile_picture",$uid,$time,$file_extension);

        $dp_dir = dirname($dp_blob->path);

        if (!file_exists($dp_dir)) mkdir($dp_dir,0777,true);

        $files_count = count(files_in_directory($dp_dir));

        $file_id = $files_count + 1;

        $dp_blob = fs_blob("users","profile_picture",$uid,"$file_id-$time",$file_extension);

        $dp_blob->save(file_get_contents($dp_file["tmp_name"]));

        row_action([
            "table_name"=>"users",
            "columns"=>[
                "uid"=>$uid
            ],
            "update"=>[
                "profile_picture"=>basename($dp_blob->path)
            ]
        ])->update();
    }

    return $dp_blob;
}


/**
 * Full associative array describing all members of an office with uids as keys and user information as values
 * 
 * 
 *
 * @param String $office
 * @return array
 */
function office_members($office_id){
    $members = [];

    $_members = db_fetch("SELECT * FROM users WHERE clearance=?",[$office_id]);

    foreach ($_members as $member){
        $members[$member["uid"]] = user($member["uid"]);
    }
    return $members;
}


function office_member_uids($office_id){
    $uids = [];

    $_members = db_fetch("SELECT * FROM users WHERE clearance=?",[$office_id]);

    foreach ($_members as $member){
        $uids[] = $member["uid"];
    }
    return $uids;
}



function minify_html($input) {
    if(trim($input) === "") return $input;
    // Remove extra white-space(s) between HTML attribute(s)
    $input = preg_replace_callback('#<([^\/\s<>!]+)(?:\s+([^<>]*?)\s*|\s*)(\/?)>#s', function($matches) {
        return '<' . $matches[1] . preg_replace('#([^\s=]+)(\=([\'"]?)(.*?)\3)?(\s+|$)#s', ' $1$2', $matches[2]) . $matches[3] . '>';
    }, str_replace("\r", "", $input));
    // Minify inline CSS declaration(s)
    if(strpos($input, ' style=') !== false) {
        $input = preg_replace_callback('#<([^<]+?)\s+style=([\'"])(.*?)\2(?=[\/\s>])#s', function($matches) {
            return '<' . $matches[1] . ' style=' . $matches[2] . minify_css($matches[3]) . $matches[2];
        }, $input);
    }
    if(strpos($input, '</style>') !== false) {
      $input = preg_replace_callback('#<style(.*?)>(.*?)</style>#is', function($matches) {
        return '<style' . $matches[1] .'>'. minify_css($matches[2]) . '</style>';
      }, $input);
    }
    if(strpos($input, '</script>') !== false) {
      $input = preg_replace_callback('#<script(.*?)>(.*?)</script>#is', function($matches) {
        return '<script' . $matches[1] .'>'. minify_js($matches[2]) . '</script>';
      }, $input);
    }
    return preg_replace(
        array(
            // t = text
            // o = tag open
            // c = tag close
            // Keep important white-space(s) after self-closing HTML tag(s)
            '#<(img|input)(>| .*?>)#s',
            // Remove a line break and two or more white-space(s) between tag(s)
            '#(<!--.*?-->)|(>)(?:\n*|\s{2,})(<)|^\s*|\s*$#s',
            '#(<!--.*?-->)|(?<!\>)\s+(<\/.*?>)|(<[^\/]*?>)\s+(?!\<)#s', // t+c || o+t
            '#(<!--.*?-->)|(<[^\/]*?>)\s+(<[^\/]*?>)|(<\/.*?>)\s+(<\/.*?>)#s', // o+o || c+c
            '#(<!--.*?-->)|(<\/.*?>)\s+(\s)(?!\<)|(?<!\>)\s+(\s)(<[^\/]*?\/?>)|(<[^\/]*?\/?>)\s+(\s)(?!\<)#s', // c+t || t+o || o+t -- separated by long white-space(s)
            '#(<!--.*?-->)|(<[^\/]*?>)\s+(<\/.*?>)#s', // empty tag
            '#<(img|input)(>| .*?>)<\/\1>#s', // reset previous fix
            '#(&nbsp;)&nbsp;(?![<\s])#', // clean up ...
            '#(?<=\>)(&nbsp;)(?=\<)#', // --ibid
            // Remove HTML comment(s) except IE comment(s)
            '#\s*<!--(?!\[if\s).*?-->\s*|(?<!\>)\n+(?=\<[^!])#s'
        ),
        array(
            '<$1$2</$1>',
            '$1$2$3',
            '$1$2$3',
            '$1$2$3$4$5',
            '$1$2$3$4$5$6$7',
            '$1$2$3',
            '<$1$2',
            '$1 ',
            '$1',
            ""
        ),
    $input);
}


function minify_css($input) {
    if(trim($input) === "") return $input;
    return preg_replace(
        array(
            // Remove comment(s)
            '#("(?:[^"\\\]++|\\\.)*+"|\'(?:[^\'\\\\]++|\\\.)*+\')|\/\*(?!\!)(?>.*?\*\/)|^\s*|\s*$#s',
            // Remove unused white-space(s)
            '#("(?:[^"\\\]++|\\\.)*+"|\'(?:[^\'\\\\]++|\\\.)*+\'|\/\*(?>.*?\*\/))|\s*+;\s*+(})\s*+|\s*+([*$~^|]?+=|[{};,>~+]|\s*+-(?![0-9\.])|!important\b)\s*+|([[(:])\s++|\s++([])])|\s++(:)\s*+(?!(?>[^{}"\']++|"(?:[^"\\\]++|\\\.)*+"|\'(?:[^\'\\\\]++|\\\.)*+\')*+{)|^\s++|\s++\z|(\s)\s+#si',
            // Replace `0(cm|em|ex|in|mm|pc|pt|px|vh|vw|%)` with `0`
            '#(?<=[\s:])(0)(cm|em|ex|in|mm|pc|pt|px|vh|vw|%)#si',
            // Replace `:0 0 0 0` with `:0`
            '#:(0\s+0|0\s+0\s+0\s+0)(?=[;\}]|\!important)#i',
            // Replace `background-position:0` with `background-position:0 0`
            '#(background-position):0(?=[;\}])#si',
            // Replace `0.6` with `.6`, but only when preceded by `:`, `,`, `-` or a white-space
            '#(?<=[\s:,\-])0+\.(\d+)#s',
            // Minify string value
            '#(\/\*(?>.*?\*\/))|(?<!content\:)([\'"])([a-z_][a-z0-9\-_]*?)\2(?=[\s\{\}\];,])#si',
            '#(\/\*(?>.*?\*\/))|(\burl\()([\'"])([^\s]+?)\3(\))#si',
            // Minify HEX color code
            '#(?<=[\s:,\-]\#)([a-f0-6]+)\1([a-f0-6]+)\2([a-f0-6]+)\3#i',
            // Replace `(border|outline):none` with `(border|outline):0`
            '#(?<=[\{;])(border|outline):none(?=[;\}\!])#',
            // Remove empty selector(s)
            '#(\/\*(?>.*?\*\/))|(^|[\{\}])(?:[^\s\{\}]+)\{\}#s'
        ),
        array(
            '$1',
            '$1$2$3$4$5$6$7',
            '$1',
            ':0',
            '$1:0 0',
            '.$1',
            '$1$3',
            '$1$2$4$5',
            '$1$2$3',
            '$1:0',
            '$1$2'
        ),
    $input);
}
// JavaScript Minifier
function minify_js($input) {
    if(trim($input) === "") return $input;
    return preg_replace(
        array(
            // Remove comment(s)
            '#\s*("(?:[^"\\\]++|\\\.)*+"|\'(?:[^\'\\\\]++|\\\.)*+\')\s*|\s*\/\*(?!\!|@cc_on)(?>[\s\S]*?\*\/)\s*|\s*(?<![\:\=])\/\/.*(?=[\n\r]|$)|^\s*|\s*$#',
            // Remove white-space(s) outside the string and regex
            '#("(?:[^"\\\]++|\\\.)*+"|\'(?:[^\'\\\\]++|\\\.)*+\'|\/\*(?>.*?\*\/)|\/(?!\/)[^\n\r]*?\/(?=[\s.,;]|[gimuy]|$))|\s*([!%&*\(\)\-=+\[\]\{\}|;:,.<>?\/])\s*#s',
            // Remove the last semicolon
            '#;+\}#',
            // Minify object attribute(s) except JSON attribute(s). From `{'foo':'bar'}` to `{foo:'bar'}`
            '#([\{,])([\'])(\d+|[a-z_][a-z0-9_]*)\2(?=\:)#i',
            // --ibid. From `foo['bar']` to `foo.bar`
            '#([a-z0-9_\)\]])\[([\'"])([a-z_][a-z0-9_]*)\2\]#i'
        ),
        array(
            '$1',
            '$1$2',
            '}',
            '$1$3',
            '$1.$3'
        ),
    $input);
}



function html_from_template($html_template,$variables_container=null,$minify=true){
    global $twig;
    $container = $variables_container?$variables_container:$GLOBALS;
    $r = $twig->createTemplate($html_template)->render($container);
    return $minify?minify_html($r):$r;
}


function log_out(){
    global $login_page;
    unset_user();
    header("Location: $login_page");
    die();
}


function unset_user(){
    if (isset($_COOKIE['accounts'])){
        $accounts = json_decode($_COOKIE['accounts'],true);
        
        foreach($accounts as $account_key=>$account_value){
            $accounts[$account_key]['status'] = 'inactive';
        }
        
        set_accounts_cookie($accounts);
    }
    unset($_SESSION['uid']);
}



function hash_password($password){
    global $password_hash_cost;
    return password_hash($password,PASSWORD_BCRYPT, ["cost" => $password_hash_cost]);
}


function no_user(){
    return !isset($_SESSION["uid"]);
}


function is_user(){
    return isset($_SESSION["uid"]);
}



function files_in_directory($directory){
    $files = [];
    foreach(glob($directory.'/*.*') as $file) {
        $files[] = basename($file);
    }
    return $files;
}


function fs_blob($table_name,$field_name,$insert_id,$file_name=null,$file_extension=null){
    return new fs_blob($table_name,$field_name,$insert_id,$file_name,$file_extension);
}


class fs_blob{
    public $table_name,$field_name,$insert_id,$path,$file_name=null,$file_extension=null;
    
    public function __construct($table_name,$field_name,$insert_id,$file_name=null,$file_extension=null){
        global $blobs_dir;

        $this->table_name = $table_name;
        $this->field_name = $field_name;
        $this->insert_id = $insert_id;
    
        if ($file_extension===null) $file_extension="";
        if ($file_name===null) $file_name="";

        if (strlen(trim($file_extension))>0){
            $file_extension = ".$file_extension";
        }
        if (strlen(trim($file_name))>0){
            $file_name = "-$file_name";
        }
        $this->file_name = $file_name;
        $this->file_extension = $file_extension;
        $this->path = $blobs_dir."/$table_name/$field_name/$insert_id$file_name$file_extension";
    }
    
    
    public static function placeholder(){
        return "fs_blob";
    }

    public function save($content){
        global $blobs_dir;
        $table_name = $this->table_name;
        $field_name = $this->field_name;
        $insert_id = $this->insert_id;
        $file_name = $this->file_name;
        $file_extension = $this->file_extension;

        $dir = $blobs_dir."/$table_name/$field_name";
        if (!file_exists($dir)){
            mkdir($dir,0777,true);
        }
        file_put_contents($dir."/$insert_id$file_name$file_extension",$content);
        return $this;
    }


    public function delete(){
        global $blobs_dir;
        $table_name = $this->table_name;
        $field_name = $this->field_name;
        $insert_id = $this->insert_id;
        $file_name = $this->file_name;
        $file_extension = $this->file_extension;

        $dir = $blobs_dir."/$table_name/$field_name";
        if (!file_exists($dir)){
            mkdir($dir,0777,true);
        }
        try{
            unlink($dir."/$insert_id$file_name$file_extension");
        }catch(Exception $e){}
        return $this;
    }


    public function exists(){
        return file_exists($this->path);
    }


    public function content(){
        return file_exists($this->path)?file_get_contents($this->path):null;
    }

    public function url(){
        global $host,$blobs_rel_dir;
        global $blobs_dir;
        $table_name = $this->table_name;
        $field_name = $this->field_name;
        $insert_id = $this->insert_id;
        $file_name = $this->file_name;
        $file_extension = $this->file_extension;
        
        return "$host$blobs_rel_dir/$table_name/$field_name/$insert_id".urldecode($file_name).$file_extension; 
    }
}



function last_insert_id($table_name,$id_column="id",$db_conn=null){
    global $conn;

    $db_conn = $db_conn!=null?$db_conn:$conn;

    $_id = $table_name==="users"?"uid":$id_column;
    $gs = db_fetch("SELECT $_id FROM `$table_name` ORDER BY $_id DESC",[],$db_conn);
    $id = count($gs)>0?(int)$gs[0][$_id]:0;
    return $id;
}



function file_extension($file_path){
    $ra = explode(".",$file_path);
    $file_extension = trim(array_pop($ra));
    return $file_extension;
}




class Dispute{
    /**
     * Log dispute
     *
     * @param log_dispute_options $log_dispute_options
     * @return String
     */
    public static function log($log_dispute_options){
        global $dispute_ticket_id_length;
        $ticket_id = unique_digits("disputes","ticket_id",$dispute_ticket_id_length);
        row_action([
            "table_name"=>"disputes",
            "columns"=>[
                "ticket_id"=>$ticket_id,
                "subject"=>$log_dispute_options->subject,
                "body"=>$log_dispute_options->body,
                "logged_by"=>$log_dispute_options->logged_by,
                "against"=>$log_dispute_options->against,
                "time"=>time()
            ]
        ])->insert();

        
        self::post($ticket_id,$log_dispute_options->body,$log_dispute_options->logged_by);

        return $ticket_id;
    }


    public static function post($ticket_id,$body,$posted_by){
    
        row_action([
            "table_name"=>"disputes_timeline",
            "columns"=>[
                "ticket_id"=>$ticket_id,
                "body"=>$body,
                "posted_by"=>$posted_by,
                "time"=>time()
            ]
        ])->insert();

        $poster = user($posted_by);
        $poster_office = $poster->office;

        $dispute = self::info($ticket_id);
        
        $office_members = office_members($dispute->against);

        $subject = "$dispute->subject #$ticket_id";
        $fcm_subject = "$poster->name ($poster_office) $subject";
        $sms_subject = "From $poster->name ($poster_office)\n$subject";
        
        $notification = new Notification();

        $notification
        ->set_sender($posted_by)
        ->set_sms_subject($sms_subject)
        ->set_fcm_subject($fcm_subject)
        ->set_email_subject("$dispute->subject #$ticket_id")
        ->set_notification_content($body)
        ->set_notification_context("dispute-$ticket_id");

        $notification_recipients = [];

        foreach ($office_members as $uid=>$_user){
            $notification_recipients[] = $uid;
        }

        $notification_recipients[] = $dispute->logged_by;

        foreach ($notification_recipients as $uid){
            
            $notification->add_recipient($uid);

            //if ($uid!=$posted_by){
            
            //}
        }

        $notification->send();

    }


    public static function info($ticket_id){
        return (object) db_fetch_one("SELECT * FROM disputes WHERE ticket_id=?",[$ticket_id]);
    }


    public static function status($ticket_id){
        return self::info($ticket_id)->status;
    }


    public static function timeline($ticket_id){
        return db_fetch("SELECT * FROM disputes_timeline WHERE ticket_id=? ORDER BY time",[$ticket_id]);
    }

    public static function is_closed($ticket_id){
        return self::status($ticket_id)==="closed";
    }

    public static function is_resolved($ticket_id){
        return self::status($ticket_id)==="resolved";
    }

    public static function is_open($ticket_id){
        return self::status($ticket_id)==="open";
    }


    public static function resolve($ticket_id,$resolved_by){
        global $conn;
        $conn->prepare("UPDATE disputes SET status=?,resolved_by=?,resolved_time=? WHERE ticket_id=?")->execute(["resolved",$resolved_by,time(),$ticket_id]);
    }

    public static function close($ticket_id,$closed_by){
        global $conn;
        $conn->prepare("UPDATE disputes SET status=?,closed_by=?,closed_time=? WHERE ticket_id=?")->execute(["closed",$closed_by,time(),$ticket_id]);
    }

    public static function pending($uid){
        $_user = user($uid);
        return db_fetch("SELECT * FROM disputes WHERE against=? AND status!=?",[$_user->clearance,"closed"]);
    }
}


class ebulksms{

    public $message;

    /**
     * JSON string representation of body of request
     *
     * @var String
     */
    private $data;


    public function __construct(){
        global $organization_name;
        $this->data =  [
            "SMS"=>[
                "auth"=>[
                    "username"=>"reports@groupfarma.com.ng",
                    "apikey"=>"bdd39aeb55b8fe701127588c47adfca17d0b14e8"
                ],
                "message"=>[
                    "sender"=>$organization_name,
                    "flash"=>"0"
                ],
                "recipients"=>[
                    "gsm"=>[]
                ],
                "dndsender"=>1
            ]
        ];
    }


    /**
     * Add recipient of SMS
     *
     * @param String $phone_number Full international phone number with country code - 234 should begin the phone number in the case of Nigeria
     * @param String $message_unique_id Unique ID to each message
     * @return void
     */
    public function add_recipient($phone_number,$message_unique_id){
        $data = $this->data;
        $data["SMS"]["recipients"]["gsm"][] = [
            "msidn"=>$phone_number,
            "msgid"=>$message_unique_id
        ];
        $this->data = $data;
    }
    

    public function send() {

        $url = "http://api.ebulksms.com:8080/sendsms.json";
        $_data = $this->data;
        $_data["SMS"]["message"]["messagetext"] = innertext($this->message);
        $data = json_encode($_data);
        $headers = [
            "Content-Type: application/json"
        ];

        $php_errormsg = '';
        if (is_array($data)) {
            $data = http_build_query($data, '', '&');
        }
        
        $params = array('http' => array(
            'method' => 'POST',
            'content' => $data
            )
        );

        if ($headers !== null) {
            $params['http']['header'] = $headers;
        }


        $ctx = stream_context_create($params);
        
        $fp = fopen($url, 'rb', false, $ctx);
        if (!$fp) {
            return "Error: gateway is inaccessible";
        }
        
        //stream_set_timeout($fp, 0, 250);
        try {
            $response = stream_get_contents($fp);
            if ($response === false) {
                throw new Exception("Problem reading data from $url, $php_errormsg");
            }
        } catch (Exception $e) {
            $response = $e->getMessage();
        }
        return $response;
    }
}


class fcm{

    private $recipients = [];
    public $message = "";
    public $title = "";
    public $image = "";

    public static function update_token($uid,$token){
        global $conn;
        $conn->prepare("UPDATE users SET fcm_token=? WHERE uid=?")->execute([$token,$uid]);
    }

    public static function nullify_token($uid){
        self::update_token($uid,null);
    }

    public function add_recipient($user_token){
        $this->recipients[] = $user_token;
    }

    public function send() {
        global $fcm_server_key;

        $message = $this->message;

        $url = 'https://fcm.googleapis.com/fcm/send';

        $fields = array (
                'registration_ids' => $this->recipients,
                "notification"=>[
                    "title"=>$this->title,
                    "text"=>innertext($message),
                    "click_action"=>"FLUTTER_NOTIFICATION_CLICK",
                    "image"=>$this->image
                ]
        );
        $fields = json_encode ( $fields );
    
        $headers = array (
                'Authorization: key=' . $fcm_server_key,
                'Content-Type: application/json'
        );
    
        $ch = curl_init ();
        curl_setopt ( $ch, CURLOPT_URL, $url );
        curl_setopt ( $ch, CURLOPT_POST, true );
        curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers );
        curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt ( $ch, CURLOPT_POSTFIELDS, $fields );
    
        $result = curl_exec ( $ch );
        //echo $result;
        curl_close ( $ch );
    }
}



function processed_link($link){
    global $script_links;
    $processed_link = $link;

    foreach($script_links as $key=>$value){
        $processed_link = str_replace("{".$key."}",$value,$processed_link);
    }
    return $processed_link;
}


function notification_link($n){
    global $rel_dirname;

    $processed_link = processed_link($n['notification_link']);
    
    if ($n['notification_context']==='official'){
        $link = $n['notification_link'];
    }else{
        $link = $rel_dirname.$processed_link;
    }

    return trim($link);
}



function time_difference($t){
    $tt=$t;
    $f=time()-$t;
    $dn = date("w",time());
    $dt=date("w",$tt);
    $yn=date("y",time());
    $yt=date("Y",time());
    
    if($f<=5){
        $s="just now";
        $s = "";
    }elseif(floor($f/60)<1){
        $s=floor($f). " seconds";
    }elseif(floor($f/60)===1){
        $s="1min";
    }elseif(floor($f/60)<60){
        $s=floor($f/60)."mins";
    }elseif(floor($f/3600)===1){
        $s="1hr";
    }elseif(($dn-$dt)==1 && $f<3600*7){
        $s="yesterday at ".date("g:ia",$t);
    }elseif(floor($f/3600)<24){
        $s=floor($f/3600)."hrs";
    }elseif(($dn-$dt)<6 && $f<3600*7){
        $s=date("A",$tt);
    }elseif(($yn-$yt)<1){
        $s=date("B",$tt)." ".date("d",$tt);
    }else{
        $s=date("B",$tt)." ".date("d",$tt).",".date("Y",time());
    }
    return $s;
}

function str_replace_from_array($array,$value){
    return str_replace(array_keys($array),array_values($array),$value);
}

function date_difference($timestamp1 , $timestamp2 , $differenceFormat = '%a' ){
    $datetime1 = (new DateTime())->setTimestamp((int)$timestamp1);
    $datetime2 = (new DateTime())->setTimestamp((int)$timestamp2);
   
    $interval = date_diff($datetime1, $datetime2);
    $value = $interval->format($differenceFormat); 
   
    switch($differenceFormat){
        case "%hhrs %imins":
            $value = str_replace_from_array([
                '1hrs'=>'1hr',
                ' 0mins'=>'',
                '0hrs '=>''
            ],$value);
    }

    return trim($value);
}


function camel($string){
    $ar=preg_split("/\s+/",$string);
    $ty=0;
    foreach ($ar as $ars){
     $ty=$ty+1;
     $out = "";
     if ($ty===1){
         $out=strtolower($ars);
     }else{
         $out.=ucfirst($ars);
     }
    }
    return $out;
}



function message_you_scheme($script=false,$message=false,$tt=false){
    if ($script){
        $m = nl2br($message);
        $tt = $tt!=null?time_difference($tt):"";
        $tt="";
    }else{
        $m="\${nl2br(editor.root.innerHTML)}";
        $tt = "";
    }

    return "
    <div class='message-wrapper you-wrapper'>
        <div class='you message'>
            $m
        </div>
        <div class='message-time'>".$tt."</div>
    </div>
    ";
}



function message_not_you_scheme($script=false,$message=false,$tt=false){
    global $user_to;

    if ($script){
        $m = nl2br($message);
        $tt = $tt!=null?time_difference($tt):"";
        $tt="";
    }else{
        $m="\${nl2br(\$('#message-box').val())}";
        $tt = "";
    }

    return "
    <div class='message-wrapper not-you-wrapper'>
        <div>
            <div class='not-you-with-image'>
                <!--
                <div>
                    <img class='not-you-image' src='$user_to->dp'>
                </div>
                -->

                <div class='not-you message'>
                    $m
                </div>
            </div>
            <div class='message-time'>
                <div>
                    ".$tt."
                </div>
            </div>
        </div>
    </div>
    ";

}



function upload_file_markup($iterator=1,$_options=[]){
    global $image_icon;

    $options = set_defaults([
        'icon'=>$image_icon
    ],$_options);

    $it = $iterator;

    return "
    
        <div class='file-upload centralize'>
            <div class='centralize'>
                <label for='file-$it' id='file-label-$it' class='file-label'>
                    <img src='$options->icon' class='file-label-image' id='file-label-image-$it'>
                </label>
                <input type='file' name='file_$it' id='file-$it' class='file display-none'/>
            </div>
        </div>
    ";
}
$upload_file_markup =  upload_file_markup();




function string_truncate($string, $your_desired_width) {
    $parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
    $parts_count = count($parts);
  
    $length = 0;
    $last_part = 0;
    for (; $last_part < $parts_count; ++$last_part) {
      $length += strlen($parts[$last_part]);
      if ($length > $your_desired_width) { break; }
    }
  
    return implode("",array_slice($parts, 0, $last_part));
}


/**
 * @example description
```
$notification = new Notification();
$notification
->set_sender($posted_by)
->set_sms_subject($sms_subject)
->set_fcm_subject($fcm_subject)
->set_email_subject("$dispute->subject #$ticket_id")
->set_notification_content($body)
->set_notification_context("dispute-$ticket_id");

foreach ($notification_recipients as $uid){
    $notification->add_recipient($uid);
}

$notification->send();
```
*/
class Notification{
    
    private $recipients = [];
    private $sender_uid;
    private $sms_subject = "";
    private $fcm_subject = "";
    private $email_subject = "";
    private $notification_content = "";
    private $notification_context = "";
    private $notification_link = "";


    public function add_recipient($recipient_uid){
        $this->recipients[] = $recipient_uid;
        return $this;
    }

    public function set_sender($sender_uid=null){
        global $user;
        if (!$sender_uid) $sender_uid = $user->uid;
        $this->sender_uid = $sender_uid;
        return $this;
    }


    public function set_sms_subject($sms_subject){
        $this->sms_subject = $sms_subject;
        return $this;
    }


    public function set_fcm_subject($fcm_subject){
        $this->fcm_subject = $fcm_subject;
        return $this;
    }


    public function set_email_subject($email_subject){
        $this->email_subject = $email_subject;
        return $this;
    }


    public function set_notification_content($notification_content){
        $this->notification_content = $notification_content;
        return $this;
    }


    public function set_notification_context($notification_context){
        $this->notification_context = $notification_context;
        return $this;
    }


    public function set_notification_link($notification_link){
        $this->notification_link = $notification_link;
        return $this;
    }

    
    public function send(){
        $notification_content = $this->notification_content;
        $plaintext_notification_content = innertext($notification_content);

        $sender = user($this->sender_uid);
        foreach ($this->recipients as $uid){
            (new row_action([
                'table_name'=>'notifications',
                'columns'=>[
                    'notification'=>$this->notification_content,
                    'notification_to'=>$uid, 
                    'notification_from'=>$this->sender_uid,
                    'notification_link'=>$this->notification_link,
                    'notification_context'=>$this->notification_context,
                    'read'=>'false'
                ],
                'update'=>[
                    'time'=>time()
                ]
            ]))->insert_once()->update();
        }


        $mail = phpmailer();
        $sms_subject = $this->sms_subject;
        $fcm_subject = $this->fcm_subject;
        $mail->Subject = $this->email_subject;
        $mail->Body    = "
        <div>
            <div style='font-size:20px;'>$notification_content</div>
        </div>
        ";
    
        $mail->AltBody = $plaintext_notification_content;

        $ebulksms = new ebulksms();
        $fcm = new fcm();
        $ebulksms->message = "$sms_subject\n\n$plaintext_notification_content";
        $fcm->title = $fcm_subject;
        $fcm->message = "$sms_subject\n\n$plaintext_notification_content";
        $fcm->image = $sender->dp;

        foreach ($this->recipients as $uid){
            $_user = user($uid);
            try{
                $mail->addAddress($_user->email);
            }catch(Exception $e){}
            $ebulksms->add_recipient($_user->phone_number,$uid);
            $fcm->add_recipient($_user->fcm_token);
        }
        

        try{
            $ebulksms->send();
        }catch(Exception $e){}
            
        try{
            $mail->send();
        }catch(Exception $e){}
            
        try{
            $fcm->send();
        }catch(Exception $e){}
    }


    public static function count_unread($uid=null){
        global $user;
        if (!$uid) $uid = $user->uid;  
        return count(db_fetch("SELECT * FROM notifications WHERE `notification_to`=? AND `read`!=?",[$uid,'true']));
    }


    public static function info($notification_id){
        return (object)db_fetch_one("SELECT * FROM notifications WHERE id=?",[$notification_id]);
    }



    public static function link($notification_id){
        global $rel_dirname;
        $info = self::info($notification_id);
        $track_id = explode("-",$info->notification_context)[1];

    
        if (str_contains($info->notification_context,"dispute")){
            $link = "$rel_dirname/roles/dispute-timeline.php?ticket-id=$track_id";
        
        }else if (str_contains($info->notification_context,"leave")){
            $link = "$rel_dirname/roles/approve-leave-request.php?leave-id=$track_id";

        }else if (str_contains($info->notification_context,"expense_request")){
            $link = "$rel_dirname/roles/expense-requests.php";

        }else if (str_contains($info->notification_context,"budget_proposals")){
            $link = "$rel_dirname/roles/approve-budget.php?proposed_budget_id=$track_id";

        }else if (str_contains($info->notification_context,"salary_requests-$track_id")){
            $link = "$rel_dirname/roles/approve-salary-payment.php?request_id=$track_id";

        } else if (str_contains($info->notification_context,"approve_expense_request-$track_id")){
            $link = "$rel_dirname/roles/approve-salary-payment.php?request_id=$track_id";

        } else if (str_contains($info->notification_context,"farm_report-$track_id")){
            $link = "$rel_dirname/roles/farm-report.php?frid=$track_id";
            
        }else if (str_contains($info->notification_context,"add_to_store-$track_id")){
            $link = "$rel_dirname/roles/add-to-store-request.php?rid=$track_id";
            
        }else if (str_contains($info->notification_context,"sell_product-$track_id")){
            $link = "$rel_dirname/roles/sold-product.php?rid=$track_id";
            
        } else {
            $link = $info->notification_link;
        }
        return $link;
    }


    public static function clear($context,$uid=null){
        global $conn;
        $user = user();
        if (!$uid) $uid = $user->uid;
        $conn->prepare("UPDATE notifications SET `read`=?,read_time=? WHERE notification_context=? AND notification_to=?")->execute(["true",time(),$context,$uid]);
    }

}



function str_contains($haystack,$needle){
    return strpos($haystack,$needle)!==false;
}



class Message{
    
    private $recipients = [];
    private $sender_uid;
    private $fcm_subject = "";
    private $message = "";


    public function add_recipient($recipient_uid){
        $this->recipients[] = $recipient_uid;
    }

    public function set_sender($sender_uid=null){
        global $user;
        if (!$sender_uid) $sender_uid = $user->uid;
        $this->sender_uid = $sender_uid;
        return $this;
    }


    public function set_fcm_subject($fcm_subject){
        $this->fcm_subject = $fcm_subject;
        return $this;
    }


    public function set_message($message){
        $this->message = $message;
        return $this;
    }


    
    public function send(){

        $sender = user($this->sender_uid);
        foreach ($this->recipients as $uid){
            (new row_action([
                'table_name'=>'messages',
                'columns'=>[
                    'to'=>$uid,
                    'from'=>$this->sender_uid,
                    'message'=>$this->message,
                    'time'=>time()
                ]
            ]))->insert();
        }


        $fcm_subject = $this->fcm_subject;

        $fcm = new fcm();
        $fcm->title = $fcm_subject;
        $fcm->image = $sender->dp;

        foreach ($this->recipients as $uid){
            $_user = user($uid);
            $fcm->add_recipient($_user->fcm_token);
        }
        
        $fcm->send();
    }


    public static function count_unread($uid=null){
        global $user;
        if(!$uid) $uid = $user->uid;
        return count(db_fetch("SELECT * FROM messages WHERE `to`=? AND `read`!=? GROUP BY `from`",[$uid,'true']));
    }


    public static function clear($recipient_uid,$sender_uid=null){
        global $conn,$user;
        if (!$sender_uid) $sender_uid = $user->uid;
        $conn->prepare("UPDATE messages SET `read`=? WHERE `from`=? AND `to`=?")->execute(["true",$recipient_uid,$sender_uid]);
    } 
}



function greet_by_day(){
    // 24-hour format of an hour without leading zeros (0 through 23)
    $Hour = date('G');

    if ( $Hour >= 5 && $Hour <= 11 ) {
        $greeting =  "Good morning";
    } else if ( $Hour >= 12 && $Hour <= 18 ) {
        $greeting = "Good afternoon";
    } else if ( $Hour >= 19 || $Hour <= 4 ) {
        $greeting = "Good evening";
    }
    return $greeting;
}



function staffs(){
    global $offices;

    $staffs = [];
    
    foreach ($offices as $office=>$office_properties){
        $staffs[$office] = [];    
    }
    
    foreach (db_fetch("SELECT * FROM users") as $user){
        if (in_array($user["clearance"],array_keys($staffs))){
            $staffs[$user["clearance"]][] = $user["uid"];
        }
    }


    foreach ($staffs as $office=>$staff_list){
        if (count($staff_list)===0){
            unset($staffs[$office]);
        }
    }
    return $staffs;
}


function detailed_staffs(){
    global $offices;
    $staffs = staffs();
    foreach($staffs as $office=>$staff_list){
        unset($staffs[$office]);
        foreach($staff_list as $uid){
            $staffs[$offices[$office]["name"]][$uid] = user($uid);
        }
    }
    return $staffs;
}


function staff_list(){
    $staff_list = [];

    foreach(staffs() as $office=>$staffs){
        foreach($staffs as $staff){
            $staff_list[] = $staff;
        }
    }
    return $staff_list;
}


function detailed_staff_list(){
    $accumulator = [];
    foreach (staff_list() as $uid){
        $accumulator[$uid] = user($uid);
    }
    return $accumulator;
}


function set_default($parameter,$value){
    return isset($parameter)?$parameter:$value;
}



if (!function_exists("set_defaults")){
    function set_defaults($defaults,$options=[]){
        foreach ($defaults as $property=>$value){
            if (!isset($options[$property])) $options[$property] = $value;
        }
        return (object)$options;
    }
}



function fs_link($random_id,$file_extension){
    return fs_blob("cache","upload-links",$random_id,null,$file_extension);
}


function innertext($html_string){
    global $assets;
    include_once $assets."/simple_html_dom.php";

    $html = str_get_html($html_string);

    return $html->plaintext;

}



function detailed_time($time){
    date_default_timezone_set('Africa/Lagos');
    return date("l, jS F,Y \a\\t g:ia",$time);
}

function outlined_time($time){
    date_default_timezone_set('Africa/Lagos');
    return date("l, jS F, Y - g:ia",$time);
}


function std_array($std_class){
    return json_decode(json_encode($std_class),true);
}





class Leave{
    private $requester_uid;
    private $reliever_staff_id;
    private $start_date;
    private $end_date;


    public function set_start_date($start_date){
        $this->start_date = $start_date;
        return $this;
    }


    public function set_end_date($end_date){
        $this->end_date = $end_date;
        return $this;
    }


    public function set_requester_uid($requester_uid){
        $this->requester_uid = $requester_uid;
        return $this;
    }

    public function set_reliever_staff_id($reliever_staff_id){
        $this->reliever_staff_id = $reliever_staff_id;
        return $this;
    }

    public function submit_request(){
        $request = row_action([
            "table_name"=>"leave_requests",
            "columns"=>[
                "start_date"=>strtotime($this->start_date),
                "end_date"=>strtotime($this->end_date),
                "requester_uid"=>$this->requester_uid,
                "status"=>"open"
            ],
            "update"=>[
                "reliever_staff_id"=>$this->reliever_staff_id,
                "request_time"=>time()
            ]
        ]);

        if (count($request->fetch())>0){
            return (object) [
                "error"=>"HAS_PENDING_REQUEST"
            ];
        }else{
            $id = last_insert_id("leave_requests") + 1;
            $request->add_column("id",$id)->insert()->update();

            $notification = new Notification();

            $requester = user($this->requester_uid);
            $reliever = user_by("staff_id",$this->reliever_staff_id);

            $notification
            ->set_sender($this->requester_uid)
            ->set_sms_subject("Leave request from $requester->name")
            ->set_fcm_subject("Leave request from $requester->name")
            ->set_email_subject("Leave request from $requester->name")
            ->set_notification_content("$requester->name request for leave and has choosen $reliever->name has reliever")
            ->set_notification_context("leave_request-$id");

            foreach (array_keys(office_members("HR")) as $uid) {
                $notification->add_recipient($uid);
            }

            $notification->send();
            

            return (object)[
                "error"=>null
            ];
        }
    }

    public static function has_pending_request($uid=null){
        global $user;
        if (!$uid) $uid = $user->uid;
        return count(db_fetch("SELECT * FROM leave_requests WHERE requester_uid=? AND status=?",[$uid,"open"]))>0;
    }


    public static function pending_requests(){
        $pending_requests = db_fetch("SELECT * FROM leave_requests WHERE status=? ORDER BY request_time DESC",["open"]);

        $requests = [];
        foreach ($pending_requests as $request){
            $requests[] = self::request($request["id"]);
        }
        return $requests;
    }

    public static function request($leave_id){
        $request = db_fetch_one("SELECT * FROM leave_requests WHERE id=?",[$leave_id]);

        $request["detailed_request_time"] = detailed_time($request["request_time"]);
        $request["detailed_response_time"] = detailed_time($request["response_time"]);
        $request["detailed_start_date"] =  date("F j, Y",$request["start_date"]);
        $request["detailed_end_date"] =  date("F j, Y",$request["end_date"]);
        $request["requester"] = user($request["requester_uid"]);
        $request["responder"] = user($request["responder_uid"]);
        $request["reliever"] = user_by("staff_id",$request["reliever_staff_id"]);
        return (object) $request;
    }


    public static function respond($leave_id,$action,$responder_uid=null){
        global $conn,$user;
        if (!$responder_uid) $responder_uid = $user->uid;

        $conn->prepare("UPDATE leave_requests SET status=?,response_time=?,responder_uid=? WHERE id=?")->execute([$action,time(),$responder_uid,$leave_id]);

        $notification = new Notification();

        $request = self::request($leave_id);

        $notification
        ->set_sender($request->responder_uid)
        ->set_sms_subject("Your leave request has been $action")
        ->set_fcm_subject("Your leave request has been $action")
        ->set_email_subject("Your leave request has been $action")
        ->set_notification_content("Your request for leave made $request->detailed_request_time has been $action by {$request->responder->name} on the $request->detailed_response_time")
        ->set_notification_context("approve_leave_request-$leave_id")
        ->add_recipient($request->requester_uid)
        ->send();


    }


    public static function approve($leave_id,$responder_uid=null){
        self::respond($leave_id,"approved",$responder_uid);
    }


    public static function reject($leave_id,$responder_uid=null){
        self::respond($leave_id,"rejected",$responder_uid);
    }
    
}





class Expense{
    public $requester_uid;
    public $content;
    public $items;

    public function set_requester_uid($requester_uid){
        $this->requester_uid = $requester_uid;
        return $this;
    }

    public function set_content($content){
        $this->content = $content;
        return $this;
    }

    public function set_items($items){
        $this->items = $items;
        return $this;
    }

    public function submit_request(){
        $id = last_insert_id("expense_requests") + 1;

        $request_time = time();

        $request = row_action([
            'table_name'=>'expense_requests',
            'columns'=>[
                'id'=>$id,
                'fiscal_year'=>current_values::fiscal_year(),
                'requester_uid'=>$this->requester_uid,
                'content'=>$this->content,
                'items'=>json_encode($this->items),
                'time'=>$request_time
            ]
        ]);

        $request->insert();

        $notification = new Notification();

        $requester = user($this->requester_uid);

        $notification
        ->set_sender($this->requester_uid)
        ->set_sms_subject("$requester->name ($requester->office)")
        ->set_fcm_subject("$requester->name ($requester->office) sent an expense request")
        ->set_email_subject("$requester->name ($requester->office) sent an expense request")
        ->set_notification_content("$requester->name of the $requester->office sent an expense request ".detailed_time($request_time))
        ->set_notification_context("expense_request");

        $_office_members = array_merge(array_keys(office_members("finance_department")),array_keys(office_members("CEO")),array_keys(office_members("operation_head")));

        foreach ($_office_members as $uid) {
            $notification->add_recipient($uid);
        }

        $notification->send();

    }


    public static function request($expense_id){
        $request = db_fetch_one("SELECT * FROM expense_requests WHERE id=?",[$expense_id]);

        $request["items"] = json_decode($request["items"],true);
        $request["total_amount"] = total_amount_by_items($request["items"]);
        $request["formatted_total_amount"] = number_format($request["total_amount"]);
        $request["detailed_request_time"] = detailed_time($request["time"]);
        $request["detailed_response_time"] = detailed_time($request["response_time"]);
        $request["requester"] = user($request["requester_uid"]);
        $request["responder"] = user($request["responder_uid"]);
        $request["is_approved"] = $request["status"]==="approved";
        $request["is_declined"] = $request["status"]==="declined";
        return (object) $request;
    }



    public static function requests(){
        $_requests = db_fetch("SELECT * FROM expense_requests ORDER BY time DESC");

        $requests = [];
        foreach ($_requests as $request){
            $requests[] = self::request($request["id"]);
        }
        return $requests;
    }



    public static function respond($expense_id,$response,$responder_uid=null){
        global $conn,$user;
        if (!$responder_uid) $responder_uid = $user->uid;

        $conn->prepare("UPDATE expense_requests SET status=?,response_time=?,responder_uid=? WHERE id=?")->execute([$response,time(),$responder_uid,$expense_id]);

        $notification = new Notification();

        $request = self::request($expense_id);

        if ($response==="approved"){

            $expenditure = new Expenditure();
            $expenditure
            ->set_fiscal_year($request->fiscal_year)
            ->set_track_id($expense_id)
            ->set_amount($request->total_amount)
            ->add_expense();
        }

        $notification
        ->set_sender($request->responder_uid)
        ->set_sms_subject("Your exepense request has been $response")
        ->set_fcm_subject("Your expense request has been $response")
        ->set_email_subject("Your expense request has been $response")
        ->set_notification_content("The expense request you made on $request->detailed_request_time has been $response by {$request->responder->name} on the $request->detailed_response_time")
        ->set_notification_context("expense_request")
        ->add_recipient($request->requester_uid)
        ->send();


    }


    public static function approve($expense_id,$responder_uid=null){
        self::respond($expense_id,"approved",$responder_uid);
    }


    public static function decline($expense_id,$responder_uid=null){
        self::respond($expense_id,"declined",$responder_uid);
    }
}



function add_dialog_item($it,$item,$options=[
    'go_up'=>false
]){
    return "
    <div class='add-dialog-item'>
        <div class='add-dialog-item-content'>
            <div class='iterator'>
                <div>$it.</div>
                ".($options['go_up']?"<div style='width:100%;text-align:center;'>Click to go up</div>":"")."
            </div>
            <div class='add-dialog-item-name'>$item</div>
        </div>
        <div class='add-dialog-remove-wrapper'>
            <div class='add-dialog-remove' data-toggle='notice'><i class='fa fa-times'></i></div>
        </div>
    </div>
    ";
}



function js_escape($content){
    return minify_html($content);
}



function total_amount_by_items($items_array){
    $total = 0;

    foreach ($items_array as $_amount){    
        $total += (int) preg_replace("/,/","",$_amount);
    }
    return $total;
}



class Budget{
    public $poster_uid;
    public $budget_items;

    public function set_poster_uid($poster_uid){
        $this->poster_uid = $poster_uid;
        return $this;
    }


    public function set_budget_items($budget_items){
        $this->budget_items = $budget_items;
        return $this;
    }

    public function submit(){
        $id = last_insert_id("budget_proposals") + 1;
        $time = time();
        $detailed_time = detailed_time($time);
        row_action([
            'table_name'=>'budget_proposals',
            'columns'=>[
                'id'=>$id,
                'fiscal_year'=>current_values::fiscal_year(),
                'poster_uid'=>$this->poster_uid,
                'budget_items'=>json_encode($this->budget_items),
                'time'=>$time
            ]
        ])->insert();

        $poster = user($this->poster_uid);
        $notification = new Notification();
        $notification
        ->set_sender($this->poster_uid)
        ->set_sms_subject("Budget proposal by $poster->name ($poster->office)")
        ->set_fcm_subject("Budget proposal by $poster->name ($poster->office)")
        ->set_email_subject("Budget proposal by $poster->name ($poster->office)")
        ->set_notification_content("A new budget proposal awaits your approval. Sent by $poster->name ($poster->office) on $detailed_time")
        ->set_notification_context("budget_proposals-$id");

        foreach (array_keys(office_members("CEO")) as $uid) {
            $notification->add_recipient($uid);
        }
        $notification->send();
    }



    public static function proposed_budget($proposed_budget_id){
        $proposal = db_fetch_one("SELECT * FROM budget_proposals WHERE id=?",[$proposed_budget_id]);

        $proposal["poster"] = user($proposal["poster_uid"]);
        $proposal["responder"] = user($proposal["responder_uid"]);
        $proposal["detailed_time"] = detailed_time($proposal["time"]);
        $proposal["detailed_response_time"] = detailed_time($proposal["response_time"]);
        $proposal["budget_items"] = json_decode($proposal["budget_items"],true);
        $proposal["total_amount"] = self::total_amount_by_items($proposal["budget_items"]);
        $proposal["formatted_total_amount"] = number_format($proposal["total_amount"]);
        $proposal["is_approved"] = $proposal["status"]==="approved";
        $proposal["is_declined"] = $proposal["status"]==="declined";

        return (object) $proposal;
    }


    public static function proposed_budgets($fiscal_year){
        $_proposals = db_fetch("SELECT * FROM budget_proposals WHERE fiscal_year=? ORDER BY time DESC",[$fiscal_year]);

        $proposals = [];
        foreach ($_proposals as $proposal){
            $proposals[] = self::proposed_budget($proposal["id"]); 
        }

        return $proposals;
    }


    private static function total_amount_by_items($budget_items){
        return total_amount_by_items(array_values($budget_items));
    }


    public static function respond_to_proposal($response,$proposed_budget_id,$uid){
        global $conn;
        $proposed_budget = self::proposed_budget($proposed_budget_id);
        $conn->prepare("UPDATE budget_proposals SET status=?,responder_uid=?,response_time=? WHERE id=?")->execute([$response, $uid, time(),$proposed_budget_id]);

        $notification = new Notification();
        
        $notification
            ->set_sender($uid)
            ->set_sms_subject("Budget proposal $response")
            ->set_fcm_subject("Budget proposal $response")
            ->set_email_subject("Budget proposal $response")
            ->set_notification_content("The budget proposal submitted $proposed_budget->detailed_time was $response.")
            ->set_notification_context("budget_proposals-$proposed_budget_id");

        foreach (office_member_uids(user($proposed_budget->poster_uid)->office_id) as $uid) {
            $notification->add_recipient($uid);
        }

        $notification->send();
    }


    public static function approve_proposed_budget($proposed_budget_id,$uid){
        $proposed_budget = self::proposed_budget($proposed_budget_id);
        $id = last_insert_id("budgets") + 1;
        $time = time();
        row_action([
            "table_name"=>"budgets",
            "columns"=>[
                "id"=>$id,
                "proposed_budget_id"=>$proposed_budget_id,
                "fiscal_year"=>current_values::fiscal_year(),
                "budget_items"=>json_encode($proposed_budget->budget_items),
                "time"=>$time
            ]
        ])->insert();
        
        self::respond_to_proposal("approved",$proposed_budget_id,$uid);

    }


    public static function decline_proposed_budget($proposed_budget_id,$uid){
        self::respond_to_proposal("declined",$proposed_budget_id,$uid);
    }


    public static function isset($fiscal_year=null){
        if (!$fiscal_year) $fiscal_year = current_values::fiscal_year();
        return count(db_fetch("SELECT * FROM budgets WHERE fiscal_year=?",[$fiscal_year]))>0;
    }


    public static function _budget($fiscal_year=null){
        if (!$fiscal_year) $fiscal_year = current_values::fiscal_year();
        $budget = db_fetch_one("SELECT * FROM budgets WHERE fiscal_year=?",[$fiscal_year]);

        $budget["proposed"] = self::proposed_budget($budget["proposed_budget_id"]);
        $budget["detailed_time"] = detailed_time($budget["time"]);
        $budget["budget_items"] = json_decode($budget["budget_items"],true);
        $budget["total_amount"] = self::total_amount_by_items($budget["budget_items"]);
        $budget["formatted_total_amount"] = number_format($budget["total_amount"]);

        return (object) $budget;
    }


    public static function budgets(){
        $_budgets = db_fetch("SELECT * FROM budget_proposals ORDER BY time DESC");

        $budgets = [];
        foreach ($_budgets as $budget){
            $budgets[] = self::_budget($budget["id"]); 
        }

        return $budgets;
    }



    public static function total_amount($fiscal_year=null){
        return self::_budget($fiscal_year)->total_amount;
    }


    public static function formatted_total_amount($fiscal_year){
        return number_format(self::total_amount($fiscal_year));
    }


    public static function balance($fiscal_year=null){
        return self::total_amount($fiscal_year) - Expenditure::total_amount();
    }


    public static function formatted_balance($fiscal_year=null){
        return number_format(self::balance($fiscal_year));
    }


    public static function percentage_expended($fiscal_year=null){
        return round(Expenditure::total_amount()/self::total_amount()*100,2);
    }

}



class Salary{


    public static function submit($poster_uid,$month){
        $poster = user($poster_uid);
        $time = time();
        $detailed_time = detailed_time($time);
        $id = last_insert_id("salary_requests") + 1;
        row_action([
            'table_name'=>'salary_requests',
            'columns'=>[
                'id'=>$id,
                'fiscal_year'=>current_values::fiscal_year(),
                'month'=>$month,
                'poster_uid'=>$poster_uid,
                'payroll'=>json_encode(current_values::payroll()),
                'time'=>$time
            ]
        ])->insert();
        
        $notification = new Notification();
        $notification
            ->set_sender($poster_uid)
            ->set_sms_subject("Salary payment await your approval")
            ->set_fcm_subject("Salary payment await your approval")
            ->set_email_subject("Salary payment await your approval")
            ->set_notification_content("Salary payment for the month $month was inittiated by $poster->name ($poster->office) at $detailed_time")
            ->set_notification_context("salary_requests-$id");

        foreach (office_member_uids("CEO") as $uid) {
            $notification->add_recipient($uid);
        }

        $notification->send();

    }


    public static function payment_request($request_id){
        $payment_request = db_fetch_one("SELECT * FROM salary_requests WHERE id=?",[$request_id]);

        $payment_request["poster"] = user($payment_request["poster_uid"]);
        $payment_request["detailed_time"] = detailed_time($payment_request["time"]);
        $payment_request["payroll"] = json_decode($payment_request["payroll"],true);
        $payment_request["total_amount"] = total_amount_by_items($payment_request["payroll"]);
        $payment_request["formatted_total_amount"] = number_format($payment_request["total_amount"]);
        $payment_request["is_appproved"] = $payment_request["status"]==="approved";
        $payment_request["is_declined"] = $payment_request["status"]==="declined";

        $payment_request["detailed_payroll"] = [];

        foreach($payment_request["payroll"] as $uid=>$amount){
            $payment_request["detailed_payroll"][$uid] = [
                'user'=>user($uid),
                'amount'=>$amount
            ];
        }

        return (object) $payment_request;
    }



    public static function payment_requests(){
        $payment_requests = db_fetch("SELECT * FROM salary_requests ORDER BY time DESC");

        $accumulator = [];

        foreach ($payment_requests as $request){
            $accumulator[] = self::payment_request($request["id"]);
        }
        return $accumulator;
    }



    private static function respond_to_payment_request($request_id,$response){
        $time = time();
        
        $payment_request = self::payment_request($request_id);
            
        $detailed_time = detailed_time($time);
        row_action([
            'table_name'=>'salary_requests',
            'columns'=>[
                'id'=>$request_id,
            ],
            'update'=>[
                'status'=> $response,
                'response_time'=> $time,
                'responder_uid'=>user()->uid
            ]
        ])->update();


        if ($response==="approved"){
            $id = last_insert_id("salary_payments") + 1;
            row_action([
                'table_name'=>'salary_payments',
                'columns'=>[
                    'id'=>$id,
                    'request_id'=>$request_id,
                    'fiscal_year'=>$payment_request->fiscal_year,
                    'month'=>$payment_request->month,
                    'payroll'=> json_encode($payment_request->payroll,true),
                    'time'=>$time
                ]
            ])->insert();

            $expenditure = new Expenditure();
            $expenditure
            ->set_fiscal_year($payment_request->fiscal_year)
            ->set_track_id($id)
            ->set_amount($payment_request->total_amount)
            ->add_salary();

        }


        $notification = new Notification();
        $notification
            ->set_sender(user()->uid)
            ->set_sms_subject("Request for salary payment $response")
            ->set_fcm_subject("Request for salary payment $response")
            ->set_email_subject("Request for salary payment $response")
            ->set_notification_content("The request for salary payment for the month $payment_request->month has been $response")
            ->set_notification_context("approve_salary_payment-$request_id");

        foreach (office_member_uids(user($payment_request->poster_uid)->office_id) as $uid) {
            $notification->add_recipient($uid);
        }

        $notification->send();
        
    }


    public static function approve($request_id){
        self::respond_to_payment_request($request_id,"approved");
    }

    public static function decline($request_id){
        self::respond_to_payment_request($request_id,"declined");
    }


    public static function isset($fiscal_year,$month){
        return count(db_fetch("SELECT * FROM salary_payments WHERE fiscal_year=? AND month=?",[$fiscal_year,$month]))>0;
    }
}



/**
 * @example description
```
$expenditure = new Expenditure();
$expenditure
    ->set_context($context)
    ->set_track_id($track_id)
    ->set_amount($amount)
```
*/
class Expenditure{
    public $fiscal_year,$context,$track_id,$amount;

    public function set_fiscal_year($fiscal_year){
        $this->fiscal_year = $fiscal_year;
        return $this;
    }

    public function set_context($context){
        $this->context = $context;
        return $this;
    }


    public function set_track_id($track_id){
        $this->track_id = $track_id;
        return $this;
    }


    public function set_amount($amount){
        $this->amount = $amount;
        return $this;
    }

    private function add(){
        row_action([
            'table_name'=>'expenditure',
            'columns'=>[
                'fiscal_year'=>$this->fiscal_year,
                'context'=>$this->context,
                'track_id'=>$this->track_id,
                'amount'=> $this->amount,
                'time'=>time()
            ]
        ])->insert();
        return $this;
    }


    public function add_salary(){
        $this->set_context("salary_payments")->add();
    }

    public function add_expense(){
        $this->set_context("expense")->add();
    }


    public static function total_amount($fiscal_year=null){
        if (!$fiscal_year) $fiscal_year = current_values::fiscal_year();
        return db_fetch_one("SELECT SUM(`amount`) AS total FROM expenditure WHERE fiscal_year=?",[$fiscal_year])["total"];
    }

    public static function formatted_total_amount($fiscal_year=null){
        return number_format(self::total_amount($fiscal_year));
    }

    public static function timeline($fiscal_year=null){
        global $rel_dirname,$expenditure_contexts;
        if (!$fiscal_year) $fiscal_year = current_values::fiscal_year();
        $timeline = db_fetch("SELECT * FROM expenditure WHERE fiscal_year=? ORDER BY time DESC",[$fiscal_year]);

        foreach ($timeline as $index => $_expenditure){
            $timeline[$index]['detailed_time'] = date("M j, g:ia",$_expenditure["time"]);
            $timeline[$index]['formatted_amount'] = number_format($_expenditure["amount"]);
            $timeline[$index]["detailed_context"] = $expenditure_contexts[$_expenditure["context"]];

            $track_id = $_expenditure["track_id"];
            $link = "";
            switch($_expenditure["context"]){
                case "salary_payments":
                    $link = "$rel_dirname/roles/approve-salary-payment.php?request_id=$track_id";
                break;

                case "expense":
                    $link = "$rel_dirname/roles/approve-expense-request.php?expense_id=$track_id";
                break;
            }
            $timeline[$index]['link'] = $link;
        }
        return $timeline;
    }
}



class current_values{
    
    public static function set($variable_name,$variable_value){
        row_action([
            'table_name'=>'current_values',
            'columns'=>[
                'name'=>$variable_name
            ],
            'update'=>[
                'value'=>$variable_value,
                'time'=>time()
            ]
        ])->insert_once()->update();
    }
    
    public static function get($variable_name){
        $rs = db_fetch("SELECT * FROM current_values WHERE name=?",[$variable_name]);

        if (count($rs)===0){
            $value = null;
        }else{
            $value = $rs[0]["value"];
        }
        
        return $value;
    }

    public static function set_fiscal_year($fiscal_year){
        self::set("fiscal_year",$fiscal_year);
    }

    public static function fiscal_year(){
        return self::get("fiscal_year");
    }


    public static function set_payroll($payroll){
        self::set("payroll",json_encode($payroll));
    } 

    public static function payroll(){
        return json_decode(self::get("payroll"),true);
    }

    public static function payroll_cost(){
        return total_amount_by_items(self::payroll());
    }

    public static function set_assets_location($assets_location){
        self::set("assets_location",json_encode($assets_location));
    }

    public static function assets_location(){
        $assets_location = self::get("assets_location");
        return $assets_location?json_decode($assets_location,true):[];
    }
}




function months($month_format="F"){
    $months =  [];
    for ($i = 0; $i < 12; $i++) {
        $timestamp = mktime(0, 0, 0, date('n') - $i, 1);
        $months[date('n', $timestamp)] = date($month_format, $timestamp);
    }
    ksort($months,SORT_NUMERIC);
    return $months;
}



function html_selected($selected_option, $html_select_attributes, $options_and_values_array, $has_placeholder=true){
    $c = count($options_and_values_array);
    if ($has_placeholder){
        $options_and_values_array = [""=>"-Select-"]+$options_and_values_array;
        $c--;
    }
    
    if ($c===0){
        return "";
    }
    
    $select="<select $html_select_attributes>";
    foreach ($options_and_values_array as $k=>$v){
        if ((string)$k===(string)$selected_option){
            $f = "selected";
        }else{
            $f = "";
        }
        if (strpos($k,'"') !==-1){
            $dl = "'";
        }else{
            $dl = '"';
        }
        $select.="<option value=$dl".$k."$dl $f>$v</option>";    
    }
    $select.="</select>";
    
    return $select;
}



/**
 * Apply callable function to all member of an associative array
 *
 * @param array $array
 * @param function $callable ($key,$value,$array)
 * @return array The newly formed array
 */
function array_apply($array,$callable){
    foreach ($array as $key=>$value){
        $array = call_user_func_array($callable,[$key,$value,$array]);
    }
    return $array;
}


function array_columns($array){
    $_array = [];

    foreach($array as $k=>$v){
        foreach($v as $a=>$b)
        $_array[$a] = $b;
    }
    
    return $_array;
}


function array_populate($element,$duplicate_count){
    $_ = [];

    for ($i=0;$i<$duplicate_count;$i++){
        $_[$i] = $element;
    }
    return $_;
}


function array_equate($array,$equal_to){
    return array_combine($array,array_populate($equal_to,count($array)));
}


function array_multiply($a){
    return array_combine($a,$a);
}


function base64_arg($argument){
    return base64_encode(json_encode($argument));
}



class farm_report{
    public static function report($farm_report_id){
        $reports = db_fetch("SELECT * FROM farm_reports WHERE report_id=?",[$farm_report_id]);

        $report = $reports[0];
        $report["reporter"] = user($report["reporter_uid"]);
        $report["prelude"] = json_decode($report["report"]);
        $report["detailed_time"] = detailed_time($report["time"]);

        foreach($reports as $_report){
            $report["data"][] = json_decode($_report["report"]); 
        }

        return (object)$report;
    }


    public static function reports(){
        $accumulator = [];
        foreach (db_fetch("SELECT * FROM farm_reports GROUP BY report_id ORDER BY report_id DESC LIMIT 100") as $_report){
            $accumulator[] = self::report($_report["report_id"]);
        }
        return $accumulator;
    }
}



class Store{
    public $added_by_uid,$responder_uid,$item_names,$quantities,$costs;

    public static function items(){
        $store_items = current_values::get("store_items");
        return $store_items?json_decode($store_items,true):[];
    }

    public static function _items($item_type){
        $store_items = self::items();
        $items = [];

        foreach($store_items as $item_name=>$item){
            if ($item["type"]===$item_type){
                $items[] = $item_name;
            }
        }
        return $items;
    }


    public static function sales_items(){
        return self::_items("Sales");
    }


    public static function farm_items(){
        return self::_items("Farm");
    }


    public static function item($item_name){
        return self::items()[$item_name];
    }


    public static function item_names(){
        return array_keys(self::items());
    }

    public function add_to_store_request(){
        $time = time();
        $rid = last_insert_id("store_listing","rid") + 1;

        for ($i=0;$i<count($this->item_names);$i++){
            $item_name = $this->item_names[$i];
            $quantity = strtonumber($this->quantities[$i]);
            $cost = strtonumber($this->costs[$i]);
            
            row_action([
                "table_name"=>"store_listing",
                "columns"=>[
                    "rid"=>$rid,
                    "item_name"=>$item_name,
                    "quantity"=>$quantity,
                    "cost"=>$cost,
                    "added_by_uid"=>$this->added_by_uid,
                    "time"=>$time
                ]
            ])->insert();
        }

        $added_by = user($this->added_by_uid);

        $notification = new Notification();

        $notification
            ->set_sender($this->added_by_uid)
            ->set_sms_subject("Request to add to stock")
            ->set_fcm_subject("Request to add to stock")
            ->set_email_subject("Request to add to stock")
            ->set_notification_content("$added_by->name ($added_by->office) request to add some items to the stock")
            ->set_notification_context("add_to_store-$rid");

        foreach (office_member_uids("operation_head") as $uid) {
            $notification->add_recipient($uid);
        }

        $notification->send();

    }


    public static function list($rid){
        $store_list = [];
        $list = db_fetch("SELECT * FROM store_listing WHERE rid=?",[$rid]);

        $_list = $list[0];
        $store_list["added_by_uid"] = $_list["added_by_uid"];
        $store_list["added_by"] = user($_list["added_by_uid"]);
        $store_list["responder_uid"] = $_list["responder_uid"];
        $store_list["responder"] = user($_list["responder_uid"]);
        $store_list["status"] = $_list["status"];
        $store_list["is_approved"] = $_list["status"] === "Approved";
        $store_list["is_declined"] = $_list["status"] === "Declined";
        $store_list["is_resolved"] = $store_list["is_approved"] || $store_list["is_declined"];
        $store_list["detailed_time"] = detailed_time($_list["time"]);
        $store_list["detailed_response_time"] = detailed_time($_list["response_time"]);
        
        $store_list["list"] = $list;

        return (object) $store_list;
    }


    public static function add_to_store_response($rid,$response,$responder_uid){
        $time = time();
        row_action([
            "table_name"=>"store_listing",
            "columns"=>[
                "rid"=>$rid
            ],
            "update"=>[
                "status"=>$response,
                "responder_uid"=>$responder_uid,
                "response_time"=>$time
            ]
        ])->update();

        if ($response==="Approved"){
            $list = self::list($rid);
            foreach($list->list as $r){
                Stock::add_to_store($r["item_name"],$r["quantity"],$r["cost"],$rid,$time);
            }
        }


        $notification = new Notification();

        $notification
            ->set_sender($responder_uid)
            ->set_sms_subject("Request to add to stock")
            ->set_fcm_subject("Request to add to stock")
            ->set_email_subject("Request to add to stock")
            ->set_notification_content(sprintf("Your request to add to stock was %s %s",strtolower($response),detailed_time($time)))
            ->set_notification_context("add_to_store-$rid");

        $store_list = Store::list($rid);

        $notification->add_recipient($store_list->added_by_uid);

        $notification->send();

    }



    public static function approve_add_to_store($rid,$responder_uid){
        
        return self::add_to_store_response($rid,"Approved",$responder_uid);
    }


    public static function decline_add_to_store($rid,$responder_uid){
        return self::add_to_store_response($rid,"Declined",$responder_uid);
    }

}




class Stock{
    
    public static function list(){
        $list = [];

        foreach (Store::item_names() as $item_name){       
            $list[$item_name] = self::item_quantity($item_name);
        }

        return $list;
    }


    public static function item_quantity($item_name){
        $item = Store::item($item_name);

        switch($item["type"]){
            case "Sales":
                $quantity = self::item_quantity_stored($item_name) - self::item_quantity_sold($item_name);
            break;

            case "Farm":
                $quantity = self::item_quantity_stored($item_name) - self::item_quantity_recorded($item_name);
            break;
        }

        return $quantity;
    }



    public static function item_quantity_stored($item_name){
        $listed_items = db_fetch("SELECT * FROM stock_transactions WHERE item_name=?",[$item_name]);

        $quantity = 0;
        foreach($listed_items as $listed_item){
            switch($listed_item["type"]){
                case "Store":
                    $quantity += $listed_item["quantity"];
                break;
            }
        }

        return $quantity;
    }



    public static function item_quantity_sold($item_name){
        $listed_items = db_fetch("SELECT * FROM stock_transactions WHERE item_name=?",[$item_name]);

        $quantity = 0;
        foreach($listed_items as $listed_item){
            switch($listed_item["type"]){
                case "Sales":
                    $quantity += $listed_item["quantity"];
                break;
            }
        }

        return $quantity;
    }




    public static function item_quantity_recorded($item_name){
        $listed_items = db_fetch("SELECT * FROM stock_transactions WHERE item_name=?",[$item_name]);

        $quantity = 0;
        foreach($listed_items as $listed_item){
            switch($listed_item["type"]){
                case "Farm":
                    $quantity += $listed_item["quantity"];
                break;
            }
        }

        return $quantity;
    }



    public static function item_history($item_name){
        return db_fetch("SELECT * FROM stock_transactions WHERE item_name=?",[$item_name]);
    }


    public static function add($item_name,$quantity,$cost,$track_id,$type,$time){
        global $current_fiscal_year;
        row_action([
            "table_name"=>"stock_transactions",
            "columns"=>[
                "fiscal_year"=>$current_fiscal_year,
                "type"=>$type,
                "track_id"=>$track_id,
                "item_name"=>$item_name,
                "quantity"=>$quantity,
                "cost"=>$cost,
                "time"=>$time
            ]
        ])->insert();
    }


    public static function add_to_sales($item_name,$quantity,$cost,$track_id,$time){
        return self::add($item_name,$quantity,$cost,$track_id,"Sales",$time);
    }


    public static function add_to_farm($item_name,$quantity,$track_id,$time){
        return self::add($item_name,$quantity,"",$track_id,"Farm",$time);
    }


    public static function add_to_store($item_name,$quantity,$cost,$track_id,$time){
        return self::add($item_name,$quantity,$cost,$track_id,"Store",$time);
    }

}



class Sales{
    public $item_names,$quantities,$costs,$sold_by_uid,$evidence_of_payment;

    public function request(){
        $response = [
            "error"=>null
        ];

        $illegal_items = [];

        for ($i=0;$i<count($this->item_names);$i++){
            $item_name = $this->item_names[$i];
            $quantity = strtonumber($this->quantities[$i]);

            if ($quantity > Stock::item_quantity($item_name)){
                $illegal_items[] = $item_name;
            }
        }

        if (count($illegal_items)===0){

            $time = time();
            $rid = last_insert_id("sales","rid") + 1;


            for ($i=0;$i<count($this->item_names);$i++){
                $item_name = $this->item_names[$i];
                $quantity = strtonumber($this->quantities[$i]);
                $cost = strtonumber($this->costs[$i]);
                
                row_action([
                    "table_name"=>"sales",
                    "columns"=>[
                        "rid"=>$rid,
                        "item_name"=>$item_name,
                        "quantity"=>$quantity,
                        "cost"=>$cost,
                        "evidence_of_payment"=>$this->evidence_of_payment,
                        "sold_by_uid"=>$this->sold_by_uid,
                        "time"=>$time
                    ]
                ])->insert();
            }

            $sold_by = user($this->sold_by_uid);

            $notification = new Notification();

            $notification
                ->set_sender($this->sold_by_uid)
                ->set_sms_subject("Request to sell products")
                ->set_fcm_subject("Request to sell products")
                ->set_email_subject("Request to sell products")
                ->set_notification_content("$sold_by->name ($sold_by->office) request to sell some items")
                ->set_notification_context("sell_product-$rid");

            foreach (office_member_uids("groupfarma_sales_manager")+office_member_uids("vantage_sales_manager") as $uid) {
                $notification->add_recipient($uid);
            }

            $notification->send();

        }else{
            $response = [
                "error"=>"ILLEGAL_ITEMS_EXIST",
                "illegal_items"=>$illegal_items
            ];
        }
        
        return $response;

    }


    public static function products($rid){
        $r = [];
        $list = db_fetch("SELECT * FROM sales WHERE rid=?",[$rid]);

        $_list = $list[0];
        $r["sold_by_uid"] = $_list["sold_by_uid"];
        $r["sold_by"] = user($_list["sold_by_uid"]);
        $r["evidence_of_payment"] = $_list["evidence_of_payment"];
        $r["responder_uid"] = $_list["responder_uid"];
        $r["responder"] = user($_list["responder_uid"]);
        $r["status"] = $_list["status"];
        $r["is_approved"] = $_list["status"] === "Approved";
        $r["is_declined"] = $_list["status"] === "Declined";
        $r["is_resolved"] = $r["is_approved"] || $r["is_declined"];
        $r["detailed_time"] = detailed_time($_list["time"]);
        $r["detailed_response_time"] = detailed_time($_list["response_time"]);
        
        $r["products"] = $list;

        return (object) $r;
    }



    public static function sold_products_response($rid,$response,$responder_uid){
        $time = time();
        row_action([
            "table_name"=>"sales",
            "columns"=>[
                "rid"=>$rid
            ],
            "update"=>[
                "status"=>$response,
                "responder_uid"=>$responder_uid,
                "response_time"=>$time
            ]
        ])->update();

        if ($response==="Approved"){
            $products = self::products($rid);
            
            foreach ($products->products as $product){
                Stock::add_to_sales($product["item_name"],$product["quantity"],$product["cost"],$rid,$time);
            }
        }

        $notification = new Notification();

        $notification
            ->set_sender($responder_uid)
            ->set_sms_subject("Request to approve sales")
            ->set_fcm_subject("Request to approve sales")
            ->set_email_subject("Request to approve sales")
            ->set_notification_content(sprintf("Your request to sale products %s %s",strtolower($response),detailed_time($time)))
            ->set_notification_context("sell_product-$rid");

        $products = self::products($rid);

        $notification->add_recipient($products->sold_by_uid);

        $notification->send();

    }



    public static function approve_sold_products($rid,$responder_uid){
        return self::sold_products_response($rid,"Approved",$responder_uid);
    }


    public static function decline_sold_products($rid,$responder_uid){
        return self::sold_products_response($rid,"Declined",$responder_uid);
    }

}



class FarmRecords{
    public $item_names,$quantities,$costs,$recorded_by_uid,$comment;

    public function record(){
        $response = [
            "error"=>null
        ];

        $illegal_items = [];

        for ($i=0;$i<count($this->item_names);$i++){
            $item_name = $this->item_names[$i];
            $quantity = strtonumber($this->quantities[$i]);

            if ($quantity > Stock::item_quantity($item_name)){
                $illegal_items[] = $item_name;
            }
        }

        if (count($illegal_items)===0){

            $time = time();

            $rid = last_insert_id("farm_records","rid") + 1;

            for ($i=0;$i<count($this->item_names);$i++){
                $item_name = $this->item_names[$i];
                $quantity = strtonumber($this->quantities[$i]);

                row_action([
                    "table_name"=>"farm_records",
                    "columns"=>[
                        "rid"=>$rid,
                        "item_name"=>$item_name,
                        "quantity"=>$quantity,
                        "comment"=>$this->comment,
                        "recorded_by_uid"=>$this->recorded_by_uid,
                        "time"=>$time
                    ]
                ])->insert();
        
                Stock::add_to_farm($item_name,$quantity,$rid,$time);
            }

        }else{
            $response = [
                "error"=>"ILLEGAL_ITEMS_EXIST",
                "illegal_items"=>$illegal_items
            ];
        }
        
        return $response;

    }



    public static function products($id){
        $r = [];
        $list = db_fetch("SELECT * FROM farm_records WHERE rid=?",[$id]);

        $_list = $list[0];
        $r["recorded_by_uid"] = $_list["recorded_by_uid"];
        $r["recorded_by"] = user($_list["recorded_by_uid"]);
        $r["comment"] = $_list["comment"];
        $r["detailed_time"] = detailed_time($_list["time"]);
        
        $r["products"] = $list;

        return (object) $r;
    }
}



class Assets{
    public static function list(){
        return _json_decode(current_values::get("assets"));
    }

    public static function add_rentage($asset_name,$duration,$cost){
        row_action([
            "table_name"=>"assets_rentage",
            "columns"=>[
                "asset_name"=>$asset_name,
                "duration"=>$duration,
                "cost"=>strtonumber($cost),
                "added_by"=>$_SESSION["uid"],
                "time"=>time()
            ]
        ])->insert();
    }


    public static function rented(){
        return db_fetch("SELECT * FROM assets_rentage ORDER BY time DESC");
    }
}

function _json_decode($string){
    return $string?json_decode($string,true):[];
}

function strtonumber($string){
    return str_replace(",","",$string);
}



class Privileges{
    public static function set($office_id,$privilege_id,$value){
        $cr = [
            'table_name'=>'office_privileges',
            'columns'=>[
                'office_id'=>$office_id
            ]
        ];

        $rs = row_action($cr);

        if (!$rs->exists()){
            $cr["colums"]["privileges"] = json_encode([]);
            row_action($cr)->insert();
            unset($cr["colums"]["privileges"]);
        }

        $r = row_action($cr)->fetch_one();

        $privileges = json_decode($r["privileges"],true);

        $privileges[$privilege_id] = $value;

        unset($cr["columns"]["privileges"]);
        $cr["update"]["privileges"] = json_encode($privileges);

        row_action($cr)->update();

    }


    public static function list($office_id){
        $privileges = _json_decode(db_fetch_one("SELECT * FROM office_privileges WHERE office_id=?",[$office_id])["privileges"]);
        
        foreach ($privileges as $privilege=>$value){
            $privileges[$privilege] = $value==="true";
        }
        return $privileges;
    }


    public static function has_privilege($privilege_id,$office_id=null){
        if (!$office_id){
            $user = user();
            $office_id = $user->office_id;
        }
        $privileges = self::list($office_id);
        return isset($privileges[$privilege_id]) && $privileges[$privilege_id];
    }
}


function day_timestamp($timestamp,$hour_in_day){
    return strtotime("midnight",$timestamp) + ($hour_in_day * 3600);
}

?>