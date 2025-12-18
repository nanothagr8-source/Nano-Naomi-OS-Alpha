import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, Zap, Activity, Cpu, Sparkles, RefreshCw, 
  Target, Download, Play, Save, History, 
  Trash2, ShieldCheck, Database, Layers,
  Microscope, FlaskConical, GitBranch, Plus, X, Eye
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { evolveGeneticUI, checkAndRequestApiKey } from '../services/geminiService';
import { GeneticOrganism } from '../types';

const GeneticSynth: React.FC = () => {
  const [population, setPopulation] = useState<GeneticOrganism[]>([]);
  const [generation, setGeneration] = useState(0);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrganism, setSelectedOrganism] = useState<GeneticOrganism | null>(null);
  const [previewOrganism, setPreviewOrganism] = useState<GeneticOrganism | null>(null);
  
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const startInitialGeneration = async () => {
    if (!goal.trim()) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    setGeneration(1);

    try {
      const initialSeed: GeneticOrganism[] = [
        { id: 'seed-1', generation: 0, dna: '<div>Base Alpha</div>', fitnessScore: 50, mutations: [], parentIds: [], status: 'alive' }
      ];
      const offspring = await evolveGeneticUI(initialSeed, goal);
      setPopulation(offspring);
    } catch (err: any) {
      setError(err.message || "Failed to initialize genetic sequence.");
    } finally {
      setLoading(false);
    }
  };

  const breedNextGeneration = async () => {
    const selectiveParents = population.filter(o => o.status === 'alive').sort((a, b) => b.fitnessScore - a.fitnessScore).slice(0, 2);
    if (selectiveParents.length < 1) return;

    setLoading(true);
    try {
      const offspring = await evolveGeneticUI(selectiveParents, goal);
      setPopulation(prev => [...prev.map(p => ({ ...p, status: 'archived' as any })), ...offspring]);
      setGeneration(prev => prev + 1);
    } catch (err: any) {
      setError("Genetic bottleneck detected. Sequence halted.");
    } finally {
      setLoading(false);
    }
  };

  const getSandboxHtml = (dna: string) => `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 1rem; background: transparent; color: white; font-family: sans-serif; }
          .organism-root { border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; background: rgba(0,0,0,0.5); min-height: 200px; padding: 1rem; }
        </style>
      </head>
      <body>
        <div class="organism-root">${dna}</div>
      </body>
    </html>
  `;

  useEffect(() => {
    if (previewOrganism && previewFrameRef.current) {
      const doc = previewFrameRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getSandboxHtml(previewOrganism.dna));
        doc.close();
      }
    }
  }, [previewOrganism]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600/20 rounded-2xl border border-emerald-500/30">
            <Dna className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Computer Genetics Synth</h2>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Autonomous Design Evolution Engine</p>
          </div>
        </div>
        <div className="flex-1 max-w-md w-full">
           <input 
             value={goal}
             onChange={e => setGoal(e.target.value)}
             placeholder="Define aesthetic or functional target..."
             className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
           />
        </div>
        <Button 
          onClick={generation === 0 ? startInitialGeneration : breedNextGeneration} 
          disabled={loading || !goal}
          isLoading={loading}
          className="bg-emerald-600 hover:bg-emerald-500 h-14 px-8 rounded-2xl shadow-xl font-black uppercase"
        >
          {generation === 0 ? <Zap className="w-5 h-5 mr-2" /> : <GitBranch className="w-5 h-5 mr-2" />}
          {generation === 0 ? "Spawn Generation" : `Breed Generation ${generation + 1}`}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Population List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[700px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Microscope className="w-4 h-4 text-emerald-400" /> Organisms
              </h3>
              <span className="text-[10px] font-black text-slate-700 uppercase">Gen {generation}</span>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {population.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 space-y-4">
                   <FlaskConical className="w-16 h-16" />
                   <p className="text-[10px] font-black uppercase text-center tracking-widest">Incubator Empty</p>
                </div>
              )}
              {population.map((o) => (
                <div 
                  key={o.id}
                  onClick={() => setPreviewOrganism(o)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    previewOrganism?.id === o.id ? 'bg-emerald-950 border-emerald-500/50 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono text-emerald-400">#{o.id.substring(0,6)}</span>
                      <div className="flex items-center gap-1">
                         <Activity className="w-3 h-3 text-slate-600" />
                         <span className="text-[10px] font-black text-white">{o.fitnessScore}</span>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-1 mt-2">
                      {o.mutations.map((m, i) => (
                        <span key={i} className="text-[7px] bg-indigo-500/20 text-indigo-300 px-1 rounded uppercase font-bold">{m}</span>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Preview and Gene Editor */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-[700px]">
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    {/* Fix: Added missing Eye icon import to resolve 'Cannot find name Eye' error. */}
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Simulation Viewport</h3>
                 </div>
                 {previewOrganism && (
                   <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/5 text-slate-500 rounded-lg transition-all"><RefreshCw className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-white/5 text-slate-500 rounded-lg transition-all"><Maximize2 className="w-4 h-4" /></button>
                   </div>
                 )}
              </div>
              <div className="flex-1 bg-black/40 p-12 flex items-center justify-center">
                 {previewOrganism ? (
                   <iframe 
                     ref={previewFrameRef}
                     className="w-full h-full border-none rounded-2xl shadow-2xl bg-slate-900/50"
                     title="Organism Preview"
                   />
                 ) : (
                   <div className="text-center space-y-4 opacity-20">
                      <Layers className="w-20 h-20 mx-auto" />
                      <p className="text-xs font-bold uppercase tracking-widest">Select an organism for phenotype preview</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="h-64 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-inner">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" /> DNA Sequence (Svelte 5)
                 </h4>
                 {previewOrganism && (
                   <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Export Logic Package</button>
                 )}
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar bg-black/50 rounded-xl p-4 font-mono text-[10px] text-emerald-400/80">
                 {previewOrganism ? (
                   <pre className="whitespace-pre-wrap">{previewOrganism.dna}</pre>
                 ) : (
                   <div className="h-full flex items-center justify-center italic text-slate-800 uppercase tracking-widest">Awaiting Manifestation</div>
                 )}
              </div>
           </div>
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

const Maximize2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

export default GeneticSynth;