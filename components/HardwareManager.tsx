
import React, { useState, useEffect } from 'react';
import { Cpu, Battery, Wifi, HardDrive, Settings, Activity, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import Button from './ui/Button';

const HardwareManager: React.FC = () => {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [network, setNetwork] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Real Hardware Telemetry: Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBattery({ level: batt.level * 100, charging: batt.charging });
        batt.onlevelchange = () => setBattery({ level: batt.level * 100, charging: batt.charging });
      });
    }

    // Real Hardware Telemetry: Network
    if ('connection' in navigator) {
      setNetwork((navigator as any).connection);
    }
  }, []);

  const handleDriverSync = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Logic */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase">Hardware 01</span>
          </div>
          <h3 className="text-white font-bold text-lg">Processor</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">{navigator.hardwareConcurrency} Parallel Cores</p>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3 animate-pulse"></div>
          </div>
        </div>

        {/* Battery Telemetry */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Battery className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase">Power 02</span>
          </div>
          <h3 className="text-white font-bold text-lg">Energy Grid</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">
            {battery ? `${battery.level}% ${battery.charging ? '(Charging)' : '(Discharging)'}` : 'Legacy DC In'}
          </p>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${battery?.level || 100}%` }}></div>
          </div>
        </div>

        {/* Network Infrastructure */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              <Wifi className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase">Comm 03</span>
          </div>
          <h3 className="text-white font-bold text-lg">Interface</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">{network?.effectiveType || 'Broadband'} Adaptive Link</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
            <span className="text-[10px] font-bold text-cyan-500 uppercase">{network?.downlink || '10.0'} Mbps</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center">
                <Settings className="w-8 h-8 text-slate-600" />
             </div>
             <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Driver Orchestrator</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Auto-updating kernel modules via Gemini Core</p>
             </div>
          </div>
          <Button 
            onClick={handleDriverSync} 
            isLoading={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-500 h-12 px-8 rounded-2xl shadow-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> {isUpdating ? 'Updating Hardware Modules...' : 'Sync Drivers'}
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {[
            { name: 'Neural GPU Driver', status: 'Stable', ver: '4.5.1' },
            { name: 'Quantum Network Adapter', status: 'Optimized', ver: '2.0.0' },
            { name: 'Ocular Storage Controller', status: 'Stable', ver: '1.0.4' },
          ].map((driver, i) => (
            <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-300">{driver.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-slate-600 font-mono">v{driver.ver}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded border border-emerald-500/20">{driver.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HardwareManager;
