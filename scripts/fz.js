const fs = require("fs");
const fx = require("./lib/functions");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");
const ssh = require("./ssh");

const node_id = argv._[0];

if (argv.root){
    ssh.node_root_open_filezilla(node_id);
}else{
    ssh.node_open_filezilla(node_id);   
}