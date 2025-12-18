
import React, { useState, useRef } from 'react';
import { 
  Zap, Play, Timer, Loader2, Video, 
  Code2, Download, RefreshCcw, Wand2,
  Activity, Layers, MousePointer2
} from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { extractKineticLogic, checkAndRequestApiKey, fileToBase64 } from '../services/geminiService';
import { KineticMotionData } from '../types';

const KineticBlueprint: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KineticMotionData | null>(null);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    try {
      // Convert the File to base64 and pass it along with its mimeType to the kinetic analysis service
      const base64 = await fileToBase64(file);
      const data = await extractKineticLogic(base64, file.type);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Kinetic analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-600/20 rounded-2xl border border-orange-500/30">
            <Zap className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Kinetic Blueprint</h2>
            <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em]">Interaction Logic Extractor</p>
          </div>
        </div>
        <Button onClick={handleAnalyze} disabled={!file || loading} isLoading={loading} className="bg-orange-600 hover:bg-orange-500 h-14 px-8 rounded-2xl shadow-xl">
           <Activity className="w-5 h-5 mr-2" /> {loading ? "Analyzing Motion..." : "Extract Interaction Logic"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Input Media</span>
            <span className="text-[8px] bg-slate-800 px-2 py-1 rounded text-orange-400 font-bold uppercase tracking-widest">Temporal Context</span>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center p-8 group">
            {preview ? (
              <video ref={videoRef} src={preview} controls className="w-full h-full object-contain" />
            ) : (
              <label className="flex flex-col items-center justify-center gap-4 text-slate-700 cursor-pointer hover:text-slate-500 transition-colors">
                <Video className="w-16 h-16 opacity-20" />
                <span className="text-xs font-black uppercase tracking-widest">Drop UI Interaction Clip (MP4)</span>
                <input type="file" hidden onChange={handleFileChange} accept="video/*" />
              </label>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Extracted Motion Manifest</span>
            {result && <button className="text-slate-500 hover:text-white"><Download className="w-4 h-4" /></button>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950 font-mono">
            {!result && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-4">
                <MousePointer2 className="w-16 h-16 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] italic text-center">Scrubbing Temporal Data</p>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                 <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                 <div className="text-center">
                    <p className="text-[10px] text-orange-400 font-mono animate-pulse">Calculating Easing Curves...</p>
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Motion Logic</h4>
                    {result.transitions.map((t, i) => (
                       <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-orange-600 px-1.5 rounded text-white font-black uppercase">{t.element}</span>
                                <span className="text-xs font-bold text-slate-300">{t.property}</span>
                             </div>
                             <p className="text-[10px] text-slate-500">{t.trigger}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-orange-400">{t.duration}ms</p>
                             <p className="text-[9px] text-slate-600 font-bold uppercase">{t.easing}</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="space-y-3 pt-6 border-t border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Code2 className="w-4 h-4" /> Svelte Transition Module</h4>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-[10px] text-orange-300 overflow-x-auto">
                       <pre>{result.svelteCode}</pre>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ErrorDisplay error={error} />
    </div>
  );
};

export default KineticBlueprint;
