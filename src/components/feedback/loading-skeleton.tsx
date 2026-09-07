import React from "react";

interface LoadingSkeletonProps {
  variant?: "grid" | "table" | "detail" | "list" | "form";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "grid",
  count = 6,
  className = "",
}: LoadingSkeletonProps) {
  if (variant === "form") {
    return (
      <div className={`space-y-6 max-w-2xl w-full animate-pulse ${className}`}>
        <div className="h-8 bg-surface-container rounded w-1/3" />
        <div className="space-y-4">
          <div className="h-4 bg-surface-container-low rounded w-1/4" />
          <div className="h-10 bg-surface-container rounded w-full" />
          <div className="h-4 bg-surface-container-low rounded w-1/4" />
          <div className="h-24 bg-surface-container rounded w-full" />
          <div className="h-10 bg-surface-container rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`space-y-4 w-full animate-pulse ${className}`}>
        <div className="h-10 bg-surface-container rounded-lg w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-surface-container-low rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 w-full animate-pulse ${className}`}>
        <div className="md:col-span-7 aspect-[4/3] bg-surface-container rounded-xl" />
        <div className="md:col-span-5 space-y-4">
          <div className="h-8 bg-surface-container rounded w-3/4" />
          <div className="h-6 bg-surface-container-low rounded w-1/4" />
          <div className="h-24 bg-surface-container-low rounded w-full" />
          <div className="h-12 bg-surface-container rounded w-full" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-3 w-full animate-pulse ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-xl items-center">
            <div className="w-12 h-12 bg-surface-container rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-container rounded w-1/3" />
              <div className="h-3 bg-surface-container rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default "grid"
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full animate-pulse ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col bg-surface border border-outline-variant/30 rounded-xl overflow-hidden">
          <div className="aspect-[4/5] bg-surface-container-low" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-surface-container rounded w-3/4" />
            <div className="h-3 bg-surface-container-low rounded w-1/2" />
            <div className="h-5 bg-surface-container rounded w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
