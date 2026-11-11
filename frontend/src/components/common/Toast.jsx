import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAudit } from '../../contexts/AuditContext';

export function Toast() {
  const { toast } = useAudit();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-500/10',
    error: 'border-rose-200 bg-white shadow-rose-500/10',
    info: 'border-indigo-200 bg-white shadow-indigo-500/10',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-in-right max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl ${
          borders[toast.type] || borders.info
        } transition-all duration-300`}
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-sm font-medium text-slate-800 leading-snug">
          {toast.message}
        </div>
      </div>
    </div>
  );
}

export default Toast;
