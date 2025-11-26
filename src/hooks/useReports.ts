import { useState, useEffect } from 'react';
import { Report } from '../types';
import { getReports } from '../services/reportService';

export function useReports(filter: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReportsCount, setActiveReportsCount] = useState(0);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    const data = await getReports(filter);
    setReports(data.slice(0, 10));
    // Note: This logic for active count might need adjustment if we want total active vs filtered active
    // For now keeping it consistent with original logic which seemed to count filtered
    setActiveReportsCount(data.length);
  };

  return { reports, activeReportsCount };
}
