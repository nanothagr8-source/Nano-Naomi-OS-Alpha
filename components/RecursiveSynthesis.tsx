import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, Zap, Play, Terminal, Code, 
  Sparkles, ChevronRight, History, Target,
  CheckCircle2, AlertCircle, Loader2, Maximize2,
  Cpu, Rocket, FlaskConical, Repeat, Eye, Download
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { performRecursiveSynthesis, checkAndRequestApiKey } from '../services/geminiService';
import { SynthesisIteration } from '../types';

const RecursiveSynthesis: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [iterations, setIterations] = useState<SynthesisIteration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLooping, setIsLooping] = useState(false);
  const [loopCount, setLoopCount] = useState(3);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [iterations]);

  const runIteration = async (currentGoal: string, currentHistory: SynthesisIteration[]) => {
    const nextIteration = await performRecursiveSynthesis(currentGoal, currentHistory);
    setIterations(prev => [...prev, { ...nextIteration, timestamp: Date.now() }]);
    return nextIteration;
  };

  const startSynthesis = async () => {
    if (!goal.trim()) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setIsLooping(true);
    setIterations([]);
    setError('');

    try {
      let currentHistory: SynthesisIteration[] = [];
      for (let i = 0; i < loopCount; i++) {
        const result = await runIteration(goal, currentHistory);
        currentHistory.push(result);
        if (result.score >= 98) break; // Early exit if perfect
      }
    } catch (err: any) {
      setError(err.message || "Recursive loop encountered a logical fracture.");
    } finally {
      setLoading(false);
      setIsLooping(false);
    }
  };

  const currentResult = iterations.length > 0 ? iterations[iterations.length - 1] : null;

  const getSandboxHtml = (code: string) => `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 1.5rem; background: #0f172a; color: white; font-family: sans-serif; }
          .container { border: 1px solid rgba(255,255,255,0.1); border-radius: 1.5rem; overflow: hidden; background: #1e293b; padding: 2rem; }
        </style>
      </head>
      <body>
        <div class="container">${code.replace(/<script>[\s\S]*?<\/script>/g, '')}</div>
      </body>
    </html>
  `;

  useEffect(() => {
    if (currentResult && previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getSandboxHtml(currentResult.code));
        doc.close();
      }
    }
  }, [currentResult]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"></div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-600/20 rounded-2xl border border-purple-500/30">
            <Repeat className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recursive Synthesis</h2>
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em]">Autonomous Self-Refinement Engine</p>
          </div>
        </div>
        <div className="flex-1 max-w-lg w-full flex gap-4">
           <input 
             value={goal}
             onChange={e => setGoal(e.target.value)}
             placeholder="Define synthesis target (e.g. A hyper-dynamic glassmorphic trading dashboard)..."
             className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
           />
           <div className="w-24 bg-slate-950 border border-slate-800 rounded-2xl p-1 flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-500 uppercase">Loops</span>
              <select 
                value={loopCount} 
                onChange={e => setLoopCount(parseInt(e.target.value))}
                className="bg-transparent text-white font-black text-xs outline-none"
              >
                <option value="2">02</option>
                <option value="3">03</option>
                <option value="5">05</option>
              </select>
           </div>
        </div>
        <Button 
          onClick={startSynthesis} 
          disabled={loading || !goal}
          isLoading={loading}
          className="bg-purple-600 hover:bg-purple-500 h-14 px-8 rounded-2xl shadow-xl font-black uppercase"
        >
          <Rocket className="w-5 h-5 mr-2" /> {loading ? "Refining..." : "Ignite Loop"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[750px]">
        {/* Evolution History */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <History className="w-4 h-4 text-purple-400" /> Synthesis Log
              </h3>
              {loading && <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />}
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {iterations.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-20 space-y-4">
                   <FlaskConical className="w-16 h-16" />
                   <p className="text-[10px] font-black uppercase text-center tracking-widest leading-relaxed">System Dormant.<br/>Awaiting Recursive Input.</p>
                </div>
              )}
              {iterations.map((iter, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                    idx === iterations.length - 1 ? 'bg-purple-950/40 border-purple-500/50 shadow-lg' : 'bg-slate-950 border-slate-800 opacity-50'
                  }`}
                >
                   <div className="absolute top-0 right-0 p-2 bg-slate-900 border-l border-b border-slate-800 rounded-bl-xl text-[8px] font-black text-purple-400 uppercase">V{iter.version}</div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-500" style={{ width: `${iter.score}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-white">{iter.score}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">"{iter.critique}"</p>
                   </div>
                </div>
              ))}
              <div ref={scrollRef} />
           </div>
        </div>

        {/* Viewport and Code Output */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    {/* Fix: Added missing Eye icon import to resolve 'Cannot find name Eye' error. */}
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Active Manifestation</h3>
                 </div>
                 {currentResult && (
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-900/20 px-3 py-1 rounded-full border border-green-500/20">
                         <CheckCircle2 className="w-3 h-3" /> System Stable
                      </div>
                   </div>
                 )}
              </div>
              <div className="flex-1 bg-black/40 flex items-center justify-center p-8">
                 {currentResult ? (
                   <iframe 
                     ref={previewRef}
                     className="w-full h-full border-none rounded-2xl shadow-2xl bg-white"
                     title="Synthesis Preview"
                   />
                 ) : (
                   <div className="text-center space-y-6 opacity-20 group">
                      <div className="relative">
                        <Cpu className="w-24 h-24 mx-auto text-slate-500 group-hover:text-purple-400 transition-colors" />
                        <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Initiate Loop for Visual Manifestation</p>
                   </div>
                 )}
              </div>
              {loading && (
                 <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
                    <div className="text-center">
                       <p className="text-lg font-black text-white uppercase italic tracking-tighter">Synthesizing Iteration {iterations.length + 1}</p>
                       <p className="text-[10px] text-purple-400 font-mono animate-pulse uppercase mt-1">Cross-referencing architectural patterns...</p>
                    </div>
                 </div>
              )}
           </div>

           <div className="h-64 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-inner">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rebuilt Ecosystem (Svelte 5)</h4>
                 </div>
                 {currentResult && (
                   <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                      {/* Fix: Added missing Download icon import to resolve 'Cannot find name Download' error. */}
                      <Download className="w-3 h-3" /> Export Module
                   </button>
                 )}
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar bg-black/50 rounded-xl p-4 font-mono text-[10px] text-emerald-400/80">
                 {currentResult ? (
                   <pre className="whitespace-pre-wrap">{currentResult.code}</pre>
                 ) : (
                   <div className="h-full flex items-center justify-center italic text-slate-800 uppercase tracking-widest">Logic Buffer Empty</div>
                 )}
              </div>
           </div>
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

export default RecursiveSynthesis;