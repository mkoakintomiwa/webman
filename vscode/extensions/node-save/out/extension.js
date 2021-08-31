"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "node-save" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('node-save.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from node-save!');
    });
    vscode.commands.registerCommand('node-save.saveFile', () => {
        // The code you place here will be executed every time your command is executed
        var _a, _b;
        // Display a message box to the user
        vscode.window.showInformationMessage('I will save this file');
        const editor = vscode.window.activeTextEditor;
        var filename = editor === null || editor === void 0 ? void 0 : editor.document.fileName;
        let command = child_process_1.spawn("webamn", ["public-ip"], {
            cwd: path.dirname(filename)
        });
        (_a = command.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
            console.log(data.toString());
        });
        (_b = command.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
            console.log(data.toString());
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map