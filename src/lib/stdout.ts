const functions = require("./functions");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
var glob = exports.glob = require("glob");
var argv = require("yargs").argv;
exports.chalk = chalk;
exports.argv = argv;
const readline = exports.readline = require("readline");



class line{
    string: string;
    value: string;

    constructor(string){
        this.string = string;
        this.value = string;
    }
    
    object(){ 
        return functions.realArray(this.value.split('\n')); 
    }


    remove(string_to_be_removed){
        var _object = this.object();
        _object.forEach((value,index) => {
            if (value.trim()===string_to_be_removed){
                delete _object[index];
            }
        });
        this.value = functions.realArray(_object).join('\n');
        return this;
    }


    removeAll(string_to_be_removed){
        var _object = this.object();
        _object.forEach((value,index) => {
            if (value.trim().indexOf(string_to_be_removed)!=-1){
                delete _object[index];
            }
        });
        this.value = functions.realArray(_object).join('\n');
        return this;
    }

    fetch(line_number){
        var _object = this.object();
        for (let i=0;i<_object.length;i++){
            if (i+1===line_number){
                return _object[i];
            }
        }
        return null;
    }


    edit(content,line_number){
        var _object = this.object();
        _object[line_number-1] = content;
        this.value = functions.realArray(_object).join('\n');
        return this;
    }


    add(content){
        var _object = this.object();
        _object[_object.length] = content;
        this.value = functions.realArray(_object).join('\n');
        return this;
    }
}

var _line = exports.line = function(string){
    return new line(string);
}

/**
 * @deprecated Use prompt_async instead
 */
var prompt_promise = exports.prompt_promise = function(prompt_placeholder,default_value=""){
    var _return;
    return new Promise(resolve=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`${prompt_placeholder} `, function(response) {
            if (response.length>0){
                _return = response.trim()
            }else{
                _return = default_value
            }
            rl.close();
            resolve(_return)
        });
    });
}



var prompt = exports.prompt = async function(prompt_placeholder,default_value=""){
    var _return;
    await new Promise<void>(resolve=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`${prompt_placeholder} `, function(response) {
            if (response.length>0){
                _return = response.trim()
            }else{
                _return = default_value
            }
            rl.close();
            resolve()
        });
    });
    return _return;
}



var info_console = exports.info_console = function(key,info){
    console.log(`${chalk.cyanBright(`${key}: `)} ${chalk.greenBright(info)}`);
}


var info_prompt_promise = exports.info_prompt_promise = function(message,subject,default_value=null){
    let _default_value = `""`;
    if (default_value) _default_value = chalk.yellowBright(`${default_value.trim().length===0?`""`:default_value}`);
    var prompt_placeholder = `${chalk.cyanBright(message)} ${chalk.greenBright(`(${subject})`)} >>> (${_default_value}) `;
    console.log("")
    return prompt(prompt_placeholder,default_value);
}



var info_prompt = exports.info_prompt = async function(message,subject,default_value=null){
    let _default_value = `""`;
    if (default_value) _default_value = chalk.yellowBright(`${default_value.trim().length===0?`""`:default_value}`);
    var prompt_placeholder = `${chalk.cyanBright(message)} ${chalk.greenBright(`(${subject})`)} >>> (${_default_value}) `;
    console.log("")
    return prompt(prompt_placeholder,default_value);
}




var prompt_object = exports.prompt_object = async function(promise,title=""){
    let _object;
    await new Promise<void>(async resolve=>{
        var r = [];
        
        var add_another = true;
        
        var output = _=>{
            
            promise().then(async set=>{
                r.push(set);
                console.log("\n");
                await prompt(chalk.magentaBright(`Do you want to add another ${title} (y/n) `)).then(p=>{
                    add_another = p.trim().toLowerCase()==="y" 
                });
                
                if (add_another){
                    info_console(title,`${r.length} added`);
                    output(null)
                }else{
                    info_console(title,`${r.length} added in total`);
                    _object = r;
                    resolve()
                }
            });   
        }
        output(null);
    });
    return _object;
}


var info_prompt_action = exports.info_prompt_action = async function(message,action,subject=null,default_value=null){
    var will_you_act 
    await info_prompt(message,subject,default_value).then(p=>{
        will_you_act = p.trim().toLowerCase()==="y";
    });

    if (will_you_act){
        var is_running = true;
        var result;
        action().then(_result=>{
            result = _result;
            console.log(result);
            is_running = false 
        });

        setTimeout(_=>{
            is_running=false;
        },3000);

        while(true){
            if(!is_running){
                return result;
            }
        }
    }else{
        return default_value;
    }
}



var will_you_skip = exports.will_you_skip = async function(condition,message){
    console.log("");
    var skip;

    await new Promise<void>(resolve=>{
        if (condition){
            prompt(`${message} (Y/N) >>> `).then(p=>{
                p.trim().toLowerCase()
                if (p==="exit"){
                    process.exit();
                }else if(p==="y") {
                    skip = true;
                }else{
                    skip = false;
                }
                resolve();
            });
        }else{
            skip = false;
            resolve();
        }
    });
    return skip;
}


var die = exports.die = function(message=""){
	console.log("");
	console.log(chalk.redBright(message));
	process.exit();
}


var info_show = exports.info_show = function(objects){
    var _r = "";
    for (let object of objects){
        var value = object[1];
        if (value.trim().length===0) value = `"${value}"`
        _r+=`${chalk.greenBright(object[0])}: ${value}  `
    }
    return _r;
}