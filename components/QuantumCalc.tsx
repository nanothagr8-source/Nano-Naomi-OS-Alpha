
import React, { useState } from 'react';
import { Binary, Plus, Minus, X, Equal, ChevronDown } from 'lucide-react';

const QuantumCalc: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const append = (val: string) => {
    if (display === '0') setDisplay(val);
    else setDisplay(display + val);
  };

  const calculate = () => {
    try {
      // Basic evaluation logic
      const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
      setEquation(display + ' =');
      setDisplay(String(result));
    } catch (e) {
      setDisplay('Error');
    }
  };

  const buttons = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'DEL', '=']
  ];

  return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-900 animate-fade-in">
      <div className="w-72 bg-slate-950 border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-6">
        <div className="text-right space-y-2">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{equation}</p>
          <h2 className="text-4xl font-black text-white tracking-tighter">{display}</h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.flat().map(btn => (
            <button
              key={btn}
              onClick={() => {
                if (btn === '=') calculate();
                else if (btn === 'C') { setDisplay('0'); setEquation(''); }
                else if (btn === 'DEL') setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
                else append(btn);
              }}
              className={`h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                btn === '=' ? 'bg-indigo-600 text-white col-span-1 shadow-lg shadow-indigo-900/40' :
                ['÷','×','-','+','C','DEL'].includes(btn) ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-center">
           <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
              <Binary className="w-3 h-3" /> Precision: 64-Bit Float
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCalc;
