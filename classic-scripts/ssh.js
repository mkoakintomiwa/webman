import { NodeSSH } from "node-ssh";
import * as fx from "./functions.js";


/**
 * @param {*} options
 * @return {Promise<NodeSSH>}
 */
export async function sshConnection(options={}){
    options = sshOptions(options);
    var ssh = new NodeSSH();
    
    await new Promise((resolve,reject)=>{
        try{
            ssh.connect(options).then(() => {
                resolve();
            }).catch(e=>{
                console.log(e);
                console.log(options);
                resolve();
            });
        }catch(e){
            reject(e);
        }
    });
    return ssh;
}


/**
 * 
 * @param {*} options 
 * @returns 
 */
function sshOptions(options){
    
    options = fx.setDefaults({
        readyTimeout: 99999,
        port:22,
        cwd:null,
        raw_ppk:false,
        show_put_file:true,
        show_spinner:true
    },options); 

    return {
        host: options.host,
        username: options.username,
        privateKey: options.privateKey,
        password:options.password,
        passphrase:options.passphrase,
        readyTimeout: options.readyTimeout,
        port:options.port,
        cwd:options.cwd,
        raw_ppk:options.raw_ppk,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}

/**
 * 
 * @param {string} rootIp 
 * @param {*} options 
 * @returns {*}
 */
function rootSSHOptions(rootIp, options={}){
    options = fx.setDefaults({
        cwd: null,
        show_put_file:true,
        show_spinner:true
      },options); 
      
      let _root = fx.root(rootIp);

      return {
        host: rootIp,
        username: _root.username,
        password: _root.password,
        //cwd:options.cwd,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}


// /**
//  * 
//  * @param {string} nodeId 
//  * @param {*} options 
//  * @returns 
//  */
// function nodeRootSSHOptions(nodeId,options={}){
//     options = fx.setDefaults({
//         cwd: null,
//         show_put_file:true,
//         show_spinner:true
//       },options); 
      
//       var _node = fx.node(node_id);
//       var _node_root = fx.node_root(node_id);

//       return {
//         host: _node.host,
//         username: _node_root.username,
//         password: _node_root.password,
//         //cwd:options.cwd,
//         show_put_file:options.show_put_file,
//         show_spinner:options.show_spinner
//     }
// }


/**
 * 
 * @param {string} rootIp 
 * @param {*} options 
 * @returns 
 */
export function rootSSHConnection(rootIp, options={}){
    return sshConnection(rootSSHOptions(rootIp,options));
}



/**
 * 
 * @param {string} command 
 * @param {NodeSSH} sshConnection 
 * @param {SSHRemoteConnectionOptions} options 
 * @returns {Promise<string>}
 */
export function executeCommand(command,sshConnection,options={}){

    options = fx.setDefaults({
        cwd:null,
        silent: false
    },options);

    let output = "";

    return new Promise(resolve=>{
        try{
            sshConnection.exec(command, [], {
                cwd: options.cwd,
                onStdout(chunk) {
                    output += chunk.toString();
                    if (!options.silent) console.log(chunk.toString());
                },
                onStderr(chunk) {
                    output += chunk.toString();
                    if (!options.silent) console.log(chunk.toString('utf8'))
                }
            }).then(() => {
                resolve(output);
            }).catch(() => {
                resolve(output);
            })
        }catch(e){
            if (!options.silent) console.log(e);
            resolve(output);
        }
    });
}