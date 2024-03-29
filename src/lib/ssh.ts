import * as fx from "./functions";
const chalk = require('chalk');
import { NodeSSH, SSHExecOptions, SSHGetPutDirectoryOptions } from "node-ssh";
import { Client } from 'ssh2';
var readline = require('readline');
import * as fs from "fs";
var stdout = require('./stdout');
const argv = require("yargs").parseSync();
import * as os from "os";
import * as path from "path";
import { boolean } from "yargs";


export function sshOptions(options: NodeSSHOptions = {}): NodeSSHOptions{
    
    var options = fx.setDefaults({
        privateKey: path.join(os.homedir(),".ssh","id_rsa"),
        readyTimeout: 99999999,
        port:22,
        cwd:null
    },options); 

    return {
        host: options.host,
        username: options.username,
        privateKey: options.privateKey,
        password:options.password,
        passphrase:options.passphrase,
        readyTimeout: options.readyTimeout,
        port:options.port,
        cwd:options.cwd
    }
}


export function sshSettings(settings: SSHSettings = {}): SSHSettings{
    
    settings = fx.setDefaults({
        message: "",
        showDescription:true,
        showSpinner:true,
        showNodeName: false,
        verbose: true
    }, settings);

    return {
        message: settings.message,
        showDescription: settings.showDescription,
        showSpinner: settings.showSpinner,
        showNodeName: settings.showNodeName,
        verbose: settings.verbose
    }
}


export function nodeSSHOptions(nodeId: string): NodeSSHOptions{
      
      var node = fx.node(nodeId);
      var ssh = node.ssh;

      return sshOptions({
        host: node.host,
        username: ssh.username,
        password: ssh.password
    });
}



export function nodeRootSSHOptions(nodeId: string): NodeSSHOptions{
      
      var node = fx.node(nodeId);
      var nodeRoot = fx.nodeRoot(nodeId);

      return sshOptions({
        host: node.host,
        username: nodeRoot.username,
        password: nodeRoot.password
    });
}



export function rootSSHOptions(rootIp: string): NodeSSHOptions{
      
      let root = fx.root(rootIp);

      return sshOptions({
        host: rootIp,
        username: root.username,
        password: root.password
    });
}


export function interactiveShell(command: string = null, options: NodeSSHOptions = {}){
  
    options = sshOptions(options);

    options.privateKey = fs.readFileSync(options.privateKey);

    return new Promise<void>(resolve=>{
        var conn = new Client();
        conn.on('ready', function() {
        //console.log(chalk.green("Client :: ready"));
        //console.log("");
        //spinner.stop(true);
        let i = 0;
        conn.shell(function(err, stream) {
            if (err) throw err;
            // create readline interface
            var rl = readline.createInterface(process.stdin, process.stdout);
    
            stream.on('close', function() {
                //process.stdout.write('Connection closed.')
                //console.log('Stream :: close');
                conn.end();
                //resolve();
            }).on('data', function(data) {
                // pause to prevent more data from coming in
                process.stdin.pause()
                process.stdout.write(data);
                process.stdin.resume();
                if (command && i===0) stream.write(command);
                i++; 
            }).stderr.on('data', function(data) {
                process.stderr.write(data);
            });
    
            rl.on('line', function (d) {
                // send data to through the client to the host
                stream.write(d.trim()+'\n');
            });
    
            rl.on('SIGINT', function () {
                // stop input
                process.stdin.pause()
                //process.stdout.write('\nEnding session\n')
                process.stdout.write('\n\n')
                rl.close()
        
                // close connection
                stream.end()
                conn.end();
                resolve();
            })
    
        });
        }).connect(options);
    });
}


export function nodeInteractiveShell(nodeId: string){
    return interactiveShell(null, nodeSSHOptions(nodeId));
}


export async function sshConnection(options: NodeSSHOptions = {}){
    options = sshOptions(options);
    var ssh = new NodeSSH();
    
    await new Promise<void>((resolve,reject)=>{
        try{
            ssh.connect(options as any).then(()=>{
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


export function nodeSSHConnection(nodeId: string){
    return sshConnection(nodeSSHOptions(nodeId));
}

export function rootSSHConnection(rootIp: string){
    return sshConnection(rootSSHOptions(rootIp));
}


export function nodeRootSSHConnection(nodeId: string){
    return sshConnection(nodeRootSSHOptions(nodeId));
}


type NodeSSHExecOptions = SSHExecOptions & {
    stream?: 'stdout' | 'stderr';
}

export function executeCommand(command: string, sshConnection: NodeSSH, options: NodeSSHExecOptions = {}, settings: SSHSettings = {}){

    options = fx.setDefaults({
        cwd:null
    },options);

    settings = fx.setDefaults({
        verbose: true
    }, settings);

    return new Promise<void>(resolve=>{
        try{
            sshConnection.exec(command, [], {
                cwd: options.cwd,
                onStdout(chunk) {
                    if (settings.verbose) console.log(chunk.toString());
                },
                onStderr(chunk) {
                    if (settings.verbose) console.log(chunk.toString('utf8'))
                }
            }).then(_=>{
                resolve();
            }).catch(_=>{
                resolve();
            })
        }catch(e){
            if (settings.verbose) console.log(e);
            resolve();
        }
    });
}


export function nodeExecuteCommand(command: string, nodeId: string, sshConnection: NodeSSH, options: NodeSSHExecOptions = {}){
    //let node = fx.node(nodeId);

    options = fx.setDefaults({
        cwd: fx.remoteNodeDir(nodeId)
    }, options);

    return executeCommand(command, sshConnection, options);

}


export async function nodeExecuteCommands(commands: string[], nodeId: string, sshConnection: NodeSSH, options: NodeSSHExecOptions = {}){
    for(let command of commands){
        await nodeExecuteCommand(command, nodeId, sshConnection, options);
    }
    return true;
}


export function uploadFiles(localRemoteFilesArray: LocalRemoteFilesArray, sshConnection: NodeSSH, options: SSHSettings = {}){
    
    options = sshSettings(options);

    return new Promise<void>(resolve=>{

        try{
            
            if (options.showDescription){
                localRemoteFilesArray.forEach(localRemoteFile => {
                    describeStream(localRemoteFile.local, localRemoteFile.remote);
                });
            }

            sshConnection.putFiles(localRemoteFilesArray).then(()=>{
                resolve();
            }).catch(e=>{
                resolve();
            });
        }catch(e){
            console.log(e);
            resolve();
        }
    });
}



export function uploadFile(localPath: string, remotePath: string, sshConnection: NodeSSH){
  
    return uploadFiles([
        {
            "local":localPath,
            "remote": remotePath
        }
    ],sshConnection);
    
}



export function putDirectory(localDirectory: string, remoteDirectory: string, sshConnection: NodeSSH, putDirectoryOptions: SSHGetPutDirectoryOptions = {}, settings: SSHSettings = {}){

    settings = sshSettings(settings);

    putDirectoryOptions = fx.setDefaults({
        recursive: true,
        concurrency: 10,
        validate: (itemPath)=>{
            return true;
        }
    }, putDirectoryOptions)
  
    return new Promise<void>(resolve=>{
        try{
            if (settings.showDescription) describeStream(localDirectory, remoteDirectory, "put directory:");
            sshConnection.putDirectory(localDirectory,remoteDirectory, putDirectoryOptions).then(()=>{
                resolve()
            });
        }catch(e){
            resolve();
        }
    });
}


export function getFile(localFile: string, remoteFile: string, sshConnection: NodeSSH, settings: SSHSettings = {}){
    
    settings = sshSettings(settings);

    if (settings.showDescription) describeStream(remoteFile, localFile, "pull file:");

    return sshConnection.getFile(localFile,remoteFile);
}


export function nodeGetFile(relativePath: string, nodeId: string, sshConnection: NodeSSH){
    let localFile = path.join(fx.documentRoot(),relativePath);
    let remoteFile = fx.remoteNodeDir(nodeId).concat("/").concat(relativePath);
    return getFile(localFile,remoteFile,sshConnection);
}


export function describeNodeProcess(nodeId: string, settings: SSHSettings){
    settings = fx.setDefaults({
        showNodeName:false
    }, settings);

    if(settings.showNodeName) console.log(chalk.green(`\n----- ${fx.node(nodeId).name} -----`));
}

export function describeStream(from: string, to: string, message: string = ""){
    fx.println();
    console.log(`${chalk.magentaBright(message)} ${chalk.greenBright(fx.forwardSlash(from))} ${chalk.redBright(`->`)} ${chalk.cyanBright(fx.forwardSlash(to))}`);
}


export function nodeUploadFiles(localRemoteFilesArray: LocalRemoteFilesArray,nodeId: string, sshConnection: NodeSSH, settings: SSHSettings = {}){

    describeNodeProcess(nodeId, settings);
    
    return uploadFiles(localRemoteFilesArray,sshConnection);
}



export function nodeUploadFile(localPath: string, remotePath: string, nodeId: string, sshConnection: NodeSSH, settings: SSHSettings = {}){
    return nodeUploadFiles([
        {
            "local":localPath,
            "remote": remotePath
        }
    ],nodeId, sshConnection, settings);
}



export function uploadProjectFiles(fileRelativePaths: string[], nodeId: string, sshConnection: NodeSSH, settings: SSHSettings = {}){
	var localRemoteArray = [];

	var node = fx.node(nodeId);

	for (let rel_path of fileRelativePaths){
		
		localRemoteArray.push({
			local: path.join(fx.documentRoot(),rel_path),
			remote: fx.remoteNodeDir(nodeId).concat("/").concat(rel_path)
		});
	}
	return nodeUploadFiles(localRemoteArray, nodeId, sshConnection, settings);
}



export function uploadProjectFile(fileRelativePath: string, nodeId: string, sshConnection: NodeSSH, settings: SSHSettings={}){
	return uploadProjectFiles([fileRelativePath], nodeId, sshConnection, settings);
}