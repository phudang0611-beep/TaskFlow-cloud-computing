import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Mail, Check, AlertCircle, Loader2, Users, Clock } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import { requestJson } from '../../models/apiModel';

export default function InviteMemberModal({
  isOpen,
  onClose,
  project,
  token,
  onInvitationSent,
}) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!isOpen || !token || !project) return;
    let isCancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          exclude_project_id: project.id,
          search: search.trim(),
        });
        const { response, data } = await requestJson(`/api/users/search?${queryParams.toString()}`, {
          token,
        });
        if (!isCancelled) {
          if (response.ok && data?.data) {
            setUsers(data.data);
          } else {
            setUsers([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Fetch users error:', err);
          setUsers([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 150);
    return () => {
      isCancelled = true;
      clearTimeout(debounce);
    };
  }, [isOpen, search, token, project?.id]);

  if (!isOpen) return null;

  const handleSendInvite = async (user) => {
    setInvitingId(user.id);
    setMsg(null);
    try {
      const { response, data } = await requestJson(`/api/projects/${project.id}/invitations`, {
        token,
        method: 'POST',
        body: { user_id: user.id },
      });

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể gửi lời mời');
      }

      setMsg({ type: 'success', text: `Đã gửi lời mời tham gia tới ${user.full_name}!` });
      // Mark as pending invite
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, has_pending_invite: true } : u))
      );
      if (onInvitationSent) onInvitationSent(data.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mời thành viên vào dự án</h2>
              <p className="text-xs text-slate-500">
                Dự án: <span className="font-semibold text-slate-800">{project?.name}</span> [{project?.key}]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {msg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email tài khoản..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* User list */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-80">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang tìm kiếm người dùng...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Không tìm thấy tài khoản nào phù hợp hoặc tất cả đã là thành viên chính thức.</p>
            </div>
          ) : (
            users.map((user) => {
              const isAlreadyInvited = Boolean(user.has_pending_invite);

              return (
                <div
                  key={user.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                        user.full_name
                      )}`}
                    >
                      {getInitials(user.full_name)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{user.full_name}</span>
                        <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {isAlreadyInvited ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Đã gửi lời mời</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendInvite(user)}
                      disabled={invitingId === user.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {invitingId === user.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      <span>Mời</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
