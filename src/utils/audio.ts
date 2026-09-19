/**
 * Generador y controlador de sonido con Web Audio API pura
 * Control de silencio global y compatibilidad con elementos de audio HTML
 */
let audioCtx: AudioContext | null = null;
let isMutedGlobally = false;
const muteListeners = new Set<(muted: boolean) => void>();

export function setGlobalMuted(muted: boolean) {
  isMutedGlobally = muted;
  if (audioCtx) {
    if (muted && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    } else if (!muted && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }
  muteListeners.forEach((fn) => fn(muted));
}

export function isGlobalMuted(): boolean {
  return isMutedGlobally;
}

export function subscribeMuteState(callback: (muted: boolean) => void): () => void {
  muteListeners.add(callback);
  return () => {
    muteListeners.delete(callback);
  };
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || isMutedGlobally) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended' && !isMutedGlobally) {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playFlowerChime(pitchModifier = 1) {
  if (isMutedGlobally) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Notas en escala pentatónica cálida (Frecuencias: E5, G#5, B5, E6)
    const notes = [659.25, 830.61, 987.77, 1318.51];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitchModifier, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch {
    // Ignorar si el navegador bloquea audio antes de interacción de usuario
  }
}

export function playGentleSparkle() {
  if (isMutedGlobally) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.exponentialRampToValueAtTime(2093.0, now + 0.25); // C7

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Fallback silencioso
  }
}

export function playCelestialChime() {
  if (isMutedGlobally) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Acorde etéreo brillante (C#6, G#6, C#7, F7)
    const freqs = [1108.73, 1661.22, 2217.46, 2793.83];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.025, now + idx * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.95);
    });
  } catch {
    // Fallback silencioso
  }
}

