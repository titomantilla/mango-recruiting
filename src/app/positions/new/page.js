'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import PositionForm from '../../../components/PositionForm';

export default function NewPositionPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Protegemos la ruta
  if (user === null) {
    router.push('/login');
    return null;
  }

  const handleAddAndRedirect = async (newPos) => {
    // PositionForm ya habrá agregado a Firestore y nos pasa el objeto nuevo
    // Aquí solo redirigimos al listado
    router.push('/positions');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-mango-accent">
        Crear nueva posición
      </h1>
      <PositionForm onAdd={handleAddAndRedirect} />
    </div>
  );
}
