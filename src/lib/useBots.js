import { useState, useEffect } from 'react';
import { getBots, subscribe } from './botsStore';

export function useBots() {
  const [bots, setBots] = useState(getBots());

  useEffect(() => {
    const unsub = subscribe(() => setBots(getBots()));
    return unsub;
  }, []);

  return bots;
}
