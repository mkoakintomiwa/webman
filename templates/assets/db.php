<?php
@session_start();
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
$login_page = $rel_dirname."/users/login.php";
$site_architect_clearances = ['controller','system-admin','icitify-admin','icitify-dev'];

function conn($db=false){
    global $db_host,$db_name,$db_user,$db_password;
    if(!$db){
        $db=$db_name;
    }

    $conn = new PDO("mysql:host=$db_host;dbname=$db",$db_user,$db_password,[
        PDO::ATTR_PERSISTENT => true
    ]);
    $conn -> setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    return $conn;
}

$conn = conn();
try{
    $conn_files = conn($db_name."_files");
}catch(Exception $e){}


try{
    $conn_segments = conn($db_name."_segments");
}catch(Exception $e){}



function db_fetch($query,$parameters=[],$db=null){
    global $conn,$conn_paq;
    if ($db===null){
        $c=$conn;
    }else{
        if (is_string($db)){
            $c = conn($db);
        }else{
            $c = $db;
        }
    }/*elseif($db='paq'){
        $c=$conn_paq;
    }*/
    
    $stmt = $c->prepare($query);
    $stmt->execute($parameters);
    $r = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt=null;
    return $r;
}


function db_fetch_one($query,$parameters=[],$db=null){
    $r = db_fetch($query,$parameters,$db);
    try{
        if (count($r)===0){
            return [];
        }else{
            return $r[0];
        }
    }catch(Exception $e){
        return [];
    }
}


class row_action{
    public $db;

    public function __construct($db){
        $this->db = $db;
    }

    public function statement(){
        $db = $this->db;

        $columns = $db['columns'];

        $s=" WHERE ";
        $i=0;
        foreach($columns as $column => $column_value){
            if ($i===0){
                $s.=" `".trim($column)."`=? ";
            }else{
                $s.=" AND `".trim($column)."`=? ";
            }
            $i++;
        }

        $query_append =  (isset($db['query_append']))?$db['query_append']:""; 
        return $s." ".$query_append;
    }



    public function fetch(){
        global $conn;global $conn_paq;
        $db=$this->db;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }

        $q = $this->statement();
        $h=array_values($db['columns']);
        
        $stmt = $db['conn']->prepare("SELECT * FROM `$db[table_name]` $q");

        $stmt->execute($h);
        $r = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt=null;
        return $r;
    }
    
    public function fetch_one(){
        global $conn;global $conn_paq;
        $db=$this->db;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }

        $q = $this->statement();
        $h=array_values($db['columns']);
        
        $stmt = $db['conn']->prepare("SELECT * FROM `$db[table_name]` $q");
        $stmt->execute($h);
        $r = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt=null;

        try{
            return @$r[0];
        }catch(Exception $e){
            return [];
        }
    }
    
    
    public function exists(){

        $db = $this->db;

        global $conn;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }
    
        $s = $this->statement();
    
        $rows = $this->fetch();
    
        if (!isset($db['count'])){
            $condition = count($rows)>0;  
        }else{
            $condition = count($rows)>$db['count'];
        }
        
    
        return $condition;
    }
    
    
    public function delete(){
        $db  = $this->db;
        global $conn;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }
    
        $s = $this->statement();
    
        $stmt = $db['conn']->prepare("DELETE FROM $db[table_name] $s");
        $stmt->execute(array_values($db['columns']));
        $stmt=null;
        return $this;
    }



    public function update(){
        $db  = $this->db;
        global $conn;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }
    
        $s = $this->statement();

        $d = count($db['update']);

        $bb="";

        $k = array_keys($db['update']);
        $v = array_values($db['update']);

        for ($g=0;$g<$d;$g++){
            if ($g===$d-1){
                $bb.=" `".trim($k[$g])."`=? ";
            }else{
                $bb.=" `".trim($k[$g])."`=?, ";
            }
        }
    
        $stmt = $db['conn']->prepare("UPDATE $db[table_name] SET {$bb} $s");
        $stmt->execute(array_merge(array_values($db['update']),array_values($db['columns'])));
        $stmt=null;
        return $this;
    }


    public function insert(){
        $db  = $this->db;
        global $conn;

        if (!isset($db['conn'])){
            $db['conn']=$conn;
        }
    
        $s = $this->statement();

        $p="(";
        $c="(";
        $f=0;
        foreach ($db['columns'] as $column_name=>$column_value){

            if ($f===count($db['columns'])-1){
                $c.="?";
                $p.="`".trim($column_name)."`";
            }else{
                $c.="?,";
                $p.="`".trim($column_name)."`,";
            }

            $f++;
        }

        $p.=")";
        $c.=")";
    
        $stmt = $db['conn']->prepare("INSERT INTO $db[table_name] $p VALUES $c");
        $stmt->execute(array_values($db['columns']));
        $stmt=null;
        return $this;
    }

    public function insert_once(){
        if (!$this->exists()){
            $this->insert();
        }
        return $this;
    }


    public function add_column($column_name,$column_value){
        $this->db["columns"][$column_name] = $column_value;
        return $this;
    }
}


function row_action($db_parameters){
    $y=new row_action($db_parameters);
    return $y;
}


function sqlite_row_seek($query,$rowid){
    return db_fetch($query)[$rowid-1]; 
}


function row_seek($query,$rowid){
    return db_fetch($query)[$rowid-1]; 
}


function is_login_page(){
    global $login_page;
    return $_SERVER['PHP_SELF']===$login_page;
}

if (!is_api_request()){
    if (!is_login_page()){
        @$accounts = json_decode($_COOKIE['accounts'],true);

        if (!isset($_SESSION['uid']) && isset($_COOKIE['accounts']) && (!isset($_GET['action']) && @$_GET['action']!='log-out')){

            foreach($accounts as $uid=>$account){
                if ($account['status']==='active'){
                    if (!isset($_SESSION['uid'])){
                        $_SESSION['uid'] = $uid;

                        if (admin_priviledged('view_accounts',$uid)){
                            $_SESSION['suid'] = $uid;
                        }
                    }
                }
            }
        }
    }else{
        if (isset($_COOKIE['accounts'])){
            $accounts = json_decode($_COOKIE['accounts'],true);
            
            foreach($accounts as $account_key=>$account_value){
                $accounts[$account_key]['status'] = 'inactive';
            }
            
            set_accounts_cookie($accounts);
            unset($_SESSION['uid']);
            unset($_SESSION['suid']);
        }
    }
}


function is_api_request(){
    return isset($_GET['request_type']) || isset($_POST['request_type']);
}


function set_accounts_cookie($accounts){
    global $rel_dirname;
    setcookie('accounts',json_encode($accounts),time()+5*365*24*60*60,"$rel_dirname");
}


function show_errors(){
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

function hide_errors(){
    ini_set('display_errors', 0);
    error_reporting(0);
}


function real_list($li){
    $h=[];
    foreach ($li as $j){
        if(strlen(trim($j))>0){
            $h[]= trim($j);
        }
    }
    return $h;
}


function admin_priviledged($property,$uid=false){
    global $site_architect_clearances;
    
    $p = $property;

    if (!$uid){
        $uid = $_SESSION['uid'];
    }

    $_user = (object)db_fetch_one("SELECT * FROM community_details WHERE uid=?",[$uid]);

    if (in_array($_user->clearance,$site_architect_clearances)){    
        return true;
    }else{
        $ng = db_fetch_one("SELECT * FROM admin_properties WHERE uid=? AND property=?",[$uid,$p]);

        if ($ng){
            if($ng['value']==='true'){
                return true;
            }else{
                return false;
            }
        }else{
            return false; 
        }
    }
}


function db_tables($db_conn=null,$output='array'){
    global $conn;

    if ($db_conn===null) $db_conn = $conn;

    $f = [];

    foreach(db_fetch("SHOW TABLES",[],$db_conn) as $table_name){
        $f[] = array_values($table_name)[0];
    }

    
    $k="";
    foreach($f as $d){
        $k.="`$d`,";
    }
    $k = rtrim($k,",");
    
    return $output==='array'?$f:$k;
    
}


function db_fields($table,$db_conn=null,$output='array'){
    global $conn;

    if ($db_conn===null) $db_conn=$conn;

    $f = [];
    foreach( db_fetch("SHOW columns FROM `{$table}`",[],$db_conn) as $table_name){
        $f[] = array_values($table_name)[0];
    }
    
    //$k="(";
    $k="";
    foreach($f as $d){
        $k.="`$d`,";
    }
    $k = rtrim($k,",");
    //$k.=")";

    return $output==='array'?$f:$k;
}


function column_exists($column,$table,$db_conn=null){
    global $conn;

    if ($db_conn===null) $db_conn=$conn;

    return in_array($column,db_fields($table,$db_conn));
}

function set_defaults($defaults,$options=[]){
    foreach ($defaults as $property=>$value){
        if (!isset($options[$property])) $options[$property] = $value;
    }
    return (object)$options;
}

function sql_character($character){
    return strtoupper(trim($character));
}



/**
 * Add column/field to database table
 *
 * @param string $column
 * @param string $table
 * @param array $column_definitions : Options
 * * type - default: VARCHAR
 * * length - default: 250
 * * null - default: true
 * @param db_connection $db_conn
 * @return void
 */
function add_column($column,$table,$column_definitions=[],$db_conn=null){
    global $conn;

    $cds = set_defaults([
        'type'=>'VARCHAR',
        'length'=>250,
        'null'=>true,
    ],$column_definitions);

    $_type = "$cds->type($cds->length)";

    $_after = isset($cds->after)? "AFTER `$cds->after`":"";

    $_null = !$cds->null?"NOT NULL":"NULL";

    $_default = isset($cds->default)?"DEFAULT $cds->default":"";

    $sql_type = sql_character($cds->type); 

    if ($sql_type==='TEXT' || $sql_type==='JSON' || $sql_type==='BLOB'){
        $_type = $cds['type'];
    }

    if ($db_conn===null) $db_conn = $conn;
    if (!column_exists($column,$table)){
        $db_conn->prepare("ALTER TABLE $table ADD $column $_type $_null $_default $_after")->execute();
    }
}


function db_removed_data($table,$qa=''){
    global $conn;
    try{
        $conn->prepare("INSERT INTO `removed_{$table}` (".db_fields($table,null,"string").") SELECT ".db_fields($table,null,"string")." FROM `$table` $qa")->execute();
    }catch(Exception $e){
        
    }
}


function show_create_table($table_name,$_conn=null){
    global $conn;
    if ($_conn===null) $_conn = $conn;
    $query = db_fetch_one("SHOW CREATE TABLE `$table_name`",[],$_conn)["Create Table"];
    $query.=";";
    $query .= "\n";
    $query .= "ALTER TABLE `$table_name` AUTO_INCREMENT = 1";
    return $query;
}


function wild_card_query($db_parameters){
    
    if (!isset($db_parameters['query'])){
        $db_parameters['query'] = "";
    }

    if (!isset($db_parameters['query_append'])){
        $db_parameters['query_append'] = "";
    }
    
    $qa = preg_split("/\s+/",trim($db_parameters['query']));
    $qas = real_list($qa);
    
    $query = "SELECT * FROM `$db_parameters[table_name]`";
    
    if (count($qas)>0){
         $query.=" WHERE (";
        foreach ($db_parameters['fields'] as $field){
            $query .="(";
            foreach ($qas as $af){
                $query.=" `$field` LIKE '%".str_replace("'","\'",$af)."%' AND ";
            }
            $query = rtrim($query,"AND ").") OR";
        }
        
        $query = rtrim($query," OR");
        
        $query = "$query)";
        
        if (strlen(trim($db_parameters['query_append']))>0){
            $query .= " AND ".$db_parameters['query_append'];
        }
        
    }else{
        if (strlen(trim($db_parameters['query_append']))>0){
            $query .= " WHERE ".$db_parameters['query_append'];
        }
    }
    return $query;
}


function wild_card_search($db_parameters){
    return db_fetch(wild_card_query($db_parameters));
}


function group_by($group_name,$sub_group_name,$fetched_array){

    $accumulator = [];
    foreach($fetched_array as $fetched_row){
        $_group_name = call_user_func_array($group_name,[$fetched_row]);
        $_sub_group_name = call_user_func_array($sub_group_name,[$fetched_row]);

        if (!isset($accumulator[$_group_name])) $accumulator[$_group_name] = [];
        $accumulator[$_group_name][$fetched_row[$_sub_group_name]] = $fetched_row;
    }
    return $accumulator;
}

function primary_queries($_conn=null){
    global $conn;
    if ($_conn===null) $_conn = $conn;
    $queries = "";
    foreach(db_tables($_conn) as $table){
        $queries .= show_create_table($table,$_conn);
        $queries .= ";";
        $queries .= "\n\n\n";
    }
    return $queries;
}



function token($length,$type="characters"){
    global $conn_files;

    $value = function($length,$type){
        if ($type==="digits"){
            $_return = random_digits($length);
        }else{
            $_return = random_characters($length);
        }
        return $_return;
    };

    while(true){

        if (isset($_SESSION['uid'])){
            $uid = $_SESSION['uid'];
        }else{
            $uid = null;
        }

        $_return = call_user_func_array($value,[$length,$type]);

        $r = row_action([
            'conn'=>$conn_files,
            'table_name'=>'tokens',
            'columns'=>[
                'token'=>$_return
            ],
            'update'=>[
                'uid'=>$uid,
                'time'=>time()
            ]
        ]);

        if (!$r->exists()){
            $r->insert()->update();
            return $_return;
        }else{
            $_return = call_user_func_array($value,[$length,$type]);
        }
    }
}


function delete_token($token){
    global $conn_files;
    $conn_files->prepare("DELETE FROM tokens WHERE token=?")->execute([$token]);
}




function random_digits($length) {
    $result = '';

    for($i = 0; $i < $length; $i++) {
        $result .= mt_rand(0, 9);
    }

    return $result;
}


function unique_digits($table_name,$field_name,$length){
    $_return = random_digits($length);

    while(true){
        if (count(db_fetch("SELECT * FROM `$table_name` WHERE `$field_name`=?",[$_return]))===0){
            return $_return;
        }else{
            $_return = random_digits($length);
        }
    }
}


function random_characters($length = 32, $numeric = false) {

    $random_string = "";
    while(strlen($random_string)<$length && $length > 0) {
        if($numeric === false) {
            $randnum = mt_rand(0,61);
            $random_string .= ($randnum < 10) ?
                chr($randnum+48) : ($randnum < 36 ? 
                    chr($randnum+55) : chr($randnum+61));
        } else {
            $randnum = mt_rand(0,9);
            $random_string .= chr($randnum+48);
        }
    }
    return $random_string;
}




function unique_characters($table_name,$field_name,$length){
    $_return = random_characters($length);

    while(true){
        if (count(db_fetch("SELECT * FROM `$table_name` WHERE `$field_name`=?",[$_return]))===0){
            return $_return;
        }else{
            $_return = random_characters($length);
        }
    }
}


function done(){
    echo "AJAX_SUCCESSFUL";
}


function delete_by_id($table_name,$row_id,$db_conn=null){
    global $conn;
    $_conn = $db_conn?:$conn;

    $_conn->prepare("DELETE FROM `$table_name` WHERE id=?")->execute([$row_id]);
}

hide_errors();
//show_errors();

?>