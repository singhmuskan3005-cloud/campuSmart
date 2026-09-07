"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while processing your request.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-surface border border-error/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error mb-4">
        <span className="material-symbols-outlined text-[24px]">error</span>
      </div>
      <h3 className="font-headline-sm text-xl font-medium text-on-surface mb-2">
        {title}
      </h3>
      <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try again
        </Button>
      )}
    </div>
  );
}
