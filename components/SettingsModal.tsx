import React from 'react';
import { DifficultySettings } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: DifficultySettings;
    onSettingsChange: (newSettings: DifficultySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
}) => {
    if (!isOpen) return null;

    const handleChange = (key: keyof DifficultySettings, value: number) => {
        onSettingsChange({
            ...settings,
            [key]: value,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-sky-500 mb-6 uppercase tracking-wider border-b border-slate-700 pb-2">
                    Difficulty Settings
                </h2>

                <div className="space-y-6">
                    {/* Enemy Spawn Rate */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm text-slate-300">
                            <label htmlFor="spawnRate">Spawn Rate Multiplier</label>
                            <span className="font-mono text-sky-400">{settings.enemySpawnRateMultiplier.toFixed(1)}x</span>
                        </div>
                        <input
                            id="spawnRate"
                            type="range"
                            min="0.1"
                            max="2.0"
                            step="0.1"
                            value={settings.enemySpawnRateMultiplier}
                            onChange={(e) => handleChange('enemySpawnRateMultiplier', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400"
                        />
                        <p className="text-xs text-slate-500">Lower = More Enemies (Faster Spawns)</p>
                    </div>

                    {/* Enemy Health */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm text-slate-300">
                            <label htmlFor="enemyHp">Enemy Health Multiplier</label>
                            <span className="font-mono text-sky-400">{settings.enemyHealthMultiplier.toFixed(1)}x</span>
                        </div>
                        <input
                            id="enemyHp"
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={settings.enemyHealthMultiplier}
                            onChange={(e) => handleChange('enemyHealthMultiplier', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400"
                        />
                    </div>

                    {/* Boss Health */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm text-slate-300">
                            <label htmlFor="bossHp">Boss Health Multiplier</label>
                            <span className="font-mono text-sky-400">{settings.bossHealthMultiplier.toFixed(1)}x</span>
                        </div>
                        <input
                            id="bossHp"
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.1"
                            value={settings.bossHealthMultiplier}
                            onChange={(e) => handleChange('bossHealthMultiplier', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold uppercase tracking-wide transition-colors shadow-lg"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
