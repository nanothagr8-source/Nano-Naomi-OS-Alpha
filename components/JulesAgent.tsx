
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, MessageSquare, ChevronUp, X, Lightbulb, Zap } from 'lucide-react';

interface JulesAgentProps {
  activeFeature: string;
  onActivateGem: (type: any) => void;
}

const JulesAgent: React.FC<JulesAgentProps> = ({ activeFeature }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    "Greetings, Creator. I am Jules, your Lead Architect. How shall we revolutionize today's build?"
  ]);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const featureName = activeFeature.replace('_', ' ');
    setInsight(`Current module: ${featureName}. I recommend checking architectural coherence.`);
  }, [activeFeature]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Jules Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-80 bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in-up overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-cyan-500/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-100">Jules HQ</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/30 italic">
                {m}
              </div>
            ))}
            {insight && (
              <div className="text-xs text-cyan-400 bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-950/50 flex gap-2">
             <input type="text" placeholder="Consult Jules..." className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-500" />
             <button className="bg-cyan-600 p-2 rounded-lg"><Zap className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Jules Hologram Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-3 px-4 py-3 bg-slate-900 border border-cyan-500/50 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-20 group-hover:opacity-40 animate-pulse"></div>
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-cyan-300/50 overflow-hidden relative">
             <Bot className="w-7 h-7 text-white" />
             {/* Hologram scan line effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-1/2 w-full animate-scan-line"></div>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs font-black text-cyan-300 uppercase tracking-tighter">Project Lead</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Jules v1.2</p>
        </div>
      </button>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default JulesAgent;
