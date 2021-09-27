<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once "$document_root/settings.php";
$title = "";
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
    <div class='var-container'>
        <div var=''></div>
    </div>
    <div class='not-navbar grid-1-2-1'>
        <div class='content-left'></div>
        
        <div class='content-center'>
            ".html_from_template($html_template)."
        </div>

        <div class='content-right'></div>
    </div>
</body>
";
?>

<script></script>