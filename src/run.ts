import * as fs from "fs"
const path = require("path");
const { info_prompt,die } = require("./lib/stdout");
const chalk = require("chalk");
import * as ssh from "./lib/ssh"
const fx = require("./lib/functions");
const argv = require("yargs").parseSync();



let _document_root = fx.document_root();
var run_through;
var rootRun = false;

if (argv["root"]) rootRun = true;
let isDevMode = typeof argv["dev"] != "undefined";

let contexts = [
    "custom",
    "db-backup",
    "cron-job",
    "git",
    "update",
    "pull",
    "ftp",
    "putty",
    "app",
    "explore",
    "code",
    "cmder",
    "repair-workspace"
];

var custom_command;
var custom_command_template;
var context = argv._[0].toString();

if (!(context && contexts.includes(context))){
    die(`You must pass a valid context of the run. contexts: ${contexts.join(",")}.`);
}


function run_command(context_id){
    let nodeId = "";
    let root_ip = "";

    if (rootRun){
        root_ip = context_id;
    }else{
        nodeId = context_id;
    }

    return new Promise<void>(async resolve=>{
        var node = null;
        var root = null;

        if (isDevMode){
            node = {
                
            }
        }else if (rootRun){
            root = fx.root(root_ip);
        }else{
            node = fx.node(nodeId);
        }

        console.log("");
        if (isDevMode){
            //console.log(`--------------------- ${chalk.greenBright(`(${nodeId})`)} ---------------------`);
        }else if (rootRun){
            console.log(`--------------------- ${chalk.greenBright(root_ip)} ---------------------`);
        }else{
            console.log(`--------------------- ${node.name || ""} ${chalk.greenBright(`(${nodeId})`)} ---------------------`);
        }

        let ssh_connection = null;
        let root_ssh_connection = null;

        if (!isDevMode){
            if (rootRun){
                root_ssh_connection = await ssh.rootSSHConnection(root_ip);
            }else{
                ssh_connection = await ssh.nodeSSHConnection(nodeId);
            }
        }        

        let activities, intents, secondIntents;

        switch(context){

            case "pull":
                
                activities = ['google-token'];


                var activity = argv._[1].toString();

                if (!(activity && activities.includes(activity))){
                    die(`You must pass a valid command action, Command actions: ${activities.join(",")}.`);
                }

                
                switch(activity){
                    case "google-token":
                        let node = fx.node(nodeId);

                        let email_address = argv._[2] || node.backup.email_address;
                        
                        await ssh.nodeGetFile(`assets/google/accounts/${email_address}/token.json`,nodeId,ssh_connection);
                    break;
                }


            break;


            case "git":
                activities = ['get-url','set-url'];

                var activity = argv._[1].toString();

                switch (activity){
                    case "get-url":
                        await ssh.nodeExecuteCommand(`cd public_html && git remote get-url origin`, nodeId,ssh_connection);
                    break;

                    case "set-url":
                        let gitToken = (await fx.currentGitToken()).portalBeta;

                        await ssh.nodeExecuteCommand(`cd public_html && git remote set-url origin https://icitify:${gitToken}@github.com/icitify/portal-beta && git remote get-url origin`, nodeId, ssh_connection);
                }                
            break;


            case "update":
                
                activities = ['composer','nodejs','htaccess','cronjob','google-credentials','google-token'];


                var activity = argv._[1].toString();

                if (!(activity && activities.includes(activity))){
                    die(`You must pass a valid component to be updated, Components: ${activities.join(",")}.`);
                }


                switch(activity){

                }


            break;

            

            case "custom":

                if (argv.steps){
                    fx.shellExec(custom_command);
                    await info_prompt(`Waiting for completion @${node.name}`,nodeId,"Enter");
                }else{
                    if (rootRun){
                        await ssh.executeCommand(custom_command,root_ssh_connection,{
                            cwd: "/root"
                        });
                    }else{
                        await ssh.nodeExecuteCommand(custom_command, node,ssh_connection);
                    }
                        
                }
            break;


            case "app":
                intents = ['android','ios','windows','mac','linux'];

                var intent = argv._[1].toString();

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                // if (intent==="android"){

                //     const _android = require("../apps/android/build");
                //     const android_dir = path.join(_android.projects_dir,nodeId);
                //     const android_template_dir = _android.project_template_dir;
                //     const template_res_dir = path.join(android_template_dir,_android.res_rel_dir);

                //     const pp_dir = fx.portal_properties_dir(nodeId);
                //     const pp_res_dir = path.join(pp_dir,_android.pp_res_rel_dir);
                    
                //     secondIntents = ['build','copy-res','db-dump','debug','release','run-release','locate-release','install-release','verify','install','uninstall','start'];

                //     var secondIntent = argv._[2];

                //     if (!(secondIntent && secondIntents.includes(secondIntent))){
                //         die(`Third intent (${secondIntent}) > You must pass a valid action, Actions: ${secondIntents.join(",")}.`);
                //     }
                    
                //     const _build = require("../apps/android/build");
                //     const build = _build.build;

                //     if (secondIntent==="build"){                    
                //         await build.run(nodeId);
                //     }


                //     if (secondIntent==="debug"){                    
                //         await build.debug(nodeId);
                //     }


                //     if (secondIntent==="release"){                    
                //         await build.release(nodeId);
                //     }


                //     if (secondIntent==="run-release"){                    
                //         await build.run_release(nodeId);
                //     }


                //     if (secondIntent==="install-release"){                    
                //         await build.install_release(nodeId);
                //     }

                    
                //     if (secondIntent==="locate-release"){                    
                //         await build.locate_release(nodeId);
                //     }


                //     if (secondIntent==="verify"){                    
                //         await build.verify(nodeId);
                //     }


                //     if (secondIntent==="install"){                    
                //         await build.install(nodeId);
                //     }


                //     if (secondIntent==="uninstall"){                    
                //         await build.uninstall(nodeId);
                //     }


                //     if (secondIntent==="start"){                    
                //         await build.start_activity(nodeId);
                //     }


                //     if (secondIntent==="db-dump"){
                //         await build.db_dump(nodeId);
                //     }


                //     if (secondIntent==="copy-res"){
                //         console.log("Task > Copy android resources from template project to portal properties");
                //         await fx.copyFiles(template_res_dir,pp_res_dir);
                //         await fx.rmdirs(["layout","values"],pp_res_dir);                    
                //     }
                // }
            break;

            
            case "explore":
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1].toString();

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path;

                if (intent==="pp"){
                    //_path = pp_dir;
                }

                if (intent==="android"){
                    //var _path = android_dir;
                }
                console.log(`Task > show "${_path}" in explorer`)
                await fx.show_in_explorer(_path,false);
            
            break;



            case "code":
                
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1].toString();

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path

                if (intent==="pp"){
                    //_path = pp_dir;
                }

                if (intent==="android"){
                    //_path = android_dir;
                }
                console.log(`Task > open "${_path}" in Visual Studio Code`)
                await fx.shellExec(`code "${_path}"`);

            break;




            case "cmder":
                
                intents = ['pp','android','ios','windows','mac','linux'];

                var intent = argv._[1].toString();

                if (!(intent && intents.includes(intent))){
                    die(`You must pass a valid platform, Platforms: ${intents.join(",")}.`);
                }

                var _path
                if (intent==="pp"){
                    //_path = pp_dir;
                }

                if (intent==="android"){
                    //_path = android_dir;
                }
                console.log(`Task > open "${_path}" in cmder`)
                await fx.shellExec(`cd "${_path}" && cmder`);

            break;

            case "repair-workspace":
                //await ssh.repairWorkspace(nodeId,ssh_connection);
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
        await info_prompt("Custom command","node",argv.steps?"echo $nodeId":"ls").then(p=>{
            custom_command_template = p;
        });
    }

    
    if (isDevMode){
        run_through = ["dev"];
    }else if (argv["p"]){
        rootRun = true;
        run_through = argv["p"].toString().split(",");
    }else if (argv["ip"]){
        rootRun = true;
        run_through = argv["ip"].toString().split(",");
    }else if (argv["root"]){
        run_through = fx.active_root_ips();
    }else if (argv["n"]){
        run_through = argv["n"].toString().split(",");
    }else if (argv["node-id"]){
        run_through = argv["node-id"].toString().split(",");
    }else{
        if (!argv.steps) await info_prompt("Note: Node ID was not passed","general run","Enter");
        run_through = fx.activeNodeIds();  
    }
    
    for (let context_id of run_through){
        let customVariables = {
            nodeId:context_id,
            root_ip: context_id
        }

        if (!rootRun && !isDevMode){
            customVariables = Object.assign(customVariables,{
                remote_portal_dir: fx.remoteNodeDir(context_id),
                remote_public_html: fx.remoteNodeDir(context_id)
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