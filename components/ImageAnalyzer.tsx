
import React, { useState } from 'react';
import { Upload, ImageIcon, Sparkles, X, ScanEye, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { analyzeImage, fileToBase64 } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [data, setData] = useState<{ base64: string, mimeType: string, url: string }[]>([]);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const newData: { base64: string, mimeType: string, url: string }[] = [];
      
      for (const file of selectedFiles) {
          try {
              const base64 = await fileToBase64(file);
              newData.push({
                  base64,
                  mimeType: file.type,
                  url: URL.createObjectURL(file)
              });
          } catch (err: any) {
              console.error("Failed to ingest image:", file.name, err);
          }
      }
      
      setData(prev => [...prev, ...newData]);
      setError('');
    }
  };

  const handleClear = () => {
      data.forEach(item => URL.revokeObjectURL(item.url));
      setData([]);
      setResult('');
      setError('');
  };

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const defaultPrompt = data.length > 1 
        ? "Deconstruct these images and analyze structural coherence."
        : "Reconstruct the visual logic of this image.";
        
      const text = await analyzeImage(data, prompt || defaultPrompt);
      setResult(text || "No report generated.");
    } catch (err: any) {
      setError(err.message || "Failed to analyze assets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-fit">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-400">
          <ImageIcon className="w-6 h-6" />
          Image deconstructor
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          Ingest visual data for industrial-grade deconstruction and logic extraction.
        </p>

        <div className="space-y-4">
          <div className={`border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors bg-slate-800/50 min-h-[200px] flex flex-col items-center justify-center relative ${data.length > 0 ? 'border-purple-500/50' : ''}`}>
             <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleFileChange} 
                className="hidden" 
                id="image-upload"
              />
              {data.length > 0 ? (
                  <div className="w-full">
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto w-full p-2">
                          {data.map((item, idx) => (
                              <div key={idx} className="relative aspect-video rounded-md overflow-hidden bg-slate-900 border border-slate-700">
                                  <img src={item.url} alt={`Preview ${idx}`} className="w-full h-full object-contain" />
                              </div>
                          ))}
                      </div>
                      <button 
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full text-slate-300 hover:text-white hover:bg-red-500/80 transition-all z-10"
                      >
                          <X className="w-4 h-4" />
                      </button>
                      <label htmlFor="image-upload" className="block mt-4 text-xs text-purple-400 hover:text-purple-300 cursor-pointer">
                          Add More Assets
                      </label>
                  </div>
              ) : (
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full py-8">
                    <Upload className="w-10 h-10 text-slate-500 mb-2 mx-auto" />
                    <span className="text-slate-300 font-medium block">Ingest Assets</span>
                  </label>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Focus Objective
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe deconstruction target..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <ErrorDisplay error={error} onRetry={handleAnalyze} />

          <Button 
            onClick={handleAnalyze} 
            disabled={data.length === 0} 
            isLoading={loading}
            className="w-full bg-purple-600 hover:bg-purple-500"
          >
            {loading ? 'Processing...' : 'Start Industrial Analysis'}
          </Button>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl min-h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Extracted Logic
        </h3>
        <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto max-h-[600px] border border-slate-700/50 relative">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/90 z-10">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                    <span className="text-slate-200 font-medium">Deconstructing Visual Fabric...</span>
                </div>
            ) : result ? (
                <div className="prose prose-invert max-none text-slate-300 leading-relaxed animate-fade-in whitespace-pre-wrap">
                    {result}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic text-sm">
                    Reconstruction reports appear here.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
