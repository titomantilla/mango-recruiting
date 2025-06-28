// src/hooks/usePresentedCandidates.js
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function usePresentedCandidates(positionId) {
  const [presented, setPresented] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!positionId) return;
    let canceled = false;

    async function fetch() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'candidates'));
        const names = snap.docs
          .map(d => d.data())
          .filter(c =>
            Array.isArray(c.positionStatuses) &&
            c.positionStatuses.some(ps => ps.positionId === positionId)
          )
          .map(c => c.fullName);

        if (!canceled) setPresented(names);
      } catch (err) {
        console.error('Error cargando candidatos:', err);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    fetch();
    return () => { canceled = true; };
  }, [positionId]);

  return { presented, loading };
}
