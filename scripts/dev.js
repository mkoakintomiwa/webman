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
const process = require("process");

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

let bundleWatcher = null;
let filesWatcher = null;
let webpackBundler = null;

(async _=>{

    var saveState = async ()=>{
        await fx.compileApp(sPath,bundlePath);
        fx.println(`${chalk.magentaBright("event:")} ${chalk.cyanBright("app compiled")}`);
    }
    
    fx.println();
    const spinner = ora(`${chalk.magentaBright('Building bundle: ')} ${chalk.cyanBright(file_path)}`).start();

    try{
        await new Promise(resolve=>{
            webpackBundler = webpack({
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

        bundleWatcher = chokidar.watch(bundlePath, {
            persistent: true
        });

        bundleWatcher.on("change",async function(path,stats){
            saveState();
        });

        
        filesWatcher = chokidar.watch(path.dirname(file_ordinance),{
            ignored: /.*\.jsx/,
        });

        filesWatcher.on("change",function(){
            saveState();
        });
        
    }catch(e){
        console.log(chalk.redBright(e))
    }
})();


process.on("SIGINT",function(){
    fx.println();
    bundleWatcher.close();
    filesWatcher.close();
    webpackBundler.close(function(){
        fs.unlinkSync(bundlePath);
    });
});
    