"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <ErrorState
        title="Application Error"
        message={error.message || "An unexpected error occurred in CampusMart AI."}
        onRetry={reset}
      />
    </div>
  );
}
