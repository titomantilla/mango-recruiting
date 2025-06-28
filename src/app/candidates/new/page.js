'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import CandidateForm from '../../../components/CandidateForm';

export default function NewCandidatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-mango-accent">Nuevo candidato</h1>
      <CandidateForm onSave={() => { /* CandidateForm ya redirige a /candidates */ }} />
    </div>
  );
}
