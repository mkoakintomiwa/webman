use subprocess::Exec;
fn main() {
    let current_exe = std::env::current_exe().unwrap();
    let document_root = current_exe.parent().unwrap().parent().unwrap().to_str().unwrap();

    let script = std::env::args().nth(1).unwrap();
    let argc = std::env::args().len();
    let mut command = format!("{} {}",format!("{}/node/node.exe",document_root),format!("{}/scripts/{}",document_root,script));

    if argc>2{
        for i in 2..argc{
            let arg = std::env::args().nth(i).unwrap();
            command = format!("{} {} ",command,arg);   
        }
    }else{
        command = format!("{} {} ",command," nodes --run ");
    }

    Exec::shell(command).join().unwrap();
}
