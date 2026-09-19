export type AnimationType =
  | 'petals_rain'
  | 'sunflower_bloom'
  | 'floating_sparkles'
  | 'golden_bouquet'
  | 'spiral_vortex'
  | 'golden_butterflies'
  | 'celestial_flowers'
  | 'aurora_flowers'
  | 'crystal_petals'
  | 'sunburst_dandelions';

export interface UserConfig {
  username: string;
  password: string;
  displayName: string;
  customMessage: string;
  animationType: AnimationType;
  roleDescription?: string;
  avatarSeed?: string;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  hueOffset: number;
  petalType: number;
}
