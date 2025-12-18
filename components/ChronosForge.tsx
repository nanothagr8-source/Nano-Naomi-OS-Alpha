
import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, Sparkles, Play, Pause, Download, Trash2, Clock, 
  Layers, Music, Image as ImageIcon, Video, Wand2, Plus, 
  ChevronRight, ChevronLeft, Target, Rocket, Loader2, Save, X
} from 'lucide-react';
import Button from './ui/Button';
import { forgeNarrativeTimeline, checkAndRequestApiKey, generateImage, generateVideoWithVeo, generateSpeech, decodeBase64Audio, pcmToAudioBuffer } from '../services/geminiService';
import { ChronosForgeStory, AspectRatio, ImageSize } from '../types';

const ChronosForge: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState<ChronosForgeStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isSynthesizingScene, setIsSynthesizingScene] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleForge = async () => {
    if (!prompt.trim()) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    try {
      const narrative = await forgeNarrativeTimeline(prompt);
      setStory(narrative);
      setActiveSceneIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const synthesizeScene = async (index: number) => {
    if (!story) return;
    setIsSynthesizingScene(true);
    const scene = story.scenes[index];
    
    try {
      // 1. Generate Visual (Image)
      const images = await generateImage(scene.visualPrompt, AspectRatio.LANDSCAPE_16_9, ImageSize.K1);
      
      // 2. Generate Audio (Narration)
      const base64Audio = await generateSpeech(scene.audioPrompt);
      
      setStory(prev => {
        if (!prev) return null;
        const newScenes = [...prev.scenes];
        newScenes[index] = {
          ...newScenes[index],
          status: 'ready',
          assetUrl: images[0],
          audioUrl: base64Audio
        };
        return { ...prev, scenes: newScenes };
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizingScene(false);
    }
  };

  const playSceneAudio = async (base64: string) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const bytes = decodeBase64Audio(base64);
    const buffer = await pcmToAudioBuffer(bytes, audioCtxRef.current);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.start();
  };

  const currentScene = story?.scenes[activeSceneIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
              <Film className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Chronos Forge</h2>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Cinematic Narrative Orchestrator</p>
            </div>
          </div>
          <div className="flex-1 max-w-xl w-full relative">
            <input 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter a world concept or story arc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
            />
          </div>
          <Button onClick={handleForge} isLoading={loading} className="h-14 bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-8 shadow-xl">
             <Rocket className="w-5 h-5 mr-2" /> Forge Timeline
          </Button>
        </div>

        {story ? (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar no-scrollbar">
               {story.scenes.map((scene, i) => (
                  <button 
                    key={scene.id}
                    onClick={() => setActiveSceneIndex(i)}
                    className={`flex-shrink-0 w-48 aspect-video rounded-xl border-2 transition-all relative overflow-hidden group ${activeSceneIndex === i ? 'border-indigo-500 scale-105 shadow-2xl' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                     {scene.assetUrl ? <img src={scene.assetUrl} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-700">
                           <ImageIcon className="w-6 h-6 mb-1 opacity-20" />
                           <span className="text-[8px] font-black uppercase">Scene {i+1}</span>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[8px] font-black text-white uppercase">Focus Scene</span>
                     </div>
                     {scene.status === 'ready' && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>}
                  </button>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group">
                     {currentScene?.assetUrl ? (
                        <>
                           <img src={currentScene.assetUrl} className="w-full h-full object-cover" />
                           <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent">
                              <p className="text-xl font-bold text-white italic drop-shadow-lg">"{currentScene.audioPrompt}"</p>
                           </div>
                        </>
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                           {isSynthesizingScene ? <Loader2 className="w-12 h-12 animate-spin text-indigo-500" /> : <Layers className="w-16 h-16 opacity-10" />}
                           <p className="text-xs font-black uppercase tracking-widest">{isSynthesizingScene ? 'Synthesizing Multimodal State...' : 'Awaiting Manifestation'}</p>
                        </div>
                     )}
                     <div className="absolute top-6 left-6 px-3 py-1 bg-indigo-600/80 rounded text-[10px] font-black text-white uppercase tracking-widest">
                        Frame {activeSceneIndex + 1}
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <Button 
                        onClick={() => synthesizeScene(activeSceneIndex)}
                        disabled={isSynthesizingScene || currentScene?.status === 'ready'}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl"
                     >
                        <Wand2 className="w-5 h-5 mr-2" /> {isSynthesizingScene ? "Orchestrating..." : "Generate Scene Assets"}
                     </Button>
                     {currentScene?.audioUrl && (
                        <button 
                           onClick={() => playSceneAudio(currentScene.audioUrl!)}
                           className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center border border-slate-700 transition-all"
                        >
                           <Music className="w-6 h-6 text-indigo-400" />
                        </button>
                     )}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl h-full flex flex-col">
                     <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Narrative Blueprint</h3>
                     </div>
                     <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        <div>
                           <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Visual Objective</label>
                           <p className="text-sm text-slate-300 leading-relaxed font-medium">"{currentScene?.visualPrompt}"</p>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Audio Narrative</label>
                           <p className="text-sm text-slate-300 leading-relaxed italic">"{currentScene?.audioPrompt}"</p>
                        </div>
                        <div className="pt-6 border-t border-slate-900">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Atmosphere</h4>
                           <p className="text-[10px] text-indigo-400 font-bold uppercase">{story.overallAtmosphere}</p>
                        </div>
                     </div>
                     <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between">
                        <button 
                           onClick={() => setActiveSceneIndex(prev => Math.max(0, prev - 1))}
                           className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"
                        >
                           <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                           onClick={() => setActiveSceneIndex(prev => Math.min(story.scenes.length - 1, prev + 1))}
                           className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"
                        >
                           <ChevronRight className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-slate-700 opacity-20 border-4 border-dashed border-slate-800 rounded-3xl bg-slate-950/30">
            <Rocket className="w-24 h-24 mb-6 animate-pulse" />
            <div className="text-center max-w-sm">
              <p className="text-xl font-black uppercase tracking-widest italic">Forge Idle</p>
              <p className="text-xs mt-2 font-bold">Input a story prompt to begin autonomous cinematic orchestration.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChronosForge;
