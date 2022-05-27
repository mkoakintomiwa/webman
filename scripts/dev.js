const fs = require("fs");
const path = require("path");
const fx = require("./functions.js");
const chalk = require("chalk");
const webpack = require('webpack');
const ora = require("ora");
const argv = require("yargs").argv;
const chokidar = require('chokidar');
const process = require("process");

function n(module){
    return path.join(fx.project_root(),"node_modules",module);
}

let bundleFilename = fx.unique_characters_from_fs(fx.tmp_directory())+'.js';
let _tmp_directory = fx.tmp_directory();
let bundlePath = path.join(_tmp_directory,bundleFilename);
let _document_root = fx.document_root();
let sPath = argv._[0]||"";
let sPathName = path.basename(sPath);
let file_ordinance = path.join(_document_root,"src",sPath,sPathName);
let appIsReact = fs.existsSync(`${file_ordinance}.jsx`);
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
        fx.println(`${chalk.magentaBright("Event:")} ${chalk.cyanBright("App compiled")}`);
    }
    
    fx.println();
        
    if (appIsReact){
        const spinner = ora(`${chalk.magentaBright('Building bundle: ')} ${chalk.cyanBright(file_path)}`).start();

        try{
            await new Promise(resolve=>{
                
                webpackBundler = webpack(fx.webpackOptions({
                    filePath: file_path,
                    output:{
                        filename: bundleFilename,
                        path: _tmp_directory,
                    },
                    mode: argv["prod"]?"production":"development"
                }), (err, stats) => {
                    spinner.stop();
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

            saveState();

            bundleWatcher = chokidar.watch(bundlePath, {
                persistent: true
            });

            bundleWatcher.on("change",async function(path,stats){
                saveState();
            });

            
            filesWatcher = chokidar.watch(path.dirname(file_ordinance),{
                ignored: /.*\.jsx/,
            });

            filesWatcher.on("change",function(path,stats){
                saveState();
            });
            
        }catch(e){
            console.log(chalk.redBright(e))
        }
    }else{

        if (argv["global"]){

            fx.println(`${chalk.magentaBright("Event:")} ${chalk.cyanBright("Watching apps globally")}`);
            
            filesWatcher = chokidar.watch(path.join(_document_root,"src"));
    
            filesWatcher.on("change",async function(_path,stats){
                let appLocation = path.dirname(fx.relativeToDocumentRoot(_path).replace("src",""));
                await fx.compileApp(appLocation);
                fx.println(`${chalk.magentaBright("Event:")} ${chalk.cyanBright(`${appLocation.replace(/^\\/,"")} successfully compiled`)}`);
            });
        }else{

            saveState();

            filesWatcher = chokidar.watch(path.dirname(file_ordinance),{
                ignored: /.*\.jsx/,
            });
    
            filesWatcher.on("change",function(path,stats){
                saveState();
            });
        }
    }
})();


process.on("SIGINT",function(){
    fx.println();
    if (appIsReact) bundleWatcher.close();
    filesWatcher.close();
    if (appIsReact){
        webpackBundler.close(function(){
            fs.unlinkSync(bundlePath);
        });
    }
});
    