
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Cpu, Network, Zap, Globe, Command, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const KernelTerminal: React.FC = () => {
  const [history, setHistory] = useState<{ cmd: string; output: string; type: 'bash' | 'dos' | 'unix' | 'system' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const processCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    setLoading(true);
    const newHistory = [...history, { cmd, output: '...', type: 'system' as any }];
    setHistory(newHistory);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are the core kernel of an advanced Operating System called 'Neural OS'. 
        You understand ALL command types: Linux (Bash/Zsh), DOS (CMD/PowerShell), and macOS (Darwin).
        CONTEXT: The user has a 'LocalBridge' mounted to their local files.
        TASK: Execute the following command and return the EXACT text output a real terminal would show.
        COMMAND: ${cmd}`,
      });

      const output = response.text || 'Command returned no output.';
      setHistory(prev => {
        const next = [...prev];
        next[next.length - 1].output = output;
        return next;
      });
    } catch (e) {
      setHistory(prev => {
        const next = [...prev];
        next[next.length - 1].output = 'Kernel Panic: Failed to resolve neural logic.';
        return next;
      });
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-black/90 border border-slate-700 rounded-xl overflow-hidden font-mono shadow-2xl">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural OS Universal Shell v1.0.4</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,#0a0a0a_0%,#000_100%)]">
        <div className="text-emerald-500/80 text-[11px] mb-6">
          <pre>{`
  _   _                      _    ____  ____  
 | \ | | ___ _   _ _ __ __ _| |  / __ \/ ___| 
 |  \| |/ _ \ | | | '__/ _\` | | | |  | \___ \ 
 | |\  |  __/ |_| | | | (_| | | | |__| |___) |
 |_| \_|\___|\__,_|_|  \__,_|_|  \____/|____/ 
                                               
 > SYSTEM: Kernel Loaded
 > HARDWARE: Detected ${navigator.hardwareConcurrency} Logical Processors
 > NETWORK: Protocol IPv6 Active
          `}</pre>
        </div>

        {history.map((h, i) => (
          <div key={i} className="animate-fade-in space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">neural-os@admin:~$</span>
              <span className="text-white">{h.cmd}</span>
            </div>
            <div className="text-slate-400 text-xs whitespace-pre-wrap pl-4 border-l border-slate-800 ml-2">
              {h.output === '...' ? (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing logic...</span>
                </div>
              ) : h.output}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 bg-black border-t border-slate-800 flex items-center gap-3">
        <span className="text-emerald-500 text-xs">➜</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && processCommand(input)}
          className="flex-1 bg-transparent text-white outline-none border-none text-sm placeholder:text-slate-700"
          placeholder="ls, dir, networksetup, update-drivers..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default KernelTerminal;
