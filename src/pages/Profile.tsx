import React, { useState } from 'react';
import { User, Palette, Globe, Bell, Shield, LogOut, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export const Profile: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  // Example user data
  const user = {
    name: 'Admin Bakmi Jowo',
    email: 'satriahandyp@gmail.com',
    role: 'Owner',
    since: 'April 2024'
  };

  const themes = [
    { id: 'rustic', name: 'Rustic Gold', color: 'bg-primary' },
    { id: 'modern', name: 'Modern Dark', color: 'bg-slate-900' },
    { id: 'minimal', name: 'Clean White', color: 'bg-white border border-slate-200' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <header className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Akun & Pengaturan</h2>
        <p className="text-slate-500 text-sm">Kelola profil dan preferensi aplikasi Anda.</p>
      </header>

      {/* Profile Info */}
      <div className="rustic-card p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/30 relative">
          <User size={40} />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">{user.role}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">Sejak {user.since}</span>
          </div>
        </div>
        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
          Edit Profil
        </button>
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
        <button className="w-full flex items-center justify-center space-x-2 p-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">
          <LogOut size={18} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );
};
