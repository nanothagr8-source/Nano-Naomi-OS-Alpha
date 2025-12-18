
import React, { useState, useMemo } from 'react';
import { 
  Folder, File, HardDrive, Globe, Search, ArrowLeft, ArrowRight, 
  ArrowUp, RotateCcw, ChevronRight, LayoutGrid, List, MoreVertical,
  Star, Clock, Share2, Download, Trash2, Info, ChevronDown
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  kind: string;
  size: string;
  modified: string;
  location: 'Nexus' | 'Bridge' | 'System';
}

const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['This PC']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('details');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mockFiles: FileItem[] = [
    { id: '1', name: 'UI_Reconstruction_01.svelte', type: 'file', kind: 'Svelte Component', size: '12 KB', modified: '2 hours ago', location: 'Nexus' },
    { id: '2', name: 'System_Logs', type: 'folder', kind: 'Directory', size: '--', modified: '5 mins ago', location: 'Bridge' },
    { id: '3', name: 'Neural_Weights_v4', type: 'folder', kind: 'Weights Folder', size: '--', modified: 'Yesterday', location: 'System' },
    { id: '4', name: 'Project_Alpha_Blueprint.pdf', type: 'file', kind: 'PDF Document', size: '2.4 MB', modified: 'Oct 12, 2023', location: 'Nexus' },
    { id: '5', name: 'Asset_Catalog', type: 'folder', kind: 'Directory', size: '--', modified: '1 week ago', location: 'Bridge' },
    { id: '6', name: 'kernel_dump.bin', type: 'file', kind: 'Binary Data', size: '512 KB', modified: 'Just now', location: 'System' },
  ];

  const sidebarItems = [
    { name: 'Quick access', icon: Star, color: 'text-yellow-500' },
    { name: 'This PC', icon: DesktopIcon, color: 'text-blue-500' },
    { name: 'Nexus Cloud', icon: Globe, color: 'text-cyan-500' },
    { name: 'Bridge Volume', icon: HardDrive, color: 'text-slate-400' },
    { name: 'Recent artifacts', icon: Clock, color: 'text-indigo-400' },
  ];

  const filteredFiles = useMemo(() => {
    return mockFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="h-[700px] flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in font-sans">
      {/* Explorer Ribbon */}
      <div className="h-12 bg-slate-950/50 border-b border-white/5 flex items-center px-4 gap-4 justify-between">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><ArrowUp className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><RotateCcw className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 max-w-xl h-8 bg-slate-900 border border-white/10 rounded px-3 flex items-center gap-2 text-xs text-slate-300">
          {currentPath.map((p, i) => (
             <React.Fragment key={i}>
                <span className="hover:underline cursor-pointer">{p}</span>
                {i < currentPath.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
             </React.Fragment>
          ))}
        </div>

        <div className="w-64 h-8 bg-slate-900 border border-white/10 rounded px-3 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search This PC"
            className="bg-transparent border-none outline-none text-xs text-slate-200 w-full"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/5 bg-slate-950/30 p-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-slate-300 group transition-all">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
          <div className="pt-4 pb-2 px-3">
             <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">
                <span>Volumes</span>
                <ChevronDown className="w-3 h-3" />
             </div>
             <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                   <HardDrive className="w-3.5 h-3.5" /> Local Disk (C:)
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                   <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Neural Drive (Z:)
                </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900/50 relative">
           <div className="h-10 border-b border-white/5 flex items-center px-6 gap-6">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'details' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                 <List className="w-3.5 h-3.5" /> Details
              </button>
              <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'grid' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                 <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {viewMode === 'details' ? (
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                       <tr className="border-b border-white/5">
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date modified</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</th>
                       </tr>
                    </thead>
                    <tbody>
                       {filteredFiles.map((file) => (
                          <tr 
                            key={file.id} 
                            onClick={() => setSelectedId(file.id)}
                            onDoubleClick={() => setCurrentPath(prev => [...prev, file.name])}
                            className={`group border-b border-white/5 hover:bg-blue-600/10 cursor-default transition-colors ${selectedId === file.id ? 'bg-blue-600/20 shadow-inner' : ''}`}
                          >
                             <td className="px-6 py-3 flex items-center gap-3">
                                {file.type === 'folder' ? <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20" /> : <File className="w-5 h-5 text-blue-400" />}
                                <span className="text-xs text-slate-200">{file.name}</span>
                             </td>
                             <td className="px-6 py-3 text-xs text-slate-500">{file.modified}</td>
                             <td className="px-6 py-3 text-xs text-slate-500">{file.kind}</td>
                             <td className="px-6 py-3 text-xs text-slate-500">{file.size}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
                    {filteredFiles.map((file) => (
                       <div 
                         key={file.id} 
                         onClick={() => setSelectedId(file.id)}
                         className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border ${selectedId === file.id ? 'bg-blue-600/20 border-blue-500/50' : 'hover:bg-white/5 border-transparent'}`}
                       >
                          {file.type === 'folder' ? <Folder className="w-12 h-12 text-yellow-500 fill-yellow-500/10" /> : <File className="w-12 h-12 text-blue-400" />}
                          <span className="text-[10px] text-slate-200 text-center line-clamp-2 w-full">{file.name}</span>
                       </div>
                    ))}
                 </div>
              )}
           </div>

           {/* Preview Panel (Mica Style) */}
           {selectedId && (
              <div className="w-64 border-l border-white/10 bg-slate-950/40 backdrop-blur-xl absolute right-0 top-0 bottom-0 shadow-2xl animate-fade-in flex flex-col">
                 <div className="p-6 flex-1 flex flex-col items-center text-center space-y-6">
                    <div className="w-32 h-32 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl">
                       {mockFiles.find(f => f.id === selectedId)?.type === 'folder' ? <Folder className="w-16 h-16 text-yellow-500" /> : <File className="w-16 h-16 text-blue-500" />}
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white">{mockFiles.find(f => f.id === selectedId)?.name}</h3>
                       <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">{mockFiles.find(f => f.id === selectedId)?.kind}</p>
                    </div>
                    
                    <div className="w-full space-y-3 pt-6 border-t border-white/5 text-left">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-600 uppercase">Location</span>
                          <span className="text-[10px] text-blue-400 font-bold">{mockFiles.find(f => f.id === selectedId)?.location} Drive</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-600 uppercase">Sync State</span>
                          <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-black uppercase">Verified</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-4 grid grid-cols-2 gap-2">
                    <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all"><Share2 className="w-4 h-4" /></button>
                    <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all"><Download className="w-4 h-4" /></button>
                    <button className="col-span-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest shadow-lg transition-all">Open Artifact</button>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-slate-950 border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
         <div className="flex gap-4">
            <span>{filteredFiles.length} items</span>
            <span>1 item selected</span>
         </div>
         <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-cyan-500" />
            <span>Neural Link Active</span>
         </div>
      </div>
    </div>
  );
};

const DesktopIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
   </svg>
);

export default FileExplorer;
