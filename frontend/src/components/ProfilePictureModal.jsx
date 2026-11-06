import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Sparkles, 
  User, 
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  {
    id: 'avatar_1',
    label: 'Sarah (Default Foodie)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_2',
    label: 'Master Chef',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_3',
    label: 'Gourmet Critic',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_4',
    label: 'Burger Enthusiast',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_5',
    label: 'Coffee Connoisseur',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_6',
    label: 'Healthy Foodie',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_7',
    label: 'Executive Patron',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_8',
    label: 'Brunch Lover',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
  },
];

export default function ProfilePictureModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || PRESET_AVATARS[0].url
  );
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  // Handle local file upload (converts to data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setSelectedAvatar(customUrl.trim());
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ avatar: selectedAvatar });
      }
      onClose();
    } catch (err) {
      console.error('Failed to update profile picture:', err);
      alert('Failed to save profile picture: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Choose Profile Picture</h2>
              <p className="text-xs text-orange-100">
                Personalize your foodie account avatar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Hero Preview */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={selectedAvatar}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-500/30 shadow-md bg-white"
              onError={(e) => {
                e.target.src = PRESET_AVATARS[0].url;
              }}
            />
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center absolute bottom-0 right-0 ring-2 ring-white shadow-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full inline-block mb-1">
              {user.role === 'admin' ? 'System Administrator' : 'Customer Patron'}
            </span>
            <h3 className="text-base font-black text-slate-900 truncate">{user.name}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Curated Gallery
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Image Link / URL
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* 1. Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Pick from our chef and foodie avatar collection:</p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`relative rounded-2xl overflow-hidden p-1 border-2 transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-orange-600/20 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Upload Photo Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-3xl p-8 bg-slate-50 hover:bg-orange-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Upload Image from Computer</h4>
                  <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, or WebP (up to 5MB)</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Browse Device Files
                </button>
              </div>
            </div>
          )}

          {/* 3. Image URL Tab */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Paste Direct Image Web Link
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-avatar.jpg"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Preview Image URL
              </button>
            </form>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save Profile Picture</span>
          </button>
        </div>

      </div>
    </div>
  );
}
