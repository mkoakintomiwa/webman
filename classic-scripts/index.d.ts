type SSHRemoteConnectionOptions = {
    cwd?: string,
    silent?: boolean
}

type RootOptions = {
    username: string;

    password: string;

    hostname: string;

    provider: HostProviderInfo;
}

type HostProviderInfo = {
    name?: string;

    username?: string;
}