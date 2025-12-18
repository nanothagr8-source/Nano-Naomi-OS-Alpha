
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bug, Activity, Cpu, Box, Database, 
  Terminal, Search, Zap, Layout, 
  BarChart, Maximize2, Trash2, Layers,
  ChevronRight, ChevronDown, Clock, Shield,
  UserSquare, AlertCircle, TrendingDown,
  Info, ShieldAlert, Play, Square, RefreshCw,
  // Added missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';
import { telemetry, SystemError } from '../services/telemetryService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FeatureId } from '../types';

const KernelDebugger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiler' | 'tree' | 'telemetry' | 'errors'>('profiler');
  const [metrics, setMetrics] = useState(telemetry.getMetrics());
  const [errors, setErrors] = useState<SystemError[]>(telemetry.getErrors());
  const [searchTerm, setSearchTerm] = useState('');
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  const [isProfilingModule, setIsProfilingModule] = useState<FeatureId | null>(null);

  useEffect(() => {
    const unsubMetrics = telemetry.subscribe(setMetrics);
    const unsubErrors = telemetry.subscribeErrors(setErrors);
    const unsubBottlenecks = telemetry.onBottleneck(msg => {
      setBottlenecks(prev => [msg, ...prev].slice(0, 5));
    });
    return () => { unsubMetrics(); unsubErrors(); unsubBottlenecks(); };
  }, []);

  const chartData = useMemo(() => {
    return metrics.slice(-20).map((m, i) => ({
      name: i,
      latency: m.duration,
      usage: Math.random() * 100 // Simulated usage
    }));
  }, [metrics]);

  const filteredMetrics = useMemo(() => {
    if (!searchTerm) return metrics;
    return metrics.filter(m => m.featureId.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [metrics, searchTerm]);

  const avgLatency = useMemo(() => {
    if (filteredMetrics.length === 0) return 0;
    const sum = filteredMetrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / filteredMetrics.length;
  }, [filteredMetrics]);

  const handleToggleProfile = (id: FeatureId) => {
    if (isProfilingModule === id) {
      setIsProfilingModule(null);
    } else {
      setIsProfilingModule(id);
      setSearchTerm(id); // Focus metrics on this module
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex gap-4">
          {[
            { id: 'profiler', label: 'Profiler', icon: Activity },
            { id: 'tree', label: 'Component Tree', icon: Layout },
            { id: 'telemetry', label: 'Live Data', icon: Database },
            { id: 'errors', label: 'System Faults', icon: Shield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
              <input 
                type="text" 
                placeholder="Inspect Module..." 
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-4 py-1.5 text-[10px] text-white outline-none w-48 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button onClick={() => setBottlenecks([])} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === 'profiler' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isProfilingModule ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                        <Play className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Profiling Target</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{isProfilingModule || 'ENTIRE KERNEL'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {Object.values(FeatureId).slice(0, 4).map(fid => (
                        <button 
                            key={fid}
                            onClick={() => handleToggleProfile(fid as FeatureId)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${isProfilingModule === fid ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {fid.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {bottlenecks.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                {bottlenecks.map((b, i) => (
                  <div key={i} className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{b}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl h-64">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                     <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-cyan-400" /> System Latency (ms)</div>
                     <span className="text-cyan-400 font-mono">AVG: {avgLatency.toFixed(1)}ms</span>
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" hide />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                      <Area type="monotone" dataKey="latency" stroke="#818cf8" fillOpacity={1} fill="url(#colorLatency)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
               <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl h-64">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Cpu className="w-3 h-3 text-indigo-400" /> Neural Load (%)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" hide />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#c084fc' }}
                      />
                      <Line type="monotone" dataKey="usage" stroke="#c084fc" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-slate-800">
                     <tr>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Component/Module</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Execution (ms)</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredMetrics.slice(-10).reverse().map((m, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="px-6 py-3 text-[10px] font-mono text-slate-600">{new Date(m.timestamp).toLocaleTimeString()}</td>
                           <td className="px-6 py-3 text-[10px] font-bold text-slate-300 uppercase">{m.featureId}</td>
                           <td className="px-6 py-3 text-[10px] font-bold text-indigo-400">{m.duration.toFixed(2)}ms</td>
                           <td className="px-6 py-3">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${m.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                 {m.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
           <div className="space-y-4">
              <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-3xl flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-500 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic">Kernel Guard Active</h3>
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Centralized Fault Monitoring Engine</p>
                    </div>
                 </div>
                 <button onClick={() => setErrors([])} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"><RefreshCw className="w-5 h-5" /></button>
              </div>
              
              <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 h-[400px] overflow-y-auto custom-scrollbar">
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Exceptions Log ({errors.length})</h4>
                    <span className="text-[10px] font-black text-slate-600 uppercase">Live Buffer</span>
                 </div>
                 <div className="space-y-3">
                    {errors.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-slate-700 italic border border-dashed border-slate-800 rounded-2xl">
                            <ShieldCheck className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-black">Zero Faults Detected</p>
                        </div>
                    ) : errors.slice().reverse().map((err, i) => (
                        <div key={i} className="p-4 bg-slate-900 border border-red-500/20 rounded-2xl flex items-start gap-4 group hover:border-red-500/40 transition-all">
                           <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                 <p className="text-xs font-black text-white uppercase">Module Isolation: {err.module}</p>
                                 <span className="text-[8px] text-slate-600 font-mono">{new Date(err.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[10px] text-red-400/80 font-mono break-words">{err.message}</p>
                              {err.stack && (
                                  <details className="mt-2 group/details">
                                      <summary className="text-[8px] text-slate-600 uppercase font-black cursor-pointer hover:text-slate-400">View Stack Trace</summary>
                                      <pre className="mt-2 p-2 bg-black/40 rounded text-[7px] text-slate-500 overflow-x-auto custom-scrollbar">
                                          {err.stack}
                                      </pre>
                                  </details>
                              )}
                              <p className={`text-[8px] font-black uppercase mt-2 ${err.recovered ? 'text-indigo-400' : 'text-red-600'}`}>
                                 System Outcome: {err.recovered ? 'RECOVERED (BOUNDARY ISOLATED)' : 'UNRECOVERED (MANUAL REBOOT REQUIRED)'}
                              </p>
                           </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default KernelDebugger;
