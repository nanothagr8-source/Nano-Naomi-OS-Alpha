
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Added missing X component to the lucide-react import list
import { 
  Upload, Bot, Layers, Download, Palette, Terminal, Code, Cpu, Eye, 
  EyeOff, FileJson, Zap, Code2, Target, Gauge, FileCode2, Edit3, 
  Check, AlertCircle, Clock, Repeat, Save, Bookmark, Trash2, Plus, X
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { reconstructImageAsSvg, generateFrameworkCode, auditReconstruction, fileToBase64 } from '../services/geminiService';
import { ArtistBotResponse, VisualAuditReport, ArtistBotLayer } from '../types';

interface VisibilityPreset {
  name: string;
  visibilityMap: Record<string, boolean>;
}

const ArtistBot: React.FC = () => {
  const [fileData, setFileData] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState('');
  const [botData, setBotData] = useState<ArtistBotResponse | null>(null);
  const [auditReport, setAuditReport] = useState<VisualAuditReport | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'layers' | 'svelte' | 'audit'>('layers');
  const [activeLayerIndex, setActiveLayerIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isBuildingCode, setIsBuildingCode] = useState(false);

  // Layer Inspection & Validation State
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Visibility Presets State
  const [visibilityPresets, setVisibilityPresets] = useState<VisibilityPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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
          setBotData(null);
          setLogs([]);
          setGeneratedCode('');
          setAuditReport(null);
          setError('');
          setSelectedLayerId(null);
          setValidationErrors({});
          setVisibilityPresets([]);
      } catch (err: any) {
          setError(err.message || "Failed to ingest source asset.");
      }
    }
  };

  const handleStartBot = async () => {
    if (!fileData) return;
    setLoading(true);
    setError('');
    addLog("Neural Processor: Ingesting high-fidelity visual data...");
    
    try {
      const data = await reconstructImageAsSvg(fileData.base64, fileData.mimeType);
      setBotData(data);
      addLog(`Orchestrator: Analysis complete. Synthesized ${data.layers.length} atomic layers.`);
      setIsDrawing(true);
      setActiveLayerIndex(-1);
    } catch (err: any) {
      setError(err.message || "Reconstruction system malfunction.");
    } finally {
      setLoading(false);
    }
  };

  const validateLayerInput = (field: string, value: string): string | null => {
    if (field === 'name') {
      if (!value.trim()) return "Layer name cannot be empty.";
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return "Use only letters, numbers, hyphens, and underscores.";
      const isDuplicate = botData?.layers.some(l => l.id !== selectedLayerId && l.name === value.trim());
      if (isDuplicate) return "Layer name must be unique.";
    }
    if (field === 'animationDuration') {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return "Duration must be a positive number.";
    }
    if (field === 'animationIterationCount') {
      if (value.toLowerCase() === 'infinite') return null;
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return "Must be 'infinite' or a non-negative integer.";
    }
    return null;
  };

  const updateLayer = (id: string, updates: Partial<ArtistBotLayer>) => {
    if (!botData) return;
    
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
        const errorMsg = validateLayerInput(key, String((updates as any)[key]));
        if (errorMsg) {
          newErrors[`${id}-${key}`] = errorMsg;
        } else {
          delete newErrors[`${id}-${key}`];
        }
    });
    setValidationErrors(newErrors);

    setBotData({
      ...botData,
      layers: botData.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  // Bulk Visibility Controls
  const toggleAllLayers = (visible: boolean) => {
    if (!botData) return;
    setBotData({
      ...botData,
      layers: botData.layers.map(l => ({ ...l, visible }))
    });
    addLog(`System: Global visibility set to ${visible ? 'VISIBLE' : 'HIDDEN'}.`);
  };

  const toggleGroupVisibility = (layerIds: string[], visible: boolean) => {
    if (!botData) return;
    setBotData({
      ...botData,
      layers: botData.layers.map(l => layerIds.includes(l.id) ? { ...l, visible } : l)
    });
    addLog(`System: Group visibility updated.`);
  };

  const saveVisibilityPreset = () => {
    if (!botData || !newPresetName.trim()) return;
    const map: Record<string, boolean> = {};
    botData.layers.forEach(l => {
      map[l.id] = l.visible !== false;
    });
    setVisibilityPresets(prev => [...prev, { name: newPresetName.trim(), visibilityMap: map }]);
    setNewPresetName('');
    addLog(`System: Saved visibility state as preset "${newPresetName.trim()}".`);
  };

  const applyVisibilityPreset = (preset: VisibilityPreset) => {
    if (!botData) return;
    setBotData({
      ...botData,
      layers: botData.layers.map(l => ({
        ...l,
        visible: preset.visibilityMap[l.id] ?? true
      }))
    });
    addLog(`System: Applied visibility preset "${preset.name}".`);
  };

  const removePreset = (name: string) => {
    setVisibilityPresets(prev => prev.filter(p => p.name !== name));
  };

  const runVisualAudit = async () => {
    if (!fileData || !svgRef.current) return;
    setIsAuditing(true);
    addLog("Ocular Auditor: Comparing reconstruction with source artifact...");
    
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      const canvas = document.createElement('canvas');
      canvas.width = 1000; canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      
      await new Promise((resolve) => {
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, 1000, 1000);
          resolve(true);
        };
        img.src = url;
      });

      const resultBase64 = canvas.toDataURL('image/png').split(',')[1];
      const report = await auditReconstruction(fileData.base64, resultBase64);
      setAuditReport(report);
      setActiveTab('audit');
      addLog(`Ocular Auditor: Visual Fidelity Score calculated at ${report.matchScore}%.`);
    } catch (e: any) {
      addLog("Audit Error: Spectral sync failed.");
    } finally {
      setIsAuditing(false);
    }
  };

  const generateSvelteBlueprint = async () => {
    if (!botData) return;
    if (Object.keys(validationErrors).length > 0) {
      setError("Cannot build: resolve layer validation errors first.");
      return;
    }
    setIsBuildingCode(true);
    addLog("Build Agent: Synthesizing industrial-grade Svelte 5 logic...");
    try {
      const code = await generateFrameworkCode(botData, 'Svelte', 'CSS');
      setGeneratedCode(code);
      setActiveTab('svelte');
      addLog("Build Agent: Rebuilt ecosystem ready for production deployment.");
    } catch (e) {
      addLog("Build Error: Logical synthesis failed.");
    } finally {
      setIsBuildingCode(false);
    }
  };

  useEffect(() => {
    if (isDrawing && botData) {
      if (activeLayerIndex < botData.layers.length - 1) {
        const timer = setTimeout(() => {
          setActiveLayerIndex(prev => prev + 1);
        }, 150);
        return () => clearTimeout(timer);
      } else {
        setIsDrawing(false);
        addLog("Orchestrator: Visual manifestation complete.");
      }
    }
  }, [isDrawing, activeLayerIndex, botData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">The Svelte Reconstructor</h2>
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-[0.2em]">High-Fidelity Visual-to-Code Pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={runVisualAudit} disabled={!botData || isAuditing} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 h-12 rounded-2xl">
            <Target className="w-5 h-5 mr-2" /> {isAuditing ? "Auditing..." : "Neural Audit"}
          </Button>
          <Button onClick={generateSvelteBlueprint} disabled={!botData || isBuildingCode} isLoading={isBuildingCode} className="bg-indigo-600 hover:bg-indigo-500 h-12 rounded-2xl shadow-lg">
            <FileCode2 className="w-5 h-5 mr-2" /> Build Svelte App
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" /> Source Ingestion
            </h3>
            <div className="aspect-video border-2 border-dashed border-slate-800 rounded-xl relative overflow-hidden bg-black/40 group hover:border-cyan-500/50 transition-all cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
              {fileData ? <img src={fileData.url} className="w-full h-full object-contain" /> : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 text-center">
                  <Bot className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-[10px] font-bold uppercase">Drop Image for Industrial Rebuild</span>
                </div>
              )}
            </div>
            <Button onClick={handleStartBot} disabled={!fileData || loading} isLoading={loading} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 h-12 rounded-xl">
              <Zap className="w-4 h-4 mr-2" /> Initialize Rebuild
            </Button>
          </div>

          <div className="bg-black border border-slate-800 rounded-2xl p-4 h-64 font-mono text-[10px] text-green-400/80 overflow-y-auto custom-scrollbar">
            {logs.length === 0 && <div className="text-slate-700 italic">SYSTEM READY. AWAITING DATA...</div>}
            {logs.map((log, i) => <div key={i} className="mb-1 animate-fade-in">{log}</div>)}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex gap-4">
                {['layers', 'svelte', 'audit'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-cyan-400 border-b border-cyan-500' : 'text-slate-600 hover:text-slate-400'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'layers' && botData && (
                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 rounded-full border border-cyan-500/20">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{botData.layers.length} Active Nodes</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950 flex flex-col">
              {activeTab === 'layers' ? (
                <div className="flex h-full">
                  <div className="flex-1 flex items-center justify-center p-8 border-r border-slate-800 relative overflow-hidden">
                    <div className="w-full h-full max-w-lg aspect-square bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-800 relative">
                      {loading && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 text-cyan-400 font-black uppercase tracking-widest"><Cpu className="w-12 h-12 animate-spin" /><span>Syncing Neural Map...</span></div>}
                      <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full relative z-10" preserveAspectRatio="none">
                        {botData?.layers.map((layer, idx) => (
                          <g 
                            key={layer.id} 
                            style={{ 
                              display: (idx <= activeLayerIndex && layer.visible !== false) ? 'block' : 'none',
                              opacity: layer.opacity || 1
                            }} 
                            dangerouslySetInnerHTML={{ __html: layer.svgContent }} 
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Layer Sidebar */}
                  <div className="w-80 bg-slate-900 flex flex-col shadow-2xl z-20 overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Hierarchy
                      </h4>
                      {botData && (
                        <div className="flex gap-2">
                           <button onClick={() => toggleAllLayers(true)} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-all" title="Show All"><Eye className="w-3 h-3"/></button>
                           <button onClick={() => toggleAllLayers(false)} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all" title="Hide All"><EyeOff className="w-3 h-3"/></button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                      {/* Presets Section */}
                      {botData && (
                        <div className="px-2 py-3 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-3">
                           <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Visibility Presets</h5>
                           <div className="flex gap-2">
                              <input 
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="Preset Name..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[9px] text-white outline-none focus:border-cyan-500 transition-all"
                              />
                              <button onClick={saveVisibilityPreset} disabled={!newPresetName.trim()} className="p-1.5 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 disabled:opacity-30"><Plus className="w-3 h-3"/></button>
                           </div>
                           <div className="flex flex-wrap gap-1.5">
                              {visibilityPresets.map(p => (
                                <div key={p.name} className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg group transition-all hover:border-cyan-500/50">
                                   <button onClick={() => applyVisibilityPreset(p)} className="text-[8px] font-black uppercase text-slate-400 hover:text-cyan-400">{p.name}</button>
                                   <button onClick={() => removePreset(p.name)} className="text-slate-600 hover:text-red-500"><X className="w-2 h-2" /></button>
                                </div>
                              ))}
                              {visibilityPresets.length === 0 && <p className="text-[7px] text-slate-700 italic uppercase">No Saved States</p>}
                           </div>
                        </div>
                      )}

                      {/* Groups Section */}
                      {botData?.groups && botData.groups.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="px-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Node Clusters</h5>
                          {botData.groups.map(g => (
                            <div key={g.id} className="bg-slate-950/30 p-2 rounded-xl border border-slate-800/50 flex items-center justify-between">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[100px]">{g.name}</span>
                               <div className="flex gap-1.5">
                                  <button onClick={() => toggleGroupVisibility(g.layerIds, true)} className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-cyan-400 rounded-md border border-slate-800 transition-all"><Eye className="w-2.5 h-2.5"/></button>
                                  <button onClick={() => toggleGroupVisibility(g.layerIds, false)} className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded-md border border-slate-800 transition-all"><EyeOff className="w-2.5 h-2.5"/></button>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Individual Layers */}
                      <div className="space-y-1">
                        <h5 className="px-2 text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Individual Nodes</h5>
                        {botData?.layers.map((layer, i) => (
                          <div key={layer.id}>
                            <button 
                              onClick={() => setSelectedLayerId(layer.id === selectedLayerId ? null : layer.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${selectedLayerId === layer.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-[9px] font-mono opacity-50">{String(i).padStart(2, '0')}</span>
                                <span className="text-xs font-bold truncate uppercase tracking-tighter">{layer.name || `Node_${layer.id.substring(0,4)}`}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  {layer.visible === false && <EyeOff className="w-2.5 h-2.5 text-red-500/50" />}
                                  {(validationErrors[`${layer.id}-name`] || validationErrors[`${layer.id}-animationDuration`] || validationErrors[`${layer.id}-animationIterationCount`]) && (
                                    <AlertCircle className="w-3 h-3 text-red-400 animate-pulse" />
                                  )}
                                  <Edit3 className="w-3 h-3 opacity-30" />
                              </div>
                            </button>

                            {selectedLayerId === layer.id && (
                              <div className="mt-2 p-4 bg-slate-950/50 rounded-2xl border border-indigo-500/20 space-y-4 animate-fade-in-up mx-1 mb-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Node Label</label>
                                    <input 
                                      value={layer.name} 
                                      onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                                      className={`w-full bg-slate-900 border ${validationErrors[`${layer.id}-name`] ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 transition-all`}
                                    />
                                    {validationErrors[`${layer.id}-name`] && <p className="text-[7px] text-red-500 font-bold uppercase">{validationErrors[`${layer.id}-name`]}</p>}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Duration (s)</label>
                                      <input 
                                        type="number" step="0.1" value={layer.animationDuration || 1} 
                                        onChange={(e) => updateLayer(layer.id, { animationDuration: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Iteration</label>
                                      <input 
                                        value={layer.animationIterationCount || 'infinite'} 
                                        onChange={(e) => updateLayer(layer.id, { animationIterationCount: e.target.value === 'infinite' ? 'infinite' : parseInt(e.target.value) || 1 })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => updateLayer(layer.id, { visible: layer.visible === false })}
                                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${layer.visible !== false ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                    >
                                      {layer.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                      {layer.visible !== false ? "Visible" : "Hidden"}
                                    </button>
                                    <button onClick={() => setSelectedLayerId(null)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white"><Check className="w-3 h-3" /></button>
                                  </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'audit' ? (
                <div className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-6">
                   {auditReport ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                         <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                               <Gauge className="w-24 h-24 text-cyan-400 animate-pulse" />
                               <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">{auditReport.matchScore}%</span>
                            </div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual Integrity Score</h4>
                         </div>
                         <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4" /> Structural Variances</h4>
                            <ul className="space-y-2">
                               {auditReport.differences.map((diff, i) => (
                                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                     <span className="text-cyan-600 font-bold">•</span> {diff}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
                         <Target className="w-12 h-12 mb-4 opacity-20" />
                         <span>Initiate Neural Audit for exact comparison.</span>
                      </div>
                   )}
                </div>
              ) : (
                <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto custom-scrollbar font-mono text-[11px] text-indigo-300">
                  {generatedCode ? (
                    <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
                      <Code className="w-12 h-12 mb-4 opacity-20" />
                      <span>Synthesize Svelte App to see the rebuilt logic.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ErrorDisplay error={error} />
    </div>
  );
};

export default ArtistBot;
