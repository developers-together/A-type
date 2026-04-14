import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ToastTone = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function pushToast(message: string, tone: ToastTone = 'info'): void {
    setToasts((current) => [
      ...current,
      {
        id: Date.now() + Math.floor(Math.random() * 999),
        message,
        tone,
      },
    ]);
  }

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3400);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
              toast.tone === 'success'
                ? 'border-[rgb(var(--success)/0.6)] bg-[rgb(var(--success)/0.14)] text-[rgb(var(--text))]'
                : toast.tone === 'error'
                  ? 'border-[rgb(var(--danger)/0.65)] bg-[rgb(var(--danger)/0.14)] text-[rgb(var(--text))]'
                  : 'border-[rgb(var(--brand)/0.65)] bg-[rgb(var(--surface))] text-[rgb(var(--text))]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
