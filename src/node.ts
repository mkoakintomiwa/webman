import * as fx from "./lib/functions"
const argv = require("yargs").argv;

console.log(fx.node(argv._[0]));