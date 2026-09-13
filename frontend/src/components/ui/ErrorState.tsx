import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500">
        <AlertTriangle size={28} />
      </div>
      <p className="text-sm text-gray-600 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCcw size={16} />
          Try again
        </Button>
      )}
    </div>
  );
}
