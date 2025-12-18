
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Video, Loader2, Sparkles, FileVideo, X, Clock, PlayCircle, Camera, CheckCircle2, ListOrdered, Download, Image as ImageIcon } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { analyzeVideo, fileToBase64 } from '../services/geminiService';

interface VideoProcess {
  id: string;
  file: File;
  base64: string; // INGESTED IMMEDIATELY
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  statusMessage: string;
  result: string;
  error?: string;
}

const VideoAnalyzer: React.FC = () => {
  const [queue, setQueue] = useState<VideoProcess[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [extractingFrame, setExtractingFrame] = useState(false);
  const [targetTime, setTargetTime] = useState("00:01");
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const newEntries: VideoProcess[] = [];
      
      for (const file of selectedFiles) {
          try {
              const base64 = await fileToBase64(file);
              newEntries.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                base64,
                previewUrl: URL.createObjectURL(file),
                status: 'pending',
                progress: 0,
                statusMessage: 'Ready in queue',
                result: ''
              });
          } catch (err: any) {
              console.error("Ingestion failed for", file.name, err);
          }
      }
      
      setQueue(prev => [...prev, ...newEntries]);
      if (!activeId && newEntries.length > 0) setActiveId(newEntries[0].id);
    }
  };

  const removeVideo = (id: string) => {
    setQueue(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
    if (activeId === id) setActiveId(null);
  };

  const handleAnalyzeBatch = async () => {
    const pending = queue.filter(p => p.status === 'pending');
    if (pending.length === 0) return;

    setGlobalLoading(true);

    for (const process of pending) {
      const updateStatus = (prog: number, msg: string) => {
        setQueue(prev => prev.map(p => p.id === process.id ? { ...p, progress: prog, statusMessage: msg } : p));
      };

      setQueue(prev => prev.map(p => p.id === process.id ? { ...p, status: 'processing', progress: 5, statusMessage: 'Initializing...' } : p));
      
      try {
        updateStatus(15, 'Preparing neural stream...');
        const text = await analyzeVideo(process.base64, process.file.type, prompt || "Deconstruct this video.");
        updateStatus(100, 'Success');
        
        setQueue(prev => prev.map(p => p.id === process.id ? { 
          ...p, 
          status: 'completed', 
          result: text || 'No data', 
          progress: 100,
          statusMessage: 'Analysis Complete'
        } : p));
      } catch (err: any) {
        setQueue(prev => prev.map(p => p.id === process.id ? { 
          ...p, 
          status: 'error', 
          error: err.message || 'Engine Error',
          statusMessage: 'Failed'
        } : p));
      }
    }
    setGlobalLoading(false);
  };

  const handleExtractFrame = async () => {
    const active = queue.find(q => q.id === activeId);
    if (!active) return;
    setExtractingFrame(true);
    try {
      const analysis = await analyzeVideo(active.base64, active.file.type, `Deconstruct precisely what is visible at the ${targetTime} mark.`);
      setQueue(prev => prev.map(p => p.id === activeId ? { ...p, result: `[TIMESTAMP ANALYSIS @ ${targetTime}]: ${analysis}\n\n${p.result}` } : p));
    } catch (e) {
      console.error(e);
    } finally {
      setExtractingFrame(false);
    }
  };

  const activeProcess = queue.find(p => p.id === activeId);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-400" /> Video Queue
            </h2>
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 p-1.5 rounded-full text-white transition-colors shadow-lg">
              <Upload className="w-4 h-4" />
              <input type="file" multiple accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-2 custom-scrollbar">
            {queue.length === 0 && (
              <div className="text-center py-10 opacity-30 border-2 border-dashed border-slate-700 rounded-lg">
                <FileVideo className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs">Queue Empty</p>
              </div>
            )}
            {queue.map(p => (
              <div 
                key={p.id} 
                onClick={() => setActiveId(p.id)}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  activeId === p.id ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0 relative">
                    {p.status === 'completed' && <CheckCircle2 className="absolute top-0.5 right-0.5 w-3 h-3 text-green-400 z-10" />}
                    <video src={p.previewUrl} className="w-full h-full object-cover opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{p.file.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                       <p className={`text-[10px] uppercase font-bold ${p.status === 'completed' ? 'text-green-400' : p.status === 'error' ? 'text-red-400' : 'text-slate-500'}`}>{p.statusMessage}</p>
                       {p.status === 'processing' && <span className="text-[10px] text-blue-400 font-mono">{p.progress}%</span>}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeVideo(p.id); }}
                    className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-auto border-t border-slate-700">
             <Button 
                onClick={handleAnalyzeBatch} 
                disabled={queue.filter(p => p.status === 'pending').length === 0 || globalLoading}
                className="w-full h-11"
              >
                {globalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Batch Deconstruct
              </Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
          {activeProcess ? (
            <>
              <div className="p-4 bg-black relative aspect-video flex items-center justify-center">
                <video 
                    ref={videoRef}
                    src={activeProcess.previewUrl} 
                    controls 
                    className="max-h-full w-full shadow-2xl rounded" 
                />
                {activeProcess.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    <p className="text-blue-300 font-bold">{activeProcess.statusMessage}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                 <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Timestamp IQ</span>
                    <input 
                      type="text" 
                      value={targetTime} 
                      onChange={e => setTargetTime(e.target.value)}
                      placeholder="00:01" 
                      className="w-12 bg-transparent text-[10px] text-blue-300 outline-none border-b border-slate-700 text-center" 
                    />
                    <button 
                        onClick={handleExtractFrame}
                        disabled={extractingFrame}
                        className="text-[10px] text-white bg-blue-600 hover:bg-blue-500 px-3 py-0.5 rounded transition-colors"
                    >
                        {extractingFrame ? "Scanning..." : "Analyze"}
                    </button>
                 </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                 <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Deconstruction Focus</label>
                    <textarea 
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="e.g. Extract UI patterns and describe interaction flow..."
                      className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    />
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-yellow-400" /> Neural Report
                    </h3>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 min-h-[200px] relative">
                        {activeProcess.status === 'completed' ? (
                           <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap animate-fade-in">
                              {activeProcess.result}
                           </div>
                        ) : activeProcess.status === 'error' ? (
                           <ErrorDisplay error={activeProcess.error} />
                        ) : (
                           <div className="h-full flex items-center justify-center text-slate-600 italic text-sm py-10 flex-col gap-2 opacity-50">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Reports manifest here.
                           </div>
                        )}
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
              <Video className="w-16 h-16" />
              <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest">System Standby</p>
                  <p className="text-xs">Queue an asset for deconstruction</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyzer;
