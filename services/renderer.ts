import { GameState, EnemyType, WeaponType } from '../types';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLORS,
  PLAYER_SIZE,
} from '../constants';

export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState) => {
  // Clear Screen
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Screen Shake
  ctx.save();
  if (state.shakeTimer > 0) {
    const dx = (Math.random() - 0.5) * 10;
    const dy = (Math.random() - 0.5) * 10;
    ctx.translate(dx, dy);
  }

  // Draw Starfield (Background)
  drawStars(ctx, state.backgroundOffset);

  // Draw Ground Enemies (Below player)
  state.enemies.forEach(e => {
    if (e.type === EnemyType.TURRET || e.type === EnemyType.BOSS) {
      drawEnemy(ctx, e);
    }
  });

  // Draw Shadows (Depth perception)
  drawShadow(ctx, state.player.x, state.player.y, state.player.width, state.player.height);
  state.enemies.forEach(e => {
      if (e.type === EnemyType.AIRCRAFT || e.type === EnemyType.SUPPLY) {
          drawShadow(ctx, e.x, e.y, e.width, e.height);
      }
  });

  // Draw Player
  if (state.player.invincibleTimer % 4 < 2) { // Flicker effect
      drawPlayer(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.airWeaponType);
  }

  // Draw Air Enemies
  state.enemies.forEach(e => {
    if (e.type === EnemyType.AIRCRAFT || e.type === EnemyType.SUPPLY) {
      drawEnemy(ctx, e);
    }
  });

  // Draw Powerups
  state.powerUps.forEach(p => {
    ctx.fillStyle = p.type === 'RED' ? '#ef4444' : p.type === 'BLUE' ? '#3b82f6' : p.type === 'GREEN' ? '#22c55e' : '#ffffff';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.fillText(p.type[0], p.x + 8, p.y + 16);
  });

  // Draw Projectiles
  state.projectiles.forEach(p => {
    ctx.fillStyle = p.isPlayer ? (p.isGround ? '#fbbf24' : '#60a5fa') : COLORS.BULLET_ENEMY;
    
    if (p.isGround && p.target && p.isPlayer) {
       // Draw Bomb falling
       ctx.beginPath();
       ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
       ctx.fill();
    } else {
       // Standard bullet
       ctx.fillRect(p.x, p.y, p.width, p.height);
    }
  });

  // Draw Particles
  state.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  });

  // Draw Crosshair (Reticle) for Ground Attack
  const reticleY = state.player.y - 200;
  const reticleX = state.player.x + PLAYER_SIZE / 2;
  if (reticleY > 0) {
    ctx.strokeStyle = COLORS.BOMB_RETICLE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(reticleX, reticleY, 20, 0, Math.PI * 2);
    ctx.moveTo(reticleX - 25, reticleY);
    ctx.lineTo(reticleX + 25, reticleY);
    ctx.moveTo(reticleX, reticleY - 25);
    ctx.lineTo(reticleX, reticleY + 25);
    ctx.stroke();
  }

  // Flash Effect (Ultimate)
  if (state.flashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.flashTimer / 20})`;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  ctx.restore();
};

const drawShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 10, y + 10, w, h);
};

const drawStars = (ctx: CanvasRenderingContext2D, offset: number) => {
    ctx.fillStyle = COLORS.STAR;
    // Simple procedural stars based on modulo to create illusion of infinite scroll
    for(let i=0; i<50; i++) {
        const x = (i * 137) % SCREEN_WIDTH;
        const y = (i * 53 + offset) % SCREEN_HEIGHT;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
};

const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, weaponType: WeaponType) => {
    ctx.fillStyle = COLORS.PLAYER;
    
    // Draw simple ship shape
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w/2, y + h - 10); // engine cutout
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Weapon indicator wings
    ctx.fillStyle = weaponType === WeaponType.LASER ? COLORS.LASER : COLORS.ENEMY_AIR;
    ctx.fillRect(x - 5, y + 15, 5, 10);
    ctx.fillRect(x + w, y + 15, 5, 10);
};

const drawEnemy = (ctx: CanvasRenderingContext2D, e: any) => {
    ctx.save();
    ctx.translate(e.x + e.width/2, e.y + e.height/2);
    
    if (e.type === EnemyType.TURRET) {
        ctx.fillStyle = COLORS.ENEMY_TURRET;
        ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
        // Turret barrel
        ctx.rotate(e.angle);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, -5, 25, 10);
    } else if (e.type === EnemyType.BOSS) {
        ctx.fillStyle = COLORS.ENEMY_BOSS;
        // Boss Body
        ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
        // Phase indicator
        ctx.fillStyle = e.phase === 2 ? '#ef4444' : '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
    } else if (e.type === EnemyType.SUPPLY) {
        ctx.fillStyle = '#10b981'; // Emerald 500
        ctx.beginPath();
        ctx.moveTo(0, -e.height/2);
        ctx.lineTo(e.width/2, e.height/2);
        ctx.lineTo(-e.width/2, e.height/2);
        ctx.closePath();
        ctx.fill();
    } else {
        // Normal Aircraft
        ctx.fillStyle = COLORS.ENEMY_AIR;
        ctx.beginPath();
        ctx.moveTo(0, e.height/2);
        ctx.lineTo(e.width/2, -e.height/2);
        ctx.lineTo(-e.width/2, -e.height/2);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
    
    // Health bar for boss/tough enemies
    if (e.hp < e.maxHp) {
        ctx.fillStyle = 'red';
        ctx.fillRect(e.x, e.y - 10, e.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(e.x, e.y - 10, e.width * (e.hp/e.maxHp), 5);
    }
};