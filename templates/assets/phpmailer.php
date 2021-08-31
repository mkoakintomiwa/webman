<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function phpmailer(){
    global $organization_name,$smtp_username,$smtp_password,$smtp_host,$info_mail_address;
    $mail = new PHPMailer(true);
    //Recipients
    //$mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Enable verbose debug output
    $mail->isSMTP();                                            // Send using SMTP
    $mail->Host       = $smtp_host;                    // Set the SMTP server to send through
    $mail->SMTPAuth   = false;                                   // Enable SMTP authentication
    $mail->Username   = $smtp_username;                     // SMTP username
    $mail->Password   = $smtp_password;                               // SMTP password
    $mail->SMTPSecure = "ssl";         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
    $mail->Port       = 465;   
    $mail->setFrom($info_mail_address, $organization_name);
    $mail->isHTML(true);
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
    return $mail;
}

?>