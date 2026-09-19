import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface CrystalPetalsCanvasProps {
  interactive?: boolean;
}

interface CrystalFlower {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  petalPoints: number;
  opacity: number;
  color: string;
  sparkleTimer: number;
}

interface StarlightSpark {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  rotation: number;
  alpha: number;
  decay: number;
  color: string;
}

export const CrystalPetalsCanvas: React.FC<CrystalPetalsCanvasProps> = ({
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

    // Paletas prismáticas de oro cristalino
    const crystalColors = [
      'rgba(253, 224, 71, ',  // yellow-300
      'rgba(250, 204, 21, ',  // yellow-400
      'rgba(254, 240, 138, ', // yellow-200
      'rgba(245, 158, 11, ',  // amber-500
      'rgba(255, 255, 255, ', // pure starlight
    ];

    const count = isMobile ? 16 : 28;
    const crystals: CrystalFlower[] = [];

    for (let i = 0; i < count; i++) {
      crystals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 10 + (isMobile ? 12 : 16),
        speedY: -(Math.random() * 0.4 + 0.2),
        speedX: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        petalPoints: Math.random() > 0.5 ? 6 : 8,
        opacity: Math.random() * 0.45 + 0.45,
        color: crystalColors[Math.floor(Math.random() * (crystalColors.length - 1))],
        sparkleTimer: Math.random() * 100
      });
    }

    const sparks: StarlightSpark[] = [];

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;

      // Destello cristalino en el punto de contacto
      const sparkCount = isMobile ? 4 : 7;
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: 2,
          maxSize: Math.random() * 12 + 10,
          rotation: Math.random() * Math.PI,
          alpha: 1,
          decay: 0.03 + Math.random() * 0.02,
          color: crystalColors[Math.floor(Math.random() * crystalColors.length)]
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

      // 1. DIBUJAR DESTELLOS DE CONTACTO INTERACTIVOS
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.size += (sp.maxSize - sp.size) * 0.15;
        sp.rotation += 0.04;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0.01) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.rotation);
        ctx.strokeStyle = `${sp.color}${sp.alpha})`;
        ctx.lineWidth = 1.5;

        // Cruz de estrella de 4 puntas prismática
        ctx.beginPath();
        ctx.moveTo(-sp.size, 0);
        ctx.lineTo(sp.size, 0);
        ctx.moveTo(0, -sp.size);
        ctx.lineTo(0, sp.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, sp.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha * 0.9})`;
        ctx.fill();
        ctx.restore();
      }

      // 2. DIBUJAR FLORES DE CRISTAL DORADO FLOTANTES
      for (let i = 0; i < crystals.length; i++) {
        const c = crystals[i];
        c.y += c.speedY;
        c.x += c.speedX;
        c.rotation += c.rotSpeed;
        c.sparkleTimer += 0.05;

        if (c.y < -30) {
          c.y = height + 30;
          c.x = Math.random() * width;
        }
        if (c.x < -30) c.x = width + 30;
        if (c.x > width + 30) c.x = -30;

        const dynamicOpacity = c.opacity * (0.8 + Math.sin(c.sparkleTimer) * 0.2);

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);

        const r = c.size;
        const pts = c.petalPoints;

        // Pétalos geométricos cristalinos superpuestos
        ctx.beginPath();
        for (let p = 0; p < pts; p++) {
          const angle = (Math.PI * 2 * p) / pts;
          const nextAngle = (Math.PI * 2 * (p + 1)) / pts;
          const midAngle = (angle + nextAngle) / 2;

          const tipX = Math.cos(angle) * r;
          const tipY = Math.sin(angle) * r;
          const innerX = Math.cos(midAngle) * (r * 0.4);
          const innerY = Math.sin(midAngle) * (r * 0.4);

          if (p === 0) ctx.moveTo(tipX, tipY);
          else ctx.lineTo(tipX, tipY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();

        // Relleno suave con borde definido de joya
        ctx.fillStyle = `${c.color}${dynamicOpacity * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(254, 240, 138, ${dynamicOpacity * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Centro brillante
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dynamicOpacity * 0.95})`;
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
      id="crystal-petals-canvas"
      className="fixed inset-0 pointer-events-auto z-10 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
