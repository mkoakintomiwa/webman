import * as fx from "./lib/functions"
const argv = require("yargs").argv;

let config = fx.config();

let active;

switch (argv._[0]){
    case "active":
        switch(argv._[1]){
            case "on":
                active = true;
            break;
    
            case "off":
                active = false
            break;
        }

        fx.dottedParameter(config,"test.active",active);
        fx.writeConfig(config);
    break;
}