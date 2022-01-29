const fx = require("./functions");
const fs = require("fs");
const os = require("os");
const path = require("path");
const SSHConfig = require('ssh-config');
const ssh = require("./ssh");
var argv = require('yargs').parseSync();

const sshPath = path.join(os.homedir(),".ssh");
const configPath = path.join(sshPath,"config");

(async _=>{
    if (!fs.existsSync(sshPath)) fs.mkdirSync(sshPath);
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath,"");
    
    let configContent = fs.readFileSync(configPath).toString();
    const config = SSHConfig.parse(configContent);

    let HostName = null;
    let User = null;
    let remoteHomeDir = null;
    let defaultRemoteDir = null;

    if (argv["root-ip"]){
        let rootIp = argv["root-ip"]; 
        let root = fx.root(rootIp);
        HostName = rootIp;
        User = root.username;
        remoteHomeDir = '/root';
        defaultRemoteDir = '/';
    }else{
        if (argv["root"]){
            let node = fx.node(argv._[0]);
            let root = fx.node_root(argv._[0]);
            HostName = node.host;
            User = root.username;
            remoteHomeDir = '/root';
            defaultRemoteDir = '/root';
        }else{
            let nodeId = argv._[0];
            let node = fx.node(nodeId);
            HostName = node.host;
            User = node.ssh.username;
            remoteHomeDir = fx.remote_dir(nodeId);
            defaultRemoteDir = remoteHomeDir+"/public_html";
        }
    }

    let Host = `${User}_${HostName}`;

    if (typeof config.find({ Host }) === "undefined"){

        let sshConnection = null;

        if (argv["root-ip"]){
            sshConnection = await ssh.root_ssh_connection(HostName);
            remoteHomeDir = '/root';
        }else{
            if (argv["root"]){
                sshConnection = await ssh.root_ssh_connection(HostName);
                remoteHomeDir = '/root';
            }else{
                let nodeId = argv._[0];
                sshConnection = await ssh.node_ssh_connection(nodeId);
                remoteHomeDir = fx.remote_dir(nodeId);
            }
        }

        let keysDir = path.join(sshPath,"hosts",HostName,User);
        if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir,{ recursive: true });
        let privateKeyPath = path.join(keysDir,"id_rsa");
        let publicKeyPath = `${privateKeyPath}.pub`;
        
        await fx.shell_exec(`ssh-keygen -b 2048 -t rsa -f ${privateKeyPath} -q -N ""`);
        config.append({
            Host,
            User,
            HostName,
            PasswordAuthentication: false,
            PubkeyAuthentication: true,
            IdentityFile: privateKeyPath
        });
        

        fs.writeFileSync(configPath,SSHConfig.stringify(config));



        await ssh.upload_file(publicKeyPath,`${remoteHomeDir}/authorized_keys.chunk`,sshConnection);

        await ssh.execute_command(`mkdir -p .ssh && chmod 700 .ssh && cat authorized_keys.chunk >> .ssh/authorized_keys && chmod 644 .ssh/authorized_keys && rm authorized_keys.chunk`,sshConnection,{
            cwd: remoteHomeDir
        });

        sshConnection.dispose();
        
    }

    await fx.shell_exec(`code --remote ssh-remote+${Host} ${defaultRemoteDir}`);
    fx.println();
})();