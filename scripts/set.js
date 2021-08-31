const fx = require("./functions");
const argv = require("yargs").argv;

let config = fx.config();
fx.dotted_parameter(config,argv._[0],argv._[1]);
fx.writeConfig(config);