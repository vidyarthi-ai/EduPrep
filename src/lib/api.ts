import { v4 as uuidv4 } from 'uuid';
import { secureStorage } from './storage';

// Mock Auth
export const login = async (email, password) => {
  const users = secureStorage.getItem('edu_users', []);
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    if (user.role === 'admin') {
      return { success: false, message: 'Admins must use the admin portal.' };
    }
    const today = new Date().toISOString().split('T')[0];
    if (user.role === 'student' && user.lastActive !== today) {
        if (user.lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            user.streak = (user.streak || 0) + 1;
            user.xp = (user.xp || 0) + 10;
        } else if (!user.lastActive || user.lastActive < new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            user.streak = 1;
        }
        user.lastActive = today;
        secureStorage.setItem('edu_users', users);
    }
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }
  return { success: false, message: 'Invalid credentials' };
};

export const adminLogin = async (email, password) => {
  const users = secureStorage.getItem('edu_users', []);
  const user = users.find(u => u.email === email && u.password === password);
  if (user && user.role === 'admin') {
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }
  return { success: false, message: 'Invalid admin credentials' };
};

export const register = async (name, email, password, examCategory) => {
  const users = secureStorage.getItem('edu_users', []);
  if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
  }
  const newUser = {
      id: uuidv4(), name, email, password, role: 'student' as const, examCategory: examCategory || 'SSC',
      progress: { Math: 0, English: 0, Reasoning: 0, GK: 0 },
      xp: 0, streak: 1, lastActive: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  secureStorage.setItem('edu_users', users);
  const { password: _, ...safeUser } = newUser;
  return { success: true, user: safeUser };
};

// Ensure default users
export const initDB = () => {
    let users = secureStorage.getItem('edu_users', []);
    
    // Force remove old admin if it exists
    users = users.filter((u: any) => u.email !== 'admin@edu.test');
    
    // Ensure new admin exists
    if (!users.find((u: any) => u.email === 'admin@prepai.system')) {
        users.push({ id: 'admin1', name: 'Admin', email: 'admin@prepai.system', password: 'A3$p9k#M2!xQ', role: 'admin', xp: 0, streak: 0, lastActive: '2026-06-01' });
    }
    
    // Ensure default demo student exists
    if (!users.find((u: any) => u.email === 'student@edu.test')) {
        users.push({ id: 'stud1', name: 'Student 1', email: 'student@edu.test', password: 'password', role: 'student', examCategory: 'SSC', progress: { Math: 40, English: 60, Reasoning: 50, GK: 30 }, xp: 450, streak: 3, lastActive: '2026-06-01' });
    }
    
    secureStorage.setItem('edu_users', users);
};

export const getTodos = (userId) => {
    const todos = secureStorage.getItem('edu_todos', []);
    return todos.filter(t => t.userId === userId);
};

export const addTodo = (userId, text, date) => {
    const todos = secureStorage.getItem('edu_todos', []);
    const newTodo = { id: uuidv4(), userId, text, completed: false, date: date || new Date().toISOString().split('T')[0] };
    todos.push(newTodo);
    secureStorage.setItem('edu_todos', todos);
    return newTodo;
};

export const updateTodo = (todoId, updates) => {
    const todos = secureStorage.getItem('edu_todos', []);
    const index = todos.findIndex(t => t.id === todoId);
    if (index !== -1) {
        todos[index] = { ...todos[index], ...updates };
        secureStorage.setItem('edu_todos', todos);
        return todos[index];
    }
    return null;
};

export const deleteTodo = (todoId) => {
    let todos = secureStorage.getItem('edu_todos', []);
    todos = todos.filter(t => t.id !== todoId);
    secureStorage.setItem('edu_todos', todos);
    return { success: true };
};

export const getStrategies = (userId) => {
    const strategies = secureStorage.getItem('edu_strategies', []);
    return strategies.filter(s => s.userId === userId);
};

export const saveStrategy = (strategy) => {
    const strategies = secureStorage.getItem('edu_strategies', []);
    strategies.push(strategy);
    secureStorage.setItem('edu_strategies', strategies);
    return strategy;
};

export const getProgress = (userId) => {
    const logs = secureStorage.getItem('edu_progress', []);
    const users = secureStorage.getItem('edu_users', []);
    const user = users.find(u => u.id === userId);
    return { logs: logs.filter(l => l.userId === userId), subjectProgress: user?.progress || {} };
};

export const getTestResults = (userId) => {
    const results = secureStorage.getItem('edu_test_results', []);
    return results.filter(r => r.userId === userId);
};

const mockTests = [
  {
    id: 'test-1', title: 'SSC CGL Tier 1 Full Mock', category: 'SSC', durationMinutes: 60,
    questions: [
      { id: 'q1', text: 'If a = 10 and b = 20, what is a + b?', options: ['20', '30', '40', '50'], correctOptionIndex: 1, section: 'Math' },
      { id: 'q2', text: 'Select the synonym of "ABANDON".', options: ['Keep', 'Leave', 'Cherish', 'Hold'], correctOptionIndex: 1, section: 'English' },
      { id: 'q3', text: 'Who is the current Prime Minister of India? (As of 2024)', options: ['Rahul Gandhi', 'Narendra Modi', 'Amit Shah', 'Rajnath Singh'], correctOptionIndex: 1, section: 'GK' },
      { id: 'q4', text: 'Find the missing number in series: 2, 4, 8, 16, ?', options: ['24', '32', '64', '128'], correctOptionIndex: 1, section: 'Reasoning' }
    ]
  }
];

export const getTests = () => {
    return mockTests.map(t => ({ id: t.id, title: t.title, category: t.category, durationMinutes: t.durationMinutes, questionCount: t.questions.length }));
};

export const getTestById = (id) => {
    return mockTests.find(t => t.id === id);
};

export const getAdminStats = () => {
    const users = secureStorage.getItem('edu_users', []);
    const students = users.filter((u: any) => u.role !== 'admin');
    
    const byCategory: Record<string, number> = {};
    students.forEach((u: any) => {
        if (!byCategory[u.examCategory]) byCategory[u.examCategory] = 0;
        byCategory[u.examCategory]++;
    });

    return { totalStudents: students.length, byCategory };
};

export const getAdminUsers = () => {
    const users = secureStorage.getItem('edu_users', []);
    return users.filter((u: any) => u.role !== 'admin');
};

export const submitTest = (userId, testId, answers) => {
    const test = mockTests.find(t => t.id === testId);
    if (!test) return null;

    let correct = 0; let incorrect = 0; let skipped = 0;
    
    test.questions.forEach((q: any) => {
        if (answers[q.id] === undefined) skipped++;
        else if (answers[q.id] === q.correctOptionIndex) correct++;
        else incorrect++;
    });
    
    const score = correct * 2 - incorrect * 0.5;
    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    
    const result = { 
        id: uuidv4(), userId, testId: test.id, score, accuracy, 
        total: test.questions.length, correct, incorrect, skipped, date: new Date().toISOString() 
    };

    const results = secureStorage.getItem('edu_test_results', []);
    results.push(result);
    secureStorage.setItem('edu_test_results', results);
    
    const logs = secureStorage.getItem('edu_progress', []);
    logs.push({ userId, date: new Date().toISOString().split('T')[0], score: accuracy });
    secureStorage.setItem('edu_progress', logs);

    return result;
};
