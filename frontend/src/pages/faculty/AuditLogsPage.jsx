import React from 'react';
import { History, Shield, Download } from 'lucide-react';
import { AuditTimeline } from '../../components/faculty/AuditTimeline';
import { useAudit } from '../../contexts/AuditContext';

export function AuditLogsPage() {
  const { auditLogs } = useAudit();

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `acadza_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Faculty Audit Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {auditLogs.length} events logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of all AI suggestions, faculty approvals, rejections, and student reports
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit JSON</span>
        </button>
      </div>

      <AuditTimeline logs={auditLogs} />
    </div>
  );
}

export default AuditLogsPage;
