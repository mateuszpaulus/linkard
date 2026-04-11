"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4 dark:bg-[#0b0b0f]">
          <div className="mx-auto max-w-md animate-scale-in rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 text-6xl">😵</div>
            <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
              We&apos;re sorry for the inconvenience. Please try refreshing the page.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 overflow-auto rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2563EB] hover:shadow-lg"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}