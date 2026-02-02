import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const USERNAME = process.env.GITHUB_USERNAME || 'bansaldhruv0310';

export const getGitHubSignals = async () => {
    try {
        const { data: prs } = await octokit.request('GET /search/issues', {
            q: `type:pr author:${USERNAME} state:open`,
        });
        return prs.items.map((pr: any) => ({
            title: pr.title,
            url: pr.html_url,
            source: 'GitHub',
            score: 0
        }));
    } catch (e) {
        console.error("GitHub Error", e);
        return [];
    }
};

export const getRecentCommits = async (): Promise<any[]> => {
    try {
        const { data: events } = await octokit.request('GET /users/{username}/events', {
            username: USERNAME,
            per_page: 10
        });

        const pushEvents = events.filter((e: any) => e.type === 'PushEvent');

        return pushEvents.map((e: any) => ({
            repo: e.repo.name,
            commits: e.payload.commits.map((c: any) => ({
                message: c.message,
                sha: c.sha.substring(0, 7),
                url: `https://github.com/${e.repo.name}/commit/${c.sha}`
            })),
            created_at: e.created_at
        }));
    } catch (error: any) {
        console.error('Failed to fetch GitHub commits:', error.message || error);
        return [];
    }
};
