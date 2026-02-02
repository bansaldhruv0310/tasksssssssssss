"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const SidebarProvider_1 = require("./SidebarProvider");
function activate(context) {
    console.log('Congratulations, your extension "safety-platform-extension" is now active!');
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("safety-platform-sidebar", // Must match package.json view ID
    sidebarProvider));
    let disposable = vscode.commands.registerCommand('safety-platform.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Safety Platform!');
    });
    let validateCommand = vscode.commands.registerCommand('safety-platform.validateBranch', () => {
        // Placeholder for Git Safety Logic
        vscode.window.showInformationMessage('Checking branch safety...');
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(validateCommand);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map