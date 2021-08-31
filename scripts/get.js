const fx = require("./functions");
const argv = require("yargs").argv;

let config = fx.config();
fx.println(fx.dotted_parameter(config,argv._[0]));