import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "safety-platform-extension" is now active!');

    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "safety-platform.chatView", // Must match package.json view ID
            sidebarProvider
        )
    );

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

export function deactivate() { }
