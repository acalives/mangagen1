
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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bangers text-red-300">Application Error</h1>
                <p className="mt-4 text-lg text-red-200">Something went wrong, and the application could not start.</p>
                <p className="mt-2 text-sm text-gray-400">This is often caused by a missing or incorrect API key, or a network issue preventing libraries from loading.</p>
                <div className="mt-6 text-left bg-gray-800 p-4 rounded-md overflow-auto">
                    <p className="font-mono text-sm text-red-300">
                        <strong>Error:</strong> {this.state.error?.message}
                    </p>
                    <p className="font-mono text-xs text-gray-500 mt-2">
                        Check the browser's developer console (F12) for more details.
                    </p>
                </div>
                 <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
