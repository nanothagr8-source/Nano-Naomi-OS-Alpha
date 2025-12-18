
import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Radio, Activity, Zap, HardDrive, ShieldCheck, RefreshCw, BarChart3, Network } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const NetworkMonitor: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState(12);

  useEffect(() => {
    // Generate initial history
    const initialData = Array(20).fill(0).map((_, i) => ({
      time: i,
      down: Math.random() * 50 + 20,
      up: Math.random() * 20 + 5,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: prev[prev.length - 1].time + 1,
          down: Math.random() * 50 + (Math.random() > 0.8 ? 100 : 20),
          up: Math.random() * 20 + 5,
        });
        return next;
      });
      setActiveConnections(prev => Math.max(8, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentDown = useMemo(() => data[data.length - 1]?.down.toFixed(1) || '0.0', [data]);
  const currentUp = useMemo(() => data[data.length - 1]?.up.toFixed(1) || '0.0', [data]);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden font-sans border border-white/5 shadow-2xl animate-fade-in">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
             <Globe className="w-8 h-8 text-cyan-400 animate-spin-slow" /> Network Traffic
          </h2>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.4em] mt-1">Real-time Data Fabric Analytics</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Connections</span>
              <span className="text-xl font-black text-white">{activeConnections}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 h-[300px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" /> Bandwidth Utilization (Mbps)
                 </h3>
                 <div className="flex gap-4 text-[10px] font-black">
                    <span className="text-cyan-400 uppercase">● Down</span>
                    <span className="text-indigo-400 uppercase">● Up</span>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="down" stroke="#22d3ee" fillOpacity={1} fill="url(#colorDown)" />
                    <Area type="monotone" dataKey="up" stroke="#818cf8" fillOpacity={1} fill="url(#colorUp)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
                 <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Downlink Peak</h4>
                 <span className="text-3xl font-black text-white">{currentDown} <span className="text-sm text-slate-600">Mbps</span></span>
              </div>
              <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
                 <RefreshCw className="w-8 h-8 text-emerald-500 mb-2" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Uplink Stable</h4>
                 <span className="text-3xl font-black text-white">{currentUp} <span className="text-sm text-slate-600">Mbps</span></span>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Network className="w-4 h-4 text-cyan-400" /> Active Nodes
              </h3>
              <div className="space-y-4">
                 {[
                   { name: 'Google Cloud Bridge', ping: '12ms', status: 'Stable' },
                   { name: 'Neural API Socket', ping: '45ms', status: 'Active' },
                   { name: 'Vercel Deployment', ping: '32ms', status: 'Idle' },
                   { name: 'Nexus Artifact Syncer', ping: '8ms', status: 'Stable' },
                 ].map((node, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-white/5">
                      <div>
                         <p className="text-[11px] font-bold text-slate-200">{node.name}</p>
                         <p className="text-[9px] text-slate-500 font-mono">{node.ping}</p>
                      </div>
                      <span className="text-[8px] font-black text-green-400 uppercase bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-3xl p-6 text-center">
              <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-sm font-black text-white uppercase italic">Nano Shield Enabled</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-2">Encrypted Neural Tunnel established for all multimodal transfers.</p>
           </div>
        </div>
      </div>

      <div className="h-10 bg-slate-950 border-t border-white/5 px-8 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
         <div className="flex gap-8">
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> System Latency: Minimal</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Protocol: Neural-v3-TLS</span>
         </div>
         <span className="text-cyan-500">Secure Comm Interface v1.0.8</span>
      </div>
    </div>
  );
};

export default NetworkMonitor;
