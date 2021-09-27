const fs = require("fs");
const path = require("path");
const sass = require('sass');
const fx = require("./functions.js");
const { chalk } = require("./stdout");
const swc = require("@swc/core");
const terser = require("terser");
const webpack = require('webpack');
const ora = require("ora");
const argv = require("yargs").argv;
const chokidar = require('chokidar');
const { transpile_typescript,transpile_sass, transpile_react } = require("./transpilers");

function n(module){
    return path.join(fx.project_root(),"node_modules",module);
}

let bundleFilename = fx.unique_characters_from_fs(fx.tmp_directory())+'.js';
let _tmp_directory = fx.tmp_directory();
let bundlePath = path.join(_tmp_directory,bundleFilename);
let _document_root = fx.document_root();
let sPath = argv._[0];
let sPathName = path.basename(sPath);
let file_ordinance = path.join(_document_root,"src",sPath,sPathName);
let file_path = `${file_ordinance}.jsx`;

let output_file_path = path.join(_document_root,`${sPath}.php`);
var output_file_dir = path.dirname(output_file_path);
if (!fs.existsSync(output_file_dir)) fs.mkdirSync(output_file_dir,{recursive:true});

(async _=>{

    var saveState = async ()=>{
        var source_content = fs.readFileSync(`${file_ordinance}.php`).toString();

        var transpiled_typescript = fs.readFileSync(bundlePath).toString();
        
        
        if(transpiled_typescript){
            source_content += `\n<script>\n${transpiled_typescript}\n</script>`;
        }

        var transpiled_sass;
        
        await transpile_sass(`${file_ordinance}.scss`).then(_transpiled=>{
            transpiled_sass = _transpiled;
        });

        if (transpiled_sass){
            source_content = source_content.replace("<style></style>",`<style>\n\t${transpiled_sass}\n</style>`);
        }
        
        source_content = source_content.replace('<!--HTML-->',fs.readFileSync(`${file_ordinance}.html`).toString());

        fs.writeFileSync(output_file_path,source_content);
    }
    
    fx.println();
    const spinner = ora(`${chalk.magentaBright('Building bundle: ')} ${chalk.cyanBright(file_path)}`).start();

    try{
        await new Promise(resolve=>{
            webpack({
                entry: file_path,
                "cache": true,
                output: {
                    filename: bundleFilename,
                    path: _tmp_directory,
                    pathinfo: false
                },
                "cache":true,
                "mode":argv["prod"]?"production":"development",
                "watch":true,
                "module":{
                    rules: [
                        {
                            //test: /\.m?js$/,
                            include: path.join(_document_root,"src"),
                            use: {
                                loader: n('babel-loader'),
                                options: {
                                    presets: [n('@babel/preset-env'),n('@babel/preset-react'),n("@babel/preset-typescript")]
                                },
                            }
                        }
                    ]
                }
                
            }, (err, stats) => {
                spinner.stop();
                saveState();
                resolve();
                (stats || "").toString({
                    chunks: false,  // Makes the build much quieter
                    colors: true    // Shows colors in the console
                });


                if (err) {
                    console.error(err);
                }
            
                console.log((stats||"").toString({
                    chunks: false,  // Makes the build much quieter
                    colors: true    // Shows colors in the console
                }));
            });
        });

        const watcher = chokidar.watch(bundlePath, {
            persistent: true
        });

        watcher.on("change",async function(path,stats){
            saveState();
        });

        //fs.unlinkSync(path.join(_tmp_directory,bundleFilename));
        
    }catch(e){
        console.log(chalk.redBright(e))
    }
})();
    