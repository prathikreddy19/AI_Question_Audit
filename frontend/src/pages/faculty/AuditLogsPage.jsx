import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { AuditTimeline } from '../../components/faculty/AuditTimeline';
import { useAudit } from '../../contexts/AuditContext';
import { auditService } from '../../services/auditService';

export function AuditLogsPage() {
  const {
    auditLogs,
    auditLogCount,
    auditLoading,
    auditError,
    loadAuditLogs,
    showToast,
  } = useAudit();
  const [filterAction, setFilterAction] = useState('ALL');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const eventTypeByFilter = {
    ALL: undefined,
    APPROVED: 'approved',
    REJECTED: 'rejected',
    AUTO: 'auto_applied',
    REPORT: 'reports',
  };

  useEffect(() => {
    loadAuditLogs({
      page,
      limit: 20,
      event_type: eventTypeByFilter[filterAction],
    });
  }, [filterAction, loadAuditLogs, page]);

  const handleExportJson = async () => {
    setExporting(true);
    try {
      const logs = await auditService.getAllLogs();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const objectUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = `acadza_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      showToast('Unable to export audit logs. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
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
              {auditLogCount} events logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of all AI suggestions, faculty approvals, rejections, and student reports
          </p>
        </div>

        <button
          onClick={handleExportJson}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{exporting ? 'Exporting...' : 'Export Audit JSON'}</span>
        </button>
      </div>

      {auditError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {auditError}
        </div>
      )}
      {auditLoading && <p className="text-xs text-slate-500">Loading audit events...</p>}
      <AuditTimeline
        logs={auditLoading ? [] : auditLogs}
        filterAction={filterAction}
        onFilterActionChange={(nextFilter) => {
          setFilterAction(nextFilter);
          setPage(1);
        }}
        page={page}
        total={auditLogCount}
        limit={20}
        onPageChange={setPage}
      />
    </div>
  );
}

export default AuditLogsPage;
