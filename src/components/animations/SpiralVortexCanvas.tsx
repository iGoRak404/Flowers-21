import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface SpiralVortexCanvasProps {
  interactive?: boolean;
}

interface SpiralPetal {
  angle: number;
  radius: number;
  radiusSpeed: number;
  rotSpeed: number;
  size: number;
  opacity: number;
  petalLength: number;
  color: string;
  wobble: number;
  armIndex: number;
}

interface StarDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const SpiralVortexCanvas: React.FC<SpiralVortexCanvasProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      }, 120);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const arms = isMobile ? 3 : 6;
    const petalsPerArm = isMobile ? 5 : Math.min(Math.floor((width * height) / 20000), 18);
    const totalPetals = arms * petalsPerArm;

    const goldColors = ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#d97706'];

    const createSpiralPetal = (armIndex: number, step: number): SpiralPetal => {
      const baseRadius = 30 + step * 16;
      return {
        angle: (armIndex * ((Math.PI * 2) / arms)) + step * 0.28,
        radius: baseRadius,
        radiusSpeed: 0.4 + Math.random() * 0.5,
        rotSpeed: 0.008 + (1 / (step + 2)) * 0.015,
        size: 7 + step * 0.9,
        petalLength: 12 + step * 1.5,
        opacity: Math.min(0.35 + step * 0.04, 0.95),
        color: goldColors[step % goldColors.length],
        wobble: Math.random() * Math.PI * 2,
        armIndex
      };
    };

    const petals: SpiralPetal[] = [];
    for (let a = 0; a < arms; a++) {
      for (let s = 0; s < petalsPerArm; s++) {
        petals.push(createSpiralPetal(a, s));
      }
    }

    const stardust: StarDust[] = [];
    let centerX = width / 2;
    let centerY = height / 2;
    let targetCenterX = width / 2;
    let targetCenterY = height / 2;
    let globalAngle = 0;

    const render = () => {
      // Suave lerp hacia el centro o posición del toque
      centerX += (targetCenterX - centerX) * 0.04;
      centerY += (targetCenterY - centerY) * 0.04;
      globalAngle += 0.006;

      ctx.clearRect(0, 0, width, height);

      // 1. Resplandor nuclear central
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 160);
      coreGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
      coreGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
      coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dibujar y actualizar pétalos en espiral
      petals.forEach((p) => {
        p.angle += p.rotSpeed;
        p.wobble += 0.02;
        p.radius += p.radiusSpeed;

        const maxRadius = Math.max(width, height) * 0.65;
        if (p.radius > maxRadius) {
          p.radius = 25 + Math.random() * 15;
        }

        const effectiveAngle = p.angle + globalAngle;
        const currentRadius = p.radius + Math.sin(p.wobble) * 8;
        const px = centerX + Math.cos(effectiveAngle) * currentRadius;
        const py = centerY + Math.sin(effectiveAngle) * currentRadius;

        // Ocasionalmente desprender polvo estelar
        if (Math.random() < 0.02) {
          stardust.push({
            x: px,
            y: py,
            vx: Math.cos(effectiveAngle + Math.PI / 2) * 1.2,
            vy: Math.sin(effectiveAngle + Math.PI / 2) * 1.2,
            size: 1.5 + Math.random() * 2,
            alpha: 0.8,
            decay: 0.015,
            color: p.color
          });
        }

        ctx.save();
        ctx.translate(px, py);
        // Orientar el pétalo a lo largo de la tangente de la espiral
        ctx.rotate(effectiveAngle + Math.PI / 2 + Math.sin(p.wobble) * 0.3);
        ctx.globalAlpha = p.opacity;

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        // Dibujar pétalo dorado curvado
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.petalLength * 0.5);
        ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.petalLength * 0.5);
        ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.petalLength * 0.5);
        ctx.fill();

        ctx.restore();
      });

      // 3. Dibujar partículas de estela cósmica
      for (let i = stardust.length - 1; i >= 0; i--) {
        const s = stardust[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          stardust.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        if (!isMobile) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 5;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    // Manejo de interacción tanto para mouse como para pantallas táctiles de celular
    const handleMove = (x: number, y: number) => {
      if (!interactive) return;
      targetCenterX = x;
      targetCenterY = y;

      if (Math.random() < 0.35 && stardust.length < (isMobile ? 12 : 30)) {
        stardust.push({
          x,
          y,
          vx: -1 + Math.random() * 2,
          vy: -1 + Math.random() * 2,
          size: 2.5 + Math.random() * 2,
          alpha: 0.9,
          decay: 0.02,
          color: goldColors[Math.floor(Math.random() * goldColors.length)]
        });
      }
    };

    const handlePointerDown = (x: number, y: number) => {
      if (!interactive) return;
      if (!isGlobalMuted()) {
        playGentleSparkle();
      }
      targetCenterX = x;
      targetCenterY = y;

      // Estallido de pétalos radiales
      const count = isMobile ? 8 : 16;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count;
        const spd = 2 + Math.random() * 3;
        stardust.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 2 + Math.random() * 3,
          alpha: 1,
          decay: 0.02,
          color: goldColors[i % goldColors.length]
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="spiral-vortex-canvas"
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
