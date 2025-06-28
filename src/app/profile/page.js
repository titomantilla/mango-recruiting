'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../lib/auth';
import { db } from '../../lib/firebase';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1) Redirigir SIEMPRE dentro de useEffect, cuando authLoading cambie
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 2) Carga del perfil, pero solo si ya hay usuario
  useEffect(() => {
    if (authLoading || user === null) return;
    const fetchProfile = async () => {
      setLoading(true);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || '');
        setRole(data.role || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [authLoading, user]);

  // 3) Mientras autentica, muestra “Verificando…”
  if (authLoading) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }
  // 4) Si ya autenticó y no hay user, no renderices nada (el push ocurre en el useEffect)
  if (!authLoading && user === null) {
    return null;
  }
  // 5) Mientras carga perfil:
  if (loading) {
    return <p className="p-4 text-gray-300">Cargando perfil…</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { displayName });
    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-mango-accent">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-200">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-200">Nombre para mostrar</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-200">Rol</label>
          <input
            type="text"
            value={role}
            disabled
            className="mt-1 w-full p-2 rounded bg-gray-700 text-gray-400 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-full"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
