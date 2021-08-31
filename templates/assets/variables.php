<?php
$document_root = __DIR__;while(true){if (file_exists($document_root."/settings.json")){break;}else{$document_root=dirname($document_root);}}
include_once $document_root."/settings.php";
$composer_autoload = "$dirname/composer/vendor/autoload.php";
require_once $composer_autoload;
if (class_exists("Twig\\Environment")){
    include_once $assets."/twig.php";
}


$login_page = "$rel_dirname/users/login.php";

$default_title = "Groupfarma Agribusiness Solution (GAS)";

$organization_name = "Groupfarma Agribusiness Solution (GAS)";

$organization_logo = "$rel_dirname/assets/images/group-farma-logo.png";

$info_mail_address = "info@timesellers.icitifysolution.com";

$smtp_host = "localhost";

$smtp_username = "timesellersiciti";

$smtp_password = "1q2w3e4r123@";

$theme_color = "#072746";

$blobs_rel_dir = $rel_dirname."/blobs";
$blobs_dir = $document_root.$blobs_rel_dir;

$password_hash_cost = 10;

$default_password = "groupfarma";

$icons_rel_dir = $rel_dirname."/assets/icons";

$icons_dir = $document_root.$icons_rel_dir;

$image_icon = "$icons_rel_dir/image.png";

$default_user_dp = "$rel_dirname/assets/images/default-user-sleek.png";

$dispute_ticket_id_length = 10;

$fcm_server_key =
"AAAA5-uVJKk:APA91bGM8Elg4OccI0YOROlvORJQeekH3sM6U86-pLeMDLew3mLnjTj_Ae0zhMuxSjS_p1tzI-LUrkGkFHsJ2vTIdAt5CdY2dSnTZ-F_PXTOYCWNREYR-kZnkGdDI9vgRlaHWEREQTEe";

$offices = [
    "CEO"=>[
        "name"=>"CEO"
    ],
    "HR"=>[
        "name"=>"HR"
    ],
    'admin'=>[
        "name"=>"Admin"
    ],
    "finance_department"=>[
        "name"=>"Finance Department"
    ],
    "project_manager"=>[
        "name"=>"Project Manager"
    ],
    "farm_supervisor"=>[
        "name"=>"Farm Supervisor"
    ],
    "assets_manager"=>[
        "name"=>"Assets Manager"
    ],
    "store_keeper"=>[
        "name"=>"Store Keeper"
    ],
    "operation_head"=>[
        "name"=>"Operation Head"
    ],
    "marketing_manager"=>[
        "name"=>"Marketing Manager"
    ],
    "IT"=>[
        "name"=>"IT"
    ],
    "vantage_sales_manager"=>[
        "name"=>"Vantage Agromat/Sales Manager"
    ],
    "groupfarma_sales_manager"=>[
        "name"=>"Groupfarma Sales Manager"
    ],
    "sales_rep"=>[
        "name"=>"Sales Rep"
    ],
    'customer_service'=>[
        "name"=>"Customer Service"
    ]
];


$clearances = array_keys($offices);

$offices = key_to_values("clearance",$offices);

$office_names = [];

foreach($offices as $office_id=>$office){
    $office_names[$office_id] = $office["name"];
}

$sales_group = [
    "vantage"=>[
        "name"=>"Vantage Agromat"
    ],
    "groupfarma"=>[
        "name"=>"Groupfarma"
    ]
];

$sales_group = key_to_values("sale_group",$sales_group);

function key_to_values($key_name,$array){
    foreach($array as $key=>$value){
        $array[$key][$key_name] = $key;
    }
    return $array;
}


$privileges = [
    "edit_profile"=>"Profile",
    "log_dispute"=>"Log Dispute",
    "track_dispute"=>"Track Dispute",
    "resolve_dispute"=>"Resolve Dispute",
    //"request_cash_advance"=>"Request Cash Advance",
    //"verify_cash_advance"=>"Verify Cash Advance",
    //"approve_cash_advance"=>"Approve Cash Advance",
    "staff_manning"=>"Staff Manning",
    //"document_upload"=>"Document Upload",
    "expense_request"=>"Expense Request",
    "view_expense_requests"=>"Expense Log",
    "approve_expense_requests"=>"Approve Expense Request",
    "verify_expense_request"=>"Verify Expense Request",
    "total_expense"=>"Total Expense",
    "request_for_leave"=>"Request for leave",
    "approve_leave_request"=>"Approve leave request",
    //"stock_management"=>"Stock Management",
    //"request_tools_movement"=>"Request Tools Movement",
    //"view_tools_movement_log"=>"Tools Movement Log",
    "assets_management"=>"Assets Management",
    "input_farm_records"=>"Input Farm Records",
    //"verify_farm_records"=>"Verify Farm Records",
    //"raw_materials_record"=>"Raw Materials Record",
    //"feeding_budget"=>"Feeding Budget",
    //"seeds_budget"=>"Seeds Budget",
    "view_financial_reports"=>"Financial Reports",
    "loan_profile"=>"Loan Profile",
    "create_budget"=>"Create Budget",
    "approve_budget"=>"Approve Budget",
    "input_cost_of_production"=>"Input cost of production",
    "verify_cost_of_production"=>"Verify cost of production",
    "approve_cost_of_production"=>"Approve cost of production",
    "request_fund_from_vantage"=>"Request fund from vantage",
    "edit_payroll"=>"Edit Payroll",
    "initiate_salary_payment"=>"Initiate Salary Payment",
    "approve_salary_payment_request"=>"Approve Salary Payment",
    "view_salary_payment_request"=>"View Salary Requests",
    "update_financial_records"=>"Update Financial Records",
    "view_staff_records"=>"View Staff Records",
    "create_farm_report"=>"Create Farm Report",
    "view_farm_reports"=>"Farm Reports",
    //"sales_performance_tracker"=>"Sales / Performance tracker",
    //"assign_target_for_sales_representatives"=>"Sales rep targets",
    //"accept_assigned_target"=>"Accept assigned target",
    //"make_request_for_product"=>"make_request_for_product",
    //"accept_request_for_product"=>"accept_request_for_product",
    //"create_third_party"=>"Create Distributor / 3rd party user",
    "create_staff"=>"Create staff",
    "edit_staff_profile"=>"Edit Staff Profile",
    "edit_reporting_line"=>"Edit reporting line",
    //"payroll_authentication"=>"Payroll Authentication",
    //"onboarding"=>"Onboarding",
    //"system_should_see"=>"System Should See",
    //"document_performance_evaluation"=>"Document performance evaluation",
    //"make_order"=>"Make order",
    //"verify_order"=>"Verify order",
    //"cancel_order"=>"Cancel Order",
    //"movement_of_assets"=>"Movement of assets",
    //"edit_assets_rentage_value"=>"Assets rentage value",
    //"view_assets_rentage_value"=>"View assets rentage value",
    //"manage_vantage"=>"Manage Vantage",
    //"manage_groupfarma"=>"Manage Groupfarma",
    "add_store_items"=>"Store items",
    "add_to_store"=>"Add to stock",
    "view_stock"=>"Stock",
    "sell_product"=>"Sell Product",
    "add_asset_locations"=>"Add assets location",
    "add_assets"=>"Assets",
    "add_rented_assets"=>"Add rented assets",
    "view_rented_assets"=>"Rented assets",
    "assign_roles"=>"Assign roles"
];





$privileges_frontend_design = [

    "edit_profile"=>[
        "url"=>"$rel_dirname/users/profile.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"user"
    ],


    "create_staff"=>[
        "url"=>"$rel_dirname/roles/create-staff.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"users"
    ],


    
    "assign_roles"=>[
        "url"=>"$rel_dirname/roles/assign-roles.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"tasks"
    ],


    "expense_request"=>[
        "url"=>"$rel_dirname/roles/expense-request.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"money-check-alt"
    ],

    
    "view_expense_requests"=>[
        "url"=>"$rel_dirname/roles/expense-requests.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"book"
    ],


    "farm_report"=>[
        "title"=>"Farm Report",
        "submenus"=>[
            "create_farm_report"=>[
                "url"=>"$rel_dirname/roles/edit-farm-report.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"pen"
            ],
        
            
            "view_farm_reports"=>[
                "url"=>"$rel_dirname/roles/farm-reports.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"book"
            ],


            "input_farm_records"=>[
                "url"=>"$rel_dirname/roles/input-farm-records.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"list"
            ]
        ]
    ],


    "create_budget"=>[
        "url"=>"$rel_dirname/roles/create-budget.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"building"
    ],


    "approve_budget"=>[
        "url"=>"$rel_dirname/roles/budget-proposals.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"gavel"
    ],

    "salary"=>[
        "title"=>"Salary",
        "submenus"=>[
            "initiate_salary_payment"=>[
                "url"=>"$rel_dirname/roles/initiate-salary-payment.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"credit-card"
            ],
    
    
            "approve_salary_payment_request"=>[
                "url"=>"$rel_dirname/roles/salary-payment-requests.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"gavel"
            ],
    
    
            "view_salary_payment_request"=>[
                "url"=>"$rel_dirname/roles/view-salary-payment-requests.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"eye"
            ]
        ]
    ],



    "edit_payroll"=>[
        "url"=>"$rel_dirname/roles/edit-payroll.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"receipt"
    ],


    
    "sell_product"=>[
        "url"=>"$rel_dirname/roles/sell-product.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"shopping-cart"
    ],
    



    "view_stock"=>[
        "url"=>"$rel_dirname/roles/stock.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"chart-pie"
    ],



    "add_to_store"=>[
        "url"=>"$rel_dirname/roles/add-to-store.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"plus"
    ],


    "add_store_items"=>[
        "url"=>"$rel_dirname/roles/add-store-items.php",
        "icon_type"=>"fontawesome",
        "icon_class"=>"building"
    ],


    "assets"=>[
        "title"=>"Assets",
        "submenus"=>[
            "view_rented_assets"=>[
                "url"=>"$rel_dirname/roles/view-rented-assets.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"sitemap"
            ],
        
        
            "add_rented_assets"=>[
                "url"=>"$rel_dirname/roles/add-rented-assets.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"plus"
            ],
        
        
            "add_assets"=>[
                "url"=>"$rel_dirname/roles/assets.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"th-list"
            ],
        
            
        
            "add_asset_locations"=>[
                "url"=>"$rel_dirname/roles/add-asset-locations.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"map-marker"
            ]
        ]
    ],


    "leave"=>[
        "title"=>"Leave",
        "submenus"=>[
            "request_for_leave"=>[
                "url"=>"$rel_dirname/roles/request-for-leave.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"road"
            ],
        
        
            "approve_leave_request"=>[
                "url"=>"$rel_dirname/roles/leave-requests.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"gavel"
            ]
        ]
    ],



    "disputes"=>[
        "title"=>"Disputes",
        "url"=>"$rel_dirname/roles/log-dispute.php",
        "submenus"=>[
            "log_dispute"=>[
                "url"=>"$rel_dirname/roles/log-dispute.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"book"
            ],
            
            "track_dispute"=>[
                "url"=>"$rel_dirname/roles/track-dispute.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"map-marker"
            ],
    
            
            "resolve_dispute"=>[
                "url"=>"$rel_dirname/roles/resolve-dispute.php",
                "icon_type"=>"fontawesome",
                "icon_class"=>"broom"
            ]
        ]
    ]

];






// $office_privileges = [

//     "CEO"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "create_staff",
//         "request_for_leave",
//         "approve_budget",
//         "edit_payroll",
//         "approve_salary_payment_request",
//         "view_farm_reports",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],


//     "HR"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "create_staff",
//         "request_for_leave",
//         "approve_leave_request",
//         "initiate_salary_payment",
//         "view_salary_payment_request",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],


//     'admin'=>[
//         "edit_profile",
//         "expense_request",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],


//     "finance_department"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "view_expense_requests",
//         "create_budget",
//         "edit_payroll",
//         "view_farm_reports",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],



//     "project_manager"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "view_farm_reports",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],


//     "farm_supervisor"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "edit_farm_report",
//         "view_farm_reports",
//         "add_store_items",
//         "add_to_store",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],



//     "assets_manager"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "add_asset_locations",
//         "add_assets",
//         "add_rented_assets",
//         "view_rented_assets"
//     ],



//     "store_keeper"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "add_store_items",
//         "add_to_store",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],



//     "operation_head"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "view_farm_reports",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],


//     "IT"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "assign_roles"
//     ],



//     "vantage_sales_manager"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "add_to_store",
//         "view_rented_assets"
//     ],



//     "groupfarma_sales_manager"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "add_store_items",
//         "view_stock",
//         "add_asset_locations",
//         "add_assets",
//         "add_to_store",
//         "view_rented_assets"
//     ],



//     "sales_rep"=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave",
//         "view_stock",
//         "sell_product",
//         "add_to_store",
//         "add_asset_locations",
//         "add_assets",
//         "view_rented_assets"
//     ],

    
    
//     'customer_service'=>[
//         "edit_profile",
//         "log_dispute",
//         "track_dispute",
//         "resolve_dispute",
//         "request_for_leave"
        
//     ]


// ];



$expense_items = [
    "Office Provisions",
    "Communication",
    "Automobile Fueling",
    "Automobile Repair",
    "Security",
    "Utility",
    "Repairs and Maintenance",
    "Product Design and Packaging",
    "Staff Welfare",
    "Logistics",
    "Entertainment",
    "Promotional Materials",
    "Imprest",
    "Subscription",
    "Medicals",
    "Charis Reach",
    "Media & Advert",
    "Office Premises",
    "Vehicle Registration, Renewal and Penalty",
    "Farm Machineries and Repairs",
    "Assets",
    "Learning and Development",
    "Traveling",
    "Legal Fees",
    "Syndeham Farm"
];


$expenditure_contexts = [
    "expense" => "Expense",
    "salary_payments" => "Salary Payments"
];


$correct_mark = "<img src='$rel_dirname/assets/images/c-correct.png' style='height:15px;position:relative;bottom:3px;'>";
$wrong_mark = "<img src='$rel_dirname/assets/images/c-wrong.png' style='height:15px;position:relative;bottom:2px;'>";

?>