import React, { useState } from 'react';
import { Layers, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthView({
  authForm,
  setAuthForm,
  isRegistering,
  setIsRegistering,
  onSubmit,
  loading,
  error,
  success,
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Helper to fill demo credentials
  const fillDemoCredentials = (email, password) => {
    setAuthForm({ ...authForm, email, password });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100/10 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="pt-8 pb-4 px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Layers className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegistering ? 'Create your account' : 'Welcome to TaskFlow'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {isRegistering
              ? 'Join the workspace to manage cloud tasks collaboratively'
              : 'Sign in to access your Jira-style board and workspace'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-8 pt-2 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
              {success}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isRegistering ? 8 : 1}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegistering ? 'Create Account' : 'Sign in to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
              }}
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register as employee"}
            </button>
          </div>

          {/* Quick Demo Credentials Widget */}
          {!isRegistering && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 text-center">
                Quick Demo Accounts (Click to Fill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin@example.com', 'Admin@123456')}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold border border-purple-200/60 transition-all text-left"
                >
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-purple-500 truncate mt-0.5">
                    admin@example.com
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials('alice@taskmanager.dev', 'Employee@123456')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all text-left"
                >
                  <div className="font-bold flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Employee</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    alice@taskmanager.dev
                  </div>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6 z-10">
        TaskFlow Final Project • Cloud Computing System
      </div>
    </div>
  );
}
