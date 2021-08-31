const fx = require("./functions");
const Downloader = require('nodejs-file-downloader');
const cliProgress = require('cli-progress');
const argv = require("yargs").argv;
const path = require("path");

var rel_path = argv._[0];
var document_root = fx.document_root();

var downloaded_file = path.join(document_root,rel_path); 
var download_directory = path.dirname(downloaded_file);
var downloaded_filename = path.basename(downloaded_file);

var file_base_url = fx.node(fx.active_node_ids()[0]).node_url;

if (argv["node-id"]) file_base_url = fx.node(argv["node-id"]).node_url;

(async () => {
    fx.println();
    const bar = new cliProgress.SingleBar({
        format: `${downloaded_filename} [{bar}] {percentage}% | ETA: {eta}s`
    }, cliProgress.Presets.shades_classic);
    bar.start(100, 0);
    var initial_percentage = 0;
    const downloader = new Downloader({     
        url: `${file_base_url}/${rel_path}`,     
        directory: download_directory,  
        onProgress:function(percentage){
            bar.increment(percentage-initial_percentage);
            initial_percentage = percentage;  
        },
        cloneFiles: false
    })    
    await downloader.download();   
    bar.stop();
})();  