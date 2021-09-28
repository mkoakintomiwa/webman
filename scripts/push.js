const fx = require("./functions");
const path = require("path");
const unirest = require("unirest");
const fs = require("fs");
const { transpile_typescript,transpile_sass, transpile_react } = require("./transpilers");
const chalk  = require("chalk");
const  ssh = require("./ssh");
const db = require("./sqlite");

const argv = require("yargs").argv;

var config = fx.config();

var application_type = config.application_type || "web";

const document_root = fx.document_root();
const project_root = fx.project_root();

let project_extension;

let is_test_mode = argv["test"];

switch (application_type){
    case "web":
        project_extension = ".php";
    break;

    case "mobile":
        project_extension = ".html"
    break;
}


(async _=>{
    var response = {};
    var rows;

    let conn = db.connection();

    // Build source files
    
    if (is_test_mode){
        await db.fetch("SELECT * FROM test_files WHERE synced=? AND node_id=? GROUP BY filename",["false",config.test.node_id],conn).then(_rows=>{
            rows = _rows;
        });
    }else{
        await db.fetch("SELECT * FROM files WHERE synced=? GROUP BY filename",["false"],conn).then(_rows=>{
            rows = _rows;
        });
    }
    

    for (let row of rows){
        var node_id = row.node_id;
        var response;
            
        fc = row.filename.replace(/^\\/,'').replace('\\','/');
        
        if (row.is_source_file==="true"){
            var source_dir = document_root + '/src'
            var source_file_name = path.basename(row.filename).replace(project_extension,'');
            var source_rel_dir = path.dirname(row.filename);
            var file_ordinance = path.normalize(`${source_dir}/${source_rel_dir}/${source_file_name}/${source_file_name}`);
            if (row.is_specs_file==="true"){
                source_rel_dir = source_rel_dir.replace(/^specs\\/,"");
                file_ordinance = path.normalize(`${source_dir}/node-specs/${row.node_id}/${source_rel_dir}/${source_file_name}/${source_file_name}`);
            }
            
            let source_file_renderer_path = `${file_ordinance}${project_extension}`;

            if (fs.existsSync(source_file_renderer_path)){
                
                await fx.compileApp(row.filename.replace(project_extension,''),null,application_type);

                var output_file_path;

                if (row.is_specs_file==="true"){
                    output_file_path = path.normalize(`${document_root}/${row.filename.replace(/^specs\\/,`node-specs\\${node_id}/`)}`);
                }else{
                    output_file_path = path.normalize(`${document_root}/${row.filename}`)
                }

                
                // var output_file_dir = path.dirname(output_file_path);
                // if (!fs.existsSync(output_file_dir)) fs.mkdirSync(output_file_dir,{recursive:true});
                // fs.writeFileSync(output_file_path,source_content);
                
            
                console.log();
                console.log(chalk.green(`${path.normalize(fc)} successfully compiled`));

                // if(transpiled_typescript!=null && transpiled_sass!=null){
                //     console.log();
                //     console.log(chalk.green(`${path.normalize(fc)} successfully transpiled`));
                // }
            }
                
        }
    }

    if (application_type === "mobile"){
        await db.execute("UPDATE files SET synced=?",["true"],conn);
    }
    
    if (application_type === "web"){
        // Push files
        if (is_test_mode){
            await db.fetch("SELECT * FROM test_files WHERE synced=? AND node_id=?",["false",config.test.node_id],conn).then(_rows=>{
                rows = _rows;
            });
        }else{
            await db.fetch("SELECT * FROM files WHERE synced=?",["false"],conn).then(_rows=>{
                rows = _rows;
            });
        }

        i = 0;
        
        for (let row of rows){
            var node_id = row.node_id;
            
            if (fs.existsSync(path.join(document_root,row.filename)) || row.is_source_file==="true" || row.is_specs_file==="true"){

                var response;
                
                fc = row.filename.replace(/^\\/,'').replace('\\','/');
                
                i++;

                let _node = fx.node(row.node_id);
                
                let _config = fx.config();

                let file_transfer_protocol = _config.file_transfer_protocol || "ftp";

                if (argv.http) file_transfer_protocol = "http";

                if (argv.ftp) file_transfer_protocol = "ftp";

                if (argv.ssh) file_transfer_protocol = "ssh";

                let _filename = row.filename;

                if (row.is_specs_file==="true"){
                    _filename = row.filename.replace(/^specs\\/,`node-specs\\${node_id}/`);
                }
                
                
                let file_absolute_path = path.join(document_root,_filename);

                if (fs.existsSync(file_absolute_path)){
                    switch(file_transfer_protocol){
                        case "http":
                            if (fx.node(node_id).host!="localhost"){
                                await fx.hftp_request(row.node_id,{
                                    fields:{
                                        "filename":"/".concat(row.filename)
                                    },
                                    attachments:{
                                        "row":file_absolute_path
                                    }
                                }).then(r=>{
                                    response = r;
                                    console.log();
                                    console.log(`${chalk.magentaBright(response.raw_body)} * ${chalk.magentaBright(`${i}/${rows.length}`)} * ${chalk.magentaBright(`${fx.round((i/rows.length),4)*100}%`)}`);
                                });
                            }
                        break;
    
    
                        case "ftp":
                            var ftp_connection;    
                            await fx.node_ftp_connection(row.node_id).then(x=>{
                                ftp_connection = x;
                            });
                            await fx.upload_project_file(fx.forward_slash(_filename), node_id, ftp_connection,function(local_path,remote_path){
                                console.log(`${chalk.cyanBright(_node.name)} * ${chalk.cyanBright(fx.forward_slash(local_path))} * ${chalk.cyanBright(`${i}/${rows.length}`)} * ${chalk.cyanBright(`${fx.round((i/rows.length),4)*100}%`)}`);
                            }).then(r=>{
                                ftp_connection.end();
                                response = {
                                    is_successful: true
                                };
                            });
                        break;
    
    
                        case "ssh":
                            
                            try{

                                var ssh_connection;    
                                await ssh.node_ssh_connection(row.node_id).then(x=>{
                                    ssh_connection = x;
                                });
        
                                let _file_name = fx.forward_slash(_filename);

                                await ssh.node_upload_file(_file_name,`${fx.remote_node_dir(node_id)}/${_file_name}`,node_id,ssh_connection).then(r=>{
                                    fx.println();
                                    console.log(`${chalk.cyanBright(_node.name)} * ${chalk.cyanBright(`${i}/${rows.length}`)} * ${chalk.cyanBright(`${fx.round((i/rows.length),4)*100}%`)}`);
                                    ssh_connection.dispose();
                                    response = {
                                        is_successful: true
                                    };
                                });;
                            }catch(e){}
    
                        break;
                    
                    }
                }else{
                    fx.println(chalk.redBright(`\nDeleted: ${file_absolute_path}\n`));
                    response = {
                        is_successful: true
                    };
                }

                
        
                


                if (response.is_successful){
                    if (is_test_mode){
                        await db.execute("UPDATE test_files SET synced=? WHERE node_id=? AND filename=?",["true",row.node_id,row.filename],conn);
                    }else{
                        await db.execute("UPDATE files SET synced=? WHERE node_id=? AND filename=?",["true",row.node_id,row.filename],conn);
                    }
                }else{
                    console.log(`------ ${_node.name} failed ------`);
                }
            }
        }
    }

    
    conn.close();
    console.log();

})();

