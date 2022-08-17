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
    .name("webman interactive")
    .name("interactive")
    .description("upload public key to nodes using username and password")
    .argument("<nodeId>","NodeId to push receive public key")
    .option("-z,--root-ip <root-ip-address>","IP Address of root in config")
    .action(async(nodeId,flags)=>{
        if (nodeId){
            await ssh.nodeInteractiveShell(nodeId);
        }else if (flags.rootIp){
           
        }
    });

program.parse();