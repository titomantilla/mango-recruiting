'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estados
  const [totalPositions, setTotalPositions] = useState(0);
  const [candidatesByPosition, setCandidatesByPosition] = useState([]);
  const [candidatesByUser, setCandidatesByUser] = useState([]);
  const [candidatesByStatus, setCandidatesByStatus] = useState([]); // **nuevo**
  const [loading, setLoading] = useState(true);

  // Protege ruta
  useEffect(() => {
    if (!authLoading && user === null) router.push('/login');
  }, [authLoading, user, router]);

  // Carga métricas
  useEffect(() => {
    if (authLoading || user === null) return;

    async function fetchMetrics() {
      setLoading(true);

      // posiciones
      const posSnap = await getDocs(collection(db, 'positions'));
      const positions = posSnap.docs.map(d => ({
        id: d.id,
        title: d.data().title
      }));
      setTotalPositions(positions.length);

      // candidatos
      const candSnap = await getDocs(collection(db, 'candidates'));
      const candidates = candSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // por posición
      const byPos = positions.map(pos => {
        const matched = candidates.filter(c =>
          Array.isArray(c.positionStatuses) &&
          c.positionStatuses.some(ps => ps.positionId === pos.id)
        );
        return {
          positionId: pos.id,
          title: pos.title,
          count: matched.length,
          names: matched.map(c => c.fullName)
        };
      });
      setCandidatesByPosition(byPos);

      // por usuario
      const counts = {};
      candidates.forEach(c => {
        const uid = c.createdBy || 'unknown';
        counts[uid] = (counts[uid] || 0) + 1;
      });
      const userSnap = await getDocs(collection(db, 'users'));
      const userMap = {};
      userSnap.docs.forEach(d => {
        const data = d.data();
        userMap[d.id] = data.displayName || data.email || d.id;
      });
      const byUser = Object.entries(counts).map(([uid, cnt]) => ({
        userName: userMap[uid] || uid,
        count: cnt
      }));
      setCandidatesByUser(byUser);

      // **por estado**  
      const statusMap = {};
      candidates.forEach(c => {
        const fullName = c.fullName;
        (c.positionStatuses || []).forEach(ps => {
          // buscar título de posición
          const pos = positions.find(p => p.id === ps.positionId);
          const title = pos ? pos.title : ps.positionId;
          if (!statusMap[ps.status]) statusMap[ps.status] = [];
          statusMap[ps.status].push({ fullName, positionTitle: title });
        });
      });
      // transformar a array [{ status, entries: [...] }, ...]
      const byStatus = Object.entries(statusMap).map(([status, entries]) => ({
        status,
        entries
      }));
      setCandidatesByStatus(byStatus);

      setLoading(false);
    }

    fetchMetrics();
  }, [authLoading, user]);

  // retornos condicionales
  if (authLoading || user === null) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }
  if (loading) {
    return <p className="p-4 text-gray-300">Cargando métricas…</p>;
  }

  // render final
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 space-y-8">
      <h1 className="text-3xl font-bold text-mango-accent">Dashboard</h1>

      {/* Métricas Generales */}
      <div className="bg-gray-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-orange-400">
          Métricas Generales
        </h2>
        <p>
          Total de posiciones:{' '}
          <span className="font-bold">{totalPositions}</span>
        </p>
      </div>

      {/* Candidatos por Posición */}
      <div className="bg-gray-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">
          Candidatos por Posición
        </h2>
        {candidatesByPosition.map(pos => (
          <div
            key={pos.positionId}
            className="border-b border-gray-700 pb-2 mb-2"
          >
            <p className="font-medium">
              {pos.title}:{' '}
              <span className="font-bold">{pos.count}</span>
            </p>
            {pos.names.length > 0 && (
              <p className="text-gray-400 text-sm">
                {pos.names.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Candidatos por Usuario */}
      <div className="bg-gray-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">
          Candidatos por Usuario
        </h2>
        <ul className="list-disc list-inside space-y-1">
          {candidatesByUser.map(({ userName, count }) => (
            <li key={userName}>
              <span className="font-medium">{userName}</span>: {count}
            </li>
          ))}
        </ul>
      </div>

      {/* NUEVA: Candidatos por Estado */}
      <div className="bg-gray-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">
          Candidatos por Estado
        </h2>
        {candidatesByStatus.map(group => (
          <div key={group.status} className="mb-4">
            <p className="font-medium underline">{group.status}</p>
            <ul className="list-disc list-inside ml-4 mt-1">
              {group.entries.map(({ fullName, positionTitle }, i) => (
                <li key={i}>
                  {fullName} — <span className="italic">{positionTitle}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
