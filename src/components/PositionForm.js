// src/components/PositionForm.js
'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RichTextEditor from '../components/RichTextEditor';

export default function PositionForm({ onAdd }) {
  const initialState = {
    title: '',
    seniority: '',
    fee: '',
    company: '',
    location: '',
    modality: 'Remoto',
    salaryRange: '',
    description: '',
    benefits: '',
    process: '',
    applyLink: '',
    notes: '',
    status: 'Abierta', // <-- nuevo campo por defecto
  };
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'positions'), {
        title: form.title,
        seniority: form.seniority,
        fee: form.fee,
        company: form.company,
        location: form.location,
        modality: form.modality,
        salaryRange: form.salaryRange,
        description: form.description,
        benefits: form.benefits,
        process: form.process,
        applyLink: form.applyLink,
        notes: form.notes,
        status: form.status, // <-- guardamos el estado
      });
      onAdd({ id: docRef.id, ...form });
      setForm(initialState);
    } catch (error) {
      console.error('Error añadiendo posición:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mb-8 p-6 bg-gray-800 rounded-lg"
    >
      <h2 className="text-xl font-bold mb-4 text-mango-accent">
        Nueva posición
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Posición */}
        <div>
          <label className="block text-sm text-gray-200">Posición</label>
          <input
            name="title"
            value={form.title}
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

        {/* Fee */}
        <div>
          <label className="block text-sm text-gray-200">Fee del Reclutador</label>
          <input
            name="fee"
            value={form.fee}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm text-gray-200">Empresa</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm text-gray-200">Ubicación</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Modalidad */}
        <div>
          <label className="block text-sm text-gray-200">Modalidad</label>
          <select
            name="modality"
            value={form.modality}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          >
            <option>Remoto</option>
            <option>Híbrido</option>
            <option>Presencial</option>
          </select>
        </div>

        {/* Rango Salarial */}
        <div>
          <label className="block text-sm text-gray-200">Rango Salarial</label>
          <input
            name="salaryRange"
            value={form.salaryRange}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Link de aplicación */}
        <div>
          <label className="block text-sm text-gray-200">Link de aplicación</label>
          <input
            name="applyLink"
            value={form.applyLink}
            onChange={handleChange}
            required
            type="url"
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
      </div>

      {/* Notas Internas */}
      <div className="mt-6">
        <label className="block text-sm text-gray-200 mb-1">Notas Internas</label>
        <RichTextEditor
          value={form.notes}
          onChange={(value) => setForm(prev => ({ ...prev, notes: value }))}
        />
      </div>

      {/* Descripción */}
      <div className="mt-6">
        <label className="block text-sm text-gray-200 mb-1">Descripción del Puesto</label>
        <RichTextEditor
          value={form.description}
          onChange={(value) => setForm(prev => ({ ...prev, description: value }))}
        />
      </div>

      {/* Beneficios */}
      <div className="mt-6">
        <label className="block text-sm text-gray-200 mb-1">Beneficios</label>
        <RichTextEditor
          value={form.benefits}
          onChange={(value) => setForm(prev => ({ ...prev, benefits: value }))}
        />
      </div>

      {/* Proceso del cliente */}
      <div className="mt-6">
        <label className="block text-sm text-gray-200 mb-1">Proceso del cliente</label>
        <RichTextEditor
          value={form.process}
          onChange={(value) => setForm(prev => ({ ...prev, process: value }))}
        />
      </div>

      {/* Estado de la posición */}
      <div className="mt-6 mb-4">
        <label className="block text-sm text-gray-200">Estado</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="Abierta">Abierta</option>
          <option value="En proceso">En proceso</option>
          <option value="Cerrada">Cerrada</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
      >
        {loading ? 'Guardando...' : 'Crear posición'}
      </button>
    </form>
  );
}
