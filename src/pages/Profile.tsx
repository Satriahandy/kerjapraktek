/// <reference types="vite/client" />
import React, { useState } from 'react';
import { User, Palette, Globe, Bell, Shield, LogOut, Check, Save, X, Edit3, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { signOut, updateProfile } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export const Profile: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user: supabaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(supabaseUser?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Berhasil keluar!');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Gagal keluar.');
      setShowLogoutConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Nama tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(fullName.trim());
      toast.success('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  // Profile data from metadata
  const user = {
    name: supabaseUser?.user_metadata?.full_name || 'Admin',
    username: supabaseUser?.user_metadata?.username || 'admin',
    role: supabaseUser?.user_metadata?.role === 'pemilik' ? 'Pemilik' : 'Kasir',
    since: new Date(supabaseUser?.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  };

  const themes = [
    { id: 'rustic', name: 'Rustic Gold', color: 'bg-primary' },
    { id: 'modern', name: 'Modern Dark', color: 'bg-slate-900' },
    { id: 'minimal', name: 'Clean White', color: 'bg-white border border-slate-200' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-slate-900">
      <header className="text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight">Akun & Pengaturan</h2>
        <p className="text-slate-500 text-sm">Kelola profil dan preferensi aplikasi Anda.</p>
      </header>

      {/* Profile Info */}
      <div className="rustic-card p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/30 relative">
          <User size={40} />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        {isEditing ? (
          <div className="flex-1 w-full space-y-3">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Masukkan nama baru"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
              >
                <Save size={14} />
                <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center md:text-left flex-1">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-primary text-sm font-bold mt-0.5">@{user.username}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">{user.role}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">Sejak {user.since}</span>
            </div>
          </div>
        )}
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
          >
            Edit Profil
          </button>
        )}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tampilan */}
        <div className="rustic-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-100 pb-3">
            <Palette size={18} className="text-primary" />
            <h4 className="font-bold text-sm uppercase tracking-wider">Tampilan</h4>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Tema</label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                    theme === t.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-4 h-4 rounded-full", t.color)}></div>
                    <span className="text-xs font-bold text-slate-700">{t.name}</span>
                  </div>
                  {theme === t.id && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifikasi & Keamanan */}
        <div className="rustic-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-100 pb-3">
            <Shield size={18} className="text-primary" />
            <h4 className="font-bold text-sm uppercase tracking-wider">Sistem</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Notifikasi</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  notifications ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  notifications ? "left-6" : "left-1"
                )}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Bahasa</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center space-y-0 space-x-2 p-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6 text-center border-4 border-rose-50"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Konfirmasi Keluar</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Apakah Anda yakin ingin keluar dari aplikasi? Anda harus masuk kembali untuk mengakses data Anda.
                </p>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full p-4 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                >
                  {loading ? 'Sedang Keluar...' : 'Ya, Keluar Sekarang'}
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={loading}
                  className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
