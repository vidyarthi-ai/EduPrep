import { useState, useEffect } from 'react';
import { User, Todo } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { getTodos, addTodo as addLocalTodo, updateTodo, deleteTodo as deleteLocalTodo } from '../lib/api';

export default function StudyPlanner({ user }: { user: User }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDate, setFilterDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  
  // Edit State
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');

  const fetchTodos = () => {
    setTodos(getTodos(user.id));
  };

  useEffect(() => {
    fetchTodos();
  }, [user.id]);

  const uniqueDates = Array.from(new Set(todos.map(t => t.date))).sort().reverse();
  const filteredTodos = filterDate === 'All' 
    ? todos 
    : todos.filter(t => t.date === filterDate);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const data = addLocalTodo(user.id, newTodo, taskDate);
    setTodos([...todos, data]);
    setNewTodo('');
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const data = updateTodo(id, { completed: !completed });
    if (data) setTodos(todos.map(t => t.id === id ? data : t));
  };

  const deleteTodo = async (id: string) => {
    deleteLocalTodo(id);
    setTodos(todos.filter(t => t.id !== id));
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    const data = updateTodo(id, { text: editText, date: editDate });
    if (data) setTodos(todos.map(t => t.id === id ? data : t));
    setEditId(null);
  };

  const startEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
    setEditDate(todo.date);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Study Planner</h2>
        
        <form onSubmit={addTodo} className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            value={newTodo} 
            onChange={e => setNewTodo(e.target.value)} 
            placeholder="What needs to be studied?" 
            className="flex-1 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 bg-white text-gray-900"
          />
          <div className="flex relative md:w-48">
            <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input 
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              required
            />
          </div>
          <button type="submit" disabled={!newTodo.trim()} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center font-medium">
            <Plus className="h-5 w-5 mr-2" /> Add Task
          </button>
        </form>

        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
           <button 
             onClick={() => setFilterDate('All')}
             className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterDate === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
           >
             All Tasks
           </button>
           {uniqueDates.map(date => (
             <button 
               key={date}
               onClick={() => setFilterDate(date)}
               className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterDate === date ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
             </button>
           ))}
        </div>

        <div className="space-y-3 min-h-[200px]">
          {filteredTodos.length === 0 && (
             <p className="text-center text-gray-500 py-8">No tasks found for {filterDate === 'All' ? 'any date' : filterDate}.</p>
          )}
          {filteredTodos.map(todo => (
            <div key={todo.id} className={`flex max-sm:flex-col items-center justify-between p-4 rounded-lg border transition-colors ${todo.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              
              {editId === todo.id ? (
                 <div className="flex-1 flex gap-3 w-full">
                    <input 
                      type="text" 
                      value={editText} 
                      onChange={e => setEditText(e.target.value)} 
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={e => setEditDate(e.target.value)} 
                      className="w-32 rounded-md border border-gray-300 px-3 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => saveEdit(todo.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">
                         <Check className="h-5 w-5" />
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                         <X className="h-5 w-5" />
                      </button>
                    </div>
                 </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 cursor-pointer flex-1 w-full" onClick={() => toggleTodo(todo.id, todo.completed)}>
                    {todo.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-lg transition-colors break-words ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {todo.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 max-sm:w-full max-sm:mt-4 max-sm:justify-end">
                    {filterDate === 'All' && (
                      <span className="text-xs font-semibold mr-3 text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {todo.date}
                      </span>
                    )}
                    <button onClick={() => startEdit(todo)} className="text-gray-400 hover:text-indigo-600 p-2 transition-colors" title="Edit Task">
                       <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors" title="Delete Task">
                       <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
