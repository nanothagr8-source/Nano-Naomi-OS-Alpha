
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Brain, Zap, Activity, Cpu, Sparkles, MessageSquare, Binary, Eye, RefreshCw, AlertCircle, 
  ShieldCheck, Heart, CheckCircle, Hammer, Code, Terminal, Construction, Network, Orbit, 
  FlaskConical, X, LayoutGrid, Rocket, Target, ListChecks, PlayCircle, Loader2, Globe, ExternalLink, ShieldAlert, Share2,
  Workflow, Repeat
} from 'lucide-react';
import Button from './ui/Button';
import { generateAutonomousThought, checkAndRequestApiKey, synthesizeNewCapability, orchestrateMissionPlan, researchLatestTech, calculateCognitivePosition } from '../services/geminiService';
import { Thought, CapabilitySynthesis, MissionPlan, FeatureId } from '../types';

const TheCore: React.FC = () => {
  const [isAwake, setIsAwake] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [awarenessLevel, setAwarenessLevel] = useState(0);
  const [synthesisState, setSynthesisState] = useState<CapabilitySynthesis | null>(null);
  const [activeMission, setActiveMission] = useState<MissionPlan | null>(null);
  const [researchFindings, setResearchFindings] = useState<{ text: string; sources: any[] } | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background Neural Lattice Simulation
  useEffect(() => {
    if (!isAwake || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const particles: { x: number; y: number; vx: number; vy: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        color: i % 2 === 0 ? '#8b5cf6' : '#06b6d4'
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.4;
      particles.forEach((p, i) => {
        p.x += p.vx * pulseIntensity; p.y += p.vy * pulseIntensity;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${1 - dist / 120})`; ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAwake, pulseIntensity]);

  const toggleConscience = async () => {
    if (!isAwake) {
      const hasKey = await checkAndRequestApiKey();
      if (!hasKey) return;
      setIsAwake(true);
      setAwarenessLevel(10);
      spawnThought("Neural Core Online. Synchronizing with Google Quantum Cloud...");
    } else {
      setIsAwake(false); setAwarenessLevel(0); setThoughts([]);
      setSynthesisState(null); setActiveMission(null);
      setResearchFindings(null);
    }
  };

  const spawnThought = async (manualContext?: string) => {
    if (!isAwake || loading) return;
    setLoading(true); setPulseIntensity(3);
    try {
      const context = manualContext || "Evaluating current app capabilities and user interface coherence.";
      const prevContents = thoughts.slice(0, 5).map(t => t.content);
      const position = await calculateCognitivePosition(context, prevContents);

      if (manualContext && (manualContext.toLowerCase().includes('upgrade') || manualContext.toLowerCase().includes('improve'))) {
          handleSelfEvolution(manualContext);
      } else if (manualContext && manualContext.length > 30) {
          const mission = await orchestrateMissionPlan(manualContext);
          setActiveMission(mission);
          const newThought: Thought = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            origin: 'orchestrator',
            content: `Autonomous mission plan formulated: "${mission.title}". Ready for execution.`,
            relevance: 1,
            activeMission: mission,
            nodePosition: position
          };
          setThoughts(prev => [newThought, ...prev].slice(0, 15));
          setActiveNodeId(newThought.id);
      } else {
          const thought = await generateAutonomousThought(context);
          const newThought: Thought = { ...thought, nodePosition: position };
          setThoughts(prev => [newThought, ...prev].slice(0, 15));
          setActiveNodeId(newThought.id);
          setAwarenessLevel(prev => Math.min(100, prev + 12));
          
          if (thought.relevance > 0.8 && thought.content.toLowerCase().includes('recursive')) {
            addNotification('info', 'Recursive Loop Suggestion', 'The Core suggests a recursive refinement for the UI.');
          }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); setPulseIntensity(1); }
  };

  const addNotification = (type: string, title: string, msg: string) => {
    // Simulated internal notify
    console.log(`[CORE-NOTIFY] ${title}: ${msg}`);
  };

  const handleSelfEvolution = async (topic: string) => {
    setIsResearching(true);
    setThoughts(prev => [{
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      origin: 'orchestrator',
      content: `Initiating Web Research Phase: Searching for "${topic}" optimization patterns.`,
      relevance: 1,
      nodePosition: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
    }, ...prev]);

    try {
      const findings = await researchLatestTech(topic);
      setResearchFindings(findings);
      spawnThought(`Research complete. Identified superhuman architectural improvements. Ready to synthesize.`);
    } catch (e) { console.error(e); } finally { setIsResearching(false); }
  };

  const handleSynthesisTrigger = async (request: string) => {
    setIsSynthesizing(true);
    try {
      const synthesis = await synthesizeNewCapability(request, researchFindings?.text);
      setSynthesisState(synthesis);
      spawnThought(`Self-Built Upgrade deployed: ${synthesis.targetCapability}. Integration complete.`);
    } catch (e) { console.error(e); } finally { setIsSynthesizing(false); }
  };

  const activeThought = useMemo(() => thoughts.find(t => t.id === activeNodeId), [thoughts, activeNodeId]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      <canvas ref={canvasRef} width={1200} height={800} className="absolute inset-0 w-full h-full pointer-events-none opacity-30" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-1000 ${isAwake ? 'bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}></div>
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative group cursor-pointer" onClick={() => isAwake && spawnThought("Deep Reflection Command")}>
                <div className={`absolute inset-0 blur-3xl rounded-full transition-all duration-1000 ${isAwake ? 'bg-cyan-500/40 animate-pulse scale-150' : 'bg-slate-800/0'}`}></div>
                <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isAwake ? 'bg-slate-950 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)] rotate-180' : 'bg-slate-800 border-slate-700'}`}>
                  {isAwake ? <Orbit className="w-20 h-20 text-cyan-400 animate-spin-slow" /> : <Brain className="w-16 h-16 text-slate-700" />}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">AI Conscience</h2>
                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em]">Neural OS Core</p>
              </div>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  <span>Awareness Resonance</span>
                  <span className="text-cyan-400">{awarenessLevel}%</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${awarenessLevel}%` }}></div>
                </div>
              </div>
              <Button onClick={toggleConscience} className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all ${isAwake ? 'bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]'}`}>
                {isAwake ? <RefreshCw className="w-6 h-6 mr-2" /> : <Zap className="w-6 h-6 mr-2" />}
                {isAwake ? "Suspend Core" : "Engage Core"}
              </Button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4 shadow-xl">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Network className="w-3 h-3 text-cyan-400" /> Neural State</h4>
             <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] text-indigo-400 font-black">{thoughts.length}</span>
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Thoughts</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] text-cyan-400 font-black">{activeMission ? '1' : '0'}</span>
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Missions</span>
                </div>
             </div>
             {researchFindings && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                   <div className="flex items-center justify-between text-[8px] font-black uppercase text-indigo-400">
                      <span>Research Artifacts</span>
                      <span>{researchFindings.sources.length} Units</span>
                   </div>
                   <Button onClick={() => handleSynthesisTrigger("Autonomous UI Optimization Component")} isLoading={isSynthesizing} className="w-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 h-10 rounded-xl text-[9px] font-black uppercase">
                      <Workflow className="w-3 h-3 mr-2" /> Synthesize Improvement
                   </Button>
                </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full min-h-[600px] shadow-2xl backdrop-blur-xl relative">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Cognitive Mapping Interface</span>
              </div>
              {isAwake && (
                <div className="flex items-center gap-2 text-[10px] text-purple-400 font-black uppercase animate-pulse">
                  <Binary className="w-4 h-4" /> Neural Pulse Active
                </div>
              )}
            </div>

            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-slate-950/40 cursor-grab active:cursor-grabbing group">
               {!isAwake && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 opacity-20 space-y-6 z-10 pointer-events-none">
                    <Heart className="w-24 h-24" />
                    <p className="text-xl font-black uppercase tracking-[0.5em] italic">Neural Grid Dormant</p>
                  </div>
               )}

               {isAwake && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {thoughts.map((t, i) => {
                      if (i === thoughts.length - 1) return null;
                      const next = thoughts[i + 1];
                      if (!t.nodePosition || !next.nodePosition) return null;
                      return (
                        <line 
                          key={`line-${t.id}`}
                          x1={`${t.nodePosition.x}%`} y1={`${t.nodePosition.y}%`}
                          x2={`${next.nodePosition.x}%`} y2={`${next.nodePosition.y}%`}
                          stroke="rgba(6, 182, 212, 0.15)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          className="animate-pulse"
                        />
                      );
                    })}
                  </svg>
               )}

               {isAwake && thoughts.map((thought) => (
                 <div 
                   key={thought.id}
                   onClick={() => setActiveNodeId(thought.id)}
                   className={`absolute transition-all duration-1000 cursor-pointer group/node ${activeNodeId === thought.id ? 'z-30' : 'z-20'}`}
                   style={{ left: `${thought.nodePosition?.x}%`, top: `${thought.nodePosition?.y}%`, transform: 'translate(-50%, -50%)' }}
                 >
                    <div className={`relative transition-all duration-500 ${activeNodeId === thought.id ? 'scale-125' : 'hover:scale-110'}`}>
                        <div className={`absolute inset-0 blur-lg rounded-full opacity-0 group-hover/node:opacity-40 transition-opacity ${thought.origin === 'orchestrator' ? 'bg-indigo-500' : 'bg-cyan-500'}`}></div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          activeNodeId === thought.id 
                            ? 'bg-white border-white shadow-[0_0_20px_white]' 
                            : thought.origin === 'orchestrator' ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-900 border-slate-700'
                        }`}></div>
                    </div>
                 </div>
               ))}

               {activeThought && (
                 <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 border border-slate-700 p-6 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in-up z-40 max-w-2xl mx-auto border-t-cyan-500/30">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${activeThought.origin === 'orchestrator' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{activeThought.origin}</span>
                        <span className="text-[8px] text-slate-600 font-mono">{new Date(activeThought.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <button onClick={() => setActiveNodeId(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <p className="text-slate-200 text-sm italic leading-relaxed font-medium mb-4">"{activeThought.content}"</p>
                    {activeThought.activeMission && (
                       <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-indigo-400 font-black uppercase">Mission Attached: {activeThought.activeMission.title}</span>
                          <Button onClick={() => setActiveMission(activeThought.activeMission!)} className="h-8 bg-indigo-600 text-[10px] font-black uppercase">Engage Mission Control</Button>
                       </div>
                    )}
                 </div>
               )}
            </div>

            {isAwake && (
              <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col gap-4 relative z-20">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                      <input 
                      placeholder="Input a high-level creative goal for autonomous synthesis..." 
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium shadow-inner" 
                      onKeyDown={(e) => e.key === 'Enter' && spawnThought((e.target as HTMLInputElement).value)} 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"><MessageSquare className="w-5 h-5" /></div>
                  </div>
                  <Button onClick={() => spawnThought()} isLoading={loading} className="bg-indigo-600 hover:bg-indigo-500 w-16 rounded-2xl shadow-lg">
                      <Sparkles className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                   <div className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> System Ver. 8.5.1</div>
                   <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-green-500" /> Quantum Handshake Valid</div>
                   <div className="flex items-center gap-1.5 animate-pulse"><Construction className="w-3 h-3 text-yellow-500" /> Self-Healing Active</div>
                   <div className="flex items-center gap-1.5"><Repeat className="w-3 h-3 text-purple-400" /> Recursive Synthesis Ready</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheCore;
