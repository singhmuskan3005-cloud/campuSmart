import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-surface border border-outline-variant/30 ${className}`}
    >
      {icon ? (
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/60 mb-4">
          <span className="material-symbols-outlined text-[24px]">inbox</span>
        </div>
      )}
      <h3 className="font-headline-sm text-xl font-medium text-on-surface mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md mb-6">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
