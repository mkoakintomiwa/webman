const bcrypt = require('bcrypt');
const argv = require("yargs").argv;

bcrypt.hash(argv._[0],10, function(err, hash) {
    console.log(hash.replace("$2b$","$2y$"));
});