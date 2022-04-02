const fx = require("./functions");
const ssh = require("./ssh");
const path = require("path");
const argv = require("yargs").parseSync();
const cliBar = require("./cli-bar");
const cliLog = require("./cli-log");
const chalk = require("chalk");
const context = argv._[0];

(async _=>{
    switch(context){
        case "clone":
            let nodeId = argv._[1]; 
            let node = fx.node(nodeId);
            let betaNode = fx.node("beta");
            
            console.log(chalk.magentaBright(`Connecting to ${node.name}`));
            let nodeSSHConnection = await ssh.node_ssh_connection(nodeId);
            console.log(`Connected`);
            
            console.log(chalk.magentaBright(`Connecting to ${betaNode.name}`));
            let betaSSHConnection = await ssh.node_ssh_connection("beta");
            console.log(`Connected`);

            // await ssh.execute_command(`rm -rf specs.zip && zip -r specs.zip specs && node /nodejs/scp --host ${betaNode.host} --username ${betaNode.ssh.username}  --password '${betaNode.ssh.password}' --local-file-path 'specs.zip' --remote-file-path '${fx.remoteNodeDir("beta")}/specs.zip' && rm -rf specs.zip`,nodeSSHConnection,{
            //     cwd: fx.remoteNodeDir(nodeId)
            // });


            // await ssh.execute_command(`rm -rf specs.tar && tar cvf specs.tar specs && scp specs.tar ${betaNode.ssh.username}@${betaNode.host}:${fx.remoteNodeDir("beta")}/specs.tar && rm -rf specs.tar`,nodeSSHConnection,{
            //     cwd: fx.remoteNodeDir(nodeId)
                
            // });


            console.log(chalk.cyanBright("Archiving specs directory"));
            await nodeSSHConnection.exec(`rm -rf specs.zip && zip -r ${fx.remoteDir(nodeId)}/specs.zip specs/*`,[],{ 
                cwd: fx.remoteNodeDir(nodeId)
            });


            console.log(chalk.cyanBright(`\nUploading specs.zip to ${betaNode.ssh.username}@${betaNode.host}`));
            const bar = cliBar("specs.zip");
            await nodeSSHConnection.exec(`node /nodejs/scp specs.zip ${betaNode.ssh.username}@${betaNode.host}:${fx.remoteDir("beta")}/specs.zip  -p '${betaNode.ssh.password}' && rm -rf specs.zip`,[],{ 
                cwd: fx.remoteDir(nodeId), 
                onStdout: chunk => {
                    bar.update(fx.percentageChunk(chunk));
                }
            });

            bar.stop();




            await fx.shell_exec(`_ generate settings.json -n ${nodeId}`);


            console.log(chalk.cyanBright(`\nUploading database dumps to ${betaNode.ssh.username}@${betaNode.host} \n`));

            let dbIndex = 0;
            for (let dbName of node.mysql.databases){

                let bar = cliBar(`database-${dbIndex}.sql`);

                await nodeSSHConnection.exec(`mysqldump ${dbName} > database-${dbIndex}.sql && node /nodejs/scp database-${dbIndex}.sql ${betaNode.ssh.username}@${betaNode.host}:${fx.remoteDir("beta")}/database-${dbIndex}.sql -p '${betaNode.ssh.password}' && rm -rf database-${dbIndex}.sql`,[],{
                    cwd: fx.remoteDir(nodeId),
                    onStdout: chunk => {
                        bar.update(fx.percentageChunk(chunk));
                    }
                });

                bar.stop();

                fx.println();

                dbIndex++;
    
            }


            console.log(chalk.cyanBright("Extracting specs.zip"));
            await betaSSHConnection.exec(`rm -rf ${fx.remoteNodeDir("beta")}/specs && cd ${fx.remoteNodeDir("beta")} && unzip ${fx.remoteDir("beta")}/specs.zip && rm -rf ${fx.remoteDir("beta")}/specs.zip`,[],{
                cwd: fx.remoteDir("beta")
            });


            dbIndex = 0;
            for (let dbName of betaNode.mysql.databases){
            
                await betaSSHConnection.exec(`cd /home/${betaNode.ssh.username} && mysql --execute "DROP DATABASE IF EXISTS \\\`${dbName}\\\`; CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\` ;" && mysql "${dbName}" < database-${dbIndex}.sql && rm -rf database-${dbIndex}.sql`,[]);

                dbIndex++;
    
            }

            nodeSSHConnection.dispose();
            betaSSHConnection.dispose();
    }
})();