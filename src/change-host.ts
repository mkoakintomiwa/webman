import * as fs from "fs"
import * as fx from "./lib/functions"
import * as path from "path"
import * as ssh from "./lib/ssh"
import axios from "axios"

const argv = require("yargs").parseSync();
const sx = require("./lib/stdout");


if (argv.help){
    fx.println();
    console.log("Example:")
    console.log(`webman change-host --node-id epLklwTvel --host-ip 34.66.194.243 --host-username brighthope`);
    process.exit();
}

let documentRoot = fx.documentRoot();

let node_ids = fx.arg_node_ids(argv);

(async _=>{
    
    for (let node_id of node_ids){
        let node = fx.node(node_id);

        let new_host_ip = argv["h"] || await sx.info_prompt("New host IP Address > ","host","162.152.80.45");
        let new_host_username = argv["u"] || node.ssh.username;

        console.log("Connecting to servers...");
        
        let nodeSSHConnection = await ssh.nodeSSHConnection(node_id);
        let nodeRootSSHConnection = await ssh.nodeRootSSHConnection(node_id);

        const nodeSSHConnectionInterval = setInterval(()=>{
            nodeSSHConnection.exec("ls",[]);
        },1000);

        const nodeRootSSHConnectionInterval = setInterval(() => {
            nodeRootSSHConnection.exec("ls",[]);
        },1000);

        let config = fx.config();
        // @ts-ignore
        let new_host_root = config["roots"][new_host_ip];

        let ssh_root_connection = await ssh.sshConnection({
            host: new_host_ip,
            username: new_host_root.username,
            password: new_host_root.password
        });


        await ssh.executeCommand(`wpanel account create -u ${new_host_username} -p ${node.ssh.password} -d ${node.domainName}`,ssh_root_connection);


        let ssh_connection = await ssh.sshConnection({
            host: new_host_ip,
            username: new_host_username,
            password: node.ssh.password
        });


        if (!argv.d){

            if (!argv["skip-compress"]){
                await ssh.executeCommand(`cd public_html/specs && rm -rf ${node_id}.zip && zip -r ${node_id}.zip .`,nodeSSHConnection);

                await ssh.executeCommand(`cd public_html/specs &&  node /nodejs/scp ${node_id}.zip  ${new_host_username}@${new_host_ip}:/home/${new_host_username}/public_html/${node_id}.zip  -p '${node.ssh.password}'`,nodeSSHConnection);
            }
            await ssh.executeCommand(`cd public_html/specs && rm -rf ${node_id}.zip`,nodeSSHConnection);

        } 

        await ssh.executeCommand(`mysql --execute "CREATE USER '${node.mysql.username}'@'localhost' IDENTIFIED BY '${node.mysql.password}';"`,ssh_root_connection);

        for (let db_name of node.mysql.databases){
            
            await ssh.executeCommand(`cd /home/${node.ssh.username} && mysqldump -u root ${db_name} > ${db_name}.sql && node /nodejs/scp ${db_name}.sql ${new_host_username}@${new_host_ip}:/home/${new_host_username}/${db_name}.sql  -p '${node.ssh.password}'`,nodeRootSSHConnection);

            let command = `mysql --execute "DROP DATABASE IF EXISTS ${db_name}; CREATE DATABASE IF NOT EXISTS ${db_name}; GRANT ALL ON ${db_name}.* TO '${node.mysql.username}'@'localhost';flush privileges;"`;
            
            console.log(command)

            await ssh.executeCommand(command,ssh_root_connection);

            await ssh.executeCommand(`cd /home/${new_host_username} && mysql -u root ${db_name} < ${db_name}.sql && rm -rf ${db_name}.sql`,ssh_root_connection);

        }


        if(!argv.d){

            await ssh.executeCommand(`mv public_html/${node_id}.zip ${node_id}.zip && cd public_html && rm -rf * && rm -rf .*`,ssh_connection);

            await ssh.executeCommand(`cd public_html && git clone https://icitifysolution:glpat-zy4ciXhRSvJTq4eV94jQ@gitlab.com/icitifysms/portal.git . && git config user.name icitify && git config user.email icitifyportals@gmail.com && mkdir specs && mv ../${node_id}.zip specs/${node_id}.zip && cd specs && unzip -o ${node_id}.zip && rm -rf ${node_id}.zip`,ssh_connection);
        }

        

        await fx.shellExec(`webman set nodes.${node_id}.host ${new_host_ip}`);
        await fx.shellExec(`webman set nodes.${node_id}.ssh.username ${new_host_username}`);


        await fx.shellExec(`webman push config ${node_id}`);

        await ssh.executeCommand(`cd public_html && npm i ejs && cd updates && npm i && node run.js`,ssh_connection);
        
        if(!argv.d){
            // await fx.shellExec(`webman run update htaccess --node-id ${node_id}`).catch(e=>{});
            // await fx.shellExec(`webman run update cronjob --node-id ${node_id}`).catch(e=>{});
            
            await fx.shellExec(`webman cloudflare dns update -h ${new_host_ip} -n ${node_id}`);
        }
            
        console.log(`\nCheck IP Address: ${node.nodeUrl}/ip-address`);

        console.log(`\nNode URL: ${node.nodeUrl}\n\n`);

        
        ssh_connection.dispose();
        ssh_root_connection.dispose();
        nodeSSHConnection.dispose();
        nodeRootSSHConnection.dispose();


    }
})();