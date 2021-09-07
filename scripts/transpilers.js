const fs = require("fs");
const path = require("path");
const sass = require('sass');
const fx = require("./functions.js");
const { chalk } = require("./stdout");
const swc = require("@swc/core");
const terser = require("terser");


var transpile_typescript = exports.transpile_typescript = function(file_path,output_path=null,minify=true){
    return new Promise(async resolve=>{
        var _return = null;
        try{

            var transpiled = swc.transformFileSync(file_path,{
                "jsc": {
                    "parser": {
                      "syntax": "typescript",
                      "decorators": true
                    },
                    "transform": {
                      "legacyDecorator": true,
                      "decoratorMetadata": true
                    },
                    "target":"es2018"
                }
            }).code;

            transpiled = (await terser.minify(transpiled)).code;

            if (output_path){
                var output_dirname = path.dirname(output_path);
                if (!fs.existsSync(output_dirname)) fs.mkdirSync(output_dirname,{recursive:true});
                fs.writeFileSync(output_path,transpiled);
            }

            // if (minify){
               
            // }

            
            _return = transpiled;
            
        }catch(e){
            console.log(chalk.redBright(e))
        }

        resolve(_return);
    });
}


var transpile_sass = exports.transpile_sass = function(file_path,output_path=null){
    return new Promise(resolve=>{
        var _return = null;

        try{
            var css = sass.renderSync({
                file: file_path,
                outputStyle:'compressed'
            }).css.toString();

            if (output_path){
                var output_dirname = path.dirname(output_path);
                if (!fs.existsSync(output_dirname)) fs.mkdirSync(output_dirname,{recursive:true});
                fs.writeFileSync(output_path,transpiled);
            }

            _return = css;
        
        }catch(e){
            console.log(chalk.redBright(e))
        }
        resolve(_return);
    });
}