import { ReactNode } from "react";
import { SkeletonPage } from "./Skeleton";
import { ErrorState } from "./ErrorState";

interface AsyncBoundaryProps {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
  onRetry?: () => void;
}

export function AsyncBoundary({
  isLoading,
  error,
  children,
  fallback,
  errorFallback,
  onRetry,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return <>{fallback || <SkeletonPage />}</>;
  }

  if (error) {
    return (
      <>
        {errorFallback?.(error) || (
          <ErrorState message="잠시 후 다시 시도해 주세요." onRetry={onRetry} />
        )}
      </>
    );
  }

  return <>{children}</>;
}

