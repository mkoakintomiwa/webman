const fs = require("fs");
const fx = require("./functions");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");
const ssh = require("./ssh");

const context = argv._[0];
const node_id = argv["node-id"];

(async ()=>{
    var root = fx.node_root(node_id);
    var node = fx.node(node_id);

    var ssh_connection;    
    await ssh.node_ssh_connection(node_id).then(x=>{
        ssh_connection = x;
    });

    switch(context){
        case "phpmyadmin":

            var phpmyadmin_auth_key
            var brackets_properties
            var mysql

            if (argv["root"]){
                mysql = root.mysql;
            }else{
                mysql = node.mysql;
            }


            phpmyadmin_auth_key = mysql.phpmyadmin_auth_key;

            brackets_properties = {
                host: mysql.host || "localhost",
                username: mysql.username,
                password: mysql.password
            }

            var lastest_phpmyadmin = 'phpMyAdmin-5.1.0-all-languages';

            await ssh.node_execute_command(`mkdir -p phpmyadmin && cd phpmyadmin && rm -rf "${lastest_phpmyadmin}.zip" &&  rm -rf "${lastest_phpmyadmin}" && rm -rf "${phpmyadmin_auth_key}" && wget "https://files.phpmyadmin.net/phpMyAdmin/5.1.0/${lastest_phpmyadmin}.zip" && unzip -o "${lastest_phpmyadmin}.zip" && mv "${lastest_phpmyadmin}" "${phpmyadmin_auth_key}" && cd "${phpmyadmin_auth_key}" && mv config.sample.inc.php config.inc.php`,ssh_connection,{
                cwd: fx.remote_node_dir(node_id)
            });


            let template_rel_path = 'phpmyadmin/config.inc.php';
            let template_content = fx.template_content(template_rel_path);
            
            let tmp_file = fx.new_tmp_file("php");

            let new_content = fx.brackets_replace(template_content, brackets_properties);

            fs.writeFileSync(tmp_file,new_content);

            await ssh.node_upload_file(fx.relative_to_document_root(tmp_file),fx.remote_node_dir(node_id).concat(`/phpmyadmin/${phpmyadmin_auth_key}/config.inc.php`),node_id,ssh_connection);

            // await ssh.node_upload_file(fx.template_path("restricted.php"),fx.remote_node_dir(node_id).concat(`/phpmyadmin/index.php`),node_id,ssh_connection);

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
                cwd: fx.remote_node_dir(node_id)
            });
        break;
    }

    ssh_connection.dispose();
})();