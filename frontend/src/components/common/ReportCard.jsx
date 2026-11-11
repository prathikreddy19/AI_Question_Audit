import React from 'react';
import { Smartphone, Globe, Apple, MessageSquare, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export function ReportCard({ report }) {
  if (!report) return null;

  const getSourceIcon = (source = 'web') => {
    switch (source.toLowerCase()) {
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'ios':
        return <Apple className="w-3.5 h-3.5 text-slate-800" />;
      case 'web':
      default:
        return <Globe className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-amber-900">
            {report.studentId}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-white border border-amber-200 text-slate-600 text-[10px] capitalize">
            {getSourceIcon(report.source)}
            <span>{report.source}</span>
          </span>
          {report.reportId && (
            <span className="text-[10px] font-mono text-slate-400">
              #{report.reportId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(report.reportedAt)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-amber-200/50">
        "{report.comment}"
      </p>
    </div>
  );
}

export default ReportCard;
