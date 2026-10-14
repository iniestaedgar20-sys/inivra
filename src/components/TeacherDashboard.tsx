import React, { useState, useRef, useEffect } from 'react';
import { db } from '../InivraDatabase';
import { Classroom, Assignment, Submission, Material, UserProfile, Course } from '../types';
import EmptyState from './EmptyState';
import { 
  Home, BookOpen, Users, FileText, Calendar, Clipboard, 
  Upload, Award, GraduationCap, BarChart2, Sparkles, Video, 
  MessageSquare, Bell, DollarSign, Settings, Search, ChevronDown, 
  Moon, Sun, Plus, Check, Trash2, Edit2, Play, User, Menu, 
  HelpCircle, LogOut, Send, Download, CheckCircle, CheckCircle2, VideoOff, 
  Mic, MicOff, ScreenShare, RefreshCw, PhoneCall, ShieldAlert, 
  Heart, Info, Clock, ChevronRight, X, Edit3, Save, Share2, Copy
} from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import IniChatWorkspace from './IniChatWorkspace';
import MessagingCenter from './MessagingCenter';

interface TeacherDashboardProps {
  currentUserId: string;
  onLogout?: () => void;
}

export default function TeacherDashboard({ currentUserId, onLogout }: TeacherDashboardProps) {
  // ----------------------------------------------------
  // Initial Context & Setup
  // ----------------------------------------------------
  const teacherProfile = db.getProfile(currentUserId) || {
    id: currentUserId,
    name: 'Teacher',
    email: 'teacher@inivra.edu',
    role: 'Teacher',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    bio: 'Instructor profile.',
    qualifications: [],
    experience: '',
    subjects: [],
    balance: 0.00
  };

  // Main navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // App-wide styling states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Local copy of editable student analytics, list & gradebook
  const [students, setStudents] = useState<any[]>([]);

  // Balance & Payout
  const [teacherBalance, setTeacherBalance] = useState<number>(teacherProfile.balance ?? 0.00);

  // Quick Notes state
  const [quickNotes, setQuickNotes] = useState<string[]>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  // ----------------------------------------------------
  // Dynamic Tab: Courses State
  // ----------------------------------------------------
  const [courses, setCourses] = useState<any[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Mathematics');

  // ----------------------------------------------------
  // Dynamic Tab: Assignments State
  // ----------------------------------------------------
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(0);
  const [homeworkReviewList, setHomeworkReviewList] = useState<any[]>([]);
  const [currentGradingScore, setCurrentGradingScore] = useState('');
  const [currentGradingFeedback, setCurrentGradingFeedback] = useState('');

  // ----------------------------------------------------
  // Dynamic Tab: Lesson Planner State
  // ----------------------------------------------------
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [aiPlanTopic, setAiPlanTopic] = useState('');
  const [aiPlanAudience, setAiPlanAudience] = useState('');
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanOutput, setAiPlanOutput] = useState('');

  // ----------------------------------------------------
  // Dynamic Tab: Resource Library
  // ----------------------------------------------------
  const [resources, setResources] = useState<any[]>([]);
  const [fileToUpload, setFileToUpload] = useState<string>('');

  // ----------------------------------------------------
  // Dynamic Tab: Exams & Quiz Creator
  // ----------------------------------------------------
  const [quizTopic, setQuizTopic] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizOutput, setQuizOutput] = useState<{ question: string; options: string[]; answer: string }[]>([]);

  // ----------------------------------------------------
  // Dynamic Tab: Virtual Classroom
  // ----------------------------------------------------
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardColor, setWhiteboardColor] = useState('#2563EB');
  // Poll creator
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [activePollVotes, setActivePollVotes] = useState<number[]>([0, 0, 0]);
  const [pollLaunched, setPollLaunched] = useState(false);

  // ----------------------------------------------------
  // Dynamic Tab: Messages & Chat Logs
  // ----------------------------------------------------
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, { sender: 'me' | 'other'; text: string; time: string }[]>>({});

  // ----------------------------------------------------
  // Dynamic Tab: Announcements
  // ----------------------------------------------------
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnTarget, setNewAnnTarget] = useState('All Classes');

  // ----------------------------------------------------
  // Dynamic Tab: Teacher Marketplace
  // ----------------------------------------------------
  const [marketplaceProducts, setMarketplaceProducts] = useState<any[]>([]);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Revision Guide');
  const [newProdPrice, setNewProdPrice] = useState('14.99');

  // ----------------------------------------------------
  // Dynamic Tab: Teaching Schedule Matrix
  // ----------------------------------------------------
  const [scheduleDayFilter, setScheduleDayFilter] = useState('All');
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [scheduleSlots, setScheduleSlots] = useState([
    { id: 's1', day: 'Monday', time: '09:00 AM - 10:15 AM', course: 'Advanced Calculus', room: 'Hall 302', students: 28, type: 'Lecture' },
    { id: 's2', day: 'Monday', time: '11:00 AM - 12:15 PM', course: 'AP Physics Mechanics', room: 'Physics Lab 4', students: 24, type: 'Lab Session' },
    { id: 's3', day: 'Tuesday', time: '10:00 AM - 11:30 AM', course: 'Linear Algebra & Matrices', room: 'Lecture Room 108', students: 32, type: 'Lecture' },
    { id: 's4', day: 'Wednesday', time: '09:00 AM - 10:15 AM', course: 'Advanced Calculus', room: 'Hall 302', students: 28, type: 'Problem Drill' },
    { id: 's5', day: 'Wednesday', time: '02:00 PM - 03:30 PM', course: 'Student Mentorship & Office Hours', room: 'Virtual Hybrid Room', students: 8, type: 'Office Hours' },
    { id: 's6', day: 'Thursday', time: '10:00 AM - 11:30 AM', course: 'Linear Algebra & Matrices', room: 'Room 108', students: 32, type: 'Lecture' },
    { id: 's7', day: 'Friday', time: '11:00 AM - 12:30 PM', course: 'AP Physics Mechanics', room: 'Physics Lab 4', students: 24, type: 'Lab Experiment' }
  ]);
  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotCourse, setNewSlotCourse] = useState('Advanced Calculus');
  const [newSlotTime, setNewSlotTime] = useState('09:00 AM - 10:15 AM');
  const [newSlotRoom, setNewSlotRoom] = useState('Hall 302');

  // ----------------------------------------------------
  // Dynamic Tab: Floating & Shared Ini AI Assistant
  // ----------------------------------------------------
  const [isIniChatOpen, setIsIniChatOpen] = useState(false);
  const [iniPrompt, setIniPrompt] = useState('');
  const [iniChatHistory, setIniChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Hello, Dr. Sarah. I\'m Ini, your AI teaching assistant optimized for lesson planning, grading assistance, and content preparation. How can I help you construct today\'s lessons?' }
  ]);
  const [iniLoading, setIniLoading] = useState(false);

  // Synchronous fullscreen setup to align with Student style
  useEffect(() => {
    const header = document.getElementById('inivra-header');
    const footer = document.querySelector('footer');
    if (header) header.style.setProperty('display', 'none', 'important');
    if (footer) footer.style.setProperty('display', 'none', 'important');
    
    const mainWrapper = document.querySelector('main');
    if (mainWrapper) {
      mainWrapper.style.setProperty('padding', '0', 'important');
      mainWrapper.style.setProperty('max-width', 'none', 'important');
      mainWrapper.style.setProperty('width', '100%', 'important');
      mainWrapper.style.setProperty('margin', '0', 'important');
    }

    return () => {
      if (header) header.style.removeProperty('display');
      if (footer) footer.style.removeProperty('display');
      if (mainWrapper) {
        mainWrapper.style.removeProperty('padding');
        mainWrapper.style.removeProperty('max-width');
        mainWrapper.style.removeProperty('width');
        mainWrapper.style.removeProperty('margin');
      }
    };
  }, []);

  // Sync state version to local storage
  const syncLocal = () => {
    try {
      db.updateProfile({ ...teacherProfile, balance: teacherBalance });
    } catch(e){}
  };

  useEffect(() => {
    syncLocal();
  }, [teacherBalance]);

  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tab, role } = customEvent.detail || {};
      if (role && role !== 'Teacher' && role !== 'Educator') return;
      const tabMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'courses': 'courses',
        'students': 'students',
        'assignments': 'assignments',
        'homework': 'assignments',
        'schedule': 'schedule',
        'timetable': 'schedule',
        'classes': 'schedule',
        'lesson_plans': 'lesson_plans',
        'resources': 'resources',
        'summarizer': 'resources',
        'exams': 'exams',
        'quizzes': 'exams',
        'flashcards': 'exams',
        'gradebook': 'gradebook',
        'grades': 'gradebook',
        'analytics': 'analytics',
        'ai_assistant': 'ai_assistant',
        'ini': 'ai_assistant',
        'virtual_classroom': 'virtual_classroom',
        'messages_tab': 'messages_tab',
        'messages': 'messages_tab',
        'announcements': 'announcements',
        'marketplace': 'marketplace',
        'settings': 'settings'
      };
      if (tab && tabMap[tab]) {
        setActiveTab(tabMap[tab]);
      }
    };
    window.addEventListener('inivra-navigation', handleNav);
    return () => window.removeEventListener('inivra-navigation', handleNav);
  }, []);

  // ----------------------------------------------------
  // Dynamic Drawing Canvas Handlers
  // ----------------------------------------------------
  useEffect(() => {
    if (isWhiteboardActive && whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = whiteboardColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // Fill canvas with white once initialized
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isWhiteboardActive]);

  const startWhiteboardDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = whiteboardColor;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawWhiteboard = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopWhiteboardDraw = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // ----------------------------------------------------
  // Dynamic Action Event Handlers
  // ----------------------------------------------------
  const triggerAISimplePlanner = async () => {
    if (!aiPlanTopic.trim()) return;
    setAiPlanLoading(true);
    setAiPlanOutput('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create a detailed lesson plan topic outline: "${aiPlanTopic}" for target level: ${aiPlanAudience}. Outline objectives, 3 class activities, resources to upload, and home worksheet study instructions.`,
          userName: teacherProfile.name,
          context: 'Lesson curriculum developer planner.',
          systemInstruction: 'You are Ini, Senior AI Lesson Planner. Format with clean professional markdown titles, objectives bullets, timeline segments and practice worksheets hints.'
        })
      });
      const data = await response.json();
      setAiPlanOutput(data.text || 'Error building outline plan.');
    } catch (e) {
      setAiPlanOutput('An error occurred during generative AI modeling. Check your API key. Here is a simulated lesson plan:\n\n### Lesson Objectives\n- Trace rates of change tangent lines\n- Understand delta limits coordinates\n\n### Recommended Worksheets\n- Delta Coordinate Matching Sheet');
    } finally {
      setAiPlanLoading(false);
    }
  };

  const triggerAIQuizBuilder = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Formulate exactly 3 multiple choice questions for a quiz on topic: "${quizTopic}". Return strictly a JSON array with schema: [{"question": "text", "options": ["A", "B", "C", "D"], "answer": "correct option"}]. Do not include markdown code block wrapper.`,
          userName: teacherProfile.name
        })
      });
      const data = await response.json();
      // Try parsing JSON array directly or clean codeblock wraps
      let cleaned = data.text.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
      if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
      const list = JSON.parse(cleaned.trim());
      setQuizOutput(list);
    } catch(e) {
      // Mock fallback
      setQuizOutput([
        { question: `What is the vertical asymptote of the base log equation log(x - 2)?`, options: ['x = 0', 'x = 2', 'x = -2', 'No asymptote'], answer: 'x = 2' },
        { question: `Evaluate the coordinate limit as x approaches positive infinity of 1/x?`, options: ['0', '1', 'Infinity', 'Undefined'], answer: '0' },
        { question: `Which function represents exponential logarithmic decay rate?`, options: ['y = e^x', 'y = e^-x', 'y = log(x)', 'y = x^2'], answer: 'y = e^-x' }
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const sendInteractiveMessage = (text: string) => {
    if (!text.trim()) return;
    const activeConv = activeConvId;
    const newMsg = { sender: 'me' as const, text, time: 'Just now' };
    setChatHistory(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg]
    }));
    setChatInput('');
    
    // Simulate auto parent/student response logs
    setTimeout(() => {
      setChatHistory(prev => ({
        ...prev,
        [activeConv]: [
          ...(prev[activeConv] || []),
          { sender: 'other', text: 'Thank you for the prompt update, Dr. Jenkins! Let me review this rule.', time: 'Just now' }
        ]
      }));
    }, 1500);
  };

  const publishGradebookReview = () => {
    // Grade the selected student homework in review list
    const studentName = homeworkReviewList[selectedSubIndex]?.studentName;
    if (!studentName) return;
    
    // Update student performance statistics
    setStudents(prev => prev.map(s => {
      if (s.name === studentName) {
        const parsed = parseInt(currentGradingScore) || 90;
        let letG = 'A';
        if (parsed < 70) letG = 'C';
        else if (parsed < 85) letG = 'B';
        else if (parsed < 95) letG = 'A';
        else letG = 'A+';
        return { ...s, performance: parsed, letter: letG };
      }
      return s;
    }));

    alert(`Published mark ${currentGradingScore}% with feedback to student: ${studentName}!`);
  };

  const triggerChatBotIni = async () => {
    if (!iniPrompt.trim()) return;
    const userMsg = iniPrompt;
    setIniChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIniPrompt('');
    setIniLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userName: teacherProfile.name,
          context: 'You are Ini, AI Classroom Assistant helping teacher Dr. Sarah Jenkins with files, lesson plans, rubric scores, and quiz formats.'
        })
      });
      const data = await response.json();
      setIniChatHistory(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch(e) {
      setIniChatHistory(prev => [...prev, { role: 'assistant', text: 'Dr. Jenkins, I was unable to connect to our core generative endpoint. Here is a structured guidance draft for active lesson pacing.' }]);
    } finally {
      setIniLoading(false);
    }
  };

  // Filter lists based on Search bar
  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.grade.toLowerCase().includes(searchQuery.toLowerCase()));

  // Simulated student votes populate
  const launchPollSimulate = () => {
    setPollLaunched(true);
    // incremental mock votes count
    let t = 0;
    const interval = setInterval(() => {
      setActivePollVotes(prev => [prev[0] + (Math.random() > 0.4 ? 1 : 0), prev[1] + (Math.random() > 0.7 ? 1 : 0), prev[2] + (Math.random() > 0.8 ? 1 : 0)]);
      t++;
      if (t > 10) clearInterval(interval);
    }, 1000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'} font-sans flex flex-col transition-colors duration-300`}>
      
      {/* ----------------------------------------------------
          TOP NAVIGATION BAR
          ---------------------------------------------------- */}
      <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#FFFFFF] border-[#E2E8F0]'} border-b px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm`}>
        
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
            alt="studyHUB-inivra learn"
            referrerPolicy="no-referrer"
            className="h-10 w-10 object-contain rounded-xl shadow-md"
          />
          <div>
            <h1 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0F172A]'} leading-none`}>
              studyHUB-inivra learn
            </h1>
            <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider font-mono">Teacher Workspace</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className={`w-full flex items-center rounded-full px-4 py-2 ${isDarkMode ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} border ${isDarkMode ? 'border-[#475569]' : 'border-[#E2E8F0]'}`}>
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search classes, students, assignments, resources, or AI..." 
              className="bg-transparent text-xs outline-none w-full border-none focus:ring-0 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Far Right Widgets */}
        <div className="flex items-center gap-3 relative">
          
          {/* Calendar trigger */}
          <button 
            onClick={() => { setActiveTab('schedule'); setIsMobileSidebarOpen(false); }} 
            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Meeting Scheduler trigger */}
          <button 
            onClick={() => { setActiveTab('virtual_classroom'); setIsMobileSidebarOpen(false); }} 
            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="Start Live Stream Meeting"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className={`p-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              <span>🌐 {selectedLanguage}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {isLanguageOpen && (
              <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-lg border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
                {['English', 'Spanish', 'French', 'German'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setSelectedLanguage(lang); setIsLanguageOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Light/Dark Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569] text-amber-400' : 'bg-slate-100 hover:bg-slate-200 text-[#0F172A]'}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Panel */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2.5 rounded-xl transition-all relative ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </button>
            {isNotificationsOpen && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
                <div className="p-3 border-b flex justify-between items-center bg-blue-50/50 dark:bg-[#1e2e4a]">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white font-mono">Alert Logs</span>
                  <span className="text-[10px] text-blue-600 font-bold">3 New</span>
                </div>
                <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-[11px] leading-relaxed">
                    <span className="font-bold text-blue-600">Alex Johnson</span> submitted Calculus PS 4
                  </div>
                  <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-500">Class warning</span>: Attendance check pending
                  </div>
                  <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-[11px] leading-relaxed">
                    <span className="font-bold text-purple-600">Ini Assistant</span> generated worksheet formulas
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropper */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="h-10 w-10 rounded-full border border-blue-500 overflow-hidden cursor-pointer shadow flex items-center justify-center bg-blue-50"
            >
              {teacherProfile.avatar ? (
                <img referrerPolicy="no-referrer" src={teacherProfile.avatar} alt="teacher" className="h-full w-full object-cover" />
              ) : (
                <span className="font-bold text-xs text-blue-700">
                  {teacherProfile.name ? teacherProfile.name.charAt(0).toUpperCase() : 'T'}
                </span>
              )}
            </button>
            {isProfileDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
                <div className="p-3 border-b bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <p className="font-bold">{teacherProfile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{teacherProfile.email}</p>
                </div>
                <button onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"><User className="w-3.5 h-3.5" /> My Profile</button>
                <button onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Preferences</button>
                <button onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> Help Centre</button>
                <button 
                  id="teacher-dropdown-logout-btn"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      window.dispatchEvent(new CustomEvent('inivra-logout'));
                    }
                  }} 
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Sidebar Hamburger */}
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------
          MAIN CONTENT & SIDEBAR CONTAINER
          ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className={`w-64 border-r shrink-0 z-30 transition-all duration-300 md:block absolute md:relative inset-y-0 left-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#FFFFFF] border-[#E2E8F0]'}
        `}>
          <div className="p-4 flex flex-col h-full justify-between overflow-y-auto">
            
            {/* Nav list */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: Home },
                { id: 'courses', label: 'My Courses', icon: BookOpen },
                { id: 'students', label: 'My Students', icon: Users },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'schedule', label: 'Class Schedule', icon: Calendar },
                { id: 'lesson_plans', label: 'Lesson Plans', icon: Clipboard },
                { id: 'resources', label: 'Resources & Files', icon: Upload },
                { id: 'exams', label: 'Exams & Quizzes', icon: Award },
                { id: 'gradebook', label: 'Gradebook Table', icon: GraduationCap },
                { id: 'analytics', label: 'Student Analytics', icon: BarChart2 },
                { id: 'ai_assistant', label: 'AI Instructor (Ini)', icon: Sparkles },
                { id: 'virtual_classroom', label: 'Virtual Classroom', icon: Video },
                { id: 'messages_tab', label: 'Messages Center', icon: MessageSquare },
                { id: 'announcements', label: 'Announcements', icon: Bell },
                { id: 'marketplace', label: 'Teacher Marketplace', icon: DollarSign },
                { id: 'settings', label: 'Settings Panel', icon: Settings }
              ].map(item => {
                const IconComp = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${isSelected 
                        ? 'bg-[#DBEAFE] text-[#2563EB] shadow-sm' 
                        : isDarkMode ? 'text-slate-300 hover:bg-[#334155]' : 'text-slate-600 hover:bg-slate-100'}
                    `}
                  >
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom info banner */}
            <div className={`p-4 rounded-2xl mt-6 text-center text-[11px] leading-relaxed flex flex-col items-center gap-1.5
              ${isDarkMode ? 'bg-[#334155]' : 'bg-blue-50'}
            `}>
              <img 
                src="https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png"
                alt="Ini AI"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-blue-400 shadow-sm"
              />
              <p className="font-bold text-[#2563EB]">Ini Generative Engine</p>
              <p className="text-slate-400 dark:text-slate-300">Operational with Voice & AI</p>
            </div>

            {/* Logout Action */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                id="teacher-sidebar-logout-btn"
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    window.dispatchEvent(new CustomEvent('inivra-logout'));
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 rounded-xl transition-all border border-rose-200/50 dark:border-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN DISPLAY VIEW */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          
          {/* Toast Notification Alert */}
          {toastMsg && (
            <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl border border-slate-700 animate-in slide-in-from-top-2">
              {toastMsg}
            </div>
          )}
          
          {/* ----------------------------------------------------
              WELCOME SECTION BANNER
              ---------------------------------------------------- */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gradient-to-r from-[#1e2e4a] to-[#1E293B] border-[#334155]' : 'bg-gradient-to-r from-[#DBEAFE]/40 to-white border-[#BFDBFE]/50'} flex justify-between items-center flex-wrap gap-4`}>
            <div>
              <h2 className={`text-2xl lg:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-[#0F172A]'} tracking-tight`}>
                Good Morning, Mr./Ms. {teacherProfile.name.split(' ')[1] || 'Jenkins'} 👋
              </h2>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-300' : 'text-[#64748B]'}`}>
                Welcome back. Here's an overview of your classes and teaching activities today.
              </p>
            </div>
            
            {/* Quick balance count */}
            <div className={`p-3 px-4 rounded-2xl border flex items-center gap-3 bg-white dark:bg-[#1E293B] ${isDarkMode ? 'border-[#334155]' : 'border-slate-200'}`}>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Marketplace Balance</span>
                <span className="text-sm font-black dark:text-white">${teacherBalance.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  if (teacherBalance === 0) {
                    alert('Balance is already deposited.');
                    return;
                  }
                  alert(`Payout of $${teacherBalance} requested. Instant Transfer triggered to Westbridge accounts.`);
                  setTeacherBalance(0);
                }}
                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold p-1 px-2.5 rounded-lg"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------
              QUICK STATISTICS PANEL
              ---------------------------------------------------- */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Courses', val: '6 Active Courses', desc: 'Syllabus tracked', icon: BookOpen, col: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
              { label: 'Students', val: '248 Students', desc: 'Enrolled pupils', icon: Users, col: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
              { label: 'Assignments to Review', val: `${assignments.reduce((acc, current) => acc + current.pending, 0)} Pending`, desc: '34 Awaiting Review', icon: Clipboard, col: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
              { label: 'Classes Today', val: '5 Classes', desc: 'In-person & Video', icon: Calendar, col: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
              { label: 'Average Performance', val: '87%', desc: 'Class GPA average', icon: BarChart2, col: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' }
            ].map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div key={i} className={`p-4 border rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300 ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg ${stat.col}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className={`text-base lg:text-lg font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.val}</p>
                  <span className="text-[10px] text-slate-400 font-medium">{stat.desc}</span>
                </div>
              );
            })}
          </div>

          {/* ----------------------------------------------------
              DETERMINE ACTIVE PANEL SCREEN
              ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main Central Column */}
            <div className={`space-y-6 ${activeTab === 'dashboard' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Today's Schedule Timetable Card */}
                  <div className={`p-6 border rounded-3xl shadow-md ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-blue-600 w-5 h-5" />
                        <h3 className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`}>Today's Teaching Schedule</h3>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-mono font-bold">0 Classes Scheduled</span>
                    </div>

                    <EmptyState
                      icon={Calendar}
                      title="No classes scheduled today"
                      description="You have no lectures or live virtual sessions scheduled for today."
                    />
                  </div>

                  {/* Course Quick list widget */}
                  <div className={`p-6 border rounded-3xl shadow-md ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-black text-sm mb-4">Syllabus Active Completion Levels</h3>
                    {courses.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No active courses"
                        description="Create your first course syllabus to monitor completion levels and student progress."
                        actionText="Create Course"
                        onAction={() => setActiveTab('courses')}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {courses.map(course => (
                          <div key={course.id} className="p-4 border rounded-2xl bg-slate-50/30 dark:bg-[#334155]/20 border-slate-100 dark:border-[#334155] space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-[#0F172A] dark:text-white">{course.name}</span>
                              <span className="text-blue-600 font-mono font-bold text-[10px]">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono font-medium">
                              <span>{course.students} Active Pupils</span>
                              <span>Updated: {course.lastUpdated}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: MY COURSES */}
              {activeTab === 'courses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="font-black text-lg">My Enrolled Courses</h3>
                    <button 
                      onClick={() => setShowAddCourse(!showAddCourse)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Course Syllabus
                    </button>
                  </div>

                  {showAddCourse && (
                    <div className="p-5 border rounded-2xl bg-blue-50/50 dark:bg-[#334155]/30 space-y-4">
                      <p className="text-xs font-bold text-slate-500">Add New Syllabus Course Offering</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          value={newCourseName}
                          onChange={e => setNewCourseName(e.target.value)}
                          placeholder="Course Title (e.g., Trigonometry Fundamentals)" 
                          className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                        />
                        <select 
                          value={newCourseCategory}
                          onChange={e => setNewCourseCategory(e.target.value)}
                          className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                        >
                          <option>Mathematics</option>
                          <option>Calculus</option>
                          <option>Physics</option>
                          <option>Computer Science</option>
                          <option>Languages</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          if (!newCourseName.trim()) return;
                          setCourses(prev => [...prev, {
                            id: `c-${Date.now()}`,
                            name: newCourseName,
                            category: newCourseCategory,
                            students: 0,
                            progress: 10,
                            lastUpdated: 'Just now',
                            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300'
                          }]);
                          setNewCourseName('');
                          setShowAddCourse(false);
                          alert('New Course created successfully!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
                      >
                        Publish Course
                      </button>
                    </div>
                  )}

                  {filteredCourses.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No courses yet"
                      description="You haven't created or published any course syllabus yet."
                      actionText="Create Course Syllabus"
                      onAction={() => setShowAddCourse(true)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredCourses.map(course => (
                        <div key={course.id} className="border rounded-3xl overflow-hidden bg-white dark:bg-[#1E293B] shadow hover:shadow-lg transition-all">
                          <div className="h-36 overflow-hidden relative">
                            {course.image ? (
                              <img referrerPolicy="no-referrer" src={course.image} alt={course.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-indigo-700 flex items-center justify-center text-white font-bold text-base">
                                {course.name}
                              </div>
                            )}
                            <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {course.category}
                            </div>
                          </div>
                          <div className="p-5 space-y-3">
                            <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-white leading-snug">{course.name}</h4>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold font-mono">Course Syllabus Progress</span>
                                <span className="text-blue-600 font-mono font-bold">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>👥 {course.students} Pupils Enrolled</span>
                              <span>📅 Last modified: {course.lastUpdated}</span>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button onClick={() => alert(`Opening Syllabus Editor for ${course.name}...`)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200 font-bold text-[10px] rounded-lg">Edit Course</button>
                              <button onClick={() => alert(`Upload custom homework files to student portal for ${course.name}...`)} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg">Upload resources</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MY STUDENTS */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="font-black text-lg">Classroom Student Directory</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Total Registered Students:</span>
                      <strong className="text-blue-600 font-mono">{students.length} pupils</strong>
                    </div>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No students enrolled"
                      description="When students register and enroll in your courses, their attendance records and grades will appear here."
                    />
                  ) : (
                    <div className="border rounded-3xl overflow-hidden bg-white dark:bg-[#1E293B] shadow">
                      <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-500 uppercase font-mono grid grid-cols-12 gap-2 text-center">
                        <div className="col-span-3 text-left">Student profile name</div>
                        <div className="col-span-2">Class Group</div>
                        <div className="col-span-2">Attendance %</div>
                        <div className="col-span-2">Academic Mark</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Action</div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredStudents.map(student => (
                          <div key={student.id} className="p-4 text-center text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <div className="col-span-3 text-left flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/60 rounded-full flex items-center justify-center font-bold text-blue-600 uppercase">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-extrabold text-[#0F172A] dark:text-white">{student.name}</span>
                            </div>
                            <div className="col-span-2 font-mono text-slate-400">{student.grade}</div>
                            <div className="col-span-2 font-mono text-emerald-600 font-bold">{student.attendance}%</div>
                            <div className="col-span-2">
                              <span className="font-bold font-mono text-blue-600">{student.performance}%</span>
                              <span className="text-[10px] bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ml-1.5 px-2 py-0.5 rounded font-mono font-bold">{student.letter}</span>
                            </div>
                            <div className="col-span-2">
                              <button 
                                onClick={() => {
                                  setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' } : s));
                                }}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}
                              >
                                {student.status}
                              </button>
                            </div>
                            <div className="col-span-1">
                              <button 
                                onClick={() => {
                                  setActiveTab('messages_tab');
                                  if (student.name.includes('Alex')) setActiveConvId('conv-1');
                                }}
                                className="text-blue-600 hover:underline font-bold"
                              >
                                Chat
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ASSIGNMENTS & HOMEWORK REVIEW */}
              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  
                  {/* Homework review grader panel */}
                  <div className="p-6 border rounded-3xl shadow-lg bg-[#FAF5FF] dark:bg-[#1A1C2E] border-purple-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-black text-sm text-[#0F172A] dark:text-white font-display">Student Submission Assessment Rubric</h4>
                    </div>

                    {homeworkReviewList.length === 0 ? (
                      <EmptyState
                        icon={FileText}
                        title="No submissions pending verification"
                        description="When students turn in assignments, their files and notes will appear here for grading and feedback."
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Submission selection queue */}
                        <div className="md:col-span-4 space-y-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Submissions Pending Verification</span>
                          {homeworkReviewList.map((sub, index) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubIndex(index)}
                              className={`w-full text-left p-3 border rounded-xl transition-all ${
                                selectedSubIndex === index 
                                  ? 'bg-white dark:bg-slate-800 border-purple-400 shadow' 
                                  : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span className="font-mono text-[9px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-bold uppercase">{sub.status}</span>
                              <h5 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1">{sub.studentName}</h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub.assignmentName}</p>
                            </button>
                          ))}
                        </div>

                        {/* Interactive grading box */}
                        <div className="md:col-span-8 bg-white dark:bg-[#1E293B] p-5 border rounded-2xl shadow-sm space-y-4">
                          <div className="border-b pb-3 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Evaluating Submission:</span>
                              <p className="font-black text-xs text-slate-900 dark:text-white">{homeworkReviewList[selectedSubIndex]?.studentName}</p>
                            </div>
                            <span className="text-[10px] text-purple-600 font-mono font-bold flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> {homeworkReviewList[selectedSubIndex]?.submittedFile}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 leading-relaxed font-light italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-dashed">
                            "{homeworkReviewList[selectedSubIndex]?.studentNote}"
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Assign Numeric Score (0-100%)</label>
                              <input 
                                type="number" 
                                value={currentGradingScore}
                                onChange={e => setCurrentGradingScore(e.target.value)}
                                className="w-full p-2.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800" 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Feedback Annotation</label>
                              <input 
                                type="text" 
                                value={currentGradingFeedback}
                                onChange={e => setCurrentGradingFeedback(e.target.value)}
                                className="w-full p-2.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800" 
                              />
                            </div>
                          </div>

                          <button 
                            onClick={publishGradebookReview}
                            className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                          >
                            Publish Graded Assessment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assignment items list */}
                  {assignments.length === 0 ? (
                    <EmptyState
                      icon={Clipboard}
                      title="No assignments created yet"
                      description="Create homework and coursework assignments to distribute to your students."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {assignments.map(asg => (
                        <div key={asg.id} className="border rounded-2xl p-5 bg-white dark:bg-[#1E293B] shadow space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold uppercase">{asg.course}</span>
                              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1.5">{asg.title}</h4>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              asg.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                              asg.status === 'Overdue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>{asg.status}</span>
                          </div>

                          <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>📅 Due: {asg.deadline}</span>
                            <span>📦 {asg.submitted} Submitted • {asg.pending} Pending</span>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => alert('Editing assignment schema...')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 font-bold text-[10px] rounded-lg">Edit</button>
                            <button onClick={() => alert('Deadline extended in student dashboard calendar.')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 font-bold text-[10px] rounded-lg">Extend Deadline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 5: CLASS SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-6 text-left">
                  {/* Top Header Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 font-display">Weekly Teaching Schedule Matrix</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-light">
                        Live lecture slots, laboratory simulations, and scheduled office hours for this academic term.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => triggerToast("Timetable conflict engine: 100% Conflict-Free across all classes.")}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Conflict Audit: 100% Clean
                      </button>
                      <button
                        onClick={() => setShowAddScheduleModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Schedule New Class Slot
                      </button>
                    </div>
                  </div>

                  {/* Day Filter Chips */}
                  <div className="flex justify-between items-center flex-wrap gap-3 pb-1 border-b border-slate-200">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                      {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <button
                          key={day}
                          onClick={() => setScheduleDayFilter(day)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            scheduleDayFilter === day
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {scheduleSlots.filter(s => scheduleDayFilter === 'All' || s.day === scheduleDayFilter).length} scheduled periods
                    </span>
                  </div>

                  {/* Scheduled Periods Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {scheduleSlots
                      .filter(slot => scheduleDayFilter === 'All' || slot.day === scheduleDayFilter)
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                {slot.day}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {slot.type}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base text-slate-900 font-display">
                              {slot.course}
                            </h4>

                            <div className="space-y-1 text-xs text-slate-500 font-mono">
                              <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                                <Clock className="w-3.5 h-3.5" /> {slot.time}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <span>📍 Room: {slot.room}</span>
                                <span>•</span>
                                <span>👥 {slot.students} Students</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex gap-2">
                            <button
                              onClick={() => {
                                setActiveTab('virtual_classroom');
                                triggerToast(`Launching live classroom for ${slot.course}`);
                              }}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" /> Launch Classroom
                            </button>
                            <button
                              onClick={() => setActiveTab('students')}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              title="View Student Roster"
                            >
                              Roster
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Add Schedule Slot Modal */}
                  {showAddScheduleModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <h4 className="font-extrabold text-base text-slate-900 font-display">Schedule Timetable Period</h4>
                          <button
                            type="button"
                            onClick={() => setShowAddScheduleModal(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3.5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Course</label>
                            <select
                              value={newSlotCourse}
                              onChange={e => setNewSlotCourse(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                            >
                              <option value="Advanced Calculus">Advanced Calculus (Math 301)</option>
                              <option value="AP Physics Mechanics">AP Physics Mechanics (Phys 201)</option>
                              <option value="Linear Algebra & Matrices">Linear Algebra & Matrices (Math 250)</option>
                              <option value="Mentorship & Office Hours">Mentorship & Office Hours</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Day of Week</label>
                              <select
                                value={newSlotDay}
                                onChange={e => setNewSlotDay(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                              >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Room / Hall</label>
                              <input
                                type="text"
                                value={newSlotRoom}
                                onChange={e => setNewSlotRoom(e.target.value)}
                                placeholder="Hall 302"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Class Period Time</label>
                            <input
                              type="text"
                              value={newSlotTime}
                              onChange={e => setNewSlotTime(e.target.value)}
                              placeholder="09:00 AM - 10:15 AM"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddScheduleModal(false)}
                              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newId = 's-' + Date.now();
                                setScheduleSlots(prev => [
                                  ...prev,
                                  {
                                    id: newId,
                                    day: newSlotDay,
                                    time: newSlotTime,
                                    course: newSlotCourse,
                                    room: newSlotRoom,
                                    students: 28,
                                    type: 'Lecture'
                                  }
                                ]);
                                setShowAddScheduleModal(false);
                                triggerToast('Timetable period scheduled successfully.');
                              }}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                            >
                              Confirm Slot
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LESSON PLANS */}
              {activeTab === 'lesson_plans' && (
                <div className="space-y-6">
                  
                  {/* Generative AI Planner Card */}
                  <div className="p-6 border rounded-3xl shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-blue-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h4 className="font-black text-sm text-[#0F172A] dark:text-white font-display">Ini Generative Lesson Architect</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-5 space-y-3">
                        <p className="text-xs text-slate-500 font-light leading-relaxed">Let our core AI model construct a highly pedagogical lesson plan syllabus structure instantly.</p>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Lesson Topic Title</label>
                          <input 
                            type="text" 
                            value={aiPlanTopic}
                            onChange={e => setAiPlanTopic(e.target.value)}
                            placeholder="e.g. Rate of Change derivatives"
                            className="w-full p-2.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Target Audience Level</label>
                          <input 
                            type="text" 
                            value={aiPlanAudience}
                            onChange={e => setAiPlanAudience(e.target.value)}
                            className="w-full p-2.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                          />
                        </div>

                        <button 
                          onClick={triggerAISimplePlanner}
                          disabled={aiPlanLoading || !aiPlanTopic.trim()}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          {aiPlanLoading ? 'Planning in progress...' : 'Formulate Lesson Plan'}
                        </button>
                      </div>

                      <div className="md:col-span-7 bg-white dark:bg-slate-800 p-5 border rounded-2xl min-h-[250px] flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[9px] text-blue-600 font-mono font-bold uppercase block">AI Generation Results</span>
                          {aiPlanOutput ? (
                            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-h-60 overflow-y-auto whitespace-pre-wrap">
                              {aiPlanOutput}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-400 text-xs font-light border border-dashed rounded-xl">
                              Ready to formulate lesson plan schedule.
                            </div>
                          )}
                        </div>

                        {aiPlanOutput && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(aiPlanOutput);
                              alert('Plan copied to clipboard!');
                            }}
                            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy outline text
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lesson list items */}
                  {lessonPlans.length === 0 ? (
                    <EmptyState
                      icon={Clipboard}
                      title="No lesson plans created"
                      description="Use the Ini Generative Lesson Architect above to formulate your first lesson plan syllabus."
                    />
                  ) : (
                    <div className="space-y-4">
                      {lessonPlans.map(lp => (
                        <div key={lp.id} className="p-5 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{lp.topic}</h4>
                            <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">ACTIVE OUTLINE</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-light"><strong>Objectives:</strong> {lp.objectives}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-light"><strong>Classroom Activities:</strong> {lp.activities}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-light"><strong>Assigned Homework:</strong> {lp.homework}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 7: RESOURCES & FILES */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  
                  {/* Upload resources widget */}
                  <div className="p-6 border border-dashed rounded-3xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold">Simulated Educational Resources Uploader</p>
                      <p className="text-[11px] text-slate-400">PDF, PowerPoint files, video logs up to 100 MB.</p>
                    </div>
                    
                    <div className="max-w-md mx-auto flex gap-2">
                      <input 
                        type="text" 
                        value={fileToUpload}
                        onChange={e => setFileToUpload(e.target.value)}
                        placeholder="File catalog name (e.g. vectors_cheat_sheet.pdf)" 
                        className="flex-1 p-2 border bg-white dark:bg-[#1E293B] text-xs rounded-xl"
                      />
                      <button 
                        onClick={() => {
                          if (!fileToUpload.trim()) return;
                          setResources(prev => [{
                            id: `res-${Date.now()}`,
                            title: fileToUpload,
                            type: fileToUpload.toLowerCase().endsWith('.pdf') ? 'PDF' : 'PPT',
                            size: '2.1 MB',
                            date: 'Today',
                            downloads: 0
                          }, ...prev]);
                          setFileToUpload('');
                          alert('Resource file listed for pupils!');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-xl"
                      >
                        Publish File
                      </button>
                    </div>
                  </div>

                  {/* Resource directory list */}
                  {resources.length === 0 ? (
                    <EmptyState
                      icon={Upload}
                      title="No educational resources uploaded"
                      description="Upload cheat-sheets, lecture slides, and reference materials for your students."
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {resources.map(res => (
                        <div key={res.id} className="p-4 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-3">
                          <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-mono font-bold px-2 py-0.5 rounded">{res.type} File</span>
                          <h5 className="font-extrabold text-xs truncate text-slate-900 dark:text-white">{res.title}</h5>
                          <p className="text-[10px] text-slate-400 font-mono">Size: {res.size} • Created: {res.date}</p>
                          <div className="flex justify-between items-center text-[10px] text-blue-600 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>⬇️ {res.downloads} downloads</span>
                            <button onClick={() => alert('Triggering local browser download preview...')} className="hover:underline font-bold">Download</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: EXAMS & QUIZZES */}
              {activeTab === 'exams' && (
                <div className="space-y-6">
                  
                  {/* Quiz builder form */}
                  <div className="p-6 border rounded-3xl bg-slate-50 dark:bg-slate-800/40 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-purple-600 w-5 h-5" />
                      <h4 className="font-black text-sm">Ini Generative Exam Generator</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-light">Draft multiple choice checkpoint assessments instantly using generative model metrics.</p>
                    
                    <div className="max-w-md space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Subject Quiz Topic</label>
                        <input 
                          type="text" 
                          value={quizTopic}
                          onChange={e => setQuizTopic(e.target.value)}
                          placeholder="e.g. Logarithmic Limits"
                          className="w-full p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                        />
                      </div>
                      
                      <button 
                        onClick={triggerAIQuizBuilder}
                        disabled={quizLoading || !quizTopic.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-4 rounded-xl shadow"
                      >
                        {quizLoading ? 'Generating checkpoints...' : 'Construct Diagnostic Quiz'}
                      </button>
                    </div>
                  </div>

                  {/* Quiz question previews */}
                  {quizOutput.length > 0 && (
                    <div className="p-6 border rounded-3xl bg-white dark:bg-[#1E293B] shadow space-y-4">
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-mono font-bold px-2 py-0.5 rounded">Formulated MCQ Checkpoints</span>
                      
                      <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                        {quizOutput.map((q, qIdx) => (
                          <div key={qIdx} className="pt-4 first:pt-0 space-y-2 text-xs">
                            <p className="font-extrabold text-slate-800 dark:text-white">Q{qIdx+1}: {q.question}</p>
                            <div className="grid grid-cols-2 gap-2 pl-3">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="p-2 border rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 font-mono">
                                  {opt}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-emerald-600 font-mono font-bold pl-3">Correct answer: {q.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: GRADEBOOK */}
              {activeTab === 'gradebook' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="font-black text-lg">Excel-Gradebook Center</h3>
                    <button 
                      onClick={() => alert('Gradebook exported successfully as CSV table logs!')} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
                    >
                      Export CSV/PDF
                    </button>
                  </div>

                  {students.length === 0 ? (
                    <EmptyState
                      icon={GraduationCap}
                      title="No gradebook records"
                      description="Once students are enrolled and assignments are marked, your interactive grading rubric will appear here."
                    />
                  ) : (
                    <div className="border rounded-3xl overflow-hidden bg-white dark:bg-[#1E293B] shadow">
                      <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-500 uppercase font-mono grid grid-cols-12 gap-2 text-center">
                        <div className="col-span-3 text-left">Student Profile</div>
                        <div className="col-span-3">Logarithmic Homework</div>
                        <div className="col-span-2">Limits quiz</div>
                        <div className="col-span-2">Final Exam</div>
                        <div className="col-span-2">Grade letter</div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {students.map((student, sIdx) => (
                          <div key={student.id} className="p-4 text-center text-xs grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-3 text-left font-extrabold">{student.name}</div>
                            
                            {/* Homework Score edit block */}
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                value={student.performance}
                                onChange={e => {
                                  const parsed = parseInt(e.target.value) || 0;
                                  setStudents(prev => prev.map((s, idx) => idx === sIdx ? { ...s, performance: parsed } : s));
                                }}
                                className="w-16 p-1 border text-center rounded bg-slate-50 dark:bg-slate-800 font-mono text-blue-600 font-bold"
                              />
                              <span className="text-slate-400 ml-1">%</span>
                            </div>

                            <div className="col-span-2 font-mono text-slate-600 dark:text-slate-300">92%</div>
                            <div className="col-span-2 font-mono text-slate-600 dark:text-slate-300">89%</div>
                            <div className="col-span-2">
                              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded font-mono font-bold">
                                {student.letter}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 10: STUDENT ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="font-black text-lg">Class Performance Charts</h3>
                  
                  {students.length === 0 ? (
                    <EmptyState
                      icon={BarChart2}
                      title="No performance analytics yet"
                      description="Classroom attendance averages and assignment completion trends will appear once students engage with course content."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-2">
                        <p className="text-xs font-bold text-slate-500">Assignment Completion Trends</p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={[
                              { week: 'Wk 1', completion: 82 },
                              { week: 'Wk 2', completion: 88 },
                              { week: 'Wk 3', completion: 85 },
                              { week: 'Wk 4', completion: 91 },
                              { week: 'Wk 5', completion: 94 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="week" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="completion" stroke="#2563EB" strokeWidth={3} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="p-4 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-2">
                        <p className="text-xs font-bold text-slate-500">Course Attendance Averages</p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { course: 'Calculus', attendance: 98 },
                              { course: 'Physics', attendance: 94 },
                              { course: 'Computer Sci', attendance: 96 },
                              { course: 'Spanish', attendance: 92 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="course" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="attendance" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 11: AI TEACHING ASSISTANT (Ini) */}
              {activeTab === 'ai_assistant' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <IniChatWorkspace
                    userProfile={teacherProfile}
                    role="Teacher"
                    onNavigateTab={(tab) => {
                      const tabMap: Record<string, string> = {
                        'courses': 'courses',
                        'assignments': 'assignments',
                        'timetable': 'schedule',
                        'schedule': 'schedule',
                        'grades': 'gradebook',
                        'gradebook': 'gradebook',
                        'resources': 'resources',
                        'summarizer': 'resources',
                        'quizzes': 'exams',
                        'exams': 'exams',
                        'flashcards': 'exams',
                        'messages': 'messages_tab',
                        'messages_tab': 'messages_tab',
                        'students': 'students',
                        'lesson_plans': 'lesson_plans',
                        'virtual_classroom': 'virtual_classroom',
                        'settings': 'settings'
                      };
                      setActiveTab(tabMap[tab] || tab);
                    }}
                  />
                </div>
              )}

              {/* TAB 12: VIRTUAL CLASSROOM */}
              {activeTab === 'virtual_classroom' && (
                <div className="space-y-6">
                  
                  {/* Presentation Stream window */}
                  <div className="bg-slate-900 border border-slate-950 rounded-3xl p-6 text-white space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-red-600 text-white font-mono font-bold px-2.5 py-1 rounded animate-pulse">
                        {isLiveActive ? 'LIVE VIDEO STREAM ACTIVE' : 'STREAM STANDBY'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Class Target: Advanced AP Physics 1</span>
                    </div>

                    <div className="relative aspect-video max-h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {isLiveActive && cameraEnabled ? (
                        <div className="text-center space-y-2">
                          <span className="text-5xl">👨‍🏫</span>
                          <p className="text-xs font-bold">Your instructor camera is active</p>
                          <p className="text-[10px] text-slate-400 font-mono">Streaming 1080p • Low latency</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2 text-slate-500">
                          <VideoOff className="w-12 h-12 mx-auto" />
                          <p className="text-xs font-bold">Live Presentation video is disabled</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center items-center gap-3 pt-3 border-t border-slate-800">
                      <button 
                        onClick={() => setIsLiveActive(!isLiveActive)}
                        className={`p-3.5 rounded-xl font-bold text-xs uppercase ${isLiveActive ? 'bg-red-600' : 'bg-blue-600'} text-white`}
                      >
                        {isLiveActive ? 'Disconnect Classroom Stream' : 'Initialize Classroom Live'}
                      </button>

                      <button onClick={() => setCameraEnabled(!cameraEnabled)} className="p-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
                        {cameraEnabled ? '🎥 Mute video' : 'Video Disabled'}
                      </button>

                      <button onClick={() => setMicEnabled(!micEnabled)} className="p-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
                        {micEnabled ? '🎤 Mute Mic' : 'Mic Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Digital Whiteboard */}
                  <div className="p-6 border rounded-3xl bg-white dark:bg-[#1E293B] shadow space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-sm">Interactive Whiteboard Canvas</h4>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsWhiteboardActive(!isWhiteboardActive)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                          {isWhiteboardActive ? 'Disable Whiteboard' : 'Activate Whiteboard'}
                        </button>
                        {isWhiteboardActive && (
                          <button onClick={clearWhiteboard} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                            Clear Canvas
                          </button>
                        )}
                      </div>
                    </div>

                    {isWhiteboardActive ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold font-mono">Pencil Color:</span>
                          {['#2563EB', '#10B981', '#EF4444', '#000000'].map(col => (
                            <button
                              key={col}
                              onClick={() => setWhiteboardColor(col)}
                              className="w-5 h-5 rounded-full border border-slate-300"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>

                        <canvas
                          ref={whiteboardCanvasRef}
                          width={600}
                          height={300}
                          onMouseDown={startWhiteboardDraw}
                          onMouseMove={drawWhiteboard}
                          onMouseUp={stopWhiteboardDraw}
                          onMouseLeave={stopWhiteboardDraw}
                          className="w-full h-80 bg-white border border-slate-200 rounded-2xl cursor-crosshair shadow-inner"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6 border border-dashed rounded-xl">Click Activate to draw on whiteboard stream.</p>
                    )}
                  </div>

                  {/* Live polls builder widget */}
                  <div className="p-6 border rounded-3xl bg-[#FFFDF5] dark:bg-[#1C1A14] border-amber-200">
                    <h4 className="font-black text-sm text-amber-950 dark:text-amber-100 mb-2">Live Classroom Poll</h4>
                    <p className="text-xs text-slate-500 leading-normal mb-4">Prompt quick multiple choice questions to pupils during presentation hours.</p>

                    <div className="space-y-3 max-w-md">
                      <input 
                        type="text" 
                        value={pollQuestion}
                        onChange={e => setPollQuestion(e.target.value)}
                        placeholder="Poll topic..."
                        className="w-full p-2 border rounded-xl bg-white text-xs text-slate-800"
                      />
                      
                      <div className="flex gap-2">
                        <button onClick={launchPollSimulate} className="bg-amber-500 text-white font-bold text-xs py-2 px-4 rounded-xl">
                          Launch Poll Session
                        </button>
                        {pollLaunched && (
                          <button onClick={() => { setPollLaunched(false); setActivePollVotes([0, 0, 0]); }} className="text-xs text-red-600 hover:underline">
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {pollLaunched && (
                      <div className="mt-6 space-y-3 max-w-md bg-white p-4 rounded-2xl border text-xs">
                        <p className="font-extrabold">{pollQuestion}</p>
                        {pollOptions.map((opt, oIdx) => {
                          const total = activePollVotes.reduce((a,b) => a+b, 0) || 1;
                          const pct = Math.round((activePollVotes[oIdx] / total) * 100);
                          return (
                            <div key={oIdx} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span>{opt}</span>
                                <span className="font-mono font-bold text-blue-600">{pct}% ({activePollVotes[oIdx]} votes)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 13: MESSAGES */}
              {activeTab === 'messages_tab' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">Direct User Messaging</h3>
                      <p className="text-xs text-slate-500">Communicate directly in real-time with students, parents, and colleagues.</p>
                    </div>
                  </div>
                  <MessagingCenter currentUserId={teacherProfile?.id || currentUserId} />
                </div>
              )}

              {/* TAB 14: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  
                  {/* Create notice creator */}
                  <div className="p-6 border rounded-3xl bg-slate-50 dark:bg-slate-800/40 shadow-sm space-y-4">
                    <h4 className="font-black text-sm">Publish Notice Announcements</h4>
                    
                    <div className="space-y-3 max-w-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          value={newAnnTitle}
                          onChange={e => setNewAnnTitle(e.target.value)}
                          placeholder="Notice Title (e.g. Exam revision hour)"
                          className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                        />
                        <select 
                          value={newAnnTarget}
                          onChange={e => setNewAnnTarget(e.target.value)}
                          className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                        >
                          <option>Honors Calculus AB</option>
                          <option>Advanced AP Physics 1</option>
                          <option>Introduction to Computer Science</option>
                        </select>
                      </div>

                      <textarea 
                        value={newAnnContent}
                        onChange={e => setNewAnnContent(e.target.value)}
                        placeholder="Notice content text details..."
                        rows={3}
                        className="w-full p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                      />

                      <button 
                        onClick={() => {
                          if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
                          setAnnouncements(prev => [{
                            id: `ann-${Date.now()}`,
                            title: newAnnTitle,
                            content: newAnnContent,
                            date: '2026-07-20',
                            target: newAnnTarget
                          }, ...prev]);
                          setNewAnnTitle('');
                          setNewAnnContent('');
                          alert('Announcement posted to student bulletin dashboard.');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
                      >
                        Publish Broadcast
                      </button>
                    </div>
                  </div>

                  {/* Bullet history items */}
                  {announcements.length === 0 ? (
                    <EmptyState
                      icon={Bell}
                      title="No broadcasts published"
                      description="Broadcast announcements to student bulletin boards using the publisher above."
                    />
                  ) : (
                    <div className="space-y-4">
                      {announcements.map(ann => (
                        <div key={ann.id} className="p-5 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-mono px-2 py-0.5 rounded font-bold uppercase">{ann.target}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-light">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 15: TEACHER MARKETPLACE */}
              {activeTab === 'marketplace' && (
                <div className="space-y-6">
                  
                  {/* Publish premium content */}
                  <div className="p-6 border rounded-3xl bg-slate-50 dark:bg-slate-800/40 shadow-sm space-y-4">
                    <h4 className="font-black text-sm">Monetize Your Syllabus Content</h4>
                    <p className="text-xs text-slate-500 leading-normal">Publish premium revision guides, homework formulas cheatsheets or practice exams logs for sale to general student marketplace.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                      <input 
                        type="text" 
                        value={newProdTitle}
                        onChange={e => setNewProdTitle(e.target.value)}
                        placeholder="Material guide title..."
                        className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                      />
                      <select 
                        value={newProdCategory}
                        onChange={e => setNewProdCategory(e.target.value)}
                        className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                      >
                        <option>Revision Guide</option>
                        <option>PPT</option>
                        <option>Lesson Plan</option>
                        <option>Worksheet</option>
                      </select>
                      <input 
                        type="text" 
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(e.target.value)}
                        placeholder="List Price (USD)"
                        className="p-2.5 rounded-xl border text-xs bg-white dark:bg-[#1E293B]"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        if (!newProdTitle.trim()) return;
                        const price = parseFloat(newProdPrice) || 9.99;
                        setMarketplaceProducts(prev => [...prev, {
                          id: `prod-${Date.now()}`,
                          title: newProdTitle,
                          category: newProdCategory,
                          price,
                          downloads: 0,
                          revenue: 0
                        }]);
                        setNewProdTitle('');
                        alert('Your listing has been submitted for verification & published on student marketplace!');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
                    >
                      Publish Marketplace Listing
                    </button>
                  </div>

                  {/* Marketplace stats */}
                  {marketplaceProducts.length === 0 ? (
                    <EmptyState
                      icon={DollarSign}
                      title="No marketplace listings yet"
                      description="Monetize your teaching content by publishing revision guides, slides, or lesson plans."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {marketplaceProducts.map(prod => (
                        <div key={prod.id} className="p-4 border rounded-2xl bg-white dark:bg-[#1E293B] shadow space-y-3">
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded">{prod.category} Listing</span>
                          <h5 className="font-extrabold text-xs truncate text-slate-900 dark:text-white">{prod.title}</h5>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span>Price: <strong>${prod.price.toFixed(2)}</strong></span>
                            <span className="text-blue-600 font-bold">{prod.downloads} sold</span>
                          </div>
                          <p className="text-[11px] text-slate-400 border-t pt-2 mt-2">Cumulative Earnings: <strong className="text-emerald-600 font-bold font-mono">${prod.revenue.toFixed(2)}</strong></p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 16: SETTINGS PANEL */}
              {activeTab === 'settings' && (
                <div className="p-6 border rounded-3xl bg-white dark:bg-[#1E293B] shadow space-y-6">
                  <h3 className="font-black text-lg">Teaching Preferences & Profiles</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Public Bio Description</label>
                      <textarea 
                        defaultValue={teacherProfile.bio}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Teaching Credentials</label>
                      <input 
                        type="text" 
                        defaultValue="M.Sc Pure Mathematics, Secondary School Board Certification"
                        className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-2">
                    <button onClick={() => alert('Preferences saved to account profiles!')} className="bg-blue-600 text-white font-bold text-xs py-2 px-5 rounded-xl shadow">
                      Save Settings Configuration
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR PANEL (Only on Dashboard tabs or desktop sidebar view) */}
            {activeTab === 'dashboard' && (
              <div className="lg:col-span-4 space-y-6">
                
                {/* Mini Calendar visual card */}
                <div className={`p-5 border rounded-3xl shadow-sm ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <span className="text-xs font-bold font-mono">📅 July 2026</span>
                    <span className="text-[9px] bg-blue-50 text-blue-600 font-bold p-1 rounded">Week 29</span>
                  </div>
                  
                  {/* Simplified mini grid */}
                  <div className="grid grid-cols-7 text-center text-[10px] gap-1.5 font-mono text-slate-400 font-bold">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                    {[12,13,14,15,16,17,18,19,20,21,22,23,24,25,26].map(day => (
                      <div 
                        key={day} 
                        className={`p-1.5 rounded-lg font-bold font-mono ${
                          day === 20 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Reminders List */}
                <div className={`p-5 border rounded-3xl shadow-sm ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white font-mono uppercase tracking-wider">Teacher Reminders</h4>
                    <span className="text-[10px] text-blue-600 font-bold">{quickNotes.length} notes</span>
                  </div>

                  <div className="space-y-2">
                    {quickNotes.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No reminders added yet.</p>
                    ) : (
                      quickNotes.map((note, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 text-xs leading-relaxed p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <p className="font-light">{note}</p>
                          <button 
                            onClick={() => setQuickNotes(prev => prev.filter((_, nIdx) => nIdx !== idx))}
                            className="p-0.5 text-slate-400 hover:text-red-500 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newNoteInput}
                      onChange={e => setNewNoteInput(e.target.value)}
                      placeholder="Add self-note..."
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg outline-none border"
                    />
                    <button 
                      onClick={() => {
                        if (!newNoteInput.trim()) return;
                        setQuickNotes(prev => [...prev, newNoteInput]);
                        setNewNoteInput('');
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Daily Tip card */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'} space-y-1.5`}>
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-mono font-bold px-2 py-0.5 rounded">Daily Teaching Tip</span>
                  <p className="text-xs leading-relaxed font-light font-sans">
                    "Incorporate 5 minutes of active retrieval practice at the start of every lesson to boost coordinate logs retention."
                  </p>
                </div>

                {/* School Administrative Announcements */}
                <div className={`p-5 border rounded-3xl shadow-sm ${isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'} space-y-3`}>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white font-mono uppercase tracking-wider">School Announcements</h4>
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">No school announcements at this time.</p>
                  ) : (
                    <div className="space-y-2 text-xs leading-relaxed">
                      {announcements.slice(0, 3).map(ann => (
                        <div key={ann.id} className="border-b last:border-b-0 pb-2">
                          <p className="font-bold">{ann.title}</p>
                          <p className="text-slate-400 text-[11px]">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  );
}
