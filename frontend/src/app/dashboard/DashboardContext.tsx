"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDashboard } from "./hooks/useDashboard";

type DashboardState = ReturnType<typeof useDashboard>;

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useDashboard();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardCtx(): DashboardState {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardCtx must be used within <DashboardProvider>");
  }
  return ctx;
}
