<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once "$document_root/settings.php";
$title = "";
include_once $assets."/universal.php";

?>

<?php

$html_template = <<<EOF
<!--HTML-->
EOF;

echo html_from_template($html_template);

?>