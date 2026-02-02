const vscode = acquireVsCodeApi();

const sendBtn = document.getElementById('sendBtn');
const promptInput = document.getElementById('prompt');
const messagesDiv = document.getElementById('messages');

sendBtn.addEventListener('click', () => {
    sendMessage();
});

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const text = promptInput.value;
    if (!text) return;

    // Add user message to UI
    appendMessage(text, 'user');
    promptInput.value = '';

    // Send to Extension Host
    vscode.postMessage({ type: 'askAI', value: text });
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerText = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle messages from Extension Host
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'addResponse':
            appendMessage(message.value, 'bot');
            break;
    }
});
