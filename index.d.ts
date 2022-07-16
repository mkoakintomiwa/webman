
type RootOptions = {
    
    username: string;

    password: string,
            
    hostname: string;
            
    provider: {
        
        name: string;

        username: string;
    }
}


type LocalRemoteFilesArray = Record<"local"|"remote", string>[];


type NodeSSHOptions = {
    
    host?: string;

    username?: string;

    privateKey?: string;

    password?: string;

    passphrase?: string;
        
    readyTimeout?: number;

    port?: number;
        
    cwd?: string;

}


type SSHSettings = {

    message?: string;

    showNodeName?: boolean;

    showDescription?: boolean;

    showSpinner?: boolean;

    verbose?: boolean;
}


type WebmanNode = {

    name: string;
    
    domainName: string;

    host: string;

    hostname?: string;

    home?: string;

    remoteHomeDir?: string;

    baseUrl: string;

    relDirname: string;

    nodeUrl: string;

    cloudflare: {
        email: string
    }

    ssh: {

        username: string;

        password?: string;

        privateKey?: string;

    }

    mysql: {

        username: string;

        password: string;

        databases?: string[];

        phpmyadminAuthKey?: string[];
    }


    active?: boolean;

    devMode?: boolean;
}


type WebmanRoot = {

    username?: string;

    password?: string;

    privateKey?: string;

    hostname?: string;

    mysql: {
        
        username?: string;

        password?: string;

        phpmyadminAuthKey?: string;
    }
}


type WebmanConfig = {

    nodes: Record<string, WebmanNode>

    roots: Record<string, WebmanRoot>

    fileTransferProtocol?: "http" | "ssh";

    applicationType?: "web" | "mobile";

    test?: {
        nodeId: string,
        active: boolean
    }

    nodeConfigName?: string;

    remotes?: string[];

    git?: {
        config?: {
            user: {
                
                name: string;

                email: string
            }
        }
    }
}