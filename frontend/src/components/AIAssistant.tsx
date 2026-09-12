import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import type { ChatMessage, FloorPlan, ProjectConfig } from '../types';

interface AIAssistantProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  plan: FloorPlan | null;
  config: ProjectConfig;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ messages, onSend, plan, config }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[250px] bg-slate-900 border-t border-slate-700 flex flex-col">
      <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-950">
        <Sparkles size={14} className="text-blue-400 mr-2" />
        <span className="text-xs font-semibold text-slate-300">ArchAI Assistant</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-xs mt-4">
            Ask me about your plan, required rooms, or design improvements.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-blue-900 text-blue-300'}`}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={`p-2.5 rounded-lg text-sm ${msg.role === 'user' ? 'bg-slate-700 text-slate-100' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {["Analyze my plan", "Suggest improvements", "Cost saving tips"].map(suggestion => (
            <button 
              key={suggestion}
              onClick={() => onSend(suggestion)}
              className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-full border border-slate-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your floor plan..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-1.5 rounded-lg transition-colors flex items-center justify-center w-9 h-9"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
