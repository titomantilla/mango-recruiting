// src/components/EditPositionForm.js
'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function EditPositionForm({ position, onSave, onCancel }) {
  const [form, setForm] = useState({ ...position });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'positions', position.id);
      await updateDoc(docRef, { ...form });
      onSave(form);
    } catch (err) {
      console.error('Error actualizando posición:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-800 rounded mb-6">
      <h2 className="text-xl font-bold mb-4 text-mango-accent">Editar posición</h2>

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

        {/* Notas Internas */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Notas Internas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Descripción del Puesto</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Beneficios */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Beneficios</label>
          <textarea
            name="benefits"
            value={form.benefits}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Proceso del cliente */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Proceso del cliente</label>
          <textarea
            name="process"
            value={form.process}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Estado de la posición */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200">Estado</label>
          <select
            name="status"
            value={form.status || 'Abierta'}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="Abierta">Abierta</option>
            <option value="En proceso">En proceso</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
