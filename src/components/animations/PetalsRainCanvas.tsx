import React, { useEffect, useRef } from 'react';
import { Particle } from '../../types';

interface PetalsRainCanvasProps {
  interactive?: boolean;
}

export const PetalsRainCanvas: React.FC<PetalsRainCanvasProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0
  });

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

    // Cantidad balanceada según el tamaño de pantalla (ligero en móviles)
    const count = isMobile ? 14 : Math.min(Math.floor((width * height) / 18000), 50);

    const createPetal = (startY?: number): Particle => {
      return {
        x: Math.random() * width,
        y: startY !== undefined ? startY : Math.random() * height,
        size: 10 + Math.random() * 16,
        speedY: 1.2 + Math.random() * 2.2,
        speedX: -0.8 + Math.random() * 1.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.02 + Math.random() * 0.04,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.02 + Math.random() * 0.04,
        opacity: 0.7 + Math.random() * 0.3,
        hueOffset: Math.floor(Math.random() * 18) - 9, // Variación dorada / amarillo pastel
        petalType: Math.floor(Math.random() * 3)
      };
    };

    particlesRef.current = Array.from({ length: count }, () => createPetal());

    let windTime = 0;

    const drawPetal = (
      context: CanvasRenderingContext2D,
      p: Particle
    ) => {
      context.save();
      context.translate(p.x, p.y);
      context.rotate(p.rotation);
      // Efecto 3D de volteo de pétalo al caer
      const scaleY = Math.cos(p.flip);
      context.scale(1, Math.abs(scaleY) < 0.1 ? 0.1 : scaleY);

      context.globalAlpha = p.opacity;

      // Gradiente cálido de pétalo amarillo (de amarillo dorado a amarillo mantequilla)
      const grad = context.createLinearGradient(0, -p.size, 0, p.size);
      grad.addColorStop(0, `hsl(${46 + p.hueOffset}, 98%, 56%)`);
      grad.addColorStop(0.5, `hsl(${49 + p.hueOffset}, 100%, 64%)`);
      grad.addColorStop(1, `hsl(${41 + p.hueOffset}, 95%, 48%)`);

      context.fillStyle = grad;
      context.beginPath();

      if (p.petalType === 0) {
        // Pétalo alargado estilo girasol
        context.moveTo(0, -p.size * 1.2);
        context.bezierCurveTo(p.size * 0.7, -p.size * 0.6, p.size * 0.8, p.size * 0.6, 0, p.size * 1.1);
        context.bezierCurveTo(-p.size * 0.8, p.size * 0.6, -p.size * 0.7, -p.size * 0.6, 0, -p.size * 1.2);
      } else if (p.petalType === 1) {
        // Pétalo redondeado clásico con hendidura suave
        context.moveTo(0, -p.size);
        context.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.7, p.size * 0.7, 0, p.size);
        context.bezierCurveTo(-p.size * 0.7, p.size * 0.7, -p.size * 0.9, -p.size * 0.5, 0, -p.size);
      } else {
        // Pétalo con nervadura central brillante
        context.moveTo(0, -p.size);
        context.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
        context.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
      }

      context.fill();

      // Sutil nervadura central dorada
      context.beginPath();
      context.moveTo(0, -p.size * 0.8);
      context.lineTo(0, p.size * 0.7);
      context.strokeStyle = `rgba(234, 150, 10, 0.35)`;
      context.lineWidth = 1;
      context.stroke();

      context.restore();
    };

    const render = () => {
      windTime += 0.015;
      const globalWind = Math.sin(windTime) * 1.1 + 0.5;

      ctx.clearRect(0, 0, width, height);

      // Desvanecer gradualmente velocidad del mouse
      mouseRef.current.vx *= 0.92;
      mouseRef.current.vy *= 0.92;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        // Movimiento oscilante natural
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;
        p.y += p.speedY;
        p.x += p.speedX + globalWind * 0.7 + Math.sin(p.y * 0.01) * 0.5;

        // Interacción física con el cursor
        if (interactive && mouseRef.current.x > 0) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 3;
            p.x += (dx / dist) * force + mouseRef.current.vx * 0.4;
            p.y += (dy / dist) * force + mouseRef.current.vy * 0.4;
            p.rotationSpeed += 0.01;
          }
        }

        // Si sale de la pantalla, reiniciar arriba
        if (p.y > height + 40) {
          particlesRef.current[i] = createPetal(-30);
        }
        if (p.x > width + 40) {
          p.x = -30;
        } else if (p.x < -40) {
          p.x = width + 30;
        }

        drawPetal(ctx, p);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    const updatePointer = (clientX: number, clientY: number) => {
      mouseRef.current.vx = clientX - mouseRef.current.lastX;
      mouseRef.current.vy = clientY - mouseRef.current.lastY;
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;
      mouseRef.current.lastX = clientX;
      mouseRef.current.lastY = clientY;
    };

    const triggerBurst = (clientX: number, clientY: number) => {
      if (!interactive) return;
      const burstCount = 14;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.4;
        const speed = 2 + Math.random() * 4;
        const newPetal = createPetal(clientY);
        newPetal.x = clientX;
        newPetal.speedX = Math.cos(angle) * speed;
        newPetal.speedY = Math.sin(angle) * speed - 1;
        particlesRef.current.push(newPetal);
      }
      if (particlesRef.current.length > 150) {
        particlesRef.current.splice(0, particlesRef.current.length - 120);
      }
    };

    const handleMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
    const handleClick = (e: MouseEvent) => triggerBurst(e.clientX, e.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        triggerBurst(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="petals-rain-canvas"
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
