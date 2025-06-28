'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CandidateCard from '../../components/CandidateCard';
import { db } from '../../lib/firebase';

export default function CandidatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Protección de ruta
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 2) Carga de candidatos
  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true);
      try {
        let q;
        if (user.role === 'recruiter') {
          q = query(
            collection(db, 'candidates'),
            where('createdBy', '==', user.uid)
          );
        } else {
          q = collection(db, 'candidates');
        }
        const snap = await getDocs(q);
        setCandidates(
          snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error('Error cargando candidatos:', err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading && user) {
      fetchCandidates();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-mango-accent">Candidatos</h1>
        <button
          onClick={() => router.push('/candidates/new')}
          className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
        >
          + Nuevo candidato
        </button>
      </div>

      {loading ? (
        <p className="text-gray-300">Cargando candidatos…</p>
      ) : candidates.length === 0 ? (
        <p className="text-gray-300">No hay candidatos.</p>
      ) : (
        candidates.map(c => (
          <CandidateCard
            key={c.id}
            id={c.id}
            fullName={c.fullName}
            technicalProfile={c.technicalProfile}
            seniority={c.seniority}
            mainTechnologies={c.mainTechnologies}
          />
        ))
      )}
    </div>
  );
}
