import React, { useState, useEffect, useRef } from 'react';

// UI Components: Using Lucide for consistent, lightweight vector icons.
// We import a broad set to cover research, admin, and writing contexts.
import { 
  Activity, RotateCcw, Brain, Coffee, Target, Sparkles, Layers,
  Plus, Check, Trash2, Calendar, Menu, X, Clock, Folder, 
  AlertCircle, Zap, Settings, CheckCircle2, Circle, ChevronUp, 
  ChevronDown, Maximize2, Edit2, Move, ListChecks, 
  Heart, Star, BookOpen, ArrowRight, TrendingUp, Award,
  Lightbulb, Flame, Trophy, Smile, Zap as Lightning,
  FileText, AlignLeft, Flag, AlertTriangle, Link as LinkIcon, LogOut, Lock, Users, ExternalLink
} from 'lucide-react';

// Backend: Firestore integration.
// Using modular SDK imports to allow tree-shaking and reduce bundle size.
import { db } from './firebase'; 
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, setDoc 
} from 'firebase/firestore';

/* * --- APP CONFIGURATION ---
 * Centralized constants for UI consistency. Modifying these objects 
 * automatically updates styles across the entire dashboard.
 */

// Emoji picker options for category avatars.
const ICONS = ["📚", "🔬", "💻", "📊", "🧬", "⚗️", "📖", "✍️", "🎓", "💡", "🔍", "📈", "🧪", "📝", "🎯", "⭐", "🌟", "💫", "✨", "🏆"];

// Cognitive Load Mapping:
// We map specific Tailwind classes to energy levels to give visual cues 
// about the mental effort required for a task.
const FOCUS_LEVELS = {
  deep: { 
    label: "Deep Focus", 
    icon: <Brain size={16} />, 
    style: "bg-violet-100 text-violet-700 border-violet-200", // Card badge style
    text: "text-violet-700", 
    bg: "bg-violet-50", 
    fill: "bg-violet-200" // Progress bar fill
  },
  focus: { 
    label: "Focus", 
    icon: <Zap size={16} />, 
    style: "bg-blue-50 text-blue-600 border-blue-200", 
    text: "text-blue-600", 
    bg: "bg-blue-50", 
    fill: "bg-blue-200" 
  },
  chill: { 
    label: "Chill", 
    icon: <Coffee size={16} />, 
    style: "bg-slate-100 text-slate-600 border-slate-200", 
    text: "text-slate-600", 
    bg: "bg-slate-50", 
    fill: "bg-slate-200" 
  }
};

// Priority Tiers: Used for sorting and visual flagging.
const PRIORITY_LEVELS = {
  urgent: { 
    label: "Urgent", 
    icon: <AlertCircle size={16} />, 
    style: "bg-rose-50 text-rose-600 border-rose-200 ring-rose-100" 
  },
  important: { 
    label: "Important", 
    icon: <Star size={16} />, 
    style: "bg-amber-50 text-amber-600 border-amber-200 ring-amber-100" 
  },
  normal: { 
    label: "Normal", 
    icon: <Circle size={16} />, 
    style: "bg-slate-50 text-slate-600 border-slate-200 ring-slate-100" 
  }
};

// Category Theme Engine:
// 'headerBg' handles the main container top, 'bar' handles the progress indicator.
const CAT_STYLES = {
  slate:   { headerBg: 'bg-slate-200', headerText: 'text-slate-900', taskBorder: 'border-l-slate-500', bar: 'bg-slate-500' },
  rose:    { headerBg: 'bg-rose-200',  headerText: 'text-rose-900',  taskBorder: 'border-l-rose-500',  bar: 'bg-rose-500' },
  orange:  { headerBg: 'bg-orange-200',headerText: 'text-orange-900',taskBorder: 'border-l-orange-500',bar: 'bg-orange-500' },
  amber:   { headerBg: 'bg-amber-200', headerText: 'text-amber-900', taskBorder: 'border-l-amber-500', bar: 'bg-amber-600' },
  emerald: { headerBg: 'bg-emerald-200',headerText: 'text-emerald-900',taskBorder: 'border-l-emerald-600',bar: 'bg-emerald-600' },
  cyan:    { headerBg: 'bg-cyan-100',  headerText: 'text-cyan-900',  taskBorder: 'border-l-cyan-600',  bar: 'bg-cyan-600' },
  blue:    { headerBg: 'bg-blue-200',  headerText: 'text-blue-900',  taskBorder: 'border-l-blue-600',  bar: 'bg-blue-600' },
  indigo:  { headerBg: 'bg-indigo-200',headerText: 'text-indigo-900',taskBorder: 'border-l-indigo-600',bar: 'bg-indigo-600' },
  violet:  { headerBg: 'bg-violet-200',headerText: 'text-violet-900',taskBorder: 'border-l-violet-600',bar: 'bg-violet-600' },
};

/* * --- UTILITY FUNCTIONS ---
 * Helper logic separated from the component tree to keep the render loop clean.
 */

// Date Parser:
// We parse "YYYY-MM-DD" manually to avoid JavaScript's default UTC behavior.
// Standard `new Date("2023-01-01")` assumes UTC, which often results in the 
// date showing as "Dec 31" in Western timezones. This forces Local Midnight.
const parseLocalYMD = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Micro-Interaction Engine:
// Generates a lightweight particle explosion at a specific X/Y coordinate.
// Implementation Note: We use direct DOM manipulation + Web Animations API 
// instead of React State here. React is too slow for tracking 30+ particles 
// simultaneously, and this "fire-and-forget" approach prevents re-renders.
const triggerConfetti = (x, y) => {
  const count = 30;
  const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    
    // Fixed positioning relative to viewport ensures confetti works inside scrolling containers
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = '8px';
    el.style.height = '8px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none'; // Critical: allows clicks to pass through particles
    el.style.zIndex = '9999';
    document.body.appendChild(el);

    // Physics simulation
    const angle = Math.random() * Math.PI * 2;
    const velocity = 8 + Math.random() * 12;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    // Animation cleanup: Remove element immediately after animation ends to prevent memory leaks
    el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 25}px, ${dy * 25 + 40}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }).onfinish = () => el.remove();
  }
};

export default function App() {
  // --- AUTHENTICATION STATE ---
  // Simple client-side gatekeeping. 
  // NOTE: This is not server-side security. It prevents casual access on a shared device.
  // const SECRET_PIN = "0110"; // <--- Change this to your desired PIN
  const SECRET_PIN = import.meta.env.VITE_SECRET_PIN || "0000";
  
  // Security Default: Always start as Locked (false) to ensure privacy on refresh.
  // We explicitly do not use localStorage here to force re-login on every visit.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState(false);

  // --- DATA LAYER ---
  // Core application data synced via Firestore listeners.
  // 'weeks' acts as the container/folder structure.
  // 'tasks' contains the actual items, linked via weekId.
  const [weeks, setWeeks] = useState([{ id: 'init', title: 'Week 1', start: new Date().toISOString(), categories: [] }]);
  const [tasks, setTasks] = useState([]);
  
  // --- UI VIEW STATE ---
  // Controls navigation and layout visibility
  const [activeWeekId, setActiveWeekId] = useState('init');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [focusModeCat, setFocusModeCat] = useState(null); // If set, isolates one category view
  
  // Local UI tracking (Accordion state, animations)
  const [expandedTasks, setExpandedTasks] = useState({});
  const [celebrateTask, setCelebrateTask] = useState(null);
  
  // --- FORM & MODAL STATE ---
  // Temporary state for inputs before they are committed to the database.
  const [taskToEdit, setTaskToEdit] = useState(null); 
  const [taskToMove, setTaskToMove] = useState(null);
  const [showBucketManager, setShowBucketManager] = useState(false);
  
  // Category Creator
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('indigo');
  const [newBucketIcon, setNewBucketIcon] = useState('📚');
  
  // Timeline Creator
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [showWeekForm, setShowWeekForm] = useState(false);
  
  // Quick-Add Subtask Input
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // --- DATABASE SYNCHRONIZATION (REAL-TIME) ---
  // We use Firestore `onSnapshot` listeners to create a live connection.
  // Any change in the DB (from this device or another) instantly reflects in the UI.
  useEffect(() => {
    
    // 1. Task Stream Listener
    // Subscribes to the 'tasks' collection.
    // Ordered by creation time to maintain chronological history.
    const q = query(collection(db, "tasks"), orderBy("createdAt", "asc"));
    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(loadedTasks);
    });

    // 2. Week Configuration Listener
    // Subscribes to the 'weeks' collection which holds our container structure.
    const weeksCollection = collection(db, "weeks");
    const unsubscribeWeeks = onSnapshot(weeksCollection, (snapshot) => {
      if (!snapshot.empty) {
        // Data exists: parse and format.
        const loadedWeeks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        // CLIENT-SIDE SORTING:
        // We enforce Descending Order (b - a) so the newest week always appears 
        // at the top of the Sidebar list.
        loadedWeeks.sort((a,b) => new Date(b.start) - new Date(a.start));
        
        setWeeks(loadedWeeks);
        
        // STATE SYNCHRONIZATION:
        // If the app is currently looking at the placeholder 'init' state, 
        // but real data has loaded, we snap the view to the most relevant week.
        if(activeWeekId === 'init' && loadedWeeks.length > 0) {
            const hasInit = loadedWeeks.find(w => w.id === 'init');
            // Prefer keeping 'init' if it exists in DB, otherwise default to the newest week.
            setActiveWeekId(hasInit ? 'init' : loadedWeeks[0].id);
        }
      } else {
        // AUTO-BOOTSTRAP:
        // If the database is completely empty (first run), we automatically 
        // create the "Week 1" document so the user isn't staring at a blank screen.
        setDoc(doc(db, "weeks", "init"), { 
            title: 'Week 1', 
            start: new Date().toISOString(), 
            categories: [] 
        });
      }
    });

    // CLEANUP:
    // React requires us to unsubscribe from listeners when the component unmounts
    // to prevent memory leaks and unnecessary network usage.
    return () => {
        unsubscribeTasks();
        unsubscribeWeeks();
    };
  }, []);

  // --- DERIVED STATE & DATA FILTERING ---
  // Calculating these on the fly ensures the UI is always perfectly in sync with the database state.
  
  // Identify the currently selected workspace (Week)
  const activeWeekObj = weeks.find(w => w.id === activeWeekId) || weeks[0] || {id: 'temp', categories: []};
  const activeCategories = activeWeekObj.categories || [];

  // MASTER FILTERING LOGIC:
  // This is the brain of the "Rollover" system. A task is visible IF:
  // 1. It was created in this week (Standard).
  // 2. It was created in a PAST week but is still 'pending' (Rollover).
  // 3. It was completed IN this week, even if created earlier (Historical Record).
  const visibleTasks = tasks.filter(t => {
    const isCreatedHere = t.weekId === activeWeekId;
    const taskWeek = weeks.find(w => w.id === t.weekId);
    
    // Safety check: Ensure dates exist before comparing timestamps to avoid NaNs
    const isPendingRollover = t.status === 'pending' && taskWeek && activeWeekObj.start && taskWeek.start && new Date(taskWeek.start) < new Date(activeWeekObj.start);
    const isCompletedHere = t.completedInWeek === activeWeekId;
    
    return isCreatedHere || isPendingRollover || isCompletedHere;
  });

  // KPI METRICS (Calculated from visible tasks)
  const doneCount = visibleTasks.filter(t => t.status === 'done').length;
  const totalCount = visibleTasks.length;
  // Urgent tasks are flagged regardless of week to prevent missing deadlines
  const urgentCount = visibleTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;

  const getTodayCompleted = () => {
    const today = new Date().toDateString();
    // Count tasks completed strictly today for the "Daily Velocity" metric
    return tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  };

  // --- ACTIONS (Async Database Calls) ---

  const openNewTaskModal = () => {
    setTaskToEdit({
      id: null, 
      text: '',
      // Smart Default: Pre-select the first available bucket to reduce clicks
      category: activeCategories.length > 0 ? activeCategories[0].id : '',
      priority: 'normal',
      focusLevel: 'chill',
      deadline: '',
      notes: '',
      subtasks: []
    });
  };

  const handleSaveTask = async () => {
    if (!taskToEdit || !taskToEdit.text.trim()) return;

    if (taskToEdit.id) {
      // UPDATE EXISTING TASK
      const taskRef = doc(db, "tasks", taskToEdit.id);
      const { id, ...updateData } = taskToEdit; // Sanitize: Remove ID from payload to prevent duplication
      await updateDoc(taskRef, updateData);
    } else {
      // CREATE NEW TASK
      const newTaskObj = {
        ...taskToEdit,
        weekId: activeWeekId,
        status: 'pending',
        completedInWeek: null,
        createdAt: new Date().toISOString()
      };
      delete newTaskObj.id; // Allow Firestore to generate the ID
      await addDoc(collection(db, "tasks"), newTaskObj);
    }
    setTaskToEdit(null);
    // Micro-interaction: Confetti 
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
  };

  const toggleTask = async (id, e) => { 
    // COORDINATE CONFETTI: Originates exactly from the clicked checkbox position
    if (e && e.target) {
      const rect = e.target.getBoundingClientRect();
      triggerConfetti(rect.left + 13, rect.top + 13);
    }
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isNowDone = task.status === 'pending';
    
    // Trigger CSS animation for "Celebrate" effect (scale/shake)
    if (isNowDone) {
      setCelebrateTask(id);
      setTimeout(() => setCelebrateTask(null), 600);
    }

    // Update Status + Record Completion Timestamp for analytics
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, {
        status: isNowDone ? 'done' : 'pending',
        completedInWeek: isNowDone ? activeWeekId : null,
        completedAt: isNowDone ? new Date().toISOString() : null
    });
  };

  // Subtask Handlers (Nested Logic)
  const toggleExpand = (taskId) => { setExpandedTasks(prev => ({...prev, [taskId]: !prev[taskId]})); };

  const addSubtaskToEdit = () => {
    if (!newSubtaskText.trim() || !taskToEdit) return;
    const newSub = { id: Date.now(), text: newSubtaskText, done: false };
    setTaskToEdit({ ...taskToEdit, subtasks: [...(taskToEdit.subtasks || []), newSub] });
    setNewSubtaskText('');
  };
  
  const checkSubtask = async (taskId, subId) => {
    // Branching Logic: Are we in the Modal (Local Draft) or the Card (Live DB)?
    if (taskToEdit && taskToEdit.id === taskId) {
      // Local Update (in-memory only)
      setTaskToEdit({ ...taskToEdit, subtasks: taskToEdit.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) });
    } else {
      // Direct Database Update
      const task = tasks.find(t => t.id === taskId);
      if(!task) return;
      const updatedSubs = (task.subtasks || []).map(s => s.id === subId ? { ...s, done: !s.done } : s); 
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { subtasks: updatedSubs });
    }
  };

  const deleteSubtask = (subId) => {
    if (!taskToEdit) return;
    setTaskToEdit({ ...taskToEdit, subtasks: taskToEdit.subtasks.filter(s => s.id !== subId) });
  };

  // Timeline & Category Management
  const addWeek = async (e) => { 
    e.preventDefault(); 
    const newWeek = { 
        title: newWeekTitle, 
        start: new Date().toISOString(), 
        categories: [...activeCategories] 
    }; 
    
    // Optimistic UI: Update local state before DB confirms so the app feels instant
    setWeeks([newWeek, ...weeks]);
    
    await addDoc(collection(db, "weeks"), newWeek);
    
    // Cleanup form
    setNewWeekTitle(''); 
    setShowWeekForm(false); 
  };

  // --- DELETE WEEK LOGIC ---
  const deleteWeek = async (weekId, e) => {
    e.stopPropagation(); // Prevent "Opening" the week while trying to "Delete" it
    if (!confirm("Are you sure you want to delete this week?")) return;

    // 1. Delete from Firebase
    await deleteDoc(doc(db, "weeks", weekId));

    // 2. Navigation Safety: If we deleted the active week, switch to a safe fallback
    if (activeWeekId === weekId) {
        const remainingWeeks = weeks.filter(w => w.id !== weekId);
        if (remainingWeeks.length > 0) {
            setActiveWeekId(remainingWeeks[0].id);
        } else {
            // Hard reset if no weeks remain (triggers auto-init listener)
            window.location.reload(); 
        }
    }
  };

  const addBucket = async (e) => { 
    e.preventDefault(); 
    if (!newBucketName.trim()) return; 
    const newBucket = { id: `cat-${Date.now()}`, label: newBucketName, color: newBucketColor, icon: newBucketIcon }; 
    
    // Logic: Handle both the 'init' dummy week and normal database weeks
    if(activeWeekId !== 'init') {
        const weekRef = doc(db, "weeks", activeWeekId);
        const updatedCategories = [...activeCategories, newBucket];
        await updateDoc(weekRef, { categories: updatedCategories });
    } else {
        // Fallback for init if manually managed
        const weekRef = doc(db, "weeks", "init");
        const updatedCategories = [...activeCategories, newBucket];
        await setDoc(weekRef, { categories: updatedCategories }, { merge: true });
    }

    setNewBucketName(''); setShowIconPicker(false); 
  };
  
  // --- ORGANIZATION ACTIONS ---

  const deleteBucket = async (bucketId) => { 
    if(!confirm("Remove this category?")) return; 
    
    // We update the 'week' document, not the 'tasks' collection.
    // Tasks associated with this bucket remain in the DB but become "Uncategorized" visually.
    const weekRef = doc(db, "weeks", activeWeekId);
    const updatedCategories = activeCategories.filter(c => c.id !== bucketId);
    await updateDoc(weekRef, { categories: updatedCategories });
  };
  
  // Drag-and-Drop Logic:
  // Instead of complex dnd libraries, we use a simple "Click-to-Move" modal interaction.
  // We simply update the foreign key (weekId or categoryId) on the task document.
  const moveTaskToWeek = async (weekId) => { 
      if (taskToMove) { 
          const taskRef = doc(db, "tasks", taskToMove.id);
          await updateDoc(taskRef, { weekId: weekId });
          setTaskToMove(null); 
      }
  };
  
  const moveTaskToBucket = async (catId) => { 
      if (taskToMove) { 
          const taskRef = doc(db, "tasks", taskToMove.id);
          await updateDoc(taskRef, { category: catId });
          setTaskToMove(null); 
      }
  };

  const handleDeleteTask = async (taskId) => {
      // Destructive action: Requires confirmation to prevent accidental data loss.
      if(confirm('Delete?')) {
          await deleteDoc(doc(db, "tasks", taskId));
      }
  };

  // --- DAILY WISDOM ENGINE ---
  const [quote, setQuote] = useState({ text: "Research is seeing what everybody else has seen and thinking what nobody else has thought.", author: "Albert Szent-Györgyi" });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const fetchQuote = async () => {
    setIsLoadingQuote(true);
    try {
      // Using DummyJSON API for reliable, free quotes.
      const res = await fetch("https://dummyjson.com/quotes/random");
      const data = await res.json();
      
      if (data.quote) {
        setQuote({ text: data.quote, author: data.author });
      }
    } catch (error) {
      // Fallback Strategy:
      // If the API fails (offline/rate-limit), load from a local curated list of scientific quotes.
      const backups = [
        { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
        { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
        { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
        { text: "Research is formalized curiosity. It is poking and prying with a purpose.", author: "Zora Neale Hurston" },
        { text: "If we knew what we were doing, it would not be called research.", author: "Albert Einstein" }
      ];
      setQuote(backups[Math.floor(Math.random() * backups.length)]);
    }
    setIsLoadingQuote(false);
  };

  // Trigger quote fetch once on component mount.
  useEffect(() => { fetchQuote(); }, []);

  // --- UTILITY HELPERS ---

  // Deadline Calculation Logic:
  // Converts "2023-10-05" string into a relative human-readable badge (e.g., "2 days left").
  // Critical: Uses Local Time (not UTC) to ensure "Today" means "Today in my timezone".
  const getDeadlineInfo = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const target = parseLocalYMD(dateStr); 
    if(!target) return null;
    
    target.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Status Logic: Returns both display text and Tailwind color classes.
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, bg: 'bg-red-100 text-red-700 border-red-300', icon: true };
    if (diffDays === 0) return { text: 'Due Today', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: true };
    if (diffDays === 1) return { text: 'Tomorrow', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: true };
    if (diffDays <= 3) return { text: `${diffDays} days`, bg: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: true };
    
    // Default: Just show the date (e.g., "Oct 12")
    return { text: target.toLocaleDateString(undefined, {month:'short', day:'numeric'}), bg: 'bg-slate-100 text-slate-600 border-slate-300', icon: false };
  };

  // --- AUTHENTICATION HANDLERS ---
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPin === SECRET_PIN) {
      setIsAuthenticated(true);
      // NOTE: We deliberately do NOT save to localStorage. 
      // This forces a re-login every time the page refreshes for maximum privacy.
    } else {
      setError(true);
      setInputPin("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setInputPin(""); // Security: Clear the PIN from memory so "Unlock" isn't pre-filled.
    setError(false); 
  };

  // --- STATIC CONFIGURATION (Quick Links) ---
  // These links appear in the top-right header toolbar.
  const QUICK_LINKS = [
    { 
      label: "Daily Notes", 
      icon: <FileText size={18}/>, 
      url: "https://docs.google.com/document/u/0/", 
      style: "text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
    },
    { 
      label: "PhD Moments", 
      icon: <Heart size={18}/>, 
      url: "https://docs.google.com/document/u/0/", 
      style: "text-rose-600 hover:bg-rose-50 hover:text-rose-700" 
    },
    { 
      label: "Meeting Notes", 
      icon: <Users size={18}/>, 
      url: "https://teams.microsoft.com/", 
      style: "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700" 
    }
  ];
/// --- LOCK SCREEN UI ---
  // A client-side security gate. It renders a PIN entry form and blocks 
  // access to the main dashboard until the correct code is entered.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
            <Brain size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Shri's ToDo</h2>
          <p className="text-sm text-slate-400 mb-6">Enter your access code</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                </div>
                <input 
                  autoFocus
                  type="password" 
                  autoComplete="off" // Prevents browser caching for security
                  name="pin"
                  className="w-full pl-12 pr-4 py-4 text-center text-3xl font-black tracking-[0.5em] border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-200 text-slate-800"
                  placeholder="••••"
                  maxLength={4}
                  value={inputPin}
                  onChange={e => setInputPin(e.target.value)}
                />
            </div>
            
            {error && (
                <div className="flex items-center justify-center gap-2 text-rose-500 animate-bounce">
                    <AlertCircle size={16}/>
                    <p className="text-sm font-bold">Incorrect Access Code</p>
                </div>
            )}

            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP SHELL ---
  // Renders the main dashboard layout if authenticated.
  // Includes global styles for custom fonts and 'celebrate' animations.
  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 pb-32 relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .celebrate { animation: celebrate 0.5s ease-out; }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-3deg); }
          75% { transform: scale(1.1) rotate(3deg); }
        }
      `}</style>

      {/* --- MODAL: ORGANIZE TASK --- */}
      {/* Allows moving a task to a different Category or Timeline Week without drag-and-drop. */}
      {taskToMove && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
             <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Move size={20}/></div>
                   <h3 className="font-bold text-xl text-slate-800 tracking-tight">Organize Task</h3>
                </div>
                <button onClick={() => setTaskToMove(null)} className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20}/></button>
             </div>
             <div className="p-8 space-y-8 bg-white">
                
                {/* 1. Category Selection Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Category</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {activeCategories.map(cat => {
                      const style = CAT_STYLES[cat.color] || CAT_STYLES.indigo;
                      const isSelected = cat.id === taskToMove.category;
                      return (
                        <button key={cat.id} onClick={() => moveTaskToBucket(cat.id)} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${isSelected ? `${style.taskBorder} bg-slate-50 shadow-sm border-indigo-100` : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                          <span className="text-2xl">{cat.icon}</span> 
                          <span className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{cat.label}</span>
                          {isSelected && <CheckCircle2 size={16} className="ml-auto text-indigo-500"/>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Timeline Move List */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Move to Week</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {weeks.map(w => (
                      <button key={w.id} onClick={() => moveTaskToWeek(w.id)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors flex justify-between items-center group">
                         <span>{w.title}</span>
                         <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Move</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD/EDIT TASK --- */}
      {/* Full-screen 'Task' modal. 
          Combines title, notes, and metadata (priority/focus) into one focused interface.
          Designed to look like a clean sheet of paper on a dark desk. */}
      {taskToEdit && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-4xl h-[95vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                 
                 {/* 1. Modal Header (Dark Mode) */}
                 {/* Provides high contrast to separate the 'Task Action' from the 'Task Content'. */}
                 <div className="bg-slate-900 px-8 py-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shadow-lg ${taskToEdit.id ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {taskToEdit.id ? <Edit2 size={24}/> : <Plus size={24}/>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{taskToEdit.id ? "Edit Task" : "New Task"}</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-0.5">{taskToEdit.id ? "Refine details" : "Add to your plan"}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setTaskToEdit(null)} 
                        className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                    >
                        <X size={28}/>
                    </button>
                 </div>
                 
                 {/* 2. Modal Body (Scrollable Workspace) */}
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
                        
                        {/* LEFT COLUMN: Main Content Input */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                             {/* Task Title */}
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Task</label>
                                <textarea autoFocus className="w-full p-4 bg-slate-50/50 border border-transparent rounded-2xl text-2xl font-bold text-slate-800 outline-none resize-none placeholder:text-slate-300 leading-tight hover:bg-slate-50 focus:bg-white focus:border-indigo-100 focus:shadow-sm transition-all" placeholder="What needs to be done?" rows={2} value={taskToEdit.text} onChange={e => setTaskToEdit({...taskToEdit, text: e.target.value})} />
                             </div>

                             {/* Lab Notes (Rich Text Area) */}
                             <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlignLeft size={14}/> Notes
                                </label>
                                <div className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 hover:border-indigo-100 focus-within:bg-white focus-within:border-indigo-200 focus-within:shadow-md transition-all group relative">
                                    <textarea 
                                        className="w-full h-full bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder:text-slate-400 leading-7" 
                                        placeholder="Jot down quick thoughts, or details..." 
                                        value={taskToEdit.notes || ''} 
                                        onChange={e => setTaskToEdit({...taskToEdit, notes: e.target.value})} 
                                    />
                                    <div className="absolute top-4 right-4 text-slate-200 group-focus-within:text-indigo-100 transition-colors"><FileText size={24}/></div>
                                </div>
                             </div>

                             {/* Action Steps (Subtasks) */}
                             <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                   <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><ListChecks size={16}/> Action Steps</h4>
                                   <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{taskToEdit.subtasks?.length || 0}</span>
                                </div>
                                <div className="space-y-3 mb-4">
                                  {(taskToEdit.subtasks || []).map(sub => (
                                    <div key={sub.id} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl group hover:border-indigo-300 hover:shadow-sm transition-all">
                                      <button onClick={() => checkSubtask(taskToEdit.id, sub.id)} className={`flex-shrink-0 transition-colors ${sub.done ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                                        {sub.done ? <CheckCircle2 size={22}/> : <Circle size={22}/>}
                                      </button>
                                      <input className={`flex-1 bg-transparent text-sm font-bold outline-none ${sub.done ? 'text-slate-400 line-through' : 'text-slate-700'}`} value={sub.text} onChange={(e) => { const newSubs = taskToEdit.subtasks.map(s => s.id === sub.id ? {...s, text: e.target.value} : s); setTaskToEdit({...taskToEdit, subtasks: newSubs}); }} />
                                      <button onClick={() => deleteSubtask(sub.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-3 items-center">
                                  <div className="flex-1 relative">
                                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Plus size={18}/></div>
                                     <input className="w-full h-14 pl-12 pr-4 text-sm font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" placeholder="Add a specific step..." value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtaskToEdit()}/>
                                  </div>
                                  <button onClick={addSubtaskToEdit} className="h-14 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-colors shadow-lg">Add</button>
                                </div>
                             </div>
                        </div>

                        {/* RIGHT COLUMN: Metadata & Settings Sidebar */}
                        <div className="space-y-8 lg:border-l lg:border-slate-100 lg:pl-10">
                            
                            {/* Bucket/Category Dropdown */}
                            <div className="space-y-3">
                               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                               <div className="relative group">
                                   <select className="w-full h-14 pl-4 pr-10 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 appearance-none transition-all cursor-pointer hover:border-slate-300 shadow-sm" value={taskToEdit.category} onChange={e => setTaskToEdit({...taskToEdit, category: e.target.value})}>
                                      {activeCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                   </select>
                                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600"><ChevronDown size={18}/></div>
                               </div>
                            </div>
                            
                            {/* Date Picker */}
                            <div className="space-y-3">
                               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
                               <input type="date" className="w-full h-14 px-4 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm" value={taskToEdit.deadline || ''} onChange={e => setTaskToEdit({...taskToEdit, deadline: e.target.value})} />
                            </div>

                            {/* Cognitive Load Buttons */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Energy Required</label>
                                <div className="space-y-3">
                                    {Object.entries(FOCUS_LEVELS).map(([key, info]) => (
                                        <button key={key} onClick={() => setTaskToEdit({...taskToEdit, focusLevel: key})} className={`w-full h-14 rounded-xl border-2 flex items-center px-4 gap-4 transition-all ${(taskToEdit.focusLevel || 'chill') === key ? info.style + ' bg-opacity-10 shadow-md scale-[1.02] border-current' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-white bg-white'}`}>
                                            <div className="text-lg">{info.icon}</div>
                                            <span className="text-sm font-bold uppercase tracking-wider">{info.label}</span>
                                            {(taskToEdit.focusLevel || 'chill') === key && <CheckCircle2 className="ml-auto" size={18}/>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Matrix Buttons */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                                <div className="space-y-3">
                                    {Object.entries(PRIORITY_LEVELS).map(([key, info]) => (
                                        <button key={key} onClick={() => setTaskToEdit({...taskToEdit, priority: key})} className={`w-full h-14 rounded-xl border-2 flex items-center px-4 gap-3 transition-all ${taskToEdit.priority === key ? info.style + ' shadow-md scale-[1.02]' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-white bg-white'}`}>
                                            <div>{info.icon}</div>
                                            <span className="text-xs font-bold uppercase tracking-wider">{info.label}</span>
                                            {taskToEdit.priority === key && <CheckCircle2 className="ml-auto" size={18}/>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>

                 {/* 3. Modal Footer (Actions) */}
                 <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-white flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                     <button onClick={() => setTaskToEdit(null)} className="px-8 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                     <button onClick={handleSaveTask} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-3">
                        {taskToEdit.id ? <Check size={20} strokeWidth={3}/> : <Plus size={20} strokeWidth={3}/>}
                        {taskToEdit.id ? "Save Changes" : "Create Task"}
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* --- MODAL 3: CATEGORY MANAGER --- */}
      {/* A visual playground for defining "buckets" of work. 
          Split into two panes: Current list (Left) and Creator (Right). */}
      {showBucketManager && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 animate-in zoom-in-95 duration-200 relative">
                 <button onClick={() => setShowBucketManager(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all z-10"><X size={24} /></button>
                 
                 {/* LEFT PANE: Active List */}
                 {/* Displays current categories with delete options. 
                     Uses a scrollable area to handle many categories gracefully. */}
                 <div className="flex-1 border-r border-slate-100 pr-8">
                    <h2 className="text-xl font-black text-slate-800 mb-1">Your Buckets</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Active Lists</p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {activeCategories.length === 0 && <p className="text-sm text-slate-400 italic">No categories yet.</p>}
                        {activeCategories.map(cat => {
                            // Fallback to Indigo style if color code is missing/invalid
                            const style = CAT_STYLES[cat.color] || CAT_STYLES.indigo;
                            return (
                                <div key={cat.id} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${style.headerBg} ${style.headerText}`}>{cat.icon}</div>
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{cat.label}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteBucket(cat.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                </div>
                            );
                        })}
                    </div>
                 </div>

                 {/* RIGHT PANE: Creator Form */}
                 {/* Visual form for building new categories with Emoji + Color selection. */}
                 <div className="flex-1 pt-2">
                    <h2 className="text-xl font-black text-slate-800 mb-1">Create New</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Design your space</p>
                    <form onSubmit={addBucket} className="space-y-6">
                        
                        {/* Name & Icon Input Row */}
                        <div className="flex gap-3">
                            <div className="relative">
                                {/* Emoji Picker Trigger */}
                                <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-14 h-14 border-2 border-slate-200 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl hover:bg-white hover:border-indigo-400 hover:shadow-lg transition-all">{newBucketIcon}</button>
                                {showIconPicker && (
                                    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 grid grid-cols-4 gap-2 w-56 z-50 h-48 overflow-y-auto">
                                        {ICONS.map(icon => (
                                            <button key={icon} type="button" onClick={() => {setNewBucketIcon(icon); setShowIconPicker(false)}} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xl transition-all">{icon}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input autoFocus className="w-full h-14 px-4 border-2 border-slate-200 rounded-2xl bg-white text-slate-800 font-bold placeholder:text-slate-300 focus:border-indigo-500 outline-none transition-all" placeholder="Bucket Name..." value={newBucketName} onChange={e => setNewBucketName(e.target.value)} />
                            </div>
                        </div>

                        {/* Color Palette Grid */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pick a Vibe</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.keys(CAT_STYLES).map(c => {
                                    const style = CAT_STYLES[c];
                                    const isSelected = newBucketColor === c;
                                    return (
                                        <button key={c} type="button" onClick={() => setNewBucketColor(c)} className={`relative h-12 rounded-xl transition-all border-2 ${style.headerBg} ${style.headerText} ${isSelected ? 'border-slate-800 scale-110 shadow-lg ring-2 ring-slate-200' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`} title={c} >
                                            <span className="text-xs font-bold">Aa</span>
                                            {isSelected && <div className="absolute -top-2 -right-2 bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md"><Check size={10} strokeWidth={4}/></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                <Plus size={18} strokeWidth={3}/> Create Bucket
                            </button>
                        </div>
                    </form>
                 </div>
             </div>
         </div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      {/* Fixed-position sidebar. Handles navigation between weeks (Sprints).
          Collapses gracefully on mobile or via toggle. */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r-2 border-slate-200 transition-all duration-300 z-40 shadow-lg ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        
        {/* Brand Header */}
        <div className="p-8 border-b-2 border-slate-200">
           <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2.5 rounded-xl"><BookOpen className="text-white" size={22}/></div> 
             <div>
               <h1 className="font-black text-2xl text-slate-900">Shri's ToDo</h1>
               <p className="text-xs text-slate-500 font-medium">Let's get this done!</p>
             </div>
           </div>
        </div>

        {/* Timeline List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2">
           <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline</span>
             <button onClick={() => setShowWeekForm(!showWeekForm)} className="text-slate-400 hover:text-indigo-600"><Plus size={14}/></button>
           </div>

           {/* Quick Add Week Form */}
           {showWeekForm && (
             <form onSubmit={addWeek} className="mb-3">
               <input autoFocus placeholder="Week name..." className="w-full p-2.5 text-sm border-2 border-slate-300 rounded-lg bg-white text-slate-800 font-medium placeholder:text-slate-400 outline-none" value={newWeekTitle} onChange={e => setNewWeekTitle(e.target.value)}/>
             </form>
           )}

           {/* Week Items */}
           {weeks.map(week => (
             <div 
                key={week.id} 
                onClick={() => setActiveWeekId(week.id)}
                // Dynamic Style: Highlights active week with indigo, keeps others standard grey
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl font-semibold text-sm transition-all border-2 cursor-pointer ${activeWeekId === week.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-transparent text-slate-600 hover:bg-slate-100'}`}
             >
                <span>{week.title}</span>
                
                {/* Delete Trigger: Hidden by default, appears on hover. 
                    Uses stopPropagation to prevent navigation when clicking delete. */}
                <button 
                    onClick={(e) => deleteWeek(week.id, e)}
                    className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${activeWeekId === week.id ? 'text-indigo-200 hover:text-white hover:bg-indigo-500' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                    title="Delete Week"
                >
                    <Trash2 size={16}/>
                </button>
             </div>
           ))}
        </div>

        {/* Bottom Actions (Settings) */}
        <div className="p-5 border-t-2 border-slate-200">
           <button onClick={() => setShowBucketManager(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"><Settings size={14}/> Categories</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* Dynamic left margin based on Sidebar state to create a smooth 'push' effect. */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        
        {/* HEADER & DASHBOARD */}
        {/* Sticky header ensures controls are always accessible even when scrolling deep lists. */}
        <header className="bg-white border-b-2 border-slate-200 pt-5 pb-5 px-8 mt-6 mx-6 sticky top-0 z-30 rounded-2xl shadow-lg">
           
           {/* TOP ROW: Identity & Controls */}
           <div className="flex items-center justify-between mb-5">
              
              {/* Left: Title & Quote */}
              <div className="flex items-center gap-5">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-900 transition-colors"><Menu size={22}/></button>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{activeWeekObj.title}</h2>
                  
                  {/* DYNAMIC QUOTE COMPONENT */}
                  <div className="flex items-center gap-3 mt-2 text-slate-500 max-w-8xl">
                    <p className={`text-base font-medium italic transition-opacity duration-500 ${isLoadingQuote ? 'opacity-0' : 'opacity-100'}`}>
                      "{quote.text}" <span className="not-italic text-slate-400 text-sm ml-1">— {quote.author}</span>
                    </p>
                    <button 
                      onClick={fetchQuote} 
                      className={`p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all ${isLoadingQuote ? 'animate-spin' : ''}`}
                      title="New Quote"
                    >
                      <RotateCcw size={14}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: CONTROL CENTER */}
              <div className="flex items-center gap-4">
                
                {/* 1. Quick Access Toolbar */}
                {/* Distinct color-coded buttons for high-frequency external tools. */}
                <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl p-1.5 shadow-sm">
                    {QUICK_LINKS.map((link, i) => (
                        <a 
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm ${link.style}`}
                            title={link.label}
                        >
                            {link.icon}
                            {/* Text hides on smaller screens to save space */}
                            <span className="hidden xl:inline">{link.label}</span>
                            <ExternalLink size={12} className="opacity-40"/>
                        </a>
                    ))}
                </div>

                <div className="h-10 w-0.5 bg-slate-200"></div>

                {/* 2. Security Button */}
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-2 border-slate-100 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all group"
                    title="Lock Session"
                >
                    <span className="text-sm font-bold uppercase tracking-wider group-hover:text-rose-600 transition-colors">Locked</span>
                    <Lock size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2.5}/>
                </button>
              </div>

           </div>

           {/* KPI DASHBOARD GRID */}
           {/* Four-column layout displaying high-level productivity metrics. */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              
              {/* Metric 1: Overall Progress Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-extrabold text-indigo-600 uppercase tracking-widest">Completion</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Target size={18}/></div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">{Math.round((doneCount / (totalCount || 1)) * 100)}%</span>
                    <span className="text-sm font-bold text-slate-400">{doneCount}/{totalCount}</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{width: `${totalCount === 0 ? 0 : (doneCount / totalCount) * 100}%`}}/>
                  </div>
                </div>
              </div>

              {/* Metric 2: Daily Velocity */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-extrabold text-emerald-600 uppercase tracking-widest">Today</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Sparkles size={18}/></div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">{getTodayCompleted()}</span>
                    <span className="text-sm font-bold text-slate-400">finished</span>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-md border border-emerald-100">
                     {getTodayCompleted() === 0 ? "Ready to start?" : "Great momentum!"}
                  </p>
                </div>
              </div>

              {/* Metric 3: Urgency Monitor */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[12px] font-extrabold uppercase tracking-widest ${urgentCount > 0 ? 'text-rose-600' : 'text-amber-600'}`}>Attention</span>
                  <div className={`p-2 rounded-lg ${urgentCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {urgentCount > 0 ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">{urgentCount}</span>
                    <span className={`text-sm font-bold ${urgentCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>urgent</span>
                  </div>
                  <p className={`text-[11px] font-bold mt-2 inline-block px-2 py-0.5 rounded-md border ${urgentCount > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                     {urgentCount === 0 ? 'All clear' : 'Needs focus'}
                  </p>
                </div>
              </div>

              {/* Metric 4: Cognitive Load (Energy Grid) */}
              {/* Visualizes task distribution by mental effort required. 
                  Helps prevent burnout by showing if you have too many "Deep Work" tasks. */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-violet-600 uppercase tracking-widest">Energy Load</span>
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Layers size={22}/></div>
                </div>

                <div className="grid grid-cols-3 gap-3 h-full">
                  {['deep', 'focus', 'chill'].map(level => {
                    const conf = FOCUS_LEVELS[level];
                    const tasks = visibleTasks.filter(t => (t.focusLevel || t.focus_level || 'chill') === level);
                    const total = tasks.length;
                    const done = tasks.filter(t => t.status === 'done').length;
                    const pct = total === 0 ? 0 : (done / total) * 100;

                    return (
                      <div key={level} className={`rounded-2xl border ${level === 'deep' ? 'bg-violet-50 border-violet-100' : level === 'focus' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'} flex flex-col items-center justify-center p-2 relative overflow-hidden group`}>
                          {/* Liquid Background Animation */}
                          <div 
                            className={`absolute bottom-0 left-0 right-0 ${conf.fill} transition-all duration-700 opacity-50`} 
                            style={{height: `${pct}%`}}
                          ></div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-60 ${conf.text}`}>{conf.label}</span>
                            <span className={`text-base font-black ${conf.text}`}>{done}/{total}</span>
                          </div>
                      </div>
                    )
                  })}
                </div>
              </div>
           </div>
        </header>

        {/* --- MAIN BOARD AREA --- */}
        {/* The core workspace. We use a CSS Multi-Column layout ('columns-...') 
            instead of Flex/Grid. This allows category cards of different heights 
            to stack naturally like a Pinterest board, minimizing whitespace. */}
        <div className="p-10 pb-40">
           
           <div className={`
              ${focusModeCat ? 'max-w-4xl mx-auto' : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'}
           `}>
              {/* Category Rendering Loop */}
              {activeCategories.filter(c => focusModeCat ? c.id === focusModeCat : true).map(cat => {
                
                // Local Data Filtering: Get tasks specific to this bucket
                const categoryTasks = visibleTasks.filter(t => (t.category_id || t.category) === cat.id);
                const doneInCat = categoryTasks.filter(t => t.status === 'done').length;
                const style = CAT_STYLES[cat.color] || CAT_STYLES.indigo;
                const catProgress = categoryTasks.length === 0 ? 0 : Math.round((doneInCat / categoryTasks.length) * 100);
                
                return (
                  // 'break-inside-avoid' prevents a card from being sliced in half by the column layout
                  <div key={cat.id} className={`break-inside-avoid mb-6 rounded-xl bg-gray-50/80 shadow-lg transition-all overflow-hidden`}>
                     
                     {/* 1. Category Header */}
                     {/* Acts as a mini-dashboard for this specific project/bucket. */}
                     <div className={`p-4 pt-5 ${style.headerBg} ${style.headerText}`}>
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3 flex-1"><span className="text-3xl">{cat.icon}</span><h3 className="font-bold text-xl">{cat.label}</h3></div>
                           <div className="flex gap-1">
                              {/* Focus Mode Trigger: Isolates this list */}
                              <button onClick={() => setFocusModeCat(focusModeCat === cat.id ? null : cat.id)} className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-black/5 transition-colors"><Maximize2 size={14}/></button>
                              <button onClick={() => deleteBucket(cat.id)} className="text-slate-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-black/5 transition-colors"><Trash2 size={14}/></button>
                           </div>
                        </div>
                        {/* Micro-Progress Bar */}
                        <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                           <p className="text-xs font-bold opacity-60">{doneInCat}/{categoryTasks.length} done</p>
                           <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden"><div className={`h-full ${style.bar} rounded-full transition-all duration-700`} style={{width: `${catProgress}%`}}/></div>
                           <span className="text-xs font-black opacity-50">{catProgress}%</span>
                        </div>
                     </div>

                     {/* 2. Task List */}
                     <div className="p-4 space-y-3">
                        {/* Empty State Illustration */}
                        {categoryTasks.length === 0 && <div className="py-8 flex flex-col items-center justify-center text-slate-400 opacity-60"><Coffee size={32} strokeWidth={1.5} className="mb-2"/><p className="text-xs font-bold">No tasks yet</p></div>}
                        
                        {categoryTasks.map(task => {
                           // Pre-calculate display data
                           const dateInfo = getDeadlineInfo(task.deadline);
                           const isExpanded = expandedTasks[task.id];
                           const completedSubs = (task.subtasks || []).filter(s => s.done).length;
                           const totalSubs = (task.subtasks || []).length;
                           const isCelebrating = celebrateTask === task.id;
                           
                           // Safe property access for legacy data support
                           const focusConf = FOCUS_LEVELS[task.focusLevel || 'chill'] || FOCUS_LEVELS.chill; 
                           const priorityConf = PRIORITY_LEVELS[task.priority || 'normal'] || PRIORITY_LEVELS.normal;
                           
                           return (
                              <div key={task.id} className={`group bg-white p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-[3px] ${style.taskBorder} border border-slate-200 ${task.status === 'done' ? 'opacity-50' : 'hover:-translate-y-0.5'} ${isCelebrating ? 'celebrate' : ''}`}>
                                 <div className="flex items-start gap-3">
                                    {/* Completion Toggle */}
                                    <button onClick={(e) => toggleTask(task.id, e)} className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-all flex-shrink-0 hover:scale-110">{task.status === 'done' ? <CheckCircle2 size={22} className="text-indigo-600 fill-indigo-50"/> : <Circle size={22}/>}</button>
                                    
                                    <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-start gap-2">
                                          <p className={`font-bold leading-snug text-slate-700 text-base ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>{task.text}</p>
                                          {/* Accordion Trigger (Only visible if subtasks exist) */}
                                          {totalSubs > 0 && <button onClick={() => toggleExpand(task.id)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded flex-shrink-0">{isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>}
                                       </div>
                                       
                                       {/* Metadata Badges (Tags) */}
                                       {/* Automatically hides when task is done to reduce visual noise */}
                                       <div className={`flex flex-wrap gap-1.5 transition-all ${task.status === 'done' ? 'mt-0 h-0 overflow-hidden opacity-0' : 'mt-2 h-auto opacity-100'}`}>
                                          {totalSubs > 0 && <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${completedSubs === totalSubs ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}><ListChecks size={10}/> {completedSubs}/{totalSubs}</span>}
                                          {task.priority !== 'normal' && <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityConf.style}`}>{priorityConf.icon} {priorityConf.label}</span>}
                                          {dateInfo && <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${dateInfo.bg}`}>{dateInfo.icon && <Clock size={10}/>} {dateInfo.text}</span>}
                                          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${focusConf.style} bg-opacity-20 border-opacity-50`}>{focusConf.icon} {focusConf.label}</span>
                                          {task.notes && <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-yellow-50 text-yellow-600 border-yellow-200"><FileText size={10}/> Notes</span>}
                                       </div>

                                       {/* Subtask Expansion Panel */}
                                       {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                                         <div className="mt-2 pt-2 border-t border-slate-100">
                                            <div className="space-y-1">
                                              {task.subtasks.map(sub => (
                                                <div key={sub.id} className="flex items-start gap-2 p-1 hover:bg-slate-50 rounded transition-all">
                                                  <button onClick={() => checkSubtask(task.id, sub.id)} className={`mt-0.5 flex-shrink-0 ${sub.done ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-400'}`}>{sub.done ? <CheckCircle2 size={12}/> : <Circle size={12}/>}</button>
                                                  <span className={`flex-1 text-xs font-medium ${sub.done ? 'line-through text-slate-400' : 'text-slate-600'}`}>{sub.text}</span>
                                                </div>
                                              ))}
                                            </div>
                                         </div>
                                       )}
                                    </div>

                                    {/* Action Menu (Visible on Hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                       <button onClick={() => setTaskToMove(task)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Move size={12}/></button>
                                       <button onClick={() => setTaskToEdit(task)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={12}/></button>
                                       <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={12}/></button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                        
                        {/* Quick Add Button (Bottom of list) */}
                        <button onClick={() => { openNewTaskModal(); setTaskToEdit({ ...taskToEdit, category: cat.id }); }} className="w-full py-2 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-2">
                           <Plus size={14}/> Add Card
                        </button>
                     </div>
                  </div>
                );
              })}
              
              {/* Empty State: Create New Category */}
              {!focusModeCat && (
                <button onClick={() => setShowBucketManager(true)} className="w-full break-inside-avoid h-64 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all opacity-60 hover:opacity-100 mb-6">
                   <Folder size={40} strokeWidth={1.5}/> 
                   <span className="font-bold text-sm">New Category</span>
                </button>
              )}
           </div>
        </div>

        {/* Floating Action Button (FAB) */}
        {/* Fixed position Primary Action used for quick task entry from anywhere. */}
        <div className="fixed bottom-8 right-8 z-50">
            <button onClick={openNewTaskModal} className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center group">
              <Plus size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300"/>
            </button>
        </div>

      </div>
    </div>
  );
}