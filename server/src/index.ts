import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('AI-Powered Developer Productivity Platform API');
});

import { handleChat } from './services/chat';
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const reply = await handleChat(message);
        res.json({ reply });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

import { getGitHubSignals } from './services/github';
import { getJiraSignals } from './services/jira';

app.get('/priorities', async (req, res) => {
    try {
        const [github, jira] = await Promise.all([
            getGitHubSignals(),
            getJiraSignals()
        ]);

        const priorities = [...github, ...jira].map((p, index) => ({
            id: index,
            ...p
        })).sort((a, b) => b.score - a.score);

        res.json(priorities);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
