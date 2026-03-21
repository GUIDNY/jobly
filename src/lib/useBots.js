import { useState, useEffect } from 'react';
import { getBots } from './api';

export function useBots(filters = {}) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getBots(filters)
      .then(setBots)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters.category, filters.botType, filters.search, filters.ownerId]);

  return { bots, loading, error };
}
