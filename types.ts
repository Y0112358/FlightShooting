export enum WeaponType {
  MISSILE = 'MISSILE', // Red: Spread
  LASER = 'LASER',     // Blue: Pierce
}

export enum GroundWeaponLevel {
  SINGLE = 1,
  BLAST = 2,
  AUTO = 3,
}

export enum EnemyType {
  AIRCRAFT = 'AIRCRAFT',
  TURRET = 'TURRET',
  SUPPLY = 'SUPPLY',
  BOSS = 'BOSS',
}

export enum PowerUpType {
  RED = 'RED',   // Upgrade Missile
  BLUE = 'BLUE', // Upgrade Laser
  GREEN = 'GREEN', // Upgrade Ground
  HEAL = 'HEAL',
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  airWeaponType: WeaponType;
  airWeaponLevel: number; // 1-5
  groundWeaponLevel: GroundWeaponLevel; // 1-3
  ultimates: number;
  invincibleTimer: number;
  lastFiredAir: number;
  lastFiredGround: number;
}

export interface Enemy extends Entity {
  type: EnemyType;
  angle: number; // For turrets
  phase?: number; // For Boss
  scoreValue: number;
  fireTimer: number;
}

export interface Projectile extends Entity {
  isPlayer: boolean;
  damage: number;
  isGround: boolean; // True if it hits ground targets
  target?: Vector2D; // For ground bombs or homing
  blastRadius?: number; // For ground AOE
  penetrates?: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  waveIndex: number;
  waveTimer: number;
  gameOver: boolean;
  paused: boolean;
  backgroundOffset: number;
  shakeTimer: number;
  flashTimer: number; // For ultimate effect
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fireAir: boolean; // J / Z
  fireGround: boolean; // K / X
  ultimate: boolean; // L / B
}