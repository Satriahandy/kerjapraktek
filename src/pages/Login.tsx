import React, { useState } from 'react';
import { signIn, signUp, signOut } from '../services/authService';
import { toast } from 'react-hot-toast';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState(''); // Anggap ini email jika pakai Supabase
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<'pemilik' | 'kasir'>('pemilik');
  const [ownerUsername, setOwnerUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // --- LOGIKA REGISTER ---
        if (!fullName) throw new Error('Nama lengkap harus diisi');
        
        await signUp(username, password, fullName, role, ownerUsername);
        
        // KUNCI: Paksa logout setelah daftar agar tidak langsung masuk ke dashboard
        await signOut(); 
        
        toast.success('Registrasi berhasil! Silakan login ulang.');
        
        // Reset form & pindah ke mode login
        setIsRegistering(false);
        setPassword(''); 
      } else {
        // --- LOGIKA LOGIN ---
        await signIn(username, password);
        toast.success('Selamat datang kembali!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          {isRegistering ? 'Daftar Akun' : 'Masuk Profil'}
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          Money Report
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input hanya muncul saat DAFTAR */}
        {isRegistering && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Contoh: Satria Handy"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegistering}
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Pilih Peran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('pemilik')}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    role === 'pemilik' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  Pemilik
                </button>
                <button
                  type="button"
                  onClick={() => setRole('kasir')}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    role === 'kasir' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  Kasir
                </button>
              </div>
            </div>

            {role === 'kasir' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Username Pemilik</label>
                <input
                  type="text"
                  placeholder="Username bos anda"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={ownerUsername}
                  onChange={(e) => setOwnerUsername(e.target.value)}
                  required={role === 'kasir'}
                />
              </div>
            )}
          </div>
        )}

        {/* Input untuk LOGIN & DAFTAR */}
        <div>
          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Username / Email</label>
          <input
            type="text"
            placeholder="Username anda"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-lg"
        >
          {loading ? 'Memproses...' : (isRegistering ? 'Daftar Sekarang' : 'Masuk Aplikasi')}
        </button>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setFullName('');
              setOwnerUsername('');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </form>
    </div>
  );
};