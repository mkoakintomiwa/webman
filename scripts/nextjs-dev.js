"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fx = require("./lib/functions");
const commander_1 = require("commander");
const chalk = require("chalk");
const ssh = require("./lib/ssh");
let program = new commander_1.Command();
const documentRoot = fx.document_root();
program
    .name("webman nextjs-dev")
    .description("NextJS development tools");
program
    .command("init")
    .name("init")
    .description("Initialize NextJS in remote node")
    .argument("[nodeId]", "NodeId to initiate NextJS development")
    .action(async (nodeId) => {
    let node = fx.node(nodeId);
    let config = fx.config();
    let sshConnection = await ssh.nodeSSHConnection(nodeId);
    let remoteDir = fx.remotePublicHtml(nodeId);
    if (!config.git || !config.git.config) {
        console.log("Git config required");
        process.exit();
    }
    await ssh.execute_command(`rm -rf * .*`, sshConnection, {
        cwd: remoteDir
    });
    await ssh.execute_command(`git init && git config user.name "${config.git.config.user.name}" && git config user.email "${config.git.config.user.email}"`, sshConnection, {
        cwd: remoteDir
    });
    await ssh.upload_file(fx.template_path("nextjs-dev/.gitignore"), `${remoteDir}/.gitignore`, sshConnection);
    await ssh.upload_file(fx.template_path("nextjs-dev/deploy.php"), `${remoteDir}/deploy.php`, sshConnection);
    await ssh.upload_file(fx.template_path("nextjs-dev/deploy.sh"), `${remoteDir}/deploy.sh`, sshConnection);
    await ssh.execute_command(`chmod +x deploy.sh && git add . && git commit -am "NextJS Development tools install by webman" && git branch -M main`, sshConnection, {
        cwd: remoteDir
    });
    sshConnection.dispose();
});
program.parse();
