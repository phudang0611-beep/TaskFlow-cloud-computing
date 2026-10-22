// Utility helpers for TaskFlow Jira-like UI

export function getTaskKey(id) {
  if (!id) return 'TF-0';
  return `TF-${id}`;
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-violet-600 text-white',
  'bg-purple-600 text-white',
  'bg-pink-600 text-white',
  'bg-rose-600 text-white',
  'bg-emerald-600 text-white',
  'bg-teal-600 text-white',
  'bg-amber-600 text-white',
  'bg-cyan-600 text-white',
];

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDueDateTime(dateStr) {
  if (!dateStr) return 'No due date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';
  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const dateFormatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${dateFormatted} ${hours}:${minutes}`;
}

export function toDateTimeLocalString(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDateTimeLocalString(localStr) {
  if (!localStr) return null;
  const date = new Date(localStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function isOverdue(dateStr, status) {
  if (!dateStr || status === 'completed') return false;
  const due = new Date(dateStr).getTime();
  const now = Date.now();
  return due < now;
}

export const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Done',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  unassigned: {
    label: 'Unassigned',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
};

export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900',
    iconColor: 'text-rose-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
    iconColor: 'text-amber-500',
  },
  low: {
    label: 'Low',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
    iconColor: 'text-emerald-500',
  },
};
