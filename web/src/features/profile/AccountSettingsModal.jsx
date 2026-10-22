import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  Key,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function AccountSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onChangePassword,
  initialTab = 'profile',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileMsg({ type: 'error', text: 'Họ và tên phải có ít nhất 2 ký tự' });
      return;
    }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await onUpdateProfile(fullName.trim());
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Không thể cập nhật hồ sơ' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setPasswordSaving(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Mật khẩu hiện tại không đúng' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${getAvatarColor(
                currentUser?.full_name
              )}`}
            >
              {getInitials(currentUser?.full_name)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Quản lý tài khoản cá nhân</h2>
              <p className="text-xs text-slate-500">Cập nhật họ tên và mật khẩu bảo mật tài khoản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Only Profile & Security) */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-900"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email tài khoản
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{currentUser?.email}</span>
                  <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Đã xác thực
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email được quản lý bởi quản trị viên hệ thống Cloud.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Vai trò hệ thống</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase text-slate-800">
                      {currentUser?.role === 'admin' ? 'Quản trị viên (Admin)' : 'User'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Mã tài khoản</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold text-slate-700">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>USER #{currentUser?.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all hover:shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {profileSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
                  placeholder="Nhập mật khẩu đang dùng..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
                  placeholder="Ít nhất 8 ký tự..."
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all hover:shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {passwordSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>Cập nhật mật khẩu</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
