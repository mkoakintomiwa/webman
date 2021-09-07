var fx = require("./functions");
var argv = require("yargs").argv;
var path = require("path");

var config = fx.config();

var application_type = config.application_type || "web";

var absolute_path = argv._[0];
var relative_path = fx.relative_to_document_root(absolute_path);

var is_source_file = false;
var is_specs_file = false;
var is_test_mode = typeof argv["test"]!="undefined";

if (relative_path.match(/^src/)!=null){
    switch (application_type){
        case "web":
            relative_path = path.dirname(relative_path.replace(/^src\\/,"")).concat(".php");
        break;

        case "mobile":
            relative_path = path.dirname(relative_path.replace(/^src\\/,"")).concat(".html");
        break;
    }
    
    is_source_file = true;
}

let node_id = null;
if (relative_path.match(/node-specs\\.*\\/)!=null){
    node_id = fx.match(/node-specs\\(.*?)\\/,relative_path)[0][1];
    relative_path = relative_path.replace(`node-specs\\${node_id}`,"specs");
    is_specs_file = true;
}

fx.trace_save(relative_path,is_source_file,is_specs_file,is_test_mode,node_id);
