import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { adminLogin } from '../lib/api';

export default function AdminLogin({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await adminLogin(email, password);
      
      if (data.success) {
        onLogin(data.user);
        navigate('/admin');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gray-800 p-4 rounded-full inline-flex mb-4 border border-gray-700 shadow-xl">
            <ShieldCheck className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
          <p className="text-gray-400 mt-2">Restricted Access</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
