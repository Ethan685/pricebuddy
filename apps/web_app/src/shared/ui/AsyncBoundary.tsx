import { ReactNode } from "react";
import { SkeletonPage } from "./Skeleton";
import { ErrorState } from "./ErrorState";
import { useLanguage } from "@/shared/context/LanguageContext";

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
  const { t } = useLanguage();
  
  if (isLoading) {
    return <>{fallback || <SkeletonPage />}</>;
  }

  if (error) {
    return (
      <>
        {errorFallback?.(error) || (
          <ErrorState message={t("common.error.retryLater")} onRetry={onRetry} />
        )}
      </>
    );
  }

  return <>{children}</>;
}

