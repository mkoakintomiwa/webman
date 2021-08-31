const fs = require("fs");
const fx = require("./functions");
const argv = require("yargs").argv;
const path = require("path")
const ssh = require("./ssh");
const sx = require("./stdout"); 
var axios = require('axios');

let document_root = fx.document_root();

let node_id = fx.arg_node_ids(argv)[0];

let node = fx.node(node_id);
let cloudflare = node.cloudflare;

if (cloudflare){

    let context = argv._[0];
    let activity = argv._[1];

    let cloudflareHeaders = {
        'X-Auth-Email': cloudflare.email,
        'X-Auth-Key': cloudflare.auth_key,
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
                            url: `${cloudflareEndpoint}/zones/${cloudflare.zone_identifier}/dns_records`,
                            headers: cloudflareHeaders
                        }).then(function (response) {
                            console.log(response.data);
                        }).catch(function (error) {
                            console.log(error);
                        });

                    break;


                    case "update":

                        axios({
                            method: 'put',
                            url: `${cloudflareEndpoint}/zones/${cloudflare.zone_identifier}/dns_records/${cloudflare.dns_identifier}`,
                            headers: cloudflareHeaders,
                            data: JSON.stringify({
                                "type":"A",
                                "name": node.domain_name,
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

