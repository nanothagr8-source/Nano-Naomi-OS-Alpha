
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Loader2, Sparkles, Waves } from 'lucide-react';
import { connectLiveVoice, decodeBase64Audio, pcmToAudioBuffer, float32ToPcm, encodeBase64 } from '../services/geminiService';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [transcriptions, setTranscriptions] = useState<{ user?: string; model?: string }[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const handleToggle = async () => {
    if (isActive) {
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
      }
      setIsActive(false);
      setStatus('Disconnected');
      return;
    }

    setStatus('Connecting...');
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const callbacks = {
      onopen: async () => {
        setIsActive(true);
        setStatus('Live');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const inputCtx = new AudioContext({ sampleRate: 16000 });
        const source = inputCtx.createMediaStreamSource(stream);
        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm = float32ToPcm(inputData);
            // CRITICAL: Manual encode to base64 and use promise-then to avoid race condition/stale closures
            const base64 = encodeBase64(pcm);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputCtx.destination);
      },
      onmessage: async (msg: any) => {
        // Use property access for text according to SDK rules
        const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioBase64 && audioCtxRef.current) {
          const bytes = decodeBase64Audio(audioBase64);
          const buffer = await pcmToAudioBuffer(bytes, audioCtxRef.current);
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtxRef.current.destination);
          
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          sourcesRef.current.add(source);
        }

        if (msg.serverContent?.interrupted) {
          sourcesRef.current.forEach(s => s.stop());
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        }

        // Handle Transcriptions
        if (msg.serverContent?.inputAudioTranscription) {
           setTranscriptions(prev => [...prev, { user: msg.serverContent.inputAudioTranscription.text }]);
        }
        if (msg.serverContent?.outputAudioTranscription) {
           setTranscriptions(prev => [...prev, { model: msg.serverContent.outputAudioTranscription.text }]);
        }
      },
      onclose: () => {
        setIsActive(false);
        setStatus('Closed');
      }
    };

    // CRITICAL: Solely rely on sessionPromise resolves to send data
    sessionPromiseRef.current = connectLiveVoice(callbacks);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative">
        <div className={`absolute inset-0 blur-3xl rounded-full opacity-30 transition-all duration-700 ${isActive ? 'bg-green-500 animate-pulse scale-150' : 'bg-slate-700'}`}></div>
        <button
          onClick={handleToggle}
          className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-2xl ${isActive ? 'bg-slate-900 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
        >
          {isActive ? <Radio className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
          <span className="text-sm font-bold uppercase tracking-widest">{isActive ? 'End Session' : 'Go Live'}</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-ping' : 'bg-slate-500'}`}></div>
           <span className="text-sm font-mono text-slate-400">{status}</span>
        </div>
        <p className="text-slate-500 text-sm max-w-xs">Low-latency real-time voice companion. Speak naturally.</p>
      </div>

      <div className="w-full max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar px-4">
         {transcriptions.map((t, i) => (
             <div key={i} className={`flex flex-col gap-1 ${t.user ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-xs ${t.user ? 'bg-green-900/40 text-green-100' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {t.user || t.model}
                </div>
             </div>
         ))}
      </div>
    </div>
  );
};

export default LiveVoice;
