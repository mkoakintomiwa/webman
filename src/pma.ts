import * as fx from "./lib/functions"
import { spawnSync } from "child_process"

const argv = require("yargs").argv;
const chalk = require("chalk");

const nodeId = argv._[0];
(async () => {
    if (argv["root"]){
        fx.nodeRootOpenPhpmyadmin(nodeId);
    }else{
        const node = fx.node(nodeId);
        const mysql = node.mysql;
        let pmaLink = `${node.nodeUrl}/phpmyadmin/${mysql.phpmyadminAuthKey}`;
        let output = spawnSync("bash",["-c", `curl -I ${pmaLink} | head -n 1`]).stdout.toString();
        let statusCode = parseInt(output.split(/\s+/)[1]);
        
        if (statusCode === 404){
            await fx.shellExec(`webman install phpmyadmin --node-id ${nodeId}`)
        }
        fx.nodeOpenPhpmyadmin(nodeId);
    }
})();
