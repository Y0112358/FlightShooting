import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, InputState, WeaponType, GroundWeaponLevel } from '../types';
import { updateGameState } from '../services/gameEngine';
import { renderGame } from '../services/renderer';
import { SCREEN_WIDTH, SCREEN_HEIGHT, KEYS } from '../constants';

const INITIAL_STATE: GameState = {
  player: {
    id: 'player',
    x: SCREEN_WIDTH / 2 - 16,
    y: SCREEN_HEIGHT - 100,
    width: 32, height: 32,
    vx: 0, vy: 0,
    hp: 100, maxHp: 100,
    markedForDeletion: false,
    airWeaponType: WeaponType.MISSILE,
    airWeaponLevel: 1,
    groundWeaponLevel: GroundWeaponLevel.SINGLE,
    ultimates: 3,
    invincibleTimer: 0,
    lastFiredAir: 0,
    lastFiredGround: 0,
  },
  enemies: [],
  projectiles: [],
  particles: [],
  powerUps: [],
  score: 0,
  level: 1,
  waveIndex: 0,
  waveTimer: 0,
  gameOver: false,
  paused: false,
  backgroundOffset: 0,
  shakeTimer: 0,
  flashTimer: 0,
};

export const useGameLoop = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const requestRef = useRef<number>();
  const gameState = useRef<GameState>(JSON.parse(JSON.stringify(INITIAL_STATE))); // Deep copy
  const inputState = useRef<InputState>({
    left: false, right: false, up: false, down: false,
    fireAir: false, fireGround: false, ultimate: false
  });
  
  // Logic for Ultimate debounce
  const prevUltimateRef = useRef(false);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS.LEFT.includes(e.key)) inputState.current.left = true;
      if (KEYS.RIGHT.includes(e.key)) inputState.current.right = true;
      if (KEYS.UP.includes(e.key)) inputState.current.up = true;
      if (KEYS.DOWN.includes(e.key)) inputState.current.down = true;
      if (KEYS.FIRE_AIR.includes(e.key)) inputState.current.fireAir = true;
      if (KEYS.FIRE_GROUND.includes(e.key)) inputState.current.fireGround = true;
      if (KEYS.ULTIMATE.includes(e.key)) inputState.current.ultimate = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (KEYS.LEFT.includes(e.key)) inputState.current.left = false;
      if (KEYS.RIGHT.includes(e.key)) inputState.current.right = false;
      if (KEYS.UP.includes(e.key)) inputState.current.up = false;
      if (KEYS.DOWN.includes(e.key)) inputState.current.down = false;
      if (KEYS.FIRE_AIR.includes(e.key)) inputState.current.fireAir = false;
      if (KEYS.FIRE_GROUND.includes(e.key)) inputState.current.fireGround = false;
      if (KEYS.ULTIMATE.includes(e.key)) inputState.current.ultimate = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetGame = () => {
    gameState.current = JSON.parse(JSON.stringify(INITIAL_STATE));
  };

  const triggerUltimate = () => {
      // Manual trigger from logic passed to state
      // Actually handled inside gameEngine via inputState check
      // But we need to handle edge triggering here to prevent spamming
      if (inputState.current.ultimate && !prevUltimateRef.current) {
          // One-shot
          const state = gameState.current;
          if (state.player.ultimates > 0) {
              state.player.ultimates--;
              state.flashTimer = 20;
              state.shakeTimer = 30;
              state.projectiles = state.projectiles.filter(p => p.isPlayer);
              state.enemies.forEach(e => e.hp -= 100);
          }
      }
      prevUltimateRef.current = inputState.current.ultimate;
  };

  const loop = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Handle Ultimate Edge Trigger here or in Engine.
    // Let's do it here for clarity
    triggerUltimate();

    // Update Physics/Logic
    gameState.current = updateGameState(gameState.current, inputState.current);

    // Render
    renderGame(ctx, gameState.current);

    requestRef.current = requestAnimationFrame(loop);
  }, [canvasRef]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  return {
    // Expose refs/methods to React for HUD updates
    getGameState: () => gameState.current,
    resetGame,
  };
};