import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Sparkles, Volume2, VolumeX, Flower2, Mail, RotateCcw, Music } from 'lucide-react';
import { UserConfig, AnimationType } from '../types';
import { playFlowerChime, playGentleSparkle } from '../utils/audio';
import { musicManager, userHasMusic, getSongForUser } from '../utils/musicManager';
import { HeroBouquet } from './HeroBouquet';

interface MainScreenProps {
  user: UserConfig;
  activeAnimation: AnimationType;
  onLogout: () => void;
  onOpenCodeModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

type SequenceStage = 'bouquet' | 'hiding' | 'letter';

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  user,
  onLogout,
  soundEnabled,
  onToggleSound
}) => {
  // Secuencia: 'bouquet' (Fase 1) -> 'hiding' (Fase 2) -> 'letter' (Fase 3)
  const [sequenceStage, setSequenceStage] = useState<SequenceStage>('bouquet');
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const nextParticleId = useRef(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const userSong = getSongForUser(user.username);
  const hasMusic = userHasMusic(user.username);

  // Sincronización continua con el interruptor general de sonido
  useEffect(() => {
    musicManager.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Función universal para iniciar o reiniciar la secuencia
  const runSequence = () => {
    // Detener música previa para que solo suene al salir la carta
    musicManager.stop();

    // Limpiar temporizadores previos
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // FASE 1: El Ramo es el protagonista inicial (sin música de fondo)
    setSequenceStage('bouquet');
    if (soundEnabled) {
      playFlowerChime(user.username === 'leslie' ? 1.15 : user.username === 'vane' ? 1.2 : 1.05);
    }

    // FASE 2: Concluida la animación del ramo (2.8s), se oculta/desvanece suavemente
    const t1 = setTimeout(() => {
      setSequenceStage('hiding');

      // FASE 3: Solo cuando el ramo se ha escondido por completo (+850ms), aparece la Carta
      const t2 = setTimeout(() => {
        setSequenceStage('letter');
        if (soundEnabled) {
          playGentleSparkle();
        }

        // La canción empieza automáticamente EXACTAMENTE al momento de salir la carta
        if (hasMusic && soundEnabled) {
          musicManager.playUserSong(user.username);
        }
      }, 850);
      timeoutsRef.current.push(t2);
    }, 2800);
    timeoutsRef.current.push(t1);
  };

  useEffect(() => {
    runSequence();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      musicManager.stop();
    };
  }, [user.username]);

  return (
    <div
      id="main-welcome-screen"
      className="relative z-20 min-h-screen w-full flex flex-col justify-between p-3 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 select-none will-change-transform"
    >
      {/* PARTÍCULAS SUTILES AL DISPARAR DESTELOS */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="fixed pointer-events-none rounded-full animate-fade-star z-50 will-change-transform"
          style={{
            left: `${sp.x}px`,
            top: `${sp.y}px`,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            backgroundColor: sp.color,
            boxShadow: `0 0 6px ${sp.color}`
          }}
        />
      ))}

      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pointer-events-auto gap-2">
        {/* Identificador de Usuario */}
        <div className="flex items-center gap-2 sm:gap-3 glass-panel-subtle px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-lg border border-amber-400/25 min-h-[44px]">
          <span className="text-xl sm:text-2xl shrink-0" role="img" aria-label="avatar">
            {user.avatarSeed || '💐'}
          </span>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-amber-300/80 uppercase tracking-wider font-semibold block">
              Para ti
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-wide truncate block">
              {user.displayName}
            </span>
          </div>
        </div>

        {/* Controles de Sonido y Salida */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="main-sound-toggle-btn"
            onClick={onToggleSound}
            className="w-11 h-11 rounded-2xl glass-panel-subtle hover:bg-amber-400/20 active:bg-amber-400/30 flex items-center justify-center text-amber-300 hover:text-white transition-all shadow-md active:scale-95 border border-amber-400/25 cursor-pointer"
            title={soundEnabled ? 'Silenciar audio' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-amber-400/60" />}
          </button>

          <button
            type="button"
            id="main-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-2xl glass-panel-subtle hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-200 hover:text-rose-100 transition-all shadow-md active:scale-95 border border-rose-500/25 text-xs sm:text-sm font-semibold cursor-pointer"
            title="Cerrar dedicatoria y volver al inicio"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL PRINCIPAL: RAMO (FASE 1 & 2) -> CARTA CON MÚSICA AUTOMÁTICA (FASE 3) */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-6 sm:py-8 pointer-events-auto">
        {/* FASE 1 & FASE 2: EL RAMO DE FLORES AMARILLAS */}
        {(sequenceStage === 'bouquet' || sequenceStage === 'hiding') && (
          <div
            id="hero-bouquet-container"
            className={`transition-all duration-700 flex flex-col items-center will-change-transform ${
              sequenceStage === 'hiding'
                ? 'animate-bouquet-fade-out pointer-events-none'
                : 'animate-bouquet-bloom'
            }`}
          >
            <HeroBouquet user={user} interactive={true} />

            {/* Indicador sutil de fase 1 */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-xs font-medium text-amber-300/80 bg-slate-950/75 px-3 py-1 rounded-full border border-amber-400/25 shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {sequenceStage === 'bouquet'
                    ? `Floreciendo ramo especial para ${user.displayName}...`
                    : `Preparando tu dedicatoria...`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FASE 3: LA CARTA CON SU MENSAJE Y LA MÚSICA AUTOMÁTICA */}
        {sequenceStage === 'letter' && (
          <div
            id="dedication-letter-card"
            className="w-full max-w-2xl glass-panel golden-card-glow rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden border border-amber-400/35 text-center animate-letter-unfold will-change-transform"
          >
            {/* Adorno superior dorado de pergamino */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-1.5 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent" />
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

            {/* Sello de la Carta */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-4 shadow-sm">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Carta de Carlos</span>
            </div>

            {/* Saludo Principal */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug mb-3">
              ¡Para ti,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                {user.displayName}
              </span>
              !
            </h2>

            {/* Línea divisoria ornamental */}
            <div className="flex items-center justify-center gap-2 my-2 opacity-80">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-400/60" />
              <Flower2 className="w-4 h-4 text-amber-400" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-400/60" />
            </div>

            {/* Contenido de la Carta / Mensaje personalizado */}
            <div className="my-4 sm:my-6 p-4 sm:p-7 rounded-2xl bg-slate-900/60 border border-amber-400/25 shadow-inner">
              <blockquote className="text-sm sm:text-base md:text-lg text-amber-100/95 font-serif italic leading-relaxed relative whitespace-pre-line text-left">
                <span className="text-3xl sm:text-4xl text-amber-400/40 font-serif absolute -top-4 -left-2">“</span>
                {user.customMessage}
                <span className="text-3xl sm:text-4xl text-amber-400/40 font-serif absolute -bottom-6 -right-2">”</span>
              </blockquote>
            </div>

            {/* BANNER DE MÚSICA CON EL DISEÑO EXACTO SOLICITADO */}
            {hasMusic && userSong && (
              <div
                id="current-music-banner"
                className="my-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#231507]/85 border border-[#b48324]/75 shadow-lg shadow-amber-950/40 flex items-center justify-between gap-3 text-left pointer-events-none select-none backdrop-blur-sm"
              >
                {/* Lado Izquierdo: Icono + Título + Píldora de Artista */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-wrap sm:flex-nowrap">
                  {/* Caja cuadrada con esquinas redondeadas para el icono de música */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#3c250c] border border-[#7a4c13] flex items-center justify-center shrink-0 shadow-inner">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>

                  {/* Nombre de la canción en negrita */}
                  <span className="font-bold text-[#fef3c7] text-sm sm:text-base tracking-tight truncate">
                    {userSong.title}
                  </span>

                  {/* Píldora del Artista */}
                  <span className="px-2.5 py-0.5 rounded-full border border-[#966318] bg-[#3a250f]/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 shrink-0">
                    {userSong.artist}
                  </span>
                </div>

                {/* Lado Derecho: Ecualizador animado en dorado */}
                <div className="flex items-end gap-1 h-4 pr-1 shrink-0" aria-hidden="true">
                  <span className="w-1 bg-amber-400/80 rounded-full h-1.5 animate-[pulse_0.9s_ease-in-out_infinite]" />
                  <span className="w-1 bg-amber-400 rounded-full h-3.5 animate-[pulse_0.6s_ease-in-out_infinite_0.15s]" />
                  <span className="w-1 bg-amber-400 rounded-full h-2.5 animate-[pulse_0.75s_ease-in-out_infinite_0.35s]" />
                  <span className="w-1 bg-amber-400/80 rounded-full h-1 animate-[pulse_0.55s_ease-in-out_infinite_0.1s]" />
                </div>
              </div>
            )}

            <div className="text-xs sm:text-sm text-amber-300/85 font-serif tracking-wide italic mt-2 mb-6">
              — Que la luz y calidez de este día te acompañen siempre en cada paso
            </div>

            {/* Acciones de la Carta */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-amber-500/20">
              <button
                type="button"
                id="replay-bouquet-btn"
                onClick={runSequence}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-400/20 hover:from-amber-400/30 hover:to-yellow-400/30 text-amber-200 hover:text-white border border-amber-400/40 hover:border-amber-400/70 text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                title="Volver a ver la floración del ramo"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Volver a ver el ramo</span>
              </button>

              <button
                type="button"
                id="sparkle-tap-btn"
                onClick={() => {
                  if (soundEnabled) playGentleSparkle();
                  const cx = window.innerWidth / 2;
                  const cy = window.innerHeight / 2;
                  const newSp: SparkleParticle[] = Array.from({ length: 8 }, (_, i) => ({
                    id: nextParticleId.current++,
                    x: cx + (Math.random() - 0.5) * 160,
                    y: cy + (Math.random() - 0.5) * 120,
                    size: Math.random() * 6 + 3,
                    color: ['#fef08a', '#fde047', '#f59e0b', '#ffffff'][i % 4]
                  }));
                  setSparkles((prev) => [...prev.slice(-10), ...newSp]);
                  setTimeout(() => {
                    setSparkles((prev) => prev.filter((s) => !newSp.some((n) => n.id === s.id)));
                  }, 650);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-slate-900/60 hover:bg-amber-500/20 text-amber-300 hover:text-amber-100 border border-amber-400/30 text-xs sm:text-sm font-medium transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Esparcir destellos</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* PIE DE PÁGINA ELEGANTE Y DISCRETO */}
      <footer className="w-full max-w-2xl mx-auto pointer-events-none pb-2 text-center">
        <p className="text-[11px] text-amber-200/50 font-light tracking-wider">
          🌻 Flores Amarillas · Un detalle especial para ti
        </p>
      </footer>
    </div>
  );
};
