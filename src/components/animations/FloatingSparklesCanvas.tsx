import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface FloatingSparklesCanvasProps {
  interactive?: boolean;
}

interface FloatingFlower {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  rotation: number;
  rotSpeed: number;
  petals: number;
  alpha: number;
  pulsePhase: number;
  goldenGlow: number;
  colorHex: string;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const FloatingSparklesCanvas: React.FC<FloatingSparklesCanvasProps> = ({ interactive = true }) => {
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

    // Flores flotantes (adaptado a móvil)
    const flowersCount = isMobile ? 8 : Math.min(Math.floor((width * height) / 38000), 22);
    const yellowTones = ['#fbbf24', '#f59e0b', '#fde047', '#facc15', '#fef08a'];

    const createFlower = (startY?: number): FloatingFlower => {
      return {
        x: Math.random() * width,
        y: startY !== undefined ? startY : Math.random() * height,
        size: 14 + Math.random() * 22,
        vy: -(0.5 + Math.random() * 1.1), // Flotar suavemente hacia arriba
        vx: -0.4 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: -0.015 + Math.random() * 0.03,
        petals: Math.random() > 0.5 ? 5 : 6,
        alpha: 0.65 + Math.random() * 0.35,
        pulsePhase: Math.random() * Math.PI * 2,
        goldenGlow: 15 + Math.random() * 20,
        colorHex: yellowTones[Math.floor(Math.random() * yellowTones.length)]
      };
    };

    const flowers: FloatingFlower[] = Array.from({ length: flowersCount }, () => createFlower());
    const sparkles: SparkleParticle[] = [];

    // Orbes de luz bokeh de fondo
    const bokehOrbs = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 40 + Math.random() * 80,
      alpha: 0.04 + Math.random() * 0.08,
      vx: -0.2 + Math.random() * 0.4,
      vy: -0.3 - Math.random() * 0.3
    }));

    const drawFlower = (
      context: CanvasRenderingContext2D,
      f: FloatingFlower,
      time: number
    ) => {
      context.save();
      context.translate(f.x, f.y);
      context.rotate(f.rotation);

      const pulse = 1 + Math.sin(time * 2 + f.pulsePhase) * 0.08;
      context.scale(pulse, pulse);

      context.globalAlpha = f.alpha;

      // Resplandor cálido
      context.shadowColor = '#f59e0b';
      context.shadowBlur = f.goldenGlow;

      // Dibujar pétalos
      const petalDist = f.size * 0.55;
      const petalRadiusX = f.size * 0.48;
      const petalRadiusY = f.size * 0.28;

      for (let i = 0; i < f.petals; i++) {
        const angle = (Math.PI * 2 * i) / f.petals;
        context.save();
        context.rotate(angle);
        context.translate(petalDist, 0);

        context.fillStyle = f.colorHex;
        context.beginPath();
        context.ellipse(0, 0, petalRadiusX, petalRadiusY, 0, 0, Math.PI * 2);
        context.fill();

        // Brillo interno en pétalo
        context.fillStyle = 'rgba(255, 255, 255, 0.4)';
        context.beginPath();
        context.ellipse(0, 0, petalRadiusX * 0.5, petalRadiusY * 0.4, 0, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }

      // Centro dorado de la flor
      context.shadowColor = '#fbbf24';
      context.shadowBlur = 12;

      context.beginPath();
      context.arc(0, 0, f.size * 0.32, 0, Math.PI * 2);
      context.fillStyle = '#b45309';
      context.fill();

      // Puntos de polen
      context.beginPath();
      context.arc(0, 0, f.size * 0.22, 0, Math.PI * 2);
      context.fillStyle = '#fef08a';
      context.fill();

      context.restore();
    };

    let clock = 0;

    const render = () => {
      clock += 0.018;
      ctx.clearRect(0, 0, width, height);

      // 1. Dibujar orbes bokeh de fondo
      bokehOrbs.forEach((orb) => {
        orb.y += orb.vy;
        orb.x += orb.vx;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;

        const radial = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        radial.addColorStop(0, `rgba(251, 191, 36, ${orb.alpha * 1.5})`);
        radial.addColorStop(0.6, `rgba(245, 158, 11, ${orb.alpha * 0.7})`);
        radial.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Dibujar flores flotantes
      flowers.forEach((f, idx) => {
        f.y += f.vy;
        f.x += f.vx + Math.sin(clock + f.pulsePhase) * 0.6;
        f.rotation += f.rotSpeed;

        // Ocasionalmente soltar una chispa brillante
        if (Math.random() < 0.08) {
          sparkles.push({
            x: f.x + (-10 + Math.random() * 20),
            y: f.y + (-10 + Math.random() * 20),
            vx: -0.3 + Math.random() * 0.6,
            vy: 0.2 + Math.random() * 0.8,
            size: 1.5 + Math.random() * 3,
            alpha: 0.9,
            decay: 0.02 + Math.random() * 0.02,
            color: '#fef08a'
          });
        }

        if (f.y < -f.size * 2) {
          flowers[idx] = createFlower(height + f.size);
        }
        if (f.x < -f.size * 2) f.x = width + f.size;
        if (f.x > width + f.size * 2) f.x = -f.size;

        drawFlower(ctx, f, clock);
      });

      // 3. Dibujar partículas de destello (sparkles)
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        if (!isMobile) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 6;
        }

        // Dibujar forma de estrella de 4 puntas para destello brillante
        ctx.translate(s.x, s.y);
        ctx.beginPath();
        ctx.moveTo(0, -s.size * 2);
        ctx.quadraticCurveTo(0, 0, s.size * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, s.size * 2);
        ctx.quadraticCurveTo(0, 0, -s.size * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s.size * 2);
        ctx.fill();

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    const addTrailSparkle = (clientX: number, clientY: number) => {
      if (!interactive) return;
      if (Math.random() < 0.35 && sparkles.length < (isMobile ? 15 : 45)) {
        sparkles.push({
          x: clientX,
          y: clientY,
          vx: -0.5 + Math.random() * 1,
          vy: -0.8 + Math.random() * 1.6,
          size: 2 + Math.random() * 3,
          alpha: 1,
          decay: 0.03,
          color: yellowTones[Math.floor(Math.random() * yellowTones.length)]
        });
      }
    };

    const plantFlowerBurst = (clientX: number, clientY: number) => {
      if (!interactive) return;
      if (!isGlobalMuted()) {
        playGentleSparkle();
      }

      const newFl = createFlower(clientY);
      newFl.x = clientX;
      newFl.size = 24 + Math.random() * 10;
      newFl.goldenGlow = isMobile ? 10 : 25;
      flowers.push(newFl);

      const burstCount = isMobile ? 6 : 14;
      for (let i = 0; i < burstCount; i++) {
        const ang = (Math.PI * 2 * i) / burstCount;
        const spd = 2 + Math.random() * 3;
        sparkles.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 2.5 + Math.random() * 3,
          alpha: 1,
          decay: 0.025,
          color: yellowTones[i % yellowTones.length]
        });
      }

      if (flowers.length > 40) {
        flowers.shift();
      }
    };

    const handlePointerMove = (e: MouseEvent) => addTrailSparkle(e.clientX, e.clientY);
    const handleClick = (e: MouseEvent) => plantFlowerBurst(e.clientX, e.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addTrailSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        plantFlowerBurst(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="floating-sparkles-canvas"
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
