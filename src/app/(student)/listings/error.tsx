"use client";

import { ErrorState } from "@/components/feedback/error-state";

interface SegmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SegmentError({ error, reset }: SegmentErrorProps) {
  return (
    <ErrorState
      message={error.message || "Unable to load this page."}
      onRetry={reset}
    />
  );
}
