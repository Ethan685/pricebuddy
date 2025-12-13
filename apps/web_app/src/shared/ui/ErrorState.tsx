import { Button } from "./Button";
import { useLanguage } from "@/shared/context/LanguageContext";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();
  const errorMessage = message || t("common.error");
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-400 text-lg mb-4">{errorMessage}</div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

