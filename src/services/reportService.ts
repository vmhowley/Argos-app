import { Report, ServiceResponse } from '../types';
import { supabase } from '../config/supabase';
import { calculateDistance } from '../utils/geoUtils';
import { handleServiceCall } from '../utils/serviceUtils';

export const REPORT_FIELDS = 'id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at';

export const getReports = async (filter: string = 'all', includeUnverified: boolean = true): Promise<ServiceResponse<Report[]>> => {
  let query = supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .order('created_at', { ascending: false });

  if (!includeUnverified) {
    query = query.eq('is_verified', true);
  }

  if (filter !== 'all') {
    query = query.eq('type', filter);
  }

  return handleServiceCall(query);
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<ServiceResponse<Report>> => {
  // 1. Check for duplicates (< 500m and < 10min)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: recentReports, error: fetchError } = await supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('type', report.type)
    .gt('created_at', tenMinutesAgo);

  if (!fetchError && recentReports) {
    const duplicate = recentReports.find(r => {
      const dist = calculateDistance(r.lat, r.lng, report.lat, report.lng);
      return dist < 500;
    });

    if (duplicate) {
      // Merge: Add confirmation to the existing one
      const updateCall = supabase
        .from('reports')
        .update({
          confirmations: (duplicate.confirmations || 0) + 1,
          description: `${duplicate.description}\n(Actualización: ${report.description})`
        })
        .eq('id', duplicate.id)
        .select(REPORT_FIELDS)
        .single();
      
      return handleServiceCall(updateCall);
    }
  }

  // 2. Insert new report
  const reportToInsert = { ...report, confirmations: 0 };
  if ('has_photo' in reportToInsert) {
    delete (reportToInsert as any).has_photo;
  }

  const insertCall = supabase
    .from('reports')
    .insert([reportToInsert])
    .select(REPORT_FIELDS)
    .single();

  return handleServiceCall(insertCall);
};

export const getUnverifiedReports = async (): Promise<ServiceResponse<Report[]>> => {
  const query = supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  return handleServiceCall(query);
};

export const verifyReport = async (reportId: string): Promise<ServiceResponse<Report>> => {
  // Get current confirmations
  const { data: current, error: fetchError } = await supabase
    .from('reports')
    .select('confirmations, foto_url')
    .eq('id', reportId)
    .single();

  if (fetchError) {
    return { success: false, data: null, error: fetchError.message };
  }

  const newCount = (current?.confirmations || 0) + 1;
  const shouldBeVerified = newCount >= 7 || (newCount >= 3 && !!current?.foto_url);

  const updateCall = supabase
    .from('reports')
    .update({
      confirmations: newCount,
      is_verified: shouldBeVerified
    })
    .eq('id', reportId)
    .select(REPORT_FIELDS)
    .single();

  return handleServiceCall(updateCall);
};

export const getAllReports = async (): Promise<ServiceResponse<Report[]>> => {
  const query = supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .order('created_at', { ascending: false });

  return handleServiceCall(query);
};

export const getUserReports = async (userId: string): Promise<ServiceResponse<Report[]>> => {
  const query = supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return handleServiceCall(query);
};

export const getUserVerifiedReports = async (userId: string): Promise<ServiceResponse<Report[]>> => {
  const query = supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('user_id', userId)
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  return handleServiceCall(query);
};
