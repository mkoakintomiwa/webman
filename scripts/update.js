const fx = require("./lib/functions");
const path = require("path");
const unirest = require("unirest");
const fs = require("fs");
const chalk  = require("chalk");
const sqlite = require("./sqlite");

const argv = require("yargs").argv;
var config = fx.config();

const document_root = fx.document_root();
const project_root = fx.project_root();


(async _=>{
    var response = {};
    var rows;
    
    var conn = sqlite.connection();

    await sqlite.fetch("SELECT * FROM 'update' WHERE synced=?",["false"],conn).then(_rows=>{
        rows = _rows;
    });

    i = 0;

    let filename = "update.php";
    
    for (let row of rows){
        var node_id = row.node_id;

        i++;

        let _node = fx.node(row.node_id);
        
        let _config = fx.config();

        let file_transfer_protocol = "http";
        
        switch(file_transfer_protocol){
            case "http":
                
                await fx.hftp_request(row.node_id,{
                    fields:{
                        "filename":"/".concat("update.php")
                    },
                    attachments:{
                        "row":path.join(document_root,"update.php")
                    }
                }).then(r=>{
                    response = r;
                    console.log();
                    console.log(`${chalk.magentaBright(response.raw_body)} * ${chalk.magentaBright(`${i}/${rows.length}`)} * ${chalk.magentaBright(`${fx.round(i/rows.length)*100}%`)}`);
                });
            break;


            case "ftp":
                var ftp_connection;    
                await fx.node_ftp_connection(row.node_id).then(x=>{
                    ftp_connection = x;
                });
                await fx.upload_project_file(fx.forward_slash(row.filename), node_id, ftp_connection,function(local_path,remote_path){
                    console.log(`${chalk.cyanBright(_node.name)} * ${chalk.cyanBright(fx.forward_slash(local_path))} * ${chalk.cyanBright(`${i}/${rows.length}`)} * ${chalk.cyanBright(`${fx.round(i/rows.length)*100}%`)}`);
                }).then(r=>{
                    ftp_connection.end();
                    response = {
                        is_successful: true
                    };
                });
            break;
        }

        


        if (response.is_successful){

            await fx.portal_api_request(node_id,"update.php").then(response=>{
                console.log(response.raw_body);
            });

            await sqlite.execute("UPDATE 'update' SET synced=? WHERE node_id=?",["true",node_id],conn);

        }
    }
    conn.close();
    console.log();

})();

