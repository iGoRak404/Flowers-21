/**
 * Sistema de música de fondo para Flores Amarillas
 * - Únicamente tienen música:
 *   1. Keisy -> Youth (Stray Kids)
 *   2. Vane (anteriormente Naty) -> Could Have Been Me (Sing 2)
 *   3. Leslie -> Mockingbird (Eminem)
 *   4. Skarlet -> Lugar Seguro (Jay Wheeler)
 * - Música primaveral suave en pantalla de login.
 * - La música arranca automáticamente EXACTAMENTE al momento de salir la carta.
 * - Sin botones de pausar, pasar ni controles innecesarios.
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

/**
 * Resuelve la ruta absoluta exacta para que funcione tanto en desarrollo local,
 * en subdirectorios de GitHub Pages (/repositorio/) y con o sin barra final en la URL.
 */
export function resolveAudioPath(filename: string): string {
  if (typeof window === 'undefined') return `/assets/audio/${filename}`;

  try {
    const baseUri = document.baseURI || window.location.href;
    const url = new URL(baseUri);
    let path = url.pathname;

    // Si la ruta termina en un archivo (como index.html), eliminarlo
    if (/\.[a-zA-Z0-9]+$/.test(path)) {
      path = path.substring(0, path.lastIndexOf('/') + 1);
    }
    if (!path.endsWith('/')) {
      path += '/';
    }

    return `${url.origin}${path}assets/audio/${filename}`;
  } catch {
    return `./assets/audio/${filename}`;
  }
}

class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private loginAudio: HTMLAudioElement | null = null;
  private isLoginActive = true;
  private isLoginMusicPlaying = false;
  private isPrepared = false;
  private unlockGestureAttached = false;
  private unlockHandlerRef: (() => void) | null = null;
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
      // Reintento de ruta alternativa si falla la ruta base
      if (this.audio && this.currentSong) {
        const fallbacks = [
          `/assets/audio/${this.currentSong.filename}`,
          `./assets/audio/${this.currentSong.filename}`,
          `assets/audio/${this.currentSong.filename}`,
        ];
        const nextFallback = fallbacks.find((fb) => !this.audio?.src.endsWith(fb));
        if (nextFallback && this.audio) {
          this.audio.src = nextFallback;
          if (this.isPlayingState) {
            this.audio.play().catch(() => {});
          }
        }
      }
    });

    // Iniciar de inmediato la música de login
    this.startLoginMusic();
  }

  /**
   * Música primaveral suave para la pantalla de login mientras caen los pétalos
   * Volumen agradable y ambiental (0.35). Sin controles en pantalla.
   * Auto-desbloqueo en móviles en cualquier interacción del usuario.
   */
  public startLoginMusic() {
    if (typeof window === 'undefined') return;
    this.isLoginActive = true;

    if (!this.loginAudio) {
      this.loginAudio = new Audio();
      this.loginAudio.preload = 'auto';
      this.loginAudio.loop = true;
      this.loginAudio.volume = 0.35;

      this.loginAudio.addEventListener('error', () => {
        if (this.loginAudio && !this.loginAudio.src.endsWith('/spring_login.mp3')) {
          this.loginAudio.src = `/assets/audio/spring_login.mp3`;
          if (this.isLoginActive) {
            this.loginAudio.play().catch(() => {});
          }
        }
      });
    }

    const expectedSrc = resolveAudioPath('spring_login.mp3');
    if (!this.loginAudio.src || !this.loginAudio.src.includes('spring_login.mp3')) {
      this.loginAudio.src = expectedSrc;
      this.loginAudio.load();
    }

    this.loginAudio.volume = 0.35;

    // Intentar reproducción automática directa
    const playPromise = this.loginAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isLoginMusicPlaying = true;
        })
        .catch(() => {
          // Bloqueo de política del navegador: esperar el primer toque/clic
          this.attachLoginUnlockListeners();
        });
    } else {
      this.attachLoginUnlockListeners();
    }
  }

  private attachLoginUnlockListeners() {
    if (this.unlockGestureAttached || typeof window === 'undefined') return;
    this.unlockGestureAttached = true;

    const unlockHandler = () => {
      if (!this.isLoginActive || !this.loginAudio) {
        this.cleanupLoginUnlockListeners();
        return;
      }

      this.loginAudio.volume = 0.35;
      const p = this.loginAudio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isLoginMusicPlaying = true;
          this.cleanupLoginUnlockListeners();
        }).catch(() => {
          // Si el navegador requirió otro tipo de interacción, permanece escuchando
        });
      }
    };

    this.unlockHandlerRef = unlockHandler;
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('touchend', unlockHandler, { passive: true });
    window.addEventListener('pointerup', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  private cleanupLoginUnlockListeners() {
    if (!this.unlockGestureAttached || !this.unlockHandlerRef || typeof window === 'undefined') return;
    this.unlockGestureAttached = false;
    window.removeEventListener('click', this.unlockHandlerRef);
    window.removeEventListener('touchend', this.unlockHandlerRef);
    window.removeEventListener('pointerup', this.unlockHandlerRef);
    window.removeEventListener('keydown', this.unlockHandlerRef);
    this.unlockHandlerRef = null;
  }

  /**
   * Detiene por completo la música del login al ingresar a la dedicatoria
   */
  public stopLoginMusic() {
    this.isLoginActive = false;
    this.cleanupLoginUnlockListeners();
    if (this.loginAudio) {
      try {
        this.loginAudio.pause();
        this.loginAudio.currentTime = 0;
      } catch {}
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
   * Se ejecuta durante el clic o toque en "Ingresar a mi dedicatoria".
   * Inicia el audio del usuario en silencio (volumen 0) para activar el permiso
   * permanente del navegador sin que suene nada durante la animación del ramo.
   */
  public prepareUserAudio(username: string) {
    this.stopLoginMusic();
    if (!this.audio) return;
    const targetSong = getSongForUser(username);
    if (!targetSong) {
      this.stop(true);
      return;
    }

    this.isPrepared = true;
    this.currentSong = targetSong;
    this.audio.src = resolveAudioPath(targetSong.filename);
    this.audio.load();

    // Silencioso (volumen 0) para obtener el token de usuario continuo en iOS/Android/Chrome
    this.audio.volume = 0;
    this.audio.muted = false;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Si el navegador no lo activó de inmediato, se activará al salir la carta
      });
    }
  }

  /**
   * Inicia la canción a todo volumen EXACTAMENTE cuando la carta se despliega
   */
  public playUserSong(username: string) {
    if (!this.audio) return;
    const targetSong = getSongForUser(username);
    if (!targetSong) {
      this.stop(true);
      return;
    }

    this.isPrepared = false;
    this.currentSong = targetSong;
    const expectedSrc = resolveAudioPath(targetSong.filename);
    if (!this.audio.src || !this.audio.src.includes(targetSong.filename)) {
      this.audio.src = expectedSrc;
      this.audio.load();
    }

    // Reiniciar al segundo 0 y subir el volumen a 1 (o 0 si el usuario lo silenció)
    try {
      this.audio.currentTime = 0;
    } catch {}

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
          // Respaldo para navegadores estrictos: activar con el primer toque en cualquier lugar
          const unlockOnAnyTouch = () => {
            if (this.audio && !this.isMutedState) {
              this.audio.volume = 1;
              this.audio.play().then(() => {
                this.isPlayingState = true;
                this.notify();
              }).catch(() => {});
            }
            window.removeEventListener('click', unlockOnAnyTouch);
            window.removeEventListener('touchend', unlockOnAnyTouch);
            window.removeEventListener('pointerup', unlockOnAnyTouch);
          };
          window.addEventListener('click', unlockOnAnyTouch, { once: true, passive: true });
          window.addEventListener('touchend', unlockOnAnyTouch, { once: true, passive: true });
          window.addEventListener('pointerup', unlockOnAnyTouch, { once: true, passive: true });
        });
    } else {
      this.isPlayingState = true;
      this.notify();
    }
  }

  /**
   * Detiene el audio del usuario.
   * @param force Si es true (ej: cerrar sesión), detiene y pausa por completo.
   * Si es false y está en estado preparado (fase ramo), mantiene el warmup en volumen 0.
   */
  public stop(force = false) {
    if (this.isPrepared && !force) {
      if (this.audio) {
        this.audio.volume = 0;
      }
      return;
    }

    this.isPrepared = false;
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
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

