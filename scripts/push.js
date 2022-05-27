"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fx = require("./lib/functions");
const ssh = require("./lib/ssh");
const path = require("path");
const os = require("os");
const commander_1 = require("commander");
const chalk = require("chalk");
let program = new commander_1.Command();
const documentRoot = fx.document_root();
program
    .name("webman push")
    .description("Push object to remote locations");
program
    .command("public-key")
    .name("public-key")
    .description("upload public key to nodes using username and password")
    .argument("[nodeId]", "NodeId to push receive public key")
    .option("-z,--root-ip <root-ip-address>", "IP Address of root in config")
    .action(async (nodeId, flags) => {
    if (nodeId) {
        let node = fx.node(nodeId);
        let sshConnection = await ssh.nodeSSHConnection(nodeId);
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
program
    .command("config")
    .name("config")
    .description("upload config to nodes")
    .argument("[nodeId]", "NodeId to push receive public key")
    .option("--remote", "Upload whole config to all remotes in configRemotes using ssh")
    .option("-a,--all", "Upload config to all nodes")
    .action(async (nodeId, flags) => {
    let config = fx.config();
    if (nodeId) {
        pushConfig(nodeId);
    }
    if (flags.all) {
        let nodeIds = fx.activeNodeIds();
        fx.println();
        for (let nodeId of nodeIds) {
            let node = fx.node(nodeId);
            console.log(chalk.cyanBright(`----------------------------  ${node.name || ""} (${nodeId})  --------------------`));
            await pushConfig(nodeId);
            console.log(`\n\n`);
        }
    }
    if (flags.remote) {
        for (let remote of config.remotes) {
            console.log(chalk.magentaBright(`\nPushing to ${remote}\n`));
            await fx.shellExec(`scp ${documentRoot}/.webman/config.json ${remote}`);
        }
    }
});
program.parse();
async function pushConfig(nodeId) {
    let config = fx.config();
    let node = fx.node(nodeId);
    let tmpFile = fx.newTmpFile("json");
    node = Object.assign({ nodeId }, node);
    fs.writeFileSync(tmpFile, JSON.stringify(node, null, 4));
    let sshConnection;
    await ssh.nodeSSHConnection(nodeId).then(x => {
        sshConnection = x;
    });
    await ssh.node_upload_file(fx.relativeToDocumentRoot(tmpFile), fx.remoteNodeDir(nodeId).concat("/" + (config.nodeConfigName || "webman.config.json")), nodeId, sshConnection);
    let rootSSHConnection = await ssh.nodeRootSSHConnection(nodeId);
    let cnfTmp = fx.newTmpFile("json");
    fs.writeFileSync(cnfTmp, `[client]
user = ${node.mysql.username}
password = ${node.mysql.password}
`);
    await ssh.node_upload_file(fx.relativeToDocumentRoot(cnfTmp), `/home/${node.ssh.username}/.my.cnf`, nodeId, rootSSHConnection);
    sshConnection.dispose();
    rootSSHConnection.dispose();
    fs.unlinkSync(tmpFile);
    fs.unlinkSync(cnfTmp);
}
