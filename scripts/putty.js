const fs = require("fs");
const fx = require("./lib/functions");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");
const ssh = require("./ssh");

const node_id = argv._[0];
const root_ip = argv["root-ip"];

if (root_ip){
    ssh.root_open_putty(root_ip);
}else if (argv.root){
    ssh.node_root_open_putty(node_id);
}else{
    ssh.node_open_putty(node_id);   
}