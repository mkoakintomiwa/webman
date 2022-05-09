import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import * as fx from "./lib/functions"
import { Command } from 'commander'
const SSHConfig = require("ssh-config");

const program = new Command();

const sshPath = path.join(os.homedir(),".ssh");
const configPath = path.join(sshPath,"config");

program
    .name('vscode-remote')
    .description('VS Code Remote from config')
    .version('0.0.1')

    .argument("<hostname>","SSH Hostname")
    .argument("[home]", "default home")
    
    .action(async (hostname,home)=>{
        await fx.shellExec(`code --remote ssh-remote+${hostname} ${home || ""}`);    
    })
    
.parse();