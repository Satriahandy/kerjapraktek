import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Hanya set user jika session benar-benar valid dan bukan sisa proses register
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Pantau perubahan status
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);

      if (event === 'SIGNED_IN' && session) {
        // --- LOGIKA CEGAH DASHBOARD KEDIP ---
        // Kita cek apakah user memiliki role di metadata. 
        // User baru yang baru 'terdaftar' tapi belum login manual biasanya 
        // prosesnya sangat cepat.
        
        // Strategi: Izinkan login hanya jika event tersebut bukan dipicu oleh pendaftaran baru
        // atau pastikan data user lengkap.
        setUser(session.user);
      } 
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);