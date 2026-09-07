"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastItem {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "success" | "destructive";
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${
              t.variant === "destructive"
                ? "bg-error-container text-on-error-container border-error/30"
                : t.variant === "success"
                ? "bg-primary-container text-on-primary-container border-primary/30"
                : "bg-surface text-on-surface border-outline-variant/40"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                {t.title && <div className="font-button-text font-medium text-sm mb-1">{t.title}</div>}
                <div className="font-body-sm text-xs opacity-90">{t.description}</div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-60 hover:opacity-100 text-xs p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
