import { supabase } from '../config/supabase';
import { ServiceResponse } from '../types';

export const uploadReportImage = async (file: File): Promise<ServiceResponse<string>> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `report-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { success: false, data: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('reports')
      .getPublicUrl(filePath);

    return { success: true, data: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Unexpected error in uploadReportImage:', error);
    return { success: false, data: null, error: error.message || 'Unknown error during upload' };
  }
};
