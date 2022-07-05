"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fx = require("./lib/functions");
const commander_1 = require("commander");
let program = new commander_1.Command();
program
    .description("Open node in VSCode remote SSH")
    .argument("<nodeId>", "The node ID of the node, also the hostname of the SSH config")
    .action(async (nodeId, flags) => {
    let node = fx.node(nodeId);
    fx.openInBrowser(node.nodeUrl);
});
program.parse();
