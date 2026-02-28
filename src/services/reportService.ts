import { Report } from '../types';
import { supabase } from '../config/supabase';

export const getReports = async (filter: string = 'all'): Promise<Report[]> => {
  let query = supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('type', filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data || [];
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<Report | null> => {
  // 1. Check for duplicates (< 200m and < 10min)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: recentReports, error: fetchError } = await supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .eq('type', report.type)
    .gt('created_at', tenMinutesAgo);

  if (!fetchError && recentReports) {
    const duplicate = recentReports.find(r => {
      const dist = calculateDistance(r.lat, r.lng, report.lat, report.lng);
      return dist < 200;
    });

    if (duplicate) {
      // Merge: Add confirmation to the existing one
      const { data: updated } = await supabase
        .from('reports')
        .update({
          confirmations: (duplicate.confirmations || 0) + 1,
          description: `${duplicate.description}\n(Actualización: ${report.description})`
        })
        .eq('id', duplicate.id)
        .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
        .single();
      return updated;
    }
  }

  // 2. Insert new report
  const reportToInsert = { ...report, confirmations: 0 };
  if ('has_photo' in reportToInsert) {
    delete (reportToInsert as any).has_photo;
  }

  const { data, error } = await supabase
    .from('reports')
    .insert([reportToInsert])
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return null;
  }

  return data;
};

// Add calculateDistance helper since it's needed here
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


export const getUnverifiedReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unverified reports:', error);
    return [];
  }

  return data || [];
};

export const verifyReport = async (reportId: string): Promise<boolean> => {
  console.log('Attempting to verify report:', reportId);

  // Get current confirmations
  const { data: current } = await supabase
    .from('reports')
    .select('confirmations, foto_url')
    .eq('id', reportId)
    .single();

  const newCount = (current?.confirmations || 0) + 1;
  const shouldBeVerified = newCount >= 7 || (newCount >= 3 && !!current?.foto_url);

  const { error } = await supabase
    .from('reports')
    .update({
      confirmations: newCount,
      is_verified: shouldBeVerified
    })
    .eq('id', reportId)
    .select();

  if (error) {
    console.error('Error verifying report:', error);
    return false;
  }

  return true;
};

export const getAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reports:', error);
    return [];
  }

  return data || [];
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }

  return data || [];
};

export const getUserVerifiedReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
    .eq('user_id', userId)
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user verified reports:', error);
    return [];
  }

  return data || [];
};
