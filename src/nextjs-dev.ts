import * as fx from "./lib/functions"
import * as fs from "fs"
import * as path from "path"
import { Command } from "commander";
const chalk = require("chalk");
import * as https from "https";
import * as url from 'url';
import * as ssh from "./lib/ssh"
import * as os from "os"

let program = new Command();

const documentRoot = fx.documentRoot();

program
    .name("webman nextjs-dev")
    .description("NextJS development tools");

program
    .command("init")
    .name("init")
    .description("Initialize NextJS in remote node")
    .argument("<nodeId>","NodeId to initiate NextJS development")
    .action(async(nodeId)=>{
        let node = fx.node(nodeId);

        let config = fx.config();
            
        const sshConnection = await ssh.nodeSSHConnection(nodeId);

        let remoteDir = fx.remotePublicHtml(nodeId);

        if (!config.git || !config.git.config){
            console.log("Git config required");
            process.exit();
        }

        await ssh.nodeExecuteCommands([
            `rm -rf * .*`,
            `git init && git config user.name "${config.git.config.user.name}" && git config user.email "${config.git.config.user.email}"`
        ], nodeId, sshConnection);

        await ssh.putDirectory(fx.templatePath("nextjs-dev"), remoteDir, sshConnection, {
            validate: (itemPath) => path.basename(itemPath) !== ".gitlab-ci.yml"
        });

        fx.println();

        await ssh.nodeExecuteCommand(`chmod +x deploy.sh && git add . && git commit -am "NextJS Development tools install by webman" && git branch -M main`, nodeId, sshConnection);

        sshConnection.dispose();
    });



program
    .command("get-ci-config")
    .name("get-ci-config")
    .description("Initialize NextJS in remote node")
    .argument("<domain-name>","Domain name of application")
    .action(async(domainName)=>{
        let content = fx.templateContent("nextjs-dev/.gitlab-ci.yml");
        fs.writeFileSync(".gitlab-ci.yml", content.replace(`{{ domainName }}`, domainName));
        fx.println();
        console.log(".gitlab-ci.yml created")
        fx.println();
    });

program.parse();