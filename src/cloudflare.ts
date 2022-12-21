import * as fs from "fs"
import * as fx from "./lib/functions"
import * as path from "path"
import * as ssh from "./lib/ssh"
import axios from "axios"

const argv = require("yargs").argv; 
var Table = require('cli-table3');
var psl = require('psl');
const dns = require('dns');


let document_root = fx.documentRoot();

let node_id = fx.arg_node_ids(argv)[0];

let node = fx.node(node_id);

var parsed = psl.parse(node.domainName);

// @ts-ignore
let rootDomainName: string;

let cloudflare = node.cloudflare;

if (cloudflare){

    let cloudflareAccounts = JSON.parse(fs.readFileSync(path.join(document_root,".cloudflare","accounts.json")).toString());
    let cloudflareServerAccount = JSON.parse(fs.readFileSync(path.join(document_root,".cloudflare","server-account.json")).toString());


    // @ts-ignore
    let context = argv._[0];
    // @ts-ignore
    let activity = argv._[1];

    let email: string;
    let account: Record<string, any>
    let cloudflareHeaders: Record<string, any>

    if (context === "server"){
        email = cloudflareServerAccount.username;

        cloudflareHeaders = {
            'X-Auth-Email': email,
            'X-Auth-Key': cloudflareServerAccount.auth_key,
            'Content-Type': 'application/json'
        };
        rootDomainName = cloudflareServerAccount.domain;

    }else{
        email = cloudflare.email;
        account = cloudflareAccounts[email];
        rootDomainName = parsed.domain;

        cloudflareHeaders = {
            'X-Auth-Email': email,
            'X-Auth-Key': account.auth_key,
            'Content-Type': 'application/json'
        };
    }

    let cloudflareEndpoint = `https://api.cloudflare.com/client/v4`;

    (async _=>{

        switch(context){
            case "dns":

                switch(activity){
                    case "list":
            
                        // @ts-ignore
                        dnsARecords().then(function (records) {

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

                        let dns = await getDNSRecord();         

                        // @ts-ignore
                        axios({
                            method: 'put',
                            url: `${cloudflareEndpoint}/zones/${dns.zone_id}/dns_records/${dns.id}`,
                            headers: cloudflareHeaders,
                            data: JSON.stringify({
                                "type":"A",
                                "name": node.domainName,
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

                    case "get":
                        console.log(await getDNSRecord());
                    break;

                }

            break;

            case "zone":
                switch(activity){
                    case "list":
                        console.log(await getAllZones());
                    break;

                    case "get":
                        console.log(await getZone());
                    break;
                }
            break;


            case "server":

                switch(activity){
                    
                    case "update":
                        
                        let dns = await getDNSRecord();  

                        // @ts-ignore
                        axios({
                            method: 'put',
                            url: `${cloudflareEndpoint}/zones/${dns.zone_id}/dns_records/${dns.id}`,
                            headers: cloudflareHeaders,
                            data: JSON.stringify({
                                "type":"A",
                                "name": `${argv._[2]}.${cloudflareServerAccount.domain}`,
                                "content":argv._[3],
                                "ttl": 1,
                                "proxied": false
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
                }
        }
    })();


    async function getAllZones(){
        // @ts-ignore
        let response = await axios({
            method: 'get',
            url: `${cloudflareEndpoint}/zones`,
            headers: cloudflareHeaders
        });
        return response.data["result"];
    }


    async function getZone(){

        // @ts-ignore
        let response = await axios({
            method: 'get',
            url: `${cloudflareEndpoint}/zones`,
            headers: cloudflareHeaders,
            params: {
                "name": rootDomainName
            }
        });
        
        return response.data["result"][0];
    }


    async function dnsARecords(){
        let zone = await getZone();
        // @ts-ignore
        let response = await axios({
            method: 'get',
            url: `${cloudflareEndpoint}/zones/${zone.id}/dns_records?type=A`,
            headers: cloudflareHeaders
        });
        return response.data["result"];
    }


    async function getDNSRecord(){
        let _dnsRecords = await dnsARecords();
        if (context === "server"){
            return _dnsRecords[0];
        }else{
            for (let record of _dnsRecords){
                if (record.name === node.domainName){
                    return record;
                }
            }
        }
        return null;
    }
}