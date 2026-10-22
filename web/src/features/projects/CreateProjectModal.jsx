import React, { useState } from 'react';
import { X, FolderPlus, ShieldCheck, Sparkles, Key } from 'lucide-react';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  currentUser,
}) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-generate project key from name
  const handleNameChange = (val) => {
    setName(val);
    if (!key || key.length <= 4) {
      const suggested = val
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (suggested) setKey(suggested);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }
    if (!key.trim()) {
      setError('Please provide a project key (e.g. TF, CLOUD).');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onCreateProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
      });
      setName('');
      setKey('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Project</h2>
              <p className="text-xs text-slate-500">Launch a new workspace for your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Lead Notice Badge */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 flex items-start gap-2.5 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Project Lead Assignment:</span> Because you are creating this project, you (
            <span className="font-semibold text-blue-700">{currentUser?.full_name}</span>) will be automatically
            recorded as the official <span className="font-bold underline">Project Lead</span> with full authority to assign tasks and manage members.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Cloud Security System, Mobile App..."
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Project Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Project Key <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Prefix for tasks (e.g. TF-1)</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={6}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g. CLOUD, SEC, TF"
                className="w-full pl-10 pr-3 py-2.5 text-sm font-mono font-bold uppercase rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all tracking-wider"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Scope / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals and deliverables of this project?"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create & Become Project Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
