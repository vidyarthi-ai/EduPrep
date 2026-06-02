import { Server, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ModelSwitcher({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
  const navigate = useNavigate();

  if (!config) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex items-center">
        <select 
           value={config.provider || 'gemini'}
           onChange={(e) => {
              const newConf = { ...config, provider: e.target.value };
              setConfig(newConf);
           }}
           className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="ollama">Ollama</option>
          <option value="custom">Custom API</option>
        </select>
        <div className="absolute right-2 pointer-events-none">
          <Server className="h-3 w-3 text-gray-500" />
        </div>
      </div>
      
      <label className="flex items-center space-x-1 cursor-pointer text-xs text-gray-600 hidden sm:flex" title="Auto-fallback if limits exceeded">
         <input 
           type="checkbox" 
           checked={config.autoFallback} 
           onChange={e => setConfig({...config, autoFallback: e.target.checked})}
           className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
         />
         <span>Auto Fallback</span>
      </label>

      <button 
        type="button"
        onClick={() => navigate('/settings')} 
        className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-50 border border-gray-200 rounded-md transition-colors"
        title="AI Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}
