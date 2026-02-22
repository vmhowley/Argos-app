export type IncidentType = 'Robo sin violencia' | 'Robo con violencia' | 'Incendio' | 'Herido por arma de fuego' | 'Robo' | 'Asalto' | 'Homicidio' | 'Vandalismo';

export interface Report {
  id: string;
  user_id: string;
  type: IncidentType;
  lat: number;
  lng: number;
  description: string;
  foto_url?: string;
  has_photo?: boolean;
  confirmations?: number;
  is_verified: boolean;
  created_at: string;
}

export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Barrio {
  id: string;
  name: string;
  total_reports: number;
  verified_count: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  anonymous_id: string;
  total_reports: number;
  verified_reports: number;
  neighborhood: string;
  premium: boolean;
  level: number;
  xp: number;
  owl_type: 'polluelo' | 'centinela' | 'sabio';
  rank_title: string;
  recreations_used: number;
  role?: 'user' | 'admin';
  // Extended Profile Fields (Optional)
  blood_type?: string;
  allergies?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

// New type for SOS payload
export interface SOSPayload {
  latitude: number;
  longitude: number;
  audioBlob?: Blob;
  timestamp: string;
}
