import { supabase } from '../lib/supabase';

// Helper to convert username to a virtual email for Supabase
const toVirtualEmail = (username: string) => `${username.toLowerCase().trim()}@bakmi.jowo`;

export const signUp = async (username: string, password: string, fullName: string, role: 'pemilik' | 'kasir', ownerUsername?: string) => {
  let ownerId: string | null = null;

  // If cashier, find the owner's ID
  if (role === 'kasir') {
    if (!ownerUsername) throw new Error('Username Pemilik harus diisi untuk pendaftaran Kasir');
    const { data: ownerData, error: ownerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', ownerUsername.trim())
      .eq('role', 'pemilik')
      .single();
    
    if (ownerError || !ownerData) throw new Error('Pemilik tidak ditemukan. Silakan cek username pemilik.');
    ownerId = ownerData.id;
  }

  const email = toVirtualEmail(username);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
        role: role,
        owner_id: ownerId // Will be set after signup for Pemilik
      }
    }
  });

  if (error) throw error;
  if (!data.user) throw new Error('Pendaftaran gagal');

  // Set owner_id to self if pemilik
  const finalOwnerId = role === 'pemilik' ? data.user.id : ownerId;

  // Create public profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username: username.trim(),
    full_name: fullName,
    role: role,
    owner_id: finalOwnerId
  });

  if (profileError) console.error('Gagal membuat profil publik:', profileError);

  // If Pemilik, update their auth metadata with their own ID as owner_id
  if (role === 'pemilik') {
    await supabase.auth.updateUser({
      data: { owner_id: data.user.id }
    });
  }

  // FORCE SIGN OUT immediately to prevent auto-session from leaking into AuthContext
  await supabase.auth.signOut();

  return data;
};

export const signIn = async (username: string, password: string) => {
  const email = toVirtualEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const updateProfile = async (fullName: string) => {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
