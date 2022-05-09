const fs = require("fs");
const path = require("path");
const fx = require("./lib/functions");
const { info_prompt } = require("./stdout");
const { randomBytes } = require("crypto");

const config_path = path.join(fx.document_root(),".hftp","config.json");

if (!fs.existsSync(config_path)) fs.writeFileSync(config_path,"{}");
var config = JSON.parse(fs.readFileSync(config_path).toString());

const subject = "hftp";

(async _=>{
    await info_prompt("Domain name: ",subject,config.domain_name||"https://google.com").then(val=>{
        config.domain_name = val;
    });
    rewrite_config();


    await info_prompt("rel_dirname: ",subject,config.rel_dirname||"").then(val=>{
        config.rel_dirname = val;
    });
    rewrite_config();


    config.ftp = config.ftp || {};
    var ftp = config.ftp;

    await info_prompt("ftp.host",subject,ftp.host||"50.116.98.84").then(p=>{
        ftp.host = p;
    });


    await info_prompt("ftp.username",subject,ftp.user||"musthy").then(p=>{
        ftp.user = p;
    });


    await info_prompt("ftp.password",subject,ftp.password||"hamdan").then(p=>{
        ftp.password = p;
    });


    await info_prompt("ftp.port",subject,ftp.port||"21").then(p=>{
        ftp.port = p;
    });

    config.ftp = ftp;

    rewrite_config();


    
    config.settings = config.settings || {};
    var settings = config.settings;


    await info_prompt("settings.db_user",subject,settings.db_user||"root").then(p=>{
        settings.db_user = p;
    });


    await info_prompt("settings.db_password",subject,settings.db_password||"").then(p=>{
        settings.db_password = p;
    });


    await info_prompt("settings.db_name",subject,settings.db_name||"main").then(p=>{
        settings.db_name = p;
    });


    await info_prompt("settings.rel_dirname",subject,settings.rel_dirname||config.rel_dirname).then(p=>{
        settings.rel_dirname = p;
    });

    await info_prompt("settings.site_port",subject,settings.site_port||config.site_port).then(p=>{
        settings.site_port = p;
    });


    config.settings = settings;


    await info_prompt("watch_file_ignored",subject,config.watch_file_ignored||"^.git|rust.*target|rust.*Cargo.lock|^\.hftp|^bin|^node_modules|hftp\.cmd|package.json|package-lock.json|^.vscode").then(p=>{
        config.watch_file_ignored = p;
    });

    rewrite_config();

    let vscode_path = path.join(fx.document_root(),".vscode");

    let vscode_tasks_path = path.join(vscode_path,"tasks.json");

    if (!fs.existsSync(vscode_path)) fs.mkdirSync(vscode_path,{recursive:true});

    fs.writeFileSync(vscode_tasks_path,JSON.stringify({
        "version": "2.0.0",
        "command": "webman",
        "args": [
            "watch"
        ],
        "isBackground": true,
        "problemMatchers": []
    },null,4));

    fs.writeFileSync(path.join(fx.document_root(),".hftp","settings.json"),JSON.stringify(config.settings,null,4));
    
    var remote_assets_dir = `/public_html${config.rel_dirname}/assets`;
    var remote_hftp_dir = `/public_html${config.rel_dirname}/.hftp`;

    console.log("");
    
    await fx.ftp_mkdir(remote_assets_dir);
    
    await fx.ftp_mkdir(remote_hftp_dir);

    
    await fx.upload_files([
        {
            "local":path.join(fx.document_root(),".hftp","settings.json"),
            "remote":"/public_html/settings.json"
        },
        {
            "local":path.join(fx.document_root(),".hftp","config.json"),
            "remote":remote_hftp_dir.concat("/config.json")
        },
        {
            "local":path.join(fx.document_root(),".hftp","settings.php"),
            "remote":"/public_html/settings.php"
        }
    ]);

    
})();



function rewrite_config(){
    fs.writeFileSync(config_path,JSON.stringify(config,null,4));     
}
