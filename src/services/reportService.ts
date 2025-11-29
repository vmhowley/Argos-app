import { Report } from '../types';
import { supabase } from '../config/supabase';

export const getReports = async (filter: string = 'all'): Promise<Report[]> => {
  let query = supabase
    .from('reports')
    .select('*')
    .eq('verificado', true)
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('tipo', filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data || [];
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at'>): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .insert([report])
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return null;
  }

  return data;
};

export const getUnverifiedReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('verificado', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unverified reports:', error);
    return [];
  }

  return data || [];
};

export const verifyReport = async (reportId: string): Promise<boolean> => {
  console.log('Attempting to verify report:', reportId);
  
  const { data, error } = await supabase
    .from('reports')
    .update({ verificado: true })
    .eq('id', reportId)
    .select();

  if (error) {
    console.error('Error verifying report:', error);
    return false;
  }

  if (!data || data.length === 0) {
    console.error('No rows were updated. Check RLS policies.');
    return false;
  }

  console.log('Report verified successfully:', data);
  return true;
};

export const getAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
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
    .select('*')
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
    .select('*')
    .eq('user_id', userId)
    .eq('verificado', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user verified reports:', error);
    return [];
  }

  return data || [];
};
