
import React, { useState, useEffect } from 'react';
import { 
  Settings, Monitor, Bell, Shield, Cpu, Activity, 
  Moon, Sun, Palette, Volume2, Globe, Lock, Zap,
  Database, HardDrive, RefreshCw, Box, Command,
  Keyboard, BarChart3, Fingerprint, MousePointer2,
  Clock, Info, ChevronRight, Save
} from 'lucide-react';
import Button from './ui/Button';
import { hotkeys } from '../services/hotkeyService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ui' | 'neural' | 'hotkeys' | 'analytics'>('ui');
  const [gpuStatus, setGpuStatus] = useState<'Detecting...' | 'WebGPU Active' | 'WebGL Fallback'>('Detecting...');
  const [mapping, setMapping] = useState(hotkeys.getMappings());

  useEffect(() => {
    const checkGPU = async () => {
      if ('gpu' in navigator) {
        setGpuStatus('WebGPU Active');
      } else {
        setGpuStatus('WebGL Fallback');
      }
    };
    checkGPU();
  }, []);

  const tabs = [
    { id: 'ui', label: 'Workspace', icon: Monitor },
    { id: 'neural', label: 'Neural Core', icon: Cpu },
    { id: 'hotkeys', label: 'Shortcuts', icon: Keyboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const updateKey = (id: string, key: string) => {
    hotkeys.updateMapping(id, { key });
    setMapping(hotkeys.getMappings());
  };

  const analyticsData = [
    { time: '00:00', users: 12, api: 45, consumption: 20 },
    { time: '04:00', users: 8, api: 30, consumption: 15 },
    { time: '08:00', users: 25, api: 120, consumption: 45 },
    { time: '12:00', users: 45, api: 250, consumption: 80 },
    { time: '16:00', users: 52, api: 310, consumption: 95 },
    { time: '20:00', users: 38, api: 190, consumption: 60 },
    { time: '23:59', users: 20, api: 85, consumption: 30 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest min-w-max ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'ui' && (
          <>
            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" /> Aesthetics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Wallpaper Logic</span>
                  <select className="bg-slate-900 border border-slate-700 rounded-lg text-[10px] p-2 text-white outline-none">
                    <option>Neural Lattice</option>
                    <option>Quantum Void</option>
                    <option>Industrial Static</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Glassmorphism Blur</span>
                  <input type="range" className="w-24 accent-indigo-500" />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-400" /> Rendering API
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Local Acceleration</span>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${gpuStatus.includes('Active') ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                  {gpuStatus}
                </span>
              </div>
              <p className="text-[9px] text-slate-600 leading-relaxed uppercase">
                Using {gpuStatus === 'WebGPU Active' ? 'low-level compute shaders' : 'raster legacy'} for interface compositing and background neural animations.
              </p>
            </div>
          </>
        )}

        {activeTab === 'neural' && (
          <>
            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Real-time Load
              </h3>
              <div className="h-24 flex items-end gap-1 px-2">
                 {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40].map((h, i) => (
                   <div key={i} className="flex-1 bg-cyan-500/20 rounded-t border-t border-cyan-500/50" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
              <p className="text-[9px] text-slate-500 font-bold text-center uppercase">Neural Token Processing Speed</p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" /> Nexus Cache
              </h3>
              <div className="space-y-2">
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/3 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                  <span>Usage: 1.2 MB Cached Artifacts</span>
                  <span>Limits: 5.0 MB Browser Persistent</span>
                </div>
              </div>
              <Button onClick={() => localStorage.clear()} className="w-full bg-slate-900 border border-slate-800 h-10">
                <RefreshCw className="w-3 h-3 mr-2" /> Purge Cache Memory
              </Button>
            </div>
          </>
        )}

        {activeTab === 'hotkeys' && (
          <div className="col-span-full space-y-6">
             <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                      <Command className="w-5 h-5 text-indigo-400" /> Keybinding Matrix
                   </h3>
                   <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                      <Info className="w-3 h-3 text-slate-500" />
                      <span className="text-[8px] font-black text-slate-500 uppercase">Custom Hotkeys Auto-Sync to Nexus</span>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {mapping.map(m => (
                      <div key={m.id} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase">{m.action}</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-widest">{m.id}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                               {m.ctrl && <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[8px] font-mono text-slate-400">CTRL</span>}
                               {m.alt && <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[8px] font-mono text-slate-400">ALT</span>}
                               {m.meta && <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[8px] font-mono text-slate-400">META</span>}
                            </div>
                            <input 
                              value={m.key} 
                              onChange={(e) => updateKey(m.id, e.target.value)}
                              className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] font-mono text-indigo-400 text-center uppercase outline-none focus:border-indigo-500"
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
           <div className="col-span-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Active Nodes', value: '42', icon: Fingerprint, color: 'text-cyan-400' },
                   { label: 'Session Time', value: '2.4h', icon: Clock, color: 'text-indigo-400' },
                   { label: 'System Uptime', value: '99.9%', icon: Shield, color: 'text-green-400' },
                   { label: 'AI Sync Rate', value: '1.2k/hr', icon: Zap, color: 'text-yellow-400' },
                 ].map((stat, i) => (
                    <div key={i} className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center">
                       <stat.icon className={`w-6 h-6 mb-4 ${stat.color}`} />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                       <h4 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h4>
                    </div>
                 ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl h-80">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <BarChart3 className="w-3 h-3 text-indigo-400" /> Feature Usage Flux
                   </h4>
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                        <Line type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="api" stroke="#c084fc" strokeWidth={3} dot={false} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl h-80">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-yellow-400" /> Resource Consumption
                   </h4>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                        <Bar dataKey="consumption" fill="#facc15" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
