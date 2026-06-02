import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI
let ai: GoogleGenAI | null = null;
const initAI = () => {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return ai;
};

// ==========================================
// Mock Database
// ==========================================
let users = [
  { id: 'admin1', name: 'Admin', email: 'admin@edu.test', password: 'password', role: 'admin', xp: 0, streak: 0, lastActive: '2026-06-01' },
  { id: 'stud1', name: 'Student 1', email: 'student@edu.test', password: 'password', role: 'student', examCategory: 'SSC', progress: { Math: 40, English: 60, Reasoning: 50, GK: 30 }, xp: 450, streak: 3, lastActive: '2026-06-01' }
];

let strategies: any[] = [];
let progressLogs: any[] = [
  { userId: 'stud1', date: '2026-05-28', score: 35 },
  { userId: 'stud1', date: '2026-05-29', score: 40 },
  { userId: 'stud1', date: '2026-05-30', score: 45 },
  { userId: 'stud1', date: '2026-06-01', score: 55 },
];

let todos: any[] = [
  { id: 'todo1', userId: 'stud1', text: 'Revise Number System', completed: false, date: '2026-06-02' }
];

let mockTests: any[] = [
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

let testResults: any[] = [];

// ==========================================
// API Routes
// ==========================================

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    // Gamification logic
    const today = new Date().toISOString().split('T')[0];
    if (user.role === 'student') {
      if (user.lastActive !== today) {
        if (user.lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
          user.streak = (user.streak || 0) + 1; // Increment streak
          user.xp = (user.xp || 0) + 10; // Daily login bonus
        } else if (user.lastActive && user.lastActive < new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
          user.streak = 1; // Reset streak
        } else if (!user.lastActive) {
          user.streak = 1;
        }
        user.lastActive = today;
      }
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, examCategory } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  const newUser = {
    id: uuidv4(),
    name, email, password, role: 'student', examCategory: examCategory || 'SSC',
    progress: { Math: 0, English: 0, Reasoning: 0, GK: 0 },
    xp: 0, streak: 1, lastActive: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  const students = users.filter(u => u.role === 'student').map(({ password, ...u }) => u);
  res.json(students);
});

app.get('/api/admin/stats', (req, res) => {
  const students = users.filter(u => u.role === 'student');
  const totalStudents = students.length;
  const byCategory = students.reduce((acc: any, curr) => {
    acc[curr.examCategory] = (acc[curr.examCategory] || 0) + 1;
    return acc;
  }, {});
  res.json({ totalStudents, byCategory });
});

// Student endpoints
app.get('/api/user/:id/progress', (req, res) => {
  const { id } = req.params;
  const uLogs = progressLogs.filter(p => p.userId === id);
  const user = users.find(u => u.id === id);
  res.json({ logs: uLogs, subjectProgress: user?.progress || {} });
});

// Test endpoints
app.get('/api/tests', (req, res) => {
  res.json(mockTests.map(t => ({ id: t.id, title: t.title, category: t.category, durationMinutes: t.durationMinutes, questionCount: t.questions.length })));
});

app.get('/api/tests/:id', (req, res) => {
  const test = mockTests.find(t => t.id === req.params.id);
  res.json(test || null);
});

app.post('/api/tests/:id/submit', (req, res) => {
  const test = mockTests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({error: 'Not found'});
  
  const { userId, answers } = req.body;
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
  
  testResults.push(result);
  
  // Update progress logs
  progressLogs.push({ userId, date: new Date().toISOString().split('T')[0], score: accuracy });
  
  res.json(result);
});

// Todo endpoints
app.get('/api/user/:id/todos', (req, res) => {
  const { id } = req.params;
  res.json(todos.filter(t => t.userId === id));
});

app.post('/api/user/:id/todos', (req, res) => {
  const { id } = req.params;
  const { text, date } = req.body;
  const newTodo = { id: uuidv4(), userId: id, text, completed: false, date: date || new Date().toISOString().split('T')[0] };
  todos.push(newTodo);
  res.json(newTodo);
});

app.put('/api/todos/:todoId', (req, res) => {
  const { todoId } = req.params;
  const { completed, text, date } = req.body;
  const todo = todos.find(t => t.id === todoId);
  if (todo) {
    if (completed !== undefined) todo.completed = completed;
    if (text !== undefined) todo.text = text;
    if (date !== undefined) todo.date = date;
    res.json(todo);
  } else {
    res.status(404).json({error: 'Not found'});
  }
});

app.delete('/api/todos/:todoId', (req, res) => {
  const { todoId } = req.params;
  todos = todos.filter(t => t.id !== todoId);
  res.json({ success: true });
});

function parseAIError(e: any): string {
  const str = e.message || String(e);
  if (str.includes('429') || str.includes('exceeded') || str.includes('RESOURCE_EXHAUSTED')) {
     return 'Rate Limit Exceeded: The AI service is currently busy or out of quota. Please configure your own API key in AI Settings or try again later.';
  }
  if (str.includes('503') || str.includes('UNAVAILABLE')) {
     return 'Service Unavailable: The AI model is temporarily overloaded. Please try again soon or switch models in AI Settings.';
  }
  if (str.includes('API key') || str.includes('401')) {
     return 'Authentication Error: The provided AI API key is missing or invalid. Please update it in AI Settings.';
  }
  return `AI Error Failed to process request: ${str.substring(0, 150)}...`;
}

async function generateWithAI(prompt: string, aiConfig: any, systemInstruction?: string, isJson: boolean = false, history?: {role:string, content:string}[]): Promise<string> {
    const config = aiConfig || { provider: 'gemini' };
    let providers = [config.provider];
    
    if (config.autoFallback) {
       const fallbacks = ['gemini', 'openai', 'claude', 'custom'].filter(p => p !== config.provider);
       providers = [...providers, ...fallbacks];
    }

    let errors: string[] = [];

    for (const provider of providers) {
       try {
          if (provider === 'gemini') {
             const key = config.geminiKey || process.env.GEMINI_API_KEY;
             if (!key) throw new Error("API_KEY_MISSING");
             const genAi = new GoogleGenAI({ apiKey: key, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }});
             
             if (history && history.length > 0) {
                 const chat = genAi.chats.create({
                    model: 'gemini-2.5-flash',
                    history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
                    config: systemInstruction ? { systemInstruction } : undefined
                 });
                 const resp = await chat.sendMessage({ message: prompt });
                 return resp.text || '';
             } else {
                 let fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
                 const resp = await genAi.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: fullPrompt,
                     config: isJson ? { responseMimeType: 'application/json' } : undefined
                 });
                 let txt = resp.text || '';
                 if (isJson && txt.startsWith('```json')) {
                     txt = txt.replace(/```json|```/g, '').trim();
                 }
                 return txt;
             }
          } else if (provider === 'openai') {
             const key = config.openaiKey;
             if (!key) throw new Error("API_KEY_MISSING");
             
             const messages = [];
             if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
             if (history) {
                history.forEach(h => messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content }));
             }
             messages.push({ role: 'user', content: prompt });
             
             const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({ 
                   model: 'gpt-3.5-turbo', 
                   messages,
                   response_format: isJson ? { type: "json_object" } : undefined
                })
             });
             if (!res.ok) {
                const err: any = await res.json().catch(()=>({}));
                throw new Error(err.error?.message || `HTTP ${res.status}`);
             }
             const data: any = await res.json();
             return data.choices[0].message.content;
          } else if (provider === 'claude') {
             const key = config.claudeKey;
             if (!key) throw new Error("API_KEY_MISSING");
             throw new Error("Claude implementation mock: Please use Gemini or OpenAI.");
          } else if (provider === 'custom') {
             const key = config.customKey;
             const url = config.customUrl || 'https://api.openai.com/v1/chat/completions';
             const modelName = config.customModel || 'gpt-3.5-turbo';
             
             const messages = [];
             if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
             if (history) {
                history.forEach((h: any) => messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content }));
             }
             messages.push({ role: 'user', content: prompt });
             
             const headers: any = { 'Content-Type': 'application/json' };
             if (key) {
               headers['Authorization'] = `Bearer ${key}`;
             } else {
               throw new Error("API_KEY_MISSING");
             }

             const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                   model: modelName, 
                   messages,
                   response_format: isJson ? { type: "json_object" } : undefined
                })
             });
             if (!res.ok) {
                const err: any = await res.json().catch(()=>({}));
                throw new Error(err.error?.message || err.message || `HTTP ${res.status}`);
             }
             const data: any = await res.json();
             return data.choices[0].message.content;
          } else if (provider === 'ollama') {
             const url = config.ollamaUrl || 'http://localhost:11434';
             const res = await fetch(`${url}/api/generate`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                    model: 'llama3', 
                    prompt: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt, 
                    stream: false,
                    format: isJson ? 'json' : undefined
                 })
             });
             if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
             const data: any = await res.json();
             return data.response;
          }
       } catch (e: any) {
          const msg = e.message || String(e);
          console.warn(`Provider ${provider} failed: ${msg}`);
          if (msg === "API_KEY_MISSING" && provider !== config.provider) continue;
          errors.push(`[${provider}]: ${msg}`);
       }
    }
    throw new Error(`AI Request Failed: ${errors.join(' | ')}`);
}

// AI Strategy Generation
app.post('/api/ai/strategy', async (req, res) => {
  const { userId, examCategory, durationDays, weakSubjects, aiConfig } = req.body;
  if (!process.env.GEMINI_API_KEY && !aiConfig?.geminiKey && !aiConfig?.openaiKey) {
    return res.status(500).json({ success: false, message: 'No AI configuration available.' });
  }

  try {
    const prompt = `Create a ${durationDays}-day study strategy for a student preparing for ${examCategory} exams in India. They are weak in: ${weakSubjects}.`;
    const system = `Provide a clear, JSON formatted response matching this structure: { "title": "...", "summary": "...", "schedule": [{ "phase": "Week 1", "focus": "Topics", "activities": ["..."] }] }`;

    const textResponse = await generateWithAI(prompt, aiConfig, system, true);
    let strategyJson;
    try { strategyJson = JSON.parse(textResponse); } catch(e) { throw new Error("AI returned invalid JSON formatting."); }
    
    // Ensure schedule is present
    if (!strategyJson.schedule) strategyJson.schedule = [];

    const newStrategy = {
      id: uuidv4(),
      userId,
      ...strategyJson,
      createdAt: new Date().toISOString()
    };
    strategies.push(newStrategy);

    res.json({ success: true, strategy: newStrategy });
  } catch (error: any) {
    console.error('AI Strategy Error:', error);
    res.status(500).json({ success: false, message: parseAIError(error) });
  }
});

app.get('/api/user/:id/strategies', (req, res) => {
  const { id } = req.params;
  const userStrategies = strategies.filter(s => s.userId === id);
  res.json(userStrategies);
});

// AI Mentor Chat
app.post('/api/ai/mentor-chat', async (req, res) => {
  const { userId, message, history, aiConfig } = req.body;
  if (!process.env.GEMINI_API_KEY && !aiConfig?.geminiKey && !aiConfig?.openaiKey) {
    return res.status(500).json({ success: false, message: 'No AI configuration available.' });
  }

  try {
    const user = users.find(u => u.id === userId);
    const context = `You are a strict but motivating personal coach for a student preparing for ${user?.examCategory || 'competitive'} exams in India. Keep answers concise, highly specific, and actionable. Do not give generic advice. Be direct. Use Markdown.`;
    
    const text = await generateWithAI(message, aiConfig, context, false, history);
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, message: parseAIError(error) });
  }
});

app.post('/api/ai/analyze-performance', async (req, res) => {
  const { userId, aiConfig } = req.body;
  if (!process.env.GEMINI_API_KEY && !aiConfig?.geminiKey && !aiConfig?.openaiKey) {
     const mockInsight = "You're spending too much time on Math. Focus on Reasoning speed.";
     return res.json({ success: true, analysis: { summary: mockInsight, strengths: ['General Knowledge'], weaknesses: ['Quantitative Aptitude Time'], actionableAdvice: ['Practice 20 min daily sectional test'] } });
  }
  
  try {
    const uTests = testResults.filter(r => r.userId === userId).slice(-3);
    const uLogs = progressLogs.filter(p => p.userId === userId).slice(-7);
    
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

    const textResponse = await generateWithAI(prompt, aiConfig, system, true);
    const analysis = JSON.parse(textResponse);
    res.json({ success: true, analysis });

  } catch (e: any) {
    res.status(500).json({ success: false, message: parseAIError(e) });
  }
});

// AI Note Generation
app.post('/api/ai/generate-notes', async (req, res) => {
  const { topic, aiConfig } = req.body;
  if (!process.env.GEMINI_API_KEY && !aiConfig?.geminiKey && !aiConfig?.openaiKey) {
     return res.json({ success: true, notes: { 
       title: `${topic} (Simulation)`, 
       content: `This is a simulated note for **${topic}** because Gemini API key is missing.\n\n### Key Formulas\n* Formula 1\n* Formula 2` 
     }});
  }
  
  try {
    const prompt = `Generate highly concise, exam-focused study notes on the topic: "${topic}". 
    Format the output in clean Markdown with headings, bullet points, and bold text. Start directly with the content. Ensure it includes key formulas or facts relevant to competitive exams in India. Do not return raw HTML, only Markdown.`;

    const markdownContent = await generateWithAI(prompt, aiConfig, undefined, false);
    res.json({ success: true, notes: { title: topic, content: markdownContent } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: parseAIError(e) });
  }
});

// AI Doubt Solver
app.post('/api/ai/solve-doubt', async (req, res) => {
  const { question, aiConfig } = req.body;
  if (!process.env.GEMINI_API_KEY && !aiConfig?.geminiKey && !aiConfig?.openaiKey) {
     return res.json({ success: true, solution: { 
       steps: ['Identify the given data.', 'Apply the work formula.', 'Calculate the remaining work.'],
       answer: 'Simulated Answer (API Missing)',
       relatedConcept: 'Time and Work'
     }});
  }
  
  try {
    const prompt = `Solve this question: "${question}"`;
    const system = `You are an expert tutor for competitive exams in India. Solve the user's question step-by-step.
    Output ONLY a valid JSON object matching this structure exactly:
    {
      "steps": ["Step 1 explanation", "Step 2 explanation"],
      "answer": "Final short absolute answer (e.g. '15 days')",
      "relatedConcept": "Name of the core topic being tested"
    }`;

    const textResponse = await generateWithAI(prompt, aiConfig, system, true);
    const solution = JSON.parse(textResponse);
    res.json({ success: true, solution });
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ success: false, message: parseAIError(e) });
  }
});

// ==========================================
// Vite Middleware / Static Serve
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
