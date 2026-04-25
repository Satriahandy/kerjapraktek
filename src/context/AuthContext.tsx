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
    // 1. Cek sesi saat aplikasi pertama kali dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Pantau perubahan status
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      // LOGIKA KUNCI: 
      // Jika event-nya adalah SIGNED_IN, tapi kita mau cegah auto-login setelah daftar:
      if (event === 'SIGNED_IN' && session) {
        // Cek apakah user ini baru saja dibuat (metadata)
        // Jika selisih waktu dibuat dan login sangat dekat, kita anggap ini auto-login setelah daftar
        const isNewUser = session.user.confirmed_at === null; 
        
        // Atau cara paling simpel: 
        // Izinkan saja login jika memang session ada, 
        // tapi kita biarkan Register.tsx yang melakukan signOut.
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
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