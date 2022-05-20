const fx = require("./lib/functions");
const argv = require("yargs").argv;
const crypto = require("crypto");

var context = argv._[0];

var length = argv._[1] || 15;

var content;
switch (context){
    case "digits":
        content = fx.random_digits(length);
    break;

    case "characters":
        content = fx.random_characters(length);
    break;

    case "hex":
        content = fx.hash(fx.random_characters(length));
    break;

    case "bytes":
        content = crypto.randomBytes(length).toString("hex");
    break;
}

fx.println(content);