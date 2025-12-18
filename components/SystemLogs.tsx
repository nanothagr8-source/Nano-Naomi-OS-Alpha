
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, AlertTriangle, Info, CheckCircle, Search, Trash2, Download, Filter } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: string;
  message: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toLocaleTimeString(), level: 'info', module: 'KERNEL', message: 'Nano Naomi OS Boot Sequence Initialized.' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), level: 'success', module: 'MEMORY', message: 'Neural Cache allocated: 512MB stable.' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), level: 'info', module: 'UI', message: 'Compositor bridge established via WebGPU.' },
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const modules = ['KERNEL', 'FS', 'NETWORK', 'NEURAL', 'GPU', 'UI'];
      const levels: ('info' | 'warn' | 'error' | 'success')[] = ['info', 'info', 'info', 'warn', 'success'];
      const messages = [
        'Heartbeat detected in Sycamore module.',
        'File handle synced to Local Bridge.',
        'Neural weights calibrated at 99.4% precision.',
        'Packet handshake successful with Google API.',
        'Latency spike detected in UI thread: 45ms.',
        'Kernel garbage collection complete.'
      ];

      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        module: modules[Math.floor(Math.random() * modules.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };

      setLogs(prev => [...prev, newLog].slice(-100));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(l => 
    l.message.toLowerCase().includes(filter.toLowerCase()) || 
    l.module.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-black/90 font-mono border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">OS Kernel Logs</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
              <input 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter logs..."
                className="bg-slate-950 border border-slate-800 rounded px-8 py-1 text-[10px] text-white outline-none focus:border-indigo-500 w-48"
              />
           </div>
           <button onClick={() => setLogs([])} className="p-1.5 hover:bg-slate-800 rounded transition-colors"><Trash2 className="w-3.5 h-3.5 text-slate-500" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1 rounded transition-colors text-[11px] items-start">
            <span className="text-slate-600 whitespace-nowrap">[{log.timestamp}]</span>
            <span className={`font-bold w-16 text-center rounded px-1 ${
              log.level === 'info' ? 'text-blue-400' : 
              log.level === 'warn' ? 'text-yellow-400' : 
              log.level === 'error' ? 'text-red-400' : 'text-green-400'
            }`}>
              {log.level.toUpperCase()}
            </span>
            <span className="text-indigo-500 font-black w-20">[{log.module}]</span>
            <span className="text-slate-300 flex-1">{log.message}</span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="h-8 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest border-t border-slate-800">
         <div className="flex gap-6">
            <span>Buffer: {logs.length}/100</span>
            <span>Uptime: 00:24:12</span>
         </div>
         <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Secure Logstream</span>
         </div>
      </div>
    </div>
  );
};

export default SystemLogs;
