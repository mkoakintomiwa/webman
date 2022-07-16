import * as fs from "fs"
import * as fx from "./lib/functions"
import * as path from "path"
import * as ssh from "./lib/ssh"

const argv = require("yargs").parseSync();
const chalk = require("chalk");

const context = argv._[0];
const nodeId = argv["node-id"];

(async ()=>{
    var root = fx.nodeRoot(nodeId);
    var node = fx.node(nodeId);

    var sshConnection = await ssh.nodeSSHConnection(nodeId);

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

            await ssh.nodeExecuteCommand(`mkdir -p phpmyadmin && cd phpmyadmin && rm -rf "${lastest_phpmyadmin}.zip" &&  rm -rf "${lastest_phpmyadmin}" && rm -rf "${phpmyadminAuthKey}" && wget "https://files.phpmyadmin.net/phpMyAdmin/5.1.0/${lastest_phpmyadmin}.zip" --no-check-certificate && unzip -o "${lastest_phpmyadmin}.zip" && mv "${lastest_phpmyadmin}" "${phpmyadminAuthKey}" && cd "${phpmyadminAuthKey}" && mv config.sample.inc.php config.inc.php`, nodeId,sshConnection,{
                cwd: fx.remoteNodeDir(nodeId)
            });


            let template_rel_path = 'phpmyadmin/config.inc.php';
            let template_content = fx.templateContent(template_rel_path);
            
            let tmp_file = fx.newTmpFile("php");

            let new_content = fx.brackets_replace(template_content, brackets_properties);

            fs.writeFileSync(tmp_file,new_content);

            await ssh.nodeUploadFile(fx.relativeToDocumentRoot(tmp_file),fx.remoteNodeDir(nodeId).concat(`/phpmyadmin/${phpmyadminAuthKey}/config.inc.php`),nodeId,sshConnection);

            await ssh.nodeUploadFile(fx.templatePath("restricted.php"),fx.remoteNodeDir(nodeId).concat(`/phpmyadmin/index.php`),nodeId,sshConnection);

        break;

        
        case "virtualmin":
            await ssh.nodeExecuteCommand(`wget http://software.virtualmin.com/gpl/scripts/install.sh && sudo /bin/sh install.sh`, nodeId,sshConnection,{
                cwd: "/root"
            });
        break;
        
    }

    sshConnection.dispose();
})();