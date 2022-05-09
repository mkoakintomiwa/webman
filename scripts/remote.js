"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
const fx = require("./lib/functions");
const commander_1 = require("commander");
const SSHConfig = require("ssh-config");
const program = new commander_1.Command();
const sshPath = path.join(os.homedir(), ".ssh");
const configPath = path.join(sshPath, "config");
program
    .name('vscode-remote')
    .description('VS Code Remote from config')
    .version('0.0.1')
    .argument("<hostname>", "SSH Hostname")
    .argument("[home]", "default home")
    .action(async (hostname, home) => {
    await fx.shellExec(`code --remote ssh-remote+${hostname} ${home || ""}`);
})
    .parse();
