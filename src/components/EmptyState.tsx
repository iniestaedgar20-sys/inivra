import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  secondaryText,
  onSecondaryAction,
  className = ''
}: EmptyStateProps) {
  const primaryButtonLabel = actionText || actionLabel;

  return (
    <div
      className={`border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-indigo-600 mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {primaryButtonLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {primaryButtonLabel}
          </button>
        )}
        {secondaryText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
          >
            {secondaryText}
          </button>
        )}
      </div>
    </div>
  );
}
