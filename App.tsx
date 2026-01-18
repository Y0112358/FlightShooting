import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { SettingsModal } from './components/SettingsModal';
import { DifficultySettings } from './types';

const INITIAL_SETTINGS: DifficultySettings = {
  enemySpawnRateMultiplier: 1.0,
  enemyHealthMultiplier: 1.0,
  bossHealthMultiplier: 1.0,
};

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<DifficultySettings>(INITIAL_SETTINGS);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-4 px-2 font-sans relative">
      <header className="mb-4 text-center relative w-full max-w-2xl flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-sky-500 tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Sky Guardian
          </h1>
          <p className="text-slate-400 text-sm tracking-widest mt-1">TACTICAL VERTICAL ASSAULT</p>
        </div>

        {/* Settings Icon - Top Right */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          title="Difficulty Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <main className="w-full max-w-2xl flex justify-center">
        <GameCanvas settings={settings} />
      </main>

      <footer className="mt-8 text-slate-600 text-xs text-center">
        System Ready // Pilot: Guest <br />
        Difficulty: Spawn x{settings.enemySpawnRateMultiplier.toFixed(1)} | HP x{settings.enemyHealthMultiplier.toFixed(1)}
      </footer>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;