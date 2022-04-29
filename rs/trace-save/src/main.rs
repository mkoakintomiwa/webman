use rusqlite::{params, Connection};
use functions::*;

struct Files{
    pub node_id: String,
    pub filename: String
}

fn main() {
    let conn = Connection::open("./.webman/webman.db").unwrap();
    
    conn.execute(r#"
        CREATE TABLE IF NOT EXISTS "files" (
            "id" INTEGER,
            "node_id" TEXT,
            "filename" TEXT,
            "is_source_file" TEXT,
            "synced" TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        );
    "#, params![]).unwrap();
    
    
    let node_id = arg_value("node_id");
    let filename = arg_value("filename");
    let is_source_file = arg_value("is_source_file");

    let mut stmt = conn.prepare("SELECT node_id,filename FROM files WHERE node_id=?1 AND filename=?2").unwrap();
    let files_iter = stmt.query_map(params![node_id,filename], |row|{
        Ok(
            Files{
                node_id:row.get(0)?,
                filename:row.get(1)?
            }
        )
    }).unwrap();
    let files_count = files_iter.count();

    if files_count==0{
        conn.execute(
            "INSERT INTO files (node_id, filename, is_source_file, synced) VALUES (?1, ?2, ?3, ?4)",
            params![node_id,filename, is_source_file, "false"],
        ).unwrap();
        println!("New entry for '{} - {}' saved",filename,node_id)
    }else{
        conn.execute(
            "UPDATE files SET synced = ?1 WHERE node_id=?2 AND filename=?3",
            params!["false", node_id,filename],
        ).unwrap();
        println!("Initial entry for '{} - {}' saved",filename,node_id);
    }
    
}


fn arg_value(key: &str)->String{
    let args = base64_arg();
    _t(args[key].as_str().unwrap())
}