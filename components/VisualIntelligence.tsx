
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, ScanLine, AlertTriangle, CheckCircle, Zap, RefreshCw, Maximize2, Monitor, Loader2, Target } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { analyzeVisualState, checkAndRequestApiKey } from '../services/geminiService';
import { OcularReview } from '../types';

const VisualIntelligence: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [review, setReview] = useState<OcularReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const captureViewport = async (): Promise<string | null> => {
    try {
      // Use the modern screen capture API if available, or a fallback
      // For this app, we will assume display-capture permission is granted in metadata.json
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/png');
      stream.getTracks().forEach(track => track.stop());
      return dataUrl.split(',')[1];
    } catch (e) {
      console.error("Capture failed", e);
      return null;
    }
  };

  const handleScan = async () => {
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setIsScanning(true);
    setError('');

    try {
      const base64 = await captureViewport();
      if (!base64) throw new Error("Could not capture viewport state.");
      
      setScreenshot(`data:image/png;base64,${base64}`);
      const result = await analyzeVisualState(base64, "Ensure the application is beautiful, high-performance, and intuitively designed.");
      setReview(result);
    } catch (err: any) {
      setError(err.message || "Visual analysis engine failure.");
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Control Strip */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
        
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full transition-all duration-500 ${isScanning ? 'bg-purple-600 animate-pulse' : 'bg-slate-800'}`}>
            <Eye className={`w-8 h-8 ${isScanning ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">The Ocular Engine</h2>
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em]">Autonomous Visual Feedback Loop</p>
          </div>
        </div>

        <div className="flex gap-3">
           <Button 
            onClick={handleScan} 
            disabled={loading} 
            isLoading={loading}
            className="bg-purple-600 hover:bg-purple-500 h-14 px-8 rounded-2xl shadow-[0_0_25px_rgba(147,51,234,0.4)]"
           >
             <ScanLine className="w-5 h-5 mr-2" /> {loading ? "Scanning Viewport..." : "Trigger Visual Scan"}
           </Button>
           {review && (
             <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-4 rounded-2xl border transition-all ${showHeatmap ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
              title="Toggle Attention Heatmap"
             >
               <Target className="w-6 h-6" />
             </button>
           )}
        </div>
      </div>

      <ErrorDisplay error={error} />

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Visual State & Heatmap */}
        <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
          {screenshot ? (
            <div className="relative w-full h-full">
              <img src={screenshot} className="w-full h-full object-cover brightness-50" alt="Analysis Frame" />
              {showHeatmap && review?.gazePoints.map((point, i) => (
                <div 
                  key={i}
                  className="absolute animate-pulse"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-2xl ${point.issue ? 'border-red-500 bg-red-500/20' : 'border-cyan-500 bg-cyan-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${point.issue ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-white/10 text-[8px] font-bold text-white whitespace-nowrap shadow-xl">
                    {point.label}
                  </div>
                </div>
              ))}
              {/* Scan Line Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent h-10 w-full animate-ocular-scan"></div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-20">
               <Monitor className="w-20 h-20 mx-auto" />
               <p className="text-xs font-bold uppercase tracking-widest">Awaiting Capture Stream</p>
            </div>
          )}
          
          <div className="absolute top-6 left-6 flex flex-col gap-2">
             <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Ocular Feed: {isScanning ? 'LIVE' : 'STANDBY'}</span>
             </div>
          </div>
        </div>

        {/* Right: Critique & AI Action */}
        <div className="space-y-6">
          {review ? (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-full animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Director's Critique</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Synthesized Reasoning Layer</p>
                   </div>
                   <div className="text-center">
                      <div className={`text-4xl font-black tracking-tighter ${review.rating > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {review.rating}<span className="text-lg opacity-50">/100</span>
                      </div>
                      <p className="text-[8px] text-slate-500 uppercase font-black">Aesthetic Score</p>
                   </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group">
                      <Zap className="w-5 h-5 text-yellow-500 absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                      <p className="text-slate-300 text-sm leading-relaxed italic">"{review.critique}"</p>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-400" /> Improvement Vector
                         </h4>
                         <p className="text-xs text-slate-300 leading-relaxed">{review.suggestedFixes}</p>
                      </div>
                   </div>

                   {review.autoCodePatch && (
                     <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Autonomous Patch Protocol</h4>
                           <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black rounded uppercase">Ready</span>
                        </div>
                        <p className="text-xs text-indigo-200">The AI has prepared an architectural correction based on this visual feedback.</p>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 h-10 text-[10px] font-black uppercase">Apply Reinvention Patch</Button>
                     </div>
                   )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                         {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700"></div>)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verified by Creative Agent Jules</span>
                   </div>
                   <button className="text-slate-500 hover:text-white transition-colors">
                      <RefreshCw className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ) : (
             <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
                <div className="max-w-xs">
                   <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Idle Intelligence</h3>
                   <p className="text-xs text-slate-600">Engage the Ocular Engine to begin visual self-correction protocols.</p>
                </div>
             </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ocular-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(600%); }
        }
        .animate-ocular-scan {
          animation: ocular-scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VisualIntelligence;
