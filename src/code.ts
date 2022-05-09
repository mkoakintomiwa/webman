import * as fx from "./lib/functions"
import { Command } from "commander";

let program = new Command();

program
    .description("Open node in VSCode remote SSH")
    .argument("<nodeId>","The node ID of the node, also the hostname of the SSH config")
    .option("-r, --root","Open the root of the node in VSCode remote SSH")
    .action(async (nodeId, flags)=>{
        let Host = fx.hostname(nodeId);
        let node = fx.node(nodeId);
        let sshUsername = null;

        if (node.ssh && node.ssh.username) sshUsername = node.ssh.username;

        let defaultRemoteDir: string;
        if (node.home){
            defaultRemoteDir = node.home;
        }else{
            if (sshUsername){
                defaultRemoteDir = `/home/${sshUsername}`;
            }else{
                defaultRemoteDir = '/home';
            } 
        }
        await fx.shellExec(`code --remote ssh-remote+${Host} ${defaultRemoteDir}`);
    });

program.parse();