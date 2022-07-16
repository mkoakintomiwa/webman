import * as fx from "./lib/functions"
import * as ssh from "./lib/ssh"

const argv = require("yargs").argv;

let nodeId = fx.arg_node_ids(argv)[0];

(async _=>{
    fx.println();
    let ssh_connection = await ssh.nodeSSHConnection(nodeId);
    await ssh.nodeGetFile(argv._[0],nodeId,ssh_connection);
    ssh_connection.dispose();
})();