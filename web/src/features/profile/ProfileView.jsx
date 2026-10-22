import React from 'react';
import { User, Mail, Shield, CheckCircle2, Calendar, HardDrive, Key, Settings, Lock } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function ProfileView({ currentUser, tasks = [], onOpenAccountModal }) {
  const myAssignedTasks = tasks.filter((t) => {
    if (t.created_by === currentUser?.id) return true;
    if (Array.isArray(t.assignees)) {
      return t.assignees.some((a) => a.id === currentUser?.id);
    }
    return false;
  });

  const myCompleted = myAssignedTasks.filter((t) => t.overall_status === 'completed').length;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thông tin tài khoản, bảo mật và phân quyền trên hệ thống.
          </p>
        </div>

        {onOpenAccountModal && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAccountModal('profile')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
            <button
              onClick={() => onOpenAccountModal('security')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md ${getAvatarColor(
              currentUser?.full_name
            )}`}
          >
            {getInitials(currentUser?.full_name)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.full_name}</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentUser?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>User ID: #{currentUser?.id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Account Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Assigned Issues
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {myAssignedTasks.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Completed</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">{myCompleted}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Cloud System
            </span>
            <div className="text-xs font-semibold text-blue-600 mt-1">Render + Neon PG</div>
          </div>
        </div>
      </div>

      {/* Cloud Project Environment Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>Cloud Computing System Spec</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Architecture</span>
            <span className="font-semibold text-slate-800">
              Layered REST API (Express 5.2 + PostgreSQL 16)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Frontend Client</span>
            <span className="font-semibold text-slate-800">
              React 19 + Vite 8 + Tailwind CSS Jira Edition
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Database Provider</span>
            <span className="font-semibold text-slate-800">Neon Serverless PostgreSQL (Singapore)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Authentication</span>
            <span className="font-semibold text-slate-800">
              JWT with Bcrypt 12 rounds + Role-Based Access Control
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
