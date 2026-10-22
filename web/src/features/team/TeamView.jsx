import React, { useState } from 'react';
import {
  Search,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  Mail,
  UserPlus,
  Crown,
  Clock,
  Trash2,
  FolderKanban,
  AlertCircle
} from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function TeamView({
  teamMembers = [],
  currentProject,
  currentUser,
  loading,
  onOpenInviteModal,
  pendingInvitations = [],
  onCancelInvitation,
  onRemoveMember,
  onDeleteProject,
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const isAdmin = currentUser?.role === 'admin';
  const isProjectLead = Boolean(currentProject && currentUser && String(currentProject.lead_id) === String(currentUser.id));
  const canManage = isAdmin || isProjectLead;

  // Use project members if currentProject exists, otherwise empty array!
  const members = currentProject ? (currentProject.members || teamMembers) : [];

  const filteredMembers = members.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.full_name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    const memberRole = m.project_role || m.role;
    if (roleFilter !== 'all' && memberRole !== roleFilter) return false;
    return true;
  });

  if (!currentProject) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Bạn chưa tham gia dự án nào</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Hãy tạo dự án mới bằng nút <span className="font-semibold text-slate-700">"New Project"</span> ở góc trên để trở thành Project Lead, hoặc chờ lời mời tham gia từ các Project Lead khác.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header with Project Context & Invite Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thành viên dự án</h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
              {currentProject.key}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dự án: <span className="font-semibold text-slate-700">{currentProject.name}</span>
            {' • '}Project Lead:{' '}
            <span className="font-semibold text-amber-700">
              {currentProject.lead_name || 'Project Lead'}
            </span>
          </p>
        </div>

        {canManage && onOpenInviteModal && (
          <button
            onClick={onOpenInviteModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Mời thành viên</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thành viên theo tên hoặc email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="lead">Project Lead</option>
          <option value="member">Thành viên</option>
        </select>
      </div>

      {/* SECTION 1: Active Project Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Danh sách thành viên chính thức</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredMembers.length}
            </span>
          </h2>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Không tìm thấy thành viên nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const isMe = String(member.id) === String(currentUser?.id);
              const isLead = String(member.id) === String(currentProject?.lead_id) || member.project_role === 'lead';

              return (
                <div
                  key={member.id}
                  className={`p-5 rounded-2xl bg-white border shadow-2xs flex flex-col justify-between transition-all ${
                    isLead
                      ? 'border-amber-200 hover:border-amber-300 bg-gradient-to-b from-amber-50/20 to-white'
                      : 'border-slate-200/80 hover:border-blue-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 ${getAvatarColor(
                            member.full_name
                          )}`}
                        >
                          {getInitials(member.full_name)}
                        </div>
                        <div className="truncate">
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{member.full_name}</span>
                            {isMe && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                                Bạn
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>

                      {isLead ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60 flex items-center gap-1 shrink-0">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>Lead</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          Member
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {isLead ? 'Chủ trì dự án' : 'Thành viên tham gia'}
                    </span>

                    {/* Lead/Admin can remove members (except the Lead themselves) */}
                    {canManage && !isLead && onRemoveMember && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa ${member.full_name} khỏi dự án này?`)) {
                            onRemoveMember(member.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        title="Xóa thành viên khỏi dự án"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Pending Invitations */}
      {canManage && pendingInvitations.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Lời mời đang chờ phản hồi</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {pendingInvitations.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 flex items-center justify-between gap-3"
              >
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {inv.invitee_name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {inv.invitee_email}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Đang chờ người dùng chấp nhận</span>
                  </div>
                </div>

                {onCancelInvitation && (
                  <button
                    onClick={() => onCancelInvitation(inv.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors shrink-0 cursor-pointer"
                    title="Thu hồi lời mời"
                  >
                    Thu hồi
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Project Settings & Danger Zone */}
      {canManage && currentProject && (
        <div className="space-y-3 pt-6 border-t border-slate-200/80">
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Xóa dự án ({currentProject.name})</span>
              </h3>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Chỉ dành cho Project Lead hoặc Quản trị viên. Hành động này sẽ xóa dự án, toàn bộ thành viên và các công việc liên quan.
              </p>
            </div>
            {onDeleteProject && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn dự án "${currentProject.name}" [${currentProject.key}] không?\nToàn bộ công việc và lịch sử trong dự án sẽ bị xóa.`
                    )
                  ) {
                    onDeleteProject(currentProject.id);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Xóa dự án này
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
