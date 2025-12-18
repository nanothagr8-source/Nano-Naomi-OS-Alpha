
import React, { useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Video, Maximize, List, Repeat, Shuffle } from 'lucide-react';

const MediaPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  return (
    <div className="h-full flex flex-col bg-slate-900 animate-fade-in font-sans overflow-hidden">
      <div className="flex-1 bg-black flex items-center justify-center relative group">
        <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-slate-950 flex flex-col items-center justify-center gap-6">
           <div className="w-48 h-48 rounded-3xl bg-slate-900 border border-white/5 shadow-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
              <Music className="w-20 h-20 text-indigo-500" />
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Resonance Frequency</h3>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Neural Artist v1.0</p>
           </div>
        </div>
        
        {/* Hover Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8">
           <button className="p-3 text-white hover:scale-110 transition-transform"><SkipBack className="w-6 h-6" /></button>
           <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform">
             {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
           </button>
           <button className="p-3 text-white hover:scale-110 transition-transform"><SkipForward className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="p-6 bg-slate-950 border-t border-white/10 space-y-6">
        <div className="space-y-3">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 cursor-pointer">
            <div className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
            <span>01:12</span>
            <span>04:42</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 text-slate-500">
              <Shuffle className="w-4 h-4 hover:text-white cursor-pointer" />
              <Repeat className="w-4 h-4 hover:text-white cursor-pointer" />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 w-3/4"></div>
                </div>
              </div>
              <button className="p-2 bg-slate-900 rounded-lg text-slate-400 border border-white/5 hover:text-white"><Maximize className="w-4 h-4" /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
