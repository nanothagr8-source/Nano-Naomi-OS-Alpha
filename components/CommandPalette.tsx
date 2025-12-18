
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Command, Keyboard, Zap, ChevronRight, CornerDownLeft } from 'lucide-react';
import { FeatureId } from '../types';
import { hotkeys } from '../services/hotkeyService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (id: FeatureId | string) => void;
  commands: { id: string; label: string; icon: any; color: string }[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onExecute, commands }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mappings = useMemo(() => hotkeys.getMappings(), []);

  const filteredCommands = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return commands.filter(c => 
      c.label.toLowerCase().includes(lowerSearch) || 
      c.id.toLowerCase().includes(lowerSearch)
    );
  }, [search, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) onExecute(cmd.id);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onExecute, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center pt-[15vh] px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/5 bg-slate-950/20">
          <Search className="w-5 h-5 text-slate-500 mr-3" />
          <input 
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commands, modules, and shortcuts..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 text-lg"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ESC to close</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-600 italic uppercase tracking-widest text-[10px]">
              No system protocols found matching "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const mapping = mappings.find(m => m.id === cmd.id);
                const isSelected = idx === selectedIndex;
                
                return (
                  <button 
                    key={cmd.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => onExecute(cmd.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 scale-[1.02]' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-800'} transition-colors`}>
                        <cmd.icon className={`w-4 h-4 ${isSelected ? 'text-white' : cmd.color}`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {cmd.label}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {cmd.id.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {mapping && (
                        <div className={`flex items-center gap-1 font-mono text-[9px] px-2 py-1 rounded-md ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-950 text-slate-500'}`}>
                          {mapping.ctrl && <span>CTRL +</span>}
                          {mapping.meta && <span>CMD +</span>}
                          {mapping.alt && <span>ALT +</span>}
                          <span>{mapping.key.toUpperCase()}</span>
                        </div>
                      )}
                      {isSelected && <CornerDownLeft className="w-4 h-4 text-indigo-200" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase text-slate-600 tracking-widest">
           <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> Select</span>
              <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> Navigate</span>
           </div>
           <div className="flex items-center gap-2">
              <Keyboard className="w-3 h-3" /> System Dispatcher v1.0
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
