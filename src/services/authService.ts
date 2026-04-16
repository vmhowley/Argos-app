import { supabase } from '../config/supabase';
import { UserProfile, ServiceResponse } from '../types';
import { handleServiceCall } from '../utils/serviceUtils';

export const USER_PROFILE_FIELDS = 'id, anonymous_id, total_reports, verified_reports, neighborhood, premium, level, xp, owl_type, rank_title, recreations_used, role, blood_type, allergies, medications, emergency_contact_name, emergency_contact_phone, created_at';

export async function ensureAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInAnonymously(): Promise<ServiceResponse<any>> {
  return handleServiceCall(supabase.auth.signInAnonymously());
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function isAnonymousUser(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.is_anonymous ?? true;
}

export async function signUp(email: string, password: string): Promise<ServiceResponse<any>> {
  return handleServiceCall(supabase.auth.signUp({ email, password }));
}

export async function signIn(email: string, password: string): Promise<ServiceResponse<any>> {
  return handleServiceCall(supabase.auth.signInWithPassword({ email, password }));
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error: error?.message || null };
}

export async function getUserProfile(): Promise<ServiceResponse<UserProfile>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, data: null, error: 'No user logged in' };

  const query = supabase
    .from('users_profiles')
    .select(USER_PROFILE_FIELDS)
    .eq('id', userId)
    .maybeSingle();

  return handleServiceCall(query);
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<ServiceResponse<UserProfile>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, data: null, error: 'No user logged in' };

  const query = supabase
    .from('users_profiles')
    .update(updates)
    .eq('id', userId)
    .select(USER_PROFILE_FIELDS)
    .single();

  return handleServiceCall(query);
}

export async function updateUsername(newUsername: string): Promise<ServiceResponse<UserProfile>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, data: null, error: 'No user logged in' };

  const query = supabase
    .from('users_profiles')
    .update({ anonymous_id: newUsername })
    .eq('id', userId)
    .select(USER_PROFILE_FIELDS)
    .single();

  return handleServiceCall(query);
}
