
import React, { useState, useMemo } from 'react';
import { 
  Library, Search, Grid, List, Filter, Download, Trash2, 
  ExternalLink, Sparkles, Image as ImageIcon, Video, Code, Music, 
  Tag, Clock, MoreVertical, LayoutGrid, Layers, Settings2, X, Save,
  MessageSquare, Hash
} from 'lucide-react';
import Button from './ui/Button';

// Local storage key for asset persistence
const ASSET_STORAGE_KEY = 'gemini_studio_assets_v1';

const AssetNexus: React.FC = () => {
  const [assets, setAssets] = useState<any[]>(() => {
    const saved = localStorage.getItem(ASSET_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'code' | 'audio'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Metadata Editing State
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editTags, setEditTags] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const promptLower = (asset.prompt || '').toLowerCase();
      const tagsLower = (asset.tags || []).join(' ').toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = promptLower.includes(searchLower) || tagsLower.includes(searchLower);
      const matchesType = activeFilter === 'all' || asset.type === activeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [assets, searchQuery, activeFilter]);

  const deleteAsset = (id: string) => {
    if (!confirm("Are you sure you want to purge this artifact from the Nexus?")) return;
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(updated));
  };

  const startEditing = (asset: any) => {
    setEditingAsset(asset);
    setEditPrompt(asset.prompt || '');
    setEditTags((asset.tags || []).join(', '));
  };

  const saveMetadata = () => {
    if (!editingAsset) return;

    const updatedTags = editTags.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updatedAssets = assets.map(a => 
      a.id === editingAsset.id 
        ? { ...a, prompt: editPrompt, tags: updatedTags } 
        : a
    );

    setAssets(updatedAssets);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(updatedAssets));
    setEditingAsset(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-pink-400" />;
      case 'video': return <Video className="w-5 h-5 text-indigo-400" />;
      case 'code': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner">
              <Library className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">The Asset Nexus</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Universal Multimodal Repository</p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search via concept, tag, or logic..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'image', 'video', 'code', 'audio'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeFilter === filter ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredAssets.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-700 opacity-20 border-4 border-dashed border-slate-800 rounded-3xl bg-slate-950/30">
            <Layers className="w-24 h-24 mb-6" />
            <p className="text-xl font-black uppercase tracking-widest italic">Nexus Empty</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="group relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all">
                <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  {asset.thumbnail || asset.type === 'image' ? (
                    <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={asset.prompt} />
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      {getIcon(asset.type)}
                      <span className="text-[10px] font-black uppercase">{asset.type}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-black text-white uppercase border border-white/10">
                    {asset.type}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                     <button 
                       onClick={() => startEditing(asset)}
                       className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-indigo-600 transition-colors"
                       title="Edit Metadata"
                     >
                        <Settings2 className="w-3 h-3" />
                     </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-300 line-clamp-2 italic font-medium min-h-[2.5rem]">"{asset.prompt || 'No description provided'}"</p>
                  <div className="flex flex-wrap gap-1.5 min-h-[1.25rem]">
                    {asset.tags && asset.tags.length > 0 ? asset.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase">
                        {tag}
                      </span>
                    )) : (
                      <span className="text-[8px] text-slate-700 font-bold uppercase italic">Untagged artifact</span>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[8px] text-slate-600 font-bold uppercase">
                      <Clock className="w-3 h-3" /> {new Date(asset.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => deleteAsset(asset.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <a href={asset.url} download className="p-2 text-slate-500 hover:text-white transition-colors"><Download className="w-4 h-4" /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
             {filteredAssets.map(asset => (
               <div key={asset.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-6 group hover:border-indigo-500/30 transition-all">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800 flex items-center justify-center">
                    {asset.thumbnail || asset.type === 'image' ? (
                      <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover" alt="" />
                    ) : getIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{asset.prompt || 'Untitled Artifact'}</p>
                    <div className="flex gap-4 mt-1 items-center">
                       <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1">{getIcon(asset.type)} {asset.type}</span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(asset.timestamp).toLocaleDateString()}</span>
                       {asset.tags && asset.tags.length > 0 && (
                          <span className="text-[10px] text-indigo-400 font-bold uppercase flex items-center gap-1"><Tag className="w-3 h-3" /> {asset.tags.length} Tags</span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditing(asset)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-indigo-400 transition-all"><Settings2 className="w-5 h-5" /></button>
                    <button onClick={() => deleteAsset(asset.id)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
                    <a href={asset.url} download className="p-3 bg-indigo-600 border border-indigo-400 rounded-xl text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"><Download className="w-5 h-5" /></a>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Metadata Editing Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
             
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Settings2 className="w-5 h-5 text-indigo-400" />
                   </div>
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Edit Artifact Metadata</h3>
                </div>
                <button onClick={() => setEditingAsset(null)} className="text-slate-500 hover:text-white transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>

             <div className="p-8 space-y-6">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                       {editingAsset.thumbnail || editingAsset.type === 'image' ? (
                          <img src={editingAsset.thumbnail || editingAsset.url} className="w-full h-full object-cover" />
                       ) : getIcon(editingAsset.type)}
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Creation Signature</p>
                       <p className="text-xs text-slate-300 font-mono">ID: {editingAsset.id}</p>
                       <p className="text-xs text-slate-300 mt-1 uppercase font-bold text-indigo-400">{editingAsset.type} Module</p>
                    </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <MessageSquare className="w-3 h-3" /> Description / Prompt
                      </label>
                      <textarea 
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                        placeholder="Define the core logic or description..."
                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Hash className="w-3 h-3" /> Logical Tags
                      </label>
                      <input 
                        value={editTags}
                        onChange={e => setEditTags(e.target.value)}
                        placeholder="e.g. cinematic, abstract, neural, optimized"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                      />
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-2">Separate modules with commas</p>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-4">
                <Button 
                   onClick={() => setEditingAsset(null)}
                   variant="secondary"
                   className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                   Cancel
                </Button>
                <Button 
                   onClick={saveMetadata}
                   className="flex-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20"
                >
                   <Save className="w-4 h-4 mr-2" /> Sync to Nexus
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetNexus;
