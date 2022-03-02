import * as fx from "./functions.js";
import * as ssh from "./ssh.js";


(async () => {

    let argv = fx.argv();

    let rootIp = argv["h"].toString();

    let sshConnection = await ssh.rootSSHConnection(rootIp);

    let context = argv._[0];

    let root = fx.root(rootIp);

    switch(context){

        case "init":
            await ssh.executeCommand(`wget api.wpanel.dev/wpanel/wpanel-ubuntu-20.04 -q && chmod +x wpanel-ubuntu-20.04 && mv wpanel-ubuntu-20.04 /bin/wpanel && wpanel --version`,sshConnection);

            await ssh.executeCommand(`wpanel init server -h ${rootIp} -s ${root.hostname} -p ${root.password}`,sshConnection);
        break;

        case "os":
            let output = await ssh.executeCommand(`cat /etc/os-release`,sshConnection,{ silent: true });
            let os = fx.match(`PRETTY_NAME="(.*)"`,output)[0][1];
            console.log("\n"+os+"\n");
        break;

    }

    sshConnection.dispose();
})();