const fx = require("./functions");

for (let node_id of fx.node_ids()){
    fx.println();
    let node = fx.node(node_id);
    fx.println(`${node.name} * Node ID: ${node_id}`);
}