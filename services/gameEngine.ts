import {
  GameState,
  InputState,
  Player,
  Projectile,
  Enemy,
  WeaponType,
  GroundWeaponLevel,
  EnemyType,
  Particle,
  PowerUp,
  PowerUpType
} from '../types';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLAYER_SPEED,
  SCROLL_SPEED,
  WEAPON_COOLDOWN_AIR,
  WEAPON_COOLDOWN_GROUND,
  PLAYER_SIZE,
  ENEMY_AIR_SIZE,
  ENEMY_TURRET_SIZE,
  ENEMY_BOSS_SIZE,
  INVINCIBILITY_TIME
} from '../constants';
import { checkAABB, checkCircleCollision, clamp, generateId, getDistance, randomRange } from './gameUtils';

// --- Spawning Logic ---

const spawnEnemy = (state: GameState, x: number, type: EnemyType, levelFactor: number) => {
  const isBoss = type === EnemyType.BOSS;
  let hp = 10 * levelFactor;
  let width = ENEMY_AIR_SIZE;
  let height = ENEMY_AIR_SIZE;
  let vy = 2;

  if (type === EnemyType.TURRET) {
    hp = 20 * levelFactor;
    width = ENEMY_TURRET_SIZE;
    height = ENEMY_TURRET_SIZE;
    vy = SCROLL_SPEED; // Moves with background
  } else if (type === EnemyType.SUPPLY) {
    hp = 5;
    vy = 3;
  } else if (isBoss) {
    hp = 500 * levelFactor;
    width = ENEMY_BOSS_SIZE;
    height = ENEMY_BOSS_SIZE;
    vy = 1; // Moves slowly into position then stops usually
  }

  state.enemies.push({
    id: generateId(),
    x,
    y: -height,
    width,
    height,
    vx: type === EnemyType.AIRCRAFT ? Math.sin(Date.now() / 1000) * 2 : 0,
    vy,
    hp,
    maxHp: hp,
    type,
    angle: 0,
    markedForDeletion: false,
    scoreValue: isBoss ? 1000 : 100,
    fireTimer: 0,
    phase: isBoss ? 1 : undefined,
  });
};

const handleSpawning = (state: GameState) => {
  state.waveTimer++;

  // Simple procedural generation for demo purposes
  // In a real app, parse Level 1-10 data structures here
  const spawnRate = Math.max(20, 100 - state.level * 5); // Spawns get faster
  
  if (state.waveTimer % spawnRate === 0) {
    // 10% chance for supply, 20% turret, 70% aircraft
    const rand = Math.random();
    if (rand < 0.1) {
      spawnEnemy(state, randomRange(50, SCREEN_WIDTH - 50), EnemyType.SUPPLY, state.level);
    } else if (rand < 0.3) {
      spawnEnemy(state, randomRange(50, SCREEN_WIDTH - 50), EnemyType.TURRET, state.level);
    } else {
      spawnEnemy(state, randomRange(50, SCREEN_WIDTH - 50), EnemyType.AIRCRAFT, state.level);
    }
  }

  // Boss Spawn Condition (e.g., every 30 seconds or certain score)
  // For demo, let's spawn a boss if one doesn't exist and waveTimer is high
  const hasBoss = state.enemies.some(e => e.type === EnemyType.BOSS);
  if (!hasBoss && state.waveTimer > 2000) {
     spawnEnemy(state, SCREEN_WIDTH / 2 - ENEMY_BOSS_SIZE / 2, EnemyType.BOSS, state.level);
     state.waveTimer = 0; // Reset for next cycle
     state.level++; // Increment level on boss spawn for difficulty ramp
  }
};

// --- Weapon Logic ---

const fireAirWeapon = (state: GameState, time: number) => {
  const p = state.player;
  if (time - p.lastFiredAir < WEAPON_COOLDOWN_AIR) return;

  p.lastFiredAir = time;
  const level = p.airWeaponLevel;

  const createBullet = (vx: number, vy: number, damage: number, spread: number = 0) => {
    state.projectiles.push({
      id: generateId(),
      x: p.x + p.width / 2 - 4,
      y: p.y,
      width: 8,
      height: 16,
      vx: vx + spread,
      vy,
      isPlayer: true,
      damage,
      isGround: false,
      hp: 1, maxHp: 1, markedForDeletion: false,
      penetrates: p.airWeaponType === WeaponType.LASER
    });
  };

  if (p.airWeaponType === WeaponType.LASER) {
    // Blue: Fast, piercing, narrow
    const damage = 2 + level;
    createBullet(0, -12, damage);
    if (level >= 3) {
        createBullet(-1, -12, damage);
        createBullet(1, -12, damage);
    }
  } else {
    // Red: Missile/Spread
    const damage = 3; // Higher base damage, slower fire
    createBullet(0, -8, damage);
    if (level >= 2) {
      createBullet(-2, -7, damage);
      createBullet(2, -7, damage);
    }
    if (level >= 4) {
      createBullet(-4, -6, damage);
      createBullet(4, -6, damage);
    }
  }
};

const fireGroundWeapon = (state: GameState, time: number) => {
  const p = state.player;
  if (time - p.lastFiredGround < WEAPON_COOLDOWN_GROUND) return;

  p.lastFiredGround = time;
  const targetY = p.y - 200; // Fixed reticle distance
  const targetX = p.x + p.width / 2;

  // Logic for Auto-Lock (Level 3)
  let actualTargetX = targetX;
  let actualTargetY = targetY;

  if (p.groundWeaponLevel === GroundWeaponLevel.AUTO) {
    // Find closest ground target near reticle
    const target = state.enemies.find(e => 
      (e.type === EnemyType.TURRET || e.type === EnemyType.BOSS) &&
      getDistance({x: targetX, y: targetY}, {x: e.x + e.width/2, y: e.y + e.height/2}) < 150
    );
    if (target) {
      actualTargetX = target.x + target.width/2;
      actualTargetY = target.y + target.height/2;
    }
  }

  // Spawn Bomb
  state.projectiles.push({
    id: generateId(),
    x: p.x + p.width / 2,
    y: p.y + p.height / 2,
    width: 12,
    height: 12,
    vx: (actualTargetX - (p.x + p.width/2)) / 20, // Travel to target in 20 frames
    vy: (actualTargetY - (p.y + p.height/2)) / 20,
    isPlayer: true,
    isGround: true,
    damage: 20,
    target: { x: actualTargetX, y: actualTargetY },
    blastRadius: p.groundWeaponLevel >= GroundWeaponLevel.BLAST ? 80 : 30,
    hp: 1, maxHp: 1, markedForDeletion: false,
  });
};

const triggerUltimate = (state: GameState) => {
  if (state.player.ultimates > 0) {
    state.player.ultimates--;
    state.flashTimer = 20;
    state.shakeTimer = 30;
    
    // Clear enemy bullets
    state.projectiles = state.projectiles.filter(p => p.isPlayer);
    
    // Damage all enemies
    state.enemies.forEach(e => {
      e.hp -= 100; // Massive damage
      spawnExplosion(state, e.x + e.width/2, e.y + e.height/2, 'CYAN', 10);
    });
  }
};

const spawnExplosion = (state: GameState, x: number, y: number, color: string, count: number) => {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      id: generateId(),
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: Math.random() * 5 + 2
    });
  }
};

const spawnPowerUp = (state: GameState, x: number, y: number) => {
  const types = [PowerUpType.RED, PowerUpType.BLUE, PowerUpType.GREEN, PowerUpType.HEAL];
  const type = types[Math.floor(Math.random() * types.length)];
  state.powerUps.push({
    id: generateId(),
    x, y,
    width: 24, height: 24,
    vx: 0, vy: 2,
    hp: 1, maxHp: 1, markedForDeletion: false,
    type
  });
};

// --- Main Update Function ---

export const updateGameState = (state: GameState, input: InputState): GameState => {
  if (state.gameOver || state.paused) return state;

  const now = Date.now();

  // 1. Player Movement
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= PLAYER_SPEED;
  if (input.right) dx += PLAYER_SPEED;
  if (input.up) dy -= PLAYER_SPEED;
  if (input.down) dy += PLAYER_SPEED;

  state.player.x = clamp(state.player.x + dx, 0, SCREEN_WIDTH - state.player.width);
  state.player.y = clamp(state.player.y + dy, 0, SCREEN_HEIGHT - state.player.height);

  if (state.player.invincibleTimer > 0) state.player.invincibleTimer--;
  if (state.shakeTimer > 0) state.shakeTimer--;
  if (state.flashTimer > 0) state.flashTimer--;

  // 2. Weapons
  if (input.fireAir) fireAirWeapon(state, now);
  if (input.fireGround) fireGroundWeapon(state, now);
  if (input.ultimate && !state.player.lastFiredAir /* debounce hack not needed if using edge trigger logic in hook */) {
     // Handled via edge trigger in hook usually, or simple boolean here with cooldown
     // For this loop, we assume input.ultimate is "pressed"
     // We should add a cooldown/state flag for ultimate key press to avoid rapid fire
  }

  // 3. Projectiles Update
  state.projectiles.forEach(p => {
    if (p.isGround && p.target) {
      // Logic for ground bombs: move to target then explode
      const dist = getDistance({x: p.x, y: p.y}, p.target);
      if (dist < 10) {
         p.markedForDeletion = true;
         // AOE Damage
         spawnExplosion(state, p.x, p.y, '#fbbf24', 10);
         state.enemies.forEach(e => {
             // Ground bombs only hit Ground units (Turrets, Boss)
             const canHit = e.type === EnemyType.TURRET || e.type === EnemyType.BOSS;
             if (canHit && getDistance({x: p.x, y: p.y}, {x: e.x + e.width/2, y: e.y + e.height/2}) < (p.blastRadius || 30) + e.width/2) {
                 e.hp -= p.damage;
             }
         });
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    // Out of bounds
    if (p.y < -50 || p.y > SCREEN_HEIGHT + 50 || p.x < -50 || p.x > SCREEN_WIDTH + 50) {
      p.markedForDeletion = true;
    }
  });

  // 4. Enemies Update & AI
  state.enemies.forEach(e => {
    e.x += e.vx;
    e.y += e.vy;

    if (e.type === EnemyType.TURRET) {
        // Rotate towards player
        const cx = e.x + e.width / 2;
        const cy = e.y + e.height / 2;
        e.angle = Math.atan2(state.player.y - cy, state.player.x - cx);
        
        // Fire at player
        e.fireTimer++;
        if (e.fireTimer > 100 && e.y > 0 && e.y < SCREEN_HEIGHT) {
            e.fireTimer = 0;
            const bulletSpeed = 4;
            state.projectiles.push({
                id: generateId(),
                x: cx, y: cy,
                width: 8, height: 8,
                vx: Math.cos(e.angle) * bulletSpeed,
                vy: Math.sin(e.angle) * bulletSpeed,
                isPlayer: false,
                isGround: false,
                damage: 10,
                hp: 1, maxHp: 1, markedForDeletion: false
            });
        }
    } else if (e.type === EnemyType.BOSS) {
        // Simple Boss AI
        if (e.y < 100) e.vy = 1; else e.vy = 0; // Enter screen then stop
        e.fireTimer++;
        
        // Phase logic
        if (e.hp < e.maxHp * 0.5) e.phase = 2;

        const rate = e.phase === 2 ? 30 : 60;
        
        if (e.fireTimer > rate) {
            e.fireTimer = 0;
            // Boss Pattern: Spread shot
            for(let i=-2; i<=2; i++) {
                state.projectiles.push({
                    id: generateId(),
                    x: e.x + e.width/2, y: e.y + e.height,
                    width: 10, height: 10,
                    vx: i * 2,
                    vy: 5,
                    isPlayer: false,
                    isGround: false,
                    damage: 10,
                    hp: 1, maxHp: 1, markedForDeletion: false
                });
            }
        }
    } else if (e.type === EnemyType.AIRCRAFT) {
        // Basic shoot down
        e.fireTimer++;
        if (e.fireTimer > 120 && Math.random() < 0.01) {
             state.projectiles.push({
                id: generateId(),
                x: e.x + e.width/2, y: e.y + e.height,
                width: 6, height: 6,
                vx: 0, vy: 5,
                isPlayer: false,
                isGround: false,
                damage: 10,
                hp: 1, maxHp: 1, markedForDeletion: false
            });
        }
    }

    // Cleanup off-screen
    if (e.y > SCREEN_HEIGHT + 100) e.markedForDeletion = true;
  });

  // 5. Collision Detection
  
  // Player vs Enemy Projectiles/Bodies
  if (state.player.invincibleTimer === 0) {
      // Vs Projectiles
      state.projectiles.forEach(p => {
          if (!p.isPlayer && !p.markedForDeletion && checkAABB(state.player, p)) {
              state.player.hp -= p.damage;
              state.player.invincibleTimer = INVINCIBILITY_TIME;
              p.markedForDeletion = true;
              state.shakeTimer = 10;
              spawnExplosion(state, state.player.x, state.player.y, '#ef4444', 5);
          }
      });
      // Vs Enemies
      state.enemies.forEach(e => {
          if (!e.markedForDeletion && checkAABB(state.player, e)) {
              state.player.hp -= 20;
              state.player.invincibleTimer = INVINCIBILITY_TIME;
              state.shakeTimer = 15;
              spawnExplosion(state, state.player.x, state.player.y, '#ef4444', 10);
              // Crash damage to enemy
              e.hp -= 50; 
          }
      });
  }

  // Player Projectiles vs Enemies
  state.projectiles.forEach(p => {
      if (p.isPlayer && !p.isGround && !p.markedForDeletion) {
          state.enemies.forEach(e => {
              if (!e.markedForDeletion) {
                  // Air bullets hit everything, but logical checks apply
                  // Turrets are ground units, technically air bullets shouldn't hit them in some rigorous sims,
                  // but for fun arcades, we usually allow it or require ground bombs. 
                  // Prompt implies "Air-to-Air" and "Air-to-Ground", suggesting separation.
                  // Let's enforce: Air weapons -> Aircraft/Supply/Boss. Ground weapons -> Turret/Boss.
                  
                  const isAirTarget = e.type === EnemyType.AIRCRAFT || e.type === EnemyType.SUPPLY || e.type === EnemyType.BOSS;
                  
                  if (isAirTarget && checkAABB(p, e)) {
                      e.hp -= p.damage;
                      if (!p.penetrates) p.markedForDeletion = true;
                      spawnExplosion(state, p.x, p.y, '#ffffff', 2);
                  }
              }
          });
      }
  });

  // 6. Entity Death & Loot
  state.enemies.forEach(e => {
      if (e.hp <= 0 && !e.markedForDeletion) {
          e.markedForDeletion = true;
          state.score += e.scoreValue;
          spawnExplosion(state, e.x, e.y, '#f97316', 15);
          if (e.type === EnemyType.SUPPLY) {
              spawnPowerUp(state, e.x, e.y);
          }
      }
  });

  // 7. Powerups
  state.powerUps.forEach(p => {
      p.y += 2; // fall down
      if (checkAABB(state.player, p)) {
          p.markedForDeletion = true;
          state.score += 50;
          if (p.type === PowerUpType.HEAL) {
              state.player.hp = Math.min(state.player.hp + 20, state.player.maxHp);
          } else if (p.type === PowerUpType.RED) {
              state.player.airWeaponType = WeaponType.MISSILE;
              state.player.airWeaponLevel = Math.min(state.player.airWeaponLevel + 1, 5);
          } else if (p.type === PowerUpType.BLUE) {
              state.player.airWeaponType = WeaponType.LASER;
              state.player.airWeaponLevel = Math.min(state.player.airWeaponLevel + 1, 5);
          } else if (p.type === PowerUpType.GREEN) {
              state.player.groundWeaponLevel = Math.min(state.player.groundWeaponLevel + 1, 3);
          }
      }
      if (p.y > SCREEN_HEIGHT) p.markedForDeletion = true;
  });

  // 8. Background & Particles
  state.backgroundOffset = (state.backgroundOffset + SCROLL_SPEED) % SCREEN_HEIGHT;
  state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
  });

  // Filter deleted entities
  state.enemies = state.enemies.filter(e => !e.markedForDeletion);
  state.projectiles = state.projectiles.filter(p => !p.markedForDeletion);
  state.particles = state.particles.filter(p => p.life > 0);
  state.powerUps = state.powerUps.filter(p => !p.markedForDeletion);

  // Spawning
  handleSpawning(state);

  // Game Over Check
  if (state.player.hp <= 0) {
      state.gameOver = true;
  }

  return state;
};