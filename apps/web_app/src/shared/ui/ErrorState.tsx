import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "오류가 발생했습니다.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-400 text-lg mb-4">{message}</div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          다시 시도
        </Button>
      )}
    </div>
  );
}

