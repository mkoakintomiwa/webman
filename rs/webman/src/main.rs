use subprocess::Exec;
fn main() {
    let current_exe = std::env::current_exe().unwrap();
    let document_root = current_exe.parent().unwrap().parent().unwrap().to_str().unwrap();

    let script = std::env::args().nth(1).unwrap_or("nodes --run ".to_string());
    let argc = std::env::args().len();
    
    let node_path = match std::env::consts::OS {
        "windows" => format!("{}/node/node.exe",document_root),
        _ => format!("{}/node",document_root)
    };
    
    let mut command = format!("{} {}", node_path ,format!("{}/scripts/{}",document_root,script));

    if argc>2{
        for i in 2..argc{
            let arg = std::env::args().nth(i).unwrap();
            command = format!("{} {} ",command,arg);   
        }
    }

    Exec::shell(command).join().unwrap();
}
