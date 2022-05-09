const fx = require("./lib/functions");
const argv = require("yargs").argv;
const stdout = require("./stdout");

(async _=>{
    let content;

    await stdout.info_prompt(`Content`,"escape","").then(x=>{
        content = x;
    });

    let escaped = content.replace(new RegExp('"',"g"),`\\"`)

    fx.println(escaped);
})();