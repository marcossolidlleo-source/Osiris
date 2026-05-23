import { useState } from 'react';

// ⚠️ REEMPLAZA ESTAS URLS CON LAS QUE TE DA N8N (Production o Test URL)
const N8N_LOGIN_URL = 'https://n8ntfp.duckdns.org/webhook-test/login';
const N8N_REGISTER_URL = 'https://n8ntfp.duckdns.org/webhook-test/register';

interface Props {
  onLoginSuccess: (userId: string, email: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 🔐 MANEJO DEL LOGIN CON N8N
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(N8N_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Guardamos el token de sesión devuelto por n8n por si lo necesitas
      if (data.token) {
        localStorage.setItem('osiris_token', data.token);
      }

      // Informamos a la App que el login fue exitoso enviando el ID de Supabase
      if (data.userId) {
        onLoginSuccess(data.userId, email);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor de autenticación');
    } finally {
      setLoading(false);
    }
  };

  // 📝 MANEJO DEL REGISTRO CON N8N
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!fullName || !email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(N8N_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al registrar el usuario');
        setLoading(false);
        return;
      }

      setSuccessMessage('Registro exitoso. Por favor inicia sesión.');
      setTimeout(() => {
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setFullName('');
        setSuccessMessage('');
      }, 2000);

    } catch (err) {
      setError('Error de red al intentar registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pt-8 pb-8">
        <header className="text-center mb-12 mt-8">
          <div className="mx-auto mb-4 w-32 h-32 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm">
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
          <h1 className="text-5xl tracking-widest text-[#1b6139] uppercase drop-shadow-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            OSIRIS
          </h1>
          <p className="text-gray-600 text-sm tracking-wide mt-2">Crear Nueva Cuenta</p>
        </header>

        <main className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {successMessage}
            </div>
          )}
          <div className="card bg-white p-8 mb-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setError(''); }}
                  className="input-field w-full px-4 py-3"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="input-field w-full px-4 py-3"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="input-field w-full px-4 py-3"
                    placeholder="Mínimo 6 caracteres"
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
              </div>
              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-white font-semibold text-lg disabled:opacity-60"
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </form>
          </div>

          <button
            onClick={() => { setIsRegistering(false); setError(''); setSuccessMessage(''); }}
            className="text-center text-green-800 font-medium hover:underline"
          >
            Volver al Login
          </button>
        </main>

        <footer className="text-center mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">© 2026 Osiris. Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  }

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
        <h1 className="text-5xl tracking-widest text-[#1b6139] uppercase drop-shadow-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          OSIRIS
        </h1>
        <p className="text-gray-600 text-sm tracking-wide mt-2">Control IoT en tiempo real</p>
      </header>

      <main className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="card bg-white p-8 mb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="input-field w-full px-4 py-3 text-lg"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="input-field w-full px-4 py-3 text-lg"
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
            </div>
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-white font-semibold text-lg disabled:opacity-60"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">¿No tienes cuenta aún?</p>
          <button
            onClick={() => setIsRegistering(true)}
            className="text-green-800 font-medium hover:underline"
          >
            Crea una cuenta aquí
          </button>
        </div>
      </main>

      <footer className="text-center mt-12 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">© 2026 Osiris. Todos los derechos reservados.</p>
        <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
      </footer>
    </div>
  );
}