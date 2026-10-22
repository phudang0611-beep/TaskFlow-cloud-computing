import React, { useState } from 'react';
import {
  Filter,
  Trash2,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  ArrowDown,
  X
} from 'lucide-react';
import {
  getTaskKey,
  getInitials,
  getAvatarColor,
  formatDate,
  formatDueDateTime,
  isOverdue,
  STATUS_CONFIG,
  PRIORITY_CONFIG
} from '../../utils/helpers';

function matchesDate(dateStr, status, filterType, customDate) {
  if (filterType === 'all') return true;
  if (filterType === 'no_date') return !dateStr;
  if (filterType === 'overdue') return isOverdue(dateStr, status);

  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const pad = (n) => String(n).padStart(2, '0');
  const dDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (filterType === 'today') {
    return dDateStr === todayStr;
  }

  if (filterType === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    return dDateStr === tomorrowStr;
  }

  if (filterType === 'this_week') {
    const currentDay = now.getDay();
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0, 0);
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon + 6, 23, 59, 59, 999);
    return d.getTime() >= startOfWeek.getTime() && d.getTime() <= endOfWeek.getTime();
  }

  if (filterType === 'custom') {
    if (!customDate) return true;
    return dDateStr === customDate;
  }

  return true;
}

export default function TaskListView({
  tasks = [],
  onSelectTask,
  onDeleteTask,
  currentUser,
  page,
  totalPages,
  onPageChange,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery = '',
  setSearchQuery,
  isProjectLead = false,
}) {
  const [dateFilterType, setDateFilterType] = useState('all');
  const [customDate, setCustomDate] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter && statusFilter !== 'all') {
      if (t.overall_status !== statusFilter) return false;
    }
    if (priorityFilter && priorityFilter !== 'all') {
      if (t.priority !== priorityFilter) return false;
    }
    if (!matchesDate(t.due_date, t.overall_status, dateFilterType, customDate)) {
      return false;
    }
    return true;
  });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    dateFilterType !== 'all' ||
    Boolean(customDate);

  const handleResetFilters = () => {
    setStatusFilter?.('all');
    setPriorityFilter?.('all');
    setDateFilterType('all');
    setCustomDate('');
    setSearchQuery?.('');
  };

  return (
    <div className="flex-1 p-6 space-y-5 overflow-y-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">All Issues</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Filter and manage all tasks across the workspace.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Done</option>
          <option value="unassigned">Unassigned</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={dateFilterType}
            onChange={(e) => {
              setDateFilterType(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDate('');
              }
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="overdue">Overdue</option>
            <option value="no_date">No Due Date</option>
            <option value="custom">Specific Date...</option>
          </select>
        </div>

        {/* Custom Date Input */}
        {dateFilterType === 'custom' && (
          <div className="relative flex items-center">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-blue-400 bg-blue-50/30 font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            />
            {customDate && (
              <button
                type="button"
                onClick={() => setCustomDate('')}
                className="ml-1.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 cursor-pointer ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Issues Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-4 w-24">Key</th>
                <th className="py-3.5 px-3">Title</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Due Date</th>
                <th className="py-3.5 px-3">Assignees</th>
                <th className="py-3.5 px-3">Created By</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No issues match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isOverdue(task.due_date, task.overall_status);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pl-4 font-mono font-bold text-blue-600 group-hover:underline">
                        {getTaskKey(task.id)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            STATUS_CONFIG[task.overall_status]?.badge ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              STATUS_CONFIG[task.overall_status]?.dot || 'bg-slate-400'
                            }`}
                          />
                          {STATUS_CONFIG[task.overall_status]?.label || task.overall_status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                            PRIORITY_CONFIG[task.priority]?.color || ''
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`flex items-center gap-1 ${
                            overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDueDateTime(task.due_date)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center -space-x-1.5">
                          {(task.assignees || []).length > 0 ? (
                            task.assignees.map((a, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${getAvatarColor(
                                  a.full_name
                                )}`}
                                title={a.full_name}
                              >
                                {getInitials(a.full_name)}
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {task.creator_name || 'Admin'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser?.role === 'admin' || isProjectLead) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete task ${getTaskKey(task.id)}?`)) {
                                  onDeleteTask(task.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete issue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
