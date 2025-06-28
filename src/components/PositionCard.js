// src/components/PositionCard.js
'use client';

import { useRouter } from 'next/navigation';
import { usePresentedCandidates } from '../hooks/usePresentedCandidates';

export default function PositionCard({ id, title, company,status, inWorkBy = [] }) {
  const router = useRouter();
  const { presented, loading } = usePresentedCandidates(id);

  const goToDetail = () => {
    router.push(`/positions/${id}`);
  };

  // Solo mostramos los dos primeros y calculamos el resto
  const firstTwo = presented.slice(0, 2);
  const extraCount = presented.length - firstTwo.length;

  return (
    <div
      onClick={goToDetail}
      className="card relative cursor-pointer border border-gray-700 p-4 rounded-lg mb-4"
    >
      {/* Badge de status en esquina inferior derecha */}
      {status && (
        <span
        className="absolute bottom-2 right-2 bg-yellow text-white-900 text-xs font-bold px-2 py-1 rounded">
          {status}
          </span>
          )}


      {/* Badge “En Trabajo” */}
      {inWorkBy.length > 0 && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
          {inWorkBy.join(', ')}
        </span>
      )}

      {/* Título y empresa */}
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400">{company}</p>

      {/* Candidatos asociados */}
      {!loading && presented.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {firstTwo.map(name => (
            <span
              key={name}
              className="bg-green-500 text-white text-xs px-2 py-1 rounded"
            >
              {name}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              +{extraCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
