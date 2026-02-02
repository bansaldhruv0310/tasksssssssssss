import * as vscode from "vscode";
const fetch = require('node-fetch');

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
                case "askAI": {
                    if (!data.value) return;

                    // Show thinking state
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Asking Safety Bot...",
                        cancellable: false
                    }, async () => {
                        try {
                            // Call the local backend
                            const response = await fetch('http://localhost:3001/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: data.value })
                            });

                            const result = await response.json();
                            const reply = result.reply || "Thinking..."; // Adjust based on actual API response structure

                            // Send response back to Webview
                            this._view?.webview.postMessage({
                                type: "addResponse",
                                value: reply
                            });

                        } catch (error) {
                            this._view?.webview.postMessage({
                                type: "addResponse",
                                value: "⚠️ Error connecting to Validation Server. Is it running on port 3001?"
                            });
                        }
                    });
                    break;
                }
            }
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
                    body { font-family: sans-serif; padding: 20px; color: white; }
                    h1 { color: #4caf50; }
                </style>
			</head>
			<body>
				<h1>✅ IT WORKS!</h1>
				<p>The extension is loading correctly.</p>
				<p>This is a simplified test to prove the sidebar is active.</p>
			</body>
			</html>`;
    }
}
