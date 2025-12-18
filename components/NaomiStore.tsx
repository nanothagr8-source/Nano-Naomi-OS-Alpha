
import React, { useState } from 'react';
import { Package, Download, Search, CheckCircle2, Sparkles, Filter, ShieldCheck, Zap, Info, Clock, ExternalLink } from 'lucide-react';
import Button from './ui/Button';
import { FeatureId } from '../types';

interface NaomiStoreProps {
  installedModules: FeatureId[];
  onToggle: (id: FeatureId) => void;
}

const NaomiStore: React.FC<NaomiStoreProps> = ({ installedModules, onToggle }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'creative' | 'system' | 'dev'>('all');

  const modules = [
    { id: FeatureId.IMAGE_GENERATION, name: 'Pro Image Suite', category: 'creative', desc: 'Enterprise-grade image synthesis engine with 4K output.', ver: 'v2.4.1', size: '142 MB' },
    { id: FeatureId.VEO_ANIMATION, name: 'Veo Cinema', category: 'creative', desc: 'Cinematic video generation with temporal coherence.', ver: 'v1.0.8', size: '890 MB' },
    { id: FeatureId.DEV_ENGINE, name: 'Naomi DevKit', category: 'dev', desc: 'Full-stack architectural evolution and logic synthesis.', ver: 'v4.0.0', size: '42 MB' },
    { id: FeatureId.QUANTUM_LAB, name: 'Quantum Lab', category: 'system', desc: 'Sycamore-based qubit circuit simulation environment.', ver: 'v1.1.2', size: '12 MB' },
    { id: FeatureId.UI_MIRROR, name: 'UI Architect', category: 'dev', desc: 'Deconstruct visual artifacts into Svelte 5 logic.', ver: 'v0.9.5', size: '5 MB' },
    { id: FeatureId.CONSCIENCE, name: 'The Neural Core', category: 'system', desc: 'Autonomous thought engine for OS self-management.', ver: 'v8.5.1', size: '2.1 GB' },
    { id: FeatureId.SVELTE_STUDIO, name: 'Svelte Studio', category: 'dev', desc: 'Live reconstruction IDE with hot-reload capabilities.', ver: 'v2.0.0', size: '18 MB' },
    { id: FeatureId.ART_BOT, name: 'Artist Bot', category: 'creative', desc: 'Vector-based reconstruction and SVG manifestation.', ver: 'v1.3.0', size: '4 MB' },
  ];

  const filtered = modules.filter(m => 
    (category === 'all' || m.category === category) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden font-sans">
      <div className="p-8 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border-b border-white/5 relative">
        <div className="absolute top-8 right-8">
           <Sparkles className="w-12 h-12 text-indigo-500/20 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Naomi Store</h2>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.3em] mb-8">Official Naomi OS Registry</p>

        <div className="flex gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search system modules..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
           </div>
           <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5">
              {['all', 'creative', 'dev', 'system'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat as any)}
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    category === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {filtered.map(m => {
             const isInstalled = installedModules.includes(m.id);
             return (
               <div key={m.id} className="bg-slate-950 border border-white/5 rounded-3xl p-6 flex flex-col group hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${isInstalled ? 'bg-indigo-600/20' : 'bg-slate-900'} transition-colors`}>
                        <Package className={`w-6 h-6 ${isInstalled ? 'text-indigo-400' : 'text-slate-600'}`} />
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-indigo-400 uppercase">{m.ver}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase">{m.size}</p>
                     </div>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">{m.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">{m.desc}</p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Verified Naomi Build</span>
                     </div>
                     <button 
                        onClick={() => onToggle(m.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isInstalled 
                            ? 'bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white' 
                            : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-500'
                        }`}
                     >
                        {isInstalled ? <XCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                        {isInstalled ? 'Disable' : 'Enable'}
                     </button>
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      <div className="p-6 bg-slate-950 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 2 New modules available</div>
            <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-yellow-500" /> High speed cache active</div>
         </div>
         <button className="flex items-center gap-2 text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors">
            Terms of Architecture <ExternalLink className="w-3 h-3" />
         </button>
      </div>
    </div>
  );
};

const XCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default NaomiStore;
