'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from '../../../lib/auth';
import { db } from '../../../lib/firebase';
import EditPositionForm from '../../../components/EditPositionForm';
import CommentsSection from '../../../components/CommentsSection';
import CandidateStatus from '../../../components/CandidateStatus';

export default function PositionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 0) Redirigir a /login dentro de un useEffect
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const [position, setPosition] = useState(null);
  const [assocCandidates, setAssocCandidates] = useState([]); // [{ candidateId, fullName, status }]
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // 1) Cargar posición
  useEffect(() => {
    async function fetchPosition() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'positions', id));
        if (!snap.exists()) {
          router.push('/positions');
          return;
        }
        const data = snap.data();
        setPosition({ id: snap.id, inWorkBy: data.inWorkBy || [], ...data });
      } catch (err) {
        console.error('Error cargando posición:', err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading && user) fetchPosition();
  }, [authLoading, user, id, router]);

  // 2) Cargar candidatos asociados (cualquier status)
  useEffect(() => {
    if (!position) return;
    async function fetchCandidates() {
      try {
        const snap = await getDocs(collection(db, 'candidates'));
        const list = snap.docs.flatMap(docSnap => {
          const c = docSnap.data();
          return (c.positionStatuses || [])
            .filter(ps => ps.positionId === id)
            .map(ps => ({
              candidateId: docSnap.id,
              fullName: c.fullName,
              status: ps.status,
            }));
        });
        setAssocCandidates(list);
      } catch (err) {
        console.error('Error cargando candidatos asociados:', err);
      }
    }
    fetchCandidates();
  }, [position, id]);

  // 3) Mostrar loading / no data
  if (authLoading || loading) {
    return <p className="p-4 text-gray-300">Cargando…</p>;
  }
  // Si ya terminó authLoading y no hay user, no renderizamos nada
  if (!authLoading && user === null) {
    return null;
  }
  if (!position) {
    return <p className="p-4 text-gray-300">Posición no encontrada.</p>;
  }

  // Acciones
  const handleDelete = async () => {
    if (confirm('¿Seguro que quieres eliminar esta posición?')) {
      await deleteDoc(doc(db, 'positions', id));
      router.push('/positions');
    }
  };
  const handleSave = updated => {
    setPosition(updated);
    setEditing(false);
  };
  const toggleInWork = async () => {
    const name = user.displayName || user.email;
    const ref = doc(db, 'positions', id);
    let arr = position.inWorkBy || [];
    if (arr.includes(name)) {
      await updateDoc(ref, { inWorkBy: arrayRemove(name) });
      arr = arr.filter(n => n !== name);
    } else {
      await updateDoc(ref, { inWorkBy: arrayUnion(name) });
      arr = [...arr, name];
    }
    setPosition(p => ({ ...p, inWorkBy: arr }));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-mango-accent">
            Detalle de la posición
          </h1>
          {position.inWorkBy.length > 0 && (
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              {position.inWorkBy.join(', ')}
            </span>
          )}
        </div>
        <Link href="/positions" className="text-gray-400 hover:underline">
          ← Volver a Posiciones
        </Link>
      </div>

      {/* Vista / Edición */}
      {editing ? (
        <EditPositionForm
          position={position}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {/* Detalles */}
          <div className="bg-gray-800 p-6 rounded mb-6 space-y-2">
            <p><strong>Posición:</strong> {position.title}</p>
            <p><strong>Seniority:</strong> {position.seniority}</p>
            <p><strong>Fee:</strong> {position.fee}</p>
            <p><strong>Empresa:</strong> {position.company}</p>
            <p><strong>Ubicación:</strong> {position.location}</p>
            <p><strong>Modalidad:</strong> {position.modality}</p>
            <p><strong>Rango Salarial:</strong> {position.salaryRange}</p>
            <p><strong>Estado:</strong> {position.status}</p>

            <div>
              <strong>Descripción:</strong>
              <div
                className="rich-text-content mt-1"
                dangerouslySetInnerHTML={{ __html: position.description }}
              />
            </div>
            <div>
              <strong>Beneficios:</strong>
              <div
                className="rich-text-content mt-1"
                dangerouslySetInnerHTML={{ __html: position.benefits }}
              />
            </div>
            <div>
              <strong>Proceso:</strong>
              <div
                className="rich-text-content mt-1"
                dangerouslySetInnerHTML={{ __html: position.process }}
              />
            </div>
            {position.notes && (
              <div>
                <strong>Notas internas:</strong>
                <div
                  className="rich-text-content mt-1"
                  dangerouslySetInnerHTML={{ __html: position.notes }}
                />
              </div>
            )}
            <p>
              <strong>Link de aplicación:</strong>{' '}
              <a
                href={position.applyLink}
                target="_blank"
                rel="noreferrer"
                className="text-mango-accent hover:underline"
              >
                {position.applyLink}
              </a>
            </p>

            {/* Candidatos asociados con estado editable */}
            {assocCandidates.length > 0 && (
              <div>
                <strong className="block mb-2 text-white">Candidatos asociados:</strong>
                <div className="mt-2 space-y-2 bg-gray-900 p-4 rounded">
                  {assocCandidates.map(({ candidateId, fullName, status }) => (
                    <div
                      key={candidateId}
                      className="flex items-center justify-between bg-gray-800 p-2 rounded"
                    >
                      <span className="font-medium text-white">{fullName}</span>
                      <CandidateStatus
                        candidateId={candidateId}
                        positionId={id}
                        initialStatus={status}
                        onChange={(cid, newStatus) => {
                          setAssocCandidates(prev =>
                            prev.map(c =>
                              c.candidateId === cid ? { ...c, status: newStatus } : c
                            )
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggle “En Trabajo” */}
          <div className="flex items-center mb-6">
            <input
              id="inWork"
              type="checkbox"
              checked={position.inWorkBy.includes(user.displayName || user.email)}
              onChange={toggleInWork}
              className="h-4 w-4 text-mango-accent focus:ring-mango-accent-dark bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="inWork" className="ml-2 text-gray-200">
              {position.inWorkBy.includes(user.displayName || user.email)
                ? user.displayName
                : 'Marcar como En Trabajo'}
            </label>
          </div>

          {/* Botones */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Eliminar
            </button>
          </div>
        </>
      )}

      <CommentsSection positionId={position.id} />
    </div>
  );
}
