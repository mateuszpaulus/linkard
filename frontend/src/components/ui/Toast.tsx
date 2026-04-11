"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const TYPE_STYLES: Record<ToastType, { bg: string; icon: string; progress: string }> = {
  success: { bg: "bg-[#10B981]", icon: "✓", progress: "bg-green-200" },
  error: { bg: "bg-[#EF4444]", icon: "✗", progress: "bg-red-200" },
  info: { bg: "bg-[#3B82F6]", icon: "ℹ", progress: "bg-blue-200" },
  warning: { bg: "bg-[#F59E0B]", icon: "⚠", progress: "bg-amber-200" },
};

export function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const style = TYPE_STYLES[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 overflow-hidden rounded-xl shadow-xl transition-all duration-300 ${
        style.bg
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <div className="flex items-center gap-3 px-5 py-3.5 pr-12 text-sm font-medium text-white">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          {style.icon}
        </span>
        {message}
        <button
          aria-label="Dismiss"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/80 hover:bg-white/20"
        >
          ✕
        </button>
      </div>
      {/* Progress bar */}
      <div
        className={`h-1 origin-left ${style.progress}`}
        style={{
          animation: `progressBar ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}