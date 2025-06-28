// src/components/Navbar.js
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/auth';
import { usePathname } from 'next/navigation';
import mangoIcon from '../img/mango-icon.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  const isLoginPage = path === '/login';

  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center justify-between">
      {/* Menú izquierdo: oculto en /login */}
      {!isLoginPage && (
        <ul className="flex space-x-4">
          <li>
            <Link href="/">&#x1F3E0;</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/positions">Posiciones</Link>
              </li>
              <li>
                <Link href="/candidates">Candidatos</Link>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login">Login</Link>
            </li>
          )}
        </ul>
      )}

      {/* Logo centrado */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image
            src={mangoIcon}
            alt="Mango Recruiting"
            className="inline-block"
            height={32}
            width={32}
          />
        </Link>
      </div>

      {/* Menú derecho: oculto en /login */}
      {!isLoginPage && user && (
        <div className="flex items-center space-x-4">
          <Link href="/profile" className="hover:underline">
            Mi perfil
          </Link>
          <button onClick={logout} className="hover:underline">
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}
