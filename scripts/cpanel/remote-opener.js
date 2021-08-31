const { open_in_browser, node } = require("../functions");
const yargv = require("yargs").argv;

/**
 * 
 * @param {string} sub_address example: `/3rdparty/phpMyAdmin/index.php?` which is between `https://${ssh.host}:2083` and `u=${ssh.username}&p=${ssh.password}`
 */
var opener = exports.opener = async function(sub_address,browser="chrome"){
    var node_id = yargv._[0];
    var _node = node(node_id);
    var ssh = _node.ssh;
    var port;
    
    if (_node.cpanel_type==="whm"){
        port = 2087;
    }else{
        port = 2083;
    }
    open_in_browser(`https://${_node.host}:${port}${sub_address}u=${ssh.username}&p=${ssh.password}`,browser);
};