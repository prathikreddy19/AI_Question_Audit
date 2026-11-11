export function formatDate(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getUrgencyConfig(urgency) {
  const norm = (urgency || 'MEDIUM').toUpperCase();
  switch (norm) {
    case 'URGENT':
      return {
        label: 'Urgent',
        className: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
        dotColor: 'bg-rose-500',
        icon: 'AlertTriangle'
      };
    case 'HIGH':
      return {
        label: 'High Priority',
        className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        dotColor: 'bg-amber-500',
        icon: 'AlertCircle'
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        className: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
        dotColor: 'bg-sky-500',
        icon: 'Info'
      };
    case 'LOW':
    default:
      return {
        label: 'Low',
        className: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
        dotColor: 'bg-slate-400',
        icon: 'Check'
      };
  }
}

export function getStatusConfig(status) {
  const norm = (status || 'pending').toLowerCase();
  switch (norm) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'bg-emerald-600',
      };
    case 'auto_applied':
      return {
        label: 'Auto Applied',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badgeColor: 'bg-indigo-600',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeColor: 'bg-rose-600',
      };
    case 'pending':
    default:
      return {
        label: 'Pending Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeColor: 'bg-amber-600',
      };
  }
}

export function getVerdictConfig(verdict) {
  const configs = {
    defect: {
      label: 'Defect Confirmed',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      desc: 'The question, answer key, or solution contains an error.'
    },
    no_error: {
      label: 'No Error (Student Error)',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Checked and correct. The student misread or mis-solved.'
    },
    display_issue: {
      label: 'Display / Layout Issue',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Stored content fine; rendering or device viewport glitch.'
    },
    app_issue: {
      label: 'App Issue',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      desc: 'Platform behavior, lag, or input recording bug.'
    },
    language_mode: {
      label: 'Language Mode',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Student requested unavailable language variant.'
    },
    already_fixed: {
      label: 'Already Fixed',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Reported problem has already been rectified.'
    },
    not_actionable: {
      label: 'Not Actionable',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      desc: 'Comment unintelligible and automated checks found nothing.'
    }
  };

  return configs[verdict] || {
    label: verdict || 'Unknown',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    desc: ''
  };
}
