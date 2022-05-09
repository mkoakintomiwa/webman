const fs = require("fs");
const fx = require("./lib/functions");
const glob = require("glob");
const { info_prompt } = require("./stdout");
const argv = require("yargs").argv;
const chalk = require("chalk");

let document_root = fx.document_root();

let prepare = typeof argv["prepare"] != "undefined";


(async ()=>{

    let needle;
    if (argv["search"] && !prepare){
        needle = fx.base64_decode(argv["search"]);
    }else{
        await info_prompt("Search","grep","").then(x=>{
            needle = x;
        });
    }

    
    let replacement;
    if (argv["replacement"] && !prepare){
        replacement = fx.base64_decode(argv["replacement"]);
    }else{
        await info_prompt("Replace with","grep","").then(x=>{
            replacement = x;
        });   
    }


    if (!prepare){
        let cwd;

        if (argv._[0]){
            cwd = document_root.concat("/").concat(argv._[0]);
        }else{
            cwd = document_root
        }

    
        glob("**/*",{
            cwd: cwd,
            absolute: true
        },async (err,files)=>{
            for (let file_path of files){
                if (fs.lstatSync(file_path).isFile()){
                    let file_content = fs.readFileSync(file_path).toString();
                    let regExp = new RegExp(fx.escapeRegExp(needle),"g");
                    let matches = fx.match(regExp,file_content);
                    
                    if (matches.length > 0){
                        let new_content = file_content.replace(regExp,replacement).replace(new RegExp("<newline>","g"),"\n");
                        fs.writeFileSync(file_path,new_content);
                        await fx.shellExec(`webman save "${file_path}"`);
                        console.log(file_path);
                    }
                }
            }
        });
    }else{

        let escaped_needle =  fx.base64_encode(needle);

        let escaped_replacement = fx.base64_encode(replacement);
        
        let prepared_command = `webman grep --search "${escaped_needle}" --replacement "${escaped_replacement}"`;

        fx.println(`\n\n${chalk.magentaBright(`Prepared command`)}`);
        fx.println(`${prepared_command}\n`);
    }
        

})();