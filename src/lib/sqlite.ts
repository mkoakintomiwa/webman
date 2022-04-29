import * as fx from "./functions";
import * as sqlite3 from 'sqlite3';

export function connection(){
    var document_root = fx.document_root();
    return new sqlite3.Database(`${document_root}/.webman/webman.db`);
}


export function execute(query,parameters=[],sqlite_connection){
    return new Promise<void>(resolve=>{    
        sqlite_connection.prepare(query,parameters,function(){
            resolve();
        }).run().finalize();
    });
}


export async function fetch(query,parameters=[],sqlite_connection){
    let _rows;
    await new Promise<void>(function(resolve){
        sqlite_connection.all(query,parameters,(err,rows)=>{
            _rows = rows;
            resolve();
        })
    });
    return _rows;
}



export async function fetch_one(query,parameters=[],sqlite_connection){
    let rows = await fetch(query,parameters,sqlite_connection)

    if (rows.length > 0){
        return rows[0];
    }else{
        return false;
    }
}