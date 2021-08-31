<?php
function handshake_authorize(){
    $document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
    $auth_key = json_decode(file_get_contents("$document_root/settings.json"),true)["handshake_auth_key"];
    
    if ($auth_key!=$_POST['auth_key']){
        die("Error: $_SERVER[HTTP_HOST] did not authorize the request.");
    }
}
?>