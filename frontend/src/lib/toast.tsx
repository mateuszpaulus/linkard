"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Toast } from "@/components/ui/Toast";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastInput = { message: string; type: ToastType };
export type ToastItem = ToastInput & { id: string };

interface ToastContextValue {
  toasts: ToastItem[];
  push: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((input: ToastInput) => {
    setToasts((prev) => [...prev, { ...input, id: genId() }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => dismiss(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
