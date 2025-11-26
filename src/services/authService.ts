import { supabase } from '../config/supabase';

export async function ensureAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
    return data.session;
  }
  
  return session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await ensureAuthenticated();
  return session?.user?.id || null;
}
