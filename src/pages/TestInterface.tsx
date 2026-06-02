import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MockTest, TestResult } from '../types';
import { Clock, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { getTestById, submitTest as localSubmitTest } from '../lib/api';

export default function TestInterface({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<MockTest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (id) {
      const data = getTestById(id);
      if (data) {
        setTest(data);
        setTimeLeft(data.durationMinutes * 60);
      }
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && test && !result) {
      submitTest();
    }
  }, [timeLeft, test, result]);

  const submitTest = async () => {
    if (!test) return;
    const data = localSubmitTest(user.id, test.id, answers);
    setResult(data);
  };
  
  if (!test) return <div className="p-8 text-center text-gray-500">Loading test...</div>;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
        <p className="text-gray-500 mb-8">{test.title}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-2xl font-bold text-indigo-600">{result.score}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">Accuracy</p>
            <p className="text-2xl font-bold text-indigo-600">{Math.round(result.accuracy)}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-gray-500">Correct</p>
            <p className="text-2xl font-bold text-green-600">{result.correct}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm text-gray-500">Incorrect</p>
            <p className="text-2xl font-bold text-red-600">{result.incorrect}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/tests')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const question = test.questions ? test.questions[currentIdx] : null;
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!question) return <div className="p-8 text-center text-gray-500">Loading questions...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="font-bold text-gray-900">{test.title}</h2>
          <p className="text-sm text-gray-500">Section: {question.section}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-lg font-mono font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={submitTest}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              <span className="text-gray-400 mr-2">Q{currentIdx + 1}.</span> {question.text}
            </h3>
            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <label key={i} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${answers[question.id] === i ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name={question.id} 
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                    checked={answers[question.id] === i}
                    onChange={() => setAnswers({...answers, [question.id]: i})}
                  />
                  <span className="ml-3 text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <button 
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center px-4 py-2 border border-gray-300 bg-white shadow-sm rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Previous
            </button>
            <button 
              onClick={() => setCurrentIdx(Math.min((test.questions?.length || 1) - 1, currentIdx + 1))}
              disabled={currentIdx === (test.questions?.length || 1) - 1}
              className="flex items-center px-4 py-2 border border-transparent bg-indigo-600 text-white shadow-sm rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Next <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>

        <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Question Palette</h4>
          <div className="grid grid-cols-5 gap-2">
            {test.questions?.map((q, idx) => (
              <button 
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`flex items-center justify-center h-10 w-10 rounded-md font-medium text-sm transition-colors border
                  ${currentIdx === idx ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                  ${answers[q.id] !== undefined ? 'bg-green-500 border-green-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
