"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProjectFile = exports.uploadProjectFiles = exports.nodeUploadFile = exports.nodeUploadFiles = exports.describeStream = exports.describeNodeProcess = exports.nodeGetFile = exports.getFile = exports.putDirectory = exports.uploadFile = exports.uploadFiles = exports.nodeExecuteCommands = exports.nodeExecuteCommand = exports.executeCommand = exports.nodeRootSSHConnection = exports.rootSSHConnection = exports.nodeSSHConnection = exports.sshConnection = exports.interactiveShell = exports.rootSSHOptions = exports.nodeRootSSHOptions = exports.nodeSSHOptions = exports.sshSettings = exports.sshOptions = void 0;
const fx = require("./functions");
const chalk = require('chalk');
const node_ssh_1 = require("node-ssh");
const { Client } = require('ssh2');
var readline = require('readline');
var stdout = require('./stdout');
const argv = require("yargs").parseSync();
const os = require("os");
const path = require("path");
function sshOptions(options = {}) {
    var options = fx.setDefaults({
        privateKey: path.join(os.homedir(), ".ssh", "id_rsa"),
        readyTimeout: 99999,
        port: 22,
        cwd: null
    }, options);
    return {
        host: options.host,
        username: options.username,
        privateKey: options.privateKey,
        password: options.password,
        passphrase: options.passphrase,
        readyTimeout: options.readyTimeout,
        port: options.port,
        cwd: options.cwd
    };
}
exports.sshOptions = sshOptions;
function sshSettings(options = {}) {
    options = fx.setDefaults({
        message: "",
        showDescription: true,
        showSpinner: true,
        showNodeName: false
    }, options);
    return {
        message: options.message,
        showDescription: options.showDescription,
        showSpinner: options.showSpinner,
        showNodeName: options.showNodeName
    };
}
exports.sshSettings = sshSettings;
function nodeSSHOptions(nodeId) {
    var node = fx.node(nodeId);
    var ssh = node.ssh;
    return sshOptions({
        host: node.host,
        username: ssh.username,
        password: ssh.password
    });
}
exports.nodeSSHOptions = nodeSSHOptions;
function nodeRootSSHOptions(nodeId) {
    var node = fx.node(nodeId);
    var nodeRoot = fx.nodeRoot(nodeId);
    return sshOptions({
        host: node.host,
        username: nodeRoot.username,
        password: nodeRoot.password
    });
}
exports.nodeRootSSHOptions = nodeRootSSHOptions;
function rootSSHOptions(rootIp) {
    let root = fx.root(rootIp);
    return sshOptions({
        host: rootIp,
        username: root.username,
        password: root.password
    });
}
exports.rootSSHOptions = rootSSHOptions;
function interactiveShell(options, command = null) {
    options = sshOptions(options);
    return new Promise(resolve => {
        var conn = new Client();
        conn.on('ready', function () {
            //console.log(chalk.green("Client :: ready"));
            //console.log("");
            //spinner.stop(true);
            let i = 0;
            conn.shell(function (err, stream) {
                if (err)
                    throw err;
                // create readline interface
                var rl = readline.createInterface(process.stdin, process.stdout);
                stream.on('close', function () {
                    //process.stdout.write('Connection closed.')
                    //console.log('Stream :: close');
                    conn.end();
                    //resolve();
                }).on('data', function (data) {
                    // pause to prevent more data from coming in
                    process.stdin.pause();
                    process.stdout.write(data);
                    process.stdin.resume();
                    if (command && i === 0)
                        stream.write(command);
                    i++;
                }).stderr.on('data', function (data) {
                    process.stderr.write(data);
                });
                rl.on('line', function (d) {
                    // send data to through the client to the host
                    stream.write(d.trim() + '\n');
                });
                rl.on('SIGINT', function () {
                    // stop input
                    process.stdin.pause();
                    //process.stdout.write('\nEnding session\n')
                    process.stdout.write('\n\n');
                    rl.close();
                    // close connection
                    stream.end();
                    conn.end();
                    resolve();
                });
            });
        }).connect(options);
    });
}
exports.interactiveShell = interactiveShell;
async function sshConnection(options = {}) {
    options = sshOptions(options);
    var ssh = new node_ssh_1.NodeSSH();
    await new Promise((resolve, reject) => {
        try {
            ssh.connect(options).then(() => {
                resolve();
            }).catch(e => {
                console.log(e);
                console.log(options);
                resolve();
            });
        }
        catch (e) {
            reject(e);
        }
    });
    return ssh;
}
exports.sshConnection = sshConnection;
function nodeSSHConnection(nodeId) {
    return sshConnection(nodeSSHOptions(nodeId));
}
exports.nodeSSHConnection = nodeSSHConnection;
function rootSSHConnection(rootIp) {
    return sshConnection(rootSSHOptions(rootIp));
}
exports.rootSSHConnection = rootSSHConnection;
function nodeRootSSHConnection(nodeId) {
    return sshConnection(nodeRootSSHOptions(nodeId));
}
exports.nodeRootSSHConnection = nodeRootSSHConnection;
function executeCommand(command, sshConnection, options = {}) {
    options = fx.setDefaults({
        cwd: null
    }, options);
    return new Promise(resolve => {
        try {
            sshConnection.exec(command, [], {
                cwd: options.cwd,
                onStdout(chunk) {
                    console.log(chunk.toString());
                },
                onStderr(chunk) {
                    console.log(chunk.toString('utf8'));
                }
            }).then(_ => {
                resolve();
            }).catch(_ => {
                resolve();
            });
        }
        catch (e) {
            console.log(e);
            resolve();
        }
    });
}
exports.executeCommand = executeCommand;
function nodeExecuteCommand(command, nodeId, sshConnection, options = {}) {
    //let node = fx.node(nodeId);
    options = fx.setDefaults({
        cwd: fx.remoteNodeDir(nodeId)
    }, options);
    return executeCommand(command, sshConnection, options);
}
exports.nodeExecuteCommand = nodeExecuteCommand;
async function nodeExecuteCommands(commands, nodeId, sshConnection, options = {}) {
    for (let command of commands) {
        await nodeExecuteCommand(command, nodeId, sshConnection, options);
    }
    return true;
}
exports.nodeExecuteCommands = nodeExecuteCommands;
function uploadFiles(localRemoteFilesArray, sshConnection, options = {}) {
    options = sshSettings(options);
    return new Promise(resolve => {
        try {
            if (options.showDescription) {
                localRemoteFilesArray.forEach(localRemoteFile => {
                    describeStream(localRemoteFile.local, localRemoteFile.remote);
                });
            }
            sshConnection.putFiles(localRemoteFilesArray).then(() => {
                resolve();
            }).catch(e => {
                resolve();
            });
        }
        catch (e) {
            console.log(e);
            resolve();
        }
    });
}
exports.uploadFiles = uploadFiles;
function uploadFile(localPath, remotePath, sshConnection) {
    return uploadFiles([
        {
            "local": localPath,
            "remote": remotePath
        }
    ], sshConnection);
}
exports.uploadFile = uploadFile;
function putDirectory(localDirectory, remoteDirectory, sshConnection, putDirectoryOptions = {}, options = {}) {
    options = sshSettings(options);
    putDirectoryOptions = fx.setDefaults({
        recursive: true,
        concurrency: 10,
        validate: (itemPath) => {
            return true;
        }
    }, putDirectoryOptions);
    return new Promise(resolve => {
        try {
            if (options.showDescription)
                describeStream(localDirectory, remoteDirectory, "put directory:");
            sshConnection.putDirectory(localDirectory, remoteDirectory, putDirectoryOptions).then(() => {
                resolve();
            });
        }
        catch (e) {
            resolve();
        }
    });
}
exports.putDirectory = putDirectory;
function getFile(localFile, remoteFile, sshConnection, options = {}) {
    options = sshSettings(options);
    if (options.showDescription)
        describeStream(remoteFile, localFile, "pull file:");
    return sshConnection.getFile(localFile, remoteFile);
}
exports.getFile = getFile;
function nodeGetFile(relativePath, nodeId, sshConnection) {
    let localFile = path.join(fx.documentRoot(), relativePath);
    let remoteFile = fx.remoteNodeDir(nodeId).concat("/").concat(relativePath);
    return getFile(localFile, remoteFile, sshConnection);
}
exports.nodeGetFile = nodeGetFile;
function describeNodeProcess(nodeId, options) {
    options = fx.setDefaults({
        showNodeName: false
    }, options);
    if (options.showNodeName)
        console.log(chalk.green(`\n----- ${fx.node(nodeId).name} -----`));
}
exports.describeNodeProcess = describeNodeProcess;
function describeStream(from, to, message = "") {
    fx.println();
    console.log(`${chalk.magentaBright(message)} ${chalk.greenBright(fx.forwardSlash(from))} ${chalk.redBright(`->`)} ${chalk.cyanBright(fx.forwardSlash(to))}`);
}
exports.describeStream = describeStream;
function nodeUploadFiles(localRemoteFilesArray, nodeId, sshConnection, options = {}) {
    describeNodeProcess(nodeId, options);
    return uploadFiles(localRemoteFilesArray, sshConnection);
}
exports.nodeUploadFiles = nodeUploadFiles;
function nodeUploadFile(localPath, remotePath, nodeId, sshConnection, options = {}) {
    return nodeUploadFiles([
        {
            "local": localPath,
            "remote": remotePath
        }
    ], nodeId, sshConnection, options);
}
exports.nodeUploadFile = nodeUploadFile;
function uploadProjectFiles(fileRelativePaths, nodeId, sshConnection, options = {}) {
    var localRemoteArray = [];
    var node = fx.node(nodeId);
    for (let rel_path of fileRelativePaths) {
        localRemoteArray.push({
            local: path.join(fx.documentRoot(), rel_path),
            remote: fx.remoteNodeDir(nodeId).concat("/").concat(rel_path)
        });
    }
    return nodeUploadFiles(localRemoteArray, nodeId, sshConnection, options);
}
exports.uploadProjectFiles = uploadProjectFiles;
function uploadProjectFile(fileRelativePath, nodeId, sshConnection, options) {
    return uploadProjectFiles([fileRelativePath], nodeId, sshConnection, options);
}
exports.uploadProjectFile = uploadProjectFile;
