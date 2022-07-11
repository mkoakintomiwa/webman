"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpile_sass = exports.transpile_typescript = exports.transpile_react = void 0;
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const fx = require("./functions");
const chalk = require("chalk");
const swc = require("@swc/core");
const terser = require("terser");
const webpack = require("webpack");
const ora = require("ora");
function n(module) {
    return path.join(fx.project_root(), "node_modules", module);
}
function transpile_react(file_path, output_path = null, minify = true) {
    let bundleFilename = fx.unique_characters_from_fs(fx.tmp_directory()) + '.js';
    let _tmp_directory = fx.tmp_directory();
    let bundlePath = path.join(_tmp_directory, bundleFilename);
    let _document_root = fx.documentRoot();
    return new Promise(async (resolve) => {
        var _transpiled = "";
        //fx.println();
        const spinner = ora(`${chalk.magentaBright('Building bundle: ')} ${chalk.cyanBright(file_path)}`).start();
        try {
            await new Promise(resolve => {
                webpack(fx.webpackOptions({
                    filePath: file_path,
                    output: {
                        filename: bundleFilename,
                        path: _tmp_directory,
                    },
                    mode: "production"
                }), (err, stats) => {
                    spinner.stop();
                    resolve();
                    (stats || "").toString({
                        chunks: false,
                        colors: true // Shows colors in the console
                    });
                    if (err) {
                        console.error(err);
                    }
                    // console.log((stats||"").toString({
                    //     chunks: false,  // Makes the build much quieter
                    //     colors: true    // Shows colors in the console
                    // }));
                });
            });
            _transpiled = fs.readFileSync(bundlePath).toString().replace(/\/\*! For license information please see .*\.LICENSE\.txt \*\/\n/, "");
            fs.unlinkSync(path.join(_tmp_directory, bundleFilename));
            fs.unlinkSync(path.join(_tmp_directory, bundleFilename + ".LICENSE.txt"));
        }
        catch (e) {
            console.log(chalk.redBright(e));
        }
        resolve(_transpiled);
    });
}
exports.transpile_react = transpile_react;
function transpile_typescript(file_path, output_path = null, minify = true) {
    return new Promise(async (resolve) => {
        var _return = null;
        try {
            var transpiled = swc.transformFileSync(file_path, {
                "jsc": {
                    "parser": {
                        "syntax": "typescript",
                        "decorators": true
                    },
                    "transform": {
                        "legacyDecorator": true,
                        "decoratorMetadata": true
                    },
                    "target": "es2018"
                }
            }).code;
            transpiled = (await terser.minify(transpiled)).code;
            if (output_path) {
                var output_dirname = path.dirname(output_path);
                if (!fs.existsSync(output_dirname))
                    fs.mkdirSync(output_dirname, { recursive: true });
                fs.writeFileSync(output_path, transpiled);
            }
            // if (minify){
            // }
            _return = transpiled;
        }
        catch (e) {
            console.log(chalk.redBright(e));
        }
        resolve(_return);
    });
}
exports.transpile_typescript = transpile_typescript;
function transpile_sass(file_path, output_path = null) {
    return new Promise(resolve => {
        var _return = null;
        try {
            var css = sass.renderSync({
                file: file_path,
                outputStyle: 'compressed'
            }).css.toString();
            if (output_path) {
                var output_dirname = path.dirname(output_path);
                if (!fs.existsSync(output_dirname))
                    fs.mkdirSync(output_dirname, { recursive: true });
                fs.writeFileSync(output_path, css);
            }
            _return = css;
        }
        catch (e) {
            console.log(chalk.redBright(e));
        }
        resolve(_return);
    });
}
exports.transpile_sass = transpile_sass;
