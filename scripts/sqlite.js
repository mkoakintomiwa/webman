var fx = require("./functions");
var sqlite3 = require('sqlite3').verbose();

var connection = exports.connection = function(){
    var document_root = fx.document_root();
    return new sqlite3.Database(`${document_root}/.webman/webman.db`);
}


var execute = exports.execute = function(query,parameters=[],sqlite_connection){
    return new Promise(resolve=>{    
        sqlite_connection.prepare(query,parameters,function(){
            resolve();
        }).run().finalize();
    });
}


var fetch = exports.fetch = async function(query,parameters=[],sqlite_connection){
    let _rows;
    await new Promise(function(resolve){
        sqlite_connection.all(query,parameters,(err,rows)=>{
            _rows = rows;
            resolve();
        })
    });
    return _rows;
}



var fetch_one = exports.fetch_one = async function(query,parameters=[],sqlite_connection){
    let rows = await fetch(query,parameters,sqlite_connection)

    if (rows.length > 0){
        return rows[0];
    }else{
        return false;
    }
}