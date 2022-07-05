import * as fx from "./lib/functions"
import { Command } from "commander";

let program = new Command();

program
    .description("Open node in VSCode remote SSH")
    .argument("<nodeId>","The node ID of the node, also the hostname of the SSH config")
    .action(async (nodeId, flags)=>{
        let node =fx.node(nodeId);
        fx.openInBrowser(node.nodeUrl);
    });

program.parse();