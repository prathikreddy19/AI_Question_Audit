import React from 'react';
import { Clock, Zap, CheckCircle2, XCircle, FileText, ShieldCheck } from 'lucide-react';
import { useAudit } from '../../contexts/AuditContext';

export function StatsCard() {
  const { stats } = useAudit();

  const cards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      subtext: 'Student submissions',
      border: 'border-slate-200/80',
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      subtext: 'Awaiting faculty decision',
      color: 'amber',
      bgLight: 'bg-amber-50/70',
      border: 'border-amber-200/80',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      title: 'Auto Applied',
      value: stats.autoApplied,
      icon: Zap,
      subtext: 'Safe AI fixes applied',
      color: 'indigo',
      bgLight: 'bg-indigo-50/70',
      border: 'border-indigo-200/80',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'Approved',
      value: stats.approvedToday,
      icon: CheckCircle2,
      subtext: 'Faculty approved',
      color: 'emerald',
      bgLight: 'bg-emerald-50/70',
      border: 'border-emerald-200/80',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      title: 'Rejected',
      value: stats.rejectedToday,
      icon: XCircle,
      subtext: 'Faculty rejected',
      color: 'rose',
      bgLight: 'bg-rose-50/70',
      border: 'border-rose-200/80',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
    },
    {
      title: 'Faculty Review',
      value: stats.facultyReview,
      icon: ShieldCheck,
      subtext: 'Needs faculty attention',
      border: 'border-violet-200/80',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`bg-white rounded-2xl border ${c.border} p-5 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {c.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  {c.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span>{c.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCard;
