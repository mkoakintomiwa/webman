<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once "$document_root/settings.php";
include_once $assets."/prelude.php";


$response = [
    "error"=>null
];

echo "<pre>";
var_dump($_POST);
echo "</pre>";


echo json_encode($response);

?>