import type { ReactNode } from 'react';

interface AsyncBoundaryProps {
    isLoading: boolean;
    error?: any;
    children: ReactNode;
    loadingFallback?: ReactNode;
    errorFallback?: ReactNode;
}

export function AsyncBoundary({
    isLoading,
    error,
    children,
    loadingFallback,
    errorFallback
}: AsyncBoundaryProps) {
    if (isLoading) {
        return <>{loadingFallback || <div className="p-8 text-center text-slate-400 animate-pulse">Loading data...</div>}</>;
    }

    if (error) {
        return <>{errorFallback || <div className="p-8 text-center text-red-400">Error loading data. Please try again.</div>}</>;
    }

    return <>{children}</>;
}
