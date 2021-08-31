const functions = require("./functions");
var Spinner = require('cli-spinner').Spinner;
var obj = new Spinner('processing.. %s')

var spinner = exports.spinner = function(message,_options={}){
    var options = functions.setDefaults({
        spinner_id:0
    },_options);

    return new Spinner({
        text: ` ${message} `,
        stream: process.stderr,
        onTick: function(msg){
            this.clearLine(this.stream);
            this.stream.write(msg);
        }
    }).setSpinnerString(options.spinner_id).start();
}