import { supabase } from './supabase';
import { User } from '../types';

export const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'dogs' | 'emergencyContacts'>) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });

    if (profileError) throw profileError;
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
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
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    dogs: [],
    emergencyContacts: [],
  } as User;
};