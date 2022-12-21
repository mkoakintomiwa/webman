var fx = require("./lib/functions");
var argv = require("yargs").parseSync();

var context = argv._[0];

switch(context){
    case "sql-mode":
        dump(`sql_mode = "NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION"`);
    break;

    case "update-composer":
        dump(`wget https://getcomposer.org/composer.phar && chmod +x composer.phar && php composer.phar update`);
    break;

    case "install-composer":
        dump(`wget https://getcomposer.org/composer.phar && chmod +x composer.phar`);
    break;

    case "install-cpanel":
        dump(`cd /home && curl -o latest -L https://securedownloads.cpanel.net/latest && sh latest`);
    break;

    case "install-wpanel":
        if (!argv.u){
            dump(`wget api.wpanel.dev/wpanel/wpanel-ubuntu-20.04 -q && chmod +x wpanel-ubuntu-20.04 && mv wpanel-ubuntu-20.04 /bin/wpanel && wpanel --version`);
        }else{
            dump(`wget api.wpanel.dev/wpanel/wpanel-ubuntu-20.04 -q && chmod +x wpanel-ubuntu-20.04 && mv wpanel-ubuntu-20.04 /bin/wpanel -f && wpanel --version`);
        }
        
    break;


    case "show_errors":
        dump(`ini_set('display_errors', 1);ini_set('display_startup_errors', 1);error_reporting(E_ALL);`);
    break;

    case "portal-git":
        dump(`git remote add origin https://icitify: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@github.com/icitify/portal-beta`);
}


function dump(command){
    console.log(command);
}