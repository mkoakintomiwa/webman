"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fx = require("./lib/functions");
const fs = require("fs");
const path = require("path");
const commander_1 = require("commander");
const chalk = require("chalk");
const https = require("https");
const url = require("url");
let program = new commander_1.Command();
const documentRoot = fx.documentRoot();
program
    .name("webman css")
    .description("Automate css activities");
program
    .command("get-assets")
    .name("get-assets")
    .description("Download assets from css url()")
    .option("-f,--file <css-file>", "The CSS file")
    .option("-u,--url <relative-url>", "Relative URL to assets")
    .action(async (flags) => {
    let cssPath = path.normalize(flags.file);
    if (!fs.existsSync(cssPath)) {
        console.log("CSS file does not exit");
        process.exit();
    }
    let cssString = fs.readFileSync(cssPath).toString();
    let matches = fx.match(/url\((\S*?)\)/, cssString);
    let baseUrl = new url.URL(flags.url).host;
    let cssAssetsDir = path.resolve('css-assets', baseUrl);
    if (!fs.existsSync(cssAssetsDir))
        fs.mkdirSync(cssAssetsDir, { recursive: true });
    for (let _match of matches) {
        let assetRelativeUrl = _match[1].replace(/'/g, "").replace(/"/g, "");
        let assetUrlObject = new url.URL(assetRelativeUrl, flags.url);
        let assetUrl = assetUrlObject.href;
        let assetPathname = assetUrlObject.pathname;
        let assetOutputPath = path.join(cssAssetsDir, assetPathname);
        if (!fs.existsSync(path.dirname(assetOutputPath)))
            fs.mkdirSync(path.dirname(assetOutputPath), { recursive: true });
        await new Promise(resolve => {
            let stream = fs.createWriteStream(assetOutputPath);
            console.log(`Downloading ${assetUrl}`);
            https.get(assetUrl, (response => {
                if (response.statusCode == 200) {
                    response.pipe(stream);
                }
                else {
                    stream.close();
                    resolve();
                }
            }));
            stream.on("finish", () => {
                stream.close();
                resolve();
            });
        });
    }
});
program.parse();
