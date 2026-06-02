import { useState } from 'react';
import { Save, Key, Server, CheckCircle2 } from 'lucide-react';
import { useAIConfig } from '../hooks/useAIConfig';

export default function AISettings() {
  const { config, setConfig, loaded } = useAIConfig();
  const [saved, setSaved] = useState(false);

  if (!loaded) return null;

  const handleSave = () => {
    // setConfig already saves to secure storage in the hook, but we can just trigger the animation
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Model & API Management</h2>
        <p className="text-gray-500 mt-1">Configure your preferred AI providers and APIs.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        {/* Model Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2 text-indigo-600" /> Primary AI Model
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['gemini', 'openai', 'claude', 'ollama', 'custom'].map((provider) => (
              <button
                key={provider}
                onClick={() => setConfig({ ...config, provider: provider as any })}
                className={`p-3 rounded-lg border-2 text-center uppercase tracking-wider font-semibold text-sm transition-colors ${config.provider === provider ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-indigo-600" /> API Keys Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
              <input type="password" value={config.geminiKey} onChange={e => setConfig({...config, geminiKey: e.target.value})} placeholder="AIzaSy..." className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use the system default key.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key (ChatGPT)</label>
              <input type="password" value={config.openaiKey} onChange={e => setConfig({...config, openaiKey: e.target.value})} placeholder="sk-..." className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key (Claude)</label>
              <input type="password" value={config.claudeKey} onChange={e => setConfig({...config, claudeKey: e.target.value})} placeholder="sk-ant-..." className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Custom OpenAI-Compatible API</label>
              <div className="space-y-3">
                <input type="text" value={config.customUrl} onChange={e => setConfig({...config, customUrl: e.target.value})} placeholder="URL (e.g. https://api.groq.com/openai/v1/chat/completions)" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
                <input type="password" value={config.customKey} onChange={e => setConfig({...config, customKey: e.target.value})} placeholder="Custom API Key (if any)" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
                <input type="text" value={config.customModel} onChange={e => setConfig({...config, customModel: e.target.value})} placeholder="Model Name (e.g. llama3-8b-8192)" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ollama Local URL</label>
              <input type="text" value={config.ollamaUrl} onChange={e => setConfig({...config, ollamaUrl: e.target.value})} placeholder="http://localhost:11434" className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Auto Fallback */}
        <div className="pt-4 border-t border-gray-100">
           <label className="flex items-center space-x-3 cursor-pointer">
             <input type="checkbox" checked={config.autoFallback} onChange={e => setConfig({...config, autoFallback: e.target.checked})} className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
             <div>
               <p className="font-semibold text-gray-900">Auto-Fallback Mode</p>
               <p className="text-sm text-gray-500">Automatically switch to another configured provider if the primary one fails (e.g., rate limits exceeded).</p>
             </div>
           </label>
        </div>

        <div className="flex items-center pt-6">
          <button onClick={handleSave} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
             <Save className="h-5 w-5 mr-2" /> Save Settings
          </button>
          {saved && <span className="ml-4 flex items-center text-green-600 text-sm font-medium"><CheckCircle2 className="h-5 w-5 mr-1"/> Saved successfully!</span>}
        </div>

      </div>
    </div>
  );
}
