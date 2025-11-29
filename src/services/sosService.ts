import { supabase } from '../config/supabase';
import { getUserLocation } from '../utils/geoUtils';
import { getCurrentUserId } from './authService';

let watchId: number | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let intervalId: NodeJS.Timeout | null = null;
let latestCoords: { lat: number; lng: number } | null = null;

/**
 * Starts the SOS workflow:
 * - watches position continuously
 * - records audio
 * - sends payload to Supabase every 30 seconds
 */
export const startSOS = async () => {
  // Get initial location and start watching for updates
  const { lat, lng } = await getUserLocation();
  latestCoords = { lat, lng };
  
  const positionCallback = (pos: GeolocationPosition) => {
    latestCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  };
  
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(positionCallback, (err) => {
      console.error('Geolocation watch error', err);
    }, { enableHighAccuracy: true });
  }

  // Start audio recording
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };
    
    // Collect data every 1 second so we have chunks available for the 30s interval
    mediaRecorder.start(1000);
  } catch (e) {
    console.error('Error accessing microphone:', e);
    // Continue even if audio fails, location is more important
  }

  // Send first payload immediately (without audio initially or empty)
  await sendPayload(lat, lng);

  // Set interval for every 30 seconds
  intervalId = setInterval(async () => {
    if (latestCoords) {
      await sendPayload(latestCoords.lat, latestCoords.lng);
    }
  }, 30000);
};

const sendPayload = async (lat: number, lng: number) => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('No user authenticated for SOS');
    return;
  }

  let audioUrl: string | null = null;
  const timestamp = new Date().toISOString();

  // Create audio blob from accumulated chunks
  if (audioChunks.length > 0) {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    // Upload if we have data
    if (audioBlob.size > 0) {
      const fileName = `${userId}/${timestamp}.webm`;
      try {
        const { error: uploadError } = await supabase.storage
          .from('sos-audio')
          .upload(fileName, audioBlob, {
            contentType: 'audio/webm',
            upsert: true
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('sos-audio')
            .getPublicUrl(fileName);
          audioUrl = publicUrl;
        } else {
          console.error('Error uploading audio:', uploadError);
        }
      } catch (e) {
        console.error('Exception uploading audio:', e);
      }
    }
  }

  try {
    const { error } = await supabase.from('sos_events').insert([
      {
        user_id: userId,
        lat,
        lng,
        audio_url: audioUrl,
        created_at: timestamp,
      },
    ]);
    if (error) throw error;
    console.log('SOS payload sent successfully');
  } catch (e) {
    console.error('Failed to send SOS payload', e);
  }
};

export const stopSOS = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop the stream
    mediaRecorder = null;
  }
  audioChunks = []; // Clear chunks
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
