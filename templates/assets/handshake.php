<?php
session_start();
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once "handshake_functions.php";
handshake_authorize();

if ($_POST['filename']==='settings.php'){
    $filename = str_replace("\\","/",$document_root . "/settings.php");
}else{
    $filename = str_replace("\\","/",$dirname . $_POST['filename']);
}
foreach ($_FILES as $file){
    if (!is_dir(dirname($filename))){
        mkdir(dirname($filename),0777,true);
    }
    if (move_uploaded_file($file['tmp_name'],$filename)){
        echo "$_SERVER[HTTP_HOST]$rel_dirname collected " . str_replace("\\","/",$_POST['filename']);       
    }else{
        echo "Error: $_SERVER[HTTP_HOST]$rel_dirname could not collect " . str_replace("\\","/",$_POST['filename']);
    }
}
?>