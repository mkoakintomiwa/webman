const fs = require("fs");
const path = require("path");
const { argv,info_prompt,die } = require("./stdout");
const chalk = require("chalk");
const ssh = require("./ssh");
const fx = require("./functions");



let _document_root = fx.document_root();
var run_through;
var rootRun = false;

if (argv["root"]) rootRun = true;
let isDevMode = typeof argv["dev"] != "undefined";

let contexts = ["custom","db-backup","cron-job","update","pull","ftp","putty","app","explore","code","cmder"];

var custom_command;
var custom_command_template;
var context = argv._[0];

if (!(context && contexts.includes(context))){
    die(`You must pass a valid context of the run. contexts: ${contexts.join(",")}.`);
}


function run_command(context_id){
    let node_id = "";
    let root_ip = "";

    if (rootRun){
        root_ip = context_id;
    }else{
        node_id = context_id;
    }

    return new Promise(async resolve=>{
        var node = null;
        var root = null;

        if (isDevMode){
            node = {
                
            }
        }else if (rootRun){
            root = fx.root(root_ip);
        }else{
            node = fx.node(node_id);
        }

        console.log("");
        if (isDevMode){
            //console.log(`--------------------- ${chalk.greenBright(`(${node_id})`)} ---------------------`);
        }else if (rootRun){
            console.log(`--------------------- ${chalk.greenBright(root_ip)} ---------------------`);
        }else{
            console.log(`--------------------- ${node.name} ${chalk.greenBright(`(${node_id})`)} ---------------------`);
        }

        let ssh_connection = null;
        let root_ssh_connection = null;

        if (!isDevMode){
            if (rootRun){
                root_ssh_connection = await ssh.root_ssh_connection(root_ip);
            }else{
                ssh_connection = await ssh.node_ssh_connection(node_id);
            }
        }        

        let activities, intents, secondIntents;

        switch(context){

            case "pull":
                
                activities = ['google-token'];


                var activity = argv._[1];

                if (!(activity && activities.includes(activity))){
                    die(`You must pass a valid command action, Command actions: ${activities.join(",")}.`);
                }

                
                switch(activity){
                    case "google-token":
                        let node = fx.node(node_id);

                        let email_address = argv._[2] || node.backup.email_address;
                        
                        await ssh.node_get_file(`assets/google/accounts/${email_address}/token.json`,node_id,ssh_connection);
                    break;
                }


            break;



            case "update":
                
                activities = ['composer','nodejs','htaccess','cronjob','google-credentials','google-token'];


                var activity = argv._[1];

                if (!(activity && activities.includes(activity))){
                    die(`You must pass a valid component to be updated, Components: ${activities.join(",")}.`);
                }


                switch(activity){
                    case "nodejs":
                        await ssh.update_nodejs(node_id,ssh_connection);
                    break;
                    
                    case "htaccess":
                        if (isDevMode){
                            let htaccess = fx._.generate_htaccess();
                            fs.writeFileSync(path.join(_document_root,".htaccess"),htaccess);
                            fx.println(`${chalk.magentaBright("Dev Mode:")} ${chalk.cyanBright(".htaccess generated")}`);
                        }else{
                            await ssh.update_htaccess(node_id,ssh_connection);
                        }
                    break;

                    case "composer":
                        if (isDevMode){
                            await ssh.dev_update_composer();
                        }else{
                            await ssh.update_composer(node_id,ssh_connection);
                        }
                    break;

                    case "cronjob":
                        await ssh.update_cronjob(node_id,ssh_connection);
                    break;

                    case "google-credentials":
                        await ssh.update_google_credentials(node_id,ssh_connection);
                    break;

                    case "google-token":
                        await ssh.update_google_token(node_id,ssh_connection);
                    break;
                }


            break;

            

            case "custom":

                if (argv.steps){
                    fx.shell_exec(custom_command);
                    await info_prompt(`Waiting for completion @${node.name}`,node_id,"Enter");
                }else{
                    if (rootRun){
                        await ssh.execute_command(custom_command,root_ssh_connection,{
                            node_id: node_id
                        });
                    }else{
                        await ssh.node_execute_command(custom_command,ssh_connection,{
                            node_id: node_id
                        });
                    }
                        
                }
            break;


            case "app":
                intents = ['android','ios','windows','mac','linux'];

                var intent = argv._[1];

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                if (intent==="android"){

                    const _android = require("../apps/android/build");
                    const android_dir = path.join(_android.projects_dir,node_id);
                    const android_template_dir = _android.project_template_dir;
                    const template_res_dir = path.join(android_template_dir,_android.res_rel_dir);

                    const pp_dir = fx.portal_properties_dir(node_id);
                    const pp_res_dir = path.join(pp_dir,_android.pp_res_rel_dir);
                    
                    secondIntents = ['build','copy-res','db-dump','debug','release','run-release','locate-release','install-release','verify','install','uninstall','start'];

                    var secondIntent = argv._[2];

                    if (!(secondIntent && secondIntents.includes(secondIntent))){
                        die(`Third intent (${secondIntent}) > You must pass a valid action, Actions: ${secondIntents.join(",")}.`);
                    }
                    
                    const _build = require("../apps/android/build");
                    const build = _build.build;

                    if (secondIntent==="build"){                    
                        await build.run(node_id);
                    }


                    if (secondIntent==="debug"){                    
                        await build.debug(node_id);
                    }


                    if (secondIntent==="release"){                    
                        await build.release(node_id);
                    }


                    if (secondIntent==="run-release"){                    
                        await build.run_release(node_id);
                    }


                    if (secondIntent==="install-release"){                    
                        await build.install_release(node_id);
                    }

                    
                    if (secondIntent==="locate-release"){                    
                        await build.locate_release(node_id);
                    }


                    if (secondIntent==="verify"){                    
                        await build.verify(node_id);
                    }


                    if (secondIntent==="install"){                    
                        await build.install(node_id);
                    }


                    if (secondIntent==="uninstall"){                    
                        await build.uninstall(node_id);
                    }


                    if (secondIntent==="start"){                    
                        await build.start_activity(node_id);
                    }


                    if (secondIntent==="db-dump"){
                        await build.db_dump(node_id);
                    }


                    if (secondIntent==="copy-res"){
                        console.log("Task > Copy android resources from template project to portal properties");
                        await fx.copyFiles(template_res_dir,pp_res_dir);
                        await fx.rmdirs(["layout","values"],pp_res_dir);                    
                    }
                }
            break;

            
            case "explore":
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1];

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path;

                if (intent==="pp"){
                    _path = pp_dir;
                }

                if (intent==="android"){
                    var _path = android_dir;
                }
                console.log(`Task > show "${_path}" in explorer`)
                await fx.show_in_explorer(_path,false);
            
            break;



            case "code":
                
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1];

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path

                if (intent==="pp"){
                    _path = pp_dir;
                }

                if (intent==="android"){
                    _path = android_dir;
                }
                console.log(`Task > open "${_path}" in Visual Studio Code`)
                await fx.shell_exec(`code "${_path}"`);

            break;




            case "cmder":
                
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1];

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path
                if (intent==="pp"){
                    _path = pp_dir;
                }

                if (intent==="android"){
                    _path = android_dir;
                }
                console.log(`Task > open "${_path}" in cmder`)
                await fx.shell_exec(`cd "${_path}" && cmder`);

            break;

        }

        if (!isDevMode){
            if (rootRun){
                root_ssh_connection.dispose();
            }else{
                ssh_connection.dispose();
            }
        }
        resolve();
    });
}




(async _=>{
    
    if (context==="custom"){
        await info_prompt("Custom command","node",argv.steps?"echo $node_id":"ls").then(p=>{
            custom_command_template = p;
        });
    }

    
    if (isDevMode){
        run_through = ["dev"];
    }else if (argv["p"]){
        rootRun = true;
        run_through = argv["p"].split(",");
    }else if (argv["ip"]){
        rootRun = true;
        run_through = argv["ip"].split(",");
    }else if (argv["root"]){
        run_through = fx.active_root_ips();
    }else if (argv["n"]){
        run_through = argv["n"].split(",");
    }else if (argv["node-id"]){
        run_through = argv["node-id"].split(",");
    }else{
        if (!argv.steps) await info_prompt("Note: Node ID was not passed","general run","Enter");
        run_through = fx.node_ids();  
    }
    
    for (let context_id of run_through){
        let customVariables = {
            node_id:context_id,
            root_ip: context_id
        }

        if (!rootRun && !isDevMode){
            customVariables = Object.assign(customVariables,{
                remote_portal_dir: fx.remote_node_dir(context_id),
                remote_public_html: fx.remote_node_dir(context_id)
            });
        }

        custom_command = fx.dollar_replace(custom_command_template,customVariables);
        try{
            await run_command(context_id);
        }catch(e){
            console.log(e);
        }
    }

})();