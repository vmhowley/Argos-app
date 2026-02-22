import { supabase } from '../config/supabase';

export const uploadReportImage = async (file: File): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `report-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('reports') // Assuming the bucket name is 'reports' or 'report-images'
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Unexpected error in uploadReportImage:', error);
        return null;
    }
};
