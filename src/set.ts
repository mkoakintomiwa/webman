import * as fx from "./lib/functions"
const argv = require("yargs").argv;

let config = fx.config();
fx.dottedParameter(config,argv._[0],argv._[1]);
fx.writeConfig(config);