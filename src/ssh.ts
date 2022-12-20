import * as fs from "fs"
import * as fx from "./lib/functions"
import * as ssh from "./lib/ssh"
import * as path from "path"
import * as os from "os"
import { Command } from "commander";
const chalk = require("chalk");

let program = new Command();

const documentRoot = fx.documentRoot();

program
    .name("webman ssh")
    .description("SSH into node")
    .argument("[nodeId]","NodeId to push receive public key")
    .option("--hostname","Indicate remote dev for hostname, --ip required",false)
    .option("--ip <ip-address>","IP Address of the root node")
    .option("-z,--root-ip <root-ip-address>","IP Address of root in config")
    .action(async(nodeId,flags)=>{
        if (nodeId){
            let node = fx.node(nodeId);
            console.log();
            fx.shellExec(`ssh -t ${node.ssh.username}@${node.host} "cd ${node.home} ; bash --login"`);
        }else if (flags.hostname){
            
            let ip = flags.ip;

            let root = fx.root(ip);
    

        }else if (flags.rootIp){
            
            let rootIp = flags.rootIp;
            
        }
    });

program.parse();