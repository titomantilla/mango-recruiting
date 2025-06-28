'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { useAuth } from '../../../lib/auth';
import { db } from '../../../lib/firebase';
import CandidateForm from '../../../components/CandidateForm';
import { doc as userDoc, getDoc as getUserDoc } from 'firebase/firestore';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [positionsOptions, setPositionsOptions] = useState([]);
  const [createdByName, setCreatedByName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // 1) Cargar todas las posiciones para mostrar título
  useEffect(() => {
    async function fetchPosOpts() {
      try {
        const snap = await getDocs(collection(db, 'positions'));
        setPositionsOptions(
          snap.docs.map(d => ({ id: d.id, title: d.data().title }))
        );
      } catch (err) {
        console.error('Error cargando posiciones:', err);
      }
    }
    fetchPosOpts();
  }, []);

  // 2) Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 3) Cargar datos del candidato + nombre creador
  useEffect(() => {
    async function fetchCandidate() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'candidates', id));
        if (!snap.exists()) {
          router.push('/candidates');
          return;
        }
        const data = snap.data();
        if (user.role === 'recruiter' && data.createdBy !== user.uid) {
          router.push('/candidates');
          return;
        }

        setCandidate({ id: snap.id, ...data });

        // Cargar displayName del creador
        const uref = userDoc(db, 'users', data.createdBy);
        const usnap = await getUserDoc(uref);
        if (usnap.exists()) {
          const ud = usnap.data();
          setCreatedByName(ud.displayName || ud.email || data.createdBy);
        } else {
          setCreatedByName(data.createdBy);
        }
      } catch (err) {
        console.error('Error cargando candidato:', err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading && user) {
      fetchCandidate();
    }
  }, [authLoading, user, id, router]);

  if (authLoading || loading) {
    return <p className="p-4 text-gray-300">Cargando…</p>;
  }
  if (!candidate) {
    return null;
  }

  const handleDelete = async () => {
    if (confirm('¿Seguro que deseas eliminar este candidato?')) {
      await deleteDoc(doc(db, 'candidates', id));
      router.push('/candidates');
    }
  };

  const handleSave = (updated) => {
    setCandidate(updated);
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      {editing ? (
        <CandidateForm candidate={candidate} onSave={handleSave} />
      ) : (
        <>
          <div className="bg-gray-800 p-6 rounded mb-6 space-y-2">
            <p className="text-2xl text-center"><strong>{candidate.fullName}</strong></p>
            <p><strong>Perfil Técnico:</strong> {candidate.technicalProfile}</p>
            <p><strong>Seniority:</strong> {candidate.seniority}</p>
            <p><strong>Tecnologías Principales:</strong> {candidate.mainTechnologies}</p>
            <p><strong>Email:</strong> {candidate.email}</p>
            <p><strong>LinkedIn:</strong>{' '}
              <a
                href={candidate.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="text-mango-accent hover:underline"
              >
                {candidate.linkedIn}
              </a>
            </p>

            {/* Posiciones con sus estados */}
            <div>
              <strong>Posiciones y Estados:</strong>
              <ul className="list-disc list-inside mt-2">
                {candidate.positionStatuses?.map(ps => {
                  const pos = positionsOptions.find(o => o.id === ps.positionId);
                  const title = pos ? pos.title : ps.positionId;
                  return (
                    <li key={ps.positionId}>
                      <span className="font-semibold">{title}:</span> {ps.status}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <strong>Notas:</strong>
              <div
                className="rich-text-content mt-2"
                dangerouslySetInnerHTML={{ __html: candidate.notes }}
              />
            </div>

            <p>
              <strong>Creado por:</strong> {createdByName}{' '}
              <span className="text-gray-400">
                ({new Date(
                  candidate.createdAt?.seconds
                    ? candidate.createdAt.toDate()
                    : candidate.createdAt
                ).toLocaleString()})
              </span>
            </p>
          </div>

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
    </div>
  );
}
