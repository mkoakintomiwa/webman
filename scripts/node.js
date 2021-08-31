const fx = require("./functions");
const argv = require("yargs").argv;

console.log(fx.node(argv._[0]));