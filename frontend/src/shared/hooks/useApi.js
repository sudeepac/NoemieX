import { useState, useEffect, useCallback } from 'react';

/**
 * Generic API hook for making HTTP requests
 */
const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (customUrl = url, customOptions = {}) => {
    if (!customUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(customUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...customOptions.headers,
        },
        ...options,
        ...customOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (url && options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, url, options.immediate]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

export default useApi;