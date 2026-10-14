import React, { useState, useEffect } from 'react';
import { db } from '../InivraDatabase';
import { UserProfile, SchoolApproval } from '../types';
import { 
  Building2, Users, Clock, LogOut, Trash2, Search, Plus, 
  CheckCircle2, RefreshCw, Star, ArrowUpRight, BookOpen, 
  UserCheck, Sparkles, ChevronRight, FileText, Calendar, 
  DollarSign, MessageSquare, Clipboard, Settings, GraduationCap, 
  Bell, Globe, Sun, Moon, Edit, Archive, Upload, Download, 
  Send, AlertTriangle, Play, ChevronDown, Check, X, Info, HelpCircle, Receipt
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import EmptyState from './EmptyState';
import MessagingCenter from './MessagingCenter';

interface SchoolAdminDashboardProps {
  currentUserId: string;
  onLogout: () => void;
}

export default function SchoolAdminDashboard({ currentUserId, onLogout }: SchoolAdminDashboardProps) {
  // Profile & general state
  const [profile, setProfile] = useState<UserProfile | null>(db.getProfile(currentUserId) || {
    id: currentUserId,
    name: 'Principal Vance',
    email: 'vance@inivraschools.edu',
    role: 'SchoolAdmin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    balance: 0
  });

  const adminName = profile?.name || 'Principal Vance';

  // State activeTab matches Left Sidebar: 14 distinct tabs!
  type TabType = 
    | 'dashboard' | 'students' | 'teachers' | 'classes' | 'courses' 
    | 'timetable' | 'exams' | 'reports' | 'messages' | 'announcements' 
    | 'library' | 'ai_assistant' | 'billing' | 'settings';

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Interactive filters for Analytics Chart
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [teacherFilter, setTeacherFilter] = useState('All Teachers');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');

  // Chart type tabs inside Performance dashboard
  type ChartType = 'attendance' | 'academic' | 'completion' | 'teacher_act' | 'usage' | 'engagement';
  const [activeChart, setActiveChart] = useState<ChartType>('attendance');

  // Database stores initialized cleanly
  const [students, setStudents] = useState<{ id: string; name: string; grade: string; class: string; attendance: string; average: string; status: string; avatar: string }[]>([]);

  const [teachers, setTeachers] = useState<{ id: string; name: string; department: string; subjects: string; classes: string; email: string; status: string }[]>([]);

  const [classes, setClasses] = useState<{ id: string; name: string; teacher: string; room: string; limit: string; schedule: string }[]>([]);

  const [announcements, setAnnouncements] = useState<{ id: string; title: string; desc: string; audience: string; date: string }[]>([]);

  const [libraryFiles, setLibraryFiles] = useState<{ name: string; type: string; date: string; downloads: number }[]>([]);

  // Messages UI
  const [activeChatGroup, setActiveChatGroup] = useState<'Teachers' | 'Students' | 'Parents' | 'Support'>('Teachers');
  const [chatThreads, setChatThreads] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    Teachers: [],
    Students: [],
    Parents: [],
    Support: []
  });
  const [newMsgText, setNewMsgText] = useState('');

  // Search input in Navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals & Interactive helpers
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);

  // Forms states
  const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: 'Grade 11', class: 'Class A' });
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', dept: 'Science', subjects: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', desc: '', audience: 'Entire School' });

  // Reports generator simulation
  const [selectedReportType, setSelectedReportType] = useState('Student Performance Reports');
  const [generatingReport, setGeneratingReport] = useState(false);

  // AI Center state (Ini Panel)
  const [iniPrompt, setIniPrompt] = useState('');
  const [iniResponses, setIniResponses] = useState<string[]>([
    "Hello, Principal Vance. I'm Ini, your AI School Assistant. How can I assist your school operations today?"
  ]);
  const [iniThinking, setIniThinking] = useState(false);

  // Floating Orb Assistant state
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<{ sender: 'user' | 'ini'; text: string }[]>([
    { sender: 'ini', text: "Hello, Principal Vance. How can I help you manage your school today?" }
  ]);
  const [floatingInput, setFloatingInput] = useState('');
  const [floatingSpeaking, setFloatingSpeaking] = useState(false);

  // Timetable Scheduled List
  const [timetableEvents, setTimetableEvents] = useState<{ day: string; time: string; subject: string; teacher: string; room: string }[]>([]);
  const [exams, setExams] = useState<{ id: string; name: string; date: string; type: string }[]>([]);
  const [invoices, setInvoices] = useState<{ desc: string; date: string; total: string }[]>([]);

  // Helper trigger custom toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic Chart Generator relying on filters
  const generateChartData = () => {
    const scale = 
      gradeFilter === 'Grade 12' ? 1.15 :
      gradeFilter === 'Grade 9' ? 0.85 :
      gradeFilter === 'Grade 10' ? 0.95 : 1.0;

    if (activeChart === 'attendance') {
      return [
        { label: 'Week 1', Value: Math.round(92 * scale) },
        { label: 'Week 2', Value: Math.round(95 * scale) },
        { label: 'Week 3', Value: Math.round(91 * scale) },
        { label: 'Week 4', Value: Math.round(96 * scale) },
        { label: 'Today', Value: Math.round(94 * scale) }
      ];
    } else if (activeChart === 'academic') {
      return [
        { label: 'AP Calculus', Value: Math.round(89 * scale) },
        { label: 'AP Physics', Value: Math.round(91 * scale) },
        { label: 'World History', Value: Math.round(84 * scale) },
        { label: 'Chemistry', Value: Math.round(88 * scale) },
        { label: 'Algebra', Value: Math.round(92 * scale) }
      ];
    } else if (activeChart === 'completion') {
      return [
        { label: 'Math HW', Value: Math.round(95 * scale) },
        { label: 'Physics Lab', Value: Math.round(88 * scale) },
        { label: 'History Essay', Value: Math.round(79 * scale) },
        { label: 'Spanish Vocab', Value: Math.round(96 * scale) }
      ];
    } else if (activeChart === 'teacher_act') {
      return [
        { label: 'Sarah Jenkins', Value: 24 },
        { label: 'Marcus Vance', Value: 18 },
        { label: 'David Miller', Value: 15 },
        { label: 'Clara Oswald', Value: 8 }
      ];
    } else if (activeChart === 'usage') {
      return [
        { label: 'Mon', Value: 420 },
        { label: 'Tue', Value: 512 },
        { label: 'Wed', Value: 490 },
        { label: 'Thu', Value: 580 },
        { label: 'Fri', Value: 530 }
      ];
    } else {
      return [
        { label: 'May', Value: 12000 },
        { label: 'June', Value: 19000 },
        { label: 'July', Value: 24000 }
      ];
    }
  };

  // Add items functions
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;
    const item = {
      id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newStudent.name,
      grade: newStudent.grade,
      class: newStudent.class,
      attendance: '98%',
      average: '90%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
    };
    setStudents([item, ...students]);
    setShowAddStudent(false);
    setNewStudent({ name: '', email: '', grade: 'Grade 11', class: 'Class A' });
    triggerToast(`Enrolled student ${item.name} into the registry!`);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return;
    const item = {
      id: `TCH-${Math.floor(10 + Math.random() * 90)}`,
      name: newTeacher.name,
      department: newTeacher.dept,
      subjects: newTeacher.subjects || 'General',
      classes: 'Class A',
      email: newTeacher.email,
      status: 'Active'
    };
    setTeachers([item, ...teachers]);
    setShowAddTeacher(false);
    setNewTeacher({ name: '', email: '', dept: 'Science', subjects: '' });
    triggerToast(`Added teacher ${item.name} to the faculty roster.`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.desc) return;
    const item = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      desc: newAnnouncement.desc,
      audience: newAnnouncement.audience,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([item, ...announcements]);
    setShowCreateAnnouncement(false);
    setNewAnnouncement({ title: '', desc: '', audience: 'Entire School' });
    triggerToast(`Announcement "${item.title}" has been published.`);
  };

  // Simulated AI query
  const runAiQuery = async (prompt: string, bypassInput: boolean = false) => {
    const activePrompt = bypassInput ? prompt : iniPrompt;
    if (!activePrompt.trim()) return;
    setIniThinking(true);
    setIniResponses(prev => [...prev, `[You]: ${activePrompt}`]);
    if (!bypassInput) setIniPrompt('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: activePrompt,
          systemInstruction: "You are Ini, the specialized AI School Operational Director for Inivra Learn. You answer administrative queries with concrete statistics and professional regulatory advice."
        })
      });
      const data = await response.json();
      setIniResponses(prev => [...prev, data.text || "I have optimized the timetable coordinates. No double-bookings detected in Lab 101."]);
    } catch (err) {
      setTimeout(() => {
        setIniResponses(prev => [...prev, "Analyzed attendance records. Recommended intervention for Grade 12 Class C based on current seasonal drop."]);
      }, 1000);
    } finally {
      setIniThinking(false);
    }
  };

  // Floating Assist Send
  const handleFloatingSend = async () => {
    if (!floatingInput.trim()) return;
    const text = floatingInput;
    setFloatingMessages(prev => [...prev, { sender: 'user', text }]);
    setFloatingInput('');
    setFloatingSpeaking(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemInstruction: "You are Ini, a friendly 60px glowing orb floating AI assistant inside the Inivra Learn School Administrator console. Keep answers compact (1-2 sentences) and professional."
        })
      });
      const data = await response.json();
      const reply = data.text || "I can guide you through student transcripts, system analytics, or generate PDFs.";
      setFloatingMessages(prev => [...prev, { sender: 'ini', text: reply }]);
      
      // Speech Synthesis if enabled
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setFloatingMessages(prev => [...prev, { sender: 'ini', text: "Analyzing. I have flagged the pending compliance reports for your immediate review." }]);
    } finally {
      setFloatingSpeaking(false);
    }
  };

  // Simulating voice command
  const simulateVoiceWake = () => {
    setFloatingOpen(true);
    setFloatingMessages(prev => [...prev, { sender: 'ini', text: "Hello, Principal Vance. I heard you call. How can I assist you with your school today?" }]);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Hello, Principal Vance. I heard you call. How can I assist you with your school today?"));
    }
  };

  // Generate Reports Simulation
  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      triggerToast(`Report "${selectedReportType}" successfully compiled!`);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!newMsgText.trim()) return;
    const fresh = { sender: 'Principal Vance', text: newMsgText, time: 'Now' };
    setChatThreads({
      ...chatThreads,
      [activeChatGroup]: [...chatThreads[activeChatGroup], fresh]
    });
    setNewMsgText('');
  };

  // Search filter lists
  const filteredStudentsList = students.filter(s => 
    s.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
    s.grade.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredTeachersList = teachers.filter(t => 
    t.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    t.department.toLowerCase().includes(globalSearch.toLowerCase()) ||
    t.subjects.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div id="school-admin-dashboard" className="min-h-screen bg-[#F8FAFC] flex flex-col relative font-sans text-slate-800">
      
      {/* 1. TOP FIXED NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 md:px-6 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center gap-3">
          <img 
            id="nav-logo"
            src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
            alt="studyHUB-inivra learn"
            referrerPolicy="no-referrer"
            className="h-9 w-9 object-contain rounded-xl shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#0F172A] leading-none">studyHUB-inivra learn</span>
            <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider mt-0.5">School Dashboard</span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students, teachers, classes, reports, or settings..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => triggerToast("All school notifications are currently up to date.")} className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-xl relative transition-all" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#7C3AED] rounded-full"></span>
          </button>
          
          <button onClick={() => setActiveTab('messages')} className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-xl relative transition-all" title="Messages">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#2563EB] rounded-full"></span>
          </button>

          <button onClick={() => setActiveTab('timetable')} className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-xl transition-all" title="School Calendar">
            <Calendar className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600 bg-white">
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-semibold">EN</span>
          </div>

          <button onClick={() => triggerToast("System-wide visual theme synced.")} className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-xl transition-all">
            <Sun className="w-4 h-4" />
          </button>

          {/* Administrator Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-all border border-slate-100"
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
                alt="Admin Profile"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden sm:inline text-xs font-bold text-slate-700">{adminName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-[#0F172A]">{adminName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Institutional Admin</p>
                </div>
                <button onClick={() => { setShowProfileDropdown(false); setActiveTab('settings'); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> School Profile
                </button>
                <button onClick={() => { setShowProfileDropdown(false); setActiveTab('settings'); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Account Settings
                </button>
                <button onClick={() => { setShowProfileDropdown(false); setActiveTab('billing'); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Subscription & Billing
                </button>
                <button onClick={() => { setShowProfileDropdown(false); triggerToast("Opening help center ticket systems..."); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Help Centre
                </button>
                <button onClick={() => { setShowProfileDropdown(false); onLogout(); }} className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TOAST NOTIFIER */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. LEFT SIDEBAR + MAIN CONTENT LAYOUT */}
      <div className="flex-1 flex pt-16">
        
        {/* Left Permanent Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-30 hidden lg:block overflow-y-auto">
          <div className="p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 font-mono">Administrative Functions</div>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Building2 },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'teachers', label: 'Teachers', icon: UserCheck },
                { id: 'classes', label: 'Classes', icon: GraduationCap },
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'timetable', label: 'Timetable', icon: Clock },
                { id: 'exams', label: 'Exams & Assessments', icon: FileText },
                { id: 'reports', label: 'Reports & Analytics', icon: Clipboard },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'announcements', label: 'Announcements', icon: Bell },
                { id: 'library', label: 'Resource Library', icon: FileText },
                { id: 'ai_assistant', label: 'AI School Assistant (Ini)', icon: Sparkles },
                { id: 'billing', label: 'Subscription & Billing', icon: DollarSign },
                { id: 'settings', label: 'School Settings', icon: Settings }
              ].map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as TabType); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                      isActive 
                        ? 'bg-[#DBEAFE] text-[#2563EB] font-bold' 
                        : 'text-[#64748B] hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile View Navigation bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-40 flex items-center justify-around text-slate-600">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center text-[10px] ${activeTab === 'dashboard' ? 'text-[#2563EB] font-bold' : ''}`}>
            <Building2 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('students')} className={`flex flex-col items-center text-[10px] ${activeTab === 'students' ? 'text-[#2563EB] font-bold' : ''}`}>
            <Users className="w-4 h-4" />
            <span>Students</span>
          </button>
          <button onClick={() => setActiveTab('teachers')} className={`flex flex-col items-center text-[10px] ${activeTab === 'teachers' ? 'text-[#2563EB] font-bold' : ''}`}>
            <UserCheck className="w-4 h-4" />
            <span>Teachers</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center text-[10px] ${activeTab === 'reports' ? 'text-[#2563EB] font-bold' : ''}`}>
            <Clipboard className="w-4 h-4" />
            <span>Reports</span>
          </button>
          <button onClick={() => setActiveTab('ai_assistant')} className={`flex flex-col items-center text-[10px] ${activeTab === 'ai_assistant' ? 'text-[#2563EB] font-bold' : ''}`}>
            <Sparkles className="w-4 h-4" />
            <span>Ini AI</span>
          </button>
        </div>

        {/* 3. MAIN WORKSPACE CONTENT */}
        <main className="flex-1 lg:pl-64 min-w-0 pb-16 lg:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">Good Morning, {adminName} 👋</h2>
                <p className="text-xs text-[#64748B] mt-1">Here's an overview of your school's activities and performance today.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-slate-500 font-medium bg-slate-50 border px-2.5 py-1 rounded-xl">SYSTEM STATUS: FULLY SYNCHRONIZED</span>
              </div>
            </div>

            {/* ===================================== */}
            {/* TAB: DASHBOARD OVERVIEW */}
            {/* ===================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* 6 School Overview Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  
                  {/* Total Students */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">STUDENTS</span>
                      <Users className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#0F172A] mt-2">{students.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Enrolled Students</p>
                  </div>

                  {/* Total Teachers */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">TEACHERS</span>
                      <UserCheck className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#0F172A] mt-2">{teachers.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Faculty Staff</p>
                  </div>

                  {/* Active Classes */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">CLASSES</span>
                      <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#0F172A] mt-2">{classes.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Schedules Daily</p>
                  </div>

                  {/* Active Courses */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">COURSES</span>
                      <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#0F172A] mt-2">{classes.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Active Pathways</p>
                  </div>

                  {/* Attendance Today */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">ATTENDANCE</span>
                      <Clock className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <p className="text-xl font-extrabold text-emerald-600 mt-2">{students.length > 0 ? '94%' : '0%'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Average Attendance</p>
                  </div>

                  {/* Pending Requests */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#64748B] font-mono">PENDING</span>
                      <Clipboard className="w-4 h-4 text-[#F97316]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#F97316] mt-2">0</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Awaiting Review</p>
                  </div>

                </div>

                {/* Performance Analytics Dashboard + Quick Access Right Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Performance Chart Card */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">School Performance Dashboard</h3>
                        <p className="text-xs text-[#64748B]">Visualize dynamic trends across the institution.</p>
                      </div>

                      {/* Dropdown filters */}
                      <div className="flex flex-wrap gap-1">
                        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="p-1 border rounded-lg text-[10px] font-semibold text-slate-600 bg-slate-50">
                          <option>All Grades</option>
                          <option>Grade 9</option>
                          <option>Grade 10</option>
                          <option>Grade 11</option>
                          <option>Grade 12</option>
                        </select>
                        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="p-1 border rounded-lg text-[10px] font-semibold text-slate-600 bg-slate-50">
                          <option>All Classes</option>
                          <option>Class A</option>
                          <option>Class B</option>
                          <option>Class C</option>
                        </select>
                        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="p-1 border rounded-lg text-[10px] font-semibold text-slate-600 bg-slate-50">
                          <option>All Subjects</option>
                          <option>Mathematics</option>
                          <option>Science</option>
                          <option>History</option>
                        </select>
                      </div>
                    </div>

                    {/* Chart Tabs selector */}
                    <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl">
                      {[
                        { id: 'attendance', label: 'Student Attendance' },
                        { id: 'academic', label: 'Academic Performance' },
                        { id: 'completion', label: 'Completion Rates' },
                        { id: 'teacher_act', label: 'Teacher Activity' },
                        { id: 'usage', label: 'Platform Usage' },
                        { id: 'engagement', label: 'Engagement' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveChart(tab.id as ChartType)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            activeChart === tab.id 
                              ? 'bg-white text-[#2563EB] shadow' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Recharts Block */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generateChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" style={{ fontSize: 10, fontWeight: 600 }} stroke="#64748B" />
                          <YAxis style={{ fontSize: 10 }} stroke="#64748B" />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                          <Bar 
                            dataKey="Value" 
                            fill={activeChart === 'completion' ? '#F97316' : activeChart === 'attendance' ? '#22C55E' : '#2563EB'} 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono pt-2 border-t">
                      <span>Blue = General Performance</span>
                      <span className="text-emerald-600">Green = Positive Growth</span>
                      <span className="text-[#F97316]">Orange = Needs Attention</span>
                    </div>

                  </div>

                  {/* Right Sidebar Widgets */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-[#0F172A] tracking-wider border-b pb-2">📅 Right Sidebar Widgets</h3>
                    
                    {/* Interactive School Calendar */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>July 2026</span>
                        <span className="text-[#2563EB] font-mono">Today</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-slate-500 font-bold">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        {[...Array(31)].map((_, i) => {
                          const isToday = i + 1 === 20;
                          return (
                            <span 
                              key={i} 
                              onClick={() => triggerToast(`Clicked date July ${i+1}. Event: Term assessment audit.`)}
                              className={`p-1 rounded cursor-pointer ${isToday ? 'bg-[#2563EB] text-white font-bold' : 'hover:bg-slate-200'}`}
                            >
                              {i + 1}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#64748B] block">Upcoming Events</span>
                      <div className="space-y-1.5">
                        <div className="p-2 border-l-2 border-[#7C3AED] bg-slate-50/50 rounded-r-lg text-[10px]">
                          <p className="font-bold text-slate-800">Summer Syllabus Release</p>
                          <p className="text-slate-400 font-mono">July 25, 2026</p>
                        </div>
                        <div className="p-2 border-l-2 border-[#2563EB] bg-slate-50/50 rounded-r-lg text-[10px]">
                          <p className="font-bold text-slate-800">MFA Compliance Security Sweeps</p>
                          <p className="text-slate-400 font-mono">July 30, 2026</p>
                        </div>
                      </div>
                    </div>

                    {/* Administrative Tip of the day */}
                    <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[#2563EB] text-[10px] font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ADMINISTRATIVE TIP</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Use Inivra AI (Ini) to analyze grade report CSV tables directly inside the AI assistant panel to bypass manual timetable conflicts checking.</p>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ===================================== */}
            {/* TAB: STUDENTS MANAGEMENT */}
            {/* ===================================== */}
            {activeTab === 'students' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-extrabold text-[#0F172A]">Student Management</h3>
                    <p className="text-xs text-[#64748B]">Enroll new scholars, search indices, and configure classroom schedules.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowAddStudent(true)} 
                      className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-600 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Student
                    </button>
                    <button 
                      onClick={() => triggerToast("Bulk import initiated. Upload CSV standard file to match columns.")}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold uppercase rounded-xl flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Import Bulk
                    </button>
                    <button 
                      onClick={() => triggerToast("CSV database report exported to local downloads folder.")}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold uppercase rounded-xl flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Records
                    </button>
                  </div>
                </div>

                {/* Table search indicator */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search student names, IDs, grades..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Students Directory List */}
                {filteredStudentsList.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No students enrolled yet"
                    description="Enroll students individually or import bulk student rosters to manage your school's student directory."
                    actionLabel="Add Student"
                    onAction={() => setShowAddStudent(true)}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase font-mono bg-slate-50/50">
                          <th className="p-3">Student ID</th>
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Grade</th>
                          <th className="p-3">Class</th>
                          <th className="p-3">Attendance</th>
                          <th className="p-3">Average</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudentsList.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-500">{st.id}</td>
                            <td className="p-3 font-semibold text-[#0F172A] flex items-center gap-2">
                              {st.avatar ? (
                                <img src={st.avatar} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                                  {st.name.charAt(0)}
                                </div>
                              )}
                              {st.name}
                            </td>
                            <td className="p-3 text-slate-600">{st.grade}</td>
                            <td className="p-3 font-medium text-slate-600">{st.class}</td>
                            <td className="p-3 text-slate-600">{st.attendance}</td>
                            <td className="p-3 font-mono font-semibold text-[#2563EB]">{st.average}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                st.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                                st.status === 'Needs Attention' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {st.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button onClick={() => triggerToast(`Profile metadata view for ${st.name}`)} className="px-2.5 py-1 bg-slate-100 hover:bg-[#DBEAFE] hover:text-[#2563EB] text-slate-600 rounded text-[10px] font-bold uppercase">View Profile</button>
                              <button onClick={() => triggerToast(`Transfer protocol issued for student ID ${st.id}`)} className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-[#F97316] text-slate-600 rounded text-[10px] font-bold uppercase">Transfer</button>
                              <button onClick={() => {
                                setStudents(students.filter(item => item.id !== st.id));
                                triggerToast(`Archived student record of ${st.name}`);
                              }} className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded text-[10px] font-bold uppercase">Archive</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* ===================================== */}
            {/* TAB: TEACHERS MANAGEMENT */}
            {/* ===================================== */}
            {activeTab === 'teachers' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-extrabold text-[#0F172A]">Teacher Management</h3>
                    <p className="text-xs text-[#64748B]">Manage faculty schedules, assign classroom cohorts, and track performance metrics.</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowAddTeacher(true)} 
                    className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-600 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Teacher
                  </button>
                </div>

                {/* Table search indicator */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search teacher name, department, subjects..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Teachers Directory */}
                {filteredTeachersList.length === 0 ? (
                  <EmptyState
                    icon={UserCheck}
                    title="No teachers registered yet"
                    description="Add faculty members, assign departments, and allocate academic cohorts."
                    actionLabel="Add Teacher"
                    onAction={() => setShowAddTeacher(true)}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase font-mono bg-slate-50/50">
                          <th className="p-3">ID</th>
                          <th className="p-3">Teacher Name</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Assigned Subjects</th>
                          <th className="p-3">Assigned Classes</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeachersList.map((tch) => (
                          <tr key={tch.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-500">{tch.id}</td>
                            <td className="p-3 font-semibold text-[#0F172A]">{tch.name}</td>
                            <td className="p-3 text-slate-600 font-medium">{tch.department}</td>
                            <td className="p-3 text-slate-600">{tch.subjects}</td>
                            <td className="p-3 text-slate-500">{tch.classes}</td>
                            <td className="p-3 font-mono text-slate-500">{tch.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                tch.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tch.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button onClick={() => triggerToast(`Editing teacher info of ${tch.name}`)} className="px-2.5 py-1 bg-slate-100 hover:bg-[#DBEAFE] hover:text-[#2563EB] text-slate-600 rounded text-[10px] font-bold uppercase">Edit Details</button>
                              <button onClick={() => triggerToast(`Class sections assigned to ${tch.name}`)} className="px-2.5 py-1 bg-slate-100 hover:bg-[#DBEAFE] text-slate-600 rounded text-[10px] font-bold uppercase">Assign Classes</button>
                              <button onClick={() => triggerToast(`Performance audit compiled for ${tch.name}`)} className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-[10px] font-bold uppercase">Monitor</button>
                              <button onClick={() => {
                                const updated = teachers.map(t => t.id === tch.id ? { ...t, status: t.status === 'Active' ? 'Disabled' : 'Active' } : t);
                                setTeachers(updated);
                                triggerToast(`Toggled activation state of ${tch.name}`);
                              }} className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded text-[10px] font-bold uppercase">Disable Account</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* ===================================== */}
            {/* TAB: CLASSES & TIMETABLE */}
            {/* ===================================== */}
            {activeTab === 'classes' && (
              <div className="space-y-6">
                
                {/* Visual Weekly Timetable Grid */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0F172A]">Visual Weekly Timetable</h3>
                      <p className="text-xs text-[#64748B]">Schedule lessons, allocate classrooms and prevent conflict double-bookings.</p>
                    </div>
                    <button 
                      onClick={() => triggerToast("Auditing scheduled vectors... 100% Conflict Free.")}
                      className="px-3.5 py-1.5 bg-[#DBEAFE] text-[#2563EB] text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conflict Check
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const dayEvents = timetableEvents.filter(e => e.day === day);
                      return (
                        <div key={day} className="bg-slate-50 p-3.5 rounded-xl space-y-3 min-h-[160px] border">
                          <span className="text-[11px] font-extrabold text-[#0F172A] font-mono block uppercase border-b pb-1.5">{day}</span>
                          {dayEvents.map((ev, i) => (
                            <div key={i} className="bg-white p-2.5 rounded-lg border shadow-sm hover:border-[#2563EB] transition-all space-y-1">
                              <p className="font-extrabold text-[11px] text-[#0F172A]">{ev.subject}</p>
                              <p className="text-[9px] text-[#64748B]">{ev.teacher}</p>
                              <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 pt-1">
                                <span>{ev.room}</span>
                                <span className="text-[#2563EB]">{ev.time.split(' ')[0]}</span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length === 0 && (
                            <p className="text-[10px] text-slate-400 italic font-light pt-4 text-center">No scheduled lectures</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form creator */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <h4 className="text-sm font-extrabold text-[#0F172A]">Create Class Section & Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Class Name (e.g. Class D - Physics)" className="p-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white" />
                    <input type="text" placeholder="Assigned Instructor" className="p-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white" />
                    <input type="text" placeholder="Allocated Classroom" className="p-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white" />
                    <button onClick={() => triggerToast("New class section successfully initialized.")} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Initialize Section</button>
                  </div>
                </div>

              </div>
            )}

            {/* ===================================== */}
            {/* TAB: COURSES */}
            {/* ===================================== */}
            {activeTab === 'courses' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Active Course pathways</h3>
                  <p className="text-xs text-[#64748B]">Configure accredited national syllabi pathways, learning standards, and textbook checklists.</p>
                </div>

                {classes.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No active course pathways"
                    description="Accredited national syllabi and course pathways will appear here once classroom sections are added."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                      <div key={cls.id} className="p-4 border rounded-2xl space-y-3 hover:border-[#2563EB]/40 transition-all bg-slate-50/50">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-indigo-50 text-[#7C3AED] font-bold font-mono px-2 py-0.5 rounded uppercase">{cls.id} Pathway</span>
                          <span className="text-[10px] text-slate-400 font-mono">Limit: {cls.limit}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0F172A]">{cls.name}</h4>
                        <p className="text-xs text-[#64748B]">Syllabus standards focus heavily on core academic readiness. Recommended reading manuals mapped.</p>
                        
                        <div className="pt-2 border-t flex justify-between items-center text-[11px] font-semibold text-slate-500">
                          <span>Instructor: {cls.teacher}</span>
                          <span className="text-[#2563EB] font-bold">{cls.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: TIMETABLE CONFIG */}
            {/* ===================================== */}
            {activeTab === 'timetable' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Visual Schedule Blocks Scheduler</h3>
                  <p className="text-xs text-[#64748B]">Adjust classroom term constraints, schedule sweeps, and optimize room utilization indexes.</p>
                </div>

                <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs font-semibold">Weekly calendar sweeps successfully synchronized. Any custom adjustments automatically alert involved students via native device broadcasts.</p>
                </div>

                {timetableEvents.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No timetable schedule blocks"
                    description="Weekly schedule blocks and room allocations will appear here as classes are scheduled."
                  />
                ) : (
                  <div className="space-y-2">
                    {timetableEvents.map((e, idx) => (
                      <div key={idx} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-400 font-mono uppercase mr-2">{e.day}</span>
                          <span className="font-extrabold text-slate-800">{e.subject}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[#64748B]">
                          <span>{e.time}</span>
                          <span className="font-semibold text-[#2563EB] bg-slate-100 px-2.5 py-1 rounded-lg">{e.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: EXAMS & ASSESSMENTS */}
            {/* ===================================== */}
            {activeTab === 'exams' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">Exams & Standard Assessments</h3>
                    <p className="text-xs text-[#64748B]">Log state-level diagnostic examinations, midterms, and finals schedules.</p>
                  </div>
                  <button onClick={() => triggerToast("Final exam scheduling calendar exported to school bulletins.")} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Schedule Midterm</button>
                </div>

                {exams.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No examinations scheduled"
                    description="Schedule midterms, diagnostic evaluations, or finals for your school cohorts."
                  />
                ) : (
                  <div className="space-y-3">
                    {exams.map(ex => (
                      <div key={ex.id} className="p-4 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-extrabold text-slate-800">{ex.name}</p>
                          <p className="text-slate-400 font-mono">{ex.date} • {ex.type}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded">SCHEDULED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: REPORTS & ANALYTICS */}
            {/* ===================================== */}
            {activeTab === 'reports' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Reports & Performance Analytics</h3>
                  <p className="text-xs text-[#64748B]">Compile official school progress logs, teacher activity registers, and classroom usage statistics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Selectors and trigger */}
                  <div className="p-5 border rounded-2xl bg-slate-50 space-y-4">
                    <span className="text-xs font-extrabold uppercase text-[#64748B]">1. Select Report Standard</span>
                    <div className="space-y-2">
                      {[
                        'Student Performance Reports',
                        'Teacher Performance Reports',
                        'Attendance Reports',
                        'Academic Progress Reports',
                        'School Usage Reports'
                      ].map((type) => (
                        <label key={type} className="flex items-center gap-2.5 p-2 bg-white border rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:border-[#2563EB]">
                          <input 
                            type="radio" 
                            name="reportGroup" 
                            checked={selectedReportType === type}
                            onChange={() => setSelectedReportType(type)}
                            className="accent-[#2563EB]"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>

                    <button 
                      onClick={handleGenerateReport}
                      disabled={generatingReport}
                      className="w-full py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 transition-all"
                    >
                      {generatingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Report Logs...</span>
                        </>
                      ) : (
                        <span>Generate Custom Report</span>
                      )}
                    </button>
                  </div>

                  {/* Export Options */}
                  <div className="p-5 border rounded-2xl bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase text-[#64748B] block">2. Export Compiled Files</span>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Once a diagnostic report is successfully generated, administrators can export immutable spreadsheets directly to school boards, state accreditors, or parents channels.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4">
                      <button onClick={() => triggerToast("Downloaded PDF format report.")} className="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                        <FileText className="w-5 h-5 text-rose-500" />
                        <span>Export PDF</span>
                      </button>
                      <button onClick={() => triggerToast("Downloaded Excel workbook.")} className="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <span>Export Excel</span>
                      </button>
                      <button onClick={() => triggerToast("Downloaded standard CSV tables.")} className="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: MESSAGES */}
            {/* ===================================== */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">Direct Staff & User Messaging</h3>
                    <p className="text-xs text-[#64748B]">Real communication between verified school administration, teachers, students, and parents.</p>
                  </div>
                </div>
                <MessagingCenter currentUserId={profile?.id || currentUserId} />
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: ANNOUNCEMENTS */}
            {/* ===================================== */}
            {activeTab === 'announcements' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">School & Institution Announcements Bulletin</h3>
                    <p className="text-xs text-[#64748B]">Broadcast school-wide circulars, safety bulletins, or parent briefings.</p>
                  </div>
                  <button onClick={() => setShowCreateAnnouncement(true)} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-600 transition-all flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Draft Announcement
                  </button>
                </div>

                {announcements.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="No announcements published"
                    description="Broadcast school-wide circulars, safety bulletins, or parent briefings."
                    actionLabel="Draft Announcement"
                    onAction={() => setShowCreateAnnouncement(true)}
                  />
                ) : (
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-4 border rounded-xl hover:border-slate-300 transition-all space-y-2 relative bg-slate-50/40">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-sm text-[#0F172A]">{ann.title}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono uppercase">{ann.audience}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">{ann.desc}</p>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t">
                          <span>Published Date: {ann.date}</span>
                          <div className="space-x-2">
                            <button onClick={() => triggerToast(`Editing bulletin: ${ann.title}`)} className="hover:text-[#2563EB] font-bold">EDIT</button>
                            <button onClick={() => {
                              setAnnouncements(announcements.filter(item => item.id !== ann.id));
                              triggerToast("Announcement bulletin removed.");
                            }} className="hover:text-rose-600 font-bold">DELETE</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: RESOURCE LIBRARY */}
            {/* ===================================== */}
            {activeTab === 'library' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Resource Library</h3>
                  <p className="text-xs text-[#64748B]">Store policy templates, teacher guidelines, and general safety handbooks.</p>
                </div>

                {/* Upload drag-and-drop container */}
                <div 
                  onClick={() => triggerToast("Simulating secure local file selector dialog...")}
                  className="p-6 border-2 border-dashed border-slate-200 hover:border-[#2563EB] rounded-2xl bg-slate-50/50 flex flex-col items-center text-center cursor-pointer transition-all duration-300"
                >
                  <Upload className="w-8 h-8 text-[#2563EB] mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-700">Drag and drop administrative files or click to upload</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">PDF, EXCEL, Word up to 50MB</p>
                </div>

                {libraryFiles.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No library documents yet"
                    description="Upload policies, curriculum guidebooks, or compliance documents to make them accessible across faculty."
                  />
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase text-[#64748B] block">Available Documents ({libraryFiles.length})</span>
                    {libraryFiles.map((file, i) => (
                      <div key={i} className="p-3 border rounded-xl flex justify-between items-center text-xs hover:bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#2563EB]" />
                          <div>
                            <p className="font-extrabold text-slate-800">{file.name}</p>
                            <span className="text-[9px] text-slate-400 font-mono">Date Uploaded: {file.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded font-bold uppercase">{file.type}</span>
                          <button 
                            onClick={() => {
                              const updated = [...libraryFiles];
                              updated[i].downloads += 1;
                              setLibraryFiles(updated);
                              triggerToast(`Downloaded ${file.name}`);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-[#DBEAFE] rounded font-bold text-[10px] uppercase flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> {file.downloads}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: AI SCHOOL ASSISTANT (INI) */}
            {/* ===================================== */}
            {activeTab === 'ai_assistant' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-base md:text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#2563EB]" />
                    <span>AI School Assistant (Ini)</span>
                  </h3>
                  <p className="text-xs text-[#64748B]">Hello, {adminName}. I'm Ini. How can I assist your school today?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Predefined operational tool buttons */}
                  <div className="space-y-2 lg:col-span-1 bg-slate-50 p-4 rounded-2xl border">
                    <span className="text-xs font-extrabold uppercase text-[#64748B] block mb-2 font-mono">Predefined Operational Tools</span>
                    
                    <button 
                      onClick={() => runAiQuery("Generate comprehensive school metrics report regarding attendance trends.", true)}
                      className="w-full text-left p-2.5 bg-white border hover:border-[#2563EB] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-[#2563EB]" /> Generate school reports
                    </button>

                    <button 
                      onClick={() => runAiQuery("Analyze school-wide attendance averages for July 2026.", true)}
                      className="w-full text-left p-2.5 bg-white border hover:border-[#2563EB] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Analyze attendance trends
                    </button>

                    <button 
                      onClick={() => runAiQuery("Summarize the academic performance average scores of Grade 11 honors students.", true)}
                      className="w-full text-left p-2.5 bg-white border hover:border-[#2563EB] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED]" /> Summarize performance
                    </button>

                    <button 
                      onClick={() => runAiQuery("Draft a polite circular announcement detailing next terms honors launch.", true)}
                      className="w-full text-left p-2.5 bg-white border hover:border-[#2563EB] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-600" /> Draft announcements
                    </button>

                    <button 
                      onClick={() => runAiQuery("Draft a professional board meeting agenda for school accreditation reviews.", true)}
                      className="w-full text-left p-2.5 bg-white border hover:border-[#2563EB] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Create meeting agendas
                    </button>
                  </div>

                  {/* Operational AI output interface */}
                  <div className="lg:col-span-2 border rounded-2xl overflow-hidden flex flex-col h-[350px] bg-white">
                    <div className="bg-slate-50 p-3 border-b text-xs font-bold text-[#0F172A] flex items-center justify-between">
                      <span>Ini Assistant Workspace</span>
                      {iniThinking && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] text-slate-700 bg-slate-50/40">
                      {iniResponses.map((text, i) => (
                        <div key={i} className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                          text.startsWith('[You]') 
                            ? 'bg-blue-50 text-blue-900 font-bold border-l-2 border-[#2563EB]' 
                            : 'bg-white border text-slate-800'
                        }`}>
                          {text}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t bg-slate-50 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type custom inquiry (e.g. Schedule finals, balance tuition budget)..."
                        value={iniPrompt}
                        onChange={(e) => setIniPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') runAiQuery('', false); }}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <button onClick={() => runAiQuery('', false)} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Execute AI</button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: SUBSCRIPTION & BILLING */}
            {/* ===================================== */}
            {activeTab === 'billing' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Subscription & Billing</h3>
                  <p className="text-xs text-[#64748B]">Manage your Inivra Learn enterprise plan, user seat limits, and tuition billing integrations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-2xl bg-slate-50/50">
                    <span className="text-[10px] text-[#2563EB] font-bold font-mono uppercase block">CURRENT PLAN</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">Enterprise School Tier</p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">Synchronized till August 2027</p>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50/50">
                    <span className="text-[10px] text-[#7C3AED] font-bold font-mono uppercase block">USER SEATS</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {students.length + teachers.length} / 1,500 Active
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-[#7C3AED] h-full" style={{ width: `${Math.min(100, Math.round(((students.length + teachers.length) / 1500) * 100))}%` }}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50/50">
                    <span className="text-[10px] text-emerald-600 font-bold font-mono uppercase block">STORAGE DATA</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">14.2 GB / 100 GB</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Ledger invoices */}
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold uppercase text-[#64748B] block">Billing History Ledger</span>
                  {invoices.length === 0 ? (
                    <EmptyState
                      icon={Receipt}
                      title="No billing invoices recorded"
                      description="Institutional subscription invoices and renewal statements will appear here."
                    />
                  ) : (
                    invoices.map((inv, i) => (
                      <div key={i} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-extrabold text-slate-800">{inv.desc}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Cleared on {inv.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#0F172A] font-mono">{inv.total}</span>
                          <button onClick={() => triggerToast(`Simulating invoice PDF download...`)} className="text-[10px] text-[#2563EB] font-bold hover:underline">Download PDF</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===================================== */}
            {/* TAB: SCHOOL SETTINGS */}
            {/* ===================================== */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">School settings</h3>
                  <p className="text-xs text-[#64748B]">Update administrative details, white-label configurations and primary contact metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">School Official Name</label>
                    <input type="text" defaultValue="Westbridge Academy" className="w-full p-2.5 border rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Accreditation Tax ID</label>
                    <input type="text" defaultValue="TAX-9981-DE" className="w-full p-2.5 border rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Support Telephone</label>
                    <input type="text" defaultValue="+1 (555) 831-2911" className="w-full p-2.5 border rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">School / Institution Official Location</label>
                    <input type="text" defaultValue="742 Evergreen Terrace, Westbridge Heights" className="w-full p-2.5 border rounded-xl text-xs" />
                  </div>
                </div>

                <button 
                  onClick={() => triggerToast("School settings successfully finalized.")}
                  className="px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl"
                >
                  Save Institutional Preferences
                </button>
              </div>
            )}

          </div>
        </main>

      </div>

      {/* 4. MASTER ADD STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-extrabold text-[#0F172A]">Enroll New Scholar</span>
              <button onClick={() => setShowAddStudent(false)} className="p-1 hover:bg-slate-50 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs text-slate-600">
              <div className="space-y-1">
                <label className="font-bold">Student Name</label>
                <input 
                  type="text" 
                  required 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. David Jenkins" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">School Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="e.g. d.jenkins@westbridge.edu" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold">Grade Level</label>
                  <select 
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Class Section</label>
                  <select 
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option>Class A</option>
                    <option>Class B</option>
                    <option>Class C</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Confirm Enrollment</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MASTER ADD TEACHER MODAL */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-extrabold text-[#0F172A]">Add Faculty Member</span>
              <button onClick={() => setShowAddTeacher(false)} className="p-1 hover:bg-slate-50 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs text-slate-600">
              <div className="space-y-1">
                <label className="font-bold">Teacher Name</label>
                <input 
                  type="text" 
                  required 
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="e.g. Clara Oswald" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Primary School Email</label>
                <input 
                  type="email" 
                  required 
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="e.g. c.oswald@westbridge.edu" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Department</label>
                <select 
                  value={newTeacher.dept}
                  onChange={(e) => setNewTeacher({ ...newTeacher, dept: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option>Science</option>
                  <option>Mathematics</option>
                  <option>Humanities</option>
                  <option>Languages</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Subjects (comma-separated)</label>
                <input 
                  type="text" 
                  value={newTeacher.subjects}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subjects: e.target.value })}
                  placeholder="e.g. AP Physics, Chemistry" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Add Teacher Roster</button>
            </form>
          </div>
        </div>
      )}

      {/* 6. CREATE ANNOUNCEMENT MODAL */}
      {showCreateAnnouncement && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-extrabold text-[#0F172A]">Draft School Bulletin</span>
              <button onClick={() => setShowCreateAnnouncement(false)} className="p-1 hover:bg-slate-50 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs text-slate-600">
              <div className="space-y-1">
                <label className="font-bold">Bulletin Title</label>
                <input 
                  type="text" 
                  required 
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g. Term Schedule Invoices" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Target Audience</label>
                <select 
                  value={newAnnouncement.audience}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-bold text-[#2563EB]"
                >
                  <option>Entire School</option>
                  <option>Specific Grades</option>
                  <option>Teachers Only</option>
                  <option>Students Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Announcement Description</label>
                <textarea 
                  required 
                  rows={4}
                  value={newAnnouncement.desc}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, desc: e.target.value })}
                  placeholder="Enter details..." 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-xl">Publish Announcement</button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* 7. FLOATING AI ASSISTANT (INI ORB) */}
      {/* ===================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Floating Chat Container */}
        {floatingOpen && (
          <div className="w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2563EB] via-blue-500 to-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img 
                    src="https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png"
                    alt="Ini AI"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-white/25 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 border-2 border-[#2563EB] rounded-full"></span>
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold tracking-tight">Ini AI Director</h4>
                  <p className="text-[9px] text-blue-100 font-medium">Platform Management</p>
                </div>
              </div>
              <button onClick={() => setFloatingOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-60 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {floatingMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#2563EB] text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {floatingSpeaking && (
                <div className="flex justify-start">
                  <div className="p-2.5 bg-white border rounded-xl text-[10px] text-slate-400 font-mono animate-pulse">
                    Ini is speaking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-2 border-t bg-white flex gap-1.5 items-center">
              <input 
                type="text" 
                placeholder="Ask Ini (e.g. Generate reports, schedule final exams)..."
                value={floatingInput}
                onChange={(e) => setFloatingInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFloatingSend(); }}
                className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none"
              />
              <button onClick={handleFloatingSend} className="p-2 bg-[#2563EB] text-white rounded-xl hover:bg-blue-600">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Voice Activator Button inside chat */}
            <div className="p-2 bg-slate-50 border-t flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Or say "Hey Ini" to wake</span>
              <button 
                onClick={simulateVoiceWake}
                className="px-2 py-0.5 bg-[#DBEAFE] text-[#2563EB] rounded font-bold uppercase text-[9px] hover:bg-blue-100"
              >
                Simulate voice wake
              </button>
            </div>

          </div>
        )}

        {/* The 60px Glowing Orb Button */}
        <button 
          onClick={() => setFloatingOpen(!floatingOpen)}
          className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center shadow-2xl relative group focus:outline-none hover:scale-105 transition-all duration-300 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          {/* Inner blue-and-white glowing backdrop */}
          <div className="absolute inset-0.5 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
            <img 
              src="https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png"
              alt="Ini"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 rounded-full"
            />
          </div>
          {/* Glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full border-2 border-blue-400 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-300 animate-ping"></span>
          
          {/* Little mic active badge */}
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full flex items-center justify-center">
            <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        </button>

      </div>

    </div>
  );
}
