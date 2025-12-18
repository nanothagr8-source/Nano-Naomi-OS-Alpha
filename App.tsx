
import React, { useState, useEffect, Suspense, lazy, useMemo, useRef, useCallback } from 'react';
import { 
  Video, Image as ImageIcon, Search, Film, Wand2, Sparkles, Menu, X, Bot, 
  Loader2, BrainCircuit, Radio, Music, History, Dna, Binary, Eye, Brain, 
  Library, Clapperboard, Monitor, Zap, HardDrive, Cpu, Terminal, Layers, 
  Maximize2, Minimize2, Square, Command, Power, Signal, Battery, Clock,
  Settings, Bell, Info, CheckCircle, AlertTriangle, AlertCircle, Bug,
  LayoutGrid, Folder, Code2, Keyboard, HelpCircle, Activity, ShoppingBag,
  Globe, FileText, Calculator, PlaySquare, ListTree, Network, Calendar as CalendarIcon,
  Gauge, Workflow, FlaskConical, Repeat
} from 'lucide-react';
import { FeatureId, SuperGemType, NeuralNotification, WindowState } from './types';
import JulesAgent from './components/JulesAgent';
import IndustrialErrorBoundary from './components/ui/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { hotkeys } from './services/hotkeyService';
import { telemetry } from './services/telemetryService';

// Lazy load components
const VideoAnalyzer = lazy(() => import('./components/VideoAnalyzer'));
const ImageAnalyzer = lazy(() => import('./components/ImageAnalyzer'));
const ImageGenerator = lazy(() => import('./components/ImageGenerator'));
const SearchGrounding = lazy(() => import('./components/SearchGrounding'));
const VeoAnimator = lazy(() => import('./components/VeoAnimator'));
const ImageEditor = lazy(() => import('./components/ImageEditor'));
const ArtistBot = lazy(() => import('./components/ArtistBot'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const AudioStudio = lazy(() => import('./components/AudioStudio'));
const LiveVoice = lazy(() => import('./components/LiveVoice'));
const DevEngine = lazy(() => import('./components/DevEngine'));
const QuantumLab = lazy(() => import('./components/QuantumLab'));
const VisualIntelligence = lazy(() => import('./components/VisualIntelligence'));
const TheCore = lazy(() => import('./components/TheCore'));
const AssetNexus = lazy(() => import('./components/AssetNexus'));
const ChronosForge = lazy(() => import('./components/ChronosForge'));
const UIMirror = lazy(() => import('./components/UIMirror'));
const KineticBlueprint = lazy(() => import('./components/KineticBlueprint'));
const LocalBridge = lazy(() => import('./components/LocalBridge'));
const SystemSettings = lazy(() => import('./components/SystemSettings'));
const KernelDebugger = lazy(() => import('./components/KernelDebugger'));
const KernelTerminal = lazy(() => import('./components/KernelTerminal'));
const HardwareManager = lazy(() => import('./components/HardwareManager'));
const FileExplorer = lazy(() => import('./components/FileExplorer'));
const SvelteStudio = lazy(() => import('./components/SvelteStudio'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const NaomiStore = lazy(() => import('./components/NaomiStore'));
const SystemInfo = lazy(() => import('./components/SystemInfo'));
const NaomiBrowser = lazy(() => import('./components/NaomiBrowser'));
const NanoNotepad = lazy(() => import('./components/NanoNotepad'));
const QuantumCalc = lazy(() => import('./components/QuantumCalc'));
const MediaPlayer = lazy(() => import('./components/MediaPlayer'));
const SystemLogs = lazy(() => import('./components/SystemLogs'));
const NetworkMonitor = lazy(() => import('./components/NetworkMonitor'));
const NaomiCalendar = lazy(() => import('./components/NaomiCalendar'));
const PerformanceProfiler = lazy(() => import('./components/PerformanceProfiler'));
const GeneticSynth = lazy(() => import('./components/GeneticSynth'));
const ReasoningConsole = lazy(() => import('./components/ReasoningConsole'));
const RecursiveSynthesis = lazy(() => import('./components/RecursiveSynthesis'));

const App: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<Record<string, WindowState>>({});
  const [activeWindow, setActiveWindow] = useState<FeatureId | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NeuralNotification[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHotkeyHint, setShowHotkeyHint] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background Neural lattice
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System Process Monitoring simulation
  useEffect(() => {
    const monitor = setInterval(() => {
      setOpenWindows(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          // Random CPU/Mem jitter for realism
          next[id].cpuUsage = next[id].isMinimized ? 0.01 : Math.random() * 8 + 0.5;
          next[id].memUsage = (next[id].memUsage || 120) + (Math.random() - 0.5) * 5;
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(monitor);
  }, []);

  useEffect(() => {
    return hotkeys.subscribe((actionId) => {
      const mapping = hotkeys.getMappings().find(m => m.id === actionId);
      if (mapping) {
        setShowHotkeyHint(mapping.action);
        setTimeout(() => setShowHotkeyHint(null), 2000);
      }

      switch (actionId) {
        case 'toggle-launcher': setIsLauncherOpen(prev => !prev); break;
        case 'command-palette': setIsCommandPaletteOpen(prev => !prev); break;
        case 'toggle-help': setIsHelpOpen(prev => !prev); break;
        case 'minimize-all':
           setOpenWindows(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(id => { next[id].isMinimized = true; });
            return next;
          });
          setActiveWindow(null);
          break;
        case 'toggle-debugger': toggleWindow(FeatureId.KERNEL_DEBUGGER); break;
        case 'save-nexus': addNotification('success', 'Kernel Sync', 'Workspace snapshot deployed to Nexus storage.'); break;
      }
    });
  }, [openWindows]);

  const navItems = useMemo(() => [
    { id: FeatureId.NAOMI_BROWSER, label: 'Naomi Browser', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: FeatureId.FILE_EXPLORER, label: 'File Explorer', icon: Folder, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: FeatureId.SVELTE_STUDIO, label: 'Svelte Studio', icon: Code2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: FeatureId.PERFORMANCE_PROFILER, label: 'Kernel Profiler', icon: Gauge, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: FeatureId.GENETIC_SYNTH, label: 'Genetic Synth', icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: FeatureId.RECURSIVE_SYNTHESIS, label: 'Recursive Loop', icon: Repeat, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: FeatureId.REASONING_CONSOLE, label: 'Reasoning HQ', icon: Workflow, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: FeatureId.NANO_NOTEPAD, label: 'Nano Notepad', icon: FileText, color: 'text-slate-200', bg: 'bg-slate-200/10' },
    { id: FeatureId.QUANTUM_CALC, label: 'Quantum Calc', icon: Calculator, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: FeatureId.MEDIA_PLAYER, label: 'Media Player', icon: PlaySquare, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: FeatureId.NAOMI_CALENDAR, label: 'Temporal Planner', icon: CalendarIcon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: FeatureId.SYSTEM_LOGS, label: 'Event Viewer', icon: ListTree, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: FeatureId.NETWORK_MONITOR, label: 'Traffic Control', icon: Network, color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
    { id: FeatureId.TASK_MANAGER, label: 'Task Manager', icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: FeatureId.NAOMI_STORE, label: 'Naomi Store', icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: FeatureId.SYSTEM_INFO, label: 'About Naomi', icon: Info, color: 'text-blue-300', bg: 'bg-blue-300/10' },
    { id: FeatureId.CONSCIENCE, label: 'The Core', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: FeatureId.KERNEL_TERMINAL, label: 'Neural Shell', icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: FeatureId.HARDWARE_MANAGER, label: 'Hardware Manager', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { id: FeatureId.UI_MIRROR, label: 'UI Mirror', icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: FeatureId.KINETIC_BLUEPRINT, label: 'Kinetic Logic', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: FeatureId.CHRONOS_FORGE, label: 'Chronos Forge', icon: Clapperboard, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: FeatureId.ASSET_NEXUS, label: 'Asset Nexus', icon: Library, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: FeatureId.VISUAL_INTELLIGENCE, label: 'Ocular Engine', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: FeatureId.QUANTUM_LAB, label: 'Quantum Lab', icon: Binary, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: FeatureId.DEV_ENGINE, label: 'Dev Engine', icon: Dna, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: FeatureId.IMAGE_GENERATION, label: 'Pro Image', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: FeatureId.CHATBOT, label: 'Think Chat', icon: BrainCircuit, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: FeatureId.LIVE_VOICE, label: 'Live Voice', icon: Radio, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: FeatureId.SYSTEM_SETTINGS, label: 'System Prefs', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { id: FeatureId.KERNEL_DEBUGGER, label: 'Visual Debug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10' },
  ], []);

  const toggleWindow = useCallback((id: FeatureId | string) => {
    setIsLauncherOpen(false);
    setIsCommandPaletteOpen(false);
    
    const featureId = id as FeatureId;

    if (openWindows[featureId]?.isOpen) {
      if (openWindows[featureId].isMinimized) {
        focusWindow(featureId);
      } else if (activeWindow === featureId) {
        minimizeWindow(featureId);
      } else {
        focusWindow(featureId);
      }
    } else {
      const newZ = topZ + 1;
      setTopZ(newZ);
      setOpenWindows(prev => ({
        ...prev,
        [featureId]: { 
          id: featureId, 
          isOpen: true, 
          isMinimized: false, 
          isMaximized: false, 
          zIndex: newZ,
          startTime: Date.now(),
          cpuUsage: Math.random() * 5,
          memUsage: 100 + Math.random() * 200
        }
      }));
      setActiveWindow(featureId);
      telemetry.logMetric({ featureId: featureId as any, duration: 0, status: 'success' });
    }
  }, [openWindows, activeWindow, topZ]);

  const addNotification = (type: NeuralNotification['type'], title: string, message: string) => {
    const newNotif: NeuralNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type, title, message, timestamp: Date.now(), isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    if (!isNotifOpen) setIsNotifOpen(true);
    setTimeout(() => setIsNotifOpen(false), 5000);
  };

  const focusWindow = (id: string) => {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setOpenWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: newZ }
    }));
    setActiveWindow(id as FeatureId);
  };

  const minimizeWindow = (id: string) => {
    setOpenWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
    setActiveWindow(null);
  };

  const closeWindow = (id: string) => {
    setOpenWindows(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (activeWindow === id) setActiveWindow(null);
  };

  const renderComponent = (id: FeatureId) => {
    switch (id) {
      case FeatureId.RECURSIVE_SYNTHESIS: return <RecursiveSynthesis />;
      case FeatureId.GENETIC_SYNTH: return <GeneticSynth />;
      case FeatureId.REASONING_CONSOLE: return <ReasoningConsole />;
      case FeatureId.PERFORMANCE_PROFILER: return <PerformanceProfiler />;
      case FeatureId.NAOMI_BROWSER: return <NaomiBrowser />;
      case FeatureId.NANO_NOTEPAD: return <NanoNotepad />;
      case FeatureId.QUANTUM_CALC: return <QuantumCalc />;
      case FeatureId.MEDIA_PLAYER: return <MediaPlayer />;
      case FeatureId.SYSTEM_LOGS: return <SystemLogs />;
      case FeatureId.NETWORK_MONITOR: return <NetworkMonitor />;
      case FeatureId.NAOMI_CALENDAR: return <NaomiCalendar />;
      case FeatureId.TASK_MANAGER: return <TaskManager processes={Object.values(openWindows)} onKill={closeWindow} onRefresh={() => {}} />;
      case FeatureId.NAOMI_STORE: return <NaomiStore installedModules={Object.keys(openWindows) as FeatureId[]} onToggle={toggleWindow} />;
      case FeatureId.SYSTEM_INFO: return <SystemInfo />;
      case FeatureId.FILE_EXPLORER: return <FileExplorer />;
      case FeatureId.SVELTE_STUDIO: return <SvelteStudio />;
      case FeatureId.CONSCIENCE: return <TheCore />;
      case FeatureId.LOCAL_BRIDGE: return <LocalBridge />;
      case FeatureId.UI_MIRROR: return <UIMirror />;
      case FeatureId.KINETIC_BLUEPRINT: return <KineticBlueprint />;
      case FeatureId.CHRONOS_FORGE: return <ChronosForge />;
      case FeatureId.ASSET_NEXUS: return <AssetNexus />;
      case FeatureId.VISUAL_INTELLIGENCE: return <VisualIntelligence />;
      case FeatureId.QUANTUM_LAB: return <QuantumLab />;
      case FeatureId.DEV_ENGINE: return <DevEngine />;
      case FeatureId.IMAGE_GENERATION: return <ImageGenerator />;
      case FeatureId.CHATBOT: return <Chatbot />;
      case FeatureId.LIVE_VOICE: return <LiveVoice />;
      case FeatureId.IMAGE_ANALYSIS: return <ImageAnalyzer />;
      case FeatureId.IMAGE_EDITING: return <ImageEditor />;
      case FeatureId.VIDEO_UNDERSTANDING: return <VideoAnalyzer />;
      case FeatureId.VEO_ANIMATION: return <VeoAnimator />;
      case FeatureId.AUDIO_STUDIO: return <AudioStudio />;
      case FeatureId.SEARCH_GROUNDING: return <SearchGrounding />;
      case FeatureId.ART_BOT: return <ArtistBot />;
      case FeatureId.SYSTEM_SETTINGS: return <SystemSettings />;
      case FeatureId.KERNEL_DEBUGGER: return <KernelDebugger />;
      case FeatureId.KERNEL_TERMINAL: return <KernelTerminal />;
      case FeatureId.HARDWARE_MANAGER: return <HardwareManager />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden relative font-sans text-slate-200 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] pointer-events-none"></div>
      
      {/* OS Desktop Grid */}
      <div className="absolute inset-0 p-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 grid-rows-8 gap-8 pointer-events-none z-10 overflow-y-auto no-scrollbar">
        {navItems.slice(0, 20).map((item) => (
          <button 
            key={item.id}
            onClick={() => toggleWindow(item.id)}
            className="pointer-events-auto flex flex-col items-center justify-center p-4 rounded-[2rem] hover:bg-white/10 transition-all group w-24 h-24"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-2xl transition-transform group-hover:scale-110 ${item.bg} border border-white/5 backdrop-blur-xl`}>
              <item.icon className={`w-7 h-7 ${item.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 drop-shadow-md text-center group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Start Menu Overlay */}
      {isLauncherOpen && (
        <div className="absolute inset-0 z-[5001] flex items-end justify-center pb-24 p-6 animate-fade-in-up pointer-events-none">
          <div className="w-[680px] h-[620px] bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col overflow-hidden border-t-indigo-500/30">
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Nano Naomi Dashboard</h3>
                     <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.4em]">Integrated Intelligence Environment</p>
                  </div>
                  <button onClick={() => setIsCommandPaletteOpen(true)} className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-600 rounded-full border border-indigo-500 shadow-xl shadow-indigo-900/20 text-white hover:scale-105 transition-all flex items-center gap-2">
                     <Search className="w-3 h-3" /> Universal Search
                  </button>
               </div>
               <div className="grid grid-cols-5 gap-8">
                  {navItems.map(item => (
                    <button key={item.id} onClick={() => toggleWindow(item.id)} className="flex flex-col items-center gap-3 group">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} border border-white/5 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white truncate w-full text-center transition-colors">{item.label}</span>
                    </button>
                  ))}
               </div>
            </div>
            <div className="bg-black/40 p-8 border-t border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 border-2 border-white/20 flex items-center justify-center font-black shadow-lg">A</div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter">Root Operator</p>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active Session: 04:12:03</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <HelpCircle className="w-6 h-6 text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={() => setIsHelpOpen(true)} />
                  <Settings className="w-6 h-6 text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => toggleWindow(FeatureId.SYSTEM_SETTINGS)} />
                  <div className="w-px h-6 bg-white/10"></div>
                  <Power className="w-6 h-6 text-slate-500 hover:text-red-400 cursor-pointer transition-colors" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Window Manager */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {(Object.values(openWindows) as WindowState[]).map((win) => (
          <div 
            key={win.id}
            onClick={() => focusWindow(win.id)}
            className={`absolute pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 bg-slate-900/85 backdrop-blur-3xl rounded-[2.5rem] flex flex-col ${
              win.isMinimized ? 'scale-90 opacity-0 translate-y-32 blur-xl' : 'scale-100 opacity-100'
            } ${win.id === activeWindow ? 'ring-2 ring-indigo-500/40 shadow-indigo-500/10' : ''}`}
            style={{ 
              zIndex: win.zIndex,
              left: win.isMaximized ? 0 : '10%',
              top: win.isMaximized ? 0 : '10%',
              width: win.isMaximized ? '100%' : '80%',
              height: win.isMaximized ? 'calc(100% - 72px)' : '80%',
            }}
          >
            <div className="h-16 bg-slate-950/40 border-b border-white/5 flex items-center justify-between px-8 cursor-default select-none">
               <div className="flex items-center gap-4">
                  {React.createElement(navItems.find(n => n.id === win.id)?.icon || Layers, { className: `w-5 h-5 ${navItems.find(n => n.id === win.id)?.color}` })}
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{navItems.find(n => n.id === win.id)?.label}</span>
                     <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Nano OS Subsystem</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/5 transition-colors group"><Minimize2 className="w-4 h-4 text-slate-500 group-hover:text-slate-300" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setOpenWindows(p => ({ ...p, [win.id]: { ...p[win.id], isMaximized: !p[win.id].isMaximized }})); }} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/5 transition-colors group"><Maximize2 className="w-4 h-4 text-slate-500 group-hover:text-slate-300" /></button>
                  <div className="w-px h-6 bg-white/10 mx-2"></div>
                  <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-red-500/20 text-red-500 transition-colors"><X className="w-5 h-5" /></button>
               </div>
            </div>
            <div className="flex-1 overflow-auto relative custom-scrollbar">
              <IndustrialErrorBoundary moduleName={win.id}>
                <Suspense fallback={<div className="h-full flex flex-col items-center justify-center gap-6"><Loader2 className="w-16 h-16 animate-spin text-indigo-500/30" /><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mounting Subsystem...</p></div>}>
                  <div className="p-10 h-full">{renderComponent(win.id as FeatureId)}</div>
                </Suspense>
              </IndustrialErrorBoundary>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Naomi Taskbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 w-fit min-w-[400px] bg-slate-900/60 border border-white/10 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-between px-3 z-[5000] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsLauncherOpen(!isLauncherOpen)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLauncherOpen ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'hover:bg-white/10'}`}
          >
            <LayoutGrid className={`w-6 h-6 ${isLauncherOpen ? 'text-white' : 'text-indigo-400'}`} />
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-2"></div>

          <div className="flex items-center gap-2">
             {navItems.map(item => {
               const win = openWindows[item.id];
               if (!win) return null;
               return (
                 <button 
                  key={item.id}
                  onClick={() => focusWindow(item.id)}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all group ${
                    activeWindow === item.id ? 'bg-white/10 scale-110 border-white/10 shadow-xl' : 'hover:bg-white/5'
                  }`}
                 >
                    <item.icon className={`w-5 h-5 ${item.color} ${win.isMinimized ? 'opacity-30' : 'opacity-100'}`} />
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 rounded-full transition-all duration-500 ${
                      activeWindow === item.id ? 'w-3 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' : win.isOpen ? 'w-1 bg-slate-500' : 'w-0'
                    }`}></div>
                 </button>
               );
             })}
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 border-l border-white/10 ml-4 h-full">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                   <Signal className="w-4 h-4 text-emerald-400" />
                   <div className="w-4 h-0.5 bg-emerald-500/20 rounded mt-0.5"></div>
                </div>
                <div className="flex flex-col items-center">
                   <Battery className="w-4 h-4 text-indigo-400" />
                   <div className="w-4 h-0.5 bg-indigo-500/20 rounded mt-0.5"></div>
                </div>
              </div>
              <button 
                onClick={() => toggleWindow(FeatureId.NAOMI_CALENDAR)}
                className="flex flex-col items-end hover:bg-white/5 p-1 px-2 rounded-xl transition-all cursor-pointer"
              >
                <span className="text-[12px] text-white leading-none font-black tracking-tighter">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[9px] text-slate-500 leading-none font-bold uppercase tracking-widest mt-0.5">
                  {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </button>
           </div>
        </div>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onExecute={toggleWindow}
        commands={navItems}
      />

      <JulesAgent activeFeature={activeWindow || 'desktop'} onActivateGem={() => {}} />

      <style>{`
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
