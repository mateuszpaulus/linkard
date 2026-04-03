"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bg = type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${bg} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {type === "success" ? "✓ " : "✗ "}
      {message}
    </div>
  );
}
