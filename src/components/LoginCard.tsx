import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { UserConfig } from '../types';
import { USERS_CONFIG } from '../data/users';
import { playGentleSparkle } from '../utils/audio';
import { musicManager } from '../utils/musicManager';

interface LoginCardProps {
  onLoginSuccess: (user: UserConfig) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const performLogin = (targetUser: UserConfig) => {
    // Prepara el audio bajo el gesto de usuario (sin reproducir sonido aún)
    musicManager.prepareUserAudio(targetUser.username);
    playGentleSparkle();

    setIsExiting(true);
    setTimeout(() => {
      onLoginSuccess(targetUser);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);

    const foundUser = USERS_CONFIG.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || (u.username.toLowerCase() === 'vane' && cleanUser === 'naty')) &&
        u.password.toLowerCase() === cleanPass.toLowerCase()
    );

    if (foundUser) {
      performLogin(foundUser);
    } else {
      setTimeout(() => {
        setErrorMessage('Usuario o contraseña incorrectos. Por favor, verifica tus datos.');
        setIsLoading(false);
      }, 250);
    }
  };

  return (
    <div
      id="login-card-container"
      className={`relative z-20 w-full max-w-md mx-auto px-3 sm:px-6 py-6 sm:py-8 transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-90 -translate-y-8 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      {/* Contenedor Glassmorphism Principal */}
      <div className="glass-panel golden-card-glow rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Adorno sutil de luz dorada superior */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-yellow-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Cabecera del formulario */}
        <div className="text-center mb-6 sm:mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 mb-3 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7 sm:w-8 h-8 text-amber-950 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Flores Amarillas
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 mt-1 font-light">
            Inicia sesión para ver tu flor
          </p>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1.5 pl-1"
            >
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-300/60">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username-input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-slate-900/60 border border-amber-500/25 text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1.5 pl-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-300/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-11 py-3 min-h-[48px] rounded-xl bg-slate-900/60 border border-amber-500/25 text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-amber-300/60 hover:text-amber-300 focus:outline-none min-h-[44px] min-w-[44px] justify-center cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-6 min-h-[48px] rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Accediendo a tu flor...</span>
              </span>
            ) : (
              <>
                <span>Ingresar a mi dedicatoria</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
