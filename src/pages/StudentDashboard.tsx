import { useState, useEffect } from 'react';
import { User, StudyStrategy } from '../types';
import { Target, BookOpen, Activity, Plus, Loader2, Flame, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAIConfig } from '../hooks/useAIConfig';
import ModelSwitcher from '../components/ModelSwitcher';

export default function StudentDashboard({ user }: { user: User }) {
  const { config, setConfig, loaded } = useAIConfig();
  const [strategies, setStrategies] = useState<StudyStrategy[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Strategy Form
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState('30');
  const [weakSubjects, setWeakSubjects] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    try {
      const [progRes, stratRes] = await Promise.all([
        fetch(`/api/user/${user.id}/progress`),
        fetch(`/api/user/${user.id}/strategies`)
      ]);
      const prog = await progRes.json();
      const strat = await stratRes.json();
      
      const pData = Object.entries(prog.subjectProgress || {}).map(([subject, score]) => ({
        subject, score
      }));
      setProgressData(pData);
      setStrategies(strat);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const generateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          examCategory: user.examCategory,
          durationDays: duration,
          weakSubjects,
          aiConfig: config
        })
      });
      const data = await res.json();
      if (data.success) {
        setStrategies([...strategies, data.strategy]);
        setShowForm(false);
        setWeakSubjects('');
      } else {
        alert('Failed to generate strategy: ' + data.message);
      }
    } catch (e) {
      alert('Error generating strategy');
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      {/* Gamification Row */}
      <div className="flex gap-4">
         <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-sm text-white px-6 py-3 flex items-center min-w-[200px]">
            <Flame className="h-6 w-6 mr-3 text-orange-200 fill-orange-200" />
            <div>
               <p className="text-xs text-orange-100 uppercase tracking-wider font-semibold">Daily Streak</p>
               <p className="text-xl font-bold">{user.streak || 0} {user.streak === 1 ? 'Day' : 'Days'}</p>
            </div>
         </div>
         <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-sm text-white px-6 py-3 flex items-center min-w-[200px]">
            <Zap className="h-6 w-6 mr-3 text-indigo-200 fill-indigo-200" />
            <div>
               <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">Competency XP</p>
               <p className="text-xl font-bold">{user.xp || 0} XP</p>
            </div>
         </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mr-4">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Target Exam</p>
            <p className="text-xl font-bold text-gray-900">{user.examCategory || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mr-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Plans</p>
            <p className="text-xl font-bold text-gray-900">{strategies.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mr-4">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Progress</p>
            <p className="text-xl font-bold text-gray-900">
              {progressData.length ? Math.round(progressData.reduce((acc, curr) => acc + curr.score, 0) / progressData.length) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Analytics Section */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Subject Progress</h2>
          {progressData.length > 0 ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-64 flex flex-col items-center justify-center text-gray-400">
               <Activity className="h-8 w-8 mb-2 opacity-50" />
               <p>No progress data yet</p>
             </div>
          )}
        </div>

        {/* AI Strategy Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AI Study Strategies</h2>
            <div className="flex items-center space-x-3">
              {loaded && <ModelSwitcher config={config} setConfig={setConfig} />}
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Strategy
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={generateStrategy} className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <h3 className="text-indigo-900 font-semibold mb-4">Generate Plan with AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Duration (Days)</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white px-3 py-2 text-sm">
                    <option value="15">15 Days (Crash Course)</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Weak Subjects</label>
                  <input type="text" value={weakSubjects} onChange={e => setWeakSubjects(e.target.value)} placeholder="e.g. Advanced Math, Current Affairs" className="w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isGenerating} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium">
                  {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : 'Generate AI Plan'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {strategies.length === 0 && !showForm && (
              <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No study strategies yet.</p>
                <p className="text-sm text-gray-400">Click "New Strategy" to let Gemini AI build one for you.</p>
              </div>
            )}
            {strategies.slice().reverse().map(s => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.summary}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {s.schedule?.map((sch, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-32 flex-shrink-0">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            {sch.phase}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-2">{sch.focus}</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {sch.activities?.map((act, j) => (
                              <li key={j} className="text-sm text-gray-600">{act}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
