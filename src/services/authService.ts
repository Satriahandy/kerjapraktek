import { supabase } from '../lib/supabase';

// Helper to convert username to a virtual email for Supabase
const toVirtualEmail = (username: string) => `${username.toLowerCase().trim()}@bakmi.jowo`;

export const signUp = async (username: string, password: string, fullName: string) => {
  const email = toVirtualEmail(username);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      }
    }
  });
  if (error) throw error;
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

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
