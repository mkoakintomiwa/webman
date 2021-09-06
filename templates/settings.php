<?php
session_start();
$document_root =__DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}

$settings = json_decode(file_get_contents($document_root."/settings.json"));

$db_host = isset($settings->mysql->host)?$settings->mysql->host:"localhost";

$db_name = $settings->mysql->databases[0];

$db_user = $settings->mysql->username;

$db_password = $settings->mysql->password;

$phpmyadmin_auth_key = isset($settings->mysql->phpmyadmin_auth_key)?$settings->mysql->phpmyadmin_auth_key:"";

$file_manager_auth_key = isset($settings->file_manager_auth_key)?$settings->file_manager_auth_key:"";

$rel_dirname;
if (!isset($portal_type)){
	$rel_dirname =  $settings->rel_dirname;
}else if($portal_type==='admissions'){
	$rel_dirname = $settings->admissions_rel_dirname;
}























































/***************************************************   
****************************************************
****************************************************
****************************************************
*******THESE ARE GENERATED VALUES, DO NOT EDIT******
****************************************************
****************************************************
****************************************************
***************************************************/

date_default_timezone_set('Africa/Lagos');

$public_html = public_html();

/**
 * @deprecated Use $abs_dirname instead
 * @var string
 */
$abs_dirname = $rel_dirname; //abs_dirname is deprecated

/**
 * @deprecated Use $document_root instead
 * @var string
 */
$dirname = $document_root;

$site_host = isset($_SERVER['HTTP_HOST'])?$_SERVER['HTTP_HOST']:"";

function is_localhost(){
 return isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST']==='localhost';
}

if (is_localhost()){
	$protocol = "http://";
	$specs_rel_dir = "$rel_dirname/portals/$db_name/specs";	
}else{
	$protocol = "https://";
	$specs_rel_dir = "$rel_dirname/specs";
}


$host = $protocol.$site_host;

$base_url = $host;

$portal_url = $host.$rel_dirname;

$specs_dir = $public_html.$specs_rel_dir;

$specs_url = $host.$specs_rel_dir;

$assets_abs_url = $rel_dirname . "/assets";

$ajax = $rel_dirname . "/ajax";

$images = $specs_rel_dir . "/images";

$general_images = $portal_url."/images";

$assets = $document_root . "/assets";

























































/***************************************************   
****************************************************
****************************************************
****************************************************
*******THESE ARE GENERATED VALUES, DO NOT EDIT******
****************************************************
****************************************************
****************************************************
***************************************************/


function public_html($public_html_directory_name=null){
    if (!$public_html_directory_name) $public_html_directory_name = "public_html";
    $public_html = __FILE__;

   while(true){
       $public_html = dirname($public_html);

       if (basename($public_html)===$public_html_directory_name) break;
   }
    return $public_html;
}



?>