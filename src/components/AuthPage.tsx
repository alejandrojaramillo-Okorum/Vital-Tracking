import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
}

export default function AuthPage({ onSignIn, onSignUp }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isLogin) {
      const { error } = await onSignIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await onSignUp(email, password, fullName);
      if (error) setError(error.message);
      else setSuccess('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 
                    dark:from-gray-900 dark:to-gray-800 
                    flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-red-500" size={36} fill="currentColor" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">VitalTrack</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Tu monitor de salud personal</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              isLogin 
                ? 'bg-white dark:bg-gray-600 text-red-500 shadow' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              !isLogin 
                ? 'bg-white dark:bg-gray-600 text-red-500 shadow' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre (solo registro) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 
                           rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 
                         rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 
                         rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 
                           text-red-600 dark:text-red-400 rounded-xl p-3 text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 
                           text-green-600 dark:text-green-400 rounded-xl p-3 text-sm">
              ✅ {success}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 
                       text-white font-bold rounded-xl shadow-lg 
                       hover:from-red-600 hover:to-pink-600 
                       disabled:opacity-60 transition-all transform hover:scale-[1.02]"
          >
            {loading ? '⏳ Procesando...' : isLogin ? '🔐 Iniciar Sesión' : '🚀 Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
