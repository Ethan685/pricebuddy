import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const errorMessage = message || t("common.error", { defaultValue: "An error occurred" });
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-400 text-lg mb-4">{errorMessage}</div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          {t("common.retry", { defaultValue: "Retry" })}
        </Button>
      )}
    </div>
  );
}

