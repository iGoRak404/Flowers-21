import React, { useEffect, useRef } from 'react';

interface SunflowerBloomSVGProps {
  interactive?: boolean;
}

interface FloatingPetal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  scale: number;
}

/**
 * Animación sutil y refinada de pétalos de girasol y destellos dorados en el fondo.
 * Diseñada para mantener el fondo despejado y elegante, sin tapar ni competir
 * con el ramo principal ni con la carta de dedicatoria.
 */
export const SunflowerBloomSVG: React.FC<SunflowerBloomSVGProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Crear pétalos de girasol dorados flotando suavemente en la brisa
    const petals: FloatingPetal[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 14 + 10,
      speedY: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.4) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.45 + 0.25,
      scale: Math.random() * 0.4 + 0.8
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.005) * 0.5 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) p.x = -30;
        if (p.x < -40) p.x = width + 30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.opacity;

        // Dibujar pétalo dorado de girasol estilizado
        const grad = ctx.createLinearGradient(0, -p.size, 0, p.size);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#facc15');
        grad.addColorStop(0.8, '#f59e0b');
        grad.addColorStop(1, '#d97706');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.45, -p.size * 0.4, p.size * 0.45, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.45, p.size * 0.5, -p.size * 0.45, -p.size * 0.4, 0, -p.size);
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [interactive]);

  return (
    <div
      id="sunflower-ambient-background"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
    >
      {/* Resplandor áureo sutil en las esquinas */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-radial from-amber-500/10 via-yellow-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-radial from-yellow-500/10 to-transparent blur-3xl pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
