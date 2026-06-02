import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { LayoutDashboard, LogOut, GraduationCap, Settings, BookOpen, Calendar, Bot, BrainCircuit, FileText, HelpCircle } from 'lucide-react';

export default function Layout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <div />;

  const handleLogoutAdmin = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <GraduationCap className="h-6 w-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EduPrep</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Overview
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link to="/ai-mentor" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/ai-mentor') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Bot className={`h-5 w-5 mr-3 ${isActive('/ai-mentor') ? 'text-indigo-600' : ''}`} />
                AI Coach
              </Link>
              <Link to="/analytics" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/analytics') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <BrainCircuit className="h-5 w-5 mr-3" />
                Deep Analytics
              </Link>
              <Link to="/tests" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/tests') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <BookOpen className="h-5 w-5 mr-3" />
                Mock Tests
              </Link>
              <Link to="/planner" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/planner') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Calendar className="h-5 w-5 mr-3" />
                Study Planner
              </Link>
              <Link to="/study" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/study') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FileText className="h-5 w-5 mr-3" />
                Study Notes
              </Link>
              <Link to="/doubt" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/doubt') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <HelpCircle className="h-5 w-5 mr-3" />
                Doubt Solver
              </Link>
              <Link to="/settings" className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/settings') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Settings className="h-5 w-5 mr-3" />
                AI Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.name[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogoutAdmin}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            {user.role === 'admin' ? 'Administration' : 'Student Portal'}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
