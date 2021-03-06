import * as fx from "./lib/functions";
import * as db from "./lib/sqlite";

const chalk = require("chalk");
const argsParser = require('yargs-parser');
const argv = require("yargs").parseSync();

var Table = require('cli-table3');


let nodes = fx.config()["nodes"];
let nodeID = null;

let historyName = "nodes-session";

let connection;

let dbTransactions = `BEGIN TRANSACTION;`;

let dbColumns = [];

if (argv["run"]){
    (async _=>{
           

        fx.setTerminalTitle("Nodes session");
        
        //const spinner = ora('Creating new nodes session').start();

        connection = db.connection();

        loadNodes(connection);

        //spinner.stop();

        fx.println(`Nodes session, query all nodes details with SQL [GCC 10.2.0 64 bit (AMD64)] on win32`);

        fx.println(`Copyright (c) 2021, webman.`);

        fx.println(`Type 'exit;' to quit session.`);

        await runNodes();
    })();
        
}else{
    for (let nodeId of fx.nodeIds()){
        fx.println();
        let node = fx.node(nodeId);
        fx.println(`${node.name} * Node ID: ${nodeId}`);
    }
}



async function runNodes(){

    const rl = fx.readlineInterface(historyName);

    let command = "";
    
    await new Promise<void>(function(resolve){
        
        rl.question((nodeID?chalk.magentaBright(`[${fx.node(nodeID).name}] `):"")+chalk.cyanBright(">>> "), (answer) => {
            command = answer;
            // @ts-ignore
            fx.saveReadlineInterfaceHistory(historyName,rl.history);
            resolve();
        });
    });
    
    let exitCommands = ["exit","die"];

    let _command = command.trim();

    if (exitCommands.includes(command.trim()) || exitCommands.map(x=>x+";").includes(command.trim())){
        connection.close();
        rl.close();
        fx.println("Bye!");
        fx.println();
    }else{

        let _argv = argsParser(_command);
        let runContext = _argv._[0]||"";
        let runArgs = _command.replace(new RegExp(`^${runContext}`),"");

        let _nodeID = nodeID;

        if(_argv["n"]){
            _nodeID = _argv["n"];
        }

        if (runContext === "reload"){
            await loadNodes(connection);
            await runNodes();
        }else if (runContext === "use"){
            nodeID = _argv._[1];
            await fx.shellExec(`webman set test.node_id ${nodeID}`);
            fx.println();
            console.log("Node ID changed");

        }else if (["nodes"].includes(runContext)){
            await fx.shellExec(`webman get ${runContext}`);
        }else if( ["putty","fz","pma"].includes(runContext)){
            
            await fx.shellExec(`webman ${runContext} ${_nodeID} ${runArgs}`);
        
        }else if(["push"].includes(runContext)){

            if (_argv["all"]){
                await fx.shellExec(`webman ${runContext} ${runArgs} --node-id ${_nodeID}`);
            }else{
                await fx.shellExec(`webman ${runContext} ${runArgs} --node-id ${_nodeID} --test`);
            }

        } else if( ["generate","install","pull","push-dir"].includes(runContext)){
            
            await fx.shellExec(`webman ${runContext} ${runArgs} --node-id ${_nodeID}`);
        
        }else if( ["update","custom"].includes(runContext)){
            
            await fx.shellExec(`webman run ${runContext} ${runArgs} --node-id ${_nodeID}`);
        
        }else if(runContext === "get"){

            fx.println();

            if (_argv._[1]){
                console.log(fx.dottedParameter(fx.node(_nodeID),_argv._[1], nodes))
            }else{
                console.log(fx.node(_nodeID));
            }

        }else if (runContext === "test"){
            await fx.shellExec(`webman set test.node_id ${_nodeID}`);
        }else{
            let records = [];
        
            let _records = await db.fetch(command,[],connection);

            if (_records) records = _records;

            var table = new Table({
                head: ['Node ID', 'Name', 'IP Address','SSH Username','SSH Password'].map(x=>chalk.yellowBright(x))
            });

            for(let record of records){
                let ssh = JSON.parse(record.ssh);
                table.push([record.node_id,record.name, record.host, ssh.username, ssh.password]);
            }

            console.log(table.toString());
        }
        
        fx.println()

        await runNodes();
    }
};



async function loadNodes(connection){
    dbTransactions += `DROP TABLE IF EXISTS nodes;`;

    dbTransactions += `
        CREATE TABLE IF NOT EXISTS "nodes" (
            "id"	INTEGER,
            "node_id"	TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        );
    `;

    
    for(let node_id in nodes){
        let node = nodes[node_id];

        dbTransactions += `INSERT INTO nodes (node_id) VALUES('${node_id}');`;

        for (let key in node){
            if (!dbColumns.includes(key)) dbColumns.push(key);
        }
    }

    for (let column of dbColumns){
        dbTransactions += `ALTER TABLE nodes ADD COLUMN "${column}" TEXT;`;
    }

    for(let node_id in nodes){
        let node = nodes[node_id];

        let updateSubquery = "";
        let updateParameters = [];

        for (let key in node){
            let value = node[key];

            let content = '';

            if (typeof value === "object"){
                content = JSON.stringify(value);    
            }else{
                content = value;
            }

            if (typeof content === "string"){
                content = content.replace(/'/g,`''`);
                updateSubquery += `${key}='${content}',`;
            }
            //updateParameters.push(content);
        }

        //updateParameters.push(node_id);

        updateSubquery = updateSubquery.replace(/\,$/,"");

        dbTransactions += `UPDATE nodes SET ${updateSubquery} WHERE node_id='${node_id}';`;
    }

    dbTransactions += 'COMMIT;'


    await new Promise<void>(function(resolve){
        connection.exec(dbTransactions,function(){
            resolve();
        });
    });
}