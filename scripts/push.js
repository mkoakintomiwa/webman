"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fx = require("./lib/functions");
const ssh = require("./lib/ssh");
const path = require("path");
const os = require("os");
const commander_1 = require("commander");
let program = new commander_1.Command();
program
    .name("webman push")
    .description("Push object to remote locations");
program
    .command("public-key")
    .name("public-key")
    .description("upload public to nodes using username and password")
    .argument("[nodeId]", "NodeId to push receive public key")
    .option("-z,--root-ip <root-ip-address>", "IP Address of root in config")
    .action(async (nodeId, flags) => {
    if (nodeId) {
        let node = fx.node(nodeId);
        let sshConnection = await ssh.node_ssh_connection(nodeId);
        let publicKeyPath = path.join(os.homedir(), ".ssh", "id_rsa.pub");
        let remoteHomeDir = `/home/${node.ssh.username}`;
        await ssh.upload_file(publicKeyPath, `${remoteHomeDir}/authorized_keys.chunk`, sshConnection);
        await ssh.execute_command(`mkdir -p .ssh && chmod 700 .ssh && cat authorized_keys.chunk >> .ssh/authorized_keys && chmod 644 .ssh/authorized_keys && rm authorized_keys.chunk`, sshConnection, {
            cwd: remoteHomeDir
        });
        sshConnection.dispose();
        console.log(`\nPublic key successfully uploaded\n`);
    }
    else if (flags.rootIp) {
        let rootIp = flags.rootIp;
        let sshConnection = await ssh.root_ssh_connection(rootIp);
        let publicKeyPath = path.join(os.homedir(), ".ssh", "id_rsa.pub");
        let remoteHomeDir = `/root`;
        await ssh.upload_file(publicKeyPath, `${remoteHomeDir}/authorized_keys.chunk`, sshConnection);
        await ssh.execute_command(`mkdir -p .ssh && chmod 700 .ssh && cat authorized_keys.chunk >> .ssh/authorized_keys && chmod 644 .ssh/authorized_keys && rm authorized_keys.chunk`, sshConnection, {
            cwd: remoteHomeDir
        });
        sshConnection.dispose();
        console.log(`\nPublic key successfully uploaded\n`);
    }
});
program.parse();
