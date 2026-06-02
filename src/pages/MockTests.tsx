import { useState, useEffect } from 'react';
import { MockTest } from '../types';
import { Link } from 'react-router-dom';
import { FileText, Clock, PlayCircle } from 'lucide-react';
import { getTests } from '../lib/api';

export default function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);

  useEffect(() => {
    setTests(getTests());
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Mock Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map(test => (
          <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 mb-2">
                  {test.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
              </div>
              <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 flex-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {test.durationMinutes} Mins
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {test.questionCount} Questions
              </div>
            </div>
            
            <Link 
              to={`/tests/${test.id}`}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
