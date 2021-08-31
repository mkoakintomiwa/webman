use rusqlite::{params, Connection};
use functions::*;

fn main() {
    
    let conn = Connection::open("./.webman/webman.db").unwrap();
    let node_id = arg_value("node_id");
    let filename = arg_value("filename");
    
    conn.execute(
        "UPDATE files SET synced=$1 WHERE node_id=$2 AND filename=$3",
        params!["true",node_id,filename],
    ).unwrap();
    println!("Sync update for {} - {}",node_id, filename);
}


fn arg_value(key: &str)->String{
    let args = base64_arg();
    _t(args[key].as_str().unwrap())
}