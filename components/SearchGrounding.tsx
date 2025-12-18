
import React, { useState } from 'react';
import { Search, Globe, ExternalLink, MapPin, Loader2, Navigation, Sparkles } from 'lucide-react';
import Button from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import { searchWithGrounding, searchWithMaps } from '../services/geminiService';
import { GroundingChunk } from '../types';

const SearchGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [result, setResult] = useState<{ text: string; chunks?: GroundingChunk[] | any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      let data;
      if (mode === 'maps') {
        let location = undefined;
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn("Location permission denied, proceeding without lat/lng.");
        }
        data = await searchWithMaps(query, location);
      } else {
        data = await searchWithGrounding(query);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-500"></div>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
            {mode === 'search' ? <Globe className="w-8 h-8 text-green-400" /> : <MapPin className="w-8 h-8 text-emerald-400" />}
            Knowledge Grounding
            </h2>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setMode('search')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'search' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Global Search
                </button>
                <button 
                  onClick={() => setMode('maps')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'maps' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Places & Maps
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mode === 'search' ? 'text-green-500' : 'text-emerald-500'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'search' ? "Search real-time events, news, or facts..." : "Find nearby restaurants, landmarks, or addresses..."}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-100 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!query || loading} 
            isLoading={loading}
            className={`h-14 rounded-2xl font-bold text-lg shadow-xl ${mode === 'search' ? 'bg-green-600 hover:bg-green-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            {loading ? 'Synthesizing Data...' : `Query ${mode === 'search' ? 'Search' : 'Maps'} Index`}
          </Button>
        </div>
        
        <ErrorDisplay error={error} className="mt-4" />
      </div>

      {(result || loading) && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl animate-fade-in space-y-8 min-h-[300px] relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-48 gap-4">
                <Loader2 className={`w-12 h-12 animate-spin ${mode === 'search' ? 'text-green-400' : 'text-emerald-400'}`} />
                <p className="text-slate-500 font-mono text-sm animate-pulse tracking-widest uppercase">Consulting Google Knowledge Graph...</p>
             </div>
          ) : result && (
             <>
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-green-500/50 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" /> Grounded Intelligence
                    </h3>
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {result.text}
                    </div>
                </div>
                
                {result.chunks && result.chunks.length > 0 && (
                    <div className="border-t border-slate-800 pt-6">
                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Evidence & Sources</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.chunks.map((chunk: any, idx: number) => {
                                const isWeb = !!chunk.web;
                                const isMaps = !!chunk.maps;
                                if (!isWeb && !isMaps) return null;
                                
                                const data = chunk.web || chunk.maps;
                                return (
                                    <a 
                                        key={idx}
                                        href={data.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-green-500/50 hover:bg-green-500/5 transition-all group shadow-lg"
                                    >
                                        <div className="bg-slate-900 p-2.5 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                                            {isWeb ? <ExternalLink className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-100 truncate group-hover:text-green-300 transition-colors">
                                                {data.title}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-1">
                                                {data.uri}
                                            </p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
             </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchGrounding;
