import React, { useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { HUD } from './HUD';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { DifficultySettings } from '../types';

interface GameCanvasProps {
  settings: DifficultySettings;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getGameState, resetGame } = useGameLoop(canvasRef, settings);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-slate-700 bg-black">
      <canvas
        ref={canvasRef}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        className="block"
        style={{ width: '100%', maxWidth: '700px', height: 'auto', aspectRatio: '1/1' }}
      />
      <HUD getGameState={getGameState} onRestart={resetGame} />
    </div>
  );
};
