let fx = require("./functions");
let argv = require("yargs").argv;

let password = argv._[0];

var unirest = require('unirest');
var req = unirest('GET', `https://api.icitifysolution.com/password-hash?password=${password}`)
  .end(function (res) { 
    if (res.error) throw new Error(res.error); 
    console.log(res.raw_body);
    fx.copy_to_clipboard(res.raw_body);
  });
