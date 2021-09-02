const fs = require("fs");
const fx = require("./functions");
const argv = require("yargs").argv;
const path = require("path")
const ssh = require("./ssh");
const sx = require("./stdout"); 
var axios = require('axios');
var Table = require('cli-table3');

let document_root = fx.document_root();

let node_id = fx.arg_node_ids(argv)[0];

let node = fx.node(node_id);

let cloudflareAccounts = JSON.parse(fs.readFileSync(path.join(document_root,".webman","cloudflare","accounts.json")));

let cloudflare = node.cloudflare;

if (cloudflare){

    let context = argv._[0];
    let activity = argv._[1];

    let email = cloudflare.email;
    let account = cloudflareAccounts[email];

    let cloudflareHeaders = {
        'X-Auth-Email': email,
        'X-Auth-Key': account.auth_key,
        'Content-Type': 'application/json'
    };

    let cloudflareEndpoint = `https://api.cloudflare.com/client/v4`;

    (async _=>{
        switch(context){
            case "dns":

                switch(activity){
                    case "list":
            
                        axios({
                            method: 'get',
                            url: `${cloudflareEndpoint}/zones/${cloudflare.zone.id}/dns_records?type=A`,
                            headers: cloudflareHeaders
                        }).then(function (response) {
                            let records = response.data["result"];

                            var table = new Table({
                                head: ['DNS ID', 'Name', 'IP Address']
                            });

                            for(let record of records){
                                table.push([record.id,record.name,record.content]);
                            }

                            console.log(table.toString());


                        }).catch(function (error) {
                            console.log(error);
                        });

                    break;


                    case "update":

                        axios({
                            method: 'put',
                            url: `${cloudflareEndpoint}/zones/${cloudflare.zone.id}/dns_records/${cloudflare.dns.id}`,
                            headers: cloudflareHeaders,
                            data: JSON.stringify({
                                "type":"A",
                                "name": cloudflare.dns.name,
                                "content":argv["h"],
                                "ttl": 1,
                                "proxied": true
                            })
                        }).then(function (response) {
                            if (response.data.success){
                                console.log("DNS Record successfully updated")
                            }else{
                                console.log(response.data);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    break;
                }

            break;
        }
    })();    
}

