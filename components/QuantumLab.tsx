
import React, { useState, useMemo } from 'react';
import { Cpu, Zap, Share2, Code, Download, Sparkles, Binary, Activity, Layers, Terminal, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { generateQuantumCircuit, checkAndRequestApiKey } from '../services/geminiService';
import { QuantumCircuitResult } from '../types';

const QuantumLab: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuantumCircuitResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'visualization' | 'code' | 'analysis'>('visualization');

  const handleCompute = async () => {
    if (!objective.trim()) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    try {
      const data = await generateQuantumCircuit(objective);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Quantum computation failed.");
    } finally {
      setLoading(false);
    }
  };

  const sycamoreGrid = useMemo(() => {
    const grid = [];
    const cols = 9;
    const rows = 6;
    for (let i = 0; i < cols * rows; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        // Sycamore chip has a specific cross-like grid
        const isValid = (r + c) % 2 === 0;
        grid.push({ id: i, r, c, isValid });
    }
    return grid;
  }, []);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Quantum Orchestrator</h2>
              <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest">Sycamore v3 / Cirq 1.4</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Objective Module</label>
              <textarea 
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="e.g. Optimize a lithium-ion battery molecular simulation using QAOA..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
              />
            </div>
            
            <Button 
              onClick={handleCompute} 
              disabled={loading || !objective} 
              isLoading={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 h-12 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Zap className="w-4 h-4 mr-2" /> 
              Synthesize Circuit
            </Button>
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Quantum Advantage</span>
                <span className="text-cyan-400">{result.expectedSpeedup}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Error Correction</span>
                <span className="text-green-400">Surface Code 5:1</span>
              </div>
            </div>
          )}
        </div>

        <ErrorDisplay error={error} />
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[600px] shadow-2xl">
          <div className="bg-slate-950 p-2 flex border-b border-slate-800">
             {[
               { id: 'visualization', label: 'Qubit State Map', icon: Activity },
               { id: 'code', label: 'Cirq Hardcode', icon: Terminal },
               { id: 'analysis', label: 'Spectral Report', icon: Layers },
             ].map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
               >
                 <tab.icon className="w-3 h-3" />
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="flex-1 p-6 flex flex-col">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-30 space-y-4">
                <Binary className="w-20 h-20" />
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest">Interface Idle</p>
                  <p className="text-xs">Define an objective to engage the Sycamore processor</p>
                </div>
              </div>
            )}

            {loading && (
               <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                     <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
                     <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                     <h3 className="text-lg font-bold text-white tracking-tight">Compiling Unitary Matrix</h3>
                     <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.2em] animate-pulse">Gemini 3 Pro: Reasoning Depth active...</p>
                  </div>
               </div>
            )}

            {result && activeTab === 'visualization' && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="grid grid-cols-9 gap-2 mb-8 mx-auto">
                    {sycamoreGrid.map((cell) => {
                        const state = result.qubitStates.find(q => q.id === cell.id);
                        const isActive = cell.isValid && state?.active;
                        const probability = state?.probability || 0;
                        const phase = state?.phase || 0;

                        return (
                            <div 
                                key={cell.id} 
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 relative group ${
                                    !cell.isValid ? 'opacity-5' : 'border border-slate-800 bg-slate-950/50'
                                }`}
                                style={{
                                    boxShadow: isActive ? `0 0 ${probability * 20}px rgba(6, 182, 212, ${probability * 0.5})` : 'none',
                                    borderColor: isActive ? `rgba(6, 182, 212, ${probability})` : undefined,
                                    transform: isActive ? `rotate(${phase}deg)` : undefined
                                }}
                            >
                                {isActive && (
                                    <div className="absolute inset-1 bg-cyan-500 rounded-md opacity-20 animate-pulse"></div>
                                )}
                                <span className={`text-[8px] font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-slate-800'}`}>
                                    q{cell.id}
                                </span>
                                
                                {isActive && (
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                        P: {(probability * 100).toFixed(1)}% | φ: {phase}°
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 mt-auto">
                   <h4 className="text-cyan-400 font-bold text-sm mb-2 flex items-center gap-2">
                       <Sparkles className="w-4 h-4" /> Entanglement Architecture
                   </h4>
                   <p className="text-slate-400 text-xs leading-relaxed">
                       {result.description}
                   </p>
                </div>
              </div>
            )}

            {result && activeTab === 'code' && (
              <div className="flex-1 flex flex-col animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-cyan-300 overflow-auto flex-1 custom-scrollbar">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                     <span className="text-slate-500 font-bold uppercase">google_sycamore_cirq_export.py</span>
                     <button className="hover:text-white transition-colors"><Share2 className="w-3 h-3" /></button>
                  </div>
                  <pre>{result.cirqCode}</pre>
                </div>
                <div className="mt-4 flex gap-3">
                   <Button className="flex-1 bg-slate-800 border border-slate-700 h-10 text-xs">
                      <Code className="w-3 h-3 mr-2" /> Copy to Clipboard
                   </Button>
                   <Button className="flex-1 bg-slate-800 border border-slate-700 h-10 text-xs">
                      <Download className="w-3 h-3 mr-2" /> Download Bundle
                   </Button>
                </div>
              </div>
            )}

            {result && activeTab === 'analysis' && (
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-center text-center">
                     <span className="text-slate-500 text-[10px] font-bold uppercase mb-2">Computational Complexity</span>
                     <span className="text-3xl font-black text-white tracking-tighter">{result.complexComplexity || 'O(2^n)'}</span>
                     <div className="w-full h-1.5 bg-slate-900 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-cyan-500 w-3/4 animate-pulse"></div>
                     </div>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-bold text-slate-100 uppercase mb-4 flex items-center gap-2">
                        <Layers className="w-3 h-3 text-cyan-400" /> Layered Breakdown
                     </h4>
                     <ul className="space-y-2">
                        {['Hamiltonian Mapping', 'Unitary Synthesis', 'Error Correction', 'Readout Calibration'].map((step, i) => (
                           <li key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[8px] font-bold">{i+1}</span>
                              {step}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLab;
