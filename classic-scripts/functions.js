import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'

export function documentRoot(rootFile=".webman"){
    var dirname = process.cwd();
    while(true){
        if (fs.existsSync(dirname+'/'+rootFile)){
            return dirname;
        }else{
			if (dirname != path.dirname(dirname)){
				dirname=path.dirname(dirname)	
			}else{
				return ""; 
			}
        }
    }
    
}

/**
 * 
 * @param {string} documentRoot 
 * @returns {string}
 */
export function config(documentRoot){    
    return JSON.parse(fs.readFileSync(path.join(documentRoot,".webman","config.json")).toString())
}


/**
 * 
 * @param {string} rootIp 
 * @returns {RootOptions}
 */
export function root(rootIp){
    let _documentRoot = documentRoot();
	return config(_documentRoot)["roots"][rootIp];
}


/**
 * 
 * @param {string} parameter 
 * @param {string} value 
 * @returns {string}
 */
export function setDefault(parameter,value){
	return typeof parameter != 'undefined' ? parameter : value;
}

/**
 * 
 * @param {Record<string,any>} defaults 
 * @param {Record<string,any>} options 
 * @returns {Record<string,any>}
 */
export function setDefaults(defaults,options){
	for (let property in defaults){
        let value = defaults[property];
		if (typeof options[property] === 'undefined') options[property] = value; 
	};
    return options;
}


export function argv(){
    return yargs(hideBin(process.argv)).parseSync();
}

/**
 * 
 * @param {string} pattern 
 * @param {string} haystack 
 * @returns {string[]}
 */
export function match(pattern,haystack){
	var regex = new RegExp(pattern,"g")
	var matches = [];
	
	var match_result = haystack.match(regex);
	
	for (let index in match_result){
		var item = match_result[index];
		matches[index] = item.match(new RegExp(pattern)); 
	}
	return matches;
}