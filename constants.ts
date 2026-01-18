export const SCREEN_WIDTH = 600;
export const SCREEN_HEIGHT = 800;

export const PLAYER_SPEED = 5;
export const SCROLL_SPEED = 1.5;

export const WEAPON_COOLDOWN_AIR = 150; // ms
export const WEAPON_COOLDOWN_GROUND = 500; // ms
export const INVINCIBILITY_TIME = 100; // frames

// Dimensions
export const PLAYER_SIZE = 32;
export const ENEMY_AIR_SIZE = 32;
export const ENEMY_TURRET_SIZE = 40;
export const ENEMY_BOSS_SIZE = 120;
export const PROJECTILE_SIZE = 8;

// Colors (Tailwind Palette equivalents)
export const COLORS = {
  PLAYER: '#38bdf8', // Sky 400
  ENEMY_AIR: '#ef4444', // Red 500
  ENEMY_TURRET: '#f97316', // Orange 500
  ENEMY_BOSS: '#a855f7', // Purple 500
  BULLET_PLAYER: '#fbbf24', // Amber 400
  BULLET_ENEMY: '#f472b6', // Pink 400
  LASER: '#60a5fa', // Blue 400
  BOMB_RETICLE: '#22c55e', // Green 500
  STAR: '#ffffff',
};

// Key Mapping
export const KEYS = {
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  FIRE_AIR: ['z', 'Z', 'j', 'J', ' '], // Space also fires air
  FIRE_GROUND: ['x', 'X', 'k', 'K'],
  ULTIMATE: ['b', 'B', 'l', 'L'],
};