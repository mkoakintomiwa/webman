const fx = require("./functions");
const argv = require("yargs").argv;
const chalk = require("chalk");
const db = require("./sqlite");
const ora = require("ora");
const cliSpinners = require('cli-spinners');
var Table = require('cli-table3');

let nodes = fx.config()["nodes"];

let historyName = "nodes-session";

const rl = fx.readlineInterface(historyName);

let connection;

if (argv["run"]){
    (async _=>{
           

        fx.setTerminalTitle("Nodes session");

        fx.println();
        
        const spinner = ora('Creating new nodes session').start();

        connection = db.connection();

        await db.execute("DROP TABLE IF EXISTS nodes;",[],connection);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS "nodes" (
                "id"	INTEGER,
                "node_id"	TEXT,
                PRIMARY KEY("id" AUTOINCREMENT)
            );
        `,[],connection);


        for(let node_id in nodes){
            let node = nodes[node_id];

            await db.execute(`INSERT INTO nodes (node_id) VALUES(?)`,[node_id],connection);

            let updateSubquery = "";
            let updateParameters = [];

            for (let key in node){
                let value = node[key];
                try{
                    await db.execute(`ALTER TABLE nodes ADD COLUMN "${key}" TEXT`,[],connection);
                }catch(e){}

                if (typeof value === "object"){
                    content = JSON.stringify(value);    
                }else{
                    content = value;
                }

                updateSubquery += `${key}=?,`;
                updateParameters.push(content);
            }

            updateParameters.push(node_id);

            updateSubquery = updateSubquery.replace(/\,$/,"");

            await db.execute(`UPDATE nodes SET ${updateSubquery} WHERE node_id=?`,updateParameters,connection);
        }

        spinner.stop();

        console.log(`Nodes session, query all nodes details with SQL

Copyright (c) 2021, webman.

Type 'exit;' to quit session.
`)

        fx.println();

        await runNodes();
    })();
        
}else{
    for (let node_id of fx.node_ids()){
        fx.println();
        let node = fx.node(node_id);
        fx.println(`${node.name} * Node ID: ${node_id}`);
    }
}



async function runNodes(){
    
    await new Promise(function(resolve){
        
        rl.question(chalk.cyanBright(">>> "), (answer) => {
            command = answer;
            fx.saveReadlineInterfaceHistory(historyName,rl.history);
            resolve();
        });
    });
    
    let exitCommands = ["exit","die"];

    if (exitCommands.includes(command.trim()) || exitCommands.map(x=>x+";").includes(command.trim())){
        connection.close();
        rl.close();
        fx.println();
        fx.println();
    }else{
        
        let records = await db.fetch(command,[],connection);

        var table = new Table({
            head: ['Node ID', 'Name', 'IP Address','SSH Username','SSH Password'].map(x=>chalk.yellowBright(x))
        });

        for(let record of records){
            let ssh = JSON.parse(record.ssh);
            table.push([record.node_id,record.name, record.host, ssh.username, ssh.password]);
        }

        console.log(table.toString());
        fx.println()

        await runNodes();
    }
};