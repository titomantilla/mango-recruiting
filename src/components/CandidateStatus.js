'use client';

import { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ESTADOS = [
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

export default function CandidateStatus({
  candidateId,
  positionId,
  initialStatus,
  onChange,    // <— aquí
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);

    const ref = doc(db, 'candidates', candidateId);
    const snap = await getDoc(ref);
    const data = snap.data();

    // Actualizamos sólo el entry que coincida con positionId
    const updated = (data.positionStatuses || []).map(ps =>
      ps.positionId === positionId ? { ...ps, status: newStatus } : ps
    );

    await updateDoc(ref, { positionStatuses: updated });
    setSaving(false);

    if (onChange) onChange(candidateId, newStatus);
  };

  return (
    <select
      value={status}
      onChange={handleChange}    // <— aquí
      disabled={saving}
      className="bg-gray-700 text-white p-1 rounded"
    >
      {ESTADOS.map(est => (
        <option key={est} value={est}>
          {est}
        </option>
      ))}
    </select>
  );
}
