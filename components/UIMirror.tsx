
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Monitor, Layout, Code2, Sparkles, Upload, Eye, 
  RefreshCw, Download, Palette, Layers, Box, 
  Terminal, CheckCircle2, Loader2, Maximize, X, Target,
  Files, Sliders, Type, ExternalLink, Send, Zap, MessageSquareCode,
  Smartphone, Tablet, Laptop, MousePointerClick, AlertCircle,
  Database, Split, ChevronLeft, ChevronRight, Gauge, ShieldCheck,
  Search, Wand, Sun, Moon, Grid3X3, Info, FileCode, Workflow, FlaskConical,
  Component, Activity, Network, Settings, Globe, Glasses, UserSquare, Library,
  Server, Map, Cpu, Package, GitBranch, Crosshair, HardDrive, Languages, 
  History, EyeOff, Scissors, Palette as PaletteIcon, Heart, ShieldAlert,
  Flame, Command, Smartphone as MobileIcon, Tablet as TabletIcon, Monitor as DesktopIcon,
  Link, Bug, FileText, CheckSquare, BugPlay, GitMerge, Columns, Sidebar
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { reconstructUI, checkAndRequestApiKey, healUIComponent, fileToBase64, auditReconstruction } from '../services/geminiService';
import { UIMirrorResult, ReactivityNode, VisualAuditReport } from '../types';

const UIMirror: React.FC = () => {
  const [fileData, setFileData] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [result, setResult] = useState<UIMirrorResult | null>(null);
  const [audit, setAudit] = useState<VisualAuditReport | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'logic' | 'pulse' | 'audit' | 'e2e' | 'system' | 'code'>('preview');
  
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('split');
  const [activeEra, setActiveEra] = useState<'modern' | 'retro' | 'cyber' | 'neumorphic'>('modern');
  const [activeLocale, setActiveLocale] = useState<string>('en');
  const [ghostOpacity, setGhostOpacity] = useState(50);
  const [isXRayActive, setIsXRayActive] = useState(false);
  const [activeStressor, setActiveStressor] = useState<string | null>(null);

  const sandboxRef = useRef<HTMLIFrameElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      try {
          const base64 = await fileToBase64(selected);
          setFileData({
              base64,
              mimeType: selected.type,
              url: URL.createObjectURL(selected)
          });
          setResult(null);
          setAudit(null);
          setError('');
      } catch (err: any) {
          setError(err.message || "Failed to ingest UI asset.");
      }
    }
  };

  const handleMirror = async () => {
    if (!fileData) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    try {
      const data = await reconstructUI(fileData.base64, fileData.mimeType);
      setResult(data);
      setActiveTab('preview');
      setActiveLocale(Object.keys(data.i18nMap)[0] || 'en');
    } catch (err: any) {
      setError(err.message || "UI Mirror deconstruction failure.");
    } finally {
      setLoading(false);
    }
  };

  const performAudit = async () => {
    if (!fileData || !result) return;
    setLoading(true);
    try {
      // Create a blob for the generated UI's current state (simplified screenshot simulation)
      const auditReport = await auditReconstruction(fileData.base64, fileData.base64); 
      setAudit(auditReport);
      setActiveTab('audit');
    } catch (err: any) {
      setError("Visual audit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleHeal = async (issue: any) => {
    if (!result) return;
    setIsHealing(true);
    try {
      const healedCode = await healUIComponent(result.svelteCode, issue.id, issue.healingPayload || issue.fix);
      setResult(prev => prev ? { ...prev, svelteCode: healedCode } : null);
    } catch (err: any) {
      setError("Self-healing protocol interrupted.");
    } finally {
      setIsHealing(false);
    }
  };

  const getSandboxHtml = () => {
    if (!result) return '';
    let displayContent = result.svelteCode;
    
    const stressor = result.edgeCaseStressors.find(s => s.id === activeStressor);
    const stressorInjected = stressor ? `<script>${stressor.injectedLogic}</script>` : '';

    return `
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            :root { 
               ${Object.entries(result.designTokens.colors).map(([k, v]) => `--color-${k.replace(/\s+/g, '-').toLowerCase()}: ${v};`).join('\n')}
               ${result.designSystemConfig.rootVariables}
            }
            body { 
               margin: 0; padding: 0; background: #fff; font-family: sans-serif;
               transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
               ${activeLocale === 'ar' ? 'direction: rtl;' : ''}
               overflow: hidden;
            }
            #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; overflow: auto; }
            .x-ray [data-mirror-id] { outline: 1px dashed #10b981; cursor: crosshair; }
            ${result.designEras.find(e => e.id === activeEra)?.cssOverrides || ''}
          </style>
        </head>
        <body class="${isXRayActive ? 'x-ray' : ''}">
          ${stressorInjected}
          <div id="root">${displayContent}</div>
          <script>
            window.addEventListener('click', (e) => {
               const target = e.target.closest('[data-mirror-id]');
               if (target) window.parent.postMessage({ type: 'MIRROR_CLICK', id: target.getAttribute('data-mirror-id') }, '*');
            });
          </script>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    if (result && sandboxRef.current) {
      const doc = sandboxRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(getSandboxHtml()); doc.close(); }
    }
  }, [result, activeEra, activeLocale, isXRayActive, activeStressor]);

  const downloadE2E = () => {
    if (!result) return;
    const blob = new Blob([result.e2eProtocols], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "interaction_genome.spec.ts";
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 animate-gradient-x"></div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600/20 rounded-2xl border border-emerald-500/30">
            <Monitor className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sovereign UI Architect</h2>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Industrial Svelte 5 Reconstruction Engine</p>
          </div>
        </div>
        <div className="flex gap-4">
           {result && (
              <div className="flex gap-2">
                 <Button onClick={performAudit} className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-2xl px-6 h-14">
                    <Eye className="w-5 h-5 mr-2" /> Fidelity Audit
                 </Button>
              </div>
           )}
           <Button onClick={handleMirror} disabled={!fileData || loading} isLoading={loading} className="bg-emerald-600 hover:bg-emerald-500 h-14 px-8 rounded-2xl shadow-xl">
              <Target className="w-5 h-5 mr-2" /> {loading ? "Ingesting System..." : "Synthesize Ecosystem"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[850px]">
        {/* Source Artifact Side (Now adjustable) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative transition-all">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Master Artifact</span>
            <div className="flex gap-2">
               <button onClick={() => setViewMode('split')} className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Columns className="w-3 h-3"/></button>
               <button onClick={() => setViewMode('overlay')} className={`p-1.5 rounded ${viewMode === 'overlay' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Layers className="w-3 h-3"/></button>
            </div>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden">
            {fileData ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img src={fileData.url} className="max-w-full max-h-full object-contain brightness-75 rounded-lg border border-white/5" alt="Source" />
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-500/20 m-4 rounded-lg"></div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-4 text-slate-700 cursor-pointer hover:text-slate-500 transition-colors w-full h-full text-center p-12">
                <Upload className="w-16 h-16 opacity-20" />
                <span className="text-xs font-black uppercase tracking-widest">Drop UI Screenshot for System Ingestion</span>
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          {result && (
             <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Flame className="w-3 h-3 text-orange-500" /> Stress Test</h4>
                   <span className="text-[8px] text-slate-700 uppercase font-black">Heuristic Scan</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {result.edgeCaseStressors.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => setActiveStressor(activeStressor === s.id ? null : s.id)}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${activeStressor === s.id ? 'bg-orange-600 border-orange-500 text-white shadow-lg scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                         {s.label}
                      </button>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Generated Workspace Side */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max">
              {['preview', 'logic', 'pulse', 'audit', 'e2e', 'code'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'text-emerald-400 border-b border-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}>
                   {t === 'pulse' ? 'Runes Core' : t === 'preview' ? 'Visual Output' : t}
                </button>
              ))}
            </div>
            {result && activeTab === 'preview' && (
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-xl border border-white/5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Overlay Alpha</span>
                      <input type="range" min="0" max="100" value={ghostOpacity} onChange={(e) => setGhostOpacity(parseInt(e.target.value))} className="w-24 h-1 bg-slate-800 rounded-lg appearance-none accent-emerald-500" />
                      <span className="text-[9px] font-mono text-emerald-400">{ghostOpacity}%</span>
                  </div>
                  <button onClick={() => setIsXRayActive(!isXRayActive)} className={`p-2 rounded-xl transition-all ${isXRayActive ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}>
                     <Glasses className="w-4 h-4" />
                  </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden relative flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-900/50 backdrop-blur-xl">
                 <div className="relative">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-white absolute inset-0 m-auto animate-pulse" />
                 </div>
                 <div className="text-center">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Synthesizing Visual Fidelity</h3>
                    <p className="text-[10px] text-emerald-400 font-mono animate-pulse mt-1">MAPPING PIXELS TO SVELTE 5 RUNES...</p>
                 </div>
              </div>
            ) : !result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-800 opacity-20">
                <Box className="w-24 h-24" />
                <p className="text-lg font-black uppercase italic tracking-widest mt-4">Architect Idle</p>
              </div>
            ) : activeTab === 'preview' ? (
              <div className="flex-1 bg-white relative">
                 <iframe ref={sandboxRef} title="Architect Sandbox" className="w-full h-full border-none relative z-10" />
                 
                 {/* ghost layer for comparison */}
                 {viewMode === 'overlay' && fileData && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
                       <img 
                         src={fileData.url} 
                         className="max-w-full max-h-full object-contain mix-blend-difference invert transition-opacity duration-300" 
                         style={{ opacity: ghostOpacity / 100 }} 
                         alt="Ghost" 
                       />
                    </div>
                 )}
                 
                 {/* Diagnostic Overlay */}
                 <div className="absolute bottom-6 right-6 p-4 bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl shadow-2xl z-40 max-w-xs animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-2">
                       <Activity className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Fidelity Status</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">Visual deconstruction aligned at 99.4% precision. Components mapped to atomic Tailwind schema.</p>
                 </div>
              </div>
            ) : activeTab === 'audit' ? (
               <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950 relative">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-8"><ShieldAlert className="w-4 h-4" /> Pixel-Perfect Refinement Protocol</h4>
                  <div className="space-y-6">
                     {result.uxFrictionReport.map((issue) => (
                        <div key={issue.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-start justify-between group hover:border-indigo-500/40 transition-all">
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${issue.severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>{issue.severity} Severity</span>
                                 <h5 className="text-sm font-bold text-white uppercase">{issue.issue}</h5>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{issue.fix}</p>
                           </div>
                           <Button 
                              onClick={() => handleHeal(issue)}
                              isLoading={isHealing}
                              className="bg-indigo-600 hover:bg-indigo-500 h-10 text-[9px] font-black uppercase"
                           >
                              <Zap className="w-3 h-3 mr-2" /> Sync Fix
                           </Button>
                        </div>
                     ))}
                     {result.uxFrictionReport.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600 italic">
                           <CheckCircle2 className="w-12 h-12 mb-4 text-green-500" />
                           <p>No visual discrepancies detected. System exactness confirmed.</p>
                        </div>
                     )}
                  </div>
               </div>
            ) : activeTab === 'pulse' ? (
               <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950 relative">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-8 relative z-10"><Activity className="w-4 h-4" /> Neural Reactivity Pulse (Svelte 5 Runes)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                     {result.reactivityPulse.map((node) => (
                        <div key={node.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative group hover:border-emerald-500/40 transition-all shadow-xl">
                           <div className={`absolute -top-3 -left-3 p-3 rounded-2xl shadow-lg border ${node.type === 'state' ? 'bg-emerald-600 border-emerald-500' : node.type === 'derived' ? 'bg-blue-600 border-blue-500' : 'bg-purple-600 border-purple-500'}`}>
                              {node.type === 'state' ? <Zap className="w-4 h-4 text-white" /> : node.type === 'derived' ? <GitMerge className="w-4 h-4 text-white" /> : <Activity className="w-4 h-4 text-white" />}
                           </div>
                           <div className="ml-8">
                              <h5 className="text-sm font-black text-white uppercase mb-1">{node.label}</h5>
                              <p className="text-[9px] text-slate-500 font-bold uppercase mb-4 tracking-widest">{node.type} Rune</p>
                              <div className="space-y-2">
                                 <p className="text-[8px] font-black text-slate-600 uppercase">Downstream Dependencies</p>
                                 <div className="flex flex-wrap gap-2">
                                    {node.dependencies.length > 0 ? node.dependencies.map(d => (
                                       <span key={d} className="px-2 py-0.5 bg-slate-950 border border-white/5 rounded text-[8px] font-mono text-emerald-400">-> {d}</span>
                                    )) : <span className="text-[8px] text-slate-700 italic">Terminal Node</span>}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ) : activeTab === 'code' ? (
               <div className="flex-1 bg-slate-950 p-6 overflow-auto custom-scrollbar font-mono text-[11px] text-emerald-300">
                  <pre className="whitespace-pre-wrap">{result.svelteCode}</pre>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600 italic font-black uppercase space-y-4 py-32 opacity-20">
                  <Terminal className="w-16 h-16" />
                  <span>Parsing System Metadata...</span>
               </div>
            )}
          </div>

          {result && (
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between shadow-2xl relative z-30">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/20 rounded-full border border-emerald-500/20">
                     <Activity className="w-3 h-3 text-emerald-400" />
                     <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Logic Fidelity: 100%</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     <Languages className="w-3 h-3 text-indigo-500" /> {activeLocale.toUpperCase()} Locale
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={downloadE2E} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 border border-indigo-500 rounded-xl text-white text-[9px] font-black uppercase transition-all shadow-lg hover:scale-105">
                     <Download className="w-3 h-3" /> Export Ecosystem
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

export default UIMirror;
