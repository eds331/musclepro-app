import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { createChatSession, sendMessageToAI } from '../services/geminiService';
import { User } from '../types';
import { Chat } from '@google/genai';

interface AIChatProps {
  user: User;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: `¡Hola ${user.username}! Soy tu Asistente MUSCLEPRO. ¿En qué puedo ayudarte hoy con tu entrenamiento o dieta?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession(user);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToAI(chatSessionRef.current, userMsg.text);

    const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const quickPrompts = [
    "Explícame mi rutina",
    "¿Qué es RPE?",
    "Dieta de volumen",
    "Técnica de Sentadilla"
  ];

  return (
    <div className="flex flex-col h-full bg-dark-900 md:bg-transparent">
      {/* Header */}
      <header className="bg-dark-800 p-4 border-b border-dark-700 flex items-center space-x-3 md:rounded-t-2xl">
        <div className="bg-brand-600 p-2 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">Asistente MUSCLEPRO</h2>
          <p className="text-xs text-brand-400">Potenciado por Gemini AI</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm md:text-base ${
              msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none shadow-md' 
                : 'bg-dark-700 text-gray-200 rounded-bl-none border border-dark-600'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dark-700 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2 border border-dark-600">
              <Loader2 className="animate-spin text-brand-500" size={18} />
              <span className="text-sm text-gray-400">Analizando tu consulta...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-800 border-t border-dark-700 md:rounded-b-2xl">
        {messages.length < 4 && (
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {quickPrompts.map(prompt => (
              <button 
                key={prompt}
                onClick={() => { setInput(prompt); }}
                className="bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-full whitespace-nowrap border border-dark-600 text-gray-300 text-sm transition-colors hover:border-brand-500 hover:text-brand-400"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu duda sobre entrenamiento o nutrición..."
            className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 p-4 rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] text-white"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};