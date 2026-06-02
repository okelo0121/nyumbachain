import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
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
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-lg">
                    <div className="glass-card max-w-md w-full p-xl rounded-xl text-center">
                        <h1 className="font-headline-md text-headline-md text-primary mb-md">Something went wrong</h1>
                        <p className="text-on-surface-variant text-body-md mb-lg">
                            {this.state.error?.message ?? 'An unexpected error occurred.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-button-text"
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
