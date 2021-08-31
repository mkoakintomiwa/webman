<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once "$document_root/settings.php";
include_once $assets."/db.php";
include_once $assets."/variables.php";
include_once $assets."/functions.php";

$current_fiscal_year = current_values::fiscal_year();

?>