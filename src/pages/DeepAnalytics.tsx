import { useState, useEffect } from 'react';
import { User } from '../types';
import { BrainCircuit, Target, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useAIConfig } from '../hooks/useAIConfig';
import ModelSwitcher from '../components/ModelSwitcher';
import { generateWithAI, parseAIError } from '../lib/ai';
import { getTestResults, getProgress } from '../lib/api';

export default function DeepAnalytics({ user }: { user: User }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { config, setConfig, loaded } = useAIConfig();

  // Simulated radar data for subject competency
  const radarData = [
    { subject: 'Math', A: user.progress?.Math || 0, fullMark: 100 },
    { subject: 'English', A: user.progress?.English || 0, fullMark: 100 },
    { subject: 'Reasoning', A: user.progress?.Reasoning || 0, fullMark: 100 },
    { subject: 'GK', A: user.progress?.GK || 0, fullMark: 100 },
  ];

  useEffect(() => {
    if (!loaded) return;
    
    async function fetchAnalysis() {
      try {
        const uTests = getTestResults(user.id).slice(-3);
        const logData = getProgress(user.id);
        const uLogs = logData.logs.slice(-7);
        
        const prompt = `Analyze this student's recent test data and provide personalized insights.
        Recent Tests: ${JSON.stringify(uTests)}
        Recent Daily Progress logs: ${JSON.stringify(uLogs)}`;
        
        const system = `Output ONLY a JSON object exactly matching this structure:
        {
          "summary": "Brief 1-2 sentence overview.",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"],
          "actionableAdvice": ["Action 1", "Action 2"]
        }`;

        const textResponse = await generateWithAI(prompt, config, system, true);
        const data = JSON.parse(textResponse);
        setAnalysis(data);
      } catch (e: any) {
        setErrorMsg(parseAIError(e));
      }
      setLoading(false);
    }
    
    fetchAnalysis();
  }, [user.id, loaded]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Analyzing cognitive patterns...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cognitive & Behavioral Intelligence</h2>
          <p className="text-gray-500 mt-1">Deep insights into your learning patterns</p>
        </div>
        {loaded && <ModelSwitcher config={config} setConfig={setConfig} />}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysis && (
        <div className="bg-indigo-900 rounded-2xl shadow-lg border border-indigo-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold tracking-wider text-sm mb-4 uppercase">
              <BrainCircuit className="h-5 w-5" />
              <span>AI Performance Diagnosis</span>
            </div>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl mb-8">
              "{analysis.summary}"
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="bg-indigo-950/50 p-6 rounded-xl border border-indigo-800/50">
                 <h4 className="flex items-center font-semibold text-emerald-400 mb-4">
                   <Target className="h-5 w-5 mr-2" /> Strengths Identified
                 </h4>
                 <ul className="space-y-3">
                   {analysis.strengths?.map((s: string, i: number) => (
                     <li key={i} className="flex items-start text-sm text-indigo-100">
                       <span className="mr-2 text-emerald-400">•</span> {s}
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="bg-indigo-950/50 p-6 rounded-xl border border-indigo-800/50">
                 <h4 className="flex items-center font-semibold text-amber-400 mb-4">
                   <AlertTriangle className="h-5 w-5 mr-2" /> Caution Areas
                 </h4>
                 <ul className="space-y-3">
                   {analysis.weaknesses?.map((w: string, i: number) => (
                     <li key={i} className="flex items-start text-sm text-indigo-100">
                       <span className="mr-2 text-amber-400">•</span> {w}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center">
            <Target className="h-5 w-5 mr-2 text-indigo-500" />
            Subject Competency (DNA)
          </h3>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height={288}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Score" dataKey="A" stroke="#6366F1" fill="#818CF8" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
           <div>
             <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                Recommended Action Plan
             </h3>
             <ul className="space-y-6">
                {analysis?.actionableAdvice?.map((advice: string, i: number) => (
                  <li key={i} className="flex">
                    <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="ml-4 text-gray-700 leading-relaxed text-sm">
                      {advice}
                    </p>
                  </li>
                ))}
             </ul>
           </div>
           
           <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="flex items-center text-sm text-gray-500 mb-2">
                <TrendingUp className="h-4 w-4 mr-2" /> Safe Score Prediction
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-3xl font-black text-gray-900">142<span className="text-lg text-gray-400 font-medium ml-1">/ 200</span></p>
                   <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mt-1">Safe Zone Boundary</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-medium text-gray-900">Current Setup:</p>
                   <p className="text-xs text-gray-500">80 attempts @ 85% Acc.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
