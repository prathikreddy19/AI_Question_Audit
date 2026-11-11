import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  History,
  AlertTriangle,
  KeyRound,
  FileCheck2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { useAudit } from '../../contexts/AuditContext';

export function Sidebar() {
  const { stats, queue } = useAudit();

  const urgentCount = queue.filter(
    (q) => q.aiAnalysis.status === 'pending'
  ).length;

  const navItems = [
    {
      to: '/faculty',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/faculty/queue',
      label: 'Review Queue',
      icon: Layers,
      badge: stats.pendingReviews,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      to: '/faculty/audit',
      label: 'Audit Logs',
      icon: History,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Console Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Priority Quick Filters */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Queue Filters
          </div>
          <div className="space-y-1">
            <NavLink
              to="/faculty/queue?filter=urgent"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Urgent Issues</span>
              </div>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {urgentCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/faculty/queue?repair=answer_key"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Answer Key Defects</span>
              </div>
            </NavLink>

            <NavLink
              to="/faculty/queue?repair=spelling"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Auto-Apply Typos</span>
              </div>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Faculty Shift & Productivity Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/70">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">Shift Target</span>
        </div>
        <div className="flex items-baseline justify-between text-xs mb-1.5">
          <span className="text-slate-500">Reviews completed</span>
          <span className="font-bold text-slate-900">
            {stats.approvedToday + stats.rejectedToday} / 30
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.round(((stats.approvedToday + stats.rejectedToday) / 30) * 100)
              )}%`,
            }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          AI triage automated <strong>{stats.autoApplied}</strong> routine fixes today.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
