import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface AuroraFlowersCanvasProps {
  interactive?: boolean;
}

interface FloatingDandelion {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayPhase: number;
  swaySpeed: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  color: string;
  coreColor: string;
}

interface GoldenSpore {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
}

interface AuroraWavePoint {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
}

export const AuroraFlowersCanvas: React.FC<AuroraFlowersCanvasProps> = ({
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

    // Paleta de oro, ámbar y champaña
    const flowerColors = [
      'rgba(251, 191, 36, ',   // amber-400
      'rgba(250, 204, 21, ',   // yellow-400
      'rgba(253, 224, 71, ',   // yellow-300
      'rgba(254, 240, 138, ',  // yellow-200
      'rgba(245, 158, 11, ',   // amber-500
    ];

    // Dientes de león y flores flotantes suaves
    const flowerCount = isMobile ? 18 : 34;
    const flowers: FloatingDandelion[] = [];

    for (let i = 0; i < flowerCount; i++) {
      const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      flowers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + (isMobile ? 10 : 13),
        speedY: -(Math.random() * 0.45 + 0.25),
        speedX: (Math.random() - 0.5) * 0.3,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.012,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        opacity: Math.random() * 0.5 + 0.4,
        color: col,
        coreColor: 'rgba(254, 243, 199, 0.95)'
      });
    }

    // Esporas y motas de luz dorada
    const sporeCount = isMobile ? 25 : 50;
    const spores: GoldenSpore[] = [];
    for (let i = 0; i < sporeCount; i++) {
      spores.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
      });
    }

    // Ondas expansivas interactivas al tocar o mover
    const ripples: AuroraWavePoint[] = [];

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: isMobile ? 80 : 120,
        alpha: 0.8,
        decay: 0.025
      });

      // Crear pequeña explosión de florecitas
      const burstCount = isMobile ? 3 : 5;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.5;
        const speed = Math.random() * 2 + 1;
        flowers.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 6 + 10,
          speedY: Math.sin(angle) * speed - 0.5,
          speedX: Math.cos(angle) * speed,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: 0.02,
          opacity: 0.9,
          color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
          coreColor: '#fffbeb'
        });
      }

      if (!isGlobalMuted()) {
        playGentleSparkle();
      }
    };

    if (interactive) {
      window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      // 1. ONDA AURORA DORADA FLUIDA (Cinta de luz en el fondo superior-medio)
      const auroraGradient = ctx.createLinearGradient(0, height * 0.15, width, height * 0.6);
      auroraGradient.addColorStop(0, 'rgba(245, 158, 11, 0.03)');
      auroraGradient.addColorStop(0.5, 'rgba(250, 204, 21, 0.07)');
      auroraGradient.addColorStop(1, 'rgba(217, 119, 6, 0.02)');

      ctx.save();
      ctx.fillStyle = auroraGradient;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.25);

      const segments = 12;
      for (let i = 0; i <= segments; i++) {
        const px = (width / segments) * i;
        const py =
          height * 0.28 +
          Math.sin(time + i * 0.5) * 35 +
          Math.cos(time * 0.8 + i * 0.3) * 20;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(width, height * 0.6);
      for (let i = segments; i >= 0; i--) {
        const px = (width / segments) * i;
        const py =
          height * 0.45 +
          Math.sin(time * 0.7 + i * 0.4) * 30 +
          Math.cos(time + i * 0.6) * 25;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. ONDAS EXPANSIVAS AL TACTO (Ripples)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.1;
        r.alpha -= r.decay;

        if (r.alpha <= 0.01) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${r.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 3. ESPORAS DORADAS LUMINOSAS
      for (let i = 0; i < spores.length; i++) {
        const sp = spores[i];
        sp.y += sp.speedY;
        sp.x += sp.speedX;
        sp.pulsePhase += sp.pulseSpeed;

        if (sp.y < -10) {
          sp.y = height + 10;
          sp.x = Math.random() * width;
        }
        if (sp.x < 0) sp.x = width;
        if (sp.x > width) sp.x = 0;

        const currentAlpha = sp.opacity * (0.6 + Math.sin(sp.pulsePhase) * 0.4);

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `${sp.color}${currentAlpha})`;
        ctx.fill();
        ctx.restore();
      }

      // 4. DIENTES DE LEÓN Y FLORECITAS AMARILLAS EN ASCENSO
      for (let i = flowers.length - 1; i >= 0; i--) {
        const fl = flowers[i];
        fl.swayPhase += fl.swaySpeed;
        fl.rotation += fl.rotSpeed;
        fl.y += fl.speedY;
        fl.x += Math.sin(fl.swayPhase) * 0.6 + fl.speedX;

        // Si fue una flor de burst y subió suficiente, eliminarla
        if (flowers.length > (isMobile ? 22 : 40) && fl.y < -30) {
          flowers.splice(i, 1);
          continue;
        }

        if (fl.y < -30) {
          fl.y = height + 30;
          fl.x = Math.random() * width;
        }
        if (fl.x < -30) fl.x = width + 30;
        if (fl.x > width + 30) fl.x = -30;

        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.rotation);

        // Dibujo de silueta de flor / pompón de diente de león
        const rad = fl.size;
        const petalCount = 8;
        ctx.fillStyle = `${fl.color}${fl.opacity})`;

        for (let p = 0; p < petalCount; p++) {
          const angle = (Math.PI * 2 * p) / petalCount;
          const px = Math.cos(angle) * rad;
          const py = Math.sin(angle) * rad;

          ctx.beginPath();
          ctx.arc(px, py, rad * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Filamento fino hacia el centro
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px * 0.8, py * 0.8);
          ctx.strokeStyle = `rgba(254, 240, 138, ${fl.opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Núcleo central luminoso
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = fl.coreColor;
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
      id="aurora-flowers-canvas"
      className="fixed inset-0 pointer-events-auto z-10 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
