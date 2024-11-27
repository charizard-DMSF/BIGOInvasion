import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Game Error:', error);
        console.error('Error Info:', errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-screen absolute inset-0 flex flex-col items-center justify-center bg-red-900 bg-opacity-90 text-white">
                    <h1 className="text-4xl mb-4">Critical Error</h1>
                    <p className="text-xl mb-6">The game has encountered a fatal error</p>
                    <button
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
                        onClick={() => window.location.reload()}
                    >
                        Restart Game
                    </button>
                    {this.state.error && (
                        <pre className="mt-4 p-4 bg-red-800 rounded max-w-lg overflow-auto">
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}