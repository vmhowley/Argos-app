import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { calculateDistance, getUserLocation } from '../utils/geoUtils';
import { Report } from '../types';

const MAX_NOTIFICATIONS_PER_DAY = 3;

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission().then(setPermission);
        }
    }, []);

    useEffect(() => {
        if (permission !== 'granted') return;

        let location: { lat: number, lng: number } | null = null;
        getUserLocation().then(loc => location = loc).catch(console.error);

        const checkAndNotify = async (report: Report) => {
            if (!location) return;

            const today = new Date().toDateString();
            const notifData = JSON.parse(localStorage.getItem('atenea_notifs') || '{"date":"","count":0,"seenIds":[]}');

            if (notifData.date !== today) {
                notifData.date = today;
                notifData.count = 0;
            }

            if (notifData.seenIds.includes(report.id)) return;

            const distance = calculateDistance(location.lat, location.lng, report.lat, report.lng);

            if (distance <= 800) {
                if (notifData.count < MAX_NOTIFICATIONS_PER_DAY) {
                    new Notification('¡Atenea Guardián Alerta!', {
                        body: `Incidente reportado a ${Math.round(distance)}m: ${report.type}. ${report.is_verified ? '(Verificado)' : '(Por verificar)'}`,
                        icon: '/icon.png' // Default browser icon fallback if no icon
                    });
                    notifData.count++;
                    notifData.seenIds.push(report.id);
                    localStorage.setItem('atenea_notifs', JSON.stringify(notifData));
                } else {
                    // Already hit daily limit, but mark as seen
                    notifData.seenIds.push(report.id);
                    localStorage.setItem('atenea_notifs', JSON.stringify(notifData));
                }
            }
        };

        const subscription = supabase
            .channel('reports_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
                checkAndNotify(payload.new as Report);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [permission]);
}
