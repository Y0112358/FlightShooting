import React from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-4 px-2 font-sans">
      <header className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-sky-500 tracking-wider uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          Sky Guardian
        </h1>
        <p className="text-slate-400 text-sm tracking-widest mt-1">TACTICAL VERTICAL ASSAULT</p>
      </header>
      
      <main className="w-full max-w-2xl flex justify-center">
        <GameCanvas />
      </main>
      
      <footer className="mt-8 text-slate-600 text-xs">
        System Ready // Pilot: Guest
      </footer>
    </div>
  );
}

export default App;