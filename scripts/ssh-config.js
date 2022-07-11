"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fx = require("./lib/functions");
const fs = require("fs");
const path = require("path");
const commander_1 = require("commander");
const SSHConfig = require('ssh-config');
let program = new commander_1.Command();
const actions = ["generate"];
program
    .description("Activities on ssh-config")
    .addArgument(new commander_1.Argument("<ssh-config>", "Actions on ssh-config").choices(actions))
    .action((action) => {
    switch (action) {
        case "generate":
            const config = SSHConfig.parse('');
            let activeNodeIds = fx.activeNodeIds();
            for (let nodeId of activeNodeIds) {
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
            fs.writeFileSync(path.join(fx.documentRoot(), ".ssh", "config"), SSHConfig.stringify(config));
            console.log("Config created!");
    }
});
program.parse();
