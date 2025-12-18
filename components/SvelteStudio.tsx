
import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, Play, Layout, Save, RefreshCw, 
  Settings, Download, Share2, Eye, Terminal,
  Box, Sparkles, CheckCircle2, ChevronRight, Loader2,
  Bug, Zap, Globe, Cpu, Layers
} from 'lucide-react';
import Button from './ui/Button';

interface SvelteStudioProps {
  initialCode?: string;
  projectName?: string;
}

const SvelteStudio: React.FC<SvelteStudioProps> = ({ 
  initialCode = '<!-- Reconstructed Logic Manifesting... -->\n<script>\n  let count = $state(0);\n</script>\n\n<div class="p-8 bg-white rounded-2xl shadow-xl">\n  <h1 class="text-3xl font-black text-indigo-600">Svelte 5 Runes</h1>\n  <button \n    onclick={() => count++}\n    class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"\n  >\n    Interaction: {count}\n  </button>\n</div>',
  projectName = "Untitled_Synthesis_01"
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [isRunning, setIsRunning] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = () => {
    if (!previewRef.current) return;
    setIsCompiling(true);
    
    // Industrial Simulation of Svelte 5 execution context
    const html = `
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 2rem; font-family: sans-serif; background: #f8fafc; }
            .svelte-rebuilt-node { animation: fade-in 0.5s ease-out; }
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          </style>
        </head>
        <body>
          <div id="app" class="svelte-rebuilt-node">${code.replace(/<script>[\s\S]*?<\/script>/g, '')}</div>
          <script>
            // Logic Bridge for Runes
            console.log("Kernel: Svelte 5 Context Initialized");
          </script>
        </body>
      </html>
    `;

    setTimeout(() => {
      const doc = previewRef.current!.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
      setIsCompiling(false);
    }, 600);
  };

  useEffect(() => {
    if (isRunning) updatePreview();
  }, [code, isRunning]);

  return (
    <div className="h-[750px] flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-sans">
      {/* Studio Header */}
      <div className="h-16 bg-slate-950 flex items-center px-6 justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <Code2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">{projectName}</h2>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Svelte 5 Reconstruction Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 mr-4">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Terminal className="w-3.5 h-3.5" /> Logic
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
           </div>
           
           <Button onClick={updatePreview} className="bg-emerald-600 hover:bg-emerald-500 h-10 px-6 rounded-xl">
              <Play className="w-4 h-4 mr-2" /> Hot Reload
           </Button>
           <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 border border-white/5 transition-all"><Save className="w-5 h-5" /></button>
           <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 border border-white/5 transition-all"><Settings className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* IDE Area */}
         <div className={`flex-1 flex flex-col relative transition-all duration-500 ${activeTab === 'editor' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'}`}>
            <div className="h-8 bg-slate-950/80 px-4 flex items-center justify-between border-b border-white/5">
               <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="text-indigo-400">App.svelte</span>
                  <span>lib/Genome.js</span>
                  <span>style/Industrial.css</span>
               </div>
               <div className="flex items-center gap-2 text-[8px] text-slate-600 font-mono">
                  <span>UTF-8</span>
                  <span>LNS: 12</span>
               </div>
            </div>
            <textarea 
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 bg-slate-950 p-8 font-mono text-[11px] text-emerald-400/90 outline-none resize-none custom-scrollbar"
              spellCheck={false}
            />
            {/* Real-time Code Intelligence Overlay */}
            <div className="absolute bottom-6 right-6 p-4 bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl shadow-2xl max-w-xs animate-fade-in-up border-l-indigo-500 border-l-4">
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Neural Linting
               </h4>
               <p className="text-[10px] text-slate-400 leading-relaxed italic">Synthesized Runes detected. State reactivity mapped to visual nodes with 98% precision.</p>
            </div>
         </div>

         {/* Preview Area */}
         <div className={`flex-1 flex flex-col bg-white relative transition-all duration-500 ${activeTab === 'preview' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'}`}>
            {isCompiling && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <Cpu className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Compiling Genome...</span>
               </div>
            )}
            <iframe ref={previewRef} title="Studio Sandbox" className="w-full h-full border-none" />
            
            {/* Viewport Overlay */}
            <div className="absolute bottom-6 left-6 p-3 bg-slate-900/80 backdrop-blur rounded-xl border border-white/10 flex items-center gap-4 shadow-2xl">
               <div className="flex items-center gap-2 text-[9px] font-black text-green-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span>System Stable</span>
               </div>
               <div className="w-px h-3 bg-white/10"></div>
               <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">FPS: 60</div>
            </div>
         </div>

         {/* Right Sidebar: Assets & Metadata */}
         <div className="w-64 border-l border-white/5 bg-slate-950 flex flex-col p-4 space-y-6">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Structure
               </h4>
               <div className="space-y-1">
                  {['Root', 'Header', 'HeroSection', 'ContentGrid', 'Footer'].map(n => (
                    <div key={n} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300 border border-white/5 group hover:border-indigo-500/30 cursor-pointer">
                       <Box className="w-3 h-3 text-slate-500" /> {n}
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Deployment
               </h4>
               <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[8px] font-black text-slate-500 uppercase">
                     <span>Target</span>
                     <span className="text-cyan-400">Vercel Edge</span>
                  </div>
                  <Button className="w-full h-9 bg-cyan-600 hover:bg-cyan-500 text-[9px] font-black uppercase tracking-widest shadow-xl">
                     Publish Sandbox
                  </Button>
               </div>
            </div>
            
            <div className="mt-auto space-y-3">
               <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <Bug className="w-4 h-4 text-red-500" />
                  <span className="text-[8px] text-red-400 font-black uppercase">0 Errors Detected</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SvelteStudio;
