"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch_one = exports.fetch = exports.execute = exports.connection = void 0;
const fx = require("./functions");
const sqlite3 = require("sqlite3");
function connection() {
    var document_root = fx.documentRoot();
    return new sqlite3.Database(`${document_root}/.webman/webman.db`);
}
exports.connection = connection;
function execute(query, parameters = [], sqlite_connection) {
    return new Promise(resolve => {
        sqlite_connection.prepare(query, parameters, function () {
            resolve();
        }).run().finalize();
    });
}
exports.execute = execute;
async function fetch(query, parameters = [], sqlite_connection) {
    let _rows;
    await new Promise(function (resolve) {
        sqlite_connection.all(query, parameters, (err, rows) => {
            _rows = rows;
            resolve();
        });
    });
    return _rows;
}
exports.fetch = fetch;
async function fetch_one(query, parameters = [], sqlite_connection) {
    let rows = await fetch(query, parameters, sqlite_connection);
    if (rows.length > 0) {
        return rows[0];
    }
    else {
        return false;
    }
}
exports.fetch_one = fetch_one;
