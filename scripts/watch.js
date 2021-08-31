const chokidar = require("chokidar");
const fx = require("./functions");
const {spawn, spawnSync} = require("child_process");
const px = require("path");
const _path_ = require("path");

var config = fx.config();

var project_root = fx.project_root();

chokidar.watch('.',{
    ignored: new RegExp(config.watch_file_ignored),
}).on('add', async (path,event) => {
    var is_source_file = false
    if (path.match(/^source/)!=null){
        path = px.dirname(path.replace(/^source\\/,"")).concat(".php");
        is_source_file = true;
    }
    await fx.trace_save(path,is_source_file);
});