import {log} from "util"

$("#login").on("click",()=>{
    login();
});


$(document).on("enter",()=>{
    login();
});


function login(){
    Sp();
    $.ajax({
        url:`${ajax}/check-user.php`,
        data: $("#user-form").formJSON(),
        success:d=>{
            var response = JSON.parse(d);
            
            if (!response.correct_username){
                Swal.fire({
                    text:"Wrong username, please check your username and try again",
                    icon:"error"
                });
            }else if (!response.correct_password){
                Swal.fire({
                    text:"Wrong password, please check your password and try again",
                    icon:"error"
                });
            }else if (response.status==="inactive"){
                Swal.fire({
                    text:"Your account has been suspended by admin",
                    icon:"error"
                });
            }else{
                if (Platform.is_browser()){
                    window.location.href = `${rel_dirname}/`
                }else{
                    Flutter.webview_login(response.uid).then(p=>{
                        window.location.href = `${rel_dirname}/`
                   });
                }
            }
        }
    });
}