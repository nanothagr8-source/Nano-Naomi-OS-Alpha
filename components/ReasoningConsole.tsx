
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BrainCircuit, Activity, Zap, Search, Loader2, Sparkles,
  RefreshCw, Network, Terminal, Cpu, Share2, Eye,
  Target, Info, Layers, Workflow, ChevronRight
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { fetchReasoningTrace, checkAndRequestApiKey } from '../services/geminiService';
import { ReasoningStep } from '../types';

const ReasoningConsole: React.FC = () => {
  const [query, setQuery] = useState('');
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const handleReason = async () => {
    if (!query.trim()) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setSteps([]);
    setError('');

    try {
      const trace = await fetchReasoningTrace(query);
      setSteps(trace);
      if (trace.length > 0) setActiveStepId(trace[0].id);
    } catch (err: any) {
      setError("Cognitive bridge failed. Neural trace unretrievable.");
    } finally {
      setLoading(false);
    }
  };

  const activeStep = useMemo(() => steps.find(s => s.id === activeStepId), [steps, activeStepId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <BrainCircuit className="w-8 h-8 text-indigo-400" />
           </div>
           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Metacognitive Reasoning console</h2>
           <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">Gemini 3 Pro Deep-Reasoning Trace</p>
        </div>

        <div className="flex w-full max-w-2xl gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask for high-complexity architectural reasoning..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                onKeyDown={e => e.key === 'Enter' && handleReason()}
              />
           </div>
           <Button onClick={handleReason} isLoading={loading} className="bg-indigo-600 hover:bg-indigo-500 h-14 px-10 rounded-2xl shadow-xl">
              <Workflow className="w-5 h-5 mr-2" /> Sync Trace
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Reasoning Graph */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Neural Chain</span>
            {steps.length > 0 && <span className="text-[10px] font-mono text-indigo-400">{steps.length} Nodes</span>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]">
             {!loading && steps.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-20 space-y-4">
                  <Network className="w-16 h-16" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Trace Buffer Empty</p>
               </div>
             )}
             {loading && (
               <div className="h-full flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <Sparkles className="w-4 h-4 text-white absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-[10px] text-indigo-400 font-mono animate-pulse uppercase tracking-widest">Reasoning Sequence Triggered...</p>
               </div>
             )}
             {steps.map((step, i) => (
               <div 
                 key={step.id}
                 onClick={() => setActiveStepId(step.id)}
                 className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4 ${
                   activeStepId === step.id ? 'bg-indigo-950 border-indigo-500 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                 }`}
               >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    activeStepId === step.id ? 'bg-white text-indigo-900' : 'bg-slate-900 text-slate-600 group-hover:text-white'
                  }`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className={`text-[11px] font-bold uppercase truncate ${activeStepId === step.id ? 'text-white' : 'text-slate-400'}`}>Node Analysis</p>
                     <div className="flex gap-2 mt-1">
                        <div className="h-1 bg-slate-800 rounded-full flex-1 overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${step.complexity}%` }}></div>
                        </div>
                     </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeStepId === step.id ? 'text-indigo-400 translate-x-1' : 'text-slate-700'}`} />
               </div>
             ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Step Resolution Details</h3>
             </div>
             {activeStep && (
               <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase">
                  <span>Entropy: {(activeStep.entropy).toFixed(4)}</span>
                  <span>System Resonance: Valid</span>
               </div>
             )}
          </div>
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/40 relative">
             {activeStep ? (
               <div className="animate-fade-in-up space-y-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                           <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Thought Vector Manifest</h4>
                     </div>
                     <p className="text-lg text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-8 rounded-3xl border border-slate-800 italic shadow-inner">
                        "{activeStep.thought}"
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Cognitive Metrics</h5>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                                 <span>Step Complexity</span>
                                 <span className="text-indigo-400">{activeStep.complexity}%</span>
                              </div>
                              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500" style={{ width: `${activeStep.complexity}%` }}></div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                                 <span>Neural Branching Factor</span>
                                 <span className="text-cyan-400">High</span>
                              </div>
                              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                                 <div className="h-full bg-cyan-500 w-3/4"></div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Downstream Connections</h5>
                        <div className="flex flex-wrap gap-2">
                           {activeStep.connections.map((c, i) => (
                             <span key={i} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-indigo-300 uppercase hover:border-indigo-500 transition-all cursor-default">
                                -> {c}
                             </span>
                           ))}
                           {activeStep.connections.length === 0 && <span className="text-[9px] text-slate-700 italic uppercase">Terminal reasoning leaf</span>}
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-20 space-y-6">
                  <Workflow className="w-24 h-24" />
                  <p className="text-xl font-black uppercase tracking-[0.5em] italic">Step Detail Standby</p>
               </div>
             )}
          </div>
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

export default ReasoningConsole;
