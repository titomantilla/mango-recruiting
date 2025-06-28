'use client';

import { useState, useEffect } from 'react';
import {
  addDoc,
  updateDoc,
  collection,
  doc,
  getDocs
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import RichTextEditor from './RichTextEditor';
import { db } from '../lib/firebase';

export default function CandidateForm({ candidate = null, onSave }) {
  const isEdit = Boolean(candidate);
  const { user } = useAuth();
  const router = useRouter();

  // 1) Cargar opciones de posiciones
  const [positionsOptions, setPositionsOptions] = useState([]);
  useEffect(() => {
    async function fetchPositions() {
      try {
        const snap = await getDocs(collection(db, 'positions'));
        const opts = snap.docs.map(d => ({
          id: d.id,
          title: d.data().title
        }));
        setPositionsOptions(opts);
      } catch (err) {
        console.error('Error cargando posiciones:', err);
      }
    }
    fetchPositions();
  }, []);

  // 2) Estados posibles
  const STATUS_OPTIONS = [
    'Presentado',
    'Por Presentar',
    'Agendando Entrevista con Cliente',
    'Esperando Feedback',
    'Pedir más información al candidato',
    'Candidato se bajó del proceso',
    'Contratado',
    'Rechazado por Cliente',
    'Rechazado por Mango',
  ];

  // 3) Estado inicial
  const initial = {
    fullName: candidate?.fullName || '',
    technicalProfile: candidate?.technicalProfile || '',
    seniority: candidate?.seniority || '',
    mainTechnologies: candidate?.mainTechnologies || '',
    email: candidate?.email || '',
    linkedIn: candidate?.linkedIn || '',
    // positions: array de IDs
    positions: candidate?.positionStatuses?.map(ps => ps.positionId) || [],
    // positionStatuses: array de { positionId, status }
    positionStatuses: candidate?.positionStatuses || [],
    notes: candidate?.notes || '',
  };
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  // 4) Campos simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 5) Cambio en posiciones seleccionadas
  const handlePositionsChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, o => o.value);
    setForm(prev => {
      // Filtramos los antiguos statuses y añadimos por defecto "Por Presentar"
      const newStatuses = selectedIds.map(id => {
        const existing = prev.positionStatuses.find(ps => ps.positionId === id);
        return {
          positionId: id,
          status: existing ? existing.status : 'Por Presentar'
        };
      });
      return {
        ...prev,
        positions: selectedIds,
        positionStatuses: newStatuses
      };
    });
  };

  // 6) Cambio de estado para una posición
  const handleStatusChange = (positionId, newStatus) => {
    setForm(prev => ({
      ...prev,
      positionStatuses: prev.positionStatuses.map(ps =>
        ps.positionId === positionId
          ? { ...ps, status: newStatus }
          : ps
      )
    }));
  };

  // 7) Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        fullName: form.fullName,
        technicalProfile: form.technicalProfile,
        seniority: form.seniority,
        mainTechnologies: form.mainTechnologies,
        email: form.email,
        linkedIn: form.linkedIn,
        positionStatuses: form.positionStatuses,
        notes: form.notes,
      };
      if (isEdit) {
        const ref = doc(db, 'candidates', candidate.id);
        await updateDoc(ref, dataToSave);
        onSave({ id: candidate.id, ...dataToSave });
      } else {
        const docRef = await addDoc(collection(db, 'candidates'), {
          ...dataToSave,
          createdAt: new Date(),
          createdBy: user.uid,
        });
        onSave({
          id: docRef.id,
          ...dataToSave,
          createdAt: new Date(),
          createdBy: user.uid,
        });
      }
      router.push('/candidates');
    } catch (err) {
      console.error('Error guardando candidato:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-800 rounded mb-6">
      <h2 className="text-xl font-bold mb-4 text-mango-accent">
        {isEdit ? 'Editar candidato' : 'Nuevo candidato'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nombre Completo */}
        <div>
          <label className="block text-sm text-gray-200">Nombre Completo</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Perfil Técnico */}
        <div>
          <label className="block text-sm text-gray-200">Perfil Técnico</label>
          <input
            name="technicalProfile"
            value={form.technicalProfile}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Seniority */}
        <div>
          <label className="block text-sm text-gray-200">Seniority</label>
          <input
            name="seniority"
            value={form.seniority}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Tecnologías Principales */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Tecnologías Principales</label>
          <input
            name="mainTechnologies"
            value={form.mainTechnologies}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-200">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Perfil LinkedIn */}
        <div>
          <label className="block text-sm text-gray-200">Perfil LinkedIn</label>
          <input
            name="linkedIn"
            type="url"
            value={form.linkedIn}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Posiciones (select múltiple) */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200 mb-1">Posición(es)</label>
          <select
            multiple
            value={form.positions}
            onChange={handlePositionsChange}
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white h-32"
            required
          >
            {positionsOptions.map(pos => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
        </div>

        {/* Para cada posición seleccionada, su estado */}
        {form.positions.map(posId => {
          const posTitle = positionsOptions.find(o => o.id === posId)?.title || posId;
          const currentStatus = form.positionStatuses.find(ps => ps.positionId === posId)?.status || '';
          return (
            <div key={posId} className="md:col-span-2">
              <label className="block text-sm text-gray-200 mb-1">
                Estado de "{posTitle}"
              </label>
              <select
                value={currentStatus}
                onChange={e => handleStatusChange(posId, e.target.value)}
                required
                className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="" disabled>Selecciona estado</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          );
        })}

        {/* Notas */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200 mb-1">Notas</label>
          <RichTextEditor
            value={form.notes}
            onChange={value => setForm(prev => ({ ...prev, notes: value }))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
      >
        {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear candidato'}
      </button>
    </form>
  );
}
