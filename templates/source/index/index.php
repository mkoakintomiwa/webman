<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
include_once $assets."/variables.php";
include_once $assets."/functions.php";
$user = user();
$title = "$user->name | $organization_name";
include_once $assets."/universal.php";

echo $universal->stdOut;

$welcome_back_greeting = greet_by_day().", $user->name. Welcome back!";

$staffs_count = count(staff_list());

$pending_disputes_count = count(Dispute::pending($user->uid));

$detailed_time = detailed_time(time());

$staff_manning_time_format = "l, jS F, Y";

$staff_manning_date = date($staff_manning_time_format,time());

$staff_manning = group_by(function($row){
    global $staff_manning_time_format;
    return date($staff_manning_time_format,$row['time_in']);
},function($row){
    return "id";
},db_fetch("SELECT * FROM attendance ORDER BY id DESC LIMIT 100"));


foreach ($staff_manning as $date=>$man_info){
    foreach($man_info as $index=>$man){
        $staff_manning[$date][$index]["user"] = user($man["uid"]);
        $staff_manning[$date][$index]["detailed_time_in"] = date("g:i a",$man["time_in"]);
        $staff_manning[$date][$index]["detailed_time_out"] = $man["time_out"]?date("g:i a",$man["time_out"]):"";
    }
}


$has_pending_leave_request = Leave::has_pending_request();

$budget = Budget::_budget($current_fiscal_year);

$budget_isset = Budget::isset($current_fiscal_year);

$formatted_total_expenditure = Expenditure::formatted_total_amount();

$formatted_budget_balance = Budget::formatted_balance();

$budget_percentage_expended = round(Budget::percentage_expended());

?>

<style></style>

<?php

$html_template = <<<EOF
<!--HTML-->
EOF;

echo "
<div class='var-container'>
    <div var='budget_percentage_expended'>$budget_percentage_expended</div>
</div>
<main>
    <div class='not-navbar'>
        <div class='content-center'>
            ".html_from_template($html_template)."
        </div>
    </div>
</main>
";
?>

<script></script>