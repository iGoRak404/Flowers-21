/**
 * Sistema de música de fondo para Flores Amarillas
 * - Únicamente tienen música:
 *   1. Keisy -> Youth (Stray Kids)
 *   2. Vane (anteriormente Naty) -> Could Have Been Me (Sing 2)
 *   3. Leslie -> Mockingbird (Eminem)
 *   4. Skarlet -> Lugar Seguro (Jay Wheeler)
 * - La música arranca automáticamente EXACTAMENTE al salir la carta de dedicatoria.
 * - Sin botones de pausar, pasar o selector de canciones.
 */

export interface SongData {
  id: string;
  title: string;
  artist: string;
  filename: string;
}

export const ALL_SONGS: SongData[] = [
  {
    id: 'lugar_seguro',
    title: 'Lugar Seguro',
    artist: 'Jay Wheeler ft. Noreh',
    filename: 'lugar_seguro_jay_wheeler.mp3',
  },
  {
    id: 'could_have_been_me',
    title: 'Could Have Been Me',
    artist: 'Halsey · Sing 2',
    filename: 'could_have_been_me_sing2.mp3',
  },
  {
    id: 'mockingbird',
    title: 'Mockingbird',
    artist: 'Eminem',
    filename: 'mockingbird_eminem.mp3',
  },
  {
    id: 'youth',
    title: 'Youth (청춘)',
    artist: 'Lee Know · Stray Kids',
    filename: 'youth_stray_kids.mp3',
  },
];

// Únicas personas con canción asignada: Keisy, Vane (antes Naty), Leslie y Skarlet
export const USER_SONG_MAP: Record<string, string> = {
  keisy: 'youth',
  vane: 'could_have_been_me',
  naty: 'could_have_been_me',
  leslie: 'mockingbird',
  skarlet: 'lugar_seguro',
};

export function userHasMusic(username?: string): boolean {
  if (!username) return false;
  const clean = username.toLowerCase().trim();
  return Boolean(USER_SONG_MAP[clean]);
}

export function getSongForUser(username?: string): SongData | null {
  if (!username) return null;
  const clean = username.toLowerCase().trim();
  const songId = USER_SONG_MAP[clean];
  if (!songId) return null;
  return ALL_SONGS.find((s) => s.id === songId) || null;
}

function resolveAudioPath(filename: string): string {
  const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
  const base = (typeof meta !== 'undefined' && meta.env?.BASE_URL) || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}assets/audio/${filename}`;
}

class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private loginAudio: HTMLAudioElement | null = null;
  private isLoginActive = true;
  private isLoginMusicPlaying = false;
  private unlockGestureAttached = false;
  private currentSong: SongData | null = null;
  private isPlayingState = false;
  private isMutedState = false;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.loop = true;
    this.audio.volume = 1;

    this.audio.addEventListener('play', () => {
      this.isPlayingState = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingState = false;
      this.notify();
    });

    this.audio.addEventListener('error', () => {
      if (this.audio && this.currentSong && !this.audio.src.includes('/assets/audio/')) {
        this.audio.src = `/assets/audio/${this.currentSong.filename}`;
        if (this.isPlayingState) {
          this.audio.play().catch(() => {});
        }
      }
    });

    // Iniciar música primaveral de login
    this.startLoginMusic();
  }

  /**
   * Música primaveral suave para la pantalla de login mientras caen los pétalos
   * Volumen agradable y ambiental (0.35). Sin controles en pantalla.
   * Soporta inicio automático y desbloqueo en móvil al primer toque.
   */
  public startLoginMusic() {
    if (typeof window === 'undefined') return;
    this.isLoginActive = true;

    if (!this.loginAudio) {
      this.loginAudio = new Audio();
      this.loginAudio.preload = 'auto';
      this.loginAudio.loop = true;
      this.loginAudio.volume = 0.35; // Volumen primaveral suave y agradable
    }

    const expectedSrc = resolveAudioPath('spring_login.mp3');
    if (!this.loginAudio.src || !this.loginAudio.src.includes('spring_login.mp3')) {
      this.loginAudio.src = expectedSrc;
    }

    const playPromise = this.loginAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isLoginMusicPlaying = true;
        })
        .catch(() => {
          // Bloqueo de autoplay en móviles (iOS Safari / Android):
          // Se activa automáticamente al primer toque en cualquier parte de la pantalla
          if (!this.unlockGestureAttached) {
            this.unlockGestureAttached = true;
            const unlockHandler = () => {
              if (this.loginAudio && this.isLoginActive) {
                this.loginAudio.play().then(() => {
                  this.isLoginMusicPlaying = true;
                }).catch(() => {});
              }
              this.unlockGestureAttached = false;
              window.removeEventListener('touchstart', unlockHandler);
              window.removeEventListener('pointerdown', unlockHandler);
              window.removeEventListener('click', unlockHandler);
            };
            window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
            window.addEventListener('pointerdown', unlockHandler, { once: true, passive: true });
            window.addEventListener('click', unlockHandler, { once: true, passive: true });
          }
        });
    }
  }

  /**
   * Detiene por completo la música del login al ingresar a la dedicatoria
   */
  public stopLoginMusic() {
    this.isLoginActive = false;
    if (this.loginAudio) {
      this.loginAudio.pause();
      this.loginAudio.currentTime = 0;
    }
    this.isLoginMusicPlaying = false;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // Silenciar errores en listeners
      }
    });
  }

  /**
   * Prepara y desbloquea el permiso de audio en navegadores móviles durante el clic de inicio de sesión
   * sin reproducir sonido aún (se pausa al instante).
   */
  public prepareUserAudio(username: string) {
    this.stopLoginMusic();
    if (!this.audio) return;
    const targetSong = getSongForUser(username);
    if (!targetSong) {
      this.stop();
      return;
    }

    this.currentSong = targetSong;
    this.audio.src = resolveAudioPath(targetSong.filename);
    this.audio.load();

    // Desbloqueo silencioso para iOS Safari / Android Chrome
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Se pausa de inmediato para que permanezca en silencio hasta que salga la carta
          this.audio?.pause();
          if (this.audio) {
            this.audio.currentTime = 0;
          }
          this.isPlayingState = false;
          this.notify();
        })
        .catch(() => {
          // Si el navegador bloqueó el warmup, no hay problema, se intentará al salir la carta
        });
    }
  }

  /**
   * Inicia la reproducción automática al momento exacto en que la carta aparece
   */
  public playUserSong(username: string) {
    if (!this.audio) return;
    const targetSong = getSongForUser(username);
    if (!targetSong) {
      this.stop();
      return;
    }

    this.currentSong = targetSong;
    const expectedSrc = resolveAudioPath(targetSong.filename);
    if (!this.audio.src || !this.audio.src.includes(targetSong.filename)) {
      this.audio.src = expectedSrc;
    }

    this.audio.currentTime = 0;
    this.audio.muted = this.isMutedState;
    this.audio.volume = this.isMutedState ? 0 : 1;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlayingState = true;
          this.notify();
        })
        .catch(() => {
          // Si el navegador bloqueó, se reintentará en el siguiente toque
          const retryOnTouch = () => {
            if (this.audio && !this.isMutedState) {
              this.audio.play().then(() => {
                this.isPlayingState = true;
                this.notify();
              }).catch(() => {});
            }
            window.removeEventListener('pointerdown', retryOnTouch);
            window.removeEventListener('touchstart', retryOnTouch);
            window.removeEventListener('click', retryOnTouch);
          };
          window.addEventListener('pointerdown', retryOnTouch, { once: true, passive: true });
          window.addEventListener('touchstart', retryOnTouch, { once: true, passive: true });
          window.addEventListener('click', retryOnTouch, { once: true, passive: true });
        });
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlayingState = false;
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.isMutedState = muted;
    if (this.audio) {
      this.audio.muted = muted;
      this.audio.volume = muted ? 0 : 1;
      if (!muted && this.isPlayingState && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    }
    this.notify();
  }

  public getCurrentSong(): SongData | null {
    return this.currentSong;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }
}

export const musicManager = new MusicManager();
