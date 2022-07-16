import * as fs from "fs"
import * as fx from "./lib/functions"

let document_root = fx.documentRoot();
let vscode_dir = `${document_root}/.vscode`;

if (!fs.existsSync(vscode_dir)) fs.mkdirSync(vscode_dir);

fs.writeFileSync(`${vscode_dir}/settings.json`,fx.templateContent("vscode/settings.json"));