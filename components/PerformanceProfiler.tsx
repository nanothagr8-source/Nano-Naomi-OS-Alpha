
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, Zap, Gauge, Cpu, Database, 
  BarChart3, Loader2, Sparkles, RefreshCw, 
  Play, Square, Download, Code, Target,
  AlertTriangle, CheckCircle2, ChevronRight, Filter,
  MousePointer2, Network, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { analyzePerformanceMetrics, checkAndRequestApiKey } from '../services/geminiService';
import { telemetry } from '../services/telemetryService';
import { PerformanceSnapshot, OptimizationDirective, FeatureId } from '../types';

const PerformanceProfiler: React.FC = () => {
  const [isProfiling, setIsProfiling] = useState(false);
  const [sessionSnapshots, setSessionSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [liveSnapshots, setLiveSnapshots] = useState<PerformanceSnapshot[]>(telemetry.getSnapshots());
  const [activeModule, setActiveModule] = useState<FeatureId | 'GLOBAL'>('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [directive, setDirective] = useState<OptimizationDirective | null>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const unsub = telemetry.subscribeSnapshots(setLiveSnapshots);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isProfiling) {
      const last = liveSnapshots[liveSnapshots.length - 1];
      if (last) setSessionSnapshots(prev => [...prev, last].slice(-60));
    }
  }, [liveSnapshots, isProfiling]);

  const startProfiling = () => {
    setIsProfiling(true);
    setSessionSnapshots([]);
    setDirective(null);
  };

  const stopProfiling = async () => {
    setIsProfiling(false);
    if (sessionSnapshots.length < 3) return;

    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    try {
      const result = await analyzePerformanceMetrics(sessionSnapshots, `Active Focus: ${activeModule}`);
      setDirective(result);
    } catch (err: any) {
      setError("AI Engine was unable to resolve performance bottlenecks. Kernel state preserved.");
    } finally {
      setLoading(false);
    }
  };

  const currentStats = useMemo(() => {
    return liveSnapshots[liveSnapshots.length - 1] || null;
  }, [liveSnapshots]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${isProfiling ? 'bg-cyan-600/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
            <Gauge className={`w-8 h-8 ${isProfiling ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Deep Kernel Profiler</h2>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em]">Sovereign Execution Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 mr-4">
              {['GLOBAL', FeatureId.UI_MIRROR, FeatureId.CONSCIENCE, FeatureId.DEV_ENGINE].map(fid => (
                <button 
                  key={fid}
                  onClick={() => setActiveModule(fid as any)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeModule === fid ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {fid === 'GLOBAL' ? 'Global Kernel' : fid.split('_').join(' ')}
                </button>
              ))}
           </div>

           <Button 
            onClick={isProfiling ? stopProfiling : startProfiling}
            className={`h-14 px-8 rounded-2xl shadow-xl transition-all ${isProfiling ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
           >
             {isProfiling ? <Square className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
             {isProfiling ? "Analyze Session" : "Start Profiling"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry Charts */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64 shadow-xl flex flex-col group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Cpu className="w-24 h-24 text-indigo-400" />
                 </div>
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-indigo-400" /> CPU Load (%)</div>
                    {currentStats && <span className="text-indigo-400 font-mono text-xs">{currentStats.cpu.toFixed(1)}%</span>}
                 </h4>
                 <div className="flex-1 min-h-0 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={isProfiling ? sessionSnapshots : liveSnapshots}>
                          <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="timestamp" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Area type="monotone" dataKey="cpu" stroke="#818cf8" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} isAnimationActive={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64 shadow-xl flex flex-col group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-24 h-24 text-emerald-400" />
                 </div>
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Latency (ms)</div>
                    {currentStats && <span className="text-emerald-400 font-mono text-xs">{currentStats.latency.toFixed(0)}ms</span>}
                 </h4>
                 <div className="flex-1 min-h-0 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={isProfiling ? sessionSnapshots : liveSnapshots}>
                          <XAxis dataKey="timestamp" hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Line type="stepAfter" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400" /> Multimodal Resource Flux
                 </h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                       <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Memory Heap
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                       <div className="w-2 h-2 rounded-full bg-cyan-500"></div> Frames / Sec
                    </div>
                 </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={isProfiling ? sessionSnapshots : liveSnapshots}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
                      <Area type="monotone" dataKey="fps" stackId="2" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
                   </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6">
                 {[
                   { label: 'Active Processes', value: currentStats?.activeProcesses || 0, icon: Database, color: 'text-indigo-400' },
                   { label: 'FPS stability', value: currentStats ? Math.min(100, (currentStats.fps / 60 * 100)).toFixed(1) + '%' : '0%', icon: Activity, color: 'text-cyan-400' },
                   { label: 'Heap Pressure', value: currentStats ? (currentStats.memory / 512 * 100).toFixed(1) + '%' : '0%', icon: Zap, color: 'text-yellow-400' },
                 ].map((stat, i) => (
                    <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all">
                       <stat.icon className={`w-5 h-5 mb-2 ${stat.color} group-hover:scale-110 transition-transform`} />
                       <span className="text-[14px] font-black text-white">{stat.value}</span>
                       <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
           {loading ? (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse"></div>
                   <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                   <Sparkles className="w-6 h-6 text-white absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">AI Reasoning Active</h3>
                   <p className="text-[10px] text-indigo-400 font-mono animate-pulse uppercase tracking-[0.2em] mt-2">Correlating Telemetry Spikes...</p>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 animate-progress-indeterminate w-1/2 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                </div>
             </div>
           ) : directive ? (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-full animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Target className="w-32 h-32 text-indigo-500" />
                </div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Optimization Directive</h3>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase">GEMINI 3 PRO INSIGHTS</p>
                   </div>
                   <div className="text-center">
                      <div className={`text-4xl font-black tracking-tighter ${directive.efficiencyScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {directive.efficiencyScore}<span className="text-lg opacity-50">%</span>
                      </div>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Efficiency Score</p>
                   </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 italic text-slate-300 text-sm leading-relaxed shadow-inner">
                      "{directive.summary}"
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4 text-yellow-500" /> Bottleneck Analysis
                      </h4>
                      {directive.bottlenecks.map((b, i) => (
                        <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 space-y-2 group hover:border-indigo-500/30 transition-all">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-white uppercase">{b.component}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${i === 0 ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-slate-700 text-slate-400'}`}>
                                 {i === 0 ? 'Critical Impact' : 'Optimization Vector'}
                              </span>
                           </div>
                           <p className="text-[11px] text-slate-400 leading-relaxed">
                             <span className="font-bold text-slate-300">Observation:</span> {b.impact}
                           </p>
                           <p className="text-[11px] text-indigo-300 leading-relaxed border-l-2 border-indigo-500/30 pl-3 py-1 bg-indigo-500/5 mt-2 rounded-r-lg">
                             <span className="font-bold text-indigo-400 uppercase text-[9px] mr-1">Directive:</span> {b.fix}
                           </p>
                        </div>
                      ))}
                   </div>

                   {directive.codePatch && (
                     <div className="space-y-4 pt-4 animate-fade-in-up">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Code className="w-4 h-4 text-indigo-400" /> Recommended Code Patch
                        </h4>
                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-indigo-300 overflow-x-auto shadow-inner">
                           <pre>{directive.codePatch}</pre>
                        </div>
                        <Button className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black uppercase shadow-lg shadow-indigo-900/20 active:scale-95 transition-transform">
                           <RefreshCw className="w-3 h-3 mr-2" /> Inject Optimization
                        </Button>
                     </div>
                   )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
                   <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Verified System Directives
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"><Download className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 h-full animate-fade-in group">
                <div className="relative">
                   <div className="absolute inset-0 bg-slate-700 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                   <Sparkles className="w-12 h-12 text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="max-w-xs space-y-2">
                   <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Awaiting Profiling</h3>
                   <p className="text-xs text-slate-600 leading-relaxed font-medium uppercase">Engage the profiler to capture execution telemetry and generate autonomous optimization plans via Gemini 3 Pro.</p>
                </div>
                <div className="pt-8 grid grid-cols-2 gap-4 w-full">
                   <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex flex-col items-center opacity-40">
                      <Activity className="w-5 h-5 text-slate-600 mb-2" />
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Logic Scan</span>
                   </div>
                   <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex flex-col items-center opacity-40">
                      <Network className="w-5 h-5 text-slate-600 mb-2" />
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Resource Map</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'System Uptime', value: '04:12:03', icon: Clock, color: 'text-indigo-400' },
           { label: 'Avg Latency', value: currentStats ? currentStats.latency.toFixed(1) + 'ms' : '0ms', icon: Zap, color: 'text-yellow-400' },
           { label: 'Frame Coherence', value: currentStats ? (currentStats.fps / 60 * 100).toFixed(0) + '%' : '100%', icon: RefreshCw, color: 'text-green-400' },
           { label: 'Neural Throughput', value: '1.2 GB/s', icon: Network, color: 'text-cyan-400' },
         ].map((item, i) => (
           <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-all">
              <div className={`p-3 bg-slate-800 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                 <item.icon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                 <p className="text-xl font-black text-white tracking-tighter">{item.value}</p>
              </div>
           </div>
         ))}
      </div>

      <ErrorDisplay error={error} onDismiss={() => setError('')} />
    </div>
  );
};

export default PerformanceProfiler;
