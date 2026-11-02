/**
 * StatusBadge - shows colored badge for ticket status
 */
export function StatusBadge({ status }) {
  const map = {
    OPEN: { cls: 'badge-open', label: 'Open' },
    IN_PROGRESS: { cls: 'badge-in_progress', label: 'In Progress' },
    RESOLVED: { cls: 'badge-resolved', label: 'Resolved' },
    CLOSED: { cls: 'badge-closed', label: 'Closed' },
  };
  const { cls, label } = map[status] || { cls: '', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

/**
 * PriorityBadge - shows colored badge for ticket priority
 */
export function PriorityBadge({ priority }) {
  const map = {
    HIGH: { cls: 'badge-high', label: '🔴 High' },
    MEDIUM: { cls: 'badge-medium', label: '🟡 Medium' },
    LOW: { cls: 'badge-low', label: '🟢 Low' },
  };
  const { cls, label } = map[priority] || { cls: '', label: priority };
  return <span className={`badge ${cls}`}>{label}</span>;
}
