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
    .action(async(nodeId)=>{
        console.log(fx.nodeIp(nodeId));
    });

program.parse();