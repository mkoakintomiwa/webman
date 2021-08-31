<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once $assets."/db.php";
include_once $assets."/functions.php";
include_once $assets."/variables.php";


$task = $_POST["task"];
$iterator = $_POST["iterator"];
$tasks_length = $_POST["tasks_length"];

$pp = tasks_pp($iterator,$tasks_length);

$body = "";

$debugger = "";






echo json_encode([
    "body"=>$body,    
    "message"=>"
        <div class='mb-1 text-center' style='color: magenta'>
        
        </div>
        <div>$pp->progress &bull; $pp->percentage%</div>
    ",
    "debugger"=>$debugger,
    "error"=>null
]);

?>