import { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { useAIConfig } from '../hooks/useAIConfig';
import ModelSwitcher from '../components/ModelSwitcher';
import { generateWithAI, parseAIError } from '../lib/ai';

export default function AIMentor({ user }: { user: User }) {
  const { config, setConfig, loaded } = useAIConfig();
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: `Hello ${user.name}! I am your AI Coach for ${user.examCategory || 'competitive exams'}. What problem are you facing in your prep today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const context = `You are a strict but motivating personal coach for a student preparing for ${user?.examCategory || 'competitive'} exams in India. Keep answers concise, highly specific, and actionable. Do not give generic advice. Be direct. Use Markdown.`;
      const text = await generateWithAI(input, config, context, false, messages);
      setMessages([...newMsgs, { role: 'model', content: text }]);
    } catch (e: any) {
      setMessages([...newMsgs, { role: 'model', content: `🚨 **Error:** ${parseAIError(e)}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center mr-4 border-2 border-indigo-300">
            <Sparkles className="h-5 w-5 text-indigo-50" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Personal Coach</h2>
            <p className="text-indigo-200 text-xs font-medium">Strategic guidance & discipline</p>
          </div>
        </div>
        
        {loaded && (
           <div className="bg-white/10 p-1.5 rounded-lg border border-indigo-400">
             <ModelSwitcher config={config} setConfig={setConfig} />
           </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 border border-gray-300 ml-3' : 'bg-indigo-100 border border-indigo-200 mr-3'}`}>
                {msg.role === 'user' ? <UserIcon className="h-4 w-4 text-gray-600" /> : <Bot className="h-4 w-4 text-indigo-600" />}
              </div>
              <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-tl-sm markdown-body'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <Markdown>{msg.content}</Markdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span>Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your strategy, study blocks, or doubts..."
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-gray-300 bg-gray-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 h-10 w-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="h-4 w-4 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
