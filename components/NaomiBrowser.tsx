
import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCcw, Home, Lock, Search, ShieldCheck, ChevronRight } from 'lucide-react';

const NaomiBrowser: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl;
    if (!target.startsWith('http')) target = 'https://' + target;
    setUrl(target);
    setHistory(prev => [...prev, target]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 animate-fade-in font-sans">
      {/* Browser Toolbar */}
      <div className="h-14 bg-slate-950 border-b border-white/10 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/10 rounded-full text-slate-400"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/10 rounded-full text-slate-400" onClick={() => setUrl(url)}><RotateCcw className="w-4 h-4" /></button>
        </div>
        
        <form onSubmit={handleNavigate} className="flex-1 max-w-3xl flex items-center bg-slate-900 border border-white/5 rounded-full px-4 py-1.5 focus-within:border-indigo-500 transition-all">
          <Lock className="w-3 h-3 text-green-500 mr-3" />
          <input 
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200"
            placeholder="Search or enter address"
          />
          <button type="submit" className="hidden" />
          <ShieldCheck className="w-3 h-3 text-indigo-400 ml-3" />
        </form>

        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-white/10 rounded-full text-slate-400" onClick={() => { setUrl('https://www.google.com'); setInputUrl('https://www.google.com'); }}><Home className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 bg-white relative">
        <iframe 
          src={url} 
          className="w-full h-full border-none" 
          title="Naomi Viewport"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        {/* Anti-Tracking Shield Overlay Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
           <ShieldCheck className="w-3 h-3 text-indigo-400" />
           <span className="text-[8px] font-black text-white uppercase tracking-widest">Nano Shield Active</span>
        </div>
      </div>

      <div className="h-8 bg-slate-950 border-t border-white/10 flex items-center px-4 justify-between text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Optimized for Quantum Latency</span>
         </div>
         <span className="text-indigo-500">Secure Protocol v1.0</span>
      </div>
    </div>
  );
};

export default NaomiBrowser;
