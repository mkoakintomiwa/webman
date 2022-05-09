const fx = require("./lib/functions");
const path = require("path");
const argv = require("yargs").argv;

let apkPath = argv._[0];

let cwd = path.dirname(apkPath);
let apkFileName = path.basename(apkPath);

(async _=>{
    await fx.shellExec(`apksigner sign --ks %userprofile%/keystore.keystore --ks-key-alias keystore --ks-pass pass:keystore --key-pass pass:keystore ${apkFileName} & move ${apkFileName} app-release.apk`,{cwd:cwd});
})();
