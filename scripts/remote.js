"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
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
    .action(async (hostname) => {
    if (!fs.existsSync(sshPath))
        fs.mkdirSync(sshPath);
    if (!fs.existsSync(configPath))
        fs.writeFileSync(configPath, "");
    let configContent = fs.readFileSync(configPath).toString();
    const config = SSHConfig.parse(configContent);
    let section = config.find({ Host: hostname });
    let homeDir = "";
    if (section) {
        for (const line of section.config) {
            if (line.param === 'User') {
                let User = line.value;
                if (User === "root") {
                    homeDir = "/root";
                }
                else {
                    homeDir = `/home/${User}`;
                }
                break;
            }
        }
    }
    await fx.shellExec(`code --remote ssh-remote+${hostname} ${homeDir}`);
})
    .parse(process.argv);
