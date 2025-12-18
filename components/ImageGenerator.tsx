
import React, { useState } from 'react';
import { Image, Layers, Lock, Sparkles, Upload, X, Plus, Scaling, Maximize, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { generateImage, checkAndRequestApiKey } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [size, setSize] = useState<ImageSize>(ImageSize.K1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      setReferenceImages(prev => [...prev, ...newFiles]);
      setReferencePreviews(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    setReferencePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    const hasKey = await checkAndRequestApiKey();
    if (!hasKey) return;

    setLoading(true);
    setError('');
    setGeneratedImages([]); 
    
    try {
      const images = await generateImage(prompt, aspectRatio, size, referenceImages);
      setGeneratedImages(images);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-pink-400">
                <Image className="w-7 h-7" />
                Pro Image Engine
                </h2>
                <p className="text-slate-400 mt-1">Generate 1K, 2K, or 4K assets with custom ratios using Gemini 3 Pro Image.</p>
            </div>
            <div className="bg-amber-900/30 text-amber-200 px-3 py-1 rounded-full text-xs border border-amber-800">Paid Key Required</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your vision..."
                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                />
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-950/50">
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Reference Assets</label>
                    <div className="grid grid-cols-4 gap-2">
                        {referencePreviews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded border border-slate-700 overflow-hidden">
                                <img src={src} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(i)} className="absolute top-0 right-0 p-1 bg-black/60 text-white"><X className="w-3 h-3"/></button>
                            </div>
                        ))}
                        <label className="aspect-square border border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700"><Plus className="w-5 h-5 text-slate-500"/><input type="file" multiple hidden onChange={handleFileChange} /></label>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Maximize className="w-3 h-3"/> Aspect Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.values(AspectRatio).map((ratio) => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-2 py-2 rounded text-xs font-medium border transition-all ${aspectRatio === ratio ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>{ratio}</button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Scaling className="w-3 h-3"/> Image Quality / Size</label>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.values(ImageSize).map((s) => (
                            <button key={s} onClick={() => setSize(s)} className={`px-4 py-3 rounded-lg text-sm font-bold border flex flex-col items-center gap-1 transition-all ${size === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                <span>{s}</span>
                                <span className="text-[10px] opacity-60 font-normal">{s === '1K' ? 'Standard' : s === '2K' ? 'High Def' : 'Ultra HD'}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={handleGenerate} isLoading={loading} disabled={!prompt} className="w-full bg-pink-600 hover:bg-pink-500 h-14 text-lg">Generate Pro Asset</Button>
            </div>
        </div>

        <ErrorDisplay error={error} className="mt-4" />
      </div>

      {(generatedImages.length > 0 || loading) && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl animate-fade-in">
           <div className="flex justify-center bg-slate-950 rounded-lg p-8 border border-slate-700 min-h-[500px] relative">
             {loading ? <div className="flex flex-col items-center justify-center gap-4 text-pink-400"><Loader2 className="w-12 h-12 animate-spin"/><span className="animate-pulse">Synthesizing {size} Image...</span></div> : generatedImages.map((src, idx) => <img key={idx} src={src} className="max-h-[700px] rounded shadow-2xl object-contain" />)}
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
