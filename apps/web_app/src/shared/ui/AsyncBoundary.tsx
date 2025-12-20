import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SkeletonPage } from "./Skeleton";
import { ErrorState } from "./ErrorState";

interface AsyncBoundaryProps {
  isLoading: boolean;
  error: string | Error | null;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: (error: Error | string) => ReactNode;
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
  const { t } = useTranslation();
  
  if (isLoading) {
    return <>{fallback || <SkeletonPage />}</>;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    return (
      <>
        {errorFallback?.(error) || (
          <ErrorState 
            message={errorMessage || t("common.error.retryLater", { defaultValue: "An error occurred. Please try again later." })} 
            onRetry={onRetry} 
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}

