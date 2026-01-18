import React, { useEffect, useState } from 'react';
import { GameState, WeaponType } from '../types';

interface HUDProps {
  getGameState: () => GameState;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({ getGameState, onRestart }) => {
  // We use a local state to sync with the game loop periodically for UI performance
  const [hudState, setHudState] = useState<Partial<GameState>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      const state = getGameState();
      setHudState({
        score: state.score,
        level: state.level,
        player: { ...state.player },
        gameOver: state.gameOver,
      });
    }, 100); // Update HUD 10 times a second, not 60

    return () => clearInterval(interval);
  }, [getGameState]);

  if (!hudState.player) return null;

  return (
    <div className="absolute inset-0 pointer-events-none text-white font-mono p-4 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Top Left: HP */}
        <div className="flex flex-col gap-1 w-48">
          <div className="flex justify-between text-xs font-bold text-sky-400">
            <span>HP</span>
            <span>{Math.max(0, Math.floor(hudState.player.hp))} / 100</span>
          </div>
          <div className="w-full h-3 bg-gray-800 border border-gray-600 rounded">
            <div 
              className={`h-full transition-all duration-300 ${hudState.player.hp > 30 ? 'bg-sky-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(0, hudState.player.hp)}%` }}
            />
          </div>
        </div>

        {/* Top Right: Score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400 drop-shadow-md">
            {hudState.score?.toLocaleString().padStart(8, '0')}
          </div>
          <div className="text-sm text-gray-300">STAGE {hudState.level}</div>
        </div>
      </div>

      {/* Game Over Screen */}
      {hudState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-red-500 mb-4 animate-bounce">MISSION FAILED</h1>
            <p className="text-xl mb-6">FINAL SCORE: {hudState.score}</p>
            <button 
              onClick={onRestart}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow-lg transition transform hover:scale-105"
            >
              RETRY MISSION
            </button>
          </div>
        </div>
      )}

      {/* Bottom Bar: Weapons */}
      <div className="flex items-end gap-6 mb-2">
        {/* Air Weapon Status */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">AIR (Z)</span>
          <div className={`w-14 h-14 border-2 flex items-center justify-center rounded bg-gray-900 ${hudState.player.airWeaponType === WeaponType.LASER ? 'border-blue-500 text-blue-400' : 'border-red-500 text-red-400'}`}>
            <span className="font-bold text-xl">
              {hudState.player.airWeaponType === WeaponType.LASER ? 'LSR' : 'MSL'}
            </span>
          </div>
          <div className="flex mt-1 gap-0.5">
            {[1,2,3,4,5].map(lvl => (
               <div key={lvl} className={`w-2 h-2 rounded-full ${lvl <= (hudState.player.airWeaponLevel||1) ? 'bg-yellow-400' : 'bg-gray-700'}`} />
            ))}
          </div>
        </div>

        {/* Ground Weapon Status */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">GND (X)</span>
          <div className="w-14 h-14 border-2 border-green-500 flex items-center justify-center rounded bg-gray-900 text-green-400">
            <span className="font-bold text-xl">BMB</span>
          </div>
          <div className="flex mt-1 gap-0.5">
            {[1,2,3].map(lvl => (
               <div key={lvl} className={`w-3 h-2 rounded-sm ${lvl <= (hudState.player.groundWeaponLevel||1) ? 'bg-green-500' : 'bg-gray-700'}`} />
            ))}
          </div>
        </div>

        {/* Ultimate Status */}
        <div className="flex flex-col items-center ml-4">
          <span className="text-xs text-gray-400 mb-1">ULT (B)</span>
          <div className="flex gap-2">
            {[1,2,3].map(i => (
              <div 
                key={i} 
                className={`w-8 h-8 border-2 rounded-full flex items-center justify-center ${i <= (hudState.player.ultimates||0) ? 'border-purple-500 bg-purple-900 shadow-[0_0_10px_#a855f7]' : 'border-gray-700 bg-transparent'}`}
              >
                {i <= (hudState.player.ultimates||0) && <span className="text-purple-300 text-xs">★</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 text-right">
        WASD to Move<br/>Z: Shoot Air | X: Shoot Ground<br/>B: Bomb (Ultimate)
      </div>
    </div>
  );
};