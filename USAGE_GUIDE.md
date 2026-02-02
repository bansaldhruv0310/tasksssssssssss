# How to Use "Safety Platform" for Personal Use

This guide explains how to install and use the Safety Platform on your local machine.

## 1. Prerequisites
- **VS Code**: Installed on your machine.
- **Node.js**: Installed (v18 or higher recommended).
- **Git**: Installed.

## 2. Installation

### Part A: The VS Code Extension
To use the extension in your regular VS Code (not just debug mode), you need to package and install it.

1. **Package the Extension**:
   Open a terminal in the project root:
   ```powershell
   cd vscode-extension
   npx vsce package
   ```
   *   You might be asked to provide a Personal Access Token (PAT) if publishing, but for packaging locally, answer **Yes** to continue if warned about missing repository fields.
   *   This will create a file named something like `safety-platform-extension-0.0.1.vsix` in the folder.

2. **Install the Extension**:
   - Open VS Code.
   - Go to the **Extensions** view (Ctrl+Shift+X).
   - Click the **...** (Views and More Actions) menu at the top right of the sidebar.
   - Select **Install from VSIX...**.
   - Navigate to `vscode-extension/safety-platform-extension-0.0.1.vsix` and select it.
   - The "AI Safety" icon should appear in your sidebar!

### Part B: The Backend Server
The extension relies on the backend server to "think". You must have this running for the chat to work.

1. **Start the Server**:
   Open a terminal (you can leave this running in the background):
   ```powershell
   cd server
   npm run dev
   ```
   *   You should see: `Server is running on port 3001`.

## 3. Daily Usage API
Once installed:

1. **Start the Server**: You only need to run `npm run dev` in the `server` folder.
2. **Open VS Code**: The extension is now permanently installed!
3. **Chat**: Click the Robot icon in the sidebar to chat with your AI Safety Assistant.

## Troubleshooting
- **"Error connecting to Validation Server"**: Ensure the server is running on port 3001.
- **Updates**: If you change the extension code, you must re-package and install the VSIX file again.
