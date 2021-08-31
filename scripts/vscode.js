const fs = require("fs");
const fx = require("./functions");

let document_root = fx.document_root();
let vscode_dir = `${document_root}/.vscode`;

if (!fs.existsSync(vscode_dir)) fs.mkdirSync(vscode_dir);

fs.writeFileSync(`${vscode_dir}/settings.json`,fx.template_content("vscode/settings.json"));