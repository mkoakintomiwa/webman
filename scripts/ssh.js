const fx = require("./functions");
const { escape_sed,portal_properties_dir,remote_public_html } = require("./functions");
const chalk = require('chalk');
const {NodeSSH} = require('node-ssh')
const { Client } = require('ssh2');
var readline = require('readline');
const fs = require("fs");
var stdout = require('./stdout');
const path = require("path");
const argv = require("yargs").parseSync();


var ssh_options = exports.ssh_options = function(_options){
    
    var options = fx.setDefaults({
        readyTimeout: 99999,
        port:22,
        cwd:null,
        raw_ppk:false,
        show_put_file:true,
        show_spinner:true
    },_options); 

    return {
        host: options.host,
        username: options.username,
        privateKey: options.privateKey,
        password:options.password,
        passphrase:options.passphrase,
        readyTimeout: options.readyTimeout,
        port:options.port,
        cwd:options.cwd,
        raw_ppk:options.raw_ppk,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}


var node_ssh_options = exports.node_ssh_options = function(node_id,_options={}){
    var options = fx.setDefaults({
        cwd: null,
        show_put_file:true,
        show_spinner:true
      },_options); 
      
      var _node = fx.node(node_id);
      var ssh = _node.ssh;

      return {
        host: _node.host,
        username: ssh.username,
        password: ssh.password,
        //cwd:options.cwd,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}



var node_root_ssh_options = exports.node_root_ssh_options = function(node_id,_options={}){
    var options = fx.setDefaults({
        cwd: null,
        show_put_file:true,
        show_spinner:true
      },_options); 
      
      var _node = fx.node(node_id);
      var _node_root = fx.node_root(node_id);

      return {
        host: _node.host,
        username: _node_root.username,
        password: _node_root.password,
        //cwd:options.cwd,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}



var root_ssh_options = exports.root_ssh_options = function(root_ip,_options={}){
    var options = fx.setDefaults({
        cwd: null,
        show_put_file:true,
        show_spinner:true
      },_options); 
      
      let _root = fx.root(root_ip);

      return {
        host: root_ip,
        username: _root.username,
        password: _root.password,
        //cwd:options.cwd,
        show_put_file:options.show_put_file,
        show_spinner:options.show_spinner
    }
}


var interactive_shell = exports.interactive_shell = function(_options,command=null){
  
    var options = ssh_options(_options);

    return new Promise(resolve=>{
        var conn = new Client();
        conn.on('ready', function() {
        //console.log(chalk.green("Client :: ready"));
        //console.log("");
        //spinner.stop(true);
        let i = 0;
        conn.shell(function(err, stream) {
            if (err) throw err;
            // create readline interface
            var rl = readline.createInterface(process.stdin, process.stdout);
    
            stream.on('close', function() {
                //process.stdout.write('Connection closed.')
                //console.log('Stream :: close');
                conn.end();
                //resolve();
            }).on('data', function(data) {
                // pause to prevent more data from coming in
                process.stdin.pause()
                process.stdout.write(data);
                process.stdin.resume();
                if (command && i===0) stream.write(command);
                i++; 
            }).stderr.on('data', function(data) {
                process.stderr.write(data);
            });
    
            rl.on('line', function (d) {
                // send data to through the client to the host
                stream.write(d.trim()+'\n');
            });
    
            rl.on('SIGINT', function () {
                // stop input
                process.stdin.pause()
                //process.stdout.write('\nEnding session\n')
                process.stdout.write('\n\n')
                rl.close()
        
                // close connection
                stream.end()
                conn.end();
                resolve();
            })
    
        });
        }).connect(options);
    });
}


/**
 * @return {Promise<NodeSSH>}
 */
var ssh_connection = exports.ssh_connection = async function(_options={}){
    var options = ssh_options(_options);
    var ssh = new NodeSSH();
    
    await new Promise((resolve,reject)=>{
        try{
            ssh.connect(options).then(_=>{
                resolve();
            }).catch(e=>{
                console.log(e);
                console.log(options);
                resolve();
            });
        }catch(e){
            reject(e);
        }
    });
    return ssh;
}

/**
 * @return {Promise<NodeSSH>}
 */
var node_ssh_connection = exports.node_ssh_connection = function(node_id,_options={}){
    return ssh_connection(node_ssh_options(node_id,_options));
}

var root_ssh_connection = exports.root_ssh_connection = function(root_ip,_options={}){
    return ssh_connection(root_ssh_options(root_ip,_options));
}


var node_root_ssh_connection = exports.node_root_ssh_connection = function(node_id,_options={}){
    return ssh_connection(node_root_ssh_options(node_id,_options));
}


var execute_command = exports.execute_command = function(command,ssh_connection,_options={}){

    var options = fx.setDefaults({
        cwd:null
    },_options);
    return new Promise(resolve=>{
        try{
            ssh_connection.exec(command, [], {
                cwd: options.cwd,
                onStdout(chunk) {
                    console.log(chunk.toString());
                },
                onStderr(chunk) {
                    console.log(chunk.toString('utf8'))
                }
            }).then(_=>{
                resolve();
            }).catch(_=>{
                resolve();
            })
        }catch(e){
            console.log(e);
            resolve();
        }
    });
}



var upload_files = exports.upload_files = function(local_remote_files_array,ssh_connection,_options){
  
    var spinner;
    //if (options.show_spinner) spinner = preloader.spinner('Uploading files %s');
    return new Promise(resolve=>{
        //if(options.show_spinner) spinner.stop(true);
        try{
            ssh_connection.putFiles(local_remote_files_array).then(_=>{
                resolve();
            }).catch(e=>{
                resolve();
            });
        }catch(e){
            console.log(e);
            resolve();
        }
    });
}



var upload_file = exports.upload_file = function(localPath, remotePath, sshConnection){
  
    return upload_files([
        {
            "local":localPath,
            "remote": remotePath
        }
    ],sshConnection);
    
}



var put_directory = exports.put_directory = function(local_directory,remote_directory,_options){
    var ssh = new NodeSSH();
  
    return new Promise(resolve=>{
            
        ssh.connect(ssh_options(_options)).then(_=>{
            try{
                ssh.putDirectory(local_directory,remote_directory,{
                    recursive: true,
                    concurrency: 10
                }).then(_=>{
                    ssh.dispose();
                    resolve();
                });
            }catch(e){
                console.log(e);
                ssh.dispose();
                resolve();
            }
        });
    });
}


var get_file = exports.get_file = function(local_file,remote_file,ssh_connection){
    
    console.log(`${chalk.magentaBright('pull file:')} ${chalk.greenBright(fx.forward_slash(remote_file))} ${chalk.redBright(`->`)} ${chalk.cyanBright(fx.forward_slash(local_file))}`);

    return ssh_connection.getFile(local_file,remote_file);
}


var node_get_file = exports.node_get_file = function(relative_path,node_id,ssh_connection){
    let local_file = path.join(fx.document_root(),relative_path);
    let remote_file = fx.remote_node_dir(node_id).concat("/").concat(relative_path);
    return get_file(local_file,remote_file,ssh_connection);
}



var node_execute_command = exports.node_execute_command = function(command,node_ssh_connection,_options={}){
    let node_id = _options.node_id || "";
    let options = fx.setDefaults({
        cwd: fx.remote_node_dir(node_id)
    },_options);
    return execute_command(command,node_ssh_connection,options);
}



var node_root_execute_command = exports.node_root_execute_command = function(command,node_root_ssh_connection,_options){
    return execute_command(command,node_root_ssh_connection,_options);
}




var node_upload_files = exports.node_upload_files = function(local_remote_files_array,node_id,ssh_connection,_options={}){

    var options = fx.setDefaults({
        show_node_name:false,
        show_put_file:true
    },_options)

    if(options.show_node_name) console.log(chalk.green(`\n----- ${fx.node(node_id).name} -----`));

    if (options.show_put_file){
        local_remote_files_array.forEach(local_remote_file => {
            fx.println();
            console.log(`${chalk.magentaBright('put file:')} ${chalk.greenBright(fx.forward_slash(local_remote_file.local))} ${chalk.redBright(`->`)} ${chalk.cyanBright(fx.forward_slash(local_remote_file.remote))}`);
        });
    }
    
    return upload_files(local_remote_files_array,ssh_connection);
}


var node_upload_file = exports.node_upload_file = function(local_path,remote_path,node_id,ssh_connection,_options={}){
    return node_upload_files([
        {
            "local":local_path,
            "remote": remote_path
        }
    ],node_id,ssh_connection);
}



var upload_project_files = exports.upload_project_files = function(file_relative_paths, node_id, ssh_connection,message){
	var local_remote_array = [];

	var _node = fx.node(node_id);

	for (let rel_path of file_relative_paths){
		
		local_remote_array.push({
			local: path.join(fx.document_root(),rel_path),
			remote: fx.remote_node_dir(node_id).concat("/").concat(rel_path)
		});
	}
	return node_upload_files(local_remote_array, node_id, ssh_connection, message);
}



var upload_project_file = exports.upload_project_file = function(file_relative_path, node_id, ssh_connection, message){
	return upload_project_files([file_relative_path], node_id, ssh_connection, message);
}





var cron_command_from_array = exports.cron_command_from_array = function(command_array){
    var command = '';
    var command_period = command_array[0];

    for (let i=0;i<5;i++){
        command+=`${command_period[i]} `
    }
    command+=command_array[1];

    return command;
} 


var build_cron_job_command = exports.build_cron_job_command = function(command){
    return `crontab -l > mycron && echo "${command}" >> mycron && crontab mycron && rm mycron`;
}


var build_delete_cron_job_command = exports.build_delete_cron_job_command = function(command){
    return `crontab -l > mycron && sed -re 's/${escape_sed(command)}//g' mycron > mycron2 && crontab mycron2 && rm mycron && rm mycron2`
}



var create_cron_job = exports.create_cron_job = function(command_array,portal_id){
    var portal_properties = fx.portal_properties(portal_id);
    var ssh = portal_properties.ssh;

    return new Promise(resolve=>{
        var command_period = command_array[0];
        var cron_job_url = fx.encoded_url(`https://${ssh.host}:2083/frontend/paper_lantern/cron/index.html`,{
            u:ssh.username,
            p:ssh.password,
            minute:command_period[0],
            hour:command_period[1],
            day:command_period[2],
            month:command_period[3],
            weekday:command_period[4],
            command:command_array[1]
        });

        fx.copy_to_clipboard(cron_job_url).then(_=>{
            
            stdout.info_console("Redirect",cron_job_url);

            fx.open_in_browser(cron_job_url).then(_=>{
                resolve();
            });
        });
    });
}




var dev_update_composer = exports.dev_update_composer = async function(){
    let _document_root = fx.document_root();
    let composer_path = path.join(_document_root,"composer");

    await fx.download("https://getcomposer.org/composer.phar",path.join(composer_path,"composer.phar"));

    await fx.shell_exec(`php composer.phar update`,{
        cwd: composer_path
    })
}


var update_composer = exports.update_composer = function(node_id,ssh_connection){
    return new Promise(async resolve=>{
        await node_upload_files([
            {
                local:`${fx.document_root()}/composer/composer.json`,
                remote:`${fx.remote_node_dir(node_id)}/composer/composer.json`
            }
        ],node_id,ssh_connection);

        await node_execute_command(`rm -rf composer.phar && wget https://getcomposer.org/composer.phar &&
        chmod +x composer.phar && php composer.phar update`, ssh_connection,{
            cwd:`${fx.remote_node_dir(node_id)}/composer`
        });
        resolve();
    });
}




var updateCronjob = exports.updateCronjob = function(node_id,ssh_connection){
    return new Promise(async resolve=>{

        let node = fx.node(node_id);

        let options = {
            node_id: node_id,
            node: node,
            remote_node_dir: fx.remote_node_dir(node_id)
        };

        let crontab = fx._.generateCrontab(options);

        let tmp_file = fx.new_tmp_file();

        fs.writeFileSync(tmp_file,crontab);

        await node_upload_files([
            {
                local: tmp_file,
                remote:`${fx.remote_node_dir(node_id)}/.crontab`
            }
        ],node_id,ssh_connection);

        await node_execute_command(`echo "" >> .crontab && crontab .crontab`, ssh_connection,{
            cwd:`${fx.remote_node_dir(node_id)}`
        });

        fs.unlinkSync(tmp_file);

        resolve();
    });
}




var update_google_credentials = exports.update_google_credentials = function(node_id,ssh_connection){
    return new Promise(async resolve=>{

        let node = fx.node(node_id);

        let email_address = argv._[2] || node.backup.email_address

        let credentials_rel_dir =  `/assets/google/accounts/${email_address}`;

        let credentials_rel_path =  `${credentials_rel_dir}/credentials.json`;

        let credentials_path = path.join(fx.document_root(),credentials_rel_path); 

        if (!fs.existsSync(credentials_path)){
            let glob = require("glob");

            await new Promise(function(resolve){
                glob(`client_secret**`,{
                    cwd: path.join(fx.document_root(),credentials_rel_dir),
                    absolute: true
                },(err,matches)=>{
                    if (matches.length > 0){
                        fs.renameSync(matches[0],credentials_path);
                    }
                    resolve();
                });
            });
        }

        await node_upload_files([
            {
                local: credentials_path,
                remote: fx.remote_node_dir(node_id).concat(credentials_rel_path)
            }
        ],node_id,ssh_connection);

        resolve();
    });
}





var update_google_token = exports.update_google_token = function(node_id,ssh_connection){
    return new Promise(async resolve=>{

        let node = fx.node(node_id);

        let email_address = argv._[2] || node.backup.email_address;


        let token_rel_path =  `/assets/google/accounts/${email_address}/token.json`;

        let token_path = fx.document_root().concat(token_rel_path);

        if (fs.existsSync(token_path)){
            await node_upload_files([
                {
                    local: token_path,
                    remote: fx.remote_node_dir(node_id).concat(token_rel_path)
                }
            ],node_id,ssh_connection);
        
        }else{

            await interactive_shell(node_ssh_options(node_id),`node /nodejs/googleapis-fetch-token ${email_address}`);

            await node_get_file(`assets/google/accounts/${email_address}/token.json`,node_id,ssh_connection);
        }

        resolve();
        
    });
}



var updateHtaccess = exports.updateHtaccess = function(node_id,ssh_connection){
    return new Promise(async resolve=>{

        let node = fx.node(node_id);

        let options = {
            node_id: node_id,
            node: node,
            libDir: path.join(fx.project_root(),"scripts")
        };

        let htaccess = fx._.generateHtaccess(options);

        let tmp_file = fx.new_tmp_file();

        fs.writeFileSync(tmp_file,htaccess);

        await node_upload_files([
            {
                local: tmp_file,
                remote:`${fx.remote_node_dir(node_id)}/.htaccess`
            }
        ],node_id,ssh_connection);

        fs.unlinkSync(tmp_file);

        resolve();
    });
}



var update_nodejs = exports.update_nodejs = function(node_id,ssh_connection){
    return new Promise(async resolve=>{
        let document_root = fx.document_root();

        await node_upload_file(path.join(document_root,'/nodejs/package.json'), `${fx.remote_node_dir(node_id)}/nodejs/package.json`, node_id ,ssh_connection);

        await node_execute_command(`npm update`,ssh_connection,{
            cwd:`${fx.remote_node_dir(node_id)}/nodejs`
        });
        resolve();
    });    
}



var repairWorkspace = exports.repairWorkspace = async function(nodeId, sshConnection){

    let remoteNodeDir = fx.remote_node_dir(nodeId);
    let remoteDir = fx.remote_dir(nodeId); 

    await node_execute_command(`mv specs ${remoteDir}/specs`,sshConnection,{
        cwd: remoteNodeDir
    });


    await node_execute_command(`rm -rf * && rm -rf .*`,sshConnection,{
        cwd: remoteNodeDir
    });


    await node_execute_command(`git init && git remote add origin https://icitify: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@github.com/icitify/portal-beta && git pull origin master`,sshConnection,{
        cwd: remoteNodeDir
    });


    await fx.shell_exec(`webman generate settings.json -n ${nodeId}`);

    await node_execute_command(`mv ${remoteDir}/specs specs`,sshConnection,{
        cwd: remoteNodeDir
    });


    await node_execute_command(`npm i ejs`,sshConnection,{
        cwd: remoteNodeDir
    });


    await node_execute_command(`npm i`,sshConnection,{
        cwd: `${remoteNodeDir}/updates`
    });


    await node_execute_command(`node update`,sshConnection,{
        cwd: `${remoteNodeDir}/nodejs/app`
    });

}


var open_filezilla = exports.open_filezilla = function(options){
    var command;
    const project_root = fx.project_root();
    const filezilla = path.join(project_root,"FileZilla","filezilla.exe");
    if (options.site_manager){
        command = `"${filezilla}" --site="0/${options.portal_id}"`;
        console.log(command);
    }else{
        command = `"${filezilla}" ${options.protocol || "sftp"}://${options.username}:${options.password}@${options.host}:${options.port || 22}`;
    }


    if (options.local) command+=` --local "${options.local}"`;

    return fx.shell_exec(fx.hstart(command));
}


var node_open_filezilla = exports.node_open_filezilla = function(node_id){
    var _node = fx.node(node_id);
    var ssh = _node.ssh;
    var ftp = _node.ftp || {};
    
    return open_filezilla({
        protocol:ftp.protocol||"sftp",
        username:ftp.user,
        password:ftp.password,
        host: _node.host,
        local: fx.document_root(),
        port:ftp.port||22,
        site_manager:ftp.site_manager||false
    });
};



var node_root_open_filezilla = exports.node_root_open_filezilla = function(node_id){
    var root = fx.node_root(node_id);
    var _node = fx.node(node_id);
    var ssh = _node.ssh;
    var ftp = _node.ftp || {};
    
    return open_filezilla({
        protocol:ftp.protocol||"sftp",
        username:root.username,
        password:root.password,
        host: _node.host,
        local: fx.document_root(),
        port:ftp.port||22,
        site_manager:ftp.site_manager||false
    });
};


var open_putty = exports.open_putty = function(options){
    var command;
    const project_root = fx.project_root();
    const putty = path.join(project_root,"PuTTY","putty.exe");
    if (!options.key_path){
        command = `"${putty}" -ssh ${options.username}@${options.host} -pw "${options.password}"`;
    }else{
        command = `"${putty}" -ssh ${options.username}@${options.host} -i ${options.key_path}`;
    }

    return fx.shell_exec(fx.hstart(command));
}


var node_open_putty = exports.node_open_putty = function(node_id){
    var _node = fx.node(node_id);
    var ssh = _node.ssh;

    var argv = require("yargs").parseSync();

    var puttyOptions = {
        username:ssh.username,
        password:ssh.password,
        host:_node.host
    };

    var path = require("path");
    if (argv.ppk) puttyOptions.key_path = path.join(fx.document_root(),".webman",".ssh","nodes",node_id,"id_rsa.ppk");
    
    return open_putty(puttyOptions);
};



var node_root_open_putty = exports.node_root_open_putty = function(node_id){
    var _node = fx.node(node_id);
    var _node_root = fx.node_root(node_id);
    var ssh = _node.ssh;

    var argv = require("yargs").parseSync();

    var puttyOptions = {
        username:_node_root.username,
        password:_node_root.password,
        host:_node.host
    };
    var path = require("path");
    if (argv.ppk) puttyOptions.key_path = path.join(fx.document_root(),".webman",".ssh","roots",_node.host,"id_rsa.ppk");  
    
    return open_putty(puttyOptions);
};


var root_open_putty = exports.root_open_putty = function(root_ip_address){
    var _node_root = fx.root(root_ip_address);

    var argv = require("yargs").parseSync();

    var puttyOptions = {
        username:_node_root.username,
        password:_node_root.password,
        host: root_ip_address
    };
    var path = require("path");
    if (argv.ppk) puttyOptions.key_path = path.join(fx.document_root(),".webman",".ssh","roots",_node.host,"id_rsa.ppk");  
    
    return open_putty(puttyOptions);
};


var open_heidisql = exports.open_heidisql = function(options){
    const project_root = fx.project_root();
    const heidisql = path.join(project_root,"HeidiSQL","heidisql.exe");
    
    if (options.password.trim().length>0){
        var password_param = ` --password="${options.password}" `;
    }else{
        var password_param = ``;
    }

    var command = `"${heidisql}" --user="${options.username}" --host="${options.host}" ${password_param} --session="${options.host}"`;
    return fx.shell_exec(fx.hstart(command));
}


var node_open_heidisql = exports.node_open_heidisql = function(node_id){
    var _node = fx.node(node_id);
    var _mysql = _node.mysql;
    
    return open_heidisql({
        username:_mysql.username,
        password:_mysql.password,
        host:_node.host
    });
};



var node_open_phpmyadmin = exports.node_open_phpmyadmin = function(node_id){
    var _node = fx.node(node_id);
    var _mysql = _node.mysql;
    
    return fx.open_in_browser(`${_node.node_url}/phpmyadmin/${_mysql.phpmyadmin_auth_key}`,"chrome");
};


var node_root_open_phpmyadmin = exports.node_root_open_phpmyadmin = function(node_id){
    var root = fx.node_root(node_id);
    var _node = fx.node(node_id);
    var _mysql = _node.mysql;
    
    return fx.open_in_browser(`${_node.node_url}/phpmyadmin/${root.mysql.phpmyadmin_auth_key}`,"chrome");
};