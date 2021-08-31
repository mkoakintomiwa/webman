use base64;
use std::fs;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use im;
use hyper;
use hyper_tls::HttpsConnector;

pub fn base64_decode(string: &str)->String{
    String::from_utf8(base64::decode(string).unwrap()).unwrap()
}


pub fn base64_arg()->Value{
    let mut args = std::env::args();
    let arg = args.nth(1);
    json_decode(&base64_decode(&arg.unwrap()))
}



#[derive(Serialize, Deserialize)]
pub struct PortalProperties{
    pub ssh: PPSSH,
    pub settings: PPSettings
}

#[derive(Serialize, Deserialize)]
pub struct PPSettings{
    pub db_user: String,
    pub db_password: String,
    pub db_name: String,
    pub site_port: i32,
    pub rel_dirname: String,
    pub admissions_rel_dirname: String,
    pub portal_id: String
}



#[derive(Serialize, Deserialize)]
pub struct PPSSH{
    pub host: String,
    pub username: String,
    pub password: String,
    pub passphrase: String
}


pub fn _t(_str: &str)->String{
    String::from(_str)
}


pub fn _th(hashmap: im::HashMap<&str,&str>)->im::HashMap<String,String>{
    let mut h = im::HashMap::new();

    for (k,v) in hashmap{
        h.insert(_t(k), _t(v));
    }
    h
}


pub fn file_get_contents(path: &str) -> String{
    fs::read_to_string(path).expect("An error occcured")
}


pub fn json_decode(json_string: &str)->Value{
    serde_json::from_str(json_string).expect("Decoding failed")
}


pub fn hashmap_keys(hashmap: &im::HashMap<String,String>)->Vec<String>{
    let mut vec: Vec<String> = Vec::new();
    for (key,_value) in hashmap{
        vec.push(String::from(key));
    }
    vec
}


pub fn hashmap_values(hashmap: &im::HashMap<String,String>)->Vec<String>{
    let mut vec: Vec<String> = Vec::new();
    for (_key,value) in hashmap{
        vec.push(String::from(value));
    }
    vec
}


pub fn vec_merge(vec1: &Vec<String>,vec2: &Vec<String>)->Vec<String>{
    let mut vec = vec1.to_owned();
    for i in vec2{
        vec.push(String::from(i));
    }
    vec
}


pub fn serde_to_hashmap(serde: &serde_json::Value)->im::HashMap<String,String>{
    let mut h = im::HashMap::new();

    for (k,v) in serde.as_object().unwrap(){
        if v.as_str().is_some(){
            h.insert(String::from(k.as_str()), String::from(v.as_str().unwrap()));
        }
    }
    h
}


pub async fn fetch_url(url: &str)->String{
    
    let https = HttpsConnector::new();
    let client = hyper::Client::builder().build::<_, hyper::Body>(https);
    
    let res = client.get(url.parse().unwrap()).await.unwrap();
    

    let body = hyper::body::to_bytes(res).await.unwrap();
    let v = body.to_vec();
    String::from_utf8(v).unwrap()
}



pub fn portal_properties_base_url(portal_id: &str)->String{
    format!("https://demo.icitifysolution.com/specs/assets/portal-properties/{}",portal_id)
}


pub fn portal_properties_url(portal_id: &str)->String{
    format!("{}/{}",portal_properties_base_url(portal_id),"portal-properties.json")
}


pub async fn portal_properties(portal_id: &str)->PortalProperties{
    let url_string = portal_properties_url(portal_id);
    let response = fetch_url(url_string.as_str()).await;
    serde_json::from_str(response.as_str()).unwrap()
}



pub fn file_exists(path: &str) -> bool {
    let metadata = fs::metadata(path);

    if metadata.is_ok(){
        metadata.unwrap().is_file()
    }else{
        false
    }
}


pub fn directory_exists(path: &str) -> bool {
    let metadata = fs::metadata(path);

    if metadata.is_ok(){
        metadata.unwrap().is_dir()
    }else{
        false
    }
}


pub fn current_dir()->String{
    std::env::current_dir().unwrap().into_os_string().into_string().unwrap()
}


pub fn dirname(path_str: &str)->String{
    let path = std::path::Path::new(path_str);
    _t(path.parent().unwrap().to_str().unwrap())
}



pub fn mkdir(path: &str){
    std::fs::create_dir_all(path).expect("Error occured while creating directory");
}


pub fn document_root()->String{
    let mut _dirname = current_dir();

    loop{
        if file_exists(&format!(r#"{}/settings.json"#,&_dirname)){
            return _dirname;
        }else{
            _dirname = dirname(&_dirname);
        }
    }
}