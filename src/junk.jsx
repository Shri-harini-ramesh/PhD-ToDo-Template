import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Check, Trash2, RotateCcw, 
  Calendar, Menu, X, Clock, Folder, AlertCircle, Zap, Settings, Layout,
  CheckCircle2, Circle, ChevronUp, ChevronDown, Maximize2, Edit2, Move, 
  Image as ImageIcon, Send, ListChecks, Heart, Star, Coffee, BookOpen,
  Target, TrendingUp, Award, Sparkles, Flag, ArrowRight, Pause, Play
} from 'lucide-react';

// --- CONFIGURATION ---
const COLORS = [
  'lavender', 'rose', 'peach', 'mint', 'sky', 'lilac', 
  'coral', 'sage', 'blush', 'cream', 'powder', 'mauve'
];

const ICONS = ["✨", "📚", "☕", "🌸", "🎀", "💝", "🌷", "🦋", "🌙", "⭐", "💐", "🎨", "📖", "🌺", "🧸", "🎯", "💫", "🌻", "🍃", "🌈"];

const QUOTES = [
  { text: "Every small step is progress ✨", author: "You've got this!" },
  { text: "Your research matters 💫", author: "Keep going" },
  { text: "Be proud of your progress 🌸", author: "You're doing amazing" },
  { text: "Take breaks, stay kind to yourself ☕", author: "Self-care is productive" },
  { text: "Future Dr. [You] is so proud! 🎓", author: "Believe in yourself" },
];

// --- SOFT ACADEMIC COLOR SYSTEM ---
const CAT_STYLES = {
  lavender: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', accent: '#9333ea', light: 'bg-white', pill: 'bg-purple-100 text-purple-700', headerBg: 'bg-purple-100', headerText: 'text-purple-900', taskBorder: 'border-l-purple-600', bar: 'bg-purple-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', accent: '#e11d48', light: 'bg-white', pill: 'bg-rose-100 text-rose-700', headerBg: 'bg-rose-100', headerText: 'text-rose-900', taskBorder: 'border-l-rose-600', bar: 'bg-rose-600' },
  peach: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', accent: '#ea580c', light: 'bg-white', pill: 'bg-orange-100 text-orange-700', headerBg: 'bg-orange-100', headerText: 'text-orange-900', taskBorder: 'border-l-orange-600', bar: 'bg-orange-600' },
  mint: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', accent: '#10b981', light: 'bg-white', pill: 'bg-emerald-100 text-emerald-700', headerBg: 'bg-emerald-100', headerText: 'text-emerald-900', taskBorder: 'border-l-emerald-600', bar: 'bg-emerald-600' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', accent: '#0ea5e9', light: 'bg-white', pill: 'bg-sky-100 text-sky-700', headerBg: 'bg-sky-100', headerText: 'text-sky-900', taskBorder: 'border-l-sky-600', bar: 'bg-sky-600' },
  lilac: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', accent: '#7c3aed', light: 'bg-white', pill: 'bg-violet-100 text-violet-700', headerBg: 'bg-violet-100', headerText: 'text-violet-900', taskBorder: 'border-l-violet-600', bar: 'bg-violet-600' },
  coral: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', accent: '#ef4444', light: 'bg-white', pill: 'bg-red-100 text-red-700', headerBg: 'bg-red-100', headerText: 'text-red-900', taskBorder: 'border-l-red-600', bar: 'bg-red-600' },
  sage: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', accent: '#22c55e', light: 'bg-white', pill: 'bg-green-100 text-green-700', headerBg: 'bg-green-100', headerText: 'text-green-900', taskBorder: 'border-l-green-600', bar: 'bg-green-600' },
  blush: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900', accent: '#ec4899', light: 'bg-white', pill: 'bg-pink-100 text-pink-700', headerBg: 'bg-pink-100', headerText: 'text-pink-900', taskBorder: 'border-l-pink-600', bar: 'bg-pink-600' },
  cream: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', accent: '#f59e0b', light: 'bg-white', pill: 'bg-amber-100 text-amber-700', headerBg: 'bg-amber-100', headerText: 'text-amber-900', taskBorder: 'border-l-amber-600', bar: 'bg-amber-600' },
  powder: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', accent: '#3b82f6', light: 'bg-white', pill: 'bg-blue-100 text-blue-700', headerBg: 'bg-blue-100', headerText: 'text-blue-900', taskBorder: 'border-l-blue-600', bar: 'bg-blue-600' },
  mauve: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-900', accent: '#d946ef', light: 'bg-white', pill: 'bg-fuchsia-100 text-fuchsia-700', headerBg: 'bg-fuchsia-100', headerText: 'text-fuchsia-900', taskBorder: 'border-l-fuchsia-600', bar: 'bg-fuchsia-600' },
};

const parseLocalYMD = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// --- CONFETTI EFFECT ---
const triggerConfetti = (x, y) => {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = '6px';
    el.style.height = '6px';
    el.style.backgroundColor = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 5)];
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 10;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    el.animate([{ transform: 'translate(0, 0) scale(1)', opacity: 1 }, { transform: `translate(${dx * 20}px, ${dy * 20}px) scale(0)`, opacity: 0 }], { duration: 800 }).onfinish = () => el.remove();
  }
};

const MicroDonut = ({ total, done, color }) => {
  if (total === 0) return <div className="w-5 h-5 rounded-full border-2 border-slate-300 opacity-50"></div>;
  const percent = Math.round((done / total) * 100);
  const r = 9, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="12" cy="12" r={r} stroke="#e2e8f0" strokeWidth="3" fill="transparent" />
        <circle cx="12" cy="12" r={r} stroke={color} strokeWidth="3" fill="transparent" strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
    </div>
  );
};

export default function App() {
  const [weeks, setWeeks] = useState(() => JSON.parse(localStorage.getItem('phd-weeks-v53')) || [{ id: 'init', title: 'Week 1', start: new Date().toISOString(), categories: [] }]);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('phd-tasks-v53')) || []);
  const [activeWeekId, setActiveWeekId] = useState(weeks[0].id);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [focusModeCat, setFocusModeCat] = useState(null); 
  const [expandedTasks, setExpandedTasks] = useState({});
  const [celebrateTask, setCelebrateTask] = useState(null);
  const [showQuote, setShowQuote] = useState(true);
  const [currentQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [greeting, setGreeting] = useState('');
  
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState(''); 
  const [newPriority, setNewPriority] = useState('normal'); 
  const [selectedCat, setSelectedCat] = useState(''); 
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  
  const [taskToEdit, setTaskToEdit] = useState(null); 
  const [taskToMove, setTaskToMove] = useState(null);
  const [showBucketManager, setShowBucketManager] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('lavender');
  const [newBucketIcon, setNewBucketIcon] = useState('✨');
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [showWeekForm, setShowWeekForm] = useState(false);
  
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState('normal');
  const [newSubtaskDate, setNewSubtaskDate] = useState('');

  const inputRef = useRef(null);

  useEffect(() => { localStorage.setItem('phd-tasks-v53', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('phd-weeks-v53', JSON.stringify(weeks)); }, [weeks]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);
  useEffect(() => {
    function handleClickOutside(event) { if (inputRef.current && !inputRef.current.contains(event.target)) setIsInputExpanded(false); }
    document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputRef]);

  const activeWeekObj = weeks.find(w => w.id === activeWeekId) || weeks[0];
  const activeCategories = activeWeekObj.categories || [];
  const visibleTasks = tasks.filter(t => t.weekId === activeWeekId || (t.status === 'pending' && weeks.find(w=>w.id===t.weekId) && new Date(weeks.find(w=>w.id===t.weekId).start) < new Date(activeWeekObj.start)));
  const doneCount = visibleTasks.filter(t => t.status === 'done').length;
  const totalCount = visibleTasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const urgentCount = visibleTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const getTodayCompleted = () => tasks.filter(t => t.status === 'done' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;

  const addTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; if (activeCategories.length === 0) { setShowBucketManager(true); return; } if (!selectedCat) { alert("Please select a category 💝"); return; } setTasks([...tasks, { id: Date.now(), text: newTask, category: selectedCat, status: 'pending', weekId: activeWeekId, completedInWeek: null, deadline: newDeadline || null, priority: newPriority, subtasks: [], createdAt: new Date().toISOString() }]); setNewTask(''); setNewDeadline(''); setNewPriority('normal'); setIsInputExpanded(false); };
  const updateTask = (e) => { e.preventDefault(); setTasks(tasks.map(t => t.id === taskToEdit.id ? taskToEdit : t)); setTaskToEdit(null); };
  const toggleTask = (id, e) => { if (e?.target) { const r = e.target.getBoundingClientRect(); triggerConfetti(r.left+10, r.top+10); } const task = tasks.find(t => t.id === id); if (task && task.status === 'pending') { setCelebrateTask(id); setTimeout(() => setCelebrateTask(null), 2000); } setTasks(tasks.map(t => { if (t.id !== id) return t; return { ...t, status: t.status === 'pending' ? 'done' : 'pending', completedInWeek: activeWeekId }; })); };
  const toggleExpand = (taskId) => { setExpandedTasks(prev => ({...prev, [taskId]: !prev[taskId]})); };
  const addSubtaskToEdit = () => { if (!newSubtaskText.trim() || !taskToEdit) return; const newSub = { id: Date.now(), text: newSubtaskText, done: false, priority: newSubtaskPriority, deadline: newSubtaskDate || null }; setTaskToEdit({ ...taskToEdit, subtasks: [...(taskToEdit.subtasks || []), newSub] }); setNewSubtaskText(''); setNewSubtaskPriority('normal'); setNewSubtaskDate(''); };
  const checkSubtask = (taskId, subId) => { if (taskToEdit && taskToEdit.id === taskId) { setTaskToEdit({ ...taskToEdit, subtasks: taskToEdit.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }); } else { setTasks(tasks.map(t => { if (t.id !== taskId) return t; const updatedSubs = (t.subtasks || []).map(s => s.id === subId ? { ...s, done: !s.done } : s); return { ...t, subtasks: updatedSubs }; })); }};
  const deleteSubtask = (subId) => { if (!taskToEdit) return; setTaskToEdit({ ...taskToEdit, subtasks: taskToEdit.subtasks.filter(s => s.id !== subId) }); };
  const addWeek = (e) => { e.preventDefault(); setWeeks([...weeks, { id: Date.now().toString(), title: newWeekTitle, start: new Date().toISOString(), categories: [...activeCategories] }].sort((a, b) => new Date(b.start) - new Date(a.start))); setNewWeekTitle(''); setShowWeekForm(false); };
  const addBucket = (e) => { e.preventDefault(); if (!newBucketName.trim()) return; setWeeks(weeks.map(w => w.id === activeWeekId ? { ...w, categories: [...w.categories, { id: `cat-${Date.now()}`, label: newBucketName, color: newBucketColor, icon: newBucketIcon }] } : w)); setNewBucketName(''); setShowIconPicker(false); };
  const deleteBucket = (id) => { if(!confirm("Remove?")) setWeeks(weeks.map(w => w.id === activeWeekId ? { ...w, categories: w.categories.filter(c => c.id !== id) } : w)); };
  const moveTaskToBucket = (cId) => { if (taskToMove) setTasks(tasks.map(t => t.id === taskToMove.id ? { ...t, category: cId } : t)); setTaskToMove(null); };
  const moveTaskToWeek = (wId) => { if (taskToMove) setTasks(tasks.map(t => t.id === taskToMove.id ? { ...t, weekId: wId } : t)); setTaskToMove(null); };
  const getDeadlineInfo = (d) => { if (!d) return null; const diff = Math.ceil((parseLocalYMD(d) - new Date().setHours(0,0,0,0)) / 86400000); if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, bg: 'bg-rose-100 text-rose-700 border-rose-300', icon: true }; if (diff === 0) return { text: 'Today', bg: 'bg-amber-100 text-amber-700 border-amber-300', icon: true }; if (diff === 1) return { text: 'Tomorrow', bg: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: true }; if (diff <= 3) return { text: `${diff} days`, bg: 'bg-purple-100 text-purple-700 border-purple-300', icon: true }; return { text: new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'}), bg: 'bg-slate-100 text-slate-600 border-slate-300', icon: false }; };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 pb-32 relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .serif { font-family: 'Playfair Display', serif; }
        .celebrate { animation: celebrate 0.5s ease-out; }
        @keyframes celebrate { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      `}</style>

      {/* MOTIVATIONAL BANNER */}
      {showQuote && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-xl relative animate-in slide-in-from-top-4 fade-in duration-700">
            <button onClick={() => setShowQuote(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X size={16}/></button>
            <div className="flex items-start gap-3">
              <Sparkles className="text-indigo-400 flex-shrink-0 mt-1" size={20}/>
              <div><p className="text-slate-800 font-semibold text-sm leading-relaxed">{currentQuote.text}</p><p className="text-indigo-400 text-xs mt-1 font-medium">— {currentQuote.author}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {(taskToMove || taskToEdit || showBucketManager) && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden">
             <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{taskToMove ? "Move Task" : taskToEdit ? "Edit Task" : "Manage Lists"}</h3>
                <button onClick={() => {setTaskToMove(null); setTaskToEdit(null); setShowBucketManager(false)}}><X className="text-slate-400 hover:text-slate-800"/></button>
             </div>
             <div className="p-8 max-h-[70vh] overflow-y-auto">
                 {taskToMove && (
                   <div className="grid grid-cols-2 gap-8">
                      <div><h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Buckets</h4><div className="flex flex-col gap-2">{activeCategories.map(c => (<button key={c.id} onClick={() => moveTaskToBucket(c.id)} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 text-left flex items-center gap-3 bg-white hover:shadow-md transition-all"><span>{c.icon}</span> {c.label}</button>))}</div></div>
                      <div><h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Weeks</h4><div className="flex flex-col gap-2 max-h-60 overflow-y-auto">{weeks.map(w => (<button key={w.id} onClick={() => moveTaskToWeek(w.id)} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 text-left bg-white hover:shadow-md transition-all">{w.title}</button>))}</div></div>
                   </div>
                 )}
                 {taskToEdit && (
                   <div className="space-y-6">
                     <textarea className="w-full p-4 border border-slate-200 rounded-2xl text-lg font-medium outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" value={taskToEdit.text} onChange={e => setTaskToEdit({...taskToEdit, text: e.target.value})} />
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><ListChecks size={14}/> Subtasks</h4>
                        <div className="space-y-3 mb-4">{taskToEdit.subtasks?.map(sub => (<div key={sub.id} className="flex items-center gap-3 text-sm"><button onClick={() => checkSubtask(taskToEdit.id, sub.id)}>{sub.done?<CheckCircle2 size={18} className="text-indigo-600"/>:<Circle size={18} className="text-slate-300"/>}</button><span className={`flex-1 font-medium ${sub.done?'line-through text-slate-400':'text-slate-700'}`}>{sub.text}</span><button onClick={()=>deleteSubtask(sub.id)} className="text-slate-300 hover:text-red-500"><X size={16}/></button></div>))}</div>
                        <div className="flex gap-2"><input className="flex-1 p-3 border border-slate-200 rounded-xl bg-white outline-none" placeholder="Add step..." value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtaskToEdit()}/><button onClick={addSubtaskToEdit} className="px-4 bg-slate-800 text-white rounded-xl"><Plus size={18}/></button></div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Bucket</label><select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white" value={taskToEdit.category} onChange={e => setTaskToEdit({...taskToEdit, category: e.target.value})}>{activeCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Priority</label><select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white" value={taskToEdit.priority} onChange={e => setTaskToEdit({...taskToEdit, priority: e.target.value})}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></div>
                     </div>
                     <button onClick={updateTask} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors">Save Changes</button>
                   </div>
                 )}
                 {showBucketManager && (
                   <div className="grid md:grid-cols-2 gap-8">
                      <div><h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Active Lists</h4><div className="space-y-3">{activeCategories.map(c => (<div key={c.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-slate-50"><span className="font-bold text-slate-700">{c.icon} {c.label}</span><button onClick={() => deleteBucket(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>))}</div></div>
                      <div><h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Create New</h4><form onSubmit={addBucket} className="space-y-4"><div className="flex gap-3 mb-6"><button onClick={() => setShowIconPicker(!showIconPicker)} className="w-14 h-14 border border-slate-300 rounded-xl text-2xl flex items-center justify-center bg-white">{newBucketIcon}</button><input className="flex-1 border border-slate-300 rounded-xl px-4 outline-none focus:border-indigo-500" placeholder="Name..." value={newBucketName} onChange={e => setNewBucketName(e.target.value)}/></div>{showIconPicker&&<div className="grid grid-cols-5 gap-2 mb-4 bg-slate-50 p-4 rounded-xl">{ICONS.map(i=><button key={i} onClick={()=>{setNewBucketIcon(i);setShowIconPicker(false)}} className="p-2 hover:bg-white rounded-lg text-xl transition-all">{i}</button>)}</div>}<div className="grid grid-cols-6 gap-3 mb-6">{COLORS.map(c=><button key={c} onClick={()=>setNewBucketColor(c)} className={`w-8 h-8 rounded-full ${CAT_STYLES[c].headerBg} ${newBucketColor===c?'ring-2 ring-offset-2 ring-slate-400':''}`}/>)}</div><button onClick={addBucket} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Create List</button></form></div>
                   </div>
                 )}
             </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 z-40 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-8 border-b border-slate-100">
           <div className="flex items-center gap-3 serif font-bold text-2xl tracking-tight text-slate-800">
             <BookOpen size={24} className="text-indigo-600"/> PhD.OS
           </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
           <div className="flex justify-between items-center mb-2 px-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline</span><button onClick={()=>setShowWeekForm(!showWeekForm)}><Plus size={16} className="text-slate-400 hover:text-slate-900"/></button></div>
           {showWeekForm && <form onSubmit={addWeek} className="mb-2"><input autoFocus placeholder="New week..." className="w-full p-2.5 text-sm border-2 border-slate-200 rounded-lg outline-none bg-white" value={newWeekTitle} onChange={e => setNewWeekTitle(e.target.value)}/></form>}
           {weeks.map(week => (<button key={week.id} onClick={() => setActiveWeekId(week.id)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeWeekId === week.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>{week.title}</button>))}
        </div>
        <div className="p-6 border-t border-slate-100"><button onClick={() => setShowBucketManager(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"><Settings size={14}/> Settings</button></div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'} relative z-10 flex flex-col h-screen`}>
        
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-6 sticky top-0 z-30 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-800"><Menu size={24}/></button>
              <div>
                 <h2 className="serif text-3xl font-bold text-slate-900">{activeWeekObj.title}</h2>
                 <p className="text-sm text-slate-500 font-medium mt-1">{greeting}!</p>
              </div>
           </div>

           {/* INSIGHTS - CLEAN DASHBOARD */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              
              {/* Metric 1: Weekly Progress */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest">Completion</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Target size={18}/>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-3xl font-black text-slate-800 tabular-nums">
                    {Math.round((doneCount / (totalCount || 1)) * 100)}%
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {doneCount}/{totalCount}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]" 
                    style={{width: `${totalCount === 0 ? 0 : (doneCount / totalCount) * 100}%`}}
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400">
                  <ArrowRight size={14}/>
                </div>
              </div>

              {/* Metric 2: Today's Focus */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 group cursor-default relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest">Today</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Sparkles size={18}/>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 tabular-nums">{getTodayCompleted()}</span>
                  <span className="text-xs font-bold text-slate-400">finished</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-700 mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-md border border-emerald-100">
                   {getTodayCompleted() === 0 ? "Ready to start?" : "Great momentum!"}
                </p>
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-emerald-400">
                  <ArrowRight size={14}/>
                </div>
              </div>

              {/* Metric 3: Urgent / Priority */}
              <div className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default relative`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-extrabold uppercase tracking-widest ${urgentCount > 0 ? 'text-rose-600' : 'text-amber-600'}`}>Attention</span>
                  <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${urgentCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {urgentCount > 0 ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 tabular-nums">{urgentCount}</span>
                  <span className={`text-xs font-bold ${urgentCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>urgent</span>
                </div>
                <p className={`text-[10px] font-bold mt-2 inline-block px-2 py-0.5 rounded-md border transition-all duration-300 ${urgentCount > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                   {urgentCount === 0 ? 'All clear' : 'Needs focus'}
                </p>
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-400">
                  <ArrowRight size={14}/>
                </div>
              </div>
           </div>
        </header>

        {/* BOARD */}
        <div className="p-10 pb-40">
           <div className={`grid gap-6 ${focusModeCat ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {activeCategories.filter(c => focusModeCat ? c.id === focusModeCat : true).map(cat => {
                const categoryTasks = visibleTasks.filter(t => t.category === cat.id);
                const doneInCat = categoryTasks.filter(t => t.status === 'done').length;
                const style = CAT_STYLES[cat.color] || CAT_STYLES.lavender;
                
                return (
                  // CONTAINER: Grayish Background, No Border
                  <div key={cat.id} className={`p-6 rounded-3xl transition-all soft-shadow ${style.bg}`}>
                     {/* Header */}
                     <div className={`p-4 rounded-t-2xl flex items-center justify-between ${style.headerBg} ${style.headerText}`}>
                        <div className="flex items-center gap-3 flex-1">
                           <span className="text-2xl">{cat.icon}</span>
                           <h3 className="font-bold text-lg">{cat.label}</h3>
                        </div>
                        
                        {/* Progress Bar & Actions (Inline) */}
                        <div className="flex items-center gap-3 w-1/2 justify-end">
                           <HeaderProgress total={categoryTasks.length} done={doneInCat} color={style.bar} />
                           <div className="flex gap-1">
                              <button onClick={() => setFocusModeCat(focusModeCat === cat.id ? null : cat.id)} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors opacity-60 hover:opacity-100"><Maximize2 size={14}/></button>
                              <button onClick={() => deleteBucket(cat.id)} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors opacity-60 hover:opacity-100 hover:text-red-600"><Trash2 size={14}/></button>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1 pt-3">
                        {categoryTasks.length === 0 && (<div className="py-16 flex flex-col items-center justify-center text-slate-400 opacity-60"><Coffee size={48} strokeWidth={1.5} className="mb-3 opacity-50"/><p className="text-sm font-semibold">All clear! ✨</p></div>)}
                        {categoryTasks.map(task => {
                           const dateInfo = getDeadlineInfo(task.deadline);
                           const isExpanded = expandedTasks[task.id];
                           const completedSubs = (task.subtasks || []).filter(s => s.done).length;
                           const totalSubs = (task.subtasks || []).length;
                           const isCelebrating = celebrateTask === task.id;
                           
                           return (
                              <div key={task.id} className={`group bg-white p-4 rounded-xl border-l-4 ${style.taskBorder} shadow-sm hover:shadow-lg transition-all duration-300 ${task.status === 'done' ? 'opacity-60' : 'hover:-translate-y-1'} ${isCelebrating ? 'celebrate' : ''}`}>
                                 <div className="flex items-start gap-3">
                                    <button onClick={(e) => toggleTask(task.id, e)} className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-all flex-shrink-0 hover:scale-110">
                                       {task.status === 'done' ? <CheckCircle2 size={24} className="text-indigo-600 fill-indigo-100"/> : <Circle size={24}/>}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-start gap-2">
                                          <p className={`font-semibold leading-snug text-slate-800 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`} style={{fontSize: '15px'}}>{task.text}</p>
                                          {totalSubs > 0 && (<button onClick={() => toggleExpand(task.id)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded flex-shrink-0">{isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>)}
                                       </div>
                                       <div className={`flex flex-wrap gap-1.5 transition-all ${task.status === 'done' ? 'mt-0 h-0 overflow-hidden opacity-0' : 'mt-2 h-auto opacity-100'}`}>
                                          {totalSubs > 0 && <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${completedSubs === totalSubs ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}><ListChecks size={10}/> {completedSubs}/{totalSubs}</span>}
                                          {task.priority !== 'normal' && <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${task.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>{task.priority === 'urgent' ? <Zap size={10}/> : <Star size={10}/>} {task.priority}</span>}
                                          {dateInfo && <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${dateInfo.bg}`}>{dateInfo.icon && <Clock size={10}/>} {dateInfo.text}</span>}
                                       </div>
                                       {isExpanded && task.subtasks && (<div className="mt-3 pt-3 border-t border-slate-200"><div className="space-y-1.5">{task.subtasks.map(sub => (<div key={sub.id} className="flex items-start gap-2.5 p-1.5 hover:bg-slate-50 rounded transition-all"><button onClick={() => checkSubtask(task.id, sub.id)} className={`mt-0.5 flex-shrink-0 transition-all ${sub.done ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}>{sub.done ? <CheckCircle2 size={14}/> : <Circle size={14}/>}</button><span className={`flex-1 text-sm font-medium ${sub.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{sub.text}</span></div>))}</div></div>)}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-100 shadow-sm">
                                       <button onClick={() => setTaskToMove(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Move size={14}/></button>
                                       <button onClick={() => setTaskToEdit(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14}/></button>
                                       <button onClick={() => {if(confirm('Delete?')) setTasks(tasks.filter(t=>t.id!==task.id))}} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               );
             })}

             {!focusModeCat && (
               <button onClick={() => setShowBucketManager(true)} className="flex-shrink-0 w-[300px] h-80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all opacity-60 hover:opacity-100">
                  <Folder size={40} strokeWidth={1.5}/> 
                  <span className="font-bold text-sm uppercase tracking-widest">New List</span>
               </button>
             )}
           </div>
        </div>