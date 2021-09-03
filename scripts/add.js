const fs = require("fs");
const fx = require("./functions");
const ssh = require("./ssh");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");


const context = argv._[0];
const first_intent = argv._[1];
const second_intent = argv._[2];
const $node_id = argv["node-id"]; 

let _node_ids;
if (argv["node-id"]){
    _node_ids = [argv["node-id"]];
}else{
    _node_ids = fx.node_ids();
}

fx.println();

(async _=>{
    switch(context){
        case "mysql":
            var rigid_public_ip;
            await fx.rigid_public_ip().then(ip=>{
                rigid_public_ip = ip;
            });

            switch(first_intent){

                case "user":
                    var _node_id = second_intent;

                    _node = fx.node(_node_id);
                    var _mysql = _node.mysql;
                    var db_user = _mysql.username;

                    await ssh.node_root_ssh_connection(_node_id).then(x=>{
                        ssh_connection = x;
                    });

                    var command = `mysql --execute "CREATE USER '${db_user}'@'localhost' IDENTIFIED BY '${_mysql.password}'";`;
                    console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                    await ssh.node_root_execute_command(command,ssh_connection)

                    for (var db_name of _node.mysql.databases){
                        command = `mysql --execute "GRANT ALL ON ${db_name}.* TO '${db_user}'@'localhost';flush privileges;"`;
                                
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.node_root_execute_command(command,ssh_connection);
                        console.log("");
                    }

                    ssh_connection.dispose();
                break;

                case "databases":
                    let node_id = second_intent;

                    _node = fx.node(node_id);

                    await ssh.node_root_ssh_connection(node_id).then(x=>{
                        ssh_connection = x;
                    });

                    for (let db_name of _node.mysql.databases){
            
                        var command = `mysql --execute "CREATE DATABASE IF NOT EXISTS ${db_name} "`;
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.node_root_execute_command(command,ssh_connection)
                    }
                    ssh_connection.dispose();
                break;

                case "remote-host":
                    
                    for (let node_id of _node_ids){
                        var _node = fx.node(node_id);
                        var _mysql = _node.mysql;
                        var db_user = _mysql.username;
                        var db_password = _mysql.password;
                        var remote_host = second_intent?second_intent:rigid_public_ip;


                        var ssh_connection;
                        await ssh.node_root_ssh_connection(node_id).then(x=>{
                            ssh_connection = x;
                        });

                        var command = `mysql --execute "CREATE USER '${db_user}'@'${remote_host}' IDENTIFIED BY '${db_password}';"`;
                        console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                        await ssh.node_root_execute_command(command,ssh_connection);
                        console.log("");
                        
                        if (argv["all-db"]){
                            command = `mysql --execute "GRANT ALL ON *.* TO '${db_user}'@'${remote_host}';flush privileges;"`;
                                
                            console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                            await ssh.node_root_execute_command(command,ssh_connection);
                            console.log("");
                        }else{
                            for (let db_name of _mysql.databases){
                                command = `mysql --execute "GRANT ALL ON ${db_name}.* TO '${db_user}'@'${remote_host}';flush privileges;"`;
                                
                                console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
                                await ssh.node_root_execute_command(command,ssh_connection);
                                console.log("");
                            }
                        }
                        
                        ssh_connection.dispose();
                    }
                break;


            }
        break;

        
        case "database":
            var db_name = first_intent;
            var node_id = argv["node"];
            var ssh_connection;
            await ssh.node_root_ssh_connection(node_id).then(x=>{
                ssh_connection = x;
            });

            var command = `mysql --execute "CREATE DATABASE IF NOT EXISTS ${db_name} "`;
            console.log(chalk.magentaBright(`>>> `)+chalk.cyanBright(command));
            await ssh.node_root_execute_command(command,ssh_connection)
            ssh_connection.dispose();
        break;
    }
})();
