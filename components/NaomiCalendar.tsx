
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Target, CheckCircle, Sparkles, Filter } from 'lucide-react';

const NaomiCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const grid = [];

    // Empty spaces
    for (let i = 0; i < startDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-24 bg-slate-950/10 border border-white/5 opacity-20"></div>);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
      grid.push(
        <div key={i} className={`h-24 bg-slate-900/40 border border-white/5 p-2 transition-all hover:bg-white/5 group relative cursor-pointer ${isToday ? 'bg-indigo-600/10 border-indigo-500/50' : ''}`}>
          <span className={`text-[10px] font-black ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>{String(i).padStart(2, '0')}</span>
          {i === 15 && (
            <div className="mt-2 bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg">
               Nexus Sync: 14:00
            </div>
          )}
          {i === 22 && (
            <div className="mt-2 bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg">
               Reconstruction Scan
            </div>
          )}
          <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/20 pointer-events-none transition-all"></div>
        </div>
      );
    }

    return grid;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden font-sans border border-white/10 shadow-2xl animate-fade-in">
      <div className="p-8 bg-slate-950/40 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
              <Calendar className="w-8 h-8 text-indigo-400" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.4em] mt-1">Temporal Planning Module</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 mr-4">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors"
              ><ChevronLeft className="w-5 h-5" /></button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 text-[10px] font-black text-white uppercase hover:text-indigo-400 transition-colors"
              >Today</button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors"
              ><ChevronRight className="w-5 h-5" /></button>
           </div>
           <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">
              <Plus className="w-4 h-4" /> New Sequence
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Calendar Grid */}
         <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-px bg-white/5 mb-4 border-b border-white/5">
               {days.map(d => (
                 <div key={d} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
               ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
               {renderDays()}
            </div>
         </div>

         {/* Sidebar: Tasks */}
         <div className="w-80 bg-slate-950/40 border-l border-white/5 p-6 space-y-8">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> Priority Directives
               </h3>
               <div className="space-y-3">
                  {[
                    { title: 'Neural Optimization', time: '09:00', type: 'system' },
                    { title: 'Nexus Cache Flush', time: '12:30', type: 'maintenance' },
                    { title: 'Svelte Code Review', time: '15:00', type: 'dev' },
                  ].map((task, i) => (
                    <div key={i} className="bg-slate-900 border border-white/5 p-4 rounded-2xl group hover:border-indigo-500/30 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-white uppercase">{task.title}</span>
                          <Clock className="w-3 h-3 text-slate-600" />
                       </div>
                       <p className="text-[9px] text-slate-500 font-mono">{task.time}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center space-y-3">
               <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Autonomous Sync</h4>
               <p className="text-[9px] text-slate-500 leading-relaxed uppercase">Jules Agent is managing your creative timeline. 4 sequences optimized.</p>
            </div>
         </div>
      </div>

      <div className="h-8 bg-slate-950 border-t border-white/5 flex items-center px-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
         System Calendar Engine v1.0.4 • Central Time UTC-6
      </div>
    </div>
  );
};

export default NaomiCalendar;
