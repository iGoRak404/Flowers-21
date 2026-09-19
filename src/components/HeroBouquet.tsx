import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { playFlowerChime, playGentleSparkle } from '../utils/audio';
import { UserConfig } from '../types';

interface HeroBouquetProps {
  user: UserConfig;
  interactive?: boolean;
}

export const HeroBouquet: React.FC<HeroBouquetProps> = ({ user, interactive = true }) => {
  const [pulseRings, setPulseRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparkleStars, setSparkleStars] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [clickCount, setClickCount] = useState<number>(0);

  const isLeslie = user.username.toLowerCase() === 'leslie';
  const isAshlie = user.username.toLowerCase() === 'ashlie';
  const isAnge = user.username.toLowerCase() === 'ange';
  const isKeisy = user.username.toLowerCase() === 'keisy';
  const isNaty = user.username.toLowerCase() === 'naty';
  const isNata = user.username.toLowerCase() === 'nata';

  const hasButterfly = isAnge || isKeisy || isLeslie || isNaty || isNata;
  const hasStar = isAshlie || isKeisy || isNaty || isNata || isLeslie || isAnge;

  // Sonido armonioso de campanitas al florecer
  useEffect(() => {
    const timer = setTimeout(() => {
      playFlowerChime(isLeslie ? 1.15 : isAshlie ? 0.95 : isAnge ? 1.08 : 1.0);
    }, 450);
    return () => clearTimeout(timer);
  }, [user.username, isLeslie, isAshlie, isAnge]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    playGentleSparkle();
    setClickCount((c) => c + 1);

    // Ondas de luz concéntricas
    const newRing = { id: Date.now() + Math.random(), x: clickX, y: clickY };
    setPulseRings((prev) => [...prev.slice(-3), newRing]);

    // Ráfaga de estrellas y destellos dorados
    const colors = isLeslie
      ? ['#fef08a', '#fde047', '#f59e0b', '#fbbf24', '#ffffff']
      : isAshlie
      ? ['#fde047', '#38bdf8', '#fbbf24', '#ffffff', '#fef9c3']
      : ['#fef08a', '#f59e0b', '#fbbf24', '#ffffff'];

    const newStars = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: clickX + (-40 + Math.random() * 80),
      y: clickY + (-40 + Math.random() * 80),
      color: colors[i % colors.length]
    }));
    setSparkleStars((prev) => [...prev.slice(-15), ...newStars]);
  };

  return (
    <div
      id="hero-bouquet-stage"
      className="relative z-30 flex flex-col items-center justify-center select-none"
    >
      {/* Halo ambiental dorado detrás del ramo */}
      <div
        className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          isLeslie
            ? 'bg-amber-400/35 shadow-[0_0_100px_rgba(251,191,36,0.5)]'
            : isAshlie
            ? 'bg-yellow-300/30 shadow-[0_0_100px_rgba(253,224,71,0.45)]'
            : isAnge
            ? 'bg-amber-300/35 shadow-[0_0_110px_rgba(252,211,77,0.55)]'
            : 'bg-amber-500/25 shadow-[0_0_80px_rgba(245,158,11,0.4)]'
        }`}
      />

      {/* Partículas de destellos al interactuar */}
      {pulseRings.map((ring) => (
        <span
          key={ring.id}
          className="fixed rounded-full border-2 border-yellow-300/90 animate-ping pointer-events-none z-40"
          style={{
            left: ring.x - 45,
            top: ring.y - 45,
            width: 90,
            height: 90
          }}
        />
      ))}

      {sparkleStars.map((s) => (
        <span
          key={s.id}
          className="fixed w-2.5 h-2.5 rounded-full pointer-events-none z-40 animate-fade-star"
          style={{
            left: s.x,
            top: s.y,
            backgroundColor: s.color,
            boxShadow: `0 0 12px ${s.color}`
          }}
        />
      ))}

      {/* CONTENEDOR DEL RAMO CON ANIMACIÓN DE ENTRADA Y FLOTACIÓN SEGÚN EL PERFIL */}
      <div
        className={`relative cursor-pointer group transition-transform duration-500 active:scale-95 animate-bouquet-bloom ${
          isAshlie ? 'animate-bouquet-float' : isLeslie ? 'animate-stem-sway' : 'animate-bouquet-glow'
        }`}
        onPointerDown={handlePointerDown}
        title="¡Toca el ramo para desatar un destello mágico de flores!"
      >
        <svg
          key={clickCount}
          viewBox="0 0 520 620"
          className="w-[260px] h-[320px] sm:w-[340px] sm:h-[420px] md:w-[400px] md:h-[490px] drop-shadow-[0_20px_45px_rgba(245,158,11,0.5)] transition-all duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Gradientes dorados y soleados para pétalos */}
            <linearGradient id="heroGoldPetalA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#fde047" />
              <stop offset="90%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="heroGoldPetalB" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="75%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <radialGradient id="heroFlowerCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="40%" stopColor="#78350f" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="95%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fef08a" />
            </radialGradient>

            <linearGradient id="heroStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14532d" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="heroRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <filter id="heroGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. TALLOS ATADOS Y LAZO DORADO EN PRIMER PLANO */}
          <g id="bouquet-stems-and-ribbon">
            {/* Tallos cruzados del ramo */}
            <path d="M 230 360 Q 210 460 190 545" stroke="url(#heroStemGrad)" strokeWidth="11" strokeLinecap="round" />
            <path d="M 245 360 Q 240 460 230 555" stroke="url(#heroStemGrad)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 260 360 Q 260 460 260 560" stroke="url(#heroStemGrad)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 275 360 Q 280 460 290 555" stroke="url(#heroStemGrad)" strokeWidth="11" strokeLinecap="round" />
            <path d="M 290 360 Q 315 460 330 545" stroke="url(#heroStemGrad)" strokeWidth="11" strokeLinecap="round" />

            {/* Hojas del ramo */}
            <path d="M 200 370 C 130 370 100 320 125 275 C 165 305 200 340 200 370 Z" fill="#15803d" opacity="0.95" />
            <path d="M 320 370 C 390 370 420 320 395 275 C 355 305 320 340 320 370 Z" fill="#16a34a" opacity="0.95" />
            <path d="M 260 340 C 260 260 325 215 345 205 C 335 255 295 310 260 340 Z" fill="#22c55e" opacity="0.9" />
            <path d="M 260 340 C 260 260 195 215 175 205 C 185 255 225 310 260 340 Z" fill="#15803d" opacity="0.9" />

            {/* Gran Lazo de Satín Dorado */}
            <g transform="translate(260, 420)">
              <path d="M -15 20 Q -45 80 -65 145 Q -40 125 -18 140 Q -5 70 -5 20 Z" fill="url(#heroRibbonGrad)" opacity="0.98" />
              <path d="M 15 20 Q 45 80 65 145 Q 40 125 18 140 Q 5 70 5 20 Z" fill="url(#heroRibbonGrad)" opacity="0.98" />
              <ellipse cx="-45" cy="0" rx="40" ry="24" transform="rotate(-20 -45 0)" fill="url(#heroRibbonGrad)" stroke="#fef08a" strokeWidth="1.8" />
              <ellipse cx="45" cy="0" rx="40" ry="24" transform="rotate(20 45 0)" fill="url(#heroRibbonGrad)" stroke="#fef08a" strokeWidth="1.8" />
              <circle cx="0" cy="0" r="18" fill="url(#heroRibbonGrad)" stroke="#fef08a" strokeWidth="2.5" filter="url(#heroGlowFilter)" />
              <circle cx="0" cy="0" r="9" fill="#fef08a" />
            </g>
          </g>

          {/* 2. FLORES AMARILLAS RADIANTE */}

          {/* FLOR 1: Izquierda (Girasol mediano abierto) */}
          <g transform="translate(180, 220)">
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`f1-${i}`} transform={`rotate(${(360 / 12) * i})`}>
                <path d="M 0 0 C -12 -25 -14 -65 0 -85 C 14 -65 12 -25 0 0 Z" fill="url(#heroGoldPetalA)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="26" fill="url(#heroFlowerCore)" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="0" cy="0" r="13" fill="#fef08a" opacity="0.8" />
          </g>

          {/* FLOR 2: Derecha (Rosa dorada abierta) */}
          <g transform="translate(340, 220)">
            {Array.from({ length: 14 }).map((_, i) => (
              <g key={`f2-${i}`} transform={`rotate(${(360 / 14) * i})`}>
                <path d="M 0 0 C -14 -20 -16 -60 0 -80 C 16 -60 14 -20 0 0 Z" fill="url(#heroGoldPetalB)" stroke="#d97706" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="25" fill="url(#heroFlowerCore)" stroke="#d97706" strokeWidth="2" />
            <circle cx="0" cy="0" r="11" fill="#fef08a" opacity="0.8" />
          </g>

          {/* FLOR 3: Superior Izquierda */}
          <g transform="translate(210, 130)">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`f3-${i}`} transform={`rotate(${(360 / 10) * i})`}>
                <path d="M 0 0 C -12 -15 -12 -45 0 -60 C 12 -45 12 -15 0 0 Z" fill="url(#heroGoldPetalA)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="19" fill="url(#heroFlowerCore)" />
          </g>

          {/* FLOR 4: Superior Derecha */}
          <g transform="translate(310, 130)">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`f4-${i}`} transform={`rotate(${(360 / 10) * i})`}>
                <path d="M 0 0 C -12 -15 -12 -45 0 -60 C 12 -45 12 -15 0 0 Z" fill="url(#heroGoldPetalB)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="19" fill="url(#heroFlowerCore)" />
          </g>

          {/* FLOR 5: FLOR MAJESTUOSA CENTRAL (Gran Rosa Imperial del Sol) */}
          <g transform="translate(260, 240)">
            {/* Capa de pétalos exterior */}
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={`fc-out-${i}`} transform={`rotate(${(360 / 16) * i})`}>
                <path d="M 0 0 C -18 -35 -20 -95 0 -115 C 20 -95 18 -35 0 0 Z" fill="url(#heroGoldPetalA)" stroke="#f59e0b" strokeWidth="1.3" />
              </g>
            ))}
            {/* Capa de pétalos intermedia */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`fc-mid-${i}`} transform={`rotate(${(360 / 12) * i + 15})`}>
                <path d="M 0 0 C -14 -25 -16 -70 0 -88 C 16 -70 14 -25 0 0 Z" fill="url(#heroGoldPetalB)" stroke="#d97706" strokeWidth="1.2" />
              </g>
            ))}
            {/* Capa de pétalos interior */}
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={`fc-in-${i}`} transform={`rotate(${(360 / 8) * i + 30})`}>
                <path d="M 0 0 C -10 -15 -12 -45 0 -58 C 12 -45 10 -15 0 0 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
              </g>
            ))}
            {/* Centro de la flor */}
            <circle cx="0" cy="0" r="33" fill="url(#heroFlowerCore)" stroke="#fef08a" strokeWidth="3" filter="url(#heroGlowFilter)" />
            <circle cx="0" cy="0" r="16" fill="#fef08a" />
          </g>

          {/* Pequeños capullos luminosos */}
          <circle cx="160" cy="160" r="7.5" fill="#ffffff" opacity="0.95" filter="url(#heroGlowFilter)" />
          <circle cx="360" cy="160" r="7.5" fill="#ffffff" opacity="0.95" filter="url(#heroGlowFilter)" />
          <circle cx="260" cy="90" r="9" fill="#fef08a" opacity="0.95" filter="url(#heroGlowFilter)" />
          <circle cx="130" cy="240" r="6" fill="#ffffff" opacity="0.9" />
          <circle cx="390" cy="240" r="6" fill="#ffffff" opacity="0.9" />
        </svg>

        {/* Detalle mágico especial: Mariposa dorada posada con sutileza */}
        {hasButterfly && (
          <div className="absolute -top-3 right-6 sm:-top-5 sm:right-10 pointer-events-none transition-transform duration-700 animate-[bounce_3s_ease-in-out_infinite]">
            <span
              className="text-2xl sm:text-3xl filter drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] inline-block transform -rotate-12 transition-transform duration-300 group-hover:scale-125"
              title="Mariposa dorada"
            >
              🦋
            </span>
          </div>
        )}

        {/* Detalle mágico especial: Estrella celestial resplandeciente */}
        {hasStar && (
          <div className={`absolute ${hasButterfly ? '-top-3 left-6 sm:-top-5 sm:left-10' : '-top-3 right-6 sm:-top-5 sm:right-10'} pointer-events-none transition-transform duration-700 animate-pulse`}>
            <span
              className="text-2xl sm:text-3xl filter drop-shadow-[0_0_16px_rgba(56,189,248,0.95)] inline-block transform rotate-6 transition-transform duration-300 group-hover:scale-125"
              title="Estrella mágica resplandeciente"
            >
              ✨
            </span>
          </div>
        )}

        {/* Pequeña etiqueta de interacción interactiva */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-amber-300/40 rounded-full px-4 py-1.5 text-xs text-amber-200 flex items-center gap-1.5 shadow-lg group-hover:border-amber-300 group-hover:bg-slate-900 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="font-medium">Toca para iluminar el ramo</span>
        </div>
      </div>
    </div>
  );
};
