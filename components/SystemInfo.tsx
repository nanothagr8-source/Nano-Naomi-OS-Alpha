
import React from 'react';
import { Cpu, Monitor, HardDrive, Info, Globe, ShieldCheck, Zap, Activity, Heart, Layout, Command } from 'lucide-react';

const SystemInfo: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900 animate-fade-in font-sans">
      <div className="w-full max-w-lg flex flex-col items-center text-center">
        {/* OS Logo Visual */}
        <div className="relative mb-12 group">
           <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
           <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 border-4 border-white/20 flex items-center justify-center shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Zap className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
           </div>
        </div>

        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1">Nano Naomi OS</h1>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.4em] mb-12">Version 1.0.4 "Quantum Flux"</p>

        <div className="w-full space-y-3">
           {[
             { label: 'Neural Processor', value: 'Google Sycamore v3 / Gemini 3 Pro', icon: Cpu },
             { label: 'OS Build', value: 'Naomi Kernel 8.5.1 (Stable)', icon: Layout },
             { label: 'VRAM Buffer', value: 'Unlimited Neural Lattice', icon: Monitor },
             { label: 'Bridge Volume', icon: HardDrive, value: 'Nexus Optimized Cloud' },
             { label: 'Serial Number', value: 'NX-992-ALPHA-Z', icon: Info },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                   <item.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-200">{item.value}</span>
             </div>
           ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl">
              <Activity className="w-3.5 h-3.5" /> Software Update: System Up to Date
           </div>
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed">
              TM & © 1998-2025 Google Neural Labs.<br/>All Rights Reserved.
           </p>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
