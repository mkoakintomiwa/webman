const fs = require("fs");
const path = require("path");
const { argv,info_prompt,chalk,die, info_console } = require("./stdout");
const ssh = require("./ssh");
const fx = require("./functions");



var run_through;

let contexts = ["custom","db-backup","cron-job","update","pull","ftp","putty","app","explore","code","cmder"];

var custom_command;
var custom_command_template;
var context = argv._[0];

if (!(context && contexts.includes(context))){
    die(`You must pass a valid context of the run. contexts: ${contexts.join(",")}.`);
}


function run_command(node_id){
    return new Promise(async resolve=>{
        var node = fx.node(node_id);

        console.log("");
        console.log(`--------------------- ${node.name} ${chalk.greenBright(`(${node_id})`)} ---------------------`);

        var remote_node_dir = fx.remote_node_dir(node_id);
        var nodejs = remote_node_dir+"/nodejs"

        let ssh_connection;
        await ssh.node_ssh_connection(node_id).then(p=>{
            ssh_connection = p;
        });


        var db_backup_command = `node ${nodejs}/db-backup`;


        var post_daily_notes_command = `php ${remote_node_dir}/php/post_daily_notes.php --debug >> ${remote_node_dir}/php/cron-log`


        if (context==="db-backup"){
            
            await ssh.portal_execute_command(db_backup_command,node_id);

            await ssh.portal_execute_command(db_backup_files_command,node_id);
            
        }


        
        if (context==="cron-job"){

            
            let command_actions = ['add','delete','post-daily-notes'];

            let cron_jobs = {
                "db-backup":[["0","8,16","*","*","*"],db_backup_command],
                "post-daily-notes":[["*/5","*","*","*","*"],post_daily_notes_command]
            }


            var command_action = argv._[1];

            if (!(command_action && command_actions.includes(command_action))){
                die(`You must pass a valid command action, Command actions: ${command_actions.join(",")}.`);
            }


            var command_title = argv._[2];

            if (!(command_title && Object.keys(cron_jobs).includes(command_title))){
                die(`You must provide a valid command the cron job. Command titles: ${Object.keys(cron_jobs).join(",")}.`);
            }

            
            if (command_action==="add"){
                await ssh.add_cron_job(cron_jobs[command_title],node_id);
                console.log("");  
                info_console(`${node.name} (${node_id})`,ssh.cron_command_from_array(cron_jobs[command_title]));
                console.log(""); 
            }


            if (command_action==='delete'){
                await ssh.delete_cron_job(cron_jobs[command_title],node_id);
                console.log("");  
                info_console(`${node.name} (${node_id})`,chalk.redBright("Delete: ") + ssh.cron_command_from_array(cron_jobs[command_title]));
                console.log("");
            } 

        }



        if (context==="pull"){

            
            let command_actions = ['google-token'];


            var command_action = argv._[1];

            if (!(command_action && command_actions.includes(command_action))){
                die(`You must pass a valid command action, Command actions: ${command_actions.join(",")}.`);
            }

            
            switch(command_action){
                case "google-token":
                    let node = fx.node(node_id);

                    let email_address = argv._[2] || node.backup.email_address;
                    
                    await ssh.node_get_file(`assets/google/accounts/${email_address}/token.json`,node_id,ssh_connection);
                break;
            }


        }



        if (context==="update"){
            
            let command_actions = ['composer','nodejs','htaccess','settings','cronjob','google-credentials','google-token'];


            var command_action = argv._[1];

            if (!(command_action && command_actions.includes(command_action))){
                die(`You must pass a valid component to be updated, Components: ${command_actions.join(",")}.`);
            }


            switch(command_action){
                case "nodejs":
                    await ssh.update_nodejs(node_id,ssh_connection);
                break;
                
                case "htaccess":
                    await ssh.update_htaccess(node_id,ssh_connection);
                break;

                case "composer":
                    await ssh.upload_settings(node_id);
                break;

                case "settings":
                    await ssh.upload_settings(node_id);
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
        }

        

        if (context==="custom"){
            if (argv.steps){
                fx.shell_exec(custom_command);
                await info_prompt(`Waiting for completion @${node.name}`,node_id,"Enter");
            }else{
                await ssh.node_execute_command(custom_command,ssh_connection,{
                    node_id: node_id
                });
            }
        }


        if (context==="ftp"){
            await ssh.portal_open_filezilla(node_id);
        }


        if (context==="putty"){
            await ssh.portal_open_putty(node_id);
        }


        if (context==="app"){
            let second_intents = ['android','ios','windows','mac','linux'];

            var second_intent = argv._[1];

            if (!(second_intent && second_intents.includes(second_intent))){
                die(`You must pass a valid platform, Platforms: ${second_intents.join(",")}.`);
            }

            if (second_intent==="android"){

                const _android = require("../apps/android/build");
                const android_dir = path.join(_android.projects_dir,node_id);
                const android_template_dir = _android.project_template_dir;
                const template_res_dir = path.join(android_template_dir,_android.res_rel_dir);

                const pp_dir = fx.portal_properties_dir(node_id);
                const pp_res_dir = path.join(pp_dir,_android.pp_res_rel_dir);
                
                let third_intents = ['build','copy-res','db-dump','debug','release','run-release','locate-release','install-release','verify','install','uninstall','start'];

                var third_intent = argv._[2];

                if (!(third_intent && third_intents.includes(third_intent))){
                    die(`Third intent (${third_intent}) > You must pass a valid action, Actions: ${third_intents.join(",")}.`);
                }
                
                const _build = require("../apps/android/build");
                const build = _build.build;

                if (third_intent==="build"){                    
                    await build.run(node_id);
                }


                if (third_intent==="debug"){                    
                    await build.debug(node_id);
                }


                if (third_intent==="release"){                    
                    await build.release(node_id);
                }


                if (third_intent==="run-release"){                    
                    await build.run_release(node_id);
                }


                if (third_intent==="install-release"){                    
                    await build.install_release(node_id);
                }

                
                if (third_intent==="locate-release"){                    
                    await build.locate_release(node_id);
                }


                if (third_intent==="verify"){                    
                    await build.verify(node_id);
                }


                if (third_intent==="install"){                    
                    await build.install(node_id);
                }


                if (third_intent==="uninstall"){                    
                    await build.uninstall(node_id);
                }


                if (third_intent==="start"){                    
                    await build.start_activity(node_id);
                }


                if (third_intent==="db-dump"){
                    await build.db_dump(node_id);
                }


                if (third_intent==="copy-res"){
                    console.log("Task > Copy android resources from template project to portal properties");
                    await fx.copyFiles(template_res_dir,pp_res_dir);
                    await fx.rmdirs(["layout","values"],pp_res_dir);                    
                }
            }
        }

        
        if (context==="explore"){
            let second_intents = ['pp','android','ios','windows','mac','linux'];

            var second_intent = argv._[1];

            if (!(second_intent && second_intents.includes(second_intent))){
                die(`You must pass a valid platform, Platforms: ${second_intents.join(",")}.`);
            }

            var _path;

            if (second_intent==="pp"){
                _path = pp_dir;
            }

            if (second_intent==="android"){
                var _path = android_dir;
            }
            console.log(`Task > show "${_path}" in explorer`)
            await fx.show_in_explorer(_path,false);
        }



        if (context==="code"){
            let second_intents = ['pp','android','ios','windows','mac','linux'];

            var second_intent = argv._[1];

            if (!(second_intent && second_intents.includes(second_intent))){
                die(`You must pass a valid platform, Platforms: ${second_intents.join(",")}.`);
            }

            var _path
            if (second_intent==="pp"){
                _path = pp_dir;
            }

            if (second_intent==="android"){
                _path = android_dir;
            }
            console.log(`Task > open "${_path}" in Visual Studio Code`)
            await fx.shell_exec(`code "${_path}"`);
        }




        if (context==="cmder"){
            let second_intents = ['pp','android','ios','windows','mac','linux'];

            var second_intent = argv._[1];

            if (!(second_intent && second_intents.includes(second_intent))){
                die(`You must pass a valid platform, Platforms: ${second_intents.join(",")}.`);
            }

            var _path
            if (second_intent==="pp"){
                _path = pp_dir;
            }

            if (second_intent==="android"){
                _path = android_dir;
            }
            console.log(`Task > open "${_path}" in cmder`)
            await fx.shell_exec(`cd "${_path}" && cmder`);
        }

        ssh_connection.dispose();
        resolve();
    });
}




(async _=>{
    
    if (context==="custom"){
        await info_prompt("Custom command","node",argv.steps?"cpanel $node_id":"ls").then(p=>{
            custom_command_template = p;
        });
    }

    if (argv["n"]){
        run_through = argv["n"].split(",");
    }else if (argv["node-id"]){
        run_through = argv["node-id"].split(",");
    }else{
        if (!argv.steps) await info_prompt("Note: Node ID was not passed","general run","Enter");
        run_through = fx.node_ids();  
    }
    
    for (let node_id of run_through){
        custom_command = fx.dollar_replace(custom_command_template,{
            node_id:node_id,
            remote_portal_dir: fx.remote_node_dir(node_id),
            remote_public_html: fx.remote_node_dir(node_id)
        });
        await run_command(node_id);
    }

})();