const fx = require("./functions");
const argv = require("yargs").argv;

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
}

fx.println(content);