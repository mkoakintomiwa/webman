<?php
@session_start();
define("IS_LOGIN_PAGE",true);
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once $assets."/variables.php";
$title = "$organization_name | Login to your account";
include_once $assets."/functions.php";
unset_user();
include_once $assets."/universal.php";
echo $universal->stdOut;

?>

<style></style>

<?php

$html_template = <<<EOF
<!--HTML-->
EOF;

echo "
<body>
    <div class='grid-1-2-1'>
        <div class='content-left'></div>
        
        <div class='content-center center-box-container'>
            ".html_from_template($html_template)."
        </div>

        <div class='content-right'></div>
    </div>
</body>
";
?>

<script></script>