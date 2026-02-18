import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { submitApp, CreateAppRequest } from '../services/api';
import { isAuthenticated } from '../services/auth';

interface AppSubmissionProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AppSubmission: React.FC<AppSubmissionProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateAppRequest>({
    name: '',
    description: '',
    longDescription: '',
    category: 'Utilities',
    imageUrl: '',
    pluginUrl: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated()) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="glass rounded-3xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold mb-4">Create Account to Submit</h3>
          <p className="text-slate-400 mb-6">You need an account to submit apps. It's free and takes seconds. Once submitted, an admin will review and approve your app.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitApp(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit app');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-futuristic uppercase">Submit New App</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <p className="text-sm text-slate-300">
            <strong className="text-cyan-400">Simple Process:</strong> Fill out the form below and submit. An admin will review your app and approve it if it meets our standards. Once approved, your app will be live on the App Store for everyone to use.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">App Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Long Description</label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Productivity">Productivity</option>
              <option value="Games">Games</option>
              <option value="Creative">Creative</option>
              <option value="Utilities">Utilities</option>
              <option value="Social">Social</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Plugin URL *</label>
            <input
              type="url"
              required
              value={formData.pluginUrl}
              onChange={(e) => setFormData({ ...formData, pluginUrl: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
            <p className="text-xs text-slate-400 mt-1">URL to WASM plugin file</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit App'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
