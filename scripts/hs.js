const fs = require("fs");
const fx = require("./lib/functions");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");
const ssh = require("./ssh");

const node_id = argv._[0];

ssh.node_open_heidisql(node_id);