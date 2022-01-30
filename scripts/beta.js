const fx = require("./functions");
const ssh = require("./ssh");
const path = require("path");
const argv = require("yargs").parseSync();

const context = argv._[0];

let nodeID = argv["n"] || argv["node-id"];

(async _=>{
    switch(context){
        case "clone":
            let nodeID = argv._[1]; 
            let node = fx.node(nodeID);
            let betaNode = fx.node("beta");
            
            console.log(`Connecting to ${node.name}`);
            let nodeSSHConnection = await ssh.node_ssh_connection(nodeID);
            console.log(`Connected`);
            
            console.log(`Connecting to ${betaNode.name}`);
            let betaSSHConnection = await ssh.node_ssh_connection("beta");
            console.log(`Connected`);

            await ssh.execute_command(`rm -rf specs.zip && zip -r specs.zip specs && node /nodejs/scp --host ${betaNode.host} --username ${betaNode.ssh.username}  --password '${betaNode.ssh.password}' --local-file-path 'specs.zip' --remote-file-path '${fx.remote_node_dir("beta")}/specs.zip' && rm -rf specs.zip`,nodeSSHConnection,{
                cwd: fx.remote_node_dir(nodeID)
            });


            await fx.shell_exec(`_ generate settings.json -n ${nodeID}`);


            let dbIndex = 0;
            for (let dbName of node.mysql.databases){
            
                await ssh.execute_command(`cd /home/${node.ssh.username} && mysqldump ${dbName} > database-${dbIndex}.sql && node /nodejs/scp --host ${betaNode.host} --username ${betaNode.ssh.username}  --password '${betaNode.ssh.password}' --local-file-path 'database-${dbIndex}.sql' --remote-file-path '/home/${betaNode.ssh.username}/database-${dbIndex}.sql' && rm -rf database-${dbIndex}.sql`, nodeSSHConnection);

                dbIndex++;
    
            }


            await ssh.execute_command(`rm -rf specs && unzip specs.zip && rm -rf specs.zip`,betaSSHConnection,{
                cwd: fx.remote_node_dir("beta")
            });


            dbIndex = 0;
            for (let dbName of betaNode.mysql.databases){
            
                await ssh.execute_command(`cd /home/${betaNode.ssh.username} && mysql --execute "DROP DATABASE IF EXISTS \\\`${dbName}\\\`; CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\` ;" && mysql "${dbName}" < database-${dbIndex}.sql && rm -rf database-${dbIndex}.sql`, betaSSHConnection);

                dbIndex++;
    
            }

            nodeSSHConnection.dispose();
            betaSSHConnection.dispose();
    }
})();