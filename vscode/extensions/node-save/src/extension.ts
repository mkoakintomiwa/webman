// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { spawn } from "child_process"

import * as path from "path"

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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

		// Display a message box to the user
		vscode.window.showInformationMessage('I will save this file');
		const editor = vscode.window.activeTextEditor;
		var filename: any = editor?.document.fileName;
		let command = spawn("webamn",["public-ip"],{
			cwd: path.dirname(filename)
		});

		command.stdout?.on("data",function(data){
			console.log(data.toString());
		});


		command.stderr?.on("data",function(data){
			console.log(data.toString());
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
