const fs = require("fs");
const path = require("path");
const yargv = require("yargs").argv;
const fx = require("./functions");

let document_root = fx.document_root();

let stream = `${document_root}/stream`;

if (!fs.existsSync(stream)) fs.mkdirSync(stream);

let stream_file = path.normalize(`${stream}/${yargv._[0]}.php`);

if (fs.existsSync(stream_file)){
    console.log(`"${stream_file}" already exists.`);
    process.exit();
} 

fs.writeFileSync(stream_file,fx.template_content("stream.php"));

fx.shell_exec(`code ${stream_file}`);