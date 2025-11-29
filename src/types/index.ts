export interface Report {
  id: string;
  user_id: string;
  tipo: 'Robo' | 'Asalto' | 'Homicidio' | 'Vandalismo';
  lat: number;
  lng: number;
  descripcion: string;
  foto_url?: string;
  folio?: string;
  verificado: boolean;
  created_at: string;
}

export interface Barrio {
  id: string;
  nombre: string;
  reportes_total: number;
  verificados: number;
  premio_actual: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  anonimo_id: string;
  reportes_total: number;
  reportes_verificados: number;
  barrio: string;
  premium: boolean;
  recreaciones_usadas: number;
  role?: 'user' | 'admin';
  created_at: string;
}

// New type for SOS payload
export interface SOSPayload {
  latitude: number;
  longitude: number;
  audioBlob?: Blob;
  timestamp: string;
}
