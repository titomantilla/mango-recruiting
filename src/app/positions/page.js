'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { collection, getDocs } from 'firebase/firestore';
import PositionCard from '../../components/PositionCard'; // ← ruta corregida
import { db } from '../../lib/firebase';

export default function PositionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estado de listado
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(true);

  // 1) Protege la ruta, espera a que authLoading termine
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2) Carga inicial de posiciones (este hook siempre se declara)
  useEffect(() => {
    async function fetchPositions() {
      try {
        const snap = await getDocs(collection(db, 'positions'));
        setPositions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error cargando posiciones:', err);
      } finally {
        setPositionsLoading(false);
      }
    }
    // Solo llamamos al fetch si ya sabemos que hay usuario
    if (!authLoading && user) {
      fetchPositions();
    }
  }, [authLoading, user]);

  // 3) Renderizado condicional
  if (authLoading) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-mango-accent">Posiciones</h1>
        <button
          onClick={() => router.push('/positions/new')}
          className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
        >
          + Nueva posición
        </button>
      </div>

      {positionsLoading ? (
        <p className="text-gray-300">Cargando posiciones…</p>
      ) : positions.length === 0 ? (
        <p className="text-gray-300">No hay posiciones cargadas.</p>
      ) : (
        positions.map((pos) => (
          <PositionCard
            key={pos.id}
            id={pos.id}
            title={pos.title}
            company={pos.company}
            status={pos.status}
            inWorkBy={pos.inWorkBy || []}
          />
        ))
      )}
    </div>
  );
}
