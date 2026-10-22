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
  Lock
} from 'lucide-react';
import { getInitials, getAvatarColor, formatDate } from '../../utils/helpers';

export default function AdminAccountsView({
  teamMembers = [],
  projects = [],
  tasks = [],
  currentUser,
  onToggleUserStatus,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            <Shield className="w-4 h-4" />
            <span>System Administration Portal</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Account & System Parameters Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin console to manage user credentials, active permissions, and cloud server parameters.
          </p>
        </div>
      </div>

      {/* System Telemetry Cards */}
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
            {activeUsers} active • {deactivatedUsers} inactive
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cloud Projects
            </span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{projects.length}</div>
          <div className="text-xs text-slate-400 mt-1">Managed by Project Leads</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Issues
            </span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{tasks.length}</div>
          <div className="text-xs text-slate-400 mt-1">Across all workspace boards</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              DB Connection
            </span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neon PG (Active)</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">AWS Asia-Pacific Singapore</div>
        </div>
      </div>

      {/* Account Management Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>User Accounts Directory & Status Controls</span>
          </h3>
          <span className="text-xs text-slate-400">{filteredUsers.length} accounts found</span>
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

      {/* Cloud Architecture Parameters */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          <span>Cloud Infrastructure Parameters</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">Deployment Platform</span>
            <span className="font-semibold text-slate-800">Render Cloud Web Service (Node.js)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">JWT Expiry & Secret</span>
            <span className="font-semibold text-slate-800">7 Days (HS256 256-bit entropy)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">Rate Limiting</span>
            <span className="font-semibold text-slate-800">20 auth requests / 15 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
