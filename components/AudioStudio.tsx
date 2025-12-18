
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Play, Download, Trash2, FileAudio, Speech } from 'lucide-react';
import Button from './ui/Button';
import { generateSpeech, transcribeAudio, decodeBase64Audio, pcmToAudioBuffer, fileToBase64 } from '../services/geminiService';

const AudioStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'tts' | 'transcription'>('tts');
  const [ttsInput, setTtsInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleTTS = async () => {
    if (!ttsInput.trim()) return;
    setLoading(true);
    try {
      const base64 = await generateSpeech(ttsInput);
      if (base64) {
        const ctx = new AudioContext();
        const bytes = decodeBase64Audio(base64);
        const buffer = await pcmToAudioBuffer(bytes, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setLoading(true);
      try {
        // Convert Blob to base64 to match the expected parameter type of transcribeAudio
        const base64 = await fileToBase64(blob);
        const text = await transcribeAudio(base64);
        setTranscription(text || "No speech detected.");
      } catch (err) {
        setTranscription("Error transcribing audio.");
      } finally {
        setLoading(false);
      }
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTool('tts')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${activeTool === 'tts' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
            <Speech className="w-5 h-5" /> Speech Generator
          </button>
          <button onClick={() => setActiveTool('transcription')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${activeTool === 'transcription' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
            <Mic className="w-5 h-5" /> Audio Transcriber
          </button>
        </div>

        {activeTool === 'tts' ? (
          <div className="space-y-4">
            <textarea
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              placeholder="Enter text to convert to lifelike speech..."
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <Button onClick={handleTTS} isLoading={loading} disabled={!ttsInput.trim()} className="w-full">
              <Volume2 className="w-5 h-5" /> Generate & Play Speech
            </Button>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center py-8">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 animate-pulse scale-110' : 'bg-purple-600 hover:bg-purple-500 shadow-lg hover:shadow-purple-500/20'}`}
            >
              {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
            </button>
            <p className="text-slate-400 text-sm">Hold button to record, release to transcribe.</p>
            
            <div className="w-full bg-slate-950 border border-slate-700 rounded-xl p-6 min-h-[150px] relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 rounded-xl">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <span className="text-xs text-purple-400 font-mono">Transcribing...</span>
                </div>
              ) : (
                <p className={`text-sm ${transcription ? 'text-slate-200' : 'text-slate-600 italic'}`}>
                  {transcription || "Your transcription will appear here..."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioStudio;
