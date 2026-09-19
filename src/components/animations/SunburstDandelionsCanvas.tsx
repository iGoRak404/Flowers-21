import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface SunburstDandelionsCanvasProps {
  interactive?: boolean;
}

interface DandelionSeed {
  x: number;
  y: number;
  stemLength: number;
  plumeRadius: number;
  speedY: number;
  speedX: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  color: string;
}

interface SunPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const SunburstDandelionsCanvas: React.FC<SunburstDandelionsCanvasProps> = ({
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = window.innerWidth < 640;

    let resizeTimer: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Semillas de diente de león flotantes
    const count = isMobile ? 18 : 32;
    const seeds: DandelionSeed[] = [];
    const colors = [
      'rgba(251, 191, 36, ',
      'rgba(250, 204, 21, ',
      'rgba(253, 224, 71, ',
      'rgba(254, 243, 199, ',
    ];

    for (let i = 0; i < count; i++) {
      seeds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        stemLength: Math.random() * 8 + (isMobile ? 10 : 14),
        plumeRadius: Math.random() * 6 + (isMobile ? 7 : 10),
        speedY: -(Math.random() * 0.5 + 0.25),
        speedX: Math.random() * 0.4 - 0.2,
        tilt: Math.random() * 0.4 - 0.2,
        tiltSpeed: (Math.random() - 0.5) * 0.015,
        opacity: Math.random() * 0.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const pulses: SunPulse[] = [];

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;

      pulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: isMobile ? 70 : 110,
        alpha: 0.85,
        color: colors[Math.floor(Math.random() * colors.length)]
      });

      // Ráfaga suave de semillas de diente de león
      const burst = isMobile ? 3 : 6;
      for (let i = 0; i < burst; i++) {
        seeds.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          stemLength: Math.random() * 6 + 10,
          plumeRadius: Math.random() * 5 + 7,
          speedY: -(Math.random() * 1.5 + 0.8),
          speedX: (Math.random() - 0.5) * 1.2,
          tilt: (Math.random() - 0.5) * 0.5,
          tiltSpeed: (Math.random() - 0.5) * 0.02,
          opacity: 0.9,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      if (!isGlobalMuted()) {
        playGentleSparkle();
      }
    };

    if (interactive) {
      window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. PULSOS DE SOL DORADO (PULSES)
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += (p.maxRadius - p.radius) * 0.12;
        p.alpha -= 0.025;

        if (p.alpha <= 0.01) {
          pulses.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.color}${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.25})`;
        ctx.fill();
        ctx.restore();
      }

      // 2. SEMILLAS Y PENACHOS DE DIENTE DE LEÓN DORADOS
      for (let i = seeds.length - 1; i >= 0; i--) {
        const s = seeds[i];
        s.y += s.speedY;
        s.x += s.speedX + Math.sin(s.tilt * 3) * 0.3;
        s.tilt += s.tiltSpeed;

        if (seeds.length > (isMobile ? 22 : 40) && s.y < -40) {
          seeds.splice(i, 1);
          continue;
        }

        if (s.y < -40) {
          s.y = height + 40;
          s.x = Math.random() * width;
        }
        if (s.x < -30) s.x = width + 30;
        if (s.x > width + 30) s.x = -30;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.tilt);

        // Tallo central
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, s.stemLength);
        ctx.strokeStyle = `${s.color}${s.opacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pequeña semilla en la base del tallo
        ctx.beginPath();
        ctx.ellipse(0, s.stemLength, 1.2, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 119, 6, ${s.opacity})`;
        ctx.fill();

        // Radios / Pelusa del penacho de paracaídas
        const rayCount = 9;
        ctx.strokeStyle = `${s.color}${s.opacity})`;
        ctx.lineWidth = 0.8;

        for (let r = 0; r < rayCount; r++) {
          const angle = -Math.PI / 2 + (r - (rayCount - 1) / 2) * 0.28;
          const rx = Math.cos(angle) * s.plumeRadius;
          const ry = Math.sin(angle) * s.plumeRadius;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rx, ry);
          ctx.stroke();

          // Mota brillante en la punta del filamento
          ctx.beginPath();
          ctx.arc(rx, ry, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.9})`;
          ctx.fill();
        }

        // Núcleo luminoso en el vértice del penacho
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('pointerdown', handlePointerDown);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="sunburst-dandelions-canvas"
      className="fixed inset-0 pointer-events-auto z-10 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
