"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random_float = exports.git_full_address = exports.file_request_error_message = exports.file_request_success_message = exports.portal_http_upload = exports.portal_api_request = exports.require_portal_id = exports.match = exports.dotted_parameter = exports.modify_resource_icon = exports.sleep = exports.taskkil = exports.realArray = exports.real_array = exports.dollar_replace = exports.brackets_replace = exports.escape_sed = exports.escapeRegExp = exports.back_slash = exports.forward_slash = exports.unique_school_id = exports.copy_to_clipboard = exports.open_in_browser = exports.encoded_url = exports.file_copy_contents = exports.folderDialog = exports.filesDialog = exports.fileDialog = exports.shellExec = exports.echo_log_file = exports.shell_log_file = exports.log_file = exports.portal_dir = exports.settings = exports.empty_tmp_directory = exports.tmp_directory = exports.project_root = exports.document_root = exports.setDefaults = exports.setDefault = exports.writeFiles = exports.rmdir = exports.emptyDir = exports.copyFiles = exports.files_in_directory = exports.subdirectories = exports.time = exports.remoteNodeDir = exports.remotePublicHtml = exports.remoteDir = void 0;
exports.readlineInterface = exports.setTerminalTitle = exports.argsCommandAppend = exports.escapeShell = exports.hex2bin = exports.bin2hex = exports.arg_node_ids = exports.zipDirectory = exports.copyProjectTemplateDirectory = exports.copyTemplateDirectory = exports.copyProjectTemplateFile = exports.copyTemplateFile = exports.template_content = exports.template_path = exports.new_tmp_file = exports.unique_characters_from_fs = exports.unique_digits_from_fs = exports.unique_from_fs = exports.random_digits = exports.random_characters = exports.round = exports.rigid_public_ip = exports.public_ip = exports.println = exports.relative_to_document_root = exports.hstart = exports.active_root_ips = exports.active_node_ids = exports.node_root = exports.root = exports.node = exports.node_ids = exports.spawn_process = exports.base64_decode = exports.base64_encode = exports.hftp_request = exports.project_ftp_mkdir = exports.ftp_mkdir = exports.ftp_put = exports.upload_project_file = exports.upload_project_files = exports.node_ftp_connection = exports.ftp_config = exports.upload_file = exports.upload_files = exports.ftp_connection = exports.hash = exports.writeFileSync = exports.writeConfig = exports.config = void 0;
exports.percentageChunk = exports.webpackOptions = exports.n = exports.download = exports.project_specific_scripts_path = exports.saveReadlineInterfaceHistory = void 0;
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const child_process_1 = require("child_process");
const sqlite = require("./sqlite");
const process = require("process");
const readline = require('readline');
const transpilers_1 = require("./transpilers");
const LineManager_1 = require("./LineManager");
const glob = require("glob");
const chalk = require("chalk");
const ncp_1 = require("ncp");
require('dotenv').config();
class log {
    static write(content) {
        fs.writeFileSync(this.file(), content);
    }
    static clear() {
        fs.writeFileSync(this.file(), '');
    }
    static content() {
        return fs.readFileSync(this.file(), "utf-8");
    }
    static file() {
        let log_file_path = path.join("C:/tmp", "log_file");
        if (!fs.existsSync(log_file_path))
            fs.writeFileSync(log_file_path, "");
        return path.join(log_file_path);
    }
}
exports.log = log;
function remoteDir(node_id) {
    return `/home/${node(node_id).ssh.username}`;
}
exports.remoteDir = remoteDir;
function remotePublicHtml(node_id) {
    return `${remoteDir(node_id)}/public_html`;
}
exports.remotePublicHtml = remotePublicHtml;
function remoteNodeDir(node_id) {
    return `${remotePublicHtml(node_id)}${node(node_id).rel_dirname}`;
}
exports.remoteNodeDir = remoteNodeDir;
function time() {
    return Date.now();
}
exports.time = time;
function subdirectories(directory) {
    var _subdirectories = [];
    fs.readdirSync(directory).forEach(filename => {
        if (fs.lstatSync(path.normalize(directory + '/' + filename)).isDirectory())
            _subdirectories.push(filename);
    });
    return _subdirectories;
}
exports.subdirectories = subdirectories;
function files_in_directory(directory) {
    var _files_in_directory = [];
    fs.readdirSync(directory).forEach(file => {
        if (fs.lstatSync(path.join(directory, file)).isFile())
            _files_in_directory.push(path.basename(file));
    });
    return _files_in_directory;
}
exports.files_in_directory = files_in_directory;
function copyFiles(source, destination, excluded = []) {
    if (!fs.existsSync(destination))
        fs.mkdirSync(destination, { recursive: true });
    return new Promise(resolve => {
        //ncp.limit = 16;
        let ncpOptions = {
            filter: function (file) {
                let filesBool = [];
                excluded.forEach((k) => {
                    filesBool.push(file.toString().indexOf(k) === -1);
                });
                return !filesBool.includes(false);
            }
        };
        (0, ncp_1.ncp)(source, destination, ncpOptions, function (err) {
            if (err) {
                resolve(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.copyFiles = copyFiles;
function emptyDir(dir) {
    return new Promise(resolve => {
        fsExtra.emptyDir(dir, _ => {
            resolve();
        });
    });
}
exports.emptyDir = emptyDir;
function rmdir(dir) {
    return new Promise(resolve => {
        fsExtra.remove(dir, _ => {
            resolve();
        });
    });
}
exports.rmdir = rmdir;
/**
 * @param {String[]} dirs
 * @param {String} cwd
 */
var rmdirs = exports.rmdirs = async function (dirs, cwd = null) {
    for (let dir of dirs) {
        var _dir;
        if (cwd) {
            _dir = path.join(cwd, dir);
        }
        else {
            _dir = dir;
        }
        await rmdir(_dir);
    }
};
/**
 * @param {String[]} file_content_array
 * @param {String} cwd
 */
function writeFiles(file_content_array, cwd = null, callback = null) {
    return new Promise(async (resolve) => {
        for (let file_content of file_content_array) {
            const file = file_content[0];
            const _path = cwd ? path.join(cwd, file) : file;
            const content = file_content[1];
            await new Promise(resolve => {
                fs.writeFile(_path, content, _ => {
                    if (callback)
                        callback(_path);
                    resolve();
                });
            });
        }
        resolve();
    });
}
exports.writeFiles = writeFiles;
function setDefault(parameter, value) {
    return typeof parameter != 'undefined' ? parameter : value;
}
exports.setDefault = setDefault;
function setDefaults(defaults, options) {
    for (let property in defaults) {
        let value = defaults[property];
        if (typeof options[property] === 'undefined')
            options[property] = value;
    }
    ;
    return options;
}
exports.setDefaults = setDefaults;
function document_root(root_file = ".webman") {
    var dirname = process.cwd();
    while (true) {
        if (fs.existsSync(dirname + '/' + root_file)) {
            return dirname;
        }
        else {
            if (dirname != path.dirname(dirname)) {
                dirname = path.dirname(dirname);
            }
            else {
                return "";
            }
        }
    }
}
exports.document_root = document_root;
function project_root(root_file = "bin") {
    var dirname = __dirname;
    while (true) {
        if (fs.existsSync(dirname + '/' + root_file)) {
            return dirname;
        }
        else {
            dirname = path.dirname(dirname);
        }
    }
}
exports.project_root = project_root;
function tmp_directory() {
    var _tmp_directory = path.normalize(`${document_root()}/tmp`);
    if (!fs.existsSync(_tmp_directory))
        fs.mkdirSync(_tmp_directory);
    return _tmp_directory;
}
exports.tmp_directory = tmp_directory;
function empty_tmp_directory() {
    return emptyDir(tmp_directory());
}
exports.empty_tmp_directory = empty_tmp_directory;
function settings() {
    return JSON.parse(fs.readFileSync(document_root() + '/settings.json', 'utf8'));
}
exports.settings = settings;
function portal_dir() {
    return document_root("portal_root.json");
}
exports.portal_dir = portal_dir;
function log_file() {
    var _portal_dir = portal_dir();
    return `${_portal_dir}/nodejs/logs/shellExecute`;
}
exports.log_file = log_file;
function shell_log_file() {
    var _portal_dir = portal_dir();
    return `${_portal_dir}/logs/shellExecute`;
}
exports.shell_log_file = shell_log_file;
function echo_log_file() {
    var _portal_dir = portal_dir();
    return `${_portal_dir}/logs/echo`;
}
exports.echo_log_file = echo_log_file;
function shellExec(command, _options = {}) {
    var options = setDefaults({
        stdout: data => {
            console.log(data);
        },
        complete: code => {
        },
        hide_output: false
    }, _options);
    command = `${command} 2>&1`;
    return new Promise(resolve => {
        var spawnOptions = {
            stdio: 'inherit',
            shell: true
        };
        if (typeof options['cwd'] != "undefined") {
            spawnOptions['cwd'] = options['cwd'];
        }
        try {
            // @ts-ignore
            const ls = (0, child_process_1.spawn)(command, spawnOptions);
            // ls.stdout.on("data",data=>{
            // 	options.stdout(data);
            // });
            ls.on("exit", code => {
                resolve("");
            });
        }
        catch (e) {
            resolve("");
        }
    });
}
exports.shellExec = shellExec;
function fileDialog(default_path = null, title = null) {
    var i = '';
    if (default_path)
        i += ` --default-path="${default_path}" `;
    if (title)
        i += ` --title="${title}" `;
    return new Promise(resolve => {
        shellExec(`electron %portal%/nodejs/dialog ${i}`, {
            hide_output: true
        }).then(response => {
            resolve(JSON.parse(response)[0]);
        });
        ;
    });
}
exports.fileDialog = fileDialog;
function filesDialog(default_path = null, title = null) {
    var i = ` --multiple-selections="true" `;
    if (default_path)
        i += ` --default-path="${default_path}" `;
    if (title)
        i += ` --title="${title}" `;
    return new Promise(resolve => {
        shellExec(`electron %portal%/nodejs/dialog ${i}`, {
            hide_output: true
        }).then(response => {
            resolve(JSON.parse(response));
        });
        ;
    });
}
exports.filesDialog = filesDialog;
function folderDialog(default_path = null, title = null) {
    var i = ` --dialog-type="directory" `;
    if (default_path)
        i += ` --default-path="${default_path}" `;
    if (title)
        i += ` --title="${title}" `;
    return new Promise(resolve => {
        shellExec(`electron %portal%/nodejs/dialog ${i}`, {
            hide_output: true
        }).then(response => {
            var _path = JSON.parse(response)[0];
            console.log(_path);
            glob(`**`, {
                absolute: true,
                cwd: path.normalize(_path)
            }, function (er, dir_stat) {
                var files = dir_stat.filter(x => fs.lstatSync(x).isFile());
                resolve(files);
            });
        });
        ;
    });
}
exports.folderDialog = folderDialog;
function file_copy_contents(file_path) {
    return shellExec(`type "${path.normalize(file_path)}" | clip`);
}
exports.file_copy_contents = file_copy_contents;
function encoded_url(main_link, queryStringObject = {}) {
    var url = main_link;
    if (Object.keys(queryStringObject).length > 0)
        url += "?";
    for (let key in queryStringObject) {
        var value = queryStringObject[key];
        url += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
    }
    if (Object.keys(queryStringObject).length > 0)
        url = url.replace(/&$/, '');
    return url;
}
exports.encoded_url = encoded_url;
function open_in_browser(url, browser = 'chrome', _options = {}) {
    var options = setDefaults({
        nodeIntegration: false
    }, _options);
    var command = '';
    if (browser === "electron") {
        command = `electron %portal%/nodejs/browser "${url}"`;
        if (options.nodeIntegration)
            command += ` --node-integration="true" `;
    }
    else {
        command = `start ${browser} "${url}"`;
    }
    return shellExec(command);
}
exports.open_in_browser = open_in_browser;
function copy_to_clipboard(content) {
    log.write(content);
    return file_copy_contents(log.file());
}
exports.copy_to_clipboard = copy_to_clipboard;
function unique_school_id() {
    return shellExec(`php php/generate_school_id.php`, {
        hide_output: true
    });
}
exports.unique_school_id = unique_school_id;
function forward_slash(string) {
    return string.replace(/\\/g, "/");
}
exports.forward_slash = forward_slash;
function back_slash(string) {
    return string.replace(/\//g, "\\");
}
exports.back_slash = back_slash;
function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
function escape_sed(command) {
    return escapeRegExp(command).replace(/\//g, "\\/").replace(/\\\\\\/g, '\\');
}
exports.escape_sed = escape_sed;
function brackets_replace(string, properties, brackets = 2) {
    try {
        for (let property in properties) {
            var value = properties[property];
            var b = "{".repeat(brackets);
            var eb = "}".repeat(brackets);
            string = string.replace(new RegExp(escapeRegExp(`${b}${property}${eb}`), 'g'), value);
        }
    }
    catch (e) { }
    return string;
}
exports.brackets_replace = brackets_replace;
function dollar_replace(string, properties) {
    try {
        for (let property in properties) {
            var value = properties[property];
            string = string.replace(new RegExp(escapeRegExp(`$${property}`), 'g'), value);
        }
    }
    catch (e) { }
    return string;
}
exports.dollar_replace = dollar_replace;
function real_array(array, trim = false) {
    var output = [];
    array.forEach(element => {
        if (element.trim().length > 0) {
            output.push(trim ? element.trim() : element);
        }
    });
    return output;
}
exports.real_array = real_array;
function realArray(array, trim = false) {
    var output = [];
    array.forEach(element => {
        if (element.trim().length > 0) {
            output.push(trim ? element.trim() : element);
        }
    });
    return output;
}
exports.realArray = realArray;
function taskkil(process_name) {
    return shellExec(`taskkil /IMF ${process_name}`);
}
exports.taskkil = taskkil;
var colorpicker = exports.colorpicker = async function (output = "last_color") {
    var last_color = "ERROR_NO_COLOR_SUPPLIED";
    var history = [];
    var _resolve;
    await new Promise(resolve => {
        shellExec(`"C:/Program Files/Colorpicker/Colorpicker.exe"`, {
            hide_output: true
        }).then(response => {
            try {
                response.match(/{ lastColor: '(.*)' }/g).forEach(element => {
                    var color = element.match(/lastColor: '(.*)'/)[1];
                    history.push(color);
                });
                last_color = history.slice(-1).pop();
            }
            catch (e) { }
            if (output === "last_color") {
                copy_to_clipboard(last_color).then(_ => {
                    _resolve = last_color;
                    resolve();
                });
            }
            if (output === "history") {
                _resolve = history;
                resolve();
            }
        });
    });
    return _resolve;
};
function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
exports.sleep = sleep;
function modify_resource_icon(resource_name, resource_icon_path, _options) {
    var options = setDefaults({
        cwd: __dirname
    }, _options);
    return shellExec(`ResourceHacker -open "${resource_name}" -save "${resource_name}" -action addoverwrite  -res "${resource_icon_path}" -mask ICONGROUP,1,1033`, { cwd: options.cwd });
}
exports.modify_resource_icon = modify_resource_icon;
/**
 * @param select Decide if file path is focused in directory. Default `true`
 */
var show_in_explorer = exports.show_in_explorer = (file_path, select = true) => {
    file_path = path.normalize(file_path);
    return new Promise(resolve => {
        var command;
        if (select) {
            command = `explorer /select,"${file_path}"`;
        }
        else {
            command = `explorer "${file_path}"`;
        }
        shellExec(command).then(_ => {
            resolve();
        });
    });
};
function dotted_parameter(object, parameter, value) {
    if (typeof parameter == 'string')
        return dotted_parameter(object, parameter.split('.'), value);
    else if (parameter.length == 1 && value !== undefined)
        return object[parameter[0]] = value;
    else if (parameter.length == 0)
        return object;
    else
        return dotted_parameter(object[parameter[0]], parameter.slice(1), value);
}
exports.dotted_parameter = dotted_parameter;
function match(pattern, haystack) {
    var regex = new RegExp(pattern, "g");
    var matches = [];
    var match_result = haystack.match(regex);
    for (let index in match_result) {
        var item = match_result[index];
        matches[index] = item.match(new RegExp(pattern));
    }
    return matches;
}
exports.match = match;
function require_portal_id(supposed_portal_id) {
    var stdout = require("./stdout");
    return new Promise(resolve => {
        if (supposed_portal_id) {
            resolve(supposed_portal_id);
        }
        else {
            stdout.info_prompt("portal_id", "required", "demo").then(p => {
                resolve(p);
            });
        }
    });
}
exports.require_portal_id = require_portal_id;
function portal_api_request(node_id, relative_server_script = "assets/handshake.php", request_options = {}) {
    var unirest = require("unirest");
    var _node = node(node_id);
    request_options = setDefaults({
        fields: {},
        attachments: {}
    }, request_options);
    return new Promise(resolve => {
        unirest.post(_node.node_url + "/" + relative_server_script).headers({
            "Authorization": _node.handshake_auth_key
        }).field(Object.assign({
            "auth_key": _node.handshake_auth_key
        }, request_options.fields)).attach(request_options.attachments).then(async (response) => {
            response['is_successful'] = response.status === 200 && response.body && response.body.trim().length > 0 && response.body.indexOf('Error: ') === -1 && response.body.indexOf('Redirecting') === -1;
            resolve(response);
        });
    });
}
exports.portal_api_request = portal_api_request;
function portal_http_upload(portal_id, relative_local_path, relative_remote_path = null, relative_server_script = "/assets/handshake.php") {
    const portal = process.env.portal;
    return portal_api_request(portal_id, relative_server_script, {
        fields: {
            "filename": "\\" + (relative_remote_path ? relative_remote_path : relative_local_path)
        },
        attachments: {
            "file": path.normalize(portal + "\\" + relative_local_path)
        }
    });
}
exports.portal_http_upload = portal_http_upload;
function file_request_success_message(school, response, row_cursor_position, rows) {
    console.log("");
    console.log(`${chalk.yellowBright(response.body)} ${chalk.whiteBright('*')} ${chalk.yellowBright(`${row_cursor_position}/${rows.length} files synced`)} ${chalk.whiteBright('*')} ${chalk.yellowBright(`${parseFloat(((row_cursor_position / rows.length) * 100).toFixed(2))}%`)}`);
}
exports.file_request_success_message = file_request_success_message;
function file_request_error_message(school, response) {
    console.log("");
    console.log(`${school.school_name} * ${school.portal_id} * ${chalk.redBright(response.raw_body)} * ${chalk.redBright(response.statusMessage)}`);
    console.log("");
}
exports.file_request_error_message = file_request_error_message;
let variables = {};
class minify {
    static js(code) {
        // import * as { minify } from "javascript-minifier";
        // return new Promise(resolve=>{
        // 	minify(code).then(minified_code=>{
        // 		resolve(minified_code);
        // 	}).catch(error=>{
        // 		resolve(null);
        // 	});
        // })
        return false;
    }
}
exports.minify = minify;
function git_full_address(username, password) {
    return `https://${username}:${encodeURIComponent(password)}@github.com/${username}/`;
}
exports.git_full_address = git_full_address;
function random_float(min, max, precision = 2) {
    return (Math.random() * (max - min) + min).toFixed(precision);
}
exports.random_float = random_float;
function config(_document_root = null) {
    if (!_document_root)
        _document_root = document_root();
    return JSON.parse(fs.readFileSync(path.join(_document_root, ".webman", "config.json")).toString());
}
exports.config = config;
function writeConfig(_config, _document_root = null) {
    if (!_document_root)
        _document_root = document_root();
    let _path = path.join(_document_root, ".webman", "config.json");
    return writeFileSync(_path, JSON.stringify(_config, null, 4));
}
exports.writeConfig = writeConfig;
function writeFileSync(_path, content) {
    if (!fs.existsSync(path.dirname(_path)))
        fs.mkdirSync(path.dirname(_path), { recursive: true });
    fs.writeFileSync(_path, content);
}
exports.writeFileSync = writeFileSync;
function hash(string) {
    var crypto = require('crypto');
    return crypto.createHash('sha256').update(string).digest('hex');
}
exports.hash = hash;
function ftp_connection(ftp_config) {
    var Client = require('ftp');
    return new Promise(resolve => {
        var c = new Client();
        c.connect(ftp_config);
        c.on('ready', function () {
            resolve(c);
        });
    });
}
exports.ftp_connection = ftp_connection;
function upload_files(local_remote_array, ftp_connection, message = null) {
    return new Promise(async (resolve) => {
        for (let local_remote of local_remote_array) {
            var local_path = local_remote["local"];
            var remote_path = local_remote["remote"];
            console.log();
            if (message) {
                message(local_path, remote_path);
            }
            else {
                console.log(`${chalk.magentaBright('put file:')} ${chalk.greenBright(forward_slash(local_path))} ${chalk.redBright(`->`)} ${chalk.cyanBright(forward_slash(remote_path))}`);
            }
            await new Promise(resolve => {
                ftp_connection.mkdir(path.dirname(remote_path), true, (err) => {
                    resolve();
                });
            });
            await ftp_put(local_path, remote_path, ftp_connection);
            resolve();
        }
    });
}
exports.upload_files = upload_files;
function upload_file(local_path, remote_path, ftp_connection, message) {
    return upload_files([
        {
            local: local_path,
            remote: remote_path
        }
    ], ftp_connection, message);
}
exports.upload_file = upload_file;
function ftp_config(node_id) {
    let _node = node(node_id);
    let _ftp_config = _node.ftp;
    _ftp_config["host"] = _node.host;
    _ftp_config["rel_dirname"] = _node.rel_dirname;
    return _ftp_config;
}
exports.ftp_config = ftp_config;
function node_ftp_connection(node_id) {
    return ftp_connection(ftp_config(node_id));
}
exports.node_ftp_connection = node_ftp_connection;
function upload_project_files(file_relative_paths, node_id, ftp_connection, message) {
    var local_remote_array = [];
    var _node = node(node_id);
    for (let rel_path of file_relative_paths) {
        local_remote_array.push({
            local: path.join(_node.rel_dirname, rel_path),
            remote: `/public_html${_node.rel_dirname}/${rel_path}`
        });
    }
    return upload_files(local_remote_array, ftp_connection, message);
}
exports.upload_project_files = upload_project_files;
function upload_project_file(file_relative_path, node_id, ftp_connection, message) {
    return upload_project_files([file_relative_path], node_id, ftp_connection, message);
}
exports.upload_project_file = upload_project_file;
function ftp_put(local_file_path, remote_file_path, ftp_client_connection) {
    return new Promise(resolve => {
        ftp_client_connection.put(local_file_path, remote_file_path, function (err) {
            resolve(err ? err : true);
        });
    });
}
exports.ftp_put = ftp_put;
function ftp_mkdir(remote_path, ftp_connection) {
    return new Promise(resolve => {
        var chalk = require("chalk");
        println();
        console.log(chalk.magentaBright(`ftp > mkdir -> ${remote_path}`));
        ftp_connection.mkdir(remote_path, true, (err) => {
            resolve();
        });
    });
}
exports.ftp_mkdir = ftp_mkdir;
function project_ftp_mkdir(relative_path, node_id, ftp_connection) {
    return ftp_mkdir(`${remoteDir(node_id)}/${relative_path}`, ftp_connection);
}
exports.project_ftp_mkdir = project_ftp_mkdir;
function hftp_request(node_id, request_options = {}) {
    var unirest = require("unirest");
    const _node = node(node_id);
    request_options = setDefaults({
        fields: {},
        attachments: {}
    }, request_options);
    return new Promise(resolve => {
        unirest.post(_node.node_url.concat("/assets/handshake.php")).headers({
            "Authorization": _node.handshake_auth_key
        }).field(Object.assign({
            "auth_key": _node.handshake_auth_key
        }, request_options.fields)).attach(request_options.attachments).then(async (response) => {
            response['is_successful'] = response.status === 200 && response.body && response.body.trim().length > 0 && response.body.indexOf('Error: ') === -1 && response.body.indexOf('Redirecting') === -1;
            resolve(response);
        });
    });
}
exports.hftp_request = hftp_request;
function base64_encode(non_base64_string) {
    return Buffer.from(non_base64_string).toString('base64');
}
exports.base64_encode = base64_encode;
function base64_decode(base64_string) {
    return Buffer.from(base64_string, 'base64').toString('ascii');
}
exports.base64_decode = base64_decode;
function spawn_process(command, options = null) {
    return new Promise(resolve => {
        const proc = (0, child_process_1.spawn)(command, options);
        var output;
        proc.stdout.on("data", data => {
            output = data;
        });
        proc.on("close", _ => {
            resolve(output ? output.toString() : "null");
        });
    });
}
exports.spawn_process = spawn_process;
function node_ids() {
    return Object.keys(config()["nodes"]);
}
exports.node_ids = node_ids;
function node(node_id) {
    if (!node_id)
        node_id = node_ids()[0];
    return config()["nodes"][node_id];
}
exports.node = node;
function root(root_ip_address) {
    return config()["roots"][root_ip_address];
}
exports.root = root;
function node_root(node_id = null) {
    return root(node(node_id).host);
}
exports.node_root = node_root;
function active_node_ids() {
    let accumulator = [];
    for (let node_id of node_ids()) {
        if (node(node_id).active)
            accumulator.push(node_id);
    }
    return accumulator;
}
exports.active_node_ids = active_node_ids;
function active_root_ips() {
    let accumulator = [];
    for (let node_id of active_node_ids()) {
        let _node = node(node_id);
        if (_node.active && !accumulator.includes(_node.host))
            accumulator.push(_node.host);
    }
    return accumulator;
}
exports.active_root_ips = active_root_ips;
function hstart(command) {
    return `hstart /NOCONSOLE "${command}"`;
}
exports.hstart = hstart;
function relative_to_document_root(absolute_path) {
    return path.relative(document_root(), absolute_path);
}
exports.relative_to_document_root = relative_to_document_root;
var trace_save = exports.trace_save = async function (relative_path, is_source_file, is_specs_file, is_test_mode, node_id = null) {
    let conn = sqlite.connection();
    let _project_root = project_root();
    let _config = config();
    let _active_node_ids;
    if (node_id) {
        _active_node_ids = [node_id];
    }
    else {
        _active_node_ids = active_node_ids();
    }
    let filename = relative_path;
    return new Promise(async (resolve) => {
        if (filename === "settings.json") {
            println();
            console.log("settings.json ignored");
            println();
        }
        else {
            for (let node_id of _active_node_ids) {
                if (filename === "update.php") {
                    let rows = [];
                    await sqlite.fetch("SELECT node_id FROM 'update' WHERE node_id=?", [node_id], conn).then(_rows => {
                        rows = _rows;
                    });
                    if (rows.length === 0) {
                        await sqlite.execute("INSERT INTO 'update' (node_id, synced) VALUES (?, ?)", [node_id, "false"], conn);
                        //println(`New entry for '${filename} - ${node_id}' saved`);
                    }
                    else {
                        await sqlite.execute("UPDATE 'update' SET synced = ? WHERE node_id=?", ["false", node_id], conn);
                        //println(`Initial entry for '${filename} - ${node_id}' saved`);
                    }
                }
                else {
                    let rows = [];
                    await sqlite.fetch("SELECT node_id,filename FROM files WHERE node_id=? AND filename=?", [node_id, filename], conn).then(_rows => {
                        rows = _rows;
                    });
                    if (rows.length === 0) {
                        await sqlite.execute("INSERT INTO files (node_id, filename, is_source_file, is_specs_file, synced) VALUES (?, ?, ?, ?, ?)", [node_id, filename, is_source_file ? "true" : "false", is_specs_file ? "true" : "false", "false"], conn);
                        //println(`New entry for '${filename} - ${node_id}' saved`);
                    }
                    else {
                        await sqlite.execute("UPDATE files SET synced = ? WHERE node_id=? AND filename=?", ["false", node_id, filename], conn);
                        //println(`Initial entry for '${filename} - ${node_id}' saved`);
                    }
                }
            }
            if (_config.test.active) {
                let test_rows = [];
                let node_id = _config.test.node_id;
                await sqlite.fetch("SELECT node_id,filename FROM test_files WHERE node_id=? AND filename=?", [node_id, filename], conn).then(_rows => {
                    test_rows = _rows;
                });
                if (test_rows.length === 0) {
                    await sqlite.execute("INSERT INTO test_files (node_id, filename, is_source_file, is_specs_file, synced) VALUES (?, ?, ?, ?, ?)", [node_id, filename, is_source_file ? "true" : "false", is_specs_file ? "true" : "false", "false"], conn);
                    //println(`New entry for '${filename} - ${node_id}' saved`);
                }
                else {
                    await sqlite.execute("UPDATE test_files SET synced = ? WHERE node_id=? AND filename=?", ["false", node_id, filename], conn);
                    //println(`Initial entry for '${filename} - ${node_id}' saved`);
                }
            }
            println("Saved");
            conn.close();
        }
        resolve();
    });
};
function println(message = '') {
    console.log(message);
}
exports.println = println;
function public_ip() {
    const publicIp = require('public-ip');
    return publicIp.v4();
}
exports.public_ip = public_ip;
function rigid_public_ip() {
    var _public_ip;
    return new Promise(async (resolve) => {
        await public_ip().then(ip => {
            _public_ip = ip;
        });
        var p = _public_ip.split(".");
        resolve(`${p[0]}.${p[1]}.%.%`);
    });
}
exports.rigid_public_ip = rigid_public_ip;
function round(number, precision = 2) {
    return Math.round((number + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision);
}
exports.round = round;
function random_characters(length = 7) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.random_characters = random_characters;
function random_digits(length = 7) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.random_digits = random_digits;
function unique_from_fs(directory_path, length, context) {
    let content;
    while (true) {
        if (context === "digits") {
            content = random_digits(length);
        }
        else {
            content = random_characters(length);
        }
        if (!fs.existsSync(path.join(directory_path, content))) {
            break;
        }
    }
    return content;
}
exports.unique_from_fs = unique_from_fs;
function unique_digits_from_fs(directory_path, length) {
    return unique_from_fs(directory_path, length, "digits");
}
exports.unique_digits_from_fs = unique_digits_from_fs;
function unique_characters_from_fs(directory_path, length = 7) {
    return unique_from_fs(directory_path, length, "characters");
}
exports.unique_characters_from_fs = unique_characters_from_fs;
function new_tmp_file(file_extension = "", length = 7) {
    let _document_root = document_root();
    if (file_extension.length > 0)
        file_extension = ".".concat(file_extension);
    let _tmp_directory = tmp_directory();
    let file_name = unique_characters_from_fs(_tmp_directory, length).concat(file_extension);
    let file_path = path.join(_tmp_directory, file_name);
    return file_path;
}
exports.new_tmp_file = new_tmp_file;
function template_path(template_relative_path) {
    let _project_root = project_root();
    let _document_root = document_root();
    let document_file_path = `${_document_root}/.webman/templates/${template_relative_path}`;
    let project_file_path = `${_project_root}/templates/${template_relative_path}`;
    let file_path = document_file_path;
    if (!fs.existsSync(file_path))
        file_path = project_file_path;
    return file_path;
}
exports.template_path = template_path;
function template_content(template_relative_path) {
    return fs.readFileSync(template_path(template_relative_path)).toString();
}
exports.template_content = template_content;
function copyTemplateFile(template_relative_file_path, document_relative_file_path) {
    return new Promise(async function () {
        let _document_root = document_root();
        let _path = path.join(_document_root, document_relative_file_path);
        fs.copyFileSync(template_path(template_relative_file_path), _path);
        await shellExec(`webman save "${_path}"`);
    });
}
exports.copyTemplateFile = copyTemplateFile;
function copyProjectTemplateFile(template_relative_file_path) {
    return copyTemplateFile(template_relative_file_path, template_relative_file_path);
}
exports.copyProjectTemplateFile = copyProjectTemplateFile;
function copyTemplateDirectory(template_relative_directory, document_relative_directory) {
    let _document_root = document_root();
    return copyFiles(template_path(template_relative_directory), path.join(_document_root, document_relative_directory));
}
exports.copyTemplateDirectory = copyTemplateDirectory;
function copyProjectTemplateDirectory(template_relative_directory) {
    return copyTemplateDirectory(template_relative_directory, template_relative_directory);
}
exports.copyProjectTemplateDirectory = copyProjectTemplateDirectory;
/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source_flle_path, output_file_path) {
    var AdmZip = require('adm-zip');
    return new Promise((resolve, reject) => {
        var zip = new AdmZip();
        zip.addLocalFolder(source_flle_path);
        zip.writeZip(output_file_path);
        resolve();
    });
}
exports.zipDirectory = zipDirectory;
function arg_node_ids(argv) {
    let _node_ids;
    if (argv["n"]) {
        _node_ids = [argv["n"]];
    }
    else if (argv["node-id"]) {
        _node_ids = [argv["node-id"]];
    }
    else if (argv["node-ids"]) {
        _node_ids = real_array(argv["node-ids"].split(","), true);
    }
    else {
        _node_ids = active_node_ids();
    }
    return _node_ids;
}
exports.arg_node_ids = arg_node_ids;
function bin2hex(b) {
    return b.match(/.{4}/g).reduce(function (acc, i) {
        return acc + parseInt(i, 2).toString(16);
    }, '');
}
exports.bin2hex = bin2hex;
function hex2bin(h) {
    return h.split('').reduce(function (acc, i) {
        return acc + ('000' + parseInt(i, 16).toString(2)).substr(-4, 4);
    }, '');
}
exports.hex2bin = hex2bin;
function escapeShell(cmd) {
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
}
exports.escapeShell = escapeShell;
;
function argsCommandAppend(lastArgIndex = 1) {
    let commandAppend = "";
    for (let index in process.argv) {
        let arg = process.argv[index];
        if (parseInt(index) > lastArgIndex) {
            commandAppend += " " + arg;
        }
    }
    return commandAppend;
}
exports.argsCommandAppend = argsCommandAppend;
var runProjectSpecificScript = exports.runProjectSpecificScript = async function (script_name = null) {
    if (!script_name)
        script_name = path.basename(process.argv[1]).concat(".js");
    let scripts_dir = path.join(project_root(), "scripts");
    let filename = unique_characters_from_fs(scripts_dir, 11) + ".js";
    let script_content = fs.readFileSync(path.join(document_root(), ".webman", "scripts", script_name)).toString();
    fs.writeFileSync(path.join(scripts_dir, filename), script_content);
    // eventEmitter.on("SIGINT",function(){
    // 	fs.unlinkSync(path.join(scripts_dir,filename));
    // });
    await shellExec(`webman ${filename} ${argsCommandAppend()}`);
    fs.unlinkSync(path.join(scripts_dir, filename));
};
function setTerminalTitle(title) {
    process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
}
exports.setTerminalTitle = setTerminalTitle;
function readlineInterface(historyName) {
    let _document_root = document_root();
    let historyPath = path.join(_document_root, ".webman", "terminal-histories", historyName + ".json");
    if (!fs.existsSync(path.dirname(historyPath)))
        fsExtra.mkdirpSync(path.dirname(historyPath));
    let history = [];
    if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath).toString());
    }
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on("SIGINT", function () {
        rl.write("Ctrl-C -- exit!");
        println();
        println();
        rl.close();
    });
    // @ts-ignore
    rl.history = history;
    return rl;
}
exports.readlineInterface = readlineInterface;
function saveReadlineInterfaceHistory(historyName, history) {
    let _document_root = document_root();
    let historyPath = path.join(_document_root, ".webman", "terminal-histories", historyName + ".json");
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 4));
}
exports.saveReadlineInterfaceHistory = saveReadlineInterfaceHistory;
function project_specific_scripts_path() {
    return path.join(document_root(), ".webman", "scripts");
}
exports.project_specific_scripts_path = project_specific_scripts_path;
var compileApp = exports.compileApp = async function (appLocation, bundlePath = null, appType = "web") {
    let _document_root = document_root();
    let sPath = appLocation;
    let sPathName = path.basename(sPath);
    let file_ordinance = path.join(_document_root, "src", sPath, sPathName);
    let output_file_path = path.join(_document_root, `${sPath}.php`);
    var output_file_dir = path.dirname(output_file_path);
    let appIsReact = fs.existsSync(`${file_ordinance}.jsx`);
    switch (appType) {
        case "web":
            if (!fs.existsSync(output_file_dir))
                fs.mkdirSync(output_file_dir, { recursive: true });
            var sourceContent = fs.readFileSync(`${file_ordinance}.php`).toString();
            if (!appIsReact) {
                var transpiled_sass;
                await (0, transpilers_1.transpile_sass)(`${file_ordinance}.scss`).then(_transpiled => {
                    transpiled_sass = _transpiled;
                });
                if (transpiled_sass) {
                    sourceContent = sourceContent.replace("<style></style>", `<style>\n\t${transpiled_sass}\n</style>`);
                }
            }
            sourceContent = sourceContent.replace('<!--HTML-->', fs.readFileSync(`${file_ordinance}.html`).toString());
            var transpiled_typescript;
            if (appIsReact) {
                if (bundlePath) {
                    transpiled_typescript = fs.readFileSync(bundlePath).toString();
                }
                else {
                    transpiled_typescript = await (0, transpilers_1.transpile_react)(`${file_ordinance}.jsx`);
                }
            }
            else {
                transpiled_typescript = await (0, transpilers_1.transpile_typescript)(`${file_ordinance}.ts`);
            }
            if (transpiled_typescript) {
                //sourceContent = sourceContent.replace('<script></script>',``);
                let lineManager = new LineManager_1.default(sourceContent);
                let lineNumber = lineManager.search("<script></script>");
                if (lineManager) {
                    lineManager.edit(`\n\n<script>${transpiled_typescript}</script>\n\n`, lineNumber);
                    sourceContent = lineManager.content();
                }
            }
            break;
        case "mobile":
            break;
    }
    fs.writeFileSync(output_file_path, sourceContent);
};
function download(fileUrl, localPath, options) {
    var http;
    if (fileUrl.indexOf("https://") != -1) {
        http = require('https');
    }
    else {
        http = require('http');
    }
    const file = fs.createWriteStream(localPath);
    return new Promise(function (resolve) {
        http.get(fileUrl, function (response) {
            response.pipe(file);
            file.on("finish", function () {
                resolve(file);
            });
        });
    });
}
exports.download = download;
function n(module) {
    return path.join(project_root(), "node_modules", module);
}
exports.n = n;
function webpackOptions({ filePath, output, mode }) {
    let _document_root = document_root();
    let _options = {
        entry: filePath,
        "cache": true,
        output: {
            filename: output.filename,
            path: output.path,
            pathinfo: false
        },
        "mode": mode,
        "watch": mode === "development",
        "module": {
            rules: [
                {
                    //test: /\.m?js$/,
                    include: [path.join(_document_root, "src"), path.join(_document_root, "reactjs")],
                    use: {
                        loader: n('babel-loader'),
                        options: {
                            presets: [n('@babel/preset-env'), n('@babel/preset-react'), n("@babel/preset-typescript")]
                        },
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        }
    };
    return _options;
}
exports.webpackOptions = webpackOptions;
var currentGitToken = exports.currentGitToken = async function () {
    return {
        portalBeta: process.env.ICITIFY_GIT_TOKEN
    };
};
function percentageChunk(chunk) {
    return round(parseFloat(chunk.toString().replace("%", "")), 2);
}
exports.percentageChunk = percentageChunk;
let project_functions_path = path.join(project_specific_scripts_path(), "functions.js");
if (fs.existsSync(project_functions_path))
    exports._ = require(project_functions_path);
