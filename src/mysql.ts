import * as fs from "fs"
import * as fx from "./lib/functions"
import * as ssh from "./lib/ssh"
import * as path from "path"

const argv = require("yargs").argv;
const chalk = require("chalk");


const context = argv._[0];
const first_intent = argv._[1];
const second_intent = argv._[2];
const $node_id = argv["node-id"] || argv["n"];
const $node = fx.node($node_id);
let $host = argv["host"] || "localhost"

let _node_ids;
if (argv["n"]){
    _node_ids = [argv["n"]];
}else if (argv["node-id"]){
    _node_ids = [argv["node-id"]];
}else{
    _node_ids = fx.nodeIds();
}

fx.println();

(async _=>{
    if (argv["rigid-host"]){
        await fx.rigid_public_ip().then(d=>{
            $host = d;
        });
    }
    switch(context){
        case "add":
            var rigid_public_ip;
            await fx.rigid_public_ip().then(ip=>{
                rigid_public_ip = ip;
            });

            switch(first_intent){

                case "user":
                    var _node_id = $node_id;

                    _node = fx.node(_node_id);
                    var _mysql = _node.mysql;
                    var db_user = _mysql.username;

                    sshConnection = await ssh.nodeRootSSHConnection(_node_id);

                    var command = `mysql --execute "CREATE USER '${db_user}'@'localhost' IDENTIFIED BY '${_mysql.password}'";`;
                    console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                    await ssh.executeCommand(command,sshConnection)

                    for (var db_name of _node.mysql.databases){
                        command = `mysql --execute "GRANT ALL ON ${db_name}.* TO '${db_user}'@'localhost';flush privileges;"`;
                                
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.executeCommand(command,sshConnection);
                        console.log("");
                    }

                    sshConnection.dispose();
                break;

                case "databases":
                    let node_id = $node_id;

                    _node = fx.node(node_id);

                    await ssh.nodeRootSSHConnection(node_id).then(x=>{
                        sshConnection = x;
                    });

                    for (let db_name of _node.mysql.databases){
            
                        var command = `mysql --execute "CREATE DATABASE IF NOT EXISTS ${db_name} "`;
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.executeCommand(command,sshConnection)
                    }
                    sshConnection.dispose();
                break;

                case "remote-host":
                
                    for (let node_id of _node_ids){
                        var _node = fx.node(node_id);
                        var _mysql = _node.mysql;
                        var db_user = _mysql.username;
                        var db_password = _mysql.password;
                        var remote_host = second_intent?second_intent:rigid_public_ip;


                        var sshConnection;
                        await ssh.nodeRootSSHConnection(node_id).then(x=>{
                            sshConnection = x;
                        });

                        var command = `mysql --execute "CREATE USER '${db_user}'@'${remote_host}' IDENTIFIED BY '${db_password}';"`;
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.executeCommand(command,sshConnection);
                        console.log("");
                        
                        if (argv["all-db"]){
                            command = `mysql --execute "GRANT ALL ON *.* TO '${db_user}'@'${remote_host}';flush privileges;"`;
                                
                            console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                            await ssh.executeCommand(command,sshConnection);
                            console.log("");
                        }else{
                            for (let db_name of _mysql.databases){
                                command = `mysql --execute "GRANT ALL ON ${db_name}.* TO '${db_user}'@'${remote_host}';flush privileges;"`;
                                
                                console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                                await ssh.executeCommand(command,sshConnection);
                                console.log("");
                            }
                        }
                        
                        sshConnection.dispose();
                    }
                break;


            }
        break;

        
        case "database":
            var dbName = first_intent;
            var node_id = argv["node"];
            var sshConnection;
            await ssh.nodeRootSSHConnection(node_id).then(x=>{
                sshConnection = x;
            });

            var command = `mysql --execute "CREATE DATABASE IF NOT EXISTS ${dbName} "`;
            console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
            await ssh.executeCommand(command,sshConnection)
            sshConnection.dispose();
        break;


        case "change":
            switch(first_intent){
                case "password":
                    sshConnection = ssh.nodeRootSSHConnection($node_id);
                    
                    var _mysql = $node.mysql;
                    
                    var command = `mysql --execute "ALTER USER ${_mysql.username}@'${$host}' IDENTIFIED BY '${_mysql.password}';"`;
                    console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                    await ssh.executeCommand(command,sshConnection)
                    
                    sshConnection.dispose();
                break;
            }
    }
})();

