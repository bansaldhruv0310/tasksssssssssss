
import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'bot';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Hi! I’m your Engineering Assistant. Ask me about your tasks, branching rules, or Git history.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!res.ok) throw new Error('Failed to get response');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[500px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-xl">🤖</span> Engineering Assistant
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-200'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-400">
                                    <span className="animate-pulse font-bold text-lg">....</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about Jira tickets or git rules..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 ${isOpen ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white'
                    }`}
            >
                {isOpen ? (
                    <span className="text-2xl">✕</span>
                ) : (
                    <span className="text-3xl">🤖</span>
                )}
            </button>
        </div>
    );
}
