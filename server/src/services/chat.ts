import { OpenAI } from 'openai';
import { getRecentCommits } from './github';
import { getAllJiraIssues, getJiraSignals } from './jira';
import { getGitHubSignals } from './github';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const BRANCHING_RULES = `
- Main Branch: Production only. No direct commits.
- UAT Branch: Staging. Merged from Release branches.
- Dev Branch: Integration. Merged from Feature branches.
- Feature Branches: feature/*
- Release Branches: release/*
- Hotfix Branches: hotfix/*
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handleChat = async (userMessage: string): Promise<string> => {
    try {
        console.log(`Chat request received: "${userMessage}"`);

        const [contextResults] = await Promise.all([
            Promise.allSettled([
                getGitHubSignals().then(res => ({ type: 'Prs', data: res })),
                getRecentCommits().then(res => ({ type: 'Commits', data: res })),
                getJiraSignals().then(res => ({ type: 'MyTickets', data: res })),
                getAllJiraIssues().then(res => ({ type: 'AllTickets', data: res }))
            ]),
            delay(1000)
        ]);

        const myPrs = contextResults[0].status === 'fulfilled' ? (contextResults[0].value as any).data : [];
        const recentCommits = contextResults[1].status === 'fulfilled' ? (contextResults[1].value as any).data : [];
        const myJiraTickets = contextResults[2].status === 'fulfilled' ? (contextResults[2].value as any).data : [];
        const allJiraTickets = contextResults[3].status === 'fulfilled' ? (contextResults[3].value as any).data : [];

        const contextSummary = `
        Time: ${new Date().toISOString()}

        [GIT CONTEXT]
        My Recent PRs: ${JSON.stringify(myPrs.map((p: any) => ({ title: p.title, url: p.url, status: 'Open' })))}
        My Recent Commits: ${JSON.stringify(recentCommits.slice(0, 5))}

        [JIRA CONTEXT]
        My Assigned Tickets: ${JSON.stringify(myJiraTickets.map((t: any) => ({ key: t.title, priority: t.metadata?.priority })))}
        All High Priority Tickets: ${JSON.stringify(allJiraTickets.filter((t: any) => t.priority === 'High' || t.priority === 'Highest').map((t: any) => ({ key: t.key, summary: t.summary, assignee: t.assignee })))}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert Engineering Manager Bot for the Safety Platform.
                    
                    Knowledge Base:
                    ${BRANCHING_RULES}

                    Current Project Context:
                    ${contextSummary}

                    Instructions:
                    - Helper developers with workflow, git, and tasks.
                    - Be concise and helpful.
                    `
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content || "I couldn't generate a response.";

    } catch (error: any) {
        console.error('Chat Service Error:', error);
        return `I'm encountering an issue connecting to my brain (${error.message || 'Unknown Error'}).`;
    }
};
