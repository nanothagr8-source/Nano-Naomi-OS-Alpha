
import React, { useState, useCallback, useRef } from 'react';
import { 
  HardDrive, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  FolderSearch, 
  RefreshCw, 
  Loader2, 
  FileCode, 
  AlertCircle, 
  CheckCircle,
  Database,
  ArrowRight,
  Activity,
  Box,
  Link,
  Lock,
  LockOpen,
  AlertTriangle,
  Info
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';

interface LocalFile {
  name: string;
  kind: 'file' | 'directory';
  relativePath: string;
  size?: number;
  lastModified?: number;
  // Handle only exists if using the modern API
  handle?: FileSystemFileHandle;
  // Standard File object if using fallback
  rawFile?: File;
}

const LocalBridge: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [neuralSync, setNeuralSync] = useState(0);

  const logEndRef = useRef<HTMLDivElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[BRIDGE-OS] > ${msg}`]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const scanModernDirectory = async (handle: FileSystemDirectoryHandle, path = '') => {
    const results: LocalFile[] = [];
    for await (const entry of (handle as any).values()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      
      const relativePath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        results.push({ name: entry.name, handle: entry, kind: 'file', relativePath });
      } else if (entry.kind === 'directory') {
        const subFiles = await scanModernDirectory(entry, relativePath);
        results.push(...subFiles);
      }
    }
    return results;
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    addLog("Initializing local handshake protocol...");

    try {
      // Modern API check
      if (!('showDirectoryPicker' in window)) {
        throw new Error("UNSUPPORTED_API");
      }

      // Try modern API
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        id: 'gemini-studio-bridge'
      });

      setScanning(true);
      addLog(`Mounting directory via FileSystem API: ${handle.name}`);
      
      const allFiles = await scanModernDirectory(handle);
      setFiles(allFiles);
      setIsConnected(true);
      setUseFallback(false);
      triggerSyncAnimation();
      addLog(`Handshake stable. Synchronized ${allFiles.length} local artifacts.`);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        addLog("Handshake aborted by operator.");
      } else if (err.message === 'UNSUPPORTED_API' || err.name === 'SecurityError' || err.message.includes('Cross origin')) {
        addLog("Modern Bridge blocked by frame security. Engaging Legacy Handshake Protocol...");
        setUseFallback(true);
        // Automatically trigger fallback click
        setTimeout(() => fallbackInputRef.current?.click(), 100);
      } else {
        setError(err.message || "Failed to establish local link.");
        addLog(`Critical Failure: ${err.message}`);
      }
    } finally {
      setIsConnecting(false);
      setScanning(false);
    }
  };

  const handleFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setScanning(true);
    addLog("Legacy Handshake initiated. Indexing directory structure...");

    // Fix: Cast fileArray to any[] to resolve 'unknown' type inference and access non-standard webkitRelativePath on File objects
    const fileArray = Array.from(selectedFiles) as any[];
    const results: LocalFile[] = fileArray
      .filter(f => !f.webkitRelativePath.includes('/.') && !f.webkitRelativePath.includes('node_modules/'))
      .map(f => ({
        name: f.name,
        kind: 'file',
        relativePath: f.webkitRelativePath,
        size: f.size,
        lastModified: f.lastModified,
        rawFile: f
      }));

    setFiles(results);
    setIsConnected(true);
    setScanning(false);
    triggerSyncAnimation();
    addLog(`Legacy Handshake stable. Synchronized ${results.length} artifacts.`);
  };

  const triggerSyncAnimation = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setNeuralSync(Math.min(100, progress));
      if (progress >= 100) clearInterval(interval);
    }, 50);
  };

  const handleDisconnect = () => {
    setFiles([]);
    setIsConnected(false);
    setNeuralSync(0);
    addLog("Local link severed. Buffer purged.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Hidden Fallback Input */}
      <input
        type="file"
        ref={fallbackInputRef}
        className="hidden"
        onChange={handleFallbackChange}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
      />

      {/* Header Status Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${useFallback ? 'from-amber-500 to-orange-500' : 'from-cyan-500 via-indigo-500 to-emerald-500'}`}></div>
        
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border transition-all duration-700 ${isConnected ? 'bg-cyan-600/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
            <HardDrive className={`w-8 h-8 ${isConnected ? 'text-cyan-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Machine Bridge</h2>
                {useFallback && (
                    <span className="bg-amber-600/20 text-amber-400 text-[8px] px-1.5 py-0.5 rounded border border-amber-500/30 font-black uppercase tracking-widest">Legacy Mode</span>
                )}
            </div>
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em]">Neural Filesystem Link</p>
          </div>
        </div>

        <div className="flex gap-4">
           {!isConnected ? (
             <Button 
                onClick={handleConnect} 
                isLoading={isConnecting}
                className="bg-cyan-600 hover:bg-cyan-500 h-14 px-8 rounded-2xl shadow-xl font-black uppercase tracking-widest"
             >
               <Link className="w-5 h-5 mr-2" /> Connect Local OS
             </Button>
           ) : (
             <Button 
                onClick={handleDisconnect} 
                variant="danger"
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest"
             >
               <Lock className="w-5 h-5 mr-2" /> Sever Link
             </Button>
           )}
        </div>
      </div>

      {useFallback && !isConnected && !error && (
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                  Browser security forbids programmatic folder access in this frame. <span className="font-bold text-amber-400">Click "Connect Local OS"</span> again to use the standard system folder picker.
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Intelligence Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Link Intelligence
             </h3>
             
             <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase">Handshake Status</span>
                   </div>
                   {isConnected ? <ShieldCheck className="w-4 h-4 text-green-400" /> : <Activity className="w-4 h-4 text-slate-700" />}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Neural Sync resonance</span>
                    <span className="text-cyan-400">{neuralSync}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 shadow-[0_0_8px_rgba(6,182,212,0.4)] ${useFallback ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-600 to-blue-500'}`}
                      style={{ width: `${neuralSync}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                   <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                      <span className="text-lg font-black text-white">{files.length}</span>
                      <span className="text-[8px] text-slate-600 uppercase font-bold">Mounted Artifacts</span>
                   </div>
                   <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                      <span className={`text-lg font-black ${isConnected ? 'text-green-400' : 'text-slate-600'}`}>{isConnected ? 'Active' : 'Offline'}</span>
                      <span className="text-[8px] text-slate-600 uppercase font-bold">Signal State</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-black border border-slate-800 rounded-3xl p-5 h-64 font-mono text-[10px] text-cyan-500/80 flex flex-col shadow-inner overflow-hidden relative">
            <div className="flex justify-between mb-2 border-b border-white/5 pb-2">
               <span className="text-slate-500 font-bold uppercase tracking-widest">Bridge_OS_Console</span>
               <Terminal className="w-3 h-3 text-cyan-500/40" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
              {logs.length === 0 && <div className="text-slate-800 italic animate-pulse">Awaiting connection gesture...</div>}
              {logs.map((log, i) => <div key={i} className="animate-fade-in">{log}</div>)}
              <div ref={logEndRef} />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
          </div>
        </div>

        {/* Directory Structure Panel */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Remote Project Manifest</h3>
                 </div>
                 {scanning && (
                   <div className="flex items-center gap-2 text-[9px] font-black text-cyan-400 uppercase animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Deep Scanning...
                   </div>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/40">
                 {!isConnected ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 space-y-6">
                      <Box className="w-24 h-24" />
                      <div className="text-center">
                        <p className="text-xl font-black uppercase tracking-[0.4em] italic">Volumes Unmounted</p>
                        <p className="text-[10px] mt-2 font-bold tracking-widest px-8">GRANT FILESYSTEM PERMISSIONS TO TRIGGER DEEP NEURAL SCAN</p>
                      </div>
                   </div>
                 ) : files.length === 0 && !scanning ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
                      <FolderSearch className="w-12 h-12 mb-4 opacity-10" />
                      <p>Root directory contains no compatible artifacts.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      {files.slice(0, 50).map((file, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/40 transition-all cursor-pointer">
                           <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 group-hover:bg-cyan-950 group-hover:border-cyan-500/30 transition-colors">
                              <FileCode className="w-5 h-5 text-cyan-500" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
                              <p className="text-[9px] text-slate-500 font-mono truncate">{file.relativePath || 'root/' + file.name}</p>
                           </div>
                           <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-transform group-hover:translate-x-1" />
                        </div>
                      ))}
                      {files.length > 50 && (
                        <div className="col-span-full py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                          + {files.length - 50} additional modules detected
                        </div>
                      )}
                   </div>
                 )}
              </div>

              {isConnected && (
                <div className="bg-slate-950 p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/20 rounded-full border border-cyan-500/20">
                         <Zap className="w-3 h-3 text-cyan-400" />
                         <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Real-time IO Active</span>
                      </div>
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={handleConnect}
                        className="flex-1 sm:flex-none text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest px-4 py-2 border border-slate-800 rounded-xl transition-all"
                      >
                        Refresh Manifest
                      </button>
                      <button className="flex-1 sm:flex-none text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-500 uppercase tracking-widest px-6 py-2 rounded-xl shadow-lg transition-all">
                        Sync to Disk
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}
    </div>
  );
};

export default LocalBridge;
