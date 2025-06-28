'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Si ya está logueado, redirige inmediatamente
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/positions');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // Tras login exitoso, router.push también (por si acaso)
      router.push('/positions');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  // Mientras esté comprobando si hay sesión activa
  if (authLoading) {
    return <p className="p-4 text-gray-300">Verificando usuario…</p>;
  }

  // Si ya hay un user válido, devolvemos null porque el useEffect redirigiría
  if (user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-mango-accent text-center">Mango Recruiting</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block text-sm text-gray-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-200">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
     <button
  type="submit"
  className="w-full bg-gradient-to-r from-green-300 to-yellow-300 hover:opacity-90 text-gray-900 font-bold py-2 px-4 rounded"
>
  Entrar
</button>

      </form>
    </div>
  );
}
