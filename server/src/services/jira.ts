export const getJiraSignals = async () => {
    // Mock for now if envs missing
    return [
        { title: "PROJ-123: Fix login bug", source: "Jira", score: 80, metadata: { priority: "High" } }
    ];
};

export const getAllJiraIssues = async (limit: number = 20): Promise<any[]> => {
    // Mock implementation for demo stability
    return [
        { key: "PROJ-101", summary: "Database migration", priority: "Highest", assignee: "Dhruv", status: "In Progress" },
        { key: "PROJ-102", summary: "Update documentation", priority: "Low", assignee: "Unassigned", status: "To Do" },
        { key: "PROJ-123", summary: "Fix login bug", priority: "High", assignee: "Dhruv", status: "In Progress" }
    ];
};
