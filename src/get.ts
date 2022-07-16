var fx = require("./lib/functions");
var argv = require("yargs").argv;

let config = fx.config();
fx.println(fx.dottedParameter(config,argv._[0]));