const fx = require("./lib/functions");
const ssh = require("./ssh");
const argv = require("yargs").argv;

let node_id = fx.arg_node_ids(argv)[0];

(async _=>{
    fx.println();
    let ssh_connection = await ssh.node_ssh_connection(node_id);
    await ssh.node_get_file(argv._[0],node_id,ssh_connection);
    ssh_connection.dispose();
})();