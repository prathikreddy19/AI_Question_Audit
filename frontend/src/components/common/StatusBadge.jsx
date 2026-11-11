import React from 'react';
import { getStatusConfig } from '../../utils/formatters';

export function StatusBadge({ status, size = 'md' }) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${
        config.className
      } ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.badgeColor} animate-pulse-subtle`} />
      {config.label}
    </span>
  );
}

export function UrgencyBadge({ urgency, size = 'md' }) {
  const norm = (urgency || 'MEDIUM').toUpperCase();
  const styles = {
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dots = {
    URGENT: 'bg-rose-600',
    HIGH: 'bg-amber-500',
    MEDIUM: 'bg-sky-500',
    LOW: 'bg-slate-400',
  };

  const labels = {
    URGENT: 'Urgent',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${
        styles[norm] || styles.LOW
      } ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[norm] || dots.LOW}`} />
      {labels[norm] || norm}
    </span>
  );
}

export default StatusBadge;
