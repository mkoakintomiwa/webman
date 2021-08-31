const fx = require("./functions");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync, execSync } = require("child_process");
const argv = require("yargs").argv;

const document_root = fx.document_root();
const project_root = fx.project_root();
const cmder_mini = path.join(project_root,"cmder_mini");
const cmder = path.join(cmder_mini,"Cmder.exe");
const cmder_init = path.join(cmder_mini,"vendor","init.bat");
const cmder_vscode_init = path.join(cmder_mini,"vendor","bin","vscode_init.cmd");


if (!argv._[0]){
    fx.shell_exec(`"${cmder}"`);
}


var context = argv._[0];

switch(context){
    case "init":
        spawn("cmd",["/K",cmder_init],{
            stdio:"inherit",
            shell:true
        });
    break;

    case "vscode-init":
        var vscode_settings_path = path.join(document_root,".vscode","settings.json");
        var vscode_settings = JSON.parse(fs.readFileSync(vscode_settings_path).toString());
        vscode_settings["terminal.integrated.shell.windows"] = path.join(process.env.systemdrive,"Windows","system32","cmd.exe");
        vscode_settings["terminal.integrated.shellArgs.windows"] = ["/k",cmder_init];

        fs.writeFileSync(vscode_settings_path,JSON.stringify(vscode_settings,null,4));
    break;
}