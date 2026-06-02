/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MockTests from './pages/MockTests';
import TestInterface from './pages/TestInterface';
import StudyPlanner from './pages/StudyPlanner';
import AIMentor from './pages/AIMentor';
import DeepAnalytics from './pages/DeepAnalytics';
import StudyNotes from './pages/StudyNotes';
import DoubtSolver from './pages/DoubtSolver';
import AISettings from './pages/AISettings';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('demo_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('demo_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
        
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        {/* Protected Routes */}
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={
            user?.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/ai-mentor" element={
            user?.role === 'student' ? <AIMentor user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/analytics" element={
            user?.role === 'student' ? <DeepAnalytics user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/tests" element={
            user?.role === 'student' ? <MockTests /> : <Navigate to="/login" />
          } />
          <Route path="/tests/:id" element={
            user?.role === 'student' ? <TestInterface user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/planner" element={
            user?.role === 'student' ? <StudyPlanner user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/study" element={
            user?.role === 'student' ? <StudyNotes user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/doubt" element={
            user?.role === 'student' ? <DoubtSolver user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/settings" element={
            user?.role === 'student' ? <AISettings /> : <Navigate to="/login" />
          } />
          <Route path="/admin" element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
          } />
        </Route>
      </Routes>
    </Router>
  );
}
