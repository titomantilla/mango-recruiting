// src/app/layout.js
import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../lib/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
