
import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, Wand2, X, Sparkles, Sliders, RefreshCcw, Save, FolderOpen, Trash2, Settings, Download, Loader2, AlertCircle, Crop, Eye, EyeOff, Scaling } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { editImage, upscaleImage, checkAndRequestApiKey, fileToBase64 } from '../services/geminiService';
import ImageCropper from './ui/ImageCropper';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
}

interface Preset {
  id: string;
  name: string;
  filters: FilterSettings;
  prompt: string;
}

interface EditResult {
  status: 'pending' | 'processing' | 'success' | 'error';
  imageUrl?: string;
  error?: string;
  visible?: boolean;
  isUpscaled?: boolean;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

const ImageEditor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  
  // Replaced simple string array with structured result state
  const [editResults, setEditResults] = useState<EditResult[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Image Adjustment State
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Cropping State
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<string>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [showExportSettings, setShowExportSettings] = useState(false);

  // Presets State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini-editor-presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles(selectedFiles);
      
      // Cleanup old
      previews.forEach(url => URL.revokeObjectURL(url));

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      
      setError('');
      setEditResults([]);
    }
  };

  const handleClear = () => {
    setFiles([]);
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
    setEditResults([]);
    setFilters(DEFAULT_FILTERS);
  };

  const handleFilterChange = (key: keyof FilterSettings, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      filters: { ...filters },
      prompt
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('gemini-editor-presets', JSON.stringify(updated));
    setPresetName('');
  };

  const loadPreset = (preset: Preset) => {
    setFilters(preset.filters);
    setPrompt(preset.prompt);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('gemini-editor-presets', JSON.stringify(updated));
  };

  const handleExportPresets = () => {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-presets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        
        if (Array.isArray(imported)) {
           // Basic check and regenerate IDs to avoid collision
           const processed = imported
                .filter((p: any) => p.name && p.filters)
                .map((p: any) => ({
                   ...p,
                   id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }));
           
           if (processed.length > 0) {
               const updated = [...presets, ...processed];
               setPresets(updated);
               localStorage.setItem('gemini-editor-presets', JSON.stringify(updated));
               setError('');
           } else {
               setError("No valid presets found in the imported file.");
           }
        } else {
             setError("Invalid presets file format.");
        }
      } catch (err) {
        setError("Failed to import presets.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const applyFiltersToFiles = async (originalFiles: File[], currentFilters: FilterSettings): Promise<File[]> => {
      // If no changes, return originals
      if (currentFilters.brightness === 100 && currentFilters.contrast === 100 && currentFilters.saturation === 100) {
          return originalFiles;
      }

      const processFile = async (file: File): Promise<File> => {
          return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                      reject(new Error("Could not get canvas context"));
                      return;
                  }
                  
                  // Apply filters using Context 2D filter property
                  ctx.filter = `brightness(${currentFilters.brightness}%) contrast(${currentFilters.contrast}%) saturate(${currentFilters.saturation}%)`;
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  
                  canvas.toBlob((blob) => {
                      if (!blob) {
                          reject(new Error("Failed to process image filters"));
                          return;
                      }
                      // Create a new file with the processed data
                      const processedFile = new File([blob], file.name, { type: file.type || 'image/png', lastModified: Date.now() });
                      resolve(processedFile);
                  }, file.type || 'image/png');
              };
              img.onerror = () => reject(new Error("Failed to load image for processing"));
              img.src = URL.createObjectURL(file);
          });
      };

      return Promise.all(originalFiles.map(processFile));
  };

  const handleEdit = async () => {
    if (files.length === 0 || !prompt) return;
    setLoading(true);
    setError('');
    
    // Initialize results with processing state
    setEditResults(files.map(() => ({ status: 'processing', visible: true })));
    
    try {
      // Step 1: Apply client-side filters
      const processedFiles = await applyFiltersToFiles(files, filters);

      // Step 2: Process all images in parallel but update state individually
      await Promise.all(processedFiles.map(async (file, idx) => {
          try {
              // Convert processed file to base64 and pass required parameters to the service
              const base64 = await fileToBase64(file);
              const images = await editImage(base64, file.type, prompt);
              if (images && images.length > 0) {
                  setEditResults(prev => {
                      const next = [...prev];
                      next[idx] = { status: 'success', imageUrl: images[0], visible: true };
                      return next;
                  });
              } else {
                  throw new Error("No image returned");
              }
          } catch (err: any) {
              setEditResults(prev => {
                  const next = [...prev];
                  next[idx] = { status: 'error', error: err.message || "Failed to edit", visible: true };
                  return next;
              });
          }
      }));

    } catch (err: any) {
      setError(err.message || "Failed to initiate editing.");
      // Mark all pending as error if initialization failed
      setEditResults(prev => prev.map(r => r.status === 'processing' ? { ...r, status: 'error', error: "Process failed" } : r));
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale = async (index: number, scale: '2K' | '4K') => {
      const result = editResults[index];
      if (!result.imageUrl) return;

      const hasKey = await checkAndRequestApiKey();
      if (!hasKey) {
          setError("API key selection required for upscaling.");
          return;
      }

      setEditResults(prev => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'processing' };
          return next;
      });

      try {
          // Fetch the blob from current result URL
          const res = await fetch(result.imageUrl);
          const blob = await res.blob();
          
          // Convert Blob to base64 and provide required parameters to upscale service
          const base64 = await fileToBase64(blob);
          const upscaledImages = await upscaleImage(base64, blob.type, scale);
          if (upscaledImages && upscaledImages.length > 0) {
               setEditResults(prev => {
                  const next = [...prev];
                  next[index] = { status: 'success', imageUrl: upscaledImages[0], visible: true, isUpscaled: true };
                  return next;
              });
          }
      } catch (err: any) {
           setEditResults(prev => {
                  const next = [...prev];
                  // Restore previous state if failed, or show error but keep image if possible?
                  // Better to error out specifically
                  next[index] = { status: 'error', error: "Upscale failed: " + err.message, imageUrl: result.imageUrl, visible: true };
                  return next;
              });
      }
  };

  const handleDownload = (base64Str: string, index: number) => {
    const ext = exportFormat.split('/')[1];
    const filename = `edited_image_${index + 1}.${ext}`;

    // If format is PNG and we are just downloading what came back (assuming it's PNG), skip canvas
    if (exportFormat === 'image/png') {
        const link = document.createElement('a');
        link.href = base64Str;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
    }

    // Convert format via canvas
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If JPEG, fill white background to handle transparency
        if (exportFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        
        const convertedData = canvas.toDataURL(exportFormat, exportQuality);
        const link = document.createElement('a');
        link.href = convertedData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = base64Str;
  };

  const handleDownloadAll = () => {
      const successfulResults = editResults
        .map((res, idx) => ({ ...res, originalIndex: idx }))
        .filter(res => res.status === 'success' && res.imageUrl && res.visible !== false);

      if (successfulResults.length === 0) return;
      
      successfulResults.forEach((res, i) => {
          if (!res.imageUrl) return;
          // Stagger downloads slightly to prevent browser blocking
          setTimeout(() => {
              handleDownload(res.imageUrl!, res.originalIndex);
          }, i * 500);
      });
  };

  // Handle saving the crop result
  const handleCropSave = (croppedBlob: Blob) => {
    if (cropTargetIndex === null) return;
    
    // Create new file from blob
    const originalFile = files[cropTargetIndex];
    const newFile = new File([croppedBlob], originalFile.name, { 
        type: originalFile.type,
        lastModified: Date.now()
    });

    // Update files array
    const newFiles = [...files];
    newFiles[cropTargetIndex] = newFile;
    setFiles(newFiles);

    // Update previews
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[cropTargetIndex]); // clean up old url
    newPreviews[cropTargetIndex] = URL.createObjectURL(newFile);
    setPreviews(newPreviews);

    // Close cropper
    setCropTargetIndex(null);
  };

  const toggleVisibility = (index: number) => {
      setEditResults(prev => {
          const next = [...prev];
          next[index] = { ...next[index], visible: !next[index].visible };
          return next;
      });
  };

  // Helper for CSS filter string for previews
  const cssFilter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
  
  const hasResults = editResults.length > 0;
  const successCount = editResults.filter(r => r.status === 'success').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
          <Wand2 className="w-6 h-6" />
          Nano Banana Editor
        </h2>
        <p className="text-slate-400 mb-6">
          Use text prompts to edit multiple images with Gemini 2.5 Flash Image. You can also adjust image parameters before editing.
        </p>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Input Side */}
            <div className="flex-1 w-full space-y-4">
                <div className={`relative rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden transition-all min-h-[300px] ${files.length === 0 ? 'hover:border-yellow-500' : ''}`}>
                    {files.length > 0 ? (
                        <div className="w-full h-full p-2 relative">
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto w-full">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-700 relative group/thumb">
                                        <img 
                                          src={src} 
                                          alt={`Original ${idx}`} 
                                          className="w-full h-full object-cover"
                                          style={{ filter: cssFilter, willChange: 'filter' }} 
                                        />
                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCropTargetIndex(idx); }}
                                                className="bg-slate-800 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                                title="Crop"
                                            >
                                                <Crop className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Status overlay on input if processing */}
                                        {loading && editResults[idx]?.status === 'processing' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                                            </div>
                                        )}
                                        {editResults[idx]?.status === 'success' && (
                                            <div className="absolute top-1 right-1 bg-green-500/80 p-1 rounded-full z-10">
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                             </div>
                             <button 
                                onClick={handleClear}
                                className="absolute top-4 right-4 bg-slate-900/90 text-white p-1 rounded-full hover:bg-red-500 transition-colors shadow-lg z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                onChange={handleFileChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="text-center p-4">
                                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                <span className="text-slate-300 font-medium block">Upload Images</span>
                                <span className="text-xs text-slate-500">Supports batch processing</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Adjustments Panel */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setShowAdjustments(!showAdjustments)}
                        className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <span className="flex items-center gap-2"><Sliders className="w-4 h-4" /> Adjust Parameters</span>
                        <span className="text-xs text-slate-500">{showAdjustments ? 'Hide' : 'Show'}</span>
                    </button>
                    
                    {showAdjustments && (
                        <div className="p-4 space-y-4 border-t border-slate-700 animate-fade-in">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Brightness</span>
                                    <span>{filters.brightness}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="200" value={filters.brightness}
                                    onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Contrast</span>
                                    <span>{filters.contrast}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="200" value={filters.contrast}
                                    onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Saturation</span>
                                    <span>{filters.saturation}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="200" value={filters.saturation}
                                    onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button 
                                    onClick={resetFilters}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <RefreshCcw className="w-3 h-3" /> Reset Defaults
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Presets Panel */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setShowPresets(!showPresets)}
                        className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <span className="flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Presets</span>
                        <span className="text-xs text-slate-500">{showPresets ? 'Hide' : 'Show'}</span>
                    </button>
                    
                    {showPresets && (
                        <div className="p-4 border-t border-slate-700 space-y-3 animate-fade-in">
                             <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {presets.length === 0 && <p className="text-xs text-slate-500 italic">No saved presets</p>}
                                {presets.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-800 p-2 rounded text-sm group">
                                        <span className="truncate text-slate-300 flex-1 font-medium">{p.name}</span>
                                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => loadPreset(p)} className="p-1 hover:text-green-400 hover:bg-slate-700 rounded" title="Load"><Upload className="w-3 h-3 rotate-90"/></button>
                                            <button onClick={() => deletePreset(p.id)} className="p-1 hover:text-red-400 hover:bg-slate-700 rounded" title="Delete"><Trash2 className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             
                             <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
                                <input 
                                    value={presetName} 
                                    onChange={e => setPresetName(e.target.value)} 
                                    placeholder="Preset Name..." 
                                    className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs flex-1 outline-none text-slate-200 focus:border-yellow-500/50" 
                                />
                                <button 
                                    onClick={savePreset} 
                                    disabled={!presetName} 
                                    className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs disabled:opacity-50 text-slate-200 flex items-center gap-1 transition-colors"
                                >
                                    <Save className="w-3 h-3" /> Save
                                </button>
                             </div>

                             <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-800">
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Import JSON</span>
                                        <input type="file" accept=".json" onChange={handleImportPresets} className="hidden" />
                                    </label>
                                    <button 
                                        onClick={handleExportPresets}
                                        disabled={presets.length === 0}
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Export JSON</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                     <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Instruction: e.g. Add fireworks in the sky"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                    />
                </div>
                
                <ErrorDisplay error={error} onRetry={handleEdit} />

                <Button 
                    onClick={handleEdit} 
                    disabled={files.length === 0 || !prompt} 
                    isLoading={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-yellow-500"
                >
                    {loading ? `Editing ${files.length} images...` : 'Apply Edit'}
                </Button>
            </div>

            {/* Arrow */}
            <div className="hidden xl:flex items-center justify-center h-[300px]">
                <ArrowRight className={`w-8 h-8 ${loading ? 'text-yellow-500 animate-pulse' : 'text-slate-600'}`} />
            </div>

            {/* Output Side */}
            <div className="flex-1 w-full flex flex-col gap-3">
                 {/* Export Settings Header */}
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">Output</h3>
                    <div className="flex gap-2">
                        {successCount > 1 && (
                            <button 
                                onClick={handleDownloadAll}
                                className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                            >
                                <Download className="w-3 h-3"/> Download All
                            </button>
                        )}
                        <button 
                            onClick={() => setShowExportSettings(!showExportSettings)} 
                            className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${showExportSettings ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Settings className="w-3 h-3"/> Export Options
                        </button>
                    </div>
                </div>

                {showExportSettings && (
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 animate-fade-in grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400">Format</label>
                            <select 
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-yellow-500/50"
                            >
                                <option value="image/png">PNG (Lossless)</option>
                                <option value="image/jpeg">JPEG (Compressed)</option>
                                <option value="image/webp">WebP (Modern)</option>
                            </select>
                        </div>
                        {exportFormat !== 'image/png' && (
                             <div className="space-y-1">
                                <label className="text-xs text-slate-400 flex justify-between">
                                    <span>Quality</span>
                                    <span>{Math.round(exportQuality * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0.1" max="1.0" step="0.05"
                                    value={exportQuality}
                                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="min-h-[300px] rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden relative p-2">
                    {!hasResults ? (
                        <div className="text-slate-600 text-sm italic flex flex-col items-center">
                            <Wand2 className="w-8 h-8 mb-2 opacity-30" />
                            <span>Edited images appear here</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-h-[400px] overflow-y-auto">
                            {editResults.map((result, idx) => (
                                <div key={idx} className={`aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-700 animate-fade-in group relative flex items-center justify-center transition-opacity ${result.visible === false ? 'opacity-30' : 'opacity-100'}`}>
                                    {result.status === 'processing' && (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-2" />
                                            <span className="text-[10px] text-yellow-500">Processing...</span>
                                        </div>
                                    )}
                                    {result.status === 'error' && (
                                        <div className="flex flex-col items-center text-red-400 p-2 text-center">
                                            <AlertCircle className="w-8 h-8 mb-1" />
                                            <span className="text-[10px]">{result.error || "Failed"}</span>
                                        </div>
                                    )}
                                    {result.status === 'success' && result.imageUrl && (
                                        <>
                                            <img src={result.imageUrl} alt={`Edited ${idx}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleDownload(result.imageUrl!, idx)}
                                                    className="bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-full transform scale-90 hover:scale-100 transition-all shadow-lg flex items-center gap-1 px-3"
                                                >
                                                    <Download className="w-4 h-4" /> <span className="text-xs">Save</span>
                                                </button>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleUpscale(idx, '2K')}
                                                        className="bg-slate-700 hover:bg-purple-600 text-white p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-600"
                                                        title="Upscale to 2K"
                                                    >
                                                        <Scaling className="w-3 h-3" /> 2K
                                                    </button>
                                                     <button 
                                                        onClick={() => handleUpscale(idx, '4K')}
                                                        className="bg-slate-700 hover:bg-purple-600 text-white p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-600"
                                                        title="Upscale to 4K"
                                                    >
                                                        <Scaling className="w-3 h-3" /> 4K
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Visibility Toggle */}
                                            <div className="absolute top-1 right-1">
                                                 <button 
                                                    onClick={() => toggleVisibility(idx)}
                                                    className="p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                                    title={result.visible !== false ? "Hide Layer" : "Show Layer"}
                                                 >
                                                     {result.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                 </button>
                                            </div>

                                            {/* Badges */}
                                            <div className="absolute bottom-1 right-1 flex flex-col items-end gap-1">
                                                 <div className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {exportFormat.split('/')[1].toUpperCase()}
                                                 </div>
                                                 {result.isUpscaled && (
                                                     <div className="bg-purple-500/80 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                                                        HD+
                                                     </div>
                                                 )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Cropper Modal */}
        {cropTargetIndex !== null && previews[cropTargetIndex] && (
            <ImageCropper 
                imageSrc={previews[cropTargetIndex]}
                onConfirm={handleCropSave}
                onCancel={() => setCropTargetIndex(null)}
            />
        )}

      </div>
    </div>
  );
};

export default ImageEditor;
