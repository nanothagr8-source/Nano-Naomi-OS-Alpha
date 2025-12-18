
// components/DevEngine.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FolderDown, 
  Cpu, 
  Code2, 
  Zap, 
  Terminal as TerminalIcon, 
  Activity, 
  Layers, 
  Wand2, 
  CheckCircle2, 
  Loader2, 
  Play, 
  FileCode, 
  FolderPlus,
  ArrowUpCircle,
  BarChart3,
  Sparkles,
  ChevronRight,
  Monitor,
  Dna,
  Package,
  Download,
  ExternalLink,
  Fullscreen,
  RotateCcw,
  Eye,
  Settings,
  X
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { evolveProject, checkAndRequestApiKey } from '../services/geminiService';
import { DevProjectFile, EvolutionResult } from '../types';

const DevEngine: React.FC = () => {
  const [files, setFiles] = useState<DevProjectFile[]>([]);
  const [goal, setGoal] = useState('');
  const [isEvolving, setIsEvolving] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<EvolutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'files' | 'preview' | 'visuals' | 'metrics'>('architecture');
  const [error, setError] = useState('');
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: DevProjectFile[] = [];
      const filesArray = Array.from(e.target.files) as File[];
      
      try {
          for (const file of filesArray) {
            // Read file immediately to avoid stale handles
            try {
                const content = await file.text();
                newFiles.push({ name: file.name, content, type: file.type });
            } catch (innerErr) {
                console.warn(`Could not read file: ${file.name}. It may have been moved or deleted.`);
                addLog(`Warning: Skipped ${file.name} - file inaccessible.`);
            }
          }
          setFiles(prev => [...prev, ...newFiles]);
          addLog(`System: Ingested ${newFiles.length} project modules.`);
      } catch (err: any) {
          setError("Failed to ingest project files. Ensure files are accessible.");
      }
    }
  };

  const handleEvolution = async () => {
    if (files.length === 0) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setIsEvolving(true);
    setResult(null);
    setLogs([]);
    setError('');

    addLog("Evolution Engine: Initializing deep scan sequence...");
    setTimeout(() => addLog("Thinking Engine: Deconstructing architectural patterns..."), 800);
    setTimeout(() => addLog("Thinking Engine: Identifying performance bottlenecks..."), 1600);
    setTimeout(() => addLog("VFX Engine: Synthesizing visual shaders and lighting profiles..."), 2400);

    try {
      const evolution = await evolveProject(files, goal);
      setResult(evolution);
      addLog("System: Reinvention complete. Full manifest and sandbox generated.");
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || "Engine failure during evolution.");
      addLog("Critical: Evolution sequence interrupted.");
    } finally {
      setIsEvolving(false);
    }
  };

  const downloadFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProject = () => {
    if (!result) return;
    addLog("Export Agent: Packaging all artifacts for local build...");
    result.fullProjectFiles.forEach((file, i) => {
      setTimeout(() => {
        downloadFile(file.name, file.content);
        addLog(`Export Agent: Dispatched ${file.name}`);
      }, i * 200);
    });
  };

  const restartSandbox = () => {
    if (previewFrameRef.current && result) {
      previewFrameRef.current.srcdoc = result.previewBundle;
      addLog("Sandbox: Hot-reloading environment...");
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[800px]">
      {/* Side Control Panel */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col h-full border-t-indigo-500/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg shadow-inner">
              <Dna className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 tracking-tight">Project Evolution</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Engine Suite v4.5</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Project Drop */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <FolderPlus className="w-3 h-3" /> Project Ingress
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileDrop} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/50 group-hover:border-indigo-500/50 transition-all shadow-inner group-hover:bg-indigo-500/5">
                  <FolderDown className="w-8 h-8 text-slate-600 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-xs text-slate-400 group-hover:text-slate-200">Drop Code Folder or Assets</p>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] bg-slate-800/50 p-1.5 rounded border border-slate-700/50 group hover:border-indigo-500/30">
                    <FileCode className="w-3 h-3 text-indigo-400" />
                    <span className="truncate text-slate-300 flex-1">{f.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reinvention Goal */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" /> Evolution Goal
              </label>
              <textarea 
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Modernize into a high-performance interactive simulation with Svelte components and volumetric VFX..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner"
              />
            </div>
          </div>

          <div className="pt-6 mt-auto border-t border-slate-800 space-y-3">
             {result && (
               <Button 
                onClick={handleExportProject} 
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
               >
                 <Package className="w-4 h-4 mr-2" /> Download Project
               </Button>
             )}
             <Button 
              onClick={handleEvolution} 
              disabled={files.length === 0 || isEvolving} 
              isLoading={isEvolving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              <Cpu className="w-4 h-4 mr-2" /> 
              {isEvolving ? "Reinventing..." : "Scan & Evolve"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        {/* Terminal Section */}
        <div className="bg-black border border-slate-800 rounded-xl p-4 h-64 font-mono text-xs flex flex-col shadow-inner relative group overflow-hidden">
           <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2 relative z-10">
             <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest">
                <TerminalIcon className="w-3 h-3 text-indigo-500" />
                <span>INTELLIGENCE TERMINAL</span>
             </div>
             <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
             </div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-indigo-300/80 relative z-10">
              {logs.length === 0 && <div className="text-slate-700 italic">Waiting for process initiation... Engine ready.</div>}
              {logs.map((log, i) => (
                <div key={i} className="animate-fade-in flex gap-2">
                  <span className="text-indigo-600 font-bold">»</span>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
           </div>
           {/* Matrix Background Effect */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-mono text-[8px] overflow-hidden whitespace-pre">
              {Array(20).fill(0).map((_, i) => <div key={i} className="animate-pulse">01010100 01101111 01110000 00100000 01010011 01100101 01100011 01110010 01100101 01110100</div>)}
           </div>
        </div>

        {/* Result Area */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all border-t-cyan-500/20">
          <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between shadow-lg">
            <div className="flex gap-1">
               {[
                 { id: 'preview', label: 'Live Prototype', icon: Play },
                 { id: 'files', label: 'Project Files', icon: FileCode },
                 { id: 'architecture', label: 'Blueprint', icon: Layers },
                 { id: 'visuals', label: 'GFX Concepts', icon: Wand2 },
                 { id: 'metrics', label: 'Performance', icon: BarChart3 },
               ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'
                  }`}
                 >
                   <tab.icon className={`w-3 h-3 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                   {tab.label}
                   {activeTab === tab.id && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white rounded-full"></div>}
                 </button>
               ))}
            </div>
            {result && (
              <div className="flex items-center gap-3 pr-2">
                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-inner">
                  <Sparkles className="w-3 h-3" /> STABLE DEPLOY
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900/50">
            {!result && !isEvolving && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Monitor className="w-16 h-16 text-slate-600" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Evolution Engine Idle</h3>
                    <p className="text-sm text-slate-400 max-w-sm">Upload your codebase and artifacts to trigger a complete architectural reinvention with Playable Sandbox output.</p>
                  </div>
               </div>
            )}

            {isEvolving && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[80px] opacity-10 animate-pulse"></div>
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[40px] opacity-10 animate-pulse delay-500"></div>
                  <Loader2 className="w-20 h-20 text-indigo-400 animate-spin relative" />
                  <Cpu className="w-8 h-8 text-white absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">Synthesizing Reinvention Plan</h3>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-progress-indeterminate w-1/2 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Deconstructing Logic Layers...</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="animate-fade-in h-full flex flex-col">
                {activeTab === 'preview' && (
                  <div className="h-full flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Prototype Active</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={restartSandbox} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700" title="Restart Sandbox">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700" title="Full Screen">
                                <Fullscreen className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-black rounded-2xl border-4 border-slate-950 shadow-2xl overflow-hidden relative group">
                        <iframe 
                          ref={previewFrameRef}
                          srcDoc={result.previewBundle}
                          className="w-full h-full bg-white"
                          title="Evolved Sandbox"
                          sandbox="allow-scripts allow-popups"
                        />
                        {/* Viewport Overlay */}
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                                <Activity className="w-3 h-3" /> 60 FPS
                            </div>
                            <div className="w-px h-3 bg-slate-700"></div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase">HD VIEWPORT</div>
                        </div>
                    </div>
                    <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-4">
                         <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-slate-100 uppercase">Sandbox Instruction</h4>
                            <p className="text-[11px] text-slate-400">The AI has generated a playable prototype based on your code and goals. Interact with the viewport to test logic and UX.</p>
                         </div>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Full Project Manifest</h3>
                        <Button onClick={handleExportProject} className="h-8 text-[10px] bg-slate-800 border border-slate-700">
                           <Download className="w-3 h-3 mr-2" /> DISPATCH ALL FILES
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.fullProjectFiles.map((file, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-indigo-500/50 transition-all shadow-lg">
                            <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <FileCode className="w-4 h-4 text-indigo-400" />
                                  <span className="text-[10px] font-mono text-slate-300 truncate">{file.name}</span>
                               </div>
                               <button 
                                onClick={() => downloadFile(file.name, file.content)}
                                className="p-1.5 hover:bg-slate-700 rounded text-slate-500 hover:text-indigo-400 transition-all"
                               >
                                <Download className="w-3 h-3" />
                               </button>
                            </div>
                            <div className="p-4 bg-black/50 h-32 font-mono text-[9px] overflow-hidden relative">
                               <pre className="text-slate-500/80">{file.content.substring(0, 500)}...</pre>
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                               <div className="absolute bottom-2 left-2 text-[8px] text-indigo-500/50 font-bold uppercase tracking-widest">{file.path}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'architecture' && (
                  <div className="space-y-6">
                    <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-xl font-bold text-indigo-300 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Executive Evolution Summary
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-sm">{result.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col h-full">
                         <div className="flex items-center gap-2 mb-6">
                            <Settings className="w-4 h-4 text-slate-500" />
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proposed Tech Stack</h4>
                         </div>
                         <div className="flex flex-wrap gap-2 mb-auto">
                            {result.techStack.map((tech, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-800 text-indigo-300 rounded-lg text-xs border border-slate-700 font-bold shadow-sm">{tech}</span>
                            ))}
                         </div>
                         <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>Dependency Analysis</span>
                            <span className="text-green-500">Optimized</span>
                         </div>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
                         <div className="flex items-center gap-2 mb-6">
                            <Layers className="w-4 h-4 text-slate-500" />
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Architecture Blueprint</h4>
                         </div>
                         <div className="prose prose-invert prose-xs text-slate-400 leading-relaxed">
                            {result.architecturePlan}
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'visuals' && (
                  <div className="grid grid-cols-1 gap-6">
                    {result.visualConcepts.map((url, i) => (
                       <div key={i} className="space-y-6 animate-fade-in">
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-3xl shadow-2xl relative group">
                             <img src={url} className="w-full rounded-2xl shadow-2xl brightness-90 group-hover:brightness-100 transition-all duration-700" alt="Visual Concept" />
                             <div className="absolute inset-3 border border-white/5 rounded-2xl pointer-events-none"></div>
                             <div className="absolute top-6 left-6 flex flex-col gap-1">
                                <span className="bg-indigo-600/80 backdrop-blur px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-white shadow-lg">GFX Generation v4</span>
                                <span className="bg-black/50 backdrop-blur px-3 py-1 rounded text-[10px] font-mono text-indigo-300/80">K1 Super-Sampling</span>
                             </div>
                             <button 
                                onClick={() => downloadFile(`concept_art_${i}.png`, url)}
                                className="absolute bottom-6 right-6 bg-white text-black p-3 rounded-full shadow-2xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                             >
                                <Download className="w-5 h-5" />
                             </button>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">AI Visual Reasoning</h4>
                                <p className="text-xs text-slate-400">Gemini synthesized this conceptual state-of-the-art visual representation to guide your UI and shader implementation.</p>
                             </div>
                          </div>
                       </div>
                    ))}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { label: 'Predicted FPS Boost', value: `+${result.performanceMetrics.fpsBoost}%`, icon: Zap, color: 'text-yellow-400', desc: 'Through shader optimization and logic decoupling.' },
                      { label: 'Latency Reduction', value: `-${result.performanceMetrics.latencyReduction}ms`, icon: Activity, color: 'text-green-400', desc: 'Predictive data loading and event loop refactoring.' },
                      { label: 'Memory Efficiency', value: `${result.performanceMetrics.memoryEfficiency}x`, icon: BarChart3, color: 'text-indigo-400', desc: 'Object pooling and texture atlas management.' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center space-y-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                        <div className={`p-5 bg-slate-900 rounded-2xl ${metric.color} shadow-inner group-hover:scale-110 transition-transform`}>
                          <metric.icon className="w-10 h-10" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{metric.label}</p>
                          <h4 className="text-5xl font-black text-white tracking-tighter">{metric.value}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase">{metric.desc}</p>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

export default DevEngine;
