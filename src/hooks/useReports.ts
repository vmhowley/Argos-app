import { useState, useEffect } from 'react';
import { Report } from '../types';
import { getReports } from '../services/reportService';

export function useReports(filter: string, includeUnverified: boolean = true) {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReportsCount, setActiveReportsCount] = useState(0);

  useEffect(() => {
    const loadReports = async () => {
      const response = await getReports(filter, includeUnverified);
      if (response.success && response.data) {
        setReports(response.data); // Removed slice(0, 10) to show everything on map
        setActiveReportsCount(response.data.length);
      }
    };
    
    loadReports();
  }, [filter, includeUnverified]);

  return { reports, activeReportsCount };
}
