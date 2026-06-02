import { useState } from 'react';
import { User } from '../types';
import { FileText, Cpu, Search, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { useAIConfig } from '../hooks/useAIConfig';
import ModelSwitcher from '../components/ModelSwitcher';

export default function StudyNotes({ user }: { user: User }) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState<{title: string, content: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { config, setConfig, loaded } = useAIConfig();

  const generateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, topic, aiConfig: config })
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes);
      } else {
        setErrorMsg(data.message);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to connect to the server.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">AI Study Notes & Concept Builder</h2>
        {loaded && <ModelSwitcher config={config} setConfig={setConfig} />}
      </div>
      
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">AI Processing Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={generateNotes} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Number System, Time & Work, Polity Articles)"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Cpu className="h-5 w-5 mr-2" />}
            Generate Notes
          </button>
        </form>
      </div>

      {notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose max-w-none prose-indigo">
           <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                 <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 m-0">{notes.title}</h3>
           </div>
           
           <div className="text-gray-800 leading-relaxed markdown-body"> 
             <Markdown>{notes.content}</Markdown>
           </div>
        </div>
      )}
    </div>
  );
}
