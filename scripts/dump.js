const fx = require("./functions");
const argv = require("yargs").argv;

let context = argv._[0];

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
            dump(`yum install wget -y && wget api.wpanel.dev/wpanel/wpanel-centos-7 -q && chmod +x wpanel-centos-7 && mv wpanel-centos-7 /bin/wpanel && wpanel --version`);
        }else{
            dump(`wget api.wpanel.dev/wpanel/wpanel-centos-7 -q && chmod +x wpanel-centos-7 && mv wpanel-centos-7 /bin/wpanel -f && wpanel --version`);
        }
        
    break;


    case "show_errors":
        dump(`ini_set('display_errors', 1);ini_set('display_startup_errors', 1);error_reporting(E_ALL);`);
    break;
}


function dump(command){
    console.log(command);
    fx.copy_to_clipboard(command);   
}