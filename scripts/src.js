const fs = require("fs");
const fx = require("./functions");
const path = require("path");
const argv = require("yargs").argv;
const chalk = require("chalk");


const context = argv._[0];
const first_intent = argv._[1];
const second_intent = argv._[2] || "";
const document_root = fx.document_root();


var file_rel_dir = first_intent;
var src_path = path.join(document_root,'src/');

var file_dir = path.join(src_path,file_rel_dir);
var destination_dir = path.join(src_path,second_intent);

var config = fx.config();

var application_type = config.application_type || "web";

var file_formats;

let appIsVanilla = argv["vanilla"];

switch (application_type){
    case "web":
        if (appIsVanilla){
            file_formats = ['php','html','scss','ts'];
        }else{
            file_formats = ['php','html','jsx'];
        }
    break;

    case "mobile":
        file_formats = ['html','scss','ts'];
    break;
}

function _first_file_location(_file_dir=null){
    if (!_file_dir) _file_dir = file_dir;
    return path.normalize(`${_file_dir}/${path.basename(_file_dir)}.${file_formats[0]}`,'');
}

let first_file_location = _first_file_location();
        
(async _=>{
    switch(context){

        case "add":
            
            switch (application_type){
                case "web":

                    for (let file_format of file_formats){
                        var file_location = path.normalize(`${file_dir}/${path.basename(file_dir)}.${file_format}`,'');
                        
                        if (!fs.existsSync(file_dir)) fs.mkdirSync(file_dir,{recursive:true});
                        var pre_content = '';

                        switch(file_format){
                            case "scss":
                                pre_content = '@use "assets/scss/styles" as *;';
                            break;

                            case "php":
                                if (appIsVanilla){
                                    pre_content = fx.template_content("page-vanilla.php");
                                }else{
                                    pre_content = fx.template_content("page.php");
                                }
                            break;

                            case "jsx":
                                pre_content = fx.template_content("page.jsx");
                            break;

                            case "html":
                                if (!appIsVanilla){
                                    pre_content = fx.template_content("page.html");
                                }
                            break;
                        }

                        fs.writeFileSync(file_location,pre_content);
                    }

                    //fs.writeFileSync(path.join(file_dir,"index.d.ts"),"");

                    console.log(chalk.green(`${file_rel_dir} successfully added.`));

                break;


                case "mobile":

                    for (let file_format of file_formats){
                        var file_location = path.normalize(`${file_dir}/${path.basename(file_dir)}.${file_format}`,'');
                        if (!fs.existsSync(file_dir)) fs.mkdirSync(file_dir,{recursive:true});
                        var pre_content = '';
                        
                        if (file_format==="html"){
                            pre_content = '<title></title>\n\n<style></style>\n\n\n\n\n<script></script>'    
                        }else if (file_format==="scss"){
                            pre_content = '@use "assets/scss/styles" as *;\n'    
                        }else if (file_format==="ts"){
                            pre_content = `import { noConflict } from "jquery"`
                        }
                        fs.writeFileSync(file_location,pre_content);
                    }

                    //fs.writeFileSync(path.join(file_dir,"index.d.ts"),"");

                    console.log(chalk.green(`${file_rel_dir} successfully added.`));

                break; 
            }

            fx.shell_exec(`code "${first_file_location}"`);
            
        break;
        

        case "remove":
            fx.rmdir(file_dir).then(_=>{
                console.log(chalk.green(`${file_rel_dir} successfully removed.`));
            });
        break;


        case "clone":
            await fx.copyFiles(file_dir,destination_dir);
            let file_ordinance = path.basename(file_dir);
            let destination_ordinance = path.basename(destination_dir);

            for (let file_format of file_formats){
                fs.renameSync(
                    path.join(destination_dir,`${file_ordinance}.${file_format}`),
                    path.join(destination_dir,`${destination_ordinance}.${file_format}`)
                );
            }

            await fx.shell_exec(`code "${_first_file_location(destination_dir)}"`);
        break;
    }
})();