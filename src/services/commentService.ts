import { supabase } from '../config/supabase';
import { ReportComment, ServiceResponse } from '../types';
import { handleServiceCall } from '../utils/serviceUtils';

export const getComments = async (reportId: string): Promise<ServiceResponse<ReportComment[]>> => {
  const query = supabase
    .from('report_comments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  return handleServiceCall(query);
};

export const postComment = async (reportId: string, userId: string, content: string): Promise<ServiceResponse<ReportComment>> => {
  const query = supabase
    .from('report_comments')
    .insert({
      report_id: reportId,
      user_id: userId,
      content: content.trim()
    })
    .select()
    .single();

  return handleServiceCall(query);
};

export const deleteComment = async (commentId: string): Promise<ServiceResponse<null>> => {
  const query = supabase
    .from('report_comments')
    .delete()
    .eq('id', commentId);

  return handleServiceCall(query);
};
