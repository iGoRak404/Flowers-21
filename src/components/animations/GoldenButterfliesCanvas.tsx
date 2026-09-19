import React, { useEffect, useRef } from 'react';
import { playGentleSparkle, isGlobalMuted } from '../../utils/audio';

interface GoldenButterfliesCanvasProps {
  interactive?: boolean;
}

interface Butterfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  flapPhase: number;
  flapSpeed: number;
  angle: number;
  colorGrad: string[];
  glow: string;
  wanderTimer: number;
  tailTimer: number;
  life: number;
  isEphemeral?: boolean;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  isPetal?: boolean;
}

interface Firefly {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  pulseSpeed: number;
  driftSpeedX: number;
  driftSpeedY: number;
  color: string;
}

export const GoldenButterfliesCanvas: React.FC<GoldenButterfliesCanvasProps> = ({
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const butterfliesRef = useRef<Butterfly[]>([]);
  const stardustRef = useRef<StardustParticle[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false
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

    const butterflyPalettes = [
      { colors: ['#ffffff', '#fef08a', '#facc15', '#eab308', '#ca8a04'], glow: '#facc15' },
      { colors: ['#fffbeb', '#fde047', '#fbbf24', '#f59e0b', '#b45309'], glow: '#fbbf24' },
      { colors: ['#fef9c3', '#fef08a', '#fde047', '#f59e0b', '#d97706'], glow: '#fef08a' },
      { colors: ['#ffffff', '#fef3c7', '#fde68a', '#f59e0b', '#92400e'], glow: '#fde68a' }
    ];

    const createButterfly = (initX?: number, initY?: number, isEphemeral = false): Butterfly => {
      const x = initX !== undefined ? initX : Math.random() * width;
      const y = initY !== undefined ? initY : Math.random() * height;
      const palette = butterflyPalettes[Math.floor(Math.random() * butterflyPalettes.length)];
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: isEphemeral ? 14 + Math.random() * 8 : 18 + Math.random() * 12,
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: 0.16 + Math.random() * 0.1,
        angle: Math.random() * Math.PI * 2,
        colorGrad: palette.colors,
        glow: palette.glow,
        wanderTimer: Math.floor(Math.random() * 90) + 40,
        tailTimer: 0,
        life: isEphemeral ? 280 : 999999,
        isEphemeral
      };
    };

    // Cantidad equilibrada de mariposas (reducida en móvil para evitar sobrecarga de GPU)
    const butterflyCount = isMobile ? 3 : 8;
    butterfliesRef.current = Array.from({ length: butterflyCount }, () => createButterfly());

    // Luciérnagas doradas danzantes
    const fireflyCount = isMobile ? 8 : 24;
    firefliesRef.current = Array.from({ length: fireflyCount }, () => {
      const bx = Math.random() * width;
      const by = Math.random() * height;
      return {
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        radius: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.035,
        driftSpeedX: 0.4 + Math.random() * 0.8,
        driftSpeedY: 0.3 + Math.random() * 0.6,
        color: Math.random() > 0.3 ? '#fde047' : '#fef08a'
      };
    });

    const addStardust = (
      x: number,
      y: number,
      count = 2,
      isPetal = false,
      spread = 6,
      boostVy = 0
    ) => {
      const colors = ['#ffffff', '#fef08a', '#fde047', '#f59e0b', '#fbbf24'];
      for (let i = 0; i < count; i++) {
        if (stardustRef.current.length > 220) break;
        stardustRef.current.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 + boostVy,
          size: isPetal ? 5 + Math.random() * 6 : 1.8 + Math.random() * 3.2,
          alpha: 0.95,
          decay: isPetal ? 0.008 + Math.random() * 0.012 : 0.02 + Math.random() * 0.025,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          isPetal
        });
      }
    };

    // Eventos de ratón / táctil
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      // Dejar destellos dorados en el rastro del mouse
      if (Math.random() < 0.4) {
        addStardust(e.clientX, e.clientY, 2, Math.random() < 0.25, 14, -0.4);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
        if (Math.random() < 0.4) {
          addStardust(e.touches[0].clientX, e.touches[0].clientY, 2, false, 12, -0.4);
        }
      }
    };

    const handlePointerUp = () => {
      mouseRef.current.active = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      if (!isGlobalMuted()) {
        playGentleSparkle();
      }

      // Al tocar la pantalla, nace una mariposa dorada y una explosión de destellos mágicos
      const clickX = e.clientX;
      const clickY = e.clientY;

      const burstCount = isMobile ? 6 : 14;
      addStardust(clickX, clickY, burstCount, true, 20, -1.0);

      if (butterfliesRef.current.length < (isMobile ? 5 : 18)) {
        const newB = createButterfly(clickX, clickY, true);
        newB.vx = (Math.random() - 0.5) * 2;
        newB.vy = -1.5 - Math.random() * 1.5;
        butterfliesRef.current.push(newB);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Dibujar mariposa
    const drawButterfly = (b: Butterfly) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle + Math.PI / 2);

      // Aleteo sinusoidal natural (3D perspective flap)
      const flapScaleX = Math.cos(b.flapPhase);

      // Resplandor áureo envolvente (desactivar shadowBlur costoso en celular para 60 FPS)
      if (!isMobile) {
        ctx.shadowColor = b.glow;
        ctx.shadowBlur = 10;
      }

      const wingSize = b.size;

      // Dibujar ala izquierda y derecha con gradiente dorado
      const wingGrad = ctx.createLinearGradient(0, -wingSize, 0, wingSize);
      wingGrad.addColorStop(0, b.colorGrad[0]);
      wingGrad.addColorStop(0.3, b.colorGrad[1]);
      wingGrad.addColorStop(0.7, b.colorGrad[2]);
      wingGrad.addColorStop(1, b.colorGrad[3]);

      // Función para trazar un par de alas (superior e inferior)
      const renderWingSide = (direction: number) => {
        ctx.save();
        ctx.scale(direction * flapScaleX, 1);

        // Ala Superior (Mayor y estilizada)
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.bezierCurveTo(wingSize * 0.7, -wingSize * 1.25, wingSize * 1.5, -wingSize * 0.7, wingSize * 1.35, wingSize * 0.15);
        ctx.bezierCurveTo(wingSize * 1.15, wingSize * 0.6, wingSize * 0.45, wingSize * 0.2, 2, 2);
        ctx.closePath();
        ctx.fill();

        // Venas doradas luminosas en el ala superior
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.quadraticCurveTo(wingSize * 0.7, -wingSize * 0.5, wingSize * 1.2, -wingSize * 0.4);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.quadraticCurveTo(wingSize * 0.6, 0, wingSize * 1.0, wingSize * 0.15);
        ctx.stroke();

        // Ala Inferior (Menor y redondeada)
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(2, 2);
        ctx.bezierCurveTo(wingSize * 0.9, wingSize * 0.35, wingSize * 0.95, wingSize * 0.95, wingSize * 0.4, wingSize * 1.25);
        ctx.bezierCurveTo(wingSize * 0.15, wingSize * 1.35, 0, wingSize * 0.8, 1, 6);
        ctx.closePath();
        ctx.fill();

        // Borde exterior sutil
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      };

      // Dibujar ambas alas
      renderWingSide(1);
      renderWingSide(-1);

      // Cuerpo de la mariposa (Tórax y abdomen oscuro con brillo dorado)
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.2, wingSize * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeza
      ctx.beginPath();
      ctx.arc(0, -wingSize * 0.45, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.fill();

      // Antenas delicadas con puntas luminosas
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-1, -wingSize * 0.45);
      ctx.quadraticCurveTo(-wingSize * 0.35, -wingSize * 0.8, -wingSize * 0.4, -wingSize * 0.85);
      ctx.moveTo(1, -wingSize * 0.45);
      ctx.quadraticCurveTo(wingSize * 0.35, -wingSize * 0.8, wingSize * 0.4, -wingSize * 0.85);
      ctx.stroke();

      // Puntas de las antenas que brillan
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-wingSize * 0.4, -wingSize * 0.85, 1.4, 0, Math.PI * 2);
      ctx.arc(wingSize * 0.4, -wingSize * 0.85, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    let frameCount = 0;

    const loop = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. ACTUALIZAR Y DIBUJAR LUCIÉRNAGAS (FONDO VIVO Y PULSANTE)
      firefliesRef.current.forEach((ff) => {
        ff.phase += ff.pulseSpeed;
        ff.x = ff.baseX + Math.sin(frameCount * 0.015 + ff.phase) * 35;
        ff.y = ff.baseY + Math.cos(frameCount * 0.012 + ff.phase) * 25;

        // Deriva suave hacia arriba
        ff.baseY -= ff.driftSpeedY * 0.35;
        if (ff.baseY < -30) {
          ff.baseY = height + 20;
          ff.baseX = Math.random() * width;
        }

        const pulseAlpha = 0.25 + Math.sin(ff.phase) * 0.5;
        if (pulseAlpha > 0.05) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, pulseAlpha));
          if (!isMobile) {
            ctx.shadowColor = ff.color;
            ctx.shadowBlur = 10;
          }
          ctx.fillStyle = ff.color;
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.radius, 0, Math.PI * 2);
          ctx.fill();

          // Resplandor exterior difuso
          ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 2. ACTUALIZAR Y DIBUJAR POLVO DE ESTRELLAS Y PÉTALOS FLOTANTES
      for (let i = stardustRef.current.length - 1; i >= 0; i--) {
        const s = stardustRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotSpeed;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.y > height + 20 || s.x < -20 || s.x > width + 20) {
          stardustRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = Math.max(0, s.alpha);

        if (s.isPetal) {
          // Pétalo de flor dorada
          ctx.fillStyle = s.color;
          if (!isMobile) {
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 4;
          }
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.bezierCurveTo(s.size * 0.7, -s.size * 0.4, s.size * 0.7, s.size * 0.5, 0, s.size);
          ctx.bezierCurveTo(-s.size * 0.7, s.size * 0.5, -s.size * 0.7, -s.size * 0.4, 0, -s.size);
          ctx.fill();
        } else {
          // Estrellita / chispa radiante de 4 puntas
          ctx.fillStyle = s.color;
          if (!isMobile) {
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 6;
          }
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.quadraticCurveTo(0, 0, s.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, s.size);
          ctx.quadraticCurveTo(0, 0, -s.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s.size);
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. ACTUALIZAR Y DIBUJAR MARIPOSAS DORADAS
      for (let i = butterfliesRef.current.length - 1; i >= 0; i--) {
        const b = butterfliesRef.current[i];
        b.flapPhase += b.flapSpeed;
        b.wanderTimer--;
        b.tailTimer++;

        // Mariposas efímeras reducen su vida
        if (b.isEphemeral) {
          b.life--;
          if (b.life <= 0) {
            butterfliesRef.current.splice(i, 1);
            continue;
          }
        }

        // Selección de nuevo objetivo o seguimiento interactivo del mouse
        if (mouseRef.current.active && mouseRef.current.x > 0) {
          const dx = mouseRef.current.x - b.x;
          const dy = mouseRef.current.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 320 && dist > 50) {
            b.targetX = mouseRef.current.x + (Math.random() - 0.5) * 120;
            b.targetY = mouseRef.current.y + (Math.random() - 0.5) * 120;
          }
        } else if (b.wanderTimer <= 0) {
          b.targetX = Math.random() * width;
          b.targetY = Math.random() * (height * 0.85) + height * 0.05;
          b.wanderTimer = Math.floor(Math.random() * 120) + 60;
        }

        // Suave física de vuelo orgánico
        const toTargetX = b.targetX - b.x;
        const toTargetY = b.targetY - b.y;
        const targetDist = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

        if (targetDist > 10) {
          const desiredVx = (toTargetX / targetDist) * 1.8;
          const desiredVy = (toTargetY / targetDist) * 1.8;
          b.vx += (desiredVx - b.vx) * 0.035;
          b.vy += (desiredVy - b.vy) * 0.035;
        }

        // Añadir ondulación natural de vuelo
        b.vx += Math.sin(frameCount * 0.04 + i) * 0.15;
        b.vy += Math.cos(frameCount * 0.03 + i) * 0.15;

        // Limitar velocidad
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpeed = 2.4;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Calcular orientación angular suave
        const targetAngle = Math.atan2(b.vy, b.vx);
        let angleDiff = targetAngle - b.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        b.angle += angleDiff * 0.08;

        // Bordes de pantalla suaves con rebote
        if (b.x < 30) b.vx += 0.3;
        if (b.x > width - 30) b.vx -= 0.3;
        if (b.y < 30) b.vy += 0.3;
        if (b.y > height - 30) b.vy -= 0.3;

        // Dejar rastro de polvillo mágico dorado periódicamente
        if (b.tailTimer % 5 === 0) {
          addStardust(b.x, b.y, 1, false, 4, 0.2);
        }
        if (b.tailTimer % 28 === 0 && Math.random() < 0.6) {
          addStardust(b.x, b.y, 1, true, 8, 0.4);
        }

        drawButterfly(b);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [interactive]);

  return (
    <div
      id="golden-butterflies-container"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
    >
      {/* Resplandor ambiental de jardín mágico crepuscular */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-radial from-amber-400/15 via-yellow-500/8 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] rounded-full bg-radial from-yellow-400/10 to-transparent blur-3xl pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
