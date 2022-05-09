const fs = require("fs");
const path = require("path");
const yargv = require("yargs").argv;
const fx = require("./lib/functions");

let project_root = fx.project_root();
let document_root = fx.document_root();

let ajax = `${document_root}/ajax`;

if (!fs.existsSync(ajax)) fs.mkdirSync(ajax);

let ajax_file = path.normalize(`${ajax}/${yargv._[0]}.php`);

if (fs.existsSync(ajax_file)){
    console.log(`"${ajax_file}" already exists.`);
    process.exit();
} 

fs.writeFileSync(ajax_file,fx.template_content("ajax.php"));

fx.shellExec(`code ${ajax_file}`);