const fs = require("fs");
const fx = require("./lib/functions");
const argv = require("yargs").parseSync();
const path = require("path")
const ssh = require("./ssh");
const sx = require("./stdout");
const axios = require("axios").default;


if (argv.help){
    fx.println();
    console.log("Example:")
    console.log(`_ change-host --node-id epLklwTvel --host-ip 34.66.194.243 --host-username brighthope`);
    process.exit();
}

let document_root = fx.document_root();

let node_ids = fx.arg_node_ids(argv);

(async _=>{
    
    for (let node_id of node_ids){
        let node = fx.node(node_id);

        let new_host_ip = argv["h"] || await sx.info_prompt("New host IP Address > ","host","162.152.80.45");
        let new_host_username = argv["u"] || node.ssh.username;

        console.log("Connecting to servers...");
        
        let nodeSSHConnection = await ssh.nodeSSHConnection(node_id);
        let nodeRootSSHConnection = await ssh.nodeRootSSHConnection(node_id);

        let config = fx.config();
        // @ts-ignore
        let new_host_root = config["roots"][new_host_ip];

        let ssh_root_connection = await ssh.ssh_connection({
            host: new_host_ip,
            username: new_host_root.username,
            password: new_host_root.password
        });


        await ssh.execute_command(`wpanel account create -u ${new_host_username} -p ${node.ssh.password} -d ${node.domainName}`,ssh_root_connection);


        let ssh_connection = await ssh.ssh_connection({
            host: new_host_ip,
            username: new_host_username,
            password: node.ssh.password
        });


        if (!argv.d){

            await fx.shellExec(`_ cloudflare dns update -h ${new_host_ip} -n ${node_id}`);

            await ssh.execute_command(`cd public_html && rm -rf ${node_id}.zip && zip -r ${node_id}.zip .`,nodeSSHConnection);

            await ssh.execute_command(`cd public_html &&  node /nodejs/scp --host ${new_host_ip} --username ${new_host_username}  --password '${node.ssh.password}' --local-file-path '${node_id}.zip' --remote-file-path '/home/${new_host_username}/public_html/${node_id}.zip'`,nodeSSHConnection);

            await ssh.execute_command(`cd public_html && rm -rf ${node_id}.zip`,nodeSSHConnection);

        } 

        await ssh.execute_command(`mysql --execute "CREATE USER '${node.mysql.username}'@'localhost' IDENTIFIED BY '${node.mysql.password}';"`,ssh_root_connection);

        for (let db_name of node.mysql.databases){
            
            await ssh.execute_command(`cd /home/${node.ssh.username} && mysqldump -u root ${db_name} > ${db_name}.sql && node /nodejs/scp --host ${new_host_ip} --username ${new_host_username}  --password '${node.ssh.password}' --local-file-path '${db_name}.sql' --remote-file-path '/home/${new_host_username}/${db_name}.sql'`,nodeRootSSHConnection);

            let command = `mysql --execute "DROP DATABASE IF EXISTS ${db_name}; CREATE DATABASE IF NOT EXISTS ${db_name}; GRANT ALL ON ${db_name}.* TO '${node.mysql.username}'@'localhost';flush privileges;"`;
            
            console.log(command)

            await ssh.execute_command(command,ssh_root_connection);

            await ssh.execute_command(`cd /home/${new_host_username} && mysql -u root ${db_name} < ${db_name}.sql && rm -rf ${db_name}.sql`,ssh_root_connection);

        }


        if(!argv.d){
            await ssh.execute_command(`cd public_html && unzip -o ${node_id}.zip && rm -rf ${node_id}.zip`,ssh_connection);
        }

        

        await fx.shellExec(`_ set nodes.${node_id}.host ${new_host_ip}`);
        await fx.shellExec(`_ set nodes.${node_id}.ssh.username ${new_host_username}`);
        await fx.shellExec(`_ set nodes.${node_id}.ftp.user ${new_host_username}`);

        
        if(!argv.d){
            await fx.shellExec(`_ run update htaccess --node-id ${node_id}`).catch(e=>{});
            await fx.shellExec(`_ run update cronjob --node-id ${node_id}`).catch(e=>{});
        }

        let response =  await axios.get(`${node.nodeUrl}/ip-address`);

        if (response.status === 200){
            console.log(`\nIP Address: ${node.nodeUrl}`);
        }

        console.log(`\nNode URL: ${node.nodeUrl}\n\n`);
        

        ssh_connection.dispose();
        ssh_root_connection.dispose();
        nodeSSHConnection.dispose();
        nodeRootSSHConnection.dispose();


    }
})();