
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BrainCircuit, Trash2 } from 'lucide-react';
import Button from './ui/Button';
import { startThinkingChat } from '../services/geminiService';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; thinking?: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startThinkingChat("You are a highly intelligent AI assistant with deep reasoning capabilities. When you think, be thorough.");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100">Thinking Assistant</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Gemini 3 Pro (32K Thinking Budget)
            </p>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Bot className="w-12 h-12 opacity-20" />
            <p className="text-sm italic">Start a conversation with complex reasoning enabled.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-xs text-slate-400 font-mono">Thinking...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a complex question..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
