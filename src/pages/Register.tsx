// import React, { useState } from 'react';
// import { signUp, signOut } from '../services/authService'; // Pastikan signOut diimport
// import toast from 'react-hot-toast';
// import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';

// interface RegisterProps {
//   onBackToLogin: () => void;
// }

// export const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     fullName: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (loading) return;

//     setLoading(true);
//     try {
//       // 1. Daftarkan akun baru ke Supabase
//       const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
//       if (error) throw error;

//       /**
//        * 2. LOGIKA PENTING:
//        * Supabase otomatis bikin sesi (login) setelah sukses daftar.
//        * Kita panggil signOut() SEGERA untuk menghapus sesi otomatis itu.
//        * Jadi AuthContext akan tetap melihat user sebagai 'null' (belum login).
//        */
//       await signOut();

//       // 3. Tampilkan pesan sukses
//       toast.success('Akun berhasil dibuat! Silakan masuk menggunakan akun tersebut.', {
//         duration: 6000,
//         icon: '🚀',
//       });

//       // 4. Paksa kembali ke halaman login setelah delay singkat
//       // Agar sistem punya waktu memproses logout di background
//       setTimeout(() => {
//         onBackToLogin();
//       }, 500);

//     } catch (error: any) {
//       toast.error(error.message || 'Gagal mendaftar');
//       console.error("Register Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
//       <div className="p-8">
//         <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-4 mx-auto">
//           <UserPlus size={24} />
//         </div>
        
//         <h2 className="text-2xl font-bold text-center text-slate-900 tracking-tight mb-1">Buat Akun</h2>
//         <p className="text-slate-500 text-center text-[11px] uppercase tracking-widest font-bold mb-8">Registrasi Pengguna</p>
        
//         <form onSubmit={handleRegister} className="space-y-4">
//           <div>
//             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nama Lengkap</label>
//             <input
//               type="text"
//               placeholder="Masukkan nama"
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
//               value={formData.fullName}
//               onChange={(e) => setFormData({...formData, fullName: e.target.value})}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email</label>
//             <input
//               type="email"
//               placeholder="contoh@mail.com"
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
//               value={formData.email}
//               onChange={(e) => setFormData({...formData, email: e.target.value})}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
//               value={formData.password}
//               onChange={(e) => setFormData({...formData, password: e.target.value})}
//               required
//             />
//           </div>

//           <button 
//             disabled={loading}
//             type="submit"
//             className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-slate-200 mt-2"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin mr-2" size={16} />
//             ) : (
//               'Daftar Sekarang'
//             )}
//           </button>
//         </form>

//         <div className="mt-8 pt-6 border-t border-slate-50 text-center">
//           <button 
//             onClick={onBackToLogin}
//             type="button"
//             className="flex items-center justify-center mx-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
//           >
//             <ArrowLeft size={12} className="mr-2" />
//             Batal & Kembali ke Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };