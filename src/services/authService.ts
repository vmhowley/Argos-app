import { supabase } from '../config/supabase';
import { UserProfile } from '../types';

export async function ensureAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  return { data, error };
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function isAnonymousUser(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.is_anonymous ?? true;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle() to handle 0 rows without error

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'No user logged in' };

  const { data, error } = await supabase
    .from('users_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function updateUsername(newUsername: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'No user logged in' };

  const { data, error } = await supabase
    .from('users_profiles')
    .update({ anonimo_id: newUsername })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}
