import * as fs from "fs"
import * as fx from "./lib/functions"
import * as path from "path"
import * as sqlite from "./lib/sqlite"
import { spawn } from "child_process"

const argv = require("yargs").argv;
const chalk = require("chalk");

let project_root = fx.project_root();
let document_root = fx.documentRoot();

const context = argv._[0];
const first_intent = argv._[1];
const second_intent = argv._[2];


(async _=>{
    var conn = sqlite.connection();
    switch(context){
        case "clear":
            conn.prepare(`DELETE FROM files`).run().finalize();
            console.log(`files cleared`);
        break;

        case "prepare":
            await sqlite.execute(`
                CREATE TABLE IF NOT EXISTS "files" (
                    "id" INTEGER,
                    "node_id" TEXT,
                    "filename" TEXT,
                    "is_source_file" TEXT,
                    "is_specs_file" TEXT,
                    "synced" TEXT,
                    PRIMARY KEY("id" AUTOINCREMENT)
                );
            `,[],conn);

            await sqlite.execute(`
                CREATE TABLE IF NOT EXISTS "test_files" (
                    "id" INTEGER,
                    "node_id" TEXT,
                    "filename" TEXT,
                    "is_source_file" TEXT,
                    "is_specs_file" TEXT,
                    "synced" TEXT,
                    PRIMARY KEY("id" AUTOINCREMENT)
                );
            `,[],conn);

            await sqlite.execute(`
                CREATE TABLE IF NOT EXISTS "update" (
                    "id" INTEGER,
                    "node_id" TEXT,
                    "synced" TEXT,
                    PRIMARY KEY("id" AUTOINCREMENT)
                );
            `,[],conn);
        break;

        case "open":
            const project_root = fx.project_root();
            const sqlbrowser = path.join(project_root,"DB Browser for SQLite","DB Browser for SQLite.exe");
            fx.shellExec(fx.hstart(`"${sqlbrowser}" "${path.join(document_root,".webman","webman.db")}"`));
        break;
    }
    conn.close();
})();
