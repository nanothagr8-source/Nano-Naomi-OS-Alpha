
import React, { useState } from 'react';
import { FileText, Save, Download, Trash2, Share2, Type, Search, Settings } from 'lucide-react';

const NanoNotepad: React.FC = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('New Document');

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in font-sans">
      <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-black text-white uppercase tracking-widest w-48"
          />
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><Save className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><Download className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors" onClick={() => setContent('')}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 bg-transparent p-8 text-slate-300 text-base leading-relaxed outline-none resize-none font-mono custom-scrollbar"
          placeholder="Start drafting your next masterpiece..."
        />
      </div>

      <div className="p-3 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest px-6">
        <span>Characters: {content.length} | Lines: {content.split('\n').length}</span>
        <div className="flex items-center gap-4">
           <span className="flex items-center gap-1"><Type className="w-3 h-3" /> Markdown Engine</span>
           <span className="text-indigo-500">Auto-Saving Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default NanoNotepad;
