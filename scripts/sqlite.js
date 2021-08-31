var fx = require("./functions");
var sqlite3 = require('sqlite3').verbose();

var connection = exports.connection = function(){
    var document_root = fx.document_root();
    return new sqlite3.Database(`${document_root}/.webman/webman.db`);
}


var execute = exports.execute = function(query,parameters=[],sqlite_connection){
    return new Promise(resolve=>{    
        sqlite_connection.prepare(query,parameters).run().finalize();
        resolve();
    });
}


var fetch = exports.fetch = function(query,parameters=[],sqlite_connection){
    return new Promise(function(resolve){
        sqlite_connection.all(query,parameters,(err,rows)=>{
            resolve(rows);
        })
    });
}



var fetch_one = exports.fetch_one = function(query,parameters=[],sqlite_connection){
    return new Promise(resolve=>{
        fetch(query,parameters,sqlite_connection).then(rows=>{
            resolve(rows[0]);
        });
    });
}