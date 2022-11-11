import * as fs from "fs"
import * as fx from "./lib/functions"
import * as path from "path"

const argv = require("yargs").argv;
const chalk = require("chalk");

const nodeId = argv._[0];

if (argv["root"]){
    fx.nodeRootOpenPhpmyadmin(nodeId);
}else{
    fx.nodeOpenPhpmyadmin(nodeId);
}

console.log(`Run 'webman install phpmyadmin --node-id ${nodeId}' if phpmyadmin directory does not exist`);