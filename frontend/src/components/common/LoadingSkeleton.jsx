import React from 'react';

export function LoadingSkeleton({ variant = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'queue') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-5 w-32 bg-slate-100 rounded"></div>
              </div>
              <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
              <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'console') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-40 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="h-6 w-36 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-28 bg-slate-100 rounded-xl"></div>
          <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
      <div className="h-20 bg-slate-100 rounded mb-4"></div>
      <div className="h-8 w-24 bg-slate-200 rounded"></div>
    </div>
  );
}

export default LoadingSkeleton;
