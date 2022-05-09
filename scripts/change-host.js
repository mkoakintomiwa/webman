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
    console.log(`webman change-host --node-id epLklwTvel --host-ip 34.66.194.243 --host-username brighthope`);
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
        
        let node_ssh_connection = await ssh.node_ssh_connection(node_id);
        let node_root_ssh_connection = await ssh.node_root_ssh_connection(node_id);

        let config = fx.config();
        // @ts-ignore
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

            await ssh.execute_command(`cd public_html/specs && rm -rf ${node_id}.zip && zip -r ${node_id}.zip .`,node_ssh_connection);

            await ssh.execute_command(`cd public_html/specs &&  node /nodejs/scp --host ${new_host_ip} --username ${new_host_username}  --password '${node.ssh.password}' --local-file-path '${node_id}.zip' --remote-file-path '/home/${new_host_username}/public_html/${node_id}.zip'`,node_ssh_connection);

            await ssh.execute_command(`cd public_html/specs && rm -rf ${node_id}.zip`,node_ssh_connection);

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

            await ssh.execute_command(`mv public_html/${node_id}.zip ${node_id}.zip && cd public_html && rm -rf * && rm -rf .*`,ssh_connection);

            let gitToken = (await fx.currentGitToken()).portalBeta;

            await ssh.execute_command(`cd public_html && git init && git config user.name icitify && git config user.email icitifyportals@gmail.com && git remote add origin https://icitify:${gitToken}@github.com/icitify/portal-beta && git pull origin master && mkdir specs && mv ../${node_id}.zip specs/${node_id}.zip && cd specs && unzip -o ${node_id}.zip && rm -rf ${node_id}.zip`,ssh_connection);
        }

        

        await fx.shellExec(`_ set nodes.${node_id}.host ${new_host_ip}`);
        await fx.shellExec(`_ set nodes.${node_id}.ssh.username ${new_host_username}`);
        await fx.shellExec(`_ set nodes.${node_id}.ftp.user ${new_host_username}`);


        await fx.shellExec(`_ generate settings.json -n ${node_id}`);

        await ssh.execute_command(`cd public_html && npm i ejs && cd updates && npm i && node run.js`,ssh_connection);
        
        if(!argv.d){
            // await fx.shellExec(`webman run update htaccess --node-id ${node_id}`).catch(e=>{});
            // await fx.shellExec(`webman run update cronjob --node-id ${node_id}`).catch(e=>{});
            
            await fx.shellExec(`_ cloudflare dns update -h ${new_host_ip} -n ${node_id}`);
        }
            
        console.log(`\nCheck IP Address: ${node.node_url}/ip-address`);

        console.log(`\nNode URL: ${node.node_url}\n\n`);
        

        ssh_connection.dispose();
        ssh_root_connection.dispose();
        node_ssh_connection.dispose();
        node_root_ssh_connection.dispose();


    }
})();