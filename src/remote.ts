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
    
    .action(async (hostname)=>{

        if (!fs.existsSync(sshPath)) fs.mkdirSync(sshPath);
        if (!fs.existsSync(configPath)) fs.writeFileSync(configPath,"");
        
        let configContent = fs.readFileSync(configPath).toString();
        const config = SSHConfig.parse(configContent);

        let section = config.find({ Host: hostname });

        let homeDir = "";

        if (section){
            for (const line of section.config) {
                if (line.param === 'User') {
                    let User = line.value;
                    if (User === "root"){
                        homeDir = "/root"
                    }else{
                        homeDir = `/home/${User}`
                    }
                    break
                }
            }
        }

        await fx.shellExec(`code --remote ssh-remote+${hostname} ${homeDir}`);    
    })
    
    .parse(process.argv);