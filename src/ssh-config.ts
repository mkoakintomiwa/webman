import * as fx from "./lib/functions"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { Argument, Command } from "commander";
const SSHConfig = require('ssh-config');

let program = new Command();

const actions = ["generate"] as const;

program
    .description("Activities on ssh-config")
    .addArgument(
        new Argument("<ssh-config>","Actions on ssh-config").choices(actions)
    )
    .action((action: typeof actions[number])=>{
        switch(action){
            case "generate":
                const config = SSHConfig.parse('');
                let activeNodeIds = fx.activeNodeIds();
 
                for (let nodeId of activeNodeIds){
                    let node = fx.node(nodeId);
                    
                    config.append({
                        Host: fx.hostname(nodeId),
                        User: node.ssh.username,
                        HostName: node.host,
                        PasswordAuthentication: "false",
                        PubkeyAuthentication: "true",
                        IdentityFile: node.ssh.privateKey
                    });
                }

            fs.writeFileSync(
                path.join(
                    fx.documentRoot(),
                    ".ssh",
                    "config"
                ),
                SSHConfig.stringify(config)
            );

            console.log("Config created!");
        }
    })

program.parse();