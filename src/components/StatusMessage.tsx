import { AlertCircle, X } from 'lucide-react';

interface StatusMessageProps {
  message: string;
  onClose?: () => void;
}

export default function StatusMessage({
  message,
  onClose,
}: StatusMessageProps) {
  return (
    <div className="absolute left-3 right-3 top-[calc(78px+env(safe-area-inset-top))] z-[1100] mx-auto max-w-md">
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-panel dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-300">
        <AlertCircle
          size={19}
          className="shrink-0"
        />

        <p className="flex-1 text-sm font-medium">
          {message}
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij komunikat"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </div>
  );
}