const fs = require("fs");
const fx = require("./functions");
const argv = require("yargs").argv;
const path = require("path")
const ssh = require("./ssh");
const sx = require("./stdout"); 
const EventEmitter = require('events');

if (argv.help){
    fx.println();
    console.log("Example:")
    console.log(`webman change-host --node-id epLklwTvel --host-ip 34.66.194.243 --host-username brighthope`);
    process.exit();
}

const eventEmitter = new EventEmitter();

let document_root = fx.document_root();

let node_ids = fx.arg_node_ids(argv);

(async _=>{
    for (let node_id of node_ids){
        let node = fx.node(node_id);

        let new_host_ip = argv["h"] || await sx.info_prompt("New host IP Address > ","host","162.152.80.45");
        let new_host_username = argv["u"] || node.ssh.username;

        console.log("Connecting to servers...");
        
        let node_ssh_connection = await ssh.node_ssh_connection(node_id);
        let node_root_ssh_connection = await ssh.node_root_ssh_connection(node_id);

        let config = fx.config();
        let new_host_root = config["roots"][new_host_ip];

        let ssh_root_connection = await ssh.ssh_connection({
            host: new_host_ip,
            username: new_host_root.username,
            password: new_host_root.password
        });


        await ssh.execute_command(`wpanel account create -u ${new_host_username} -p ${node.ssh.password} -d ${node.domain_name}`,ssh_root_connection);


        let ssh_connection = await ssh.ssh_connection({
            host: new_host_ip,
            username: new_host_username,
            password: node.ssh.password
        });


        if (!argv.d){

            await fx.shell_exec(`webman cloudflare dns update -h ${new_host_ip} -n ${node_id}`);

            await ssh.execute_command(`cd public_html && rm -rf ${node_id}.zip && zip -r ${node_id}.zip .`,node_ssh_connection);

            await ssh.execute_command(`cd public_html &&  node /nodejs/scp --host ${new_host_ip} --username ${new_host_username}  --password '${node.ssh.password}' --local-file-path '${node_id}.zip' --remote-file-path '/home/${new_host_username}/public_html/${node_id}.zip'`,node_ssh_connection);

            await ssh.execute_command(`cd public_html && rm -rf ${node_id}.zip`,node_ssh_connection);

        } 

        await ssh.execute_command(`mysql --execute "CREATE USER '${node.mysql.username}'@'localhost' IDENTIFIED BY '${node.mysql.password}';"`,ssh_root_connection);

        for (let db_name of node.mysql.databases){
            
            await ssh.execute_command(`cd /home/${node.ssh.username} && mysqldump -u root ${db_name} > ${db_name}.sql && node /nodejs/scp --host ${new_host_ip} --username ${new_host_username}  --password '${node.ssh.password}' --local-file-path '${db_name}.sql' --remote-file-path '/home/${new_host_username}/${db_name}.sql'`,node_root_ssh_connection);

            let command = `mysql --execute "DROP DATABASE IF EXISTS ${db_name}; CREATE DATABASE IF NOT EXISTS ${db_name}; GRANT ALL ON ${db_name}.* TO '${node.mysql.username}'@'localhost';flush privileges;"`;
            
            console.log(command)

            await ssh.execute_command(command,ssh_root_connection);

            await ssh.execute_command(`cd /home/${new_host_username} && mysql -u root ${db_name} < ${db_name}.sql && rm -rf ${db_name}.sql`,ssh_root_connection);

        }


        if(!argv.d){
            await ssh.execute_command(`cd public_html && unzip -o ${node_id}.zip && rm -rf ${node_id}.zip`,ssh_connection);

            await fx.shell_exec(`webman run update htaccess --node-id ${node_id}`);

            await fx.shell_exec(`webman run update cronjob --node-id ${node_id}`);
        }

        

        await fx.shell_exec(`webman set nodes.${node_id}.host ${new_host_ip}`);
        await fx.shell_exec(`webman set nodes.${node_id}.ssh.username ${new_host_username}`);
        await fx.shell_exec(`webman set nodes.${node_id}.ftp.user ${new_host_username}`);

        ssh_connection.dispose();
        ssh_root_connection.dispose();
        node_ssh_connection.dispose();
        node_root_ssh_connection.dispose();


    }
})();