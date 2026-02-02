import { type FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 border border-red-500">
                <div className="flex items-center mb-4">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-red-500">Oops! Something went wrong</h1>
                </div>

                <p className="text-slate-300 mb-4">
                    We encountered an unexpected error. Please try again.
                </p>

                {import.meta.env.DEV && (
                    <pre className="bg-slate-900 p-3 rounded text-xs text-red-400 overflow-auto mb-4">
                        {(error as any).message}
                    </pre>
                )}

                <button
                    onClick={resetErrorBoundary}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

export default ErrorFallback;
