const statusStyles = {
  Open: "bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-300 border-ink-800/20 dark:border-white/15",
  "In Progress": "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
  Resolved: "bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 border-accent-400/40 dark:border-accent-500/30",
};

const priorityColors = {
  Low: "#8C8C7E",
  Medium: "#3D8A6E",
  High: "#C97A2F",
  Critical: "#B4423C",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusStyles[status] || "bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-300 border-ink-800/20 dark:border-white/15"}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const color = priorityColors[priority] || "#8C8C7E";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-700 dark:text-ink-300">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      {priority}
    </span>
  );
}
