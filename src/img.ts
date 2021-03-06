import * as fx from "./lib/functions"
import * as fs from "fs"
import * as path from "path"
import { Command } from "commander";
const chalk = require("chalk");
import * as https from "https";
import * as url from 'url';

let program = new Command();

const documentRoot = fx.documentRoot();

program
    .name("webman img")
    .description("Automate css activities");

program
    .command("get-assets")
    .name("get-assets")
    .description("Download assets from img src=''")
    .option("-f,--file <css-file>","File containing images")
    .option("-u,--url <relative-url>","Relative URL to assets")
    .action(async(flags)=>{
        let cssPath = path.normalize(flags.file);
        if (!fs.existsSync(cssPath)){
            console.log("CSS file does not exit");
            process.exit();
        }

        let cssString = fs.readFileSync(cssPath).toString();

        let matches = fx.match(/src="(\S*?)"|src='(\S*?)'/, cssString);

        let baseUrl = new url.URL(flags.url).host;

        let cssAssetsDir = path.resolve('img-assets', baseUrl);

        if (!fs.existsSync(cssAssetsDir)) fs.mkdirSync(cssAssetsDir,{ recursive: true });

        for (let _match of matches){
            let assetRelativeUrl = _match[1].replace(/'/g,"").replace(/"/g,"");
            
            let assetUrlObject = new url.URL(assetRelativeUrl, flags.url);
            
            let assetUrl = assetUrlObject.href;

            let assetPathname = assetUrlObject.pathname;

            let assetOutputPath = path.join(cssAssetsDir, assetPathname);

            if (!fs.existsSync(path.dirname(assetOutputPath))) fs.mkdirSync(path.dirname(assetOutputPath), { recursive: true });

            await new Promise<void>(resolve=>{
                let stream = fs.createWriteStream(assetOutputPath);

                console.log(`Downloading ${assetUrl}`)
                https.get(assetUrl, (response=>{
                    if (response.statusCode == 200){
                        response.pipe(stream);
                    }else{
                        stream.close();
                        resolve();
                    }
                }));

                stream.on("finish",()=>{
                    stream.close();
                    resolve();
                });
            });
        }
    });

program.parse();