use rusqlite::{params, Connection};
use functions::*;
use serde::{Serialize,Deserialize};
use json::object;

#[derive(Serialize, Deserialize)]
struct Files{
    pub id: i32,
    pub node_id: String,
    pub filename: String,
    pub is_source_file: String,
    pub synced: String
}

fn main() {
    
    let conn = Connection::open("./.webman/webman.db").unwrap();

    let mut stmt = conn.prepare("SELECT * FROM files WHERE synced=?1").unwrap();
    let files_iter = stmt.query_map(params!["false"], |row|{
        Ok(
            Files{
                id:row.get(0)?,
                node_id: row.get(1)?,
                filename:row.get(2)?,
                is_source_file:row.get(3)?,
                synced:row.get(4)?
            }
        )
    }).unwrap();
    

    let mut acc: Vec<json::JsonValue> = Vec::new();
    
    for file in files_iter{
        let _file = file.unwrap();
        acc.push(object!{
            "id":_file.id,
            "node_id": _file.node_id,
            "filename": _file.filename,
            "is_source": _file.is_source_file,
            "synced": _file.synced
        });
    }

    println!("{:?}",json::stringify(acc));
}


fn _arg_value(key: &str)->String{
    let args = base64_arg();
    _t(args[key].as_str().unwrap())
}