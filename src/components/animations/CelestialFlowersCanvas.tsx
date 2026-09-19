import React, { useEffect, useRef } from 'react';
import { playCelestialChime, isGlobalMuted } from '../../utils/audio';

interface CelestialFlowersCanvasProps {
  interactive?: boolean;
}

interface CelestialFlower {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  petals: number;
  color: string;
  coreColor: string;
  opacity: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  color: string;
  width: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface TwinkleStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string;
}

interface InteractiveBloom {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  rotation: number;
  alpha: number;
  decay: number;
  color: string;
  coreColor: string;
}

interface StardustTrail {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const CelestialFlowersCanvas: React.FC<CelestialFlowersCanvasProps> = ({
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
        initTwinkleStars();
      }, 120);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Paletas de color radiantes para flores de Ashlie (amarillo oro con toques celestiales)
    const flowerColors = ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#fffbeb'];
    const starColors = ['#ffffff', '#fef08a', '#7dd3fc', '#38bdf8', '#fde047'];

    // 1. Estrellas de fondo centelleantes (reducidas en móvil)
    let twinkleStars: TwinkleStar[] = [];
    const initTwinkleStars = () => {
      twinkleStars = [];
      const count = isMobile ? 18 : Math.floor((width * height) / 10000);
      for (let i = 0; i < count; i++) {
        twinkleStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.8 + Math.random() * 1.8,
          baseAlpha: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.04,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };
    initTwinkleStars();

    // 2. Flores y pétalos amarillos flotantes
    const flowerCount = isMobile ? 12 : 36;
    const flowers: CelestialFlower[] = [];

    const createFlower = (startY?: number): CelestialFlower => {
      const isBig = Math.random() < 0.45;
      return {
        x: Math.random() * width,
        y: startY !== undefined ? startY : Math.random() * (height + 100) - 50,
        size: isBig ? 14 + Math.random() * 12 : 7 + Math.random() * 6,
        speedY: 0.5 + Math.random() * 1.1,
        speedX: -0.4 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: -0.015 + Math.random() * 0.03,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.02 + Math.random() * 0.04,
        petals: Math.random() < 0.35 ? 8 : 6,
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        coreColor: '#78350f',
        opacity: 0.45 + Math.random() * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayAmp: 0.6 + Math.random() * 1.2,
      };
    };

    for (let i = 0; i < flowerCount; i++) {
      flowers.push(createFlower());
    }

    // 3. Estrellas fugaces (Shooting Stars)
    let shootingStars: ShootingStar[] = [];
    let shootingStarTimer = 0;

    const spawnShootingStar = (forceX?: number, forceY?: number) => {
      const startX = forceX !== undefined ? forceX : Math.random() * width * 0.8;
      const startY = forceY !== undefined ? forceY : Math.random() * (height * 0.4);
      shootingStars.push({
        x: startX,
        y: startY,
        length: 90 + Math.random() * 110,
        speed: 12 + Math.random() * 8,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // ~45 grados
        alpha: 1.0,
        color: Math.random() < 0.35 ? '#38bdf8' : '#fef08a',
        width: 1.8 + Math.random() * 1.5,
        trail: [],
      });
    };

    // 4. Brotes interactivos de flor al tocar
    let interactiveBlooms: InteractiveBloom[] = [];
    let stardustTrails: StardustTrail[] = [];

    const mouse = { x: -1000, y: -1000, active: false };

    const handlePointerMove = (clientX: number, clientY: number) => {
      mouse.x = clientX;
      mouse.y = clientY;
      mouse.active = true;

      // Generar pequeñas chispas estelares al mover
      if (Math.random() < 0.4) {
        stardustTrails.push({
          x: clientX + (Math.random() * 16 - 8),
          y: clientY + (Math.random() * 16 - 8),
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: 1.5 + Math.random() * 2.5,
          alpha: 0.9,
          decay: 0.02 + Math.random() * 0.02,
          color: Math.random() < 0.4 ? '#38bdf8' : '#fef08a',
        });
      }
    };

    const handleInteraction = (clientX: number, clientY: number) => {
      if (!interactive) return;

      if (!isGlobalMuted()) {
        playCelestialChime();
      }

      // Crear brote de flor resplandeciente en el punto de contacto
      interactiveBlooms.push({
        x: clientX,
        y: clientY,
        size: 2,
        maxSize: 20 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        alpha: 1.0,
        decay: 0.015,
        color: '#fef08a',
        coreColor: '#92400e',
      });

      // Disparar una estrella fugaz atravesando el cielo
      spawnShootingStar(Math.max(20, clientX - 150), Math.max(10, clientY - 200));

      // Explosión de chispitas estelares alrededor
      const burst = isMobile ? 6 : 14;
      for (let i = 0; i < burst; i++) {
        const ang = (i / burst) * Math.PI * 2;
        const spd = 2 + Math.random() * 3;
        stardustTrails.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 2 + Math.random() * 2.5,
          alpha: 1.0,
          decay: 0.025 + Math.random() * 0.02,
          color: i % 2 === 0 ? '#fde047' : '#38bdf8',
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseDown = (e: MouseEvent) => handleInteraction(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    // Dibujo de flor completa de 6 u 8 pétalos
    const drawFlower = (f: CelestialFlower) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.scale(1, Math.max(0.2, Math.sin(f.flip)));
      ctx.globalAlpha = f.opacity;

      // Resplandor cálido (desactivado en móvil para 60 FPS)
      if (!isMobile) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
      }

      const count = f.petals;
      for (let i = 0; i < count; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / count);

        // Pétalo alargado suave
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(0, -f.size * 0.65, f.size * 0.35, f.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vena central
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, -f.size * 0.2);
        ctx.lineTo(0, -f.size * 1.1);
        ctx.stroke();

        ctx.restore();
      }

      // Centro de la flor
      ctx.fillStyle = f.coreColor;
      ctx.beginPath();
      ctx.arc(0, 0, f.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Puntos dorados centrales (semillas)
      ctx.fillStyle = '#fde047';
      for (let s = 0; s < 4; s++) {
        const sAngle = (s * Math.PI) / 2 + f.rotation;
        ctx.beginPath();
        ctx.arc(
          Math.cos(sAngle) * (f.size * 0.14),
          Math.sin(sAngle) * (f.size * 0.14),
          f.size * 0.06,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    };

    // Bucle de animación principal
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Dibujar estrellas centelleantes
      for (let i = 0; i < twinkleStars.length; i++) {
        const s = twinkleStars[i];
        s.phase += s.speed;
        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.3;
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, currentAlpha);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Temporizador para disparar estrellas fugaces espontáneas
      shootingStarTimer++;
      if (shootingStarTimer > 180 + Math.random() * 200) {
        shootingStarTimer = 0;
        spawnShootingStar();
      }

      // Dibujar estrellas fugaces
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.trail.unshift({ x: star.x, y: star.y, alpha: star.alpha });
        if (star.trail.length > 18) star.trail.pop();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.alpha -= 0.012;

        // Cola de luz
        ctx.save();
        for (let t = 0; t < star.trail.length - 1; t++) {
          const pt1 = star.trail[t];
          const pt2 = star.trail[t + 1];
          const progress = 1 - t / star.trail.length;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.width * progress;
          ctx.globalAlpha = pt1.alpha * progress;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }

        // Cabeza brillante de la estrella fugaz
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.width * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (star.alpha <= 0 || star.x > width + 100 || star.y > height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      // 3. Dibujar brotes interactivos de flores (generados con clics/toques)
      for (let i = interactiveBlooms.length - 1; i >= 0; i--) {
        const b = interactiveBlooms[i];
        if (b.size < b.maxSize) {
          b.size += (b.maxSize - b.size) * 0.12;
        }
        b.rotation += 0.01;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          interactiveBlooms.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.globalAlpha = b.alpha;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        // 6 pétalos de brote radiante
        for (let p = 0; p < 6; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI * 2) / 6);
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.ellipse(0, -b.size * 0.65, b.size * 0.35, b.size * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Centro brillante
        ctx.fillStyle = b.coreColor;
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Dibujar estelas de polvo estelar
      for (let i = stardustTrails.length - 1; i >= 0; i--) {
        const s = stardustTrails[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          stardustTrails.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        if (!isMobile) {
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 4;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Dibujar y actualizar flores y pétalos flotantes
      for (let i = 0; i < flowers.length; i++) {
        const f = flowers[i];

        f.swayPhase += f.swaySpeed;
        f.x += f.speedX + Math.sin(f.swayPhase) * f.swayAmp;
        f.y += f.speedY;
        f.rotation += f.rotSpeed;
        f.flip += f.flipSpeed;

        // Interacción física con el puntero: suave brisa que las aparta o balancea
        if (mouse.active && mouse.x > 0) {
          const dx = f.x - mouse.x;
          const dy = f.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (1 - dist / 140) * 3.4;
            f.x += (dx / dist) * force;
            f.y += (dy / dist) * force;
            f.rotSpeed += 0.02;
          }
        }

        drawFlower(f);

        // Reubicar arriba cuando salen por abajo
        if (f.y > height + 50 || f.x < -60 || f.x > width + 60) {
          flowers[i] = createFlower(-40);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
