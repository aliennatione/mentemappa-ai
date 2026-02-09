import React, { useState, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import MindMapViewer from './components/MindMapViewer';
import { sendMessageStream } from './services/gemini';
import { Message } from './types';
import { Network } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMarkdown, setCurrentMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const responseId = (Date.now() + 1).toString();
      let streamedContent = "";
      
      // Placeholder for model message
      setMessages((prev) => [
        ...prev,
        { id: responseId, role: 'model', text: '' },
      ]);

      await sendMessageStream(text, (chunk) => {
        streamedContent += chunk;
        
        // Update the message bubble text mostly for debug or simple confirms
        // We only really care about the mind map updating
        setMessages((prev) => 
          prev.map(msg => msg.id === responseId ? { ...msg, text: streamedContent } : msg)
        );
        
        // Update the map in real-time
        setCurrentMarkdown(streamedContent);
      });

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now().toString(), 
          role: 'model', 
          text: "Si è verificato un errore durante la generazione della mappa.", 
          isError: true 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 h-16">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
            <Network size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">MenteMappa AI</h1>
            <p className="text-xs text-gray-500 font-medium">Powered by Gemini 3</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Chat */}
        <section className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-[400px] md:h-full flex flex-col">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </section>

        {/* Right Column: Mind Map */}
        <section className="flex-1 h-full min-h-[400px]">
          <MindMapViewer markdown={currentMarkdown} />
        </section>

      </main>
    </div>
  );
}
