
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Cpu, Database, HardDrive, Terminal, XCircle, RefreshCw, BarChart, Settings2, ShieldCheck } from 'lucide-react';
import { WindowState } from '../types';

interface TaskManagerProps {
  processes: WindowState[];
  onKill: (id: string) => void;
  onRefresh: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ processes, onKill, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'users' | 'startup'>('processes');

  const totalCpu = useMemo(() => processes.reduce((acc, p) => acc + (p.cpuUsage || 0), 0) + 12, [processes]);
  const totalMem = useMemo(() => processes.reduce((acc, p) => acc + (p.memUsage || 0), 0) + 1450, [processes]);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden animate-fade-in font-sans">
      {/* Header Tabs */}
      <div className="h-12 bg-slate-950 border-b border-white/5 flex items-center px-4 gap-6">
        {[
          { id: 'processes', label: 'Processes', icon: Activity },
          { id: 'performance', label: 'Performance', icon: BarChart },
          { id: 'users', label: 'Users', icon: ShieldCheck },
          { id: 'startup', label: 'Startup', icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'processes' ? (
          <>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 border-b border-white/5 bg-slate-900/50">
              <div className="p-4 border-r border-white/5">
                <div className="flex items-center gap-2 mb-1">
                   <Cpu className="w-3 h-3 text-indigo-400" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CPU Status</span>
                </div>
                <div className="text-xl font-black text-white">{totalCpu}%</div>
              </div>
              <div className="p-4 border-r border-white/5">
                <div className="flex items-center gap-2 mb-1">
                   <Database className="w-3 h-3 text-cyan-400" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Memory</span>
                </div>
                <div className="text-xl font-black text-white">{(totalMem / 1024).toFixed(1)} GB</div>
              </div>
              <div className="p-4 border-r border-white/5">
                <div className="flex items-center gap-2 mb-1">
                   <HardDrive className="w-3 h-3 text-emerald-400" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Disk IO</span>
                </div>
                <div className="text-xl font-black text-white">42 MB/s</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                   <Terminal className="w-3 h-3 text-orange-400" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network</span>
                </div>
                <div className="text-xl font-black text-white">12 Mbps</div>
              </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-900 shadow-xl">
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">CPU</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Memory</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">PID</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-3 flex items-center gap-3">
                         <span className="text-xs font-bold text-white uppercase">{p.id.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-3">
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${p.isMinimized ? 'bg-slate-800 text-slate-400' : 'bg-green-600/20 text-green-400'}`}>
                           {p.isMinimized ? 'Suspended' : 'Running'}
                         </span>
                      </td>
                      <td className="px-6 py-3 text-[10px] font-mono text-indigo-400">{(p.cpuUsage || 0).toFixed(1)}%</td>
                      <td className="px-6 py-3 text-[10px] font-mono text-cyan-400">{(p.memUsage || 0).toFixed(1)} MB</td>
                      <td className="px-6 py-3 text-[10px] font-mono text-slate-600">{1024 + i}</td>
                      <td className="px-6 py-3">
                         <button 
                            onClick={() => onKill(p.id)}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                         >
                            <XCircle className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                  {processes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-600 italic uppercase tracking-widest text-[10px]">
                        No active neural processes detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
             <Settings2 className="w-12 h-12 text-slate-700 animate-spin-slow" />
             <div className="max-w-xs">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Enhanced Telemetry</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-2">
                  Deep kernel diagnostics for the Naomi OS are currently compiling. Hardware virtualization required for full performance view.
                </p>
             </div>
          </div>
        )}
      </div>

      <div className="h-10 bg-slate-950 border-t border-white/5 flex items-center px-4 justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
         <div className="flex gap-4">
            <span>{processes.length} Processes</span>
            <span>Uptime: 04:12:03</span>
         </div>
         <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            <span>Kernel Sync: High Priority</span>
         </div>
      </div>
    </div>
  );
};

export default TaskManager;
