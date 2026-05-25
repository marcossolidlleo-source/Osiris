import { useState } from 'react';
import { CREDENTIALS } from '../data/crops';
import { signIn } from '../services/supabase';

interface Props {
  onLogin: (role: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Llamamos a tu función mágica con el email y password reales de la pantalla
      const result = await signIn(email.trim(), password.trim());

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.user) {
        setPassword('');
        const userObj = JSON.parse(localStorage.getItem('osiris_user') || '{}');
        const userRole = userObj.rol || 'usuario'; 

        onLogin(userRole);
      }

    } catch (err) {
      setError('Error inesperado al conectar con el servidor de Osiris');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-8 pb-8">
      <header className="text-center mb-12 mt-8">
        <div className="mx-auto mb-4 w-32 h-32 flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm hover:scale-105 transition-transform duration-500">
            <path d="M 40 60 Q 100 35 160 60 Q 100 43 40 60 Z" fill="#1b6139" />
            <path d="M 100 70 C 88 95, 92 115, 100 125 C 108 115, 112 95, 100 70 Z" fill="#1b6139" />
            <path d="M 95 120 C 75 105, 65 90, 70 80 C 85 90, 95 105, 95 120 Z" fill="#1b6139" />
            <path d="M 105 120 C 125 105, 135 90, 130 80 C 115 90, 105 105, 105 120 Z" fill="#1b6139" />
            <path d="M 95 130 C 70 130, 55 125, 50 135 C 70 145, 85 140, 95 130 Z" fill="#1b6139" />
            <path d="M 105 130 C 130 130, 145 125, 150 135 C 130 145, 115 140, 105 130 Z" fill="#1b6139" />
            <path d="M 98 125 C 80 155, 85 185, 105 185 C 120 185, 125 160, 110 145 C 100 135, 98 125, 98 125 Z" fill="#1b6139" />
            <circle cx="108" cy="165" r="5" fill="#f8fafc" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1 mb-2">
          <h1 className="text-5xl tracking-widest text-[#1b6139] uppercase drop-shadow-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            OSIRIS
          </h1>
          <p className="text-gray-600 text-sm tracking-wide">Osiris: Control IoT en tiempo real</p>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="card bg-white p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className={`input-field w-full px-4 py-3 text-lg ${error ? 'border-red-500' : ''}`}
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-800"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-white font-semibold text-lg">
              <i className="fas fa-sign-in-alt mr-2" />Ingresar al Sistema
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">¿Problemas para acceder?</p>
          <button onClick={() => setShowContact(true)} className="text-green-800 font-medium hover:underline">
            <i className="fas fa-headset mr-2" />Contactar Soporte
          </button>
        </div>
      </main>

      <footer className="text-center mt-12 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">© 2026 Osiris. Todos los derechos reservados.</p>
        <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
      </footer>

      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card bg-white p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-800">Contactar Soporte</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-green-800">
                <i className="fas fa-times text-xl" />
              </button>
            </div>
            <p className="text-gray-500 mb-6">Para asistencia técnica, contacta a nuestro equipo de soporte:</p>
            <div className="space-y-4">
              <div className="flex items-center"><i className="fas fa-envelope text-green-800 mr-3" /><div><p className="font-medium">Correo electrónico</p><p className="text-gray-500">agrisyncsif@gmail.com</p></div></div>
              <div className="flex items-center"><i className="fas fa-phone text-green-800 mr-3" /><div><p className="font-medium">Teléfono</p><p className="text-gray-500">+1 (555) 123-4567</p></div></div>
              <div className="flex items-center"><i className="fas fa-clock text-green-800 mr-3" /><div><p className="font-medium">Horario de atención</p><p className="text-gray-500">Lun-Vie: 8:00 - 18:00</p></div></div>
            </div>
            <button onClick={() => setShowContact(false)} className="btn-primary w-full py-3 text-white font-semibold mt-6">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
