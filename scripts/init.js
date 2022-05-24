const fs = require("fs");
const fx = require("./lib/functions");
const glob = require("glob");
const { info_prompt,prompt_object } = require("./stdout");
const argv = require("yargs").argv;

let document_root = process.cwd();

let config = {};

config.nodes = {};
config.roots = {};

(async ()=>{
    await prompt_object(_=>{
        return new Promise(async (resolve)=>{

            fx.println();
    
            let node = {};
            let node_id;
            await info_prompt("node_id","Node",fx.random_characters()).then(x=>{
                node_id = x;
            });

            await info_prompt("Name","Node",node_id).then(x=>{
                node.name = x;
            });

            await info_prompt("Domain Name","Node",node_id).then(x=>{
                node.domainName = x;
            });


            await info_prompt("Host","Node","").then(x=>{
                node.host = x;
            });

            node.baseUrl = `https://${node.domainName}`;

            await info_prompt("relDirname","Node","").then(x=>{
                node.relDirname = x;
            });

            
            node.nodeUrl = `${node.baseUrl}${node.relDirname}`;

            
            await info_prompt("handshake_auth_key","Node",fx.hash(fx.random_characters(32))).then(x=>{
                node.handshake_auth_key = x;
            });

            node.ssh = {};
            
            await info_prompt("Username","SSH","").then(x=>{
                node.ssh.username = x;
            });


            await info_prompt("Password","SSH",fx.random_characters(15)).then(x=>{
                node.ssh.password = x;
            });


            node.ftp = {};
            await info_prompt("Username","FTP",node.ssh.username).then(x=>{
                node.ftp.user = x;
            });


            await info_prompt("Password","FTP",node.ssh.password).then(x=>{
                node.ftp.password = x;
            });


            node.mysql = {};
            
            await info_prompt("Host","MySQL","localhost").then(x=>{
                node.mysql.host = x;
            });
            
            await info_prompt("Username","MySQL","").then(x=>{
                node.mysql.username = x;
            });

            
            await info_prompt("Password","MySQL",fx.random_characters(15)).then(x=>{
                node.mysql.password = x;
            });

            
            await info_prompt("Databases (Comma Delimited)","MySQL","").then(x=>{
                node.mysql.databases = fx.real_array(x.split(","),true);
            });


            await info_prompt("Active?","Node","true").then(x=>{
                node.active = x==="true";
            });
     
            resolve({
                "node_id": node_id,
                "node": node
            });
    
        });
    },"nodes").then(x=>{
        for (let _node_ of x){
            config["nodes"][_node_.node_id] = _node_.node; 
        }
    });



    await prompt_object(_=>{
        return new Promise(async (resolve)=>{

            fx.println();
    
            let root = {};
            let root_ip;
            
            await info_prompt("IP","root",Object.values(config.nodes)[0].host).then(x=>{
                root_ip = x;
            });

            await info_prompt("username","root","root").then(x=>{
                root.username = x;
            });

            await info_prompt("password","root",fx.random_characters(25)).then(x=>{
                root.password = x;
            });

            resolve({
                "root_ip": root_ip,
                "root": root
            });
        })
    },"roots").then(x=>{
        for (let _root_ of x){
            config["roots"][_root_.root_ip] = _root_.root; 
        }
    });



    await info_prompt("File Transfer Protocol","config","http").then(x=>{
        config.file_transfer_protocol = x;
    });


    await info_prompt("Application Type","config","web").then(x=>{
        config.application_type = x;
    });


    config.test = {};

    await info_prompt("node ID","Test",Object.keys(config.nodes)[0]).then(x=>{
        config.test.node_id= x;
    });


    await info_prompt("Active?","Test","true").then(x=>{
        config.test.active = x==="true";
    });


    fx.writeConfig(config,document_root);

    await fx.shellExec("webman vscode init");

    await fx.shellExec("webman db prepare");

    for (let node_id of Object.keys(config.nodes)){

        let node = config.nodes[node_id];
        let root = fx.node_root(node_id);
        
        await info_prompt(`Make sure root is accessible from PuTTY with root username: "${root.username}" and password: "${root.password}" @ ${node.host}`,"PuTTY","Enter");

        await info_prompt(`Make sure you enable "mysql" command without password: ${node.mysql.password} on root @ ${node.mysql.host}`,"MySQL","Enter");

        await fx.shellExec(`webman mysql add user --node-id "${node_id}"`);

        await fx.shellExec(`webman mysql add databases --node-id "${node_id}"`);

        await fx.shellExec(`webman mysql add remote-host --node-id "${node_id}"`);
    }

})();