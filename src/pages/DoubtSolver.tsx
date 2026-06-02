import { useState } from 'react';
import { User } from '../types';
import { HelpCircle, Sparkles, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAIConfig } from '../hooks/useAIConfig';
import ModelSwitcher from '../components/ModelSwitcher';
import { generateWithAI, parseAIError } from '../lib/ai';

export default function DoubtSolver({ user }: { user: User }) {
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState<{steps: string[], answer: string, relatedConcept: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { config, setConfig, loaded } = useAIConfig();

  const solveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const prompt = `Solve this question: "${question}"`;
      const system = `You are an expert tutor for competitive exams in India. Solve the user's question step-by-step.
      Output ONLY a valid JSON object matching this structure exactly:
      {
        "steps": ["Step 1 explanation", "Step 2 explanation"],
        "answer": "Final short absolute answer (e.g. '15 days')",
        "relatedConcept": "Name of the core topic being tested"
      }`;

      const textResponse = await generateWithAI(prompt, config, system, true);
      const data = JSON.parse(textResponse);
      setSolution(data);
    } catch (error: any) {
      setErrorMsg(parseAIError(error));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Doubt Resolution Engine</h2>
          <p className="text-gray-500 mt-1">Get step-by-step solutions for any exam question instantly (Math/Reasoning/GK)</p>
        </div>
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
              <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={solveDoubt} className="flex flex-col space-y-4">
          <label className="text-sm font-medium text-gray-700">Paste your question here:</label>
          <textarea 
            rows={4}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g., A and B can do a piece of work in 10 days and 15 days respectively. They started the work together but B left after 2 days. In how many days the total work will be finished?"
            className="w-full p-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            required
          />
          <div className="flex justify-end">
             <button 
               type="submit" 
               disabled={loading}
               className="flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors"
             >
               {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
               Solve Step-by-Step
             </button>
          </div>
        </form>
      </div>

      {solution && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center">
             <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
             <h3 className="font-bold text-indigo-900">Step-by-Step Solution</h3>
           </div>
           
           <div className="p-6 space-y-6">
             <div className="space-y-4">
                {solution.steps.map((step, idx) => (
                  <div key={idx} className="flex">
                    <div className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center mr-3">
                      {idx + 1}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{step}</p>
                  </div>
                ))}
             </div>
             
             <div className="p-4 bg-green-50 text-green-900 border border-green-200 rounded-lg flex space-x-3 items-center font-medium">
                <span>Final Answer:</span>
                <span className="font-bold text-lg">{solution.answer}</span>
             </div>

             {solution.relatedConcept && (
               <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center">
                 <LinkIcon className="h-4 w-4 mr-2" />
                 Related Concept to Study: <span className="font-medium text-gray-800 ml-1">{solution.relatedConcept}</span>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
