const fs = require("fs");
const fx = require("./lib/functions");
const argv = require("yargs").argv;
const path = require("path")
const ssh = require("./ssh");
const process = require("process");

let document_root = fx.document_root();

let node_ids = fx.arg_node_ids(argv);

(async _=>{
    for (let node_id of node_ids){

        let directory_relative_path = argv._[0];
        let directory_path = path.join(document_root,directory_relative_path);
        let zip_file_name = `${path.basename(directory_relative_path)}.zip`;
        let zip_relative_file_path = `${directory_relative_path}/${zip_file_name}`
        let zip_file_path = `${document_root}/${zip_relative_file_path}`;
        let tmp_file = fx.new_tmp_file("zip",10);

    let remote_directory = `${fx.remoteNodeDir(node_id)}/${fx.forward_slash(directory_relative_path)}`; 

        fx.println(`\n\n> Zipping directory '${directory_path}'`);
        await fx.zipDirectory(directory_path,tmp_file);

        if (fs.existsSync(zip_file_path)) fs.unlinkSync(zip_file_path);
        fs.renameSync(tmp_file,zip_file_path);

        fx.println("\n\n> Connecting to remote server");
        let ssh_connection;
        await ssh.node_ssh_connection(node_id).then(x=>{
            ssh_connection = x;
        });

        await ssh.execute_command(`mkdir -p "${remote_directory}"`,ssh_connection);

        fx.println("\n\n> Uploading zip file");
        await ssh.upload_project_file(zip_relative_file_path,node_id,ssh_connection);

        fx.println("\n\n> Unzip uploaded remote file");
        await ssh.execute_command(`cd "${remote_directory}" && unzip -o "${zip_file_name}" && rm -rf "${zip_file_name}"`,ssh_connection);

        fs.unlinkSync(zip_file_path);
        ssh_connection.dispose()
    }
})();


process.on("SIGINT",function(){
    if (fs.existsSync(tmp_file)) fs.unlinkSync(tmp_file);
    if (fs.existsSync(zip_file_path)) fs.unlinkSync(zip_file_path);
});

// glob("**/*",{
//     cwd:`${document_root}/${argv._[0]}`,
//     absolute: true
// },(err,files)=>{
    
//     fx.ftp_connection(fx.ftp_config(node_id)).then(async ftp_connection=>{
//         let i = 0;
//         for (let file_path of files){
//             i++;
//             let relative_path = fx.forward_slash(file_path).replace(fx.forward_slash(document_root)+"/","");
//             if (fs.lstatSync(file_path).isDirectory()){
//                 await fx.project_ftp_mkdir(relative_path,node_id,ftp_connection);
//             }else{
//                 await fx.upload_project_file(relative_path,node_id,ftp_connection);
//             }
//             fx.println(`${i}/${files.length}`)
//         }
//         ftp_connection.end();
//     });
// })

