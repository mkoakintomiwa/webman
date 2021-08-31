const fx = require("./functions");
const ssh = require("./ssh");
const fs = require("fs");
const path = require("path");
const chalk  = require("chalk");
var stdout = require("./stdout");
var { will_you_skip,info_console,info_prompt } = require("./stdout");
var argv = require("yargs").argv;
const unirest = require("unirest");
const preloader = require("./preloader");
var prompt = stdout.prompt;
var www = process.env.www;
var portal = process.env.portal;
var skip = false;

var ftp_user = 'musthy';

var strict_skip = argv.skip?true:false;

(async _=>{

    var portal_properties = {};

    var node_id = argv._[0];
    
    var ssh_connection = await ssh.node_ssh_connection(node_id);

    var node = fx.node(node_id);

    var new_prompt = function(message,default_value=null){
        return stdout.info_prompt(message,node_id,default_value);
    }


    if (!await will_you_skip(true,`Have you generated settings.json?`)){
        await fx.shell_exec(`webman generate settings.json --node-id ${node_id}`);
    }

    // await will_you_skip(true,`You have already installed .htaccess, will you like to skip`).then(p=>{
    //     skip = p;
    // });


    // if (!skip){
    //     var htaccess_condition_https;
    //     await new_prompt("htaccess.condition.https","true").then(p=>{
    //         htaccess_condition_https = p==="true";
    //     });
    //     if (typeof portal_properties.htaccess === "undefined") portal_properties.htaccess = {};
    //     if (typeof portal_properties.htaccess.conditions === "undefined") portal_properties.htaccess.conditions = {};
    //     portal_properties.htaccess.conditions.https = htaccess_condition_https;
    //     portal_properties.htaccess.conditions.redirector = node_id==="demo";

    //     fx.parse_htaccess(node_id);
    //     console.log("");
    //     await ssh.upload_htaccess(node_id);
    // }



    if(!portal_properties.settings) portal_properties.settings = {}

    if (!await will_you_skip(strict_skip,`You have previously configured the server database, will you like to skip the process`)){
        await fx.shell_exec(`webman mysql add user --node-id ${node_id}`);

        await fx.shell_exec(`webman mysql add databases --node-id ${node_id}`);
    }


    if (!await will_you_skip(strict_skip,`Will you like to skip the installation of ${chalk.magenta("phpMyAdmin")}`)){
        await fx.shell_exec(`webman install phpmyadmin --node-id ${node_id}`);
    }

    
    if (!await will_you_skip(strict_skip,"Have you downloaded portal content from Github respository?")){
        console.log(chalk(`Download portal content from Github repository`));
        console.log("");

        var githib_command = `cd ${fx.remote_node_dir(node_id)} && git clone https://mkoakintomiwa:%40Awanibadan1@github.com/mkoakintomiwa/portal.git portal_from_github && mv portal_from_github/* . -f && rm -r portal_from_github -f && rm -rf index.html`
        console.log(`${chalk.greenBright(`Run command:`)} ${chalk.cyanBright(githib_command)}`);

        //await fx.copy_to_clipboard(githib_command);

        await ssh.node_execute_command(githib_command,ssh_connection,{
            node_id: node_id
        });
    }



    if (!await will_you_skip(strict_skip,"Have you configured composer on the remote server?")){
        await ssh.update_composer(node_id,ssh_connection);
    }


    if (!await will_you_skip(strict_skip,"Have you updated nodejs on the remote server?")){
        await info_prompt(`Make sure you have ${chalk.magentaBright(`node`)} and ${chalk.magentaBright(`npm`)} installed on the server with root access`,"NodeJS","Enter");

        await ssh.update_node(node_id,ssh_connection);
    }


    // await will_you_skip(strict_skip,"Have you added all neccesary cron jobs?").then(p=>{
    //     skip = p;
    // });
    
    // if (!skip){

    //     await new_prompt("Installing cron job @ post_daily_notes.php","Enter")

    //     //await ssh.create_cron_job([["*/5","*","*","*","*"],`php ${fx.remote_portal_dir(node_id)}/php/post_daily_notes.php --debug >> ${fx.remote_node_dir(node_id)}/php/cron-log`],node_id);
    // };
    


    
    
    
    // await will_you_skip(portal_properties.school_logo,"You have uploaded school logo, will you like to skip logos creation").then(p=>{
    //     skip = p;
    // });
    
    // if (!skip){
    //     var school_logo_path;
    //     var school_flat_image_path;

    //     await new_prompt("Choose school logo (Enter)","school_logo.png");

    //     if (!fs.existsSync(logos_dir)) fs.mkdirSync(logos_dir,{recursive:true});

    //     await fx.fileDialog().then(file_path=>{
    //         fs.copyFileSync(file_path,`${logos_dir}/${path.basename(file_path)}`)
    //         school_logo_path = path.normalize(`${logos_dir}/${path.basename(file_path)}`)
    //     });


    //     //await png_to_ico(school_logo_path,path.normalize(`${path.dirname(logos_dir)}/app-icon.ico`));
        
    //     await new_prompt("Choose school flat image (Enter)","school_flat_image.png");

    //     await fx.fileDialog().then(file_path=>{
    //         fs.copyFileSync(file_path,`${logos_dir}/${path.basename(file_path)}`);
    //         school_flat_image_path = path.normalize(`${logos_dir}/${path.basename(file_path)}`)
    //     });


    //     portal_properties.school_logo = path.basename(school_logo_path);
    //     portal_properties.school_flat_image = path.basename(school_flat_image_path);

    //     console.log(chalk.cyanBright(`Uploading school logos to remote server... \n`));
        
    //     var remote_asset_images_dir = `${fx.remote_portal_dir(node_id)}/specs/assets_images`;

    //     await ssh.portal_execute_command(`mkdir -p "${remote_asset_images_dir}"`,node_id);

    //     await ssh.portal_put_files([
    //         {
    //             local:school_logo_path,
    //             remote:`${remote_asset_images_dir}/${path.basename(school_logo_path)}`
    //         },{
    //             local:school_flat_image_path,
    //             remote:`${remote_asset_images_dir}/${path.basename(school_flat_image_path)}`
    //         }
    //     ],node_id)

    //     rewrite_portal_properties();
    // };


    
    if (!await will_you_skip(strict_skip,"Will you like to skip the process of execution of primary queries?")){
        
        console.log("");

        info_console("Add branches","Add school branches");

        await info_prompt(`Make sure you add ${chalk.magentaBright(`sql_mode = "NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION"`)} to ${chalk.cyanBright(`mysqld.cnf`)}`,"Add branch","Enter");

        var school_branches_properties = await stdout.prompt_object(_=>{
            return new Promise(async resolve=>{

                var branch_name = await info_prompt("Branch name",node_id,"UI S.U.B");

                var school_branch_name = await info_prompt("School name",node_id,portal_properties.school_name);

                var theme_color = null
                
                var ask_theme_color = (await info_prompt("Choose branch theme color from colorpicker?",node_id,"Y/N")).trim().toLowerCase() === "y";
                
                var default_theme_color = "#008080"

                if (ask_theme_color){
                    let color = await fx.colorpicker();

                    if (color==="ERROR_NO_COLOR_SUPPLIED"){
                        theme_color = default_theme_color
                    }else{
                        theme_color = color;
                    }
                }else{
                    theme_color = default_theme_color;
                }

                var theme_color = await info_prompt("Branch theme color",node_id,theme_color);

                var current_session = await info_prompt("Branch current session",node_id,"2019/2020");


                var current_term = await info_prompt("Branch current term",node_id,"First Term");
                
                resolve({
                    branch_name:branch_name,
                    school_theme_color:theme_color,
                    school_branch_name:school_branch_name,
                    current_session: current_session,
                    current_term: current_term
                });
            });
        },"branch");


        var school_branches = get_school_branches(school_branches_properties);

        info_console("community_details","Add users to community");

        var users = await stdout.prompt_object(_=>{
            return new Promise(async resolve=>{
                var username = await info_prompt("Username",node_id,"system-admin");

                var password = await info_prompt("Password",node_id,"systemportal");

                var display_name = await info_prompt("Display name",node_id,"System Admin");
            
                var branch;
            
                await new Promise(resolve=>{
                    
                    var ask_branch = async function(){
                        branch = await info_prompt("Branch",node_id,school_branches[0]);

                        if (school_branches.includes(branch)){
                            resolve();
                        }else{
                            console.log(chalk.red(`The supplied branch is not included in the list of branches (${school_branches.join(',')}) of the school. Please check the spelling for case sensitive errors.`));
                            ask_branch();
                        }
                    }
                    ask_branch();
                });

                var clearance = await info_prompt("Clearance",node_id,"system-admin");

                var admin_privileged = await info_prompt("Admin privileged?",node_id,"true");

                var office_description = await info_prompt("Office description",node_id,"System Admin");

                
                resolve({
                    username:username,
                    password:password,
                    display_name:display_name,
                    branch:branch,
                    clearance:clearance,
                    admin_privileged:admin_privileged,
                    office_description:office_description
                });
            });
        },"user");

        console.log("");

        await new Promise(resolve=>{
            var spinner = preloader.spinner("Executing primary queries %s");
            unirest.post(node.node_url+'/php/execute_primary_queries.php').field({
                users:JSON.stringify(users),
                branches:JSON.stringify(school_branches_properties),
                portal_properties:JSON.stringify(portal_properties)
            }).then(response=>{
                spinner.stop(true);
                console.log(response.body);
                resolve();
            });
        });

        if( (await new_prompt("Will you like to visit the portal?","Y/N")).trim().toLowerCase()==="y"){
            await fx.open_in_browser(node.node_url);
        }
    }

    ssh_connection.dispose();

})();



function get_school_branches(properties){
    var _r = [];
    for (let property of properties){
        _r.push(property.branch_name);
    }
    return _r;
}