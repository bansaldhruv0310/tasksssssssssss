
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Chatbot from './Chatbot';

interface Priority {
    id: number | string;
    title: string;
    source: string;
    score: number;
    reason?: string;
    url: string;
}

export default function Dashboard() {
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchPriorities = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('http://localhost:3001/priorities');

                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`);
                }

                const data = await res.json();
                setPriorities(data);
            } catch (err) {
                console.error('Failed to fetch priorities:', err);
                setError(err instanceof Error ? err.message : 'Failed to load priorities');
            } finally {
                setLoading(false);
            }
        };

        fetchPriorities();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            {/* Header with Logout */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-500">Priority Inbox</h1>
                        <p className="text-sm text-slate-400">Welcome, {user?.username}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-4">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center text-slate-400 mt-10">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500 mb-4"></div>
                            <p>Loading your priorities...</p>
                            <p className="text-xs mt-2">Fetching from GitHub and analyzing with AI...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Priorities</h3>
                            <p className="text-slate-300 text-sm mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Priorities List */}
                    {!loading && !error && priorities.map(p => {
                        // Source Styling Helper
                        const getSourceStyle = (source: string) => {
                            switch (source) {
                                case 'Jira': return 'bg-blue-900 text-blue-200 border-blue-700';
                                case 'Slack': return 'bg-purple-900 text-purple-200 border-purple-700';
                                case 'GitHub': return 'bg-slate-700 text-slate-300 border-slate-600';
                                default: return 'bg-slate-700 text-slate-300 border-slate-600';
                            }
                        };
                        const sourceStyle = getSourceStyle(p.source);

                        return (
                            <a
                                key={p.id}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <span className={`text-xs uppercase font-bold mr-2 tracking-wider px-2 py-0.5 rounded ${sourceStyle}`}>
                                            {p.source}
                                        </span>
                                        <span className="font-semibold text-lg group-hover:text-blue-400 transition-colors">{p.title}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${p.score > 80 ? 'bg-red-600' : 'bg-blue-600'}`}>
                                        {p.score}
                                    </div>
                                </div>
                                {/* AI Explanation */}
                                <div className="text-sm text-slate-300 bg-slate-700/50 p-2 rounded border-l-2 border-purple-500">
                                    <span className="text-purple-400 font-bold mr-1">AI:</span>
                                    {p.reason || "Analyzing..."}
                                </div>
                            </a>
                        )
                    })}

                    {/* Empty State */}
                    {!loading && !error && priorities.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-semibold mb-2">No Priorities Found</p>
                            <p className="text-sm">Create an open PR on GitHub to see it here!</p>
                        </div>
                    )}
                </div>
            </main>

            <Chatbot />
        </div>
    );
}
