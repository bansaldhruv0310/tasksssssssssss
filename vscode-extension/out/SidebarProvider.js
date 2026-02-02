"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = require("vscode");
const fetch = require('node-fetch');
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
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
                    if (!data.value)
                        return;
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
                        }
                        catch (error) {
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
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
                <style>
                    body { padding: 10px; font-family: var(--vscode-font-family); }
                    .chat-container { display: flex; flex-direction: column; gap: 10px; height: 100vh; }
                    .messages { flex: 1; overflow-y: auto; border: 1px solid var(--vscode-input-border); padding: 5px; border-radius: 4px; }
                    .input-group { display: flex; gap: 5px; padding-bottom: 20px;}
                    input { flex: 1; padding: 5px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
                    button { padding: 5px 10px; cursor: pointer; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .msg { margin-bottom: 5px; padding: 5px; border-radius: 3px; }
                    .msg.user { background: var(--vscode-editor-selectionBackground); align-self: flex-end; }
                    .msg.bot { background: var(--vscode-textBlockQuote-background); }
                </style>
			</head>
			<body>
                <div class="chat-container">
                    <h3>🤖 AI Safety Chat</h3>
                    <div class="messages" id="messages">
                        <div class="msg bot">Hello! I'm your Git Safety Assistant. Ask me anything about branching or tasks.</div>
                    </div>
                    <div class="input-group">
                        <input type="text" id="prompt" placeholder="Ask a question..." />
                        <button id="sendBtn">Send</button>
                    </div>
                </div>
                <script src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map