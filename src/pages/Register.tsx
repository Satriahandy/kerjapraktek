import React, { useState } from 'react';
import { signUp } from '../services/authService';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      setMessage('Registrasi berhasil! Silakan cek email untuk verifikasi.');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-slate-200 mt-10">
      <h2 className="text-xl font-bold mb-4 text-slate-900">Daftar Akun Baru</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</label>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email</label>
          <input
            type="email"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Passowrd</label>
          <input
            type="password"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium ${message.includes('berhasil') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};