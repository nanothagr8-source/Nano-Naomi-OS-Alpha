
import React from 'react';
import { SuperGemType } from '../types';
import { Zap, BrainCircuit, Waves, Binary, Brain, Infinity } from 'lucide-react';

interface SuperGemsProps {
  activeGems: Record<SuperGemType, boolean>;
  onToggle: (type: SuperGemType) => void;
  antigravity: boolean;
  onToggleAntigravity: () => void;
}

const SuperGems: React.FC<SuperGemsProps> = ({ activeGems, onToggle, antigravity, onToggleAntigravity }) => {
  const gems = [
    { type: SuperGemType.VELOCITY, name: 'Ruby Velocity', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
    { type: SuperGemType.DEPTH, name: 'Sapphire Depth', icon: BrainCircuit, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
    { type: SuperGemType.SYNTHESIS, name: 'Emerald Synthesis', icon: Waves, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' },
    { type: SuperGemType.QUANTUM, name: 'Diamond Quantum', icon: Binary, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50' },
    { type: SuperGemType.CONSCIENCE, name: 'Obsidian Conscience', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
    { type: SuperGemType.RECURSIVE, name: 'White Hole Recursive', icon: Infinity, color: 'text-white', bg: 'bg-white/20', border: 'border-white/50' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enhancement Matrix</h3>
        <button 
          onClick={onToggleAntigravity}
          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${antigravity ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
        >
          ANTIGRAVITY: {antigravity ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="flex gap-4">
        {gems.map((gem) => (
          <button
            key={gem.type}
            onClick={() => onToggle(gem.type as SuperGemType)}
            className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-500 ${
              activeGems[gem.type as SuperGemType] ? `${gem.bg} ${gem.border} scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'bg-slate-950 border-slate-800 grayscale hover:grayscale-0'
            }`}
          >
            {activeGems[gem.type as SuperGemType] && (
              <div className={`absolute inset-0 blur-xl opacity-30 animate-pulse ${gem.bg}`}></div>
            )}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center relative ${activeGems[gem.type as SuperGemType] ? gem.color : 'text-slate-600'}`}>
              <gem.icon className="w-5 h-5" />
              <div className="absolute inset-0 border border-white/10 rounded-lg transform rotate-45 scale-75"></div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${activeGems[gem.type as SuperGemType] ? 'text-white' : 'text-slate-600'}`}>
              {gem.name.split(' ')[1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuperGems;
