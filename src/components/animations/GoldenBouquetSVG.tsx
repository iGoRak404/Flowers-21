import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { playFlowerChime, playGentleSparkle } from '../../utils/audio';

interface GoldenBouquetSVGProps {
  interactive?: boolean;
}

interface Firefly {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
}

export const GoldenBouquetSVG: React.FC<GoldenBouquetSVGProps> = ({ interactive = true }) => {
  const [pulseRings, setPulseRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparkleStars, setSparkleStars] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [swayKey, setSwayKey] = useState<number>(0);

  const handleInteract = (clientX: number, clientY: number) => {
    if (!interactive) return;
    playGentleSparkle();

    const newRing = { id: Date.now() + Math.random(), x: clientX, y: clientY };
    setPulseRings((prev) => [...prev.slice(-4), newRing]);

    const colors = ['#fef08a', '#fde047', '#f59e0b', '#fbbf24', '#ffffff'];
    const newStars = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: clientX + (-30 + Math.random() * 60),
      y: clientY + (-30 + Math.random() * 60),
      color: colors[i % colors.length]
    }));
    setSparkleStars((prev) => [...prev.slice(-16), ...newStars]);
    setSwayKey((k) => k + 1);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    handleInteract(e.clientX, e.clientY);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      playFlowerChime(1.1);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="golden-bouquet-container"
      className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Resplandor ambiental de fondo */}
      <div className="absolute w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] rounded-full bg-radial from-amber-400/25 via-yellow-500/10 to-transparent blur-3xl animate-pulse pointer-events-none" />

      {/* Luciérnagas doradas flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={`firefly-${i}`}
            className="absolute rounded-full bg-yellow-200 shadow-[0_0_14px_#fde047] animate-float-firefly"
            style={{
              width: `${3 + (i % 4)}px`,
              height: `${3 + (i % 4)}px`,
              left: `${8 + (i * 3.7) % 84}%`,
              top: `${10 + (i * 7.3) % 80}%`,
              opacity: 0.3 + ((i % 5) * 0.15),
              animationDuration: `${4 + (i % 5)}s`,
              animationDelay: `${(i * 0.35)}s`
            }}
          />
        ))}
      </div>

      {/* Anillos interactivos al hacer clic o tocar */}
      {pulseRings.map((ring) => (
        <span
          key={ring.id}
          className="fixed rounded-full border-2 border-yellow-300/80 animate-ping pointer-events-none z-20"
          style={{
            left: ring.x - 40,
            top: ring.y - 40,
            width: 80,
            height: 80
          }}
        />
      ))}

      {/* Estrellitas al hacer clic */}
      {sparkleStars.map((s) => (
        <span
          key={s.id}
          className="fixed w-2 h-2 rounded-full pointer-events-none z-20 animate-fade-star"
          style={{
            left: s.x,
            top: s.y,
            backgroundColor: s.color,
            boxShadow: `0 0 10px ${s.color}`
          }}
        />
      ))}

      {/* RAMO PRINCIPAL SVG VECTORIAL DE ALTA RESOLUCIÓN */}
      <div
        className="relative pointer-events-auto cursor-pointer group select-none transition-transform duration-500 ease-out flex items-center justify-center"
        onPointerDown={handlePointerDown}
        title="¡Toca el ramo para desatar chispas de luz!"
      >
        <svg
          key={swayKey}
          viewBox="0 0 520 620"
          className="w-[290px] h-[360px] sm:w-[380px] sm:h-[480px] md:w-[460px] md:h-[580px] drop-shadow-[0_15px_40px_rgba(245,158,11,0.4)] transition-all duration-500 group-hover:scale-105 group-active:scale-95"
        >
          <defs>
            {/* Gradientes dorados ricos */}
            <linearGradient id="goldPetalA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="goldPetalB" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <radialGradient id="roseCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="90%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fde047" />
            </radialGradient>

            <linearGradient id="stemGradBouquet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>

            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <filter id="glowBouquet" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. TALLOS AGRUPADOS Y LAZO DORADO */}
          <g className="origin-bottom">
            {/* Tallos cruzados del ramo */}
            <path d="M 230 360 Q 210 460 190 540" stroke="url(#stemGradBouquet)" strokeWidth="9" strokeLinecap="round" />
            <path d="M 250 360 Q 245 460 235 550" stroke="url(#stemGradBouquet)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 260 360 Q 260 460 260 555" stroke="url(#stemGradBouquet)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 270 360 Q 280 460 290 550" stroke="url(#stemGradBouquet)" strokeWidth="9" strokeLinecap="round" />
            <path d="M 290 360 Q 315 460 330 535" stroke="url(#stemGradBouquet)" strokeWidth="9" strokeLinecap="round" />

            {/* Hojas verdes del bouquet */}
            <path d="M 200 370 C 130 370 110 320 130 280 C 170 310 200 340 200 370 Z" fill="#15803d" opacity="0.9" />
            <path d="M 320 370 C 390 370 410 320 390 280 C 350 310 320 340 320 370 Z" fill="#16a34a" opacity="0.9" />
            <path d="M 260 340 C 260 260 320 220 340 210 C 330 260 290 310 260 340 Z" fill="#22c55e" opacity="0.85" />
            <path d="M 260 340 C 260 260 200 220 180 210 C 190 260 230 310 260 340 Z" fill="#15803d" opacity="0.85" />

            {/* Gran Lazo de Satín Dorado */}
            <g transform="translate(260, 420)">
              {/* Cinta colgante izquierda */}
              <path d="M -15 20 Q -45 80 -60 140 Q -40 120 -20 135 Q -5 70 -5 20 Z" fill="url(#ribbonGrad)" opacity="0.95" />
              {/* Cinta colgante derecha */}
              <path d="M 15 20 Q 45 80 60 140 Q 40 120 20 135 Q 5 70 5 20 Z" fill="url(#ribbonGrad)" opacity="0.95" />
              {/* Oreja izquierda del lazo */}
              <ellipse cx="-45" cy="0" rx="38" ry="22" transform="rotate(-20 -45 0)" fill="url(#ribbonGrad)" stroke="#fef08a" strokeWidth="1.5" />
              {/* Oreja derecha del lazo */}
              <ellipse cx="45" cy="0" rx="38" ry="22" transform="rotate(20 45 0)" fill="url(#ribbonGrad)" stroke="#fef08a" strokeWidth="1.5" />
              {/* Nudo central con gema dorada */}
              <circle cx="0" cy="0" r="16" fill="url(#ribbonGrad)" stroke="#fef08a" strokeWidth="2" filter="url(#glowBouquet)" />
              <circle cx="0" cy="0" r="8" fill="#fef08a" />
            </g>
          </g>

          {/* 2. COMPOSICIÓN DE FLORES AMARILLAS RADIANTE */}

          {/* FLOR 1: Izquierda (Girasol mediano abierto) */}
          <g transform="translate(180, 220)">
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`f1-${i}`} transform={`rotate(${(360 / 12) * i})`}>
                <path d="M 0 0 C -12 -25 -14 -65 0 -85 C 14 -65 12 -25 0 0 Z" fill="url(#goldPetalA)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="26" fill="url(#roseCore)" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#fef08a" opacity="0.7" />
          </g>

          {/* FLOR 2: Derecha (Rosa dorada desplegada) */}
          <g transform="translate(340, 220)">
            {Array.from({ length: 14 }).map((_, i) => (
              <g key={`f2-${i}`} transform={`rotate(${(360 / 14) * i})`}>
                <path d="M 0 0 C -14 -20 -16 -60 0 -80 C 16 -60 14 -20 0 0 Z" fill="url(#goldPetalB)" stroke="#d97706" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="24" fill="url(#roseCore)" stroke="#d97706" strokeWidth="2" />
            <circle cx="0" cy="0" r="10" fill="#fef08a" opacity="0.7" />
          </g>

          {/* FLOR 3: Superior Izquierda (Flor de té amarilla) */}
          <g transform="translate(210, 130)">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`f3-${i}`} transform={`rotate(${(360 / 10) * i})`}>
                <path d="M 0 0 C -12 -15 -12 -45 0 -60 C 12 -45 12 -15 0 0 Z" fill="url(#goldPetalA)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="18" fill="url(#roseCore)" />
          </g>

          {/* FLOR 4: Superior Derecha (Flor silvestre amarilla) */}
          <g transform="translate(310, 130)">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`f4-${i}`} transform={`rotate(${(360 / 10) * i})`}>
                <path d="M 0 0 C -12 -15 -12 -45 0 -60 C 12 -45 12 -15 0 0 Z" fill="url(#goldPetalB)" stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="18" fill="url(#roseCore)" />
          </g>

          {/* FLOR 5: CENTRO PRINCIPAL (Gran Rosa Imperial / Flor del Sol) */}
          <g transform="translate(260, 240)">
            {/* Capa pétalos fondo */}
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={`fc-outer-${i}`} transform={`rotate(${(360 / 16) * i})`}>
                <path d="M 0 0 C -18 -35 -20 -95 0 -115 C 20 -95 18 -35 0 0 Z" fill="url(#goldPetalA)" stroke="#f59e0b" strokeWidth="1.2" />
              </g>
            ))}
            {/* Capa pétalos medios */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`fc-mid-${i}`} transform={`rotate(${(360 / 12) * i + 15})`}>
                <path d="M 0 0 C -14 -25 -16 -70 0 -88 C 16 -70 14 -25 0 0 Z" fill="url(#goldPetalB)" stroke="#d97706" strokeWidth="1.2" />
              </g>
            ))}
            {/* Capa pétalos interiores */}
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={`fc-in-${i}`} transform={`rotate(${(360 / 8) * i + 30})`}>
                <path d="M 0 0 C -10 -15 -12 -45 0 -58 C 12 -45 10 -15 0 0 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              </g>
            ))}
            {/* Corazón dorado brillante */}
            <circle cx="0" cy="0" r="32" fill="url(#roseCore)" stroke="#fef08a" strokeWidth="3" filter="url(#glowBouquet)" />
            <circle cx="0" cy="0" r="16" fill="#fef08a" />
          </g>

          {/* 3. FLORES BLANCAS Y DORADAS MENORES (Baby's Breath & Destellos) */}
          <circle cx="160" cy="160" r="7" fill="#ffffff" opacity="0.95" filter="url(#glowBouquet)" />
          <circle cx="360" cy="160" r="7" fill="#ffffff" opacity="0.95" filter="url(#glowBouquet)" />
          <circle cx="260" cy="90" r="8" fill="#fef08a" opacity="0.95" filter="url(#glowBouquet)" />
          <circle cx="130" cy="240" r="6" fill="#ffffff" opacity="0.9" />
          <circle cx="390" cy="240" r="6" fill="#ffffff" opacity="0.9" />
        </svg>

        {/* Indicador táctil móvil */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/25 backdrop-blur-md border border-amber-300/40 rounded-full px-4 py-1.5 text-xs text-amber-200 flex items-center gap-1.5 shadow-lg group-hover:bg-amber-500/35 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>Toca el ramo para iluminar</span>
        </div>
      </div>
    </div>
  );
};
