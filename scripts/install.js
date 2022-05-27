const fs = require("fs");
const fx = require("./lib/functions");
const path = require("path");
const argv = require("yargs").parseSync();
const chalk = require("chalk");
const ssh = require("./ssh");

const context = argv._[0];
const node_id = argv["node-id"];

(async ()=>{
    var root = fx.node_root(node_id);
    var node = fx.node(node_id);

    var ssh_connection = await ssh.nodeSSHConnection(node_id);

    switch(context){
        case "phpmyadmin":

            var phpmyadminAuthKey
            var brackets_properties
            var mysql

            if (argv["root"]){
                mysql = root.mysql;
            }else{
                mysql = node.mysql;
            }


            phpmyadminAuthKey = mysql.phpmyadminAuthKey;

            brackets_properties = {
                host: mysql.host || "localhost",
                username: mysql.username,
                password: mysql.password
            }

            var lastest_phpmyadmin = 'phpMyAdmin-5.1.0-all-languages';

            await ssh.node_execute_command(`mkdir -p phpmyadmin && cd phpmyadmin && rm -rf "${lastest_phpmyadmin}.zip" &&  rm -rf "${lastest_phpmyadmin}" && rm -rf "${phpmyadminAuthKey}" && wget "https://files.phpmyadmin.net/phpMyAdmin/5.1.0/${lastest_phpmyadmin}.zip" --no-check-certificate && unzip -o "${lastest_phpmyadmin}.zip" && mv "${lastest_phpmyadmin}" "${phpmyadminAuthKey}" && cd "${phpmyadminAuthKey}" && mv config.sample.inc.php config.inc.php`,ssh_connection,{
                cwd: fx.remoteNodeDir(node_id)
            });


            let template_rel_path = 'phpmyadmin/config.inc.php';
            let template_content = fx.template_content(template_rel_path);
            
            let tmp_file = fx.newTmpFile("php");

            let new_content = fx.brackets_replace(template_content, brackets_properties);

            fs.writeFileSync(tmp_file,new_content);

            await ssh.node_upload_file(fx.relativeToDocumentRoot(tmp_file),fx.remoteNodeDir(node_id).concat(`/phpmyadmin/${phpmyadminAuthKey}/config.inc.php`),node_id,ssh_connection);

            await ssh.node_upload_file(fx.template_path("restricted.php"),fx.remoteNodeDir(node_id).concat(`/phpmyadmin/index.php`),node_id,ssh_connection);

        break;

        
        case "virtualmin":
            await ssh.node_execute_command(`wget http://software.virtualmin.com/gpl/scripts/install.sh && sudo /bin/sh install.sh`,ssh_connection,{
                cwd: "/root"
            });
        break;
        
        
        case "file-manager":

            var file_manager_auth_key
            var brackets_properties


            file_manager_auth_key = node.file_manager_auth_key;

            // brackets_properties = {
            //     host: mysql.host || "localhost",
            //     username: mysql.username,
            //     password: mysql.password
            // }

            await ssh.node_execute_command(`mkdir -p file-manager && cd file-manager && rm -rf "file-manager.zip" &&  rm -rf "file-manager" && rm -rf "${file_manager_auth_key}" && mkdir "${file_manager_auth_key}" && cd "${file_manager_auth_key}" && wget "api.icitifysolution.com/wpanel/file-manager.zip" && unzip -o "file-manager.zip"`,ssh_connection,{
                cwd: fx.remoteNodeDir(node_id)
            });
        break;
    }

    ssh_connection.dispose();
})();