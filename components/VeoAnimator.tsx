
import React, { useState, useRef } from 'react';
import { Upload, Clapperboard, Loader2, Download, Video, Play, Film, Image as ImageIcon, Sparkles, X, Grid, FileJson, Package, Camera } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { generateVideoWithVeo, checkAndRequestApiKey } from '../services/geminiService';

const VeoAnimator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Game Dev features
  const [gameMode, setGameMode] = useState(false);
  const [isProcessingSprites, setIsProcessingSprites] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !file) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    setVideoUrl(null);

    const effectivePrompt = gameMode 
      ? `Generate a high-quality 2D game character animation: ${prompt}. Clean lighting, simple background, centered subject, suitable for a 2D sprite sheet.`
      : prompt;

    try {
      const url = await generateVideoWithVeo(effectivePrompt, file || undefined, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSpriteSheet = async () => {
    if (!videoRef.current || !videoUrl) return;
    setIsProcessingSprites(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We'll capture 16 frames in a 4x4 grid
    const cols = 4;
    const rows = 4;
    const totalFrames = cols * rows;
    const frameWidth = 256; // Fixed size for game sprites
    const frameHeight = 256;
    
    canvas.width = frameWidth * cols;
    canvas.height = frameHeight * rows;

    const duration = video.duration;
    const interval = duration / totalFrames;

    for (let i = 0; i < totalFrames; i++) {
      video.currentTime = i * interval;
      // Wait for seek
      await new Promise(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve(true);
        };
        video.addEventListener('seeked', onSeeked);
      });

      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Center-crop logic
      const sWidth = video.videoHeight; // square crop based on height
      const sHeight = video.videoHeight;
      const sx = (video.videoWidth - sWidth) / 2;
      const sy = 0;

      ctx.drawImage(video, sx, sy, sWidth, sHeight, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
    }

    const spriteUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = spriteUrl;
    link.download = "sprite_sheet_pack.png";
    link.click();
    setIsProcessingSprites(false);
  };

  const handleExportMetadata = () => {
    if (!videoUrl) return;
    
    // Detailed Frame Data for Game Engines (e.g. Phaser, Godot, Unity)
    const cols = 4;
    const rows = 4;
    const frameWidth = 256;
    const frameHeight = 256;
    
    const frames = [];
    for(let i = 0; i < 16; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        frames.push({
            filename: `frame_${i}`,
            frame: { x: col * frameWidth, y: row * frameHeight, w: frameWidth, h: frameHeight },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
            sourceSize: { w: frameWidth, h: frameHeight }
        });
    }

    const metadata = {
      frames: frames,
      meta: {
          app: "Gemini Creative Studio",
          version: "1.0",
          image: "sprite_sheet_pack.png",
          format: "RGBA8888",
          size: { w: frameWidth * cols, h: frameHeight * rows },
          scale: "1",
          source_prompt: prompt,
          animation_type: gameMode ? "sprite_sheet" : "cinematic"
      }
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "spritesheet_atlas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-indigo-400">
                <Film className="w-7 h-7" /> Veo Cinematic Engine
            </h2>
            <div className="flex items-center gap-3">
                 <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${gameMode ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={gameMode} 
                      onChange={e => setGameMode(e.target.checked)} 
                    />
                    <Grid className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Game Sprite Mode</span>
                 </label>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Visual Narrative Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={gameMode ? "A 2D side-scrolling pixel dragon breathing fire, idle animation..." : "Cinematic drone shot of an ancient mountain temple at dusk..."}
                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Dimensions</label>
                    <div className="flex gap-4">
                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Landscape (16:9)</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Portrait (9:16)</button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">Seed Frame (Starting Context)</label>
                <div className="aspect-video border-2 border-dashed border-slate-700 rounded-xl relative overflow-hidden bg-slate-900 flex items-center justify-center group cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                    {preview ? <img src={preview} className="w-full h-full object-cover" /> : (
                        <div className="flex flex-col items-center text-slate-500">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                            <span className="text-xs">Optional reference image</span>
                        </div>
                    )}
                    {preview && <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white z-20 hover:bg-red-500 transition-colors"><X className="w-4 h-4"/></button>}
                </div>
                <Button onClick={handleGenerate} isLoading={loading} disabled={!prompt && !file} className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 shadow-lg">
                   {loading ? "Synthesizing Motion..." : `Generate ${gameMode ? 'Game Asset' : 'Video'}`}
                </Button>
            </div>
        </div>
        <ErrorDisplay error={error} className="mt-4" />
      </div>

      {(videoUrl || loading) && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center relative">
              {loading ? (
                  <div className="flex flex-col items-center gap-4 text-indigo-400">
                      <div className="relative">
                          <Loader2 className="w-16 h-16 animate-spin opacity-20" />
                          <Clapperboard className="w-8 h-8 absolute inset-0 m-auto animate-pulse text-indigo-300" />
                      </div>
                      <div className="text-center">
                          <p className="font-bold text-lg">Veo Rendering Engine Active</p>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 italic">
                             Calculating temporal coherence and fluid dynamics. Large renders may take several minutes.
                          </p>
                      </div>
                  </div>
              ) : videoUrl && (
                  <div className="w-full flex flex-col items-center gap-6">
                      <div className="relative group max-w-4xl w-full">
                          <video 
                            ref={videoRef}
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            crossOrigin="anonymous"
                            className="max-h-[600px] w-full rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700" 
                          />
                          <div className="absolute top-4 left-4 bg-indigo-600/80 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow-lg">Native Preview</div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                          <a 
                            href={videoUrl} 
                            download="veo_generation.mp4" 
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl hover:scale-105"
                          >
                             <Download className="w-5 h-5" /> Download Video
                          </a>
                          
                          {gameMode && (
                             <>
                                <button 
                                    onClick={handleGenerateSpriteSheet}
                                    disabled={isProcessingSprites}
                                    className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold transition-all border border-slate-600 shadow-xl ${isProcessingSprites ? 'opacity-50' : ''}`}
                                >
                                    {isProcessingSprites ? <Loader2 className="w-5 h-5 animate-spin" /> : <Grid className="w-5 h-5 text-green-400" />} 
                                    {isProcessingSprites ? "Processing Sheet..." : "Generate Sprite Sheet"}
                                </button>
                                <button 
                                    onClick={handleExportMetadata}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold transition-all border border-slate-600 shadow-xl"
                                >
                                    <FileJson className="w-5 h-5 text-indigo-400" /> Export Atlas JSON
                                </button>
                             </>
                          )}
                          {!gameMode && (
                             <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold transition-all border border-slate-600 shadow-xl">
                                <Package className="w-5 h-5 text-amber-400" /> Export Project Zip
                             </button>
                          )}
                      </div>
                      {gameMode && (
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-indigo-400" /> Professional Game Dev Output Enabled
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default VeoAnimator;
