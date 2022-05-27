const fx = require("./lib/functions");
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
            let nodeSSHConnection = await ssh.nodeSSHConnection(nodeId);
            console.log(`Connected`);
            
            console.log(chalk.magentaBright(`Connecting to ${betaNode.name}`));
            let betaSSHConnection = await ssh.nodeSSHConnection("beta");
            console.log(`Connected`);

            

            if (!argv["x"]){
                
                if (!argv["db-only"]){
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
                }



                await fx.shellExec(`_ generate settings.json -n ${nodeId}`);


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
            }

            if (!argv["db-only"]){
                console.log(chalk.cyanBright("Extracting specs.zip"));
                await betaSSHConnection.exec(`rm -rf ${fx.remoteNodeDir("beta")}/specs && cd ${fx.remoteNodeDir("beta")} && unzip ${fx.remoteDir("beta")}/specs.zip && rm -rf ${fx.remoteDir("beta")}/specs.zip`,[],{
                    cwd: fx.remoteNodeDir("beta")
                });
            }


            dbIndex = 0;
            for (let dbName of betaNode.mysql.databases){
            
                await betaSSHConnection.exec(`cd /home/${betaNode.ssh.username} && mysql --execute "DROP DATABASE IF EXISTS \\\`${dbName}\\\`; CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\` ;" && mysql "${dbName}" < database-${dbIndex}.sql && rm -rf database-${dbIndex}.sql`,[]);

                dbIndex++;
    
            }

            nodeSSHConnection.dispose();
            betaSSHConnection.dispose();
    }
})();