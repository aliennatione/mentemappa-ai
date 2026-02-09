import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-300" />
        <h2 className="font-semibold text-lg">Assistente Mappe</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bot size={48} className="mx-auto mb-4 text-indigo-300" />
            <p className="font-medium text-gray-700">Ciao! Sono il tuo architetto di idee.</p>
            <p className="text-sm mt-2">Dimmi un argomento (es. "Sistema Solare") o incolla un testo da riassumere, e creerò una mappa mentale per te.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              } ${msg.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
            >
              {msg.role === 'model' ? (
                 // Simple markdown rendering for model response is skipped as it mostly generates the map. 
                 // We display a placeholder text or the raw map text if needed, 
                 // but typically the model only outputs the map code which might be verbose in chat.
                 // Let's show a friendly confirmation if it looks like a map, or the text if it's a clarification.
                 msg.text.startsWith('#') ? (
                   <div className="italic opacity-90">
                     <span className="font-semibold block mb-1">Mappa Generata!</span>
                     Visualizza il grafico a destra per vedere la struttura.
                   </div>
                 ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                 )
              ) : (
                <span className="whitespace-pre-wrap">{msg.text}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm p-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Generazione in corso...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descrivi la tua mappa mentale..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
