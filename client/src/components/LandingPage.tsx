import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(username, password)) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials. Username and password (min 4 chars) required.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo/Header */}
                <div className="text-center">
                    <div className="inline-block p-3 bg-blue-600 rounded-full mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Safety Platform</h1>
                    <p className="text-slate-300">AI-Powered Developer Productivity</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-8">
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Demo: Any username + password (4+ chars)
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                            <div className="text-2xl mb-1">🤖</div>
                            <p className="text-xs text-slate-300">AI Powered</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                            <div className="text-2xl mb-1">🔒</div>
                            <p className="text-xs text-slate-300">Git Safety</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                            <div className="text-2xl mb-1">⚡</div>
                            <p className="text-xs text-slate-300">Real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
