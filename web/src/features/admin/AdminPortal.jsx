import React, { useState } from 'react';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Server,
  Database,
  Cpu,
  Layers,
  Activity,
  FolderKanban,
  UserCheck,
  UserPlus,
  Trash2,
  Crown,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import { getInitials, getAvatarColor, formatDate } from '../../utils/helpers';

export default function AdminPortal({
  subTab = 'overview',
  setSubTab,
  teamMembers = [],
  projects = [],
  tasks = [],
  currentUser,
  onToggleUserStatus,
  onOpenCreateUserModal,
  onDeleteProject,
  onRefresh,
  refreshing,
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalUsers = teamMembers.length;
  const activeUsers = teamMembers.filter((u) => u.is_active).length;
  const deactivatedUsers = totalUsers - activeUsers;

  const filteredUsers = teamMembers.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'deactivated' && u.is_active) return false;
    return true;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
          <Shield className="w-4 h-4" />
          <span>TaskFlow Cloud • Administration Console</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Administration & Account Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Admin role is exclusively designated for user account management, project oversight, and cloud telemetry.
        </p>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & Metrics', icon: Activity },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'projects', label: 'Projects Governance', icon: FolderKanban },
          { id: 'infra', label: 'Cloud Infrastructure Telemetry', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-purple-100 text-purple-800 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Accounts
                </span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{totalUsers}</div>
              <div className="text-xs text-slate-400 mt-1">
                {activeUsers} active • {deactivatedUsers} disabled
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Projects
                </span>
                <FolderKanban className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">{projects.length}</div>
              <div className="text-xs text-slate-400 mt-1">Created by Project Leads</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  System Issues
                </span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">{tasks.length}</div>
              <div className="text-xs text-slate-400 mt-1">Across all project boards</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cloud Database
                </span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Neon PostgreSQL 16</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Singapore Cluster (TLS Online)</div>
            </div>
          </div>

          {/* Projects Governance Quick Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Projects Directory</h3>
                <p className="text-xs text-slate-500">
                  Projects created by employees who were designated as Project Leads
                </p>
              </div>
              <button
                onClick={() => setSubTab('projects')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                View all ({projects.length}) &rarr;
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 pl-4">Project Key</th>
                    <th className="py-2.5 px-3">Project Name</th>
                    <th className="py-2.5 px-3">Designated Project Lead</th>
                    <th className="py-2.5 px-3">Members</th>
                    <th className="py-2.5 px-3">Total Issues</th>
                    <th className="py-2.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pl-4 font-mono font-bold text-blue-600">{proj.key}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{proj.name}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-amber-700">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>{proj.lead_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{proj.member_count || 1} members</td>
                      <td className="py-3 px-3 text-slate-600">{proj.task_count || 0} issues</td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete project ${proj.name}?`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {subTab === 'users' && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>User Accounts Directory & Status Controls</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage login credentials, employee permissions, and account activations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user accounts by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="admin">System Admin</option>
              <option value="employee">User / Project Lead</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          {/* User Accounts Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pl-4">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Projects Led</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 pr-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isMe = user.id === currentUser?.id;
                  const ledProjects = projects.filter((p) => p.lead_id === user.id);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColor(
                              user.full_name
                            )}`}
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.full_name}</span>
                              {isMe && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                                  Current Admin
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.role === 'admin' ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {ledProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ledProjects.map((p) => (
                              <span
                                key={p.id}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[10px]"
                                title={`Lead of ${p.name}`}
                              >
                                Lead of {p.key}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Team Member</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500">{formatDate(user.created_at)}</td>

                      <td className="py-3 pr-4 text-right">
                        {!isMe ? (
                          <button
                            onClick={() => onToggleUserStatus(user.id, !user.is_active)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              user.is_active
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate Account' : 'Activate Account'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Self (Protected)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROJECTS GOVERNANCE TAB */}
      {subTab === 'projects' && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-600" />
              <span>Project Governance & Lead Audit</span>
            </h3>
            <p className="text-xs text-slate-500">
              Review all workspaces created across the organization and verify active Project Leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-purple-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      {proj.key}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete project ${proj.name}?`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Decommission Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{proj.name}</h4>
                  {proj.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Project Lead:</span>
                      <span className="font-bold text-amber-700 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>{proj.lead_name}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Members Enrolled:</span>
                      <span className="font-semibold text-slate-700">{proj.member_count || 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Issues:</span>
                      <span className="font-semibold text-slate-700">{proj.task_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-400">
                  Created {formatDate(proj.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CLOUD INFRASTRUCTURE & TELEMETRY TAB */}
      {subTab === 'infra' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Cloud Computing Telemetry & System Parameters</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of backend services, database connections, and hosting configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Database Telemetry */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Database Cluster</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  HEALTHY
                </span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Provider:</span>
                  <span className="font-semibold">Neon Serverless PostgreSQL 16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Region:</span>
                  <span className="font-semibold">AWS Asia-Pacific (Singapore)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SSL Mode:</span>
                  <span className="font-semibold">require (TLS 1.3)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pool Max Connections:</span>
                  <span className="font-semibold">10 concurrent clients</span>
                </div>
              </div>
            </div>

            {/* Web Service Telemetry */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Backend REST API Service</span>
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  EXPRESS 5.2
                </span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Runtime:</span>
                  <span className="font-semibold">Node.js v24.19 (LTS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Host:</span>
                  <span className="font-semibold">Render Cloud PaaS (Web Service)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Port:</span>
                  <span className="font-semibold">3000 (HTTP/1.1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Mechanism:</span>
                  <span className="font-semibold">JWT Bearer (7 Days Expiry)</span>
                </div>
              </div>
            </div>

            {/* Storage Spec */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <span>Object Storage Engine</span>
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  S3-COMPATIBLE
                </span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bucket Name:</span>
                  <span className="font-semibold">taskflow-files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size Limit:</span>
                  <span className="font-semibold">10 MB per attachment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signed URL Expiry:</span>
                  <span className="font-semibold">120 seconds</span>
                </div>
              </div>
            </div>

            {/* Security Parameters */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Security & Rate Limiting</span>
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  HELMET + RATE LIMIT
                </span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Password Hashing:</span>
                  <span className="font-semibold">Bcrypt (12 Rounds Salt)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Rate Limit:</span>
                  <span className="font-semibold">20 requests / 15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CORS Policy:</span>
                  <span className="font-semibold">Whitelist localhost & Render host</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
