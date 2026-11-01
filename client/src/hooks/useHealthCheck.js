import { useState, useEffect, useCallback } from 'react';
import healthService from '../services/healthService.js';

/**
 * Custom hook to manage system and database health state
 */
export const useHealthCheck = (pollingIntervalMs = null) => {
  const [healthData, setHealthData] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sysHealth, databaseHealth] = await Promise.allSettled([
        healthService.getSystemHealth(),
        healthService.getDatabaseHealth(),
      ]);

      if (sysHealth.status === 'fulfilled') {
        setHealthData(sysHealth.value);
      } else {
        setError(sysHealth.reason?.message || 'Failed to reach API server');
      }

      if (databaseHealth.status === 'fulfilled') {
        setDbData(databaseHealth.value);
      } else {
        setDbData({
          success: false,
          message: databaseHealth.reason?.message || 'Database unavailable',
        });
      }

      setLastChecked(new Date());
    } catch (err) {
      setError(err.message || 'Error executing health checks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    if (pollingIntervalMs && pollingIntervalMs > 0) {
      const timer = setInterval(checkHealth, pollingIntervalMs);
      return () => clearInterval(timer);
    }
  }, [checkHealth, pollingIntervalMs]);

  return {
    healthData,
    dbData,
    loading,
    error,
    lastChecked,
    refetch: checkHealth,
  };
};

export default useHealthCheck;
