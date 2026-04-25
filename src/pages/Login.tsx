import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isRegistering) {
        if (!fullName) throw new Error('Nama lengkap harus diisi');
        await signUp(username, password, fullName);
        setMessage('Registrasi berhasil! Silakan login.');
        setIsRegistering(false);
      } else {
        await signIn(username, password);
      }
    } catch (error: any) {
      setMessage(error.message);
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
          Log In
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Contoh: User"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Username</label>
          <input
            type="text"
            placeholder="Username anda"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-lg shadow-slate-200"
        >
          {loading ? 'Memproses...' : (isRegistering ? 'Daftar Sekarang' : 'Masuk Aplikasi')}
        </button>

        {message && (
          <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed ${message.includes('berhasil') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {message}
          </div>
        )}

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage('');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </form>
    </div>
  );
};
