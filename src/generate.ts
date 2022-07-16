var fs = require("fs");
var path = require("path");
var ssh = require("./ssh");
var fx = require("./lib/functions");
var argv = require("yargs").argv;

var context = argv._[0];

var node_ids = fx.arg_node_ids(argv);

var _document_root = fx.document_root();

let _project_root = fx.project_root();


(async ()=>{
    switch(context){
        case "settings.json":
            for (let node_id of node_ids){
                let node = fx.node(node_id);
    
                let tmp_file = fx.newTmpFile("json");
    
                fs.writeFileSync(tmp_file,JSON.stringify(node,null,4));
    
                let ssh_connection;

                await ssh.nodeSSHConnection(node_id).then(x=>{
                    ssh_connection = x;
                });

                await ssh.node_upload_file(fx.relativeToDocumentRoot(tmp_file),fx.remoteNodeDir(node_id).concat("/settings.json"),node_id,ssh_connection);

                let root_ssh_connection = await ssh.nodeRootSSHConnection(node_id);

                let cnf_tmp = fx.newTmpFile("json");

                fs.writeFileSync(cnf_tmp,`[client]
user = ${node.mysql.username}
password = ${node.mysql.password}
`);

                await ssh.node_upload_file(fx.relativeToDocumentRoot(cnf_tmp),`/home/${node.ssh.username}/.my.cnf`,node_id,root_ssh_connection);

                ssh_connection.dispose();
                root_ssh_connection.dispose();
    
                fs.unlinkSync(tmp_file);
                fs.unlinkSync(cnf_tmp);
            }
        break;


        case "settings.php":
            await fx.copyProjectTemplateFile("settings.php");
        break;

        case "assets":
            await fx.copyProjectTemplateDirectory("assets");
        break;


        case "src":
            await fx.copyProjectTemplateDirectory("src");
        break;


        case "composer":
            await fx.copyProjectTemplateDirectory("composer");
        break;

        case ".gitignore":
            await fx.copyProjectTemplateFile(".gitignore");
        break;

        case "db.php":
            await fx.copyProjectTemplateFile("assets/db.php");
        break;


        case "functions.php":
            await fx.copyProjectTemplateFile("assets/functions.php");
        break;


        case "handshake.php":
            await fx.copyProjectTemplateFile("assets/handshake.php");
        break;


        case "handshake_functions.php":
            await fx.copyProjectTemplateFile("assets/handshake_functions.php");
        break;


        case "variables.php":
            await fx.copyProjectTemplateFile("assets/variables.php");
        break;


        case "universal.php":
            await fx.copyProjectTemplateFile("assets/universal.php");
        break;


        case "functions.js":
            await fx.copyProjectTemplateFile(".webman/scripts/functions.js");
        break;

    }
})();