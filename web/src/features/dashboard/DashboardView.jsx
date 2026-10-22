import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  Flame,
  UserCheck,
  Calendar,
  Sparkles,
  ShieldAlert,
  FolderGit2,
  ListTodo
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

export default function DashboardView({
  stats,
  tasks = [],
  currentProject,
  currentUser,
  onSelectTask,
  onNavigateToBoard,
  onNavigateToTasks,
  onOpenCreateModal,
  isProjectLead = false,
}) {
  const [myWorkTab, setMyWorkTab] = useState('assigned'); // 'assigned' | 'created'
  const [recentFilter, setRecentFilter] = useState('all'); // 'all' | 'in_progress' | 'overdue'

  // Task metric calculations
  const total = tasks.length || stats?.total || 0;
  const completed = tasks.filter((t) => t.overall_status === 'completed').length;
  const inProgress = tasks.filter((t) => t.overall_status === 'in_progress').length;
  const todo = tasks.filter(
    (t) => t.overall_status === 'todo' || t.overall_status === 'unassigned' || !t.overall_status
  ).length;

  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date, t.overall_status));
  const overdueCount = overdueTasks.length;

  const now = Date.now();
  const twoDaysLater = now + 48 * 3600 * 1000;
  const dueSoonTasks = tasks.filter((t) => {
    if (!t.due_date || t.overall_status === 'completed') return false;
    const due = new Date(t.due_date).getTime();
    return due >= now && due <= twoDaysLater;
  });

  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = tasks.filter((t) => t.priority === 'low').length;

  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
  const percentInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const percentTodo = total > 0 ? Math.max(0, 100 - percentComplete - percentInProgress) : 0;

  // Work items for current user
  const assignedToMe = tasks.filter((t) =>
    Array.isArray(t.assignees) && t.assignees.some((a) => String(a.id) === String(currentUser?.id))
  );
  const createdByMe = tasks.filter((t) => String(t.created_by) === String(currentUser?.id));
  const currentWorkList = myWorkTab === 'assigned' ? assignedToMe : createdByMe;

  // Recent tasks filter
  const filteredRecentTasks = tasks.filter((t) => {
    if (recentFilter === 'in_progress') return t.overall_status === 'in_progress';
    if (recentFilter === 'overdue') return isOverdue(t.due_date, t.overall_status);
    return true;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Welcome & Project Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentProject?.name || 'Project'}</span>
                <span className="font-mono text-[10px] text-blue-200">[{currentProject?.key || 'TF'}]</span>
              </span>
              <span className="text-xs text-blue-200">
                • {isProjectLead ? '👑 Project Lead' : '👤 Project Member'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {currentUser?.full_name}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Dự án hiện có <strong className="text-white">{total}</strong> công việc:{' '}
              <strong className="text-emerald-300">{completed}</strong> đã xong ({percentComplete}%),{' '}
              <strong className="text-sky-300">{inProgress}</strong> đang làm,{' '}
              <strong className="text-slate-200">{todo}</strong> chờ thực hiện
              {overdueCount > 0 ? (
                <>
                  , và <strong className="text-rose-300 underline font-bold">{overdueCount} quá hạn</strong>
                </>
              ) : (
                ', không có task trễ hạn'
              )}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={onNavigateToBoard}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToTasks}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer"
            >
              All Tasks
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 5 Logical Metric Cards Row (Total = To Do + In Progress + Done) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Issues
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Toàn bộ dự án</div>
        </div>

        {/* To Do (Pending) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              To Do
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{todo}</div>
          <div className="text-[11px] text-slate-400 mt-1">Chờ bắt đầu ({percentTodo}%)</div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-600 mt-2">{inProgress}</div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">Đang thực hiện ({percentInProgress}%)</div>
        </div>

        {/* Done / Closed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Done / Closed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{completed}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Hoàn thành ({percentComplete}%)</div>
        </div>

        {/* Overdue */}
        <div
          className={`p-4 rounded-2xl bg-white border shadow-2xs transition-all ${
            overdueCount > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Overdue
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {overdueCount > 0 ? <Flame className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {overdueCount}
          </div>
          <div
            className={`text-[11px] font-medium mt-1 ${
              overdueCount > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {overdueCount > 0 ? 'Quá hạn cần xử lý!' : 'Không có task trễ'}
          </div>
        </div>
      </div>

      {/* Middle Analytics & Work Items (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Project Completion Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-900">Task Completion Rate</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {percentComplete}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Tỷ lệ công việc hoàn thành trên tổng số task dự án.
            </p>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
                title={`Done: ${completed} (${percentComplete}%)`}
              />
              <div
                className="bg-sky-500 h-full transition-all duration-500"
                style={{ width: `${percentInProgress}%` }}
                title={`In Progress: ${inProgress} (${percentInProgress}%)`}
              />
              <div
                className="bg-slate-300 h-full transition-all duration-500"
                style={{ width: `${percentTodo}%` }}
                title={`To Do: ${todo} (${percentTodo}%)`}
              />
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Done / Completed</span>
                </div>
                <span className="font-bold text-emerald-600">{completed} ({percentComplete}%)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-slate-700 font-medium">In Progress</span>
                </div>
                <span className="font-bold text-sky-600">{inProgress} ({percentInProgress}%)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-slate-700 font-medium">To Do / Pending</span>
                </div>
                <span className="font-bold text-slate-600">{todo} ({percentTodo}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xem tiến độ trên bảng Kanban</span>
            <button
              onClick={onNavigateToBoard}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Open Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Priority & Deadline Health */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Priority & Deadline Health</h3>
            <p className="text-xs text-slate-500 mb-4">Phân bổ mức độ ưu tiên và tình trạng hạn chót</p>

            {/* Priority Bars */}
            <div className="space-y-2.5 mb-4">
              {[
                {
                  label: 'High Priority',
                  count: highPriorityCount,
                  color: 'bg-rose-500',
                  textColor: 'text-rose-600',
                },
                {
                  label: 'Medium Priority',
                  count: mediumPriorityCount,
                  color: 'bg-amber-500',
                  textColor: 'text-amber-600',
                },
                {
                  label: 'Low Priority',
                  count: lowPriorityCount,
                  color: 'bg-emerald-500',
                  textColor: 'text-emerald-600',
                },
              ].map((p, idx) => {
                const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{p.label}</span>
                      <span className={`font-bold ${p.textColor}`}>{p.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${p.color} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deadline Health Indicators */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">Quá hạn:</span>
                <span className={`font-bold ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {overdueCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">Gần hạn (48h):</span>
                <span className={`font-bold ${dueSoonTasks.length > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {dueSoonTasks.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xem danh sách đầy đủ</span>
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. My Work Items (Tabs: Assigned to Me / Created by Me) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>My Work Items</span>
              </h3>
            </div>

            {/* Tabs for Work Items */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setMyWorkTab('assigned')}
                className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  myWorkTab === 'assigned'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assigned to Me ({assignedToMe.length})
              </button>
              <button
                type="button"
                onClick={() => setMyWorkTab('created')}
                className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  myWorkTab === 'created'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Created by Me ({createdByMe.length})
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {currentWorkList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {myWorkTab === 'assigned'
                    ? 'Bạn chưa được giao task nào trong dự án này.'
                    : 'Bạn chưa tạo task nào trong dự án này.'}
                </div>
              ) : (
                currentWorkList.slice(0, 6).map((task) => {
                  const overdue = isOverdue(task.due_date, task.overall_status);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <div className="truncate min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-blue-600 font-mono font-bold">
                            {getTaskKey(task.id)}
                          </span>
                          {task.due_date && (
                            <span
                              className={`text-[10px] ${
                                overdue ? 'text-rose-600 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              {formatDueDateTime(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                          STATUS_CONFIG[task.overall_status]?.badge || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {STATUS_CONFIG[task.overall_status]?.label || task.overall_status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Xem tất cả công việc</span>
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Filter in All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Issues Table with Filter Tabs */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Issues</h3>
            <p className="text-xs text-slate-500">Các công việc mới nhất trong dự án</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setRecentFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  recentFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setRecentFilter('in_progress')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  recentFilter === 'in_progress'
                    ? 'bg-white text-sky-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                In Progress ({inProgress})
              </button>
              <button
                onClick={() => setRecentFilter('overdue')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  recentFilter === 'overdue'
                    ? 'bg-white text-rose-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Overdue ({overdueCount})
              </button>
            </div>

            <button
              onClick={onNavigateToTasks}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-2 cursor-pointer"
            >
              <span>View Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2 w-20">Key</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3 pr-2">Assignees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecentTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Không có công việc nào trong mục này.
                  </td>
                </tr>
              ) : (
                filteredRecentTasks.slice(0, 8).map((task) => {
                  const overdue = isOverdue(task.due_date, task.overall_status);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pl-2 font-mono font-bold text-blue-600 group-hover:underline">
                        {getTaskKey(task.id)}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            STATUS_CONFIG[task.overall_status]?.badge || 'bg-slate-100 text-slate-700'
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
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                            PRIORITY_CONFIG[task.priority]?.color || ''
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        <span
                          className={`flex items-center gap-1 ${
                            overdue ? 'text-rose-600 font-semibold' : ''
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDueDateTime(task.due_date)}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="flex items-center -space-x-1">
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
