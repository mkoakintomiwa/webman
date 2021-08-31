<?php
@session_start();
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once "prelude.php";

$user = user();

if (!isset($_SESSION["uid"]) && !(defined("IS_LOGIN_PAGE") && constant("IS_LOGIN_PAGE")) && !(defined("PUBLIC") && constant("PUBLIC"))){
	log_out();
}else{
    if (!(defined("IS_LOGIN_PAGE") && constant("IS_LOGIN_PAGE"))){
        if ($user->status!="Active" && $user->is_online){
            log_out();
        }

        if (password_verify($default_password,get_user_password_hash($_SESSION["uid"])) && $_SERVER["PHP_SELF"]!="/users/profile.php"){
            header("Location: $portal_url/users/profile.php?panic=change-default-password");
        }
    }
}


$sb_admin = "$rel_dirname/assets/sb-admin";
$quill = "$rel_dirname/assets/quill";

$links = "
<link rel='shortcut icon' href='$organization_logo'/>

<script
  src='https://code.jquery.com/jquery-3.5.1.min.js'
  integrity='sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0='
  crossorigin='anonymous'></script>

<link rel='stylesheet' href='$rel_dirname/assets/sb-admin/css/sb-admin-2.min.css'>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'>

<script src='https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js'></script>

<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' integrity='sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm' crossorigin='anonymous'>

<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js' integrity='sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q' crossorigin='anonymous'></script>

<script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js' integrity='sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl' crossorigin='anonymous'></script>

<script src='https://cdn.jsdelivr.net/npm/sweetalert2@10'></script>

<script src='https://unpkg.com/sweetalert/dist/sweetalert.min.js'></script>

<link href='https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i' rel='stylesheet'>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css' integrity='sha512-1PKOgIY59xJ8Co8+NE6FZ+LOAZKjy+KY8iq0G4B3CyeY6wYHN3yt9PW0XpSriVlkMXe40PTKnXrLnZ9+fkDaog==' crossorigin='anonymous' />

<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>

<link rel='stylesheet' href='https://unpkg.com/aos@next/dist/aos.css' />
  
<script src='https://unpkg.com/aos@next/dist/aos.js'></script>

<script src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js'></script>

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css'> 

<script src='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js'></script>

<script src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js'></script>

<link rel='stylesheet' href='$quill/themes/snow.css' />

<script src='$quill/main/quill.min.js'></script>

<link rel='stylesheet' href='$rel_dirname/assets/svg-icons-animate.css'>

<script src='$rel_dirname/assets/tingle/dist/tingle.min.js' type='text/javascript'></script>

<script src='$rel_dirname/assets/lodash.min.js' type='text/javascript'></script>

<script src='$rel_dirname/assets/math-type.js' type='text/javascript'></script>

<script src='$rel_dirname/assets/math-type-extension.js' type='text/javascript'></script>

<script src='$rel_dirname/assets/moment/1.0.0/moment.min.js'></script>

<script src='$rel_dirname/assets/Chart.min.js'></script>

<link rel='stylesheet' href='$rel_dirname/assets/animate.css'>

<link rel='stylesheet' href='$rel_dirname/assets/smart-wizard/5.1.1/smart-wizard-all.min.css'>

<script src='$rel_dirname/assets/smart-wizard/5.1.1/smart-wizard.min.js'></script>
";



$fonts = ['Montserrat','Open Sans','Abril+Fatface','Prompt','Special Elite','BioRhyme','Asap'];

foreach ($fonts as $font){
    $links.="<link href='https://fonts.googleapis.com/css?family=$font' rel='stylesheet'>";
}


$links = minify_html($links);

$head_script = "
<script>
    var ajax = '".$ajax."';
    var portal_url = '".$portal_url."';
    var rel_dirname = '".$rel_dirname."';
    var image_icon = '".$image_icon."';
    var user = ".json_encode($user).";
    var office_names = ".json_encode($office_names).";
    var privileges = ".json_encode($privileges).";
    var expense_items = ".json_encode($expense_items).";
    var correct_mark = \"$correct_mark\";
    var wrong_mark = \"$wrong_mark\";
    var icons_rel_dir = \"$icons_rel_dir\";
    var upload_file_markup = \"".minify_html($upload_file_markup)."\";
    var months = {};
    months.F = ".json_encode(months("F")).";
    months.n = ".json_encode(months("n")).";
    months.M = ".json_encode(months("M")).";

    function addDialogItem(iterator,content){
        return \"".js_escape(add_dialog_item('"+iterator+"','"+content+"'))."\";
    };
</script>
";



$grids = [
    [1,2,1],
    [1,10,1],
    [1,5,1],
    [1,4,1],
    [1,3,1],
    [1,1,1],
    [3,10,6],
    [1,1],
    [5,3,4]
];

$gr = "";

foreach ($grids as $grid){
    $a="";
    $b="";

    foreach($grid as $g){
        $a.="-$g";
        $b.= " ".$g."fr ";
    }
    
    $gr .= "
		.grid$a{
			display:grid;
			grid-template-columns:$b;
		}
    ";
}



$head_style = "
<style>
	@media (min-width: 768px){ 
		$gr   
	}
</style>
";


$fonts = [
    //'Bernhard BdCn BT'=>'BernhardBoldCondensedBT.ttf',
    //'digital-7'=>'digital-7/digital-7.ttf'
];


$_fonts = "";
foreach($fonts as $font=>$path){
    $_fonts.="

    @font-face {
        font-family:'$font';
        src: url('$rel_dirname/assets/fonts/$path') format('truetype');
    }
    ";
}

$head_style = minify_css("
<style>
   $_fonts

    @font-face {
        font-family:'Bernhard BdCn BT';
        src: url('$rel_dirname/assets/fonts/BernhardBoldCondensedBT.ttf') format('truetype');
    }

    @media (min-width: 768px){ 
        $gr   
    }

    .drop-menu a:hover,  .sticky-table tr th, .sortable .default{
        background-color:$theme_color;
    }

    [type=\"checkbox\"].filled-in:checked+span:not(.lever):after{
        border:2px solid $theme_color;
        background-color:$theme_color;
    }


    iframe.report-card,.page-preloader,.iframe-wrapper iframe{
        background-image: url($rel_dirname/assets/images/bg-preloader.gif) !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: cover !important;
    }

    .input-group{
        border:0.5px solid $theme_color;
    }
</style>
");


$head_style .= file_get_contents($dirname."/assets/head_style.php");
$head_script .= file_get_contents($dirname."/assets/head_script.php");



if (!isset($title)){
    $title=$default_title;
}

$universal = [];

$universal['head_script'] = minify_js($head_script);

$universal['head_style'] = minify_css($head_style);

$head = "
<!DOCTYPE html>
<head itemscope='' itemtype='http://schema.org/WebPage' >
    <title>$title</title>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <meta name='theme-color' content='$theme_color'>
    $links
</head>

$universal[head_style]
";


function side_nav_item($design,$privilege){
    global $privileges;
    $properties = (object) $design;   
         
        if (Privileges::has_privilege($privilege)){
            
            switch($properties->icon_type){
                case "fontawesome":
                    $item_icon_content = "<i class='fa fa-$properties->icon_class'></i>";
                break;       
            }
            

            $is_active_page = strpos($_SERVER["REQUEST_URI"],$properties->url)!==false;
            
            return "
            <li class='".($is_active_page?"active-page":"")."'>
                <a href='$properties->url'>
                    $item_icon_content <span class='dashboard-item'>".$privileges[$privilege]."</span>
                </a>
            </li>    
            "; 
        }
}


if (is_user()){

    $side_nav_items = "";

    foreach($privileges_frontend_design as $privilege=>$design){
        
        if (isset($design["submenus"])){
            $has_active_page = false;
            $no_of_submenus = 0;

            foreach ($design["submenus"] as $_privilege=>$_design){
                if (Privileges::has_privilege($_privilege)) $no_of_submenus++;
                $_properties = (object) $_design;
                $is_active_page = strpos($_SERVER["REQUEST_URI"],$_properties->url)!==false;
                if ($is_active_page) $has_active_page = true;
            }

            if ($no_of_submenus>0){
                $side_nav_items .= "
                <ul class='collapsible menu'>
                    <li>
                        <div class='collapsible-header ".($has_active_page?"active-page":"")."' style='color: white !important;'><i class='fa fa-bars' style='font-size: 13px; margin-left:8px; margin-right: 10px;'></i>$design[title]</div>
                        <div class='collapsible-body' style='background-color: rgb(11 29 46);'>
                            <ul>
                            ";

                            foreach ($design["submenus"] as $_privilege=>$_design){
                                $side_nav_items .= side_nav_item($_design,$_privilege);
                            }

                        $side_nav_items .= "
                            </ul>
                        </div>
                    </li>
                </ul>
                ";
            }
        }else{
            $side_nav_items .= side_nav_item($design,$privilege);
        }        
        
    }


    $messages_count_unread = Message::count_unread();

    $notifications_count_unread = Notification::count_unread();
    
    $messages_count_unread_display_none = $messages_count_unread===0?"display-none":"";

    $notifications_count_unread_display_none = $notifications_count_unread===0?"display-none":"";

    
    $icon_names = files_in_directory($icons_dir);
    $icons = "";

    foreach($icon_names as $icon_name){
        $icons.="<img src='$icons_rel_dir/$icon_name'>";
    }
    
    
    $is_home_page = $_SERVER["PHP_SELF"]==="/index.php";

    
    $navbar = "


    <div class='height-0 display-none'>
        <img src='$rel_dirname/assets/images/fb-preloader.gif' style='height:20px;width:20px'>
        <img style='opacity:1;height:0px;' src='$image_icon'>
        $correct_mark
        $wrong_mark
        $icons
    </div>

    <nav id='navbar' class='main-navbar'>
        
        <ul class='left-menu'>
            <li>
                <a href='#' data-target='slide-out' class='sidenav-trigger'>
                    <i class='material-icons white-text nav-icon'>menu</i>
                </a>
            </li>
        
        </ul>
        
        
        <ul class='right-menu'>

            <li>
                <a href='$rel_dirname/users/messages/log.php'  class='communicator messages'>
                    <i class='fab fa-facebook-messenger'></i>
                    <span class='$messages_count_unread_display_none communicator-badge'>$messages_count_unread</span>
                </a>
            </li>



            <li>
                <a href='$rel_dirname/users/notifications/' class='comnunicator notifications'>
                    <i class='fa fa-bell'></i>
                    <span class='$notifications_count_unread_display_none communicator-badge'>$notifications_count_unread</span>
                </a>
            </li>


            <li>
                <a href='#' class='global-search'>
                    <i class='fa fa-search'></i>
                </a>
            </li>

        </ul>
    </nav>

    <script>
        function is_notifications_page(){
            return window.location.href.indexOf('users/notifications')!=-1;
        };
        
        
        function is_messages_page(){
            return window.location.href.indexOf('users/messages')!=-1;
        };


        if (is_notifications_page()) $('.main-navbar .notifications').parents('li').addClass('active');
        if (is_messages_page()) $('.main-navbar .messages').parents('li').addClass('active');


        var notifications_count_unread = ".Notification::count_unread().";
        var messages_count_unread = ".Message::count_unread().";
        

        var messagesBadge = $('.messages .communicator-badge');
        var notificationsBadge = $('.notifications .communicator-badge');
        
        
        var manageCommunicator = setInterval(function(){
            if (notifications_count_unread===0){
                $(notificationsBadge).addClass('display-none');
            }else{
                $(notificationsBadge).removeClass('display-none');
                $(notificationsBadge).html(notifications_count_unread);
            };


            if (messages_count_unread===0){
                $(messagesBadge).addClass('display-none');
            }else{
                $(messagesBadge).removeClass('display-none');
                $(messagesBadge).html(messages_count_unread);
            };
        },100);

    </script>

    <ul id='slide-out' class='sidenav sidenav-fixed'>

        <div class='organization-block'>
            <a class='organization-name text-center' href='$rel_dirname/'>$organization_name</a>
            <a href='#'>
                <div class='dp-block centralize'>
                    <img class='circle dp' src='$user->dp'>
                </div>
                <div class='user-block centralize'>
                    <div class='white-text name'>$user->name</div>
                    <div class='white-text username'>
                        <small>@$user->username</small>
                    </div>
                </div>
            </a>
        </div>


        <li class='webview-actions'></li>

        <li class='".($is_home_page?"active-page":"")."'>
            <a href='$rel_dirname/'>
                <i class='fa fa-home'></i> <span class='dashboard-item'>Home</span>
            </a>
        </li>

        $side_nav_items


        <li><div class='divider' style='margin-top:0px'></div></li>

        <li style='margin-bottom:50px;'>
            <a class='logout waves-effect'><i class='fa fa-sign-out-alt'></i> Log out</a>
        </li>

    </ul>
    ";
}else{
    $navbar = "";
}


$notice_modals = <<<EOF
<div id='notice' class='iframe-wrapper display-none'>
    <div id='notice-content'>
        <div id='notice-header'></div>
        <div id='notice-body'></div>
    </div>
</div>

<div id='pp' class="progress">
    <div class="indeterminate"></div>
</div>
EOF;


$navbar.= $notice_modals;


$universal['stdOut'] = minify_html($head.$navbar).$universal['head_script'];
$universal = (object)$universal;

?>