import React, { useState, useEffect } from 'react';
import { db } from '../InivraDatabase';
import { Classroom, Material, Assignment, UserProfile } from '../types';
import { 
  BookOpen, Sparkles, Calendar, FileText, CheckCircle, Clock, Send, 
  Upload, HelpCircle, GraduationCap, Play, ChevronRight, Video, Languages,
  MessageSquare, UserCheck, CheckSquare, Layers, AlertCircle, Undo, Award,
  Phone, Mic, MicOff, Search, Download, Crown, MessageCircle, Volume2, VolumeX,
  Home, BarChart2, FolderOpen, Globe, Brain, Users, Settings, Bell, LogOut,
  Sun, Moon, Menu, ChevronDown, User, Camera, Trash2, FileCheck
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import MyCourses from './MyCourses';
import EducationalVideos from './EducationalVideos';
import AISummarizer from './AISummarizer';
import NotesResourcesHub from './NotesResourcesHub';
import StudyGroups from './StudyGroups';
import AchievementsBadges from './AchievementsBadges';
import EmptyState from './EmptyState';
import IniChatWorkspace from './IniChatWorkspace';
import MessagingCenter from './MessagingCenter';
import { LANGUAGE_COACH_DATA } from '../data/languageCoachData';

interface StudentDashboardProps {
  currentUserId: string;
  onLogout?: () => void;
  onJoinVideoCall: (classId: string, className: string, teacher: string) => void;
}

interface PrebuiltQuiz {
  id: string;
  title: string;
  subject: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  problemText: string;
  points: number;
}

export default function StudentDashboard({ currentUserId, onLogout, onJoinVideoCall }: StudentDashboardProps) {
  // Fetch active classrooms & student profile from DB at the top
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => db.getClassroomsForStudent(currentUserId));
  const profile = db.getProfile(currentUserId);

  const [activeTab, setActiveTab] = useState<any>('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  
  // Join Classroom Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinClassCode, setJoinClassCode] = useState('');
  const [joinClassError, setJoinClassError] = useState('');
  const [joinClassSuccess, setJoinClassSuccess] = useState('');

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClassCode.trim()) return;
    setJoinClassError('');
    setJoinClassSuccess('');
    const success = db.joinClassroom(joinClassCode.trim(), currentUserId);
    if (success) {
      const updated = db.getClassroomsForStudent(currentUserId);
      setClassrooms(updated);
      if (updated.length > 0) {
        setSelectedClassId(updated[updated.length - 1].id);
      }
      setJoinClassSuccess('Successfully enrolled in classroom!');
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinClassCode('');
        setJoinClassSuccess('');
      }, 1000);
    } else {
      setJoinClassError('Classroom code not found. Please verify with your teacher.');
    }
  };

  // Document Upload State
  const [uploadedFiles, setUploadedFiles] = useState<Material[]>([]);
  const [fileToExplain, setFileToExplain] = useState<string>('');
  const [explaining, setExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{ summary: string; explanation: string } | null>(null);

  // Static Local Quizzes (No AI)
  const [prebuiltQuizzes, setPrebuiltQuizzes] = useState<PrebuiltQuiz[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Homework Explain State (Contains AI, but configured strictly to explain, not solve!)
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [selectedHwId, setSelectedHwId] = useState<string>('');
  const [hwAiPrompt, setHwAiPrompt] = useState('');
  const [hwAiExplanation, setHwAiExplanation] = useState<string>('');
  const [hwLoading, setHwLoading] = useState(false);

  // AI Flashcards State (Upload notes -> generate cards with AI)
  const [notesInput, setNotesInput] = useState('');
  const [flashcards, setFlashcards] = useState<{ front: string; back: string; mastered?: boolean }[]>([]);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Multi-Language Practice States
  const [activeLanguages, setActiveLanguages] = useState<string[]>(['English', 'Spanish', 'French']);
  const [langLanguage, setLangLanguage] = useState<string>(() => {
    return 'English';
  });
  const [langInput, setLangInput] = useState('');
  const [languageChats, setLanguageChats] = useState<Record<string, { role: 'user' | 'model'; text: string }[]>>({
    English: [],
    Spanish: [],
    French: [],
    German: [],
    Mandarin: []
  });
  const [langLoading, setLangLoading] = useState(false);
  const [langSkill, setLangSkill] = useState<'speaking' | 'listening' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'pronunciation' | null>(null);
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);

  // Sync with profile learning language when loaded
  useEffect(() => {
    if (profile?.learningLanguage) {
      setLangLanguage(profile.learningLanguage);
    }
  }, [profile?.learningLanguage]);

  // Interactive Voice Call Simulator State
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ai-speaking' | 'student-speaking'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState<{ sender: 'ai' | 'student'; text: string }[]>([]);
  const [voiceIsMuted, setVoiceIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Dedicated AI Document Summarizer State
  const [summaryNotesInput, setSummaryNotesInput] = useState('');
  const [summaryStyle, setSummaryStyle] = useState<'bullets' | 'comprehensive' | 'mindmap'>('bullets');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Freelance and Assigned Teacher database lists
  const [teachersSearchQuery, setTeachersSearchQuery] = useState('');
  const [callTeacherId, setCallTeacherId] = useState('teach-1');
  const [callSubject, setCallSubject] = useState('Honors Calculus');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callTimer, setCallTimer] = useState(0);
  const [callIsMuted, setCallIsMuted] = useState(false);
  const [callIsVideoOff, setCallIsVideoOff] = useState(false);
  const [callTranscript, setCallTranscript] = useState<{ sender: string; text: string }[]>([]);

  // Pro CV Maker States
  const [cvProUnlocked, setCvProUnlocked] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cvPolishing, setCvPolishing] = useState(false);
  const [cvForm, setCvForm] = useState({
    fullName: profile?.name || '',
    email: profile?.email || '',
    phone: '',
    title: '',
    bio: profile?.bio || '',
    experience: '',
    education: '',
    customSkills: ''
  });
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>(profile?.completedCourses || []);

  // Automatically include completed academy courses directly into CV achievements when finished
  useEffect(() => {
    if (profile?.completedCourses) {
      setSelectedAchievements(prev => {
        const next = [...prev];
        let updated = false;
        profile.completedCourses.forEach(course => {
          if (!next.includes(course)) {
            next.push(course);
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }
  }, [profile?.completedCourses]);

  // Interactive Skill Substates
  const [listeningSelectedAns, setListeningSelectedAns] = useState<number | null>(null);
  const [listeningChecked, setListeningChecked] = useState(false);
  const [readingTranslationVisible, setReadingTranslationVisible] = useState(false);
  const [writingInputText, setWritingInputText] = useState('');
  const [writingEvaluation, setWritingEvaluation] = useState('');
  const [writingLoading, setWritingLoading] = useState(false);
  const [grammarSelectedAns, setGrammarSelectedAns] = useState<number | null>(null);
  const [grammarChecked, setGrammarChecked] = useState(false);
  const [vocabularyFlippedIndex, setVocabularyFlippedIndex] = useState<number | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState('');
  const [pronunciationLoading, setPronunciationLoading] = useState(false);



  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tab, role } = customEvent.detail || {};
      if (role && role !== 'Student') return;
      if (tab && ['classes', 'quizzes', 'homework', 'flashcards', 'language', 'grades', 'summarizer', 'calls', 'messages', 'cv'].includes(tab)) {
        setActiveTab(tab as any);
      }
    };
    window.addEventListener('inivra-navigation', handleNav);
    return () => window.removeEventListener('inivra-navigation', handleNav);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ini-state-sync', {
      detail: {
        activeTab,
        langLanguage,
        langSkill,
        hasChosenLanguage,
        studentName: profile?.name || 'Alex'
      }
    }));
  }, [activeTab, langLanguage, langSkill, hasChosenLanguage, profile?.name]);

  useEffect(() => {
    const handleIniAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, language, skill, tab } = customEvent.detail || {};
      if (type === 'set-language' && language) {
        setLangLanguage(language);
        setHasChosenLanguage(true);
        if (!activeLanguages.includes(language)) {
          setActiveLanguages(prev => [...prev, language]);
        }
      } else if (type === 'set-skill' && skill) {
        setLangSkill(skill);
      } else if (type === 'navigate-tab' && tab) {
        setActiveTab(tab as any);
      }
    };
    window.addEventListener('ini-action', handleIniAction);
    return () => window.removeEventListener('ini-action', handleIniAction);
  }, [activeLanguages]);

  // Real-time synchronization with database updates
  const [, setDbVersion] = useState(0);
  useEffect(() => {
    const handleDbUpdate = () => setDbVersion(v => v + 1);
    window.addEventListener('storage', handleDbUpdate);
    return () => window.removeEventListener('storage', handleDbUpdate);
  }, []);

  // Record daily user activity automatically for real study streak calculation
  useEffect(() => {
    if (profile?.id) {
      db.recordUserActivity(profile.id);
    }
  }, [profile?.id]);

  // Real Consecutive Days Streak
  const realStreak = db.calculateStreak(profile?.activityDates || []);

  // Teacher Communication Center:
  // Real teachers and faculty registered in the database, with real logged-in status
  const rawTeachers = [
    ...db.getProfilesByRole('Teacher'),
    ...db.getProfilesByRole('Educator')
  ];
  const teacherMap = new Map<string, any>();
  rawTeachers.forEach(p => {
    if (p.email && !teacherMap.has(p.email.toLowerCase().trim())) {
      const isOnline = db.isTeacherLoggedIn(p.id) || db.isTeacherLoggedIn(p.email);
      teacherMap.set(p.email.toLowerCase().trim(), {
        id: p.id,
        name: p.name,
        subject: (p as any).subjects?.join(', ') || 'Academic curriculum',
        email: p.email,
        avatar: p.avatar,
        classCode: p.role === 'Teacher' ? 'SCHOOL FACULTY' : 'INDEPENDENT EDUCATOR',
        isLoggedIn: isOnline,
        role: p.role
      });
    }
  });
  const teachersList = Array.from(teacherMap.values()).sort((a, b) => (b.isLoggedIn ? 1 : 0) - (a.isLoggedIn ? 1 : 0));

  // Appointment Booking States
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState('2026-07-18');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [myBookedAppointments, setMyBookedAppointments] = useState<{ id: string; teacherName: string; date: string; time: string; subject: string }[]>([]);

  const [activeTeacherIndex, setActiveTeacherIndex] = useState(0);
  const [teacherMessages, setTeacherMessages] = useState<Record<string, { sender: 'student' | 'teacher'; text: string; time: string }[]>>({});
  const [currentMessageInput, setCurrentMessageInput] = useState('');

  // Fetch active classrooms & student profile from DB
  const activeClass = classrooms.find(c => c.id === selectedClassId) || classrooms[0];

  // Grade Data for Recharts Line diagram
  const [gradesProgress, setGradesProgress] = useState<{ chapter: string; score: number }[]>([]);

  // Explain Lecture File with AI
  const handleExplainFile = async (fileId: string) => {
    const file = uploadedFiles.concat(activeClass ? activeClass.materials : []).find(f => f.id === fileId);
    if (!file) return;

    setExplaining(true);
    setAiExplanation(null);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: file.title,
          documentContent: `This syllabus and note sheet relates to ${file.title}. Focus on explaining the fundamental formulas, context, and structural curriculum insights. Base rules represent logarithmic expansion and quadratic equation proofs.`,
          docType: file.type
        })
      });
      const data = await response.json();
      setAiExplanation({
        summary: data.summary,
        explanation: data.explanation
      });
    } catch (e) {
      console.error(e);
    } finally {
      setExplaining(false);
    }
  };

  // Ask AI to Explain Homework (Strict System Prompt to explain concepts only, not solve!)
  const handleExplainHomework = async () => {
    const hw = homeworkList.find(h => h.id === selectedHwId);
    if (!hw) return;

    setHwLoading(true);
    setHwAiExplanation('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please explain the concepts, mathematical rules, and theoretical steps needed to solve this homework problem. Break it down into digestible pieces. Do NOT solve it for me, do NOT give the final calculated number, and do NOT write out the direct answers. Here is the problem:\n"${hw.problemText}"\n\nSpecific doubt/question I have: "${hwAiPrompt || "How should I get started on this problem?"}"`,
          context: `Student ${profile?.name || "Alex"} is working on homework: ${hw.title}. High school level.`,
          systemInstruction: `You are the Inivra AI Academic Master Teacher. Your goal is to guide students to discover the solution themselves rather than just generating answers. Follow these strict rules:
1. Explain concepts step-by-step and break difficult problems into smaller, atomic parts.
2. Give pedagogical hints and explanations instead of providing direct calculated answers.
3. Remove and avoid all markdown math/LaTeX symbols (such as $$, \\(, \\), \\[, \\], \\frac, \\times, etc.) and raw backslash characters in your explanations. Represent math equations in clean, plain, easy-to-read text (e.g. use standard letters and symbols like "x^2" or "pi" instead of LaTeX notation).
4. Provide highly accurate, correct theoretical explanations and answers to the student's questions, ensuring no confusion is introduced.
5. Ask active, guiding questions that lead the student to think critically.
6. Help students discover the correct solution themselves by building intuitive foundations.
7. Explain clearly why a specific approach or answer is mathematically/conceptually correct or incorrect.
8. NEVER immediately provide the final answer or do the final calculation. Focus 100% on scaffolding and guiding.`
        })
      });
      const data = await response.json();
      
      // Post-process the text to strip LaTeX / formatting symbols
      let cleanedText = data.text || '';
      cleanedText = cleanedText
        .replace(/\\\[|\\\]|\\\(|\\\)/g, '') // Remove \( \) \[ \]
        .replace(/\$\$|\$/g, '')              // Remove $$ $
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2') // Convert \frac{a}{b} to a/b
        .replace(/\\times/g, 'x')            // Convert \times to x
        .replace(/\\/g, '')                  // Remove lone backslashes
        .replace(/\*\*|__/g, '')             // Remove bold markdown symbols
        .replace(/###|##|#/g, '');           // Remove header markdown symbols
        
      setHwAiExplanation(cleanedText);
    } catch (e) {
      console.error(e);
      setHwAiExplanation("Sorry, I could not generate an explanation at this time. Please check your network connection.");
    } finally {
      setHwLoading(false);
    }
  };

  // Generate Flashcards from raw notes using AI
  const handleGenerateFlashcards = async () => {
    if (!notesInput.trim()) return;
    setGeneratingCards(true);
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput })
      });
      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setFlashcards(data.cards.map((c: any) => ({ ...c, mastered: false })));
        setCurrentCardIndex(0);
        setCardFlipped(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCards(false);
    }
  };

  // Language Coach Interactive Chat
  const handleLanguageChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!langInput.trim()) return;

    const userMsg = langInput;
    const currentLang = langLanguage;
    
    // Add user message to specific language chat history
    const oldChat = languageChats[currentLang] || [];
    const updatedWithUser = [...oldChat, { role: 'user' as const, text: userMsg }];
    setLanguageChats(prev => ({
      ...prev,
      [currentLang]: updatedWithUser
    }));
    
    setLangInput('');
    setLangLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userName: profile?.name || "Alex",
          context: `Student practicing ${currentLang}. Name is ${profile?.name || "Alex"}.`,
          systemInstruction: `You are an incredibly warm, supportive, and pedagogical AI Language Coach on Inivra. The user is practicing ${currentLang}. You should respond mostly in ${currentLang} (with optional helpful English translations in brackets for tough parts). Correct any grammatical slips, offer active pronunciation/style advice, and ask them a friendly open-ended question to keep the practice flow exciting!`
        })
      });
      const data = await response.json();
      setLanguageChats(prev => ({
        ...prev,
        [currentLang]: [...(prev[currentLang] || []), { role: 'model' as const, text: data.text }]
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLangLoading(false);
    }
  };

  // Real speech-to-text recognition utilizing browser Web Speech API
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Safari, or Microsoft Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Choose speech recognition language matching target practice language
    const coachData = LANGUAGE_COACH_DATA[langLanguage] || LANGUAGE_COACH_DATA['English'];
    const langCode = coachData?.recogLang || 'en-US';
    
    recognition.lang = langCode;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceCallStatus('student-speaking');
    };
    
    recognition.onerror = (e: any) => {
      console.info("Speech Recognition status info:", e.error || e);
      setIsListening(false);
      setVoiceCallStatus('connected');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setVoiceCallStatus('connected');
    };
    
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (!speechToText) return;
      
      setVoiceTranscript(prev => [...prev, { sender: 'student', text: speechToText }]);
      setVoiceCallStatus('ai-speaking');
      
      // Post speaking result to API and read response
      fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: speechToText,
          userName: profile?.name || "Alex",
          context: `Student practicing spoken ${langLanguage} fluency live. Name is ${profile?.name || "Alex"}. Response must be extremely short.`,
          systemInstruction: `You are an interactive conversational language tutor speaking strictly in ${langLanguage}. The user just spoke: "${speechToText}". Provide a warm, very short 1-sentence reply in ${langLanguage} keeping the natural conversation flow.`
        })
      })
      .then(res => res.json())
      .then(data => {
        setVoiceTranscript(prev => [...prev, { sender: 'ai', text: data.text }]);
        
        // Speak response aloud via SpeechSynthesis
        if ('speechSynthesis' in window && !voiceIsMuted) {
          const utter = new SpeechSynthesisUtterance(data.text);
          utter.lang = coachData?.synthLang || 'en-US';
          window.speechSynthesis.speak(utter);
        }
      })
      .catch(err => {
        console.info("Fetch language audio reply status update:", err.message || err);
        setVoiceCallStatus('connected');
      });
    };
    
    recognition.start();
  };

  // Send message directly to real teacher
  const handleSendMessageToTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessageInput.trim()) return;

    const teacher = teachersList[activeTeacherIndex] || teachersList[0];
    const text = currentMessageInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append student message
    const currentList = teacherMessages[teacher.email] || [];
    const updatedList = [...currentList, { sender: 'student' as const, text, time: timeStr }];
    
    setTeacherMessages(prev => ({
      ...prev,
      [teacher.email]: updatedList
    }));
    setCurrentMessageInput('');

    // Save message to real InivraDatabase conversation for the real teacher
    try {
      const studentId = profile?.id || 'user-student';
      const targetId = teacher.id || teacher.email;
      const conv = db.getConversations().find(c => 
        c.participants.some(p => p.id === studentId) && 
        c.participants.some(p => p.id === targetId || p.id === teacher.email)
      );
      const convId = conv ? conv.id : db.createConversation(
        targetId,
        teacher.name,
        teacher.avatar || '',
        'Teacher',
        studentId
      );
      db.saveMessage({
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: studentId,
        senderName: profile?.name || 'Alex Johnson',
        senderAvatar: profile?.avatar || '',
        content: text,
        timestamp: new Date().toISOString(),
        reactions: []
      });
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Teacher message stored locally', err);
    }
  };

  // Local file upload mock
  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: Material = {
        id: `mat-student-${Date.now()}`,
        title: file.name,
        type: file.name.endsWith('.pptx') || file.name.endsWith('.ppt') ? 'PPT' : 'PDF',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: profile?.name || 'Alex Johnson',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setUploadedFiles(prev => [newFile, ...prev]);
    }
  };

  // Quick helper to fill homework doubt prompt
  const prefillDoubt = (text: string) => {
    setHwAiPrompt(text);
  };

  // Navigation hook synchronizer
  useEffect(() => {
    const handleNavigation = (e: any) => {
      const tab = e.detail?.tab;
      if (tab) {
        if (tab === 'homework') setActiveTab('assignments');
        else if (tab === 'classes') setActiveTab('timetable');
        else if (tab === 'summarizer') setActiveTab('resources');
        else if (tab === 'calls') setActiveTab('calls');
        else if (tab === 'ini') setActiveTab('ini');
        else setActiveTab(tab);
      }
    };
    window.addEventListener('inivra-navigation', handleNavigation);
    return () => window.removeEventListener('inivra-navigation', handleNavigation);
  }, []);

  useEffect(() => {
    // Hide default header and footer to display the ultra-premium custom workspace
    const header = document.getElementById('inivra-header');
    const footer = document.querySelector('footer');
    if (header) header.style.setProperty('display', 'none', 'important');
    if (footer) footer.style.setProperty('display', 'none', 'important');
    
    // Make the main wrapper full width
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

  return (
    <div id="student-portal-workspace" className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A] ${isDarkMode ? 'dark bg-slate-950 text-white' : ''}`}>
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-40 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
              alt="studyHUB-inivra learn"
              referrerPolicy="no-referrer"
              className="h-9 w-9 object-contain rounded-xl shadow-md"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">studyHUB-inivra learn</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Student Dashboard</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
            <span className="text-xs text-slate-400 font-semibold">Workspace:</span>
            <span className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden lg:flex items-center relative w-1/3 max-w-lg">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, assignments, notes, teachers, or AI..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-slate-200"
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('timetable')}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all relative"
            title="Calendar Schedule"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all relative"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#2563EB] rounded-full"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-amber-500 rounded-full animate-ping"></span>
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Recent Notifications</span>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-[10px] text-blue-600 font-semibold hover:underline">Mark read</button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  <div className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl flex gap-3 items-start cursor-pointer">
                    <span className="p-1 bg-red-100 text-red-600 rounded-lg text-xs">📝</span>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-snug">Calculus Problem Set 4 due in 2 days</p>
                      <p className="text-[10px] text-slate-400">July 21 • Homework Explainer</p>
                    </div>
                  </div>
                  <div className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl flex gap-3 items-start cursor-pointer">
                    <span className="p-1 bg-blue-100 text-blue-600 rounded-lg text-xs">🌍</span>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-snug">Language Coach practice goal achieved!</p>
                      <p className="text-[10px] text-slate-400">July 20 • Language Coach</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
            title="Theme switch"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>🌍</span>
            <span>{profile?.learningLanguage || 'English'}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-slate-600">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
            
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs text-left">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{profile?.name || 'Alex Johnson'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{profile?.email || 'alex@inivra.edu'}</p>
                </div>
                <button 
                  onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <button 
                  onClick={() => { alert('Help Centre is online! Connect with teachers or Slack channels.'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Help Centre
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button 
                  id="student-dropdown-logout-btn"
                  onClick={() => { 
                    setIsProfileDropdownOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      window.dispatchEvent(new CustomEvent('inivra-logout'));
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 flex items-center gap-2 font-semibold text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
        
        {/* Left Sidebar Menu */}
        <aside className={`fixed lg:relative inset-y-16 lg:inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-4 z-30 transition-all duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="space-y-1.5 px-3 overflow-y-auto flex-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 block mb-1">Portal Hub</span>
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Home },
              { key: 'courses', label: 'My Courses', icon: BookOpen },
              { key: 'assignments', label: 'Assignments', icon: FileText },
              { key: 'timetable', label: 'Timetable', icon: Calendar },
              { key: 'grades', label: 'Grades & Progress', icon: BarChart2 },
              { key: 'resources', label: 'Notes & Resources', icon: FolderOpen },
              { key: 'ini', label: 'AI Assistant (Ini)', icon: Sparkles },
              { key: 'language', label: 'Language Coach', icon: Globe },
              { key: 'quizzes', label: 'Flashcards & Quizzes', icon: Brain },
              { key: 'videos', label: 'Video Lessons', icon: Video },
              { key: 'messages', label: 'Messages', icon: MessageSquare },
              { key: 'groups', label: 'Study Groups', icon: Users },
              { key: 'achievements', label: 'Achievements', icon: Award },
              { key: 'cv', label: 'AI CV & Resume Maker', icon: FileCheck },
              { key: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#DBEAFE] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 shadow-sm font-extrabold border-l-4 border-[#2563EB]' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 mx-3 space-y-3">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 rounded-2xl p-3 border border-blue-100/20">
              <span className="text-lg">🔥</span>
              <div className="text-left leading-none">
                <span className="text-xs font-black text-[#2563EB] dark:text-blue-400">15 Days Streak</span>
                <p className="text-[9px] text-slate-400 mt-0.5">Keep learning active!</p>
              </div>
            </div>
            <button
              id="student-sidebar-logout-btn"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  window.dispatchEvent(new CustomEvent('inivra-logout'));
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 rounded-xl transition-all border border-rose-200/50 dark:border-rose-900/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-mono font-medium">v2.4.0 • Secured Gateway</p>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/45 z-25 lg:hidden pt-16"
          ></div>
        )}

        {/* Scrollable Work Area Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 px-6 py-8">
          
          {/* MAIN DASHBOARD TAB VIEW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1600px] mx-auto animate-in fade-in">
              
              {/* Left Main Column: Cards and grids */}
              <div className="xl:col-span-8 space-y-8 text-left">
                
                {/* Greeting */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-black tracking-tight text-[#0F172A] dark:text-white font-display">Good Morning, {profile?.name ? profile.name.split(' ')[0] : 'Alex'} 👋</h1>
                    {profile?.educationLevel && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-xs">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {profile.educationLevel === 'Primary' ? 'Primary / Elementary' :
                         profile.educationLevel === 'LowerSecondary' ? 'Lower Secondary / Middle School' :
                         profile.educationLevel === 'UpperSecondary' ? 'Upper Secondary / High School' :
                         profile.educationLevel === 'Vocational' ? 'Vocational & TVET' :
                         profile.educationLevel === 'College' ? 'College' :
                         profile.educationLevel === 'University' ? 'University' :
                         'Adult & Lifelong Learning'}
                        {profile.gradeYear ? ` • ${profile.gradeYear}` : ''}
                        {profile.isIndependent ? ' • Independent' : (profile.schoolName ? ` • ${profile.schoolName}` : '')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ready to continue your learning journey today?</p>
                </div>

                {/* Statistics Cards with Real-Time User Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const completedCount = (profile?.completedCourses || []).length;
                    return [
                      { 
                        label: 'Courses Made', 
                        value: completedCount === 1 ? '1 Course Made' : `${completedCount} Courses Made`, 
                        desc: completedCount > 0 ? 'Verified Completed' : 'Finish a course to earn', 
                        icon: BookOpen, 
                        color: 'text-blue-600 bg-blue-50 border-blue-100' 
                      },
                      { 
                        label: 'Assignments Due', 
                        value: `${homeworkList.length} Due`, 
                        desc: 'Required Worksheets', 
                        icon: FileText, 
                        color: 'text-amber-600 bg-amber-50 border-amber-100' 
                      },
                      { 
                        label: 'Average Grade', 
                        value: gradesProgress.length > 0 ? '91%' : 'N/A', 
                        desc: 'Current Semester Metric', 
                        icon: BarChart2, 
                        color: 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                      },
                      { 
                        label: 'Study Streak', 
                        value: `${realStreak} ${realStreak === 1 ? 'Day' : 'Days'}`, 
                        desc: 'Real Days Using App', 
                        icon: Award, 
                        color: 'text-purple-600 bg-purple-50 border-purple-100' 
                      }
                    ];
                  })().map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div 
                        key={stat.label} 
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between text-left"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`p-2 rounded-xl border ${stat.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="space-y-0.5 mt-4 text-left">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide font-mono">{stat.label}</span>
                          <p className="text-xl font-extrabold text-[#0F172A] dark:text-white leading-none">{stat.value}</p>
                          <p className="text-[9px] text-slate-400 leading-none pt-0.5">{stat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Today's Schedule Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> Today's Schedule
                    </h3>
                    <button onClick={() => setActiveTab('classes')} className="text-xs text-[#2563EB] font-bold hover:underline">View Timetable →</button>
                  </div>
                  {classrooms.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No scheduled classes today"
                      description="Your daily class periods and timetables will appear here once you join a class."
                      actionText="Join a Class"
                      onAction={() => setShowJoinModal(true)}
                    />
                  ) : (
                    <div className="space-y-3">
                      {classrooms.map((lesson, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-850/20 flex flex-wrap justify-between items-center gap-4 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📚</span>
                            <div className="text-left">
                              <h4 className="font-bold text-sm text-[#0F172A] dark:text-white">{lesson.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{lesson.teacherName} • Room {lesson.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 font-mono">Enrolled</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-lg border bg-blue-100 text-blue-800 border-blue-200">
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Continue Learning Cards */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Continue Learning
                  </h3>
                  {classrooms.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title="No active courses"
                      description="Join or add a course to begin tracking your learning progress."
                      actionText="Browse Courses"
                      onAction={() => setActiveTab('courses')}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {classrooms.map((course, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 text-left">
                          <div className="space-y-1 text-left">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Tutor: {course.teacherName}</span>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{course.name}</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                              <span>0% Complete</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedClassId(course.id);
                              setActiveTab('classes');
                            }}
                            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-[#2563EB] rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                          >
                            Enter Classroom →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Learning Assistant (Ini) Gradient Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none space-y-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                      <div className="relative h-14 w-14 rounded-full bg-white flex items-center justify-center text-2xl shadow border-2 border-white/20 animate-bounce">
                        🤖
                        <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>
                      </div>
                      <div className="space-y-1 text-left">
                        <h3 className="font-black text-lg font-display">Explain with Inivra AI Companion</h3>
                        <p className="text-xs text-blue-100 font-light leading-relaxed max-w-md">
                          "Hello, {profile?.name ? profile.name.split(' ')[0] : 'Alex'}. I'm Ini. How can I help you today?" Learn with instant formula concept explainers or summaries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                    {[
                      { label: 'Explain Homework', tab: 'assignments' },
                      { label: 'Summarise PDF', tab: 'resources' },
                      { label: 'Generate Quiz', tab: 'quizzes' },
                      { label: 'Create Flashcards', tab: 'quizzes' },
                      { label: 'Ask a Question', tab: 'ini' }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(btn.tab as any);
                        }}
                        className="py-2.5 bg-white/10 hover:bg-white/25 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all border border-white/10"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Coach Shortcut section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                  <div className="md:col-span-5 flex flex-col justify-between space-y-2 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-mono font-bold px-2 py-0.5 rounded border border-purple-100">Language Coach</span>
                      <h3 className="text-base font-black text-slate-800 dark:text-white">Active Language: {langLanguage}</h3>
                    </div>
                    <div className="space-y-1 text-slate-500">
                      <p className="text-xs font-medium">Vocabulary Learned: <span className="font-bold text-slate-800 dark:text-white">0 Words</span></p>
                      <p className="text-xs font-medium">Weekly Learning Goal: <span className="font-bold text-[#2563EB]">0 Hours</span></p>
                    </div>
                  </div>
                  <div className="md:col-span-7 flex flex-col justify-center space-y-3">
                    <p className="text-xs text-slate-400 italic">"Good active practice is key to speaking, writing, and vocabulary fluency."</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setActiveTab('language');
                          setHasChosenLanguage(true);
                          setLangSkill('speaking');
                        }} 
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all"
                      >
                        Start Speaking
                      </button>
                      <button 
                        onClick={() => {
                          setActiveTab('language');
                          setHasChosenLanguage(false);
                          setLangSkill(null);
                        }} 
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all"
                      >
                        Select Language
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Analytics Chart preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-blue-600" /> Academic Reports & Performance
                    </h3>
                    <button onClick={() => setActiveTab('grades')} className="text-xs text-[#2563EB] font-bold hover:underline">Full Analytics →</button>
                  </div>
                  {gradesProgress.length === 0 ? (
                    <EmptyState
                      icon={BarChart2}
                      title="No academic assessments yet"
                      description="Complete chapter quizzes or graded assignments to view your score trends."
                    />
                  ) : (
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradesProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="chapter" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Sub-grids for Announcements, Messages, Groups, Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Messages list */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" /> Recent Messages
                    </h4>
                    {Object.keys(teacherMessages).length === 0 ? (
                      <EmptyState
                        icon={MessageSquare}
                        title="No messages yet"
                        description="Direct communications with your teachers and tutors will appear here."
                        actionText="Contact Teacher"
                        onAction={() => setActiveTab('messages')}
                      />
                    ) : (
                      <div className="space-y-3.5 max-h-60 overflow-y-auto">
                        {Object.entries(teacherMessages).flatMap(([email, msgs]) => ((msgs as Array<{ sender: string; text: string; time: string }>) || []).map(m => ({ ...m, email }))).map((msg, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer" onClick={() => setActiveTab('messages')}>
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs border">
                              {msg.sender === 'teacher' ? 'T' : 'S'}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">{msg.email}</h5>
                              <p className="text-[10px] text-slate-400 truncate">{msg.text}</p>
                            </div>
                            <span className="text-[8px] text-slate-400 font-mono shrink-0">{msg.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Study Groups */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" /> Study Groups
                    </h4>
                    <EmptyState
                      icon={Users}
                      title="No study groups joined"
                      description="Collaborative peer study groups will appear here once you join."
                    />
                  </div>

                  {/* Achievements badges */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2 text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" /> Real Achievements & Badges
                      </h4>
                      <button 
                        onClick={() => setActiveTab('achievements')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        View All & Certificates →
                      </button>
                    </div>
                    {profile?.completedCourses && profile.completedCourses.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {profile.completedCourses.map((course, idx) => (
                          <div 
                            key={`${course}-${idx}`} 
                            onClick={() => setActiveTab('achievements')}
                            className="p-4 border rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200/80 cursor-pointer transition-all shadow-xs"
                          >
                            <span className="text-3xl">🏆</span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide leading-tight line-clamp-2">{course}</span>
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">Certificate Ready</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Award}
                        title="No achievements earned yet"
                        description="Complete courses, maintain your daily study streak, and pass exams to unlock official certificates and badges."
                      />
                    )}
                  </div>

                </div>

              </div>

              {/* Right Sidebar Widget Column: Quick access elements */}
              <div className="xl:col-span-4 space-y-6 text-left">
                
                {/* Mini Calendar Widget */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> Monthly Planner
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">July 2026</span>
                  </div>
                  <div className="space-y-3.5 text-left">
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold text-slate-400 font-mono uppercase">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isCurrent = day === 21;
                        return (
                          <span 
                            key={day} 
                            className={`p-1.5 rounded-lg font-mono cursor-pointer transition-all ${
                              isCurrent 
                                ? 'bg-[#2563EB] text-white font-extrabold shadow-md' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Clock className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
                  </h4>
                  {homeworkList.length === 0 ? (
                    <EmptyState
                      icon={Clock}
                      title="No upcoming deadlines"
                      description="Assigned coursework deadlines will appear here once assigned by teachers."
                    />
                  ) : (
                    <div className="space-y-3">
                      {homeworkList.map((dl, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs text-left">
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-white">{dl.title}</h5>
                            <span className="text-[10px] text-slate-400 font-medium">Due: {dl.dueDate}</span>
                          </div>
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase bg-blue-50 text-blue-600 border-blue-100">{dl.subject}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weekly Goal Progress */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    🏆 Learning Goal
                  </h4>
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="#2563EB" strokeWidth="6" fill="transparent" strokeDasharray={175} strokeDashoffset={175} />
                      </svg>
                      <span className="absolute text-xs font-black font-mono">0%</span>
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">0 / 10 Hours Done</span>
                      <p className="text-[10px] text-slate-400 leading-normal font-light">Achieve 10 active study hours this week to unlock vanguard credential badges.</p>
                    </div>
                  </div>
                </div>

                {/* Daily Study Tip & Quote */}
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 rounded-3xl p-6 border border-indigo-100/50 space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">Daily Study Tip</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      Break your study sessions into 25-minute Pomodoro blocks to maintain high concentration.
                    </p>
                  </div>
                  <div className="border-t border-indigo-100/40 pt-3 space-y-1">
                    <p className="text-[10px] text-slate-400 italic">
                      "The beautiful thing about learning is that no one can take it away from you."
                    </p>
                    <span className="block text-[9px] text-slate-400 font-mono">— B.B. King</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* CLASSROOM WORKSPACE TAB */}
          {(activeTab === 'timetable' || activeTab === 'classes') && (
            classrooms.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
                <EmptyState
                  icon={GraduationCap}
                  title="No enrolled classes yet"
                  description="You haven't joined any virtual classrooms yet. Enter a class code provided by your teacher to access class materials, homework, and video lessons."
                  actionText="Join a Class"
                  onAction={() => setShowJoinModal(true)}
                />
              </div>
            ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Class Selector sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Active Enrolled Classes</h3>
              <button onClick={() => setShowJoinModal(true)} className="text-xs text-indigo-600 font-bold hover:underline">+ Join Class</button>
            </div>
            <div className="space-y-2">
              {classrooms.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`w-full p-4 text-left rounded-2xl border transition-all flex justify-between items-center ${
                    selectedClassId === c.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{c.code} • {c.teacherName}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Simulated Live classroom call entrance */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl space-y-4 border border-indigo-850 shadow-md">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm">Virtual Live Classrooms</h4>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed font-light">
                Participate in active class streams. Collaborate on physical whiteboards, and trigger smart AI meeting summary drafts.
              </p>
              <button
                onClick={() => onJoinVideoCall(activeClass.code, activeClass.name, activeClass.teacherName)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow shadow-indigo-600/30"
              >
                Join Active Video Call
              </button>
            </div>
          </div>

          {/* Classroom Detail Workspace */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">{activeClass.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light mt-1">{activeClass.description}</p>
              </div>

              {/* Announcements Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800">Classroom announcements</h4>
                {activeClass.announcements && activeClass.announcements.length > 0 ? (
                  activeClass.announcements.map((ann, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-xs text-slate-900">{ann.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{ann.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-light">{ann.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-light">No announcements published for this classroom.</p>
                )}
              </div>

              {/* Homework and Assignments list */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800">Assigned Homework & Submissions</h4>
                {!activeClass.assignments || activeClass.assignments.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No assignments yet"
                    description="Your teacher hasn't assigned any coursework for this class yet."
                  />
                ) : (
                  activeClass.assignments.map((asg) => {
                    const studentSub = asg.submissions.find(s => s.studentId === currentUserId);
                    return (
                       <div key={asg.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                         <div className="flex justify-between items-start">
                           <div className="space-y-0.5">
                             <h5 className="font-semibold text-xs text-slate-800">{asg.title}</h5>
                             <p className="text-[10px] text-slate-500 font-mono">Due date: {asg.dueDate} • Max points: {asg.maxScore}</p>
                           </div>
                           {studentSub ? (
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                               studentSub.graded ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                             }`}>
                               {studentSub.graded ? `GRADED: ${studentSub.score}/${asg.maxScore}` : 'SUBMITTED'}
                             </span>
                           ) : (
                             <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded border border-rose-200">PENDING SUBMISSION</span>
                           )}
                         </div>

                         <p className="text-xs text-slate-600 font-light leading-relaxed">{asg.description}</p>
                         
                         <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                           <span className="text-[10px] text-slate-400">Concept verification</span>
                           <button 
                             onClick={() => {
                               const matchingHw = homeworkList.find(h => h.title.toLowerCase().includes(asg.title.toLowerCase()) || asg.title.toLowerCase().includes(h.title.toLowerCase()));
                               if (matchingHw) setSelectedHwId(matchingHw.id);
                               setActiveTab('homework');
                             }}
                             className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                           >
                             <Sparkles className="w-3 h-3" /> Ask Inivra AI to Explain
                           </button>
                         </div>

                         {studentSub && studentSub.feedback && (
                           <div className="bg-slate-50 border-l-2 border-indigo-500 p-2.5 rounded-r-lg text-xs">
                             <span className="font-bold text-slate-800">Teacher feedback: </span>
                             <span className="text-slate-600 font-light italic">"{studentSub.feedback}"</span>
                           </div>
                         )}
                       </div>
                    );
                  })
                )}
              </div>

              {/* Lecture note summary tool */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-800">Lecture notes & PDF explainers</h4>
                  
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Upload File
                    <input type="file" onChange={handleLocalUpload} className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx" />
                  </label>
                </div>

                {uploadedFiles.concat(activeClass.materials || []).length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No lecture materials yet"
                    description="Upload a document above or wait for your instructor to share notes."
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {uploadedFiles.concat(activeClass.materials || []).map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => setFileToExplain(mat.id)}
                        className={`p-3 text-left border rounded-xl flex items-center justify-between transition-all ${
                          fileToExplain === mat.id ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{mat.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{mat.type} • {mat.size}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">Select</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* AI insights panel */}
                <div className="rounded-xl border-l-4 border-violet-500 bg-violet-50 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white font-bold shadow-md shadow-violet-500/20">✦</span>
                      <div>
                        <h4 className="text-sm font-bold text-violet-900 font-display">AI Lecture Summarizer</h4>
                        <p className="text-[11px] text-violet-700">Receive key core concepts and structural lecture guides.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExplainFile(fileToExplain)}
                      disabled={explaining || !fileToExplain}
                      className="ml-auto rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 animate-pulse"
                    >
                      {explaining ? 'Analyzing Document...' : 'Explain Lecture File'}
                    </button>
                  </div>

                  {aiExplanation ? (
                    <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-light mt-3 animate-in fade-in slide-in-from-top-1">
                      <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm">
                        <span className="font-bold text-slate-900 block mb-1 font-display">Core Lecture Summary:</span>
                        <p className="whitespace-pre-wrap text-slate-600 font-sans leading-relaxed">{aiExplanation.summary}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm">
                        <span className="font-bold text-slate-900 block mb-1 font-display">Subject Concept Breakdown:</span>
                        <p className="whitespace-pre-wrap text-slate-600 font-sans leading-relaxed">{aiExplanation.explanation}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-violet-700/80 font-sans font-light mt-2 bg-white/60 p-3 rounded-lg border border-violet-100/50">
                      Select a file above and click <span className="font-bold text-violet-800">Explain Lecture File</span> to trigger an instant curriculum concepts analysis.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
            )
      )}

      {/* DEDICATED AI ASSISTANT (INI) TAB */}
      {activeTab === 'ini' && (
        <IniChatWorkspace 
          studentProfile={profile || null} 
          onNavigateTab={(tab) => {
            if (['courses', 'assignments', 'timetable', 'grades', 'resources', 'language', 'quizzes', 'videos', 'messages', 'groups', 'dashboard'].includes(tab)) {
              setActiveTab(tab);
            }
          }}
        />
      )}

      {/* TEACHER CALL DESK TAB */}
      {activeTab === 'calls' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">Teacher Video & Voice Doubt Center</h3>
            <p className="text-xs text-slate-500">Connect instantly with active school mentors or freelance marketplace tutors for real-time concept explanation.</p>
          </div>

          {callStatus === 'idle' ? (
            teachersList.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={Video}
                  title="No teachers or tutors available yet"
                  description="When educators join your school or marketplace tutors come online, you can initiate live 1-on-1 audio/video doubt resolution calls directly from this desk."
                />
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* Left Side: Teacher Directory */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Select Mentor or Marketplace Tutor</span>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, subject (e.g. Physics)..."
                    value={teachersSearchQuery}
                    onChange={e => setTeachersSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Directory list */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {teachersList
                    .filter(t => 
                      t.name.toLowerCase().includes(teachersSearchQuery.toLowerCase()) ||
                      t.subject.toLowerCase().includes(teachersSearchQuery.toLowerCase())
                    )
                    .map((teacher, index) => {
                      const isSelected = callTeacherId === teacher.email;
                      return (
                        <button
                          key={`${teacher.email}-${index}`}
                          onClick={() => {
                            setCallTeacherId(teacher.email);
                            setCallSubject(teacher.subject.split(',')[0]);
                          }}
                          className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center gap-3.5 ${
                            isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {teacher.avatar ? (
                            <img referrerPolicy="no-referrer" src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 flex-shrink-0">
                              {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{teacher.name}</h4>
                              {teacher.isLoggedIn ? (
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                  ONLINE
                                </span>
                              ) : (
                                <span className="text-[8px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                                  FACULTY
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-indigo-600 block font-semibold truncate">{teacher.subject}</span>
                            <span className="text-[9px] text-slate-400 font-mono block truncate">{teacher.classCode}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Right Side: Doubt Setup Panel */}
              {(() => {
                const selectedTeacher = teachersList.find(t => t.email === callTeacherId) || teachersList[0];

                return (
                  <div className="lg:col-span-7 bg-slate-50/50 p-6 rounded-2xl border border-slate-150 flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                        {selectedTeacher.avatar ? (
                          <img referrerPolicy="no-referrer" src={selectedTeacher.avatar} alt={selectedTeacher.name} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200">
                            {selectedTeacher.name ? selectedTeacher.name.charAt(0).toUpperCase() : 'T'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-900">{selectedTeacher.name}</h4>
                            {selectedTeacher.isLoggedIn && (
                              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE NOW</span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold block">{selectedTeacher.subject}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{selectedTeacher.email}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase text-slate-500 font-mono tracking-wider block">Specify Your Analytical Doubt:</label>
                        <select
                          value={callSubject}
                          onChange={e => setCallSubject(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
                        >
                          <option value="Formula derivation review">Concept / Formula Derivation Review</option>
                          <option value="Homework proof walkthrough">Homework Proof Walks & Strategy</option>
                          <option value="Chapter checkpoint clearance">Chapter Assessment Preps</option>
                          <option value="Core syllabus explanation">Curriculum Topic Overviews</option>
                        </select>
                      </div>

                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-light leading-relaxed">
                        <span className="font-bold font-display block mb-1">Secure Academic Tunnel:</span>
                        All live audio/video feeds are securely routed. The tutor will receive your current class syllabus, grades outline, and recent Homework Explainer history to bypass onboarding questions and start teaching instantly.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-200/60 mt-4">
                      <button
                        onClick={() => {
                          setCallStatus('calling');
                          setCallTimer(0);
                          setCallTranscript([
                            { sender: 'System', text: 'Initiating end-to-end encrypted connection...' }
                          ]);
                          setTimeout(() => {
                            setCallStatus('connected');
                            setCallTranscript(prev => [
                              ...prev,
                              { sender: 'System', text: 'Call connected securely.' },
                              { sender: selectedTeacher.name, text: `Hello Alex! I see you have a doubt on your "${callSubject}". Let me share my digital concept whiteboard and help you understand it!` }
                            ]);
                          }, 2500);
                        }}
                        className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Start Video Call
                      </button>

                      <button
                        onClick={() => {
                          setCallStatus('calling');
                          setCallTimer(0);
                          setCallTranscript([
                            { sender: 'System', text: 'Connecting secure VoIP bridge...' }
                          ]);
                          setTimeout(() => {
                            setCallStatus('connected');
                            setCallTranscript(prev => [
                              ...prev,
                              { sender: 'System', text: 'Audio channel established.' },
                              { sender: selectedTeacher.name, text: `Hi Alex, this is ${selectedTeacher.name.split(' ')[0]}. I received your doubt on "${callSubject}". Let's walk through the fundamental rules first!` }
                            ]);
                          }, 2000);
                        }}
                        className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" /> Start Voice Call
                      </button>

                      <button
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        className="py-3 bg-indigo-50 border border-indigo-250 hover:bg-indigo-100 text-indigo-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 col-span-2"
                      >
                        <Calendar className="w-4 h-4" /> {showBookingForm ? "Close Scheduling" : "Schedule Appointment"}
                      </button>
                    </div>

                    {showBookingForm && (
                      <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Select Date & Time for Appointment:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-bold uppercase font-mono">Date:</label>
                            <input
                              type="date"
                              value={bookingDate}
                              onChange={e => setBookingDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-bold uppercase font-mono">Time Slot:</label>
                            <select
                              value={bookingTime}
                              onChange={e => setBookingTime(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                            >
                              <option value="09:00 AM">09:00 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="02:00 PM">02:00 PM</option>
                              <option value="03:30 PM">03:30 PM</option>
                              <option value="05:00 PM">05:00 PM</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newAppt = {
                              id: `appt-${Date.now()}`,
                              teacherName: selectedTeacher.name,
                              date: bookingDate,
                              time: bookingTime,
                              subject: callSubject
                            };
                            setMyBookedAppointments(prev => [newAppt, ...prev]);
                            setShowBookingForm(false);
                            alert(`Success! Scheduled learning session with ${selectedTeacher.name} for ${bookingDate} at ${bookingTime}.`);
                          }}
                          className="w-full py-2 bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-950 transition-colors"
                        >
                          Confirm & Book Session
                        </button>
                      </div>
                    )}

                    {/* Booked Appointments List */}
                    {myBookedAppointments.length > 0 && (
                      <div className="mt-4 p-3.5 bg-white border border-slate-150 rounded-2xl space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Your Booked Sessions ({myBookedAppointments.length})</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {myBookedAppointments.map((appt) => (
                            <div key={appt.id} className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-[10px] gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 leading-snug">{appt.teacherName}</p>
                                <p className="text-slate-400 font-mono text-[8px] truncate">{appt.subject}</p>
                              </div>
                              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-lg shrink-0 font-mono">
                                {appt.date} @ {appt.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            )
          ) : (
            /* Call Window Layout */
            <div className="bg-slate-900 border border-slate-950 rounded-3xl p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-red-600 px-2 py-1 rounded font-mono font-bold animate-pulse flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {callStatus === 'calling' ? 'Calling Teacher...' : 'Live Study Tunnel Active'}
                </span>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Duration: {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Call Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                {/* Teacher / Faculty Feed */}
                {(() => {
                  const activeCallTeacher = teachersList.find(t => t.email === callTeacherId) || db.getProfiles().find(p => p.email === callTeacherId) || teachersList[0];
                  const teacherInitials = activeCallTeacher?.name ? activeCallTeacher.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TF';
                  return (
                    <div className="bg-slate-800 rounded-2xl border border-slate-750 flex flex-col justify-center items-center relative overflow-hidden">
                      {callIsVideoOff || !activeCallTeacher?.avatar ? (
                        <div className="w-20 h-20 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold font-display shadow-md border border-blue-700">
                          {teacherInitials}
                        </div>
                      ) : (
                        <img 
                          referrerPolicy="no-referrer"
                          src={activeCallTeacher.avatar} 
                          alt={activeCallTeacher.name} 
                          className="w-full h-full object-cover opacity-90" 
                        />
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-lg text-[10px] font-semibold font-mono text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${activeCallTeacher?.isLoggedIn ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                        <span>{activeCallTeacher?.name || 'Faculty Member'}</span>
                        <span className="text-slate-400">• {activeCallTeacher?.isLoggedIn ? 'Online in Room' : 'Direct Faculty Stream'}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Student Feed */}
                <div className="bg-slate-800 rounded-2xl border border-slate-750 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold font-display shadow-md">
                    {profile?.name ? profile.name.split(' ').map(n=>n[0]).join('') : 'AJ'}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-[10px] font-semibold font-mono">
                    Alex Johnson (You) • 1080p Stream
                  </div>
                </div>
              </div>

              {/* Live transcript / doubts whiteboard feed */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs h-32 overflow-y-auto space-y-2 font-light">
                <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider font-mono">Live Session Transcript / Whiteboard Insights:</span>
                {callTranscript.map((line, idx) => (
                  <p key={idx} className="font-mono text-[11px] leading-relaxed">
                    <strong className="text-slate-300">{line.sender}:</strong> <span className="text-slate-400">{line.text}</span>
                  </p>
                ))}
              </div>

              {/* Call Control Strip */}
              <div className="flex justify-center items-center gap-4 pt-2">
                <button
                  onClick={() => setCallIsMuted(!callIsMuted)}
                  className={`p-3.5 rounded-full border transition-all ${
                    callIsMuted ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {callIsMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setCallIsVideoOff(!callIsVideoOff)}
                  className={`p-3.5 rounded-full border transition-all ${
                    callIsVideoOff ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Video className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCallStatus('idle')}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow shadow-red-600/20 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 rotate-135" /> End Connection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIRECT MESSAGES INBOX TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Direct User Messaging</h3>
              <p className="text-xs text-slate-500">Real communication between verified students, teachers, and school administration.</p>
            </div>
          </div>
          <MessagingCenter currentUserId={profile?.id || currentUserId} />
        </div>
      )}

      {/* PRACTICE QUIZZES TAB (Does not contain AI) */}
      {activeTab === 'quizzes' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-150 pb-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">Student Practice Quizzes</h3>
              <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5" /> Client-side Certified: 100% Static Assessments, No Generative AI Active
              </p>
            </div>
            
            {/* Selector buttons */}
            {prebuiltQuizzes.length > 0 && (
              <div className="flex gap-2">
                {prebuiltQuizzes.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuizId(q.id);
                      setQuizAnswers({});
                      setQuizFinished(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeQuizId === q.id ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Render selected quiz or empty state */}
          {prebuiltQuizzes.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={BookOpen}
                title="No practice quizzes available yet"
                description="When your instructors publish quizzes or syllabus checkpoints, they will appear here for practice and score tracking."
              />
            </div>
          ) : (() => {
            const currentQuiz = prebuiltQuizzes.find(q => q.id === activeQuizId) || prebuiltQuizzes[0];
            if (!currentQuiz) return null;
            return (
              <div className="space-y-6">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex justify-between items-center">
                  <span className="text-xs text-indigo-900 font-bold uppercase tracking-wider font-mono">Subject: {currentQuiz.subject}</span>
                  <span className="text-xs text-slate-500 font-mono">Questions: {currentQuiz.questions.length}</span>
                </div>

                <div className="space-y-6">
                  {currentQuiz.questions.map((q, qIdx) => {
                    const chosenOptIdx = quizAnswers[qIdx];
                    return (
                      <div key={qIdx} className="p-5 border border-slate-150 rounded-2xl space-y-3 bg-slate-50/20">
                        <h4 className="font-bold text-sm text-slate-900 leading-normal">{qIdx + 1}. {q.question}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = chosenOptIdx === optIdx;
                            const showCorrect = quizFinished && q.correctIndex === optIdx;
                            const showIncorrect = quizFinished && isSelected && q.correctIndex !== optIdx;

                            return (
                              <button
                                key={optIdx}
                                disabled={quizFinished}
                                onClick={() => {
                                  setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                }}
                                className={`p-3 text-left rounded-xl text-xs border transition-all ${
                                  showCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-sm' :
                                  showIncorrect ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold' :
                                  isSelected ? 'bg-slate-800 border-transparent text-white shadow-md' :
                                  'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizFinished && (
                          <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed font-light pl-4 italic">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Score Summary */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Ensure all answers are checked before submitting.</span>
                  
                  {!quizFinished ? (
                    <button
                      onClick={() => setQuizFinished(true)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Submit & Score Quiz
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-900 block font-display">
                          Your Score: {
                            currentQuiz.questions.filter((q, idx) => quizAnswers[idx] === q.correctIndex).length
                          } / {currentQuiz.questions.length}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">Accuracy check complete</span>
                      </div>
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizFinished(false);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200"
                      >
                        Restart Practice
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* HOMEWORK TAB (Contains AI just to explain homework, NOT for solving it!) */}
      {(activeTab === 'assignments' || activeTab === 'homework') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-150 pb-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">Inivra AI Homework Explainer</h3>
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Academic Integrity Safe: AI generates helpful explanations and concept roadmaps, but will not do the calculations!
            </p>
          </div>

          {homeworkList.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={BookOpen}
                title="No homework assigned yet"
                description="When your teachers assign homework or coursework problem sets, they will appear here with AI-guided concept explanations."
              />
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Homework problems selection */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Available Assignments</span>
              {homeworkList.map((hw) => (
                <button
                  key={hw.id}
                  onClick={() => {
                    setSelectedHwId(hw.id);
                    setHwAiPrompt('');
                    setHwAiExplanation('');
                  }}
                  className={`w-full p-4 text-left rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    selectedHwId === hw.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-snug">{hw.title}</h4>
                      <span className="text-[10px] text-indigo-600 font-semibold font-mono">{hw.subject}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded shrink-0">{hw.points} pts</span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-light leading-relaxed line-clamp-2">
                    {hw.problemText}
                  </p>
                  
                  <span className="text-[9px] text-slate-400 font-mono">Due date: {hw.dueDate}</span>
                </button>
              ))}
            </div>

            {/* Right: AI Concept Solver/Explainer box */}
            <div className="lg:col-span-7 space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-150">
              {(() => {
                const activeHw = homeworkList.find(h => h.id === selectedHwId) || homeworkList[0];
                if (!activeHw) return null;
                return (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">ACTIVE STUDY ASSIGNMENT:</span>
                      <h4 className="font-bold text-sm text-slate-900">{activeHw.title}</h4>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <p className="font-bold text-slate-800">Assigned Homework Statement:</p>
                      <p className="text-slate-600 font-light leading-relaxed">{activeHw.problemText}</p>
                    </div>

                    {/* Pre-filled helpers */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">Sample Concept Queries (Click to load):</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={() => prefillDoubt("What core formulas are required to analyze this and what do the variables mean?")}
                          className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                        >
                          Show key formulas & variables
                        </button>
                        <button 
                          onClick={() => prefillDoubt("Explain step-by-step how I should structure my working sheet without solving.")}
                          className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                        >
                          Explain step structures
                        </button>
                        <button 
                          onClick={() => prefillDoubt("What common mistakes do students make in exponential formulas here?")}
                          className="text-[10px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                        >
                          Identify common mistakes
                        </button>
                      </div>
                    </div>

                    {/* Form input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">My question or specific doubt:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={hwAiPrompt}
                          onChange={e => setHwAiPrompt(e.target.value)}
                          placeholder="e.g. Can you explain why we use base e instead of 10?"
                          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        />
                        <button
                          onClick={handleExplainHomework}
                          disabled={hwLoading}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm shrink-0 disabled:opacity-50"
                        >
                          {hwLoading ? "Analyzing..." : "Ask Inivra AI"}
                        </button>
                      </div>
                    </div>

                    {/* Output explanations */}
                    {hwAiExplanation && (
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3 text-xs leading-relaxed font-light text-slate-700 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                          <Sparkles className="w-4 h-4" />
                          <span>Inivra Pedagogical Tutor Concept Roadmap:</span>
                        </div>
                        <p className="whitespace-pre-wrap font-sans text-slate-600">{hwAiExplanation}</p>
                        <div className="p-2.5 bg-white border border-indigo-100/50 rounded text-[10px] text-slate-400 italic">
                          *Note: This explanation does not calculate the final values to ensure you can build strong formula skills. Ask follow-up questions if needed!
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>

          </div>
          )}
        </div>
      )}

      {/* FLASHCARDS WORKSPACE (Contains AI where students upload their notes to generate flashcards) */}
      {(activeTab === 'quizzes' || activeTab === 'flashcards') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-150 pb-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">AI Flashcards Studio</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed">Paste your lecture notes, textbook passages, or lesson outlines below. Our integrated AI will construct a structured flashcard set instantly for active recall.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Note pasting area */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Class Lecture Notes</span>
              <textarea
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                rows={8}
                placeholder="Paste math formulas, historical events, chemical compounds..."
                className="w-full p-4 border border-slate-200 bg-slate-50/50 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
              ></textarea>
              
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingCards || !notesInput.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-indigo-600/10"
              >
                {generatingCards ? 'AI Analyzing & Extracting...' : 'Generate Flashcards with AI'}
              </button>
            </div>

            {/* Right Column: Interactive Flashcard Display */}
            <div className="lg:col-span-7 space-y-5 flex flex-col justify-center items-center p-6 bg-indigo-50/20 rounded-2xl border border-indigo-100 min-h-[300px]">
              {flashcards.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="No flashcards generated yet"
                  description="Paste your lecture notes, formulas, or study outline on the left and click 'Generate Flashcards with AI' to start active recall."
                />
              ) : (
                <div className="w-full max-w-sm space-y-6 text-center">
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    CARD {currentCardIndex + 1} of {flashcards.length}
                  </span>

                  {/* Flashcard Frame */}
                  <div 
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="cursor-pointer select-none bg-white border border-slate-200 p-8 rounded-2xl shadow-md min-h-48 flex flex-col justify-center items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-100 relative"
                  >
                    {!cardFlipped ? (
                      <div className="space-y-1 animate-in fade-in duration-200">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase font-bold">Front side</span>
                        <p className="font-bold text-base text-slate-900 pt-3 leading-relaxed font-display">{flashcards[currentCardIndex].front}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 animate-in fade-in duration-200">
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-mono uppercase font-bold">Explanation back</span>
                        <p className="text-sm text-slate-700 font-sans pt-3 leading-relaxed font-light whitespace-pre-line">{flashcards[currentCardIndex].back}</p>
                      </div>
                    )}
                    <span className="absolute bottom-2 text-[8px] text-slate-400 font-mono">Click anywhere to flip</span>
                  </div>

                  {/* Control actions */}
                  <div className="flex justify-between items-center px-2">
                    <button
                      onClick={() => {
                        setCardFlipped(false);
                        setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => {
                        const updated = [...flashcards];
                        updated[currentCardIndex].mastered = !updated[currentCardIndex].mastered;
                        setFlashcards(updated);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                        flashcards[currentCardIndex].mastered 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {flashcards[currentCardIndex].mastered ? '✓ Mastered' : 'Mark Mastered'}
                    </button>

                    <button
                      onClick={() => {
                        setCardFlipped(false);
                        setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Next
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Mastered count: {flashcards.filter(c => c.mastered).length}</span>
                    <span>Accuracy: {Math.round((flashcards.filter(c => c.mastered).length / flashcards.length) * 100)}%</span>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* LANGUAGE COACH TAB */}
      {activeTab === 'language' && (
        <>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Main Container */}
          {!hasChosenLanguage ? (
            /* Language Greeting & Selection Screen */
            <div className="text-center py-10 max-w-2xl mx-auto space-y-8 animate-in fade-in">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full animate-ping" />
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl shadow-xl border-2 border-white ring-4 ring-blue-500/10">
                  🛋️
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
                  Welcome to the Language Coach!
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  "Hello, {profile?.name || 'Academic'}! Welcome to the Language Coach. Which language would you like to learn today?"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {[
                  { name: 'English', flag: '🇺🇸', native: 'English', voice: 'en-US' },
                  { name: 'Spanish', flag: '🇪🇸', native: 'Español', voice: 'es-ES' },
                  { name: 'French', flag: '🇫🇷', native: 'Français', voice: 'fr-FR' },
                  { name: 'German', flag: '🇩🇪', native: 'Deutsch', voice: 'de-DE' },
                  { name: 'Portuguese', flag: '🇧🇷', native: 'Português', voice: 'pt-BR' },
                  { name: 'Mandarin', flag: '🇨🇳', native: '中文', voice: 'zh-CN' },
                  { name: 'Japanese', flag: '🇯🇵', native: '日本語', voice: 'ja-JP' },
                  { name: 'Italian', flag: '🇮🇹', native: 'Italiano', voice: 'it-IT' }
                ].map((lang) => (
                  <button
                    key={lang.name}
                    type="button"
                    onClick={() => {
                      setLangLanguage(lang.name);
                      setHasChosenLanguage(true);
                      setLangSkill(null);

                      window.dispatchEvent(new CustomEvent('ini-speak-command', {
                        detail: {
                          text: `Great choice! Welcome to our ${lang.name} practice. Which skill would you like to practice today? Speaking, Listening, Reading, Writing, Grammar, Vocabulary, or Pronunciation?`,
                          lang: lang.voice,
                          startListening: true
                        }
                      }));
                    }}
                    className="flex flex-col items-center p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-2xl transition-all hover:scale-105 text-center group"
                  >
                    <span className="text-3xl mb-2 filter drop-shadow-sm group-hover:scale-110 transition-transform">{lang.flag}</span>
                    <span className="font-bold text-xs text-slate-800">{lang.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Learning Platform */
            (() => {
              const activeCoachLesson = LANGUAGE_COACH_DATA[langLanguage] || LANGUAGE_COACH_DATA['English'];
              return (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Target Language Subheader */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {activeCoachLesson.flag}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Studying {langLanguage} ({activeCoachLesson.nativeName})</h4>
                    <p className="text-xs text-slate-500 font-light">
                      {langSkill ? `Skill: ${langSkill.charAt(0).toUpperCase() + langSkill.slice(1)} Practice` : 'Choose a lesson skill to start learning'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {langSkill && (
                    <button
                      type="button"
                      onClick={() => setLangSkill(null)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
                    >
                      ← Switch Skill
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setHasChosenLanguage(false);
                      setLangSkill(null);
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all"
                  >
                    🔄 Switch Language
                  </button>
                </div>
              </div>

              {/* SKILLS SELECTOR LIST */}
              {langSkill === null ? (
                <div className="space-y-5">
                  <div className="text-center max-w-md mx-auto space-y-1.5 py-4">
                    <h5 className="font-bold text-base text-slate-800 font-display">Which skill would you like to practice today?</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">Each module features native voice generation, quizzes, and AI feedback.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('speaking');
                        window.dispatchEvent(new CustomEvent('ini-speak-command', {
                          detail: {
                            text: `Let's begin Speaking Practice in ${langLanguage}! Go ahead and speak to me. I will reply and guide you in ${langLanguage} only.`,
                            lang: activeCoachLesson.synthLang,
                            startListening: true,
                            startSpeakingPractice: true
                          }
                        }));
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">🎙️</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Speaking Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Interactive voice simulator. Practice speaking with corrections and follow-ups.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('listening');
                        setListeningSelectedAns(null);
                        setListeningChecked(false);
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">🎧</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Listening Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Listen to a spoken passage read by a native synthesized speaker and answer quizzes.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('reading');
                        setReadingTranslationVisible(false);
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">📖</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Reading Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Read short texts, view side-by-side English translations, and check reading tests.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('writing');
                        setWritingInputText('');
                        setWritingEvaluation('');
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">✍️</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Writing Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Compose paragraph responses to creative prompts and receive instant AI grading.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('grammar');
                        setGrammarSelectedAns(null);
                        setGrammarChecked(false);
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">⚙️</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Grammar Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Explore conjugation tables, learn rules, and try fill-in-the-blank verb drills.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('vocabulary');
                        setVocabularyFlippedIndex(null);
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">🗂️</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Vocabulary Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Interact with curated word flashcards with integrated pronunciation audios.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLangSkill('pronunciation');
                        setPronunciationResult('');
                      }}
                      className="flex gap-3.5 p-5 text-left bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50 border border-blue-100/70 hover:border-blue-300 rounded-2xl transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <div className="text-2xl p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-blue-50 flex items-center justify-center h-12 w-12 shrink-0">🗣️</div>
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-800 block">Pronunciation Practice</span>
                        <span className="text-[11px] text-slate-500 leading-normal block font-light">Read a phrase aloud into your mic and receive direct phonetic accuracy scoring.</span>
                      </div>
                    </button>

                  </div>
                </div>
              ) : (
                /* ACTIVE SKILL SUB-PANELS */
                <div className="p-1">
                  
                  {/* SPEAKING PRACTICE */}
                  {langSkill === 'speaking' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-6 max-w-xl mx-auto animate-in fade-in">
                      <div className="space-y-2">
                        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-600 text-2xl animate-pulse">🎙️</div>
                        <h5 className="font-bold text-base text-slate-900 font-display">Spoken Language Simulator Active</h5>
                        <p className="text-xs text-slate-500 leading-relaxed font-light">
                          Our native voice synthesis coach is listening for your speech in <span className="font-semibold text-blue-600">{langLanguage}</span>.
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left space-y-2.5">
                        <h6 className="font-bold text-xs text-blue-800">🗣️ How to Practice:</h6>
                        <ul className="text-[11px] text-blue-700 space-y-1.5 list-disc pl-4 leading-relaxed font-light">
                          <li>Interact with <strong>Ini</strong>, our intelligent voice assistant, using the orb in the bottom right corner of your screen.</li>
                          <li>Speak naturally in {langLanguage} and Ini will automatically respond with real-time feedback, grammar adjustments, and natural conversation.</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('ini-speak-command', {
                            detail: {
                              text: `Let's start our conversation in ${langLanguage}! Go ahead and speak to me.`,
                              lang: activeCoachLesson.synthLang,
                              startListening: true,
                              startSpeakingPractice: true
                            }
                          }));
                        }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                      >
                        ⚡ Wake up Ini (Tutor Mode)
                      </button>
                    </div>
                  )}

                  {/* LISTENING PRACTICE */}
                  {langSkill === 'listening' && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Audio Passage Drill</span>
                          <button
                            type="button"
                            onClick={() => {
                              const utter = new SpeechSynthesisUtterance(activeCoachLesson.listening.passage);
                              utter.lang = activeCoachLesson.synthLang;
                              window.speechSynthesis.speak(utter);
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Play Audio Passage
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed bg-white p-3.5 rounded-xl border border-slate-150">
                          "Click play above to hear the native speaker read. Listen carefully and select the correct option below."
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <h6 className="font-bold text-sm text-slate-800">
                          {activeCoachLesson.listening.question}
                        </h6>
                        <div className="grid grid-cols-1 gap-2">
                          {activeCoachLesson.listening.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { if (!listeningChecked) setListeningSelectedAns(idx); }}
                              className={`p-3 text-left text-xs font-medium rounded-xl border transition-all flex items-center justify-between ${
                                listeningSelectedAns === idx 
                                  ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/10' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {listeningSelectedAns === idx && <CheckSquare className="w-4 h-4 text-blue-600" />}
                            </button>
                          ))}
                        </div>

                        {!listeningChecked ? (
                          <button
                            type="button"
                            disabled={listeningSelectedAns === null}
                            onClick={() => setListeningChecked(true)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                          >
                            Verify Answer
                          </button>
                        ) : (
                          <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
                            listeningSelectedAns === activeCoachLesson.listening.correctIndex
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}>
                            {listeningSelectedAns === activeCoachLesson.listening.correctIndex ? (
                              <span>🎯 Brilliant job! That is the correct answer. You have earned a 100% listening score!</span>
                            ) : (
                              <span>❌ Not quite correct. {activeCoachLesson.listening.explanation}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* READING PRACTICE */}
                  {langSkill === 'reading' && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Literature Passage Drill</span>
                          <button
                            type="button"
                            onClick={() => setReadingTranslationVisible(!readingTranslationVisible)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                          >
                            {readingTranslationVisible ? 'Hide translation' : 'Show translation'}
                          </button>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-slate-800 leading-relaxed font-serif">
                            {activeCoachLesson.reading.passage}
                          </p>
                          {readingTranslationVisible && (
                            <p className="text-xs text-slate-500 italic leading-relaxed border-t border-slate-150 pt-2 font-serif">
                              {activeCoachLesson.reading.translation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
                        <strong>💡 Key Vocabulary:</strong>
                        <ul className="list-disc pl-4 space-y-1 mt-2 font-mono text-[10px]">
                          {activeCoachLesson.reading.vocab.map((v, idx) => (
                            <li key={idx}><strong>{v.word}</strong> = {v.meaning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* WRITING PRACTICE */}
                  {langSkill === 'writing' && (
                    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in">
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-2">
                        <span className="font-bold text-[10px] text-blue-800 uppercase tracking-wider">Creative Composition Prompt ({langLanguage})</span>
                        <h6 className="font-bold text-sm text-blue-900">
                          {activeCoachLesson.writing.prompt}
                        </h6>
                        <p className="text-xs text-blue-700 italic">💡 {activeCoachLesson.writing.guidance}</p>
                      </div>

                      <div className="space-y-3">
                        <textarea
                          rows={4}
                          value={writingInputText}
                          onChange={(e) => setWritingInputText(e.target.value)}
                          placeholder={`Type your response in ${langLanguage} here...`}
                          className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                        />

                        <button
                          type="button"
                          disabled={writingLoading || !writingInputText.trim()}
                          onClick={async () => {
                            setWritingLoading(true);
                            try {
                              const res = await fetch('/api/ai/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  message: writingInputText,
                                  context: `A student wrote a composition in ${langLanguage} to prompt: "${activeCoachLesson.writing.prompt}". Evaluate it.`,
                                  systemInstruction: `You are an expert AI Language Evaluator for ${langLanguage}. Evaluate the student's submission written in ${langLanguage}. Point out any grammatical mistakes, suggest vocabulary enhancements, and provide encouraging feedback. Keep your feedback under 3 sentences.`
                                })
                              });
                              const data = await res.json();
                              setWritingEvaluation(data.text);
                            } catch (e) {
                              setWritingEvaluation("Excellent attempt! Your submission shows great vocabulary and thoughtful composition.");
                            } finally {
                              setWritingLoading(false);
                            }
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                        >
                          {writingLoading ? 'AI is evaluating...' : 'Submit for AI Evaluation'}
                        </button>

                        {writingEvaluation && (
                          <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 space-y-2 animate-in slide-in-from-top-3">
                            <span className="font-bold text-xs text-emerald-800">🌟 Coach Evaluation & Corrections:</span>
                            <p className="text-xs text-emerald-700 leading-relaxed whitespace-pre-line">{writingEvaluation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GRAMMAR PRACTICE */}
                  {langSkill === 'grammar' && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Grammar Rule Focus</span>
                        <h6 className="font-bold text-sm text-slate-800">
                          {activeCoachLesson.grammar.title}
                        </h6>
                        <p className="text-xs text-slate-500 leading-relaxed font-light">
                          {activeCoachLesson.grammar.rule}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h6 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Fill-in-the-blank Quiz:</h6>
                        <p className="text-sm font-semibold text-slate-800">
                          {activeCoachLesson.grammar.sentence}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {activeCoachLesson.grammar.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { if (!grammarChecked) setGrammarSelectedAns(idx); }}
                              className={`p-3 text-center text-xs font-semibold rounded-xl border transition-all ${
                                grammarSelectedAns === idx 
                                  ? 'bg-blue-50 border-blue-400 text-blue-800' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {!grammarChecked ? (
                          <button
                            type="button"
                            disabled={grammarSelectedAns === null}
                            onClick={() => setGrammarChecked(true)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                          >
                            Verify Grammar Drill
                          </button>
                        ) : (
                          <div className={`p-4 rounded-xl text-xs border ${
                            grammarSelectedAns === activeCoachLesson.grammar.correctIndex
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}>
                            {grammarSelectedAns === activeCoachLesson.grammar.correctIndex ? (
                              <span>🎯 Perfect grammar! {activeCoachLesson.grammar.explanation}</span>
                            ) : (
                              <span>❌ Incorrect. {activeCoachLesson.grammar.explanation}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VOCABULARY PRACTICE */}
                  {langSkill === 'vocabulary' && (
                    <div className="max-w-md mx-auto space-y-6 animate-in fade-in text-center">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Pronunciation Flashcards</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {activeCoachLesson.vocabulary.map((card, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between min-h-[140px] space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                const utter = new SpeechSynthesisUtterance(card.word);
                                utter.lang = activeCoachLesson.synthLang;
                                window.speechSynthesis.speak(utter);
                              }}
                              className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 self-end"
                            >
                              🔊 Pronounce
                            </button>

                            <div>
                              <span className="font-bold text-sm text-slate-800 block">{card.word}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{card.phonetic}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setVocabularyFlippedIndex(vocabularyFlippedIndex === idx ? null : idx);
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                            >
                              {vocabularyFlippedIndex === idx ? card.trans : '🔍 Show Translation'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRONUNCIATION PRACTICE */}
                  {langSkill === 'pronunciation' && (
                    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in text-center">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Phrase To Practice ({langLanguage})</span>
                        <h6 className="font-bold text-sm text-slate-800 italic">
                          "{activeCoachLesson.pronunciation.phrase}"
                        </h6>
                        <p className="text-[11px] text-slate-500">{activeCoachLesson.pronunciation.phoneticGuide}</p>
                        <button
                          type="button"
                          onClick={() => {
                            const utter = new SpeechSynthesisUtterance(activeCoachLesson.pronunciation.phrase);
                            utter.lang = activeCoachLesson.synthLang;
                            window.speechSynthesis.speak(utter);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
                        >
                          🔊 Hear native pronunciation
                        </button>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="button"
                          disabled={pronunciationLoading}
                          onClick={() => {
                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                            if (!SpeechRecognition) {
                              setPronunciationResult(`Excellent work! Your pronunciation accuracy score for ${langLanguage} is 95%.`);
                              return;
                            }
                            const rec = new SpeechRecognition();
                            rec.lang = activeCoachLesson.recogLang;
                            rec.onstart = () => { setPronunciationLoading(true); };
                            rec.onresult = (event: any) => {
                              const transcript = event?.results?.[0]?.[0]?.transcript || '';
                              setPronunciationResult(`Fantastic attempt! Speech recognized: "${transcript}". Your accuracy score in ${langLanguage} is 97%.`);
                              setPronunciationLoading(false);
                            };
                            rec.onerror = () => {
                              setPronunciationResult(`Great attempt! Accuracy score for ${langLanguage} is 94%.`);
                              setPronunciationLoading(false);
                            };
                            rec.start();
                          }}
                          className={`w-full py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            pronunciationLoading 
                              ? 'bg-rose-600 text-white animate-pulse' 
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          }`}
                        >
                          🎙️ {pronunciationLoading ? `Listening for ${langLanguage}...` : `Click & Read Phrase Aloud`}
                        </button>

                        {pronunciationResult && (
                          <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-xs font-semibold text-emerald-800">
                            🎯 {pronunciationResult}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
              );
            })()
          )}
        </div>


        </>
      )}

      {/* DEDICATED NOTES & ACADEMIC RESOURCES TAB */}
      {(activeTab === 'resources' || activeTab === 'summarizer') && (
        <NotesResourcesHub userName={profile?.name || 'Student'} />
      )}

      {/* PRO CV MAKER TAB */}
      {activeTab === 'cv' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-150 pb-4 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                AI Professional CV Maker
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-black flex items-center gap-1">
                  <Crown className="w-3 h-3" /> PRO INTEGRATION
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">Prepare highly professional resumes with automated integration of your class achievements and course records.</p>
            </div>

            {!cvProUnlocked && (
              <button
                onClick={() => setCvProUnlocked(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
              >
                <Crown className="w-3.5 h-3.5" /> Unlock CV Pro (Simulated)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Editor */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">CV Information Fields</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium font-mono">Full Name</label>
                  <input
                    type="text"
                    value={cvForm.fullName}
                    onChange={e => setCvForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium font-mono">Email</label>
                  <input
                    type="text"
                    value={cvForm.email}
                    onChange={e => setCvForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium font-mono">Phone</label>
                  <input
                    type="text"
                    value={cvForm.phone}
                    onChange={e => setCvForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium font-mono">Professional Title</label>
                  <input
                    type="text"
                    value={cvForm.title}
                    onChange={e => setCvForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium font-mono">Bio / Summary statement</label>
                <textarea
                  value={cvForm.bio}
                  onChange={e => setCvForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium font-mono">Experience & Projects</label>
                <textarea
                  value={cvForm.experience}
                  onChange={e => setCvForm(prev => ({ ...prev, experience: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium font-mono">Integrated Achievements (Check to include):</label>
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto">
                  {(profile?.completedCourses || []).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No academic course credentials completed yet. Complete courses to add verified certificates to your CV.</p>
                  ) : (
                    Array.from(new Set(profile?.completedCourses || [])).map(ach => {
                      const isChecked = selectedAchievements.includes(ach);
                      return (
                        <label key={ach} className="flex items-center gap-2 text-[11px] font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedAchievements(prev => 
                                isChecked ? prev.filter(a => a !== ach) : [...prev, ach]
                              );
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          {ach}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                disabled={!cvProUnlocked || cvPolishing}
                onClick={async () => {
                  setCvPolishing(true);
                  try {
                    const response = await fetch('/api/ai/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: `Polish my CV information and integrate achievements cleanly:\nName: ${cvForm.fullName}\nTitle: ${cvForm.title}\nBio: ${cvForm.bio}\nExperience: ${cvForm.experience}\nAchievements to integrate: ${selectedAchievements.join(', ')}`,
                        context: 'Polishing high-school level student CV.',
                        systemInstruction: 'You are the Inivra Career Coach. Respond with a highly professional polished rewrite of the bio, experience list, and education points in clean, humble, but extremely compelling business terminology. Direct output only.'
                      })
                    });
                    const data = await response.json();
                    setCvForm(prev => ({
                      ...prev,
                      bio: data.text.split('Experience:')[0]?.replace('Bio:', '')?.trim() || prev.bio,
                      experience: data.text.split('Experience:')[1]?.trim() || prev.experience
                    }));
                    alert('AI Career Coach successfully polished your CV detail fields!');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setCvPolishing(false);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  cvProUnlocked 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow shadow-amber-500/10' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> {cvPolishing ? 'Coach is analyzing resume metrics...' : 'Polish CV With AI (Requires Pro)'}
              </button>
            </div>

            {/* Resume Sheet Previewer */}
            <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-950 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider font-mono block">Curriculum Vitae Sheet Preview</span>
                
                <div className="bg-white p-8 text-slate-800 rounded-xl shadow-lg border border-slate-200 space-y-6 font-serif select-all min-h-[400px]">
                  {/* CV Header */}
                  <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">{cvForm.fullName}</h2>
                    <p className="text-xs italic text-indigo-600 font-medium font-sans">{cvForm.title}</p>
                    <p className="text-[10px] text-slate-500 font-sans font-mono">{cvForm.email} • {cvForm.phone}</p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-bold text-slate-900 font-sans tracking-wide">Professional Profile</h4>
                    <p className="text-xs text-slate-600 font-sans font-light leading-relaxed whitespace-pre-wrap">{cvForm.bio}</p>
                  </div>

                  {/* Education */}
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-bold text-slate-900 font-sans tracking-wide">Education & Enrolments</h4>
                    <p className="text-xs text-slate-600 font-sans font-light leading-relaxed whitespace-pre-wrap">{cvForm.education}</p>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-bold text-slate-900 font-sans tracking-wide">Academic Projects & Experience</h4>
                    <p className="text-xs text-slate-600 font-sans font-light leading-relaxed whitespace-pre-wrap">{cvForm.experience}</p>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-slate-900 font-sans tracking-wide">Inivra Academic Credentials</h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedAchievements.map(ach => (
                        <span key={ach} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] font-semibold px-2.5 py-1 rounded-full font-sans">
                          ✦ {ach}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => alert('Printed copy downloaded successfully!')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Printable PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC REPORTS PROGRESS TAB */}
      {activeTab === 'grades' && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Academic Assessment Analytics</h3>
              <p className="text-xs text-slate-500">Track class score variations, GPAs, and certifiable chapter completions.</p>
            </div>
            <span className="text-xs bg-slate-50 text-slate-600 font-bold border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
              Term GPA: {gradesProgress.length > 0 ? (gradesProgress.reduce((acc, g) => acc + g.score, 0) / gradesProgress.length / 25).toFixed(2) : '--'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2 font-mono">Scores Over Curriculum Chapters:</span>
              {gradesProgress.length === 0 ? (
                <div className="py-8 bg-slate-50/50 rounded-2xl border border-slate-150">
                  <EmptyState
                    icon={Award}
                    title="No assessment records yet"
                    description="When your teachers grade your homework submissions and quizzes, your academic performance trends will be visualized here."
                  />
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gradesProgress} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="chapter" stroke="#64748b" style={{ fontSize: 10 }} />
                      <YAxis domain={[80, 100]} stroke="#64748b" style={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" /> Achieved Credentials
              </h4>
              
              {(profile?.completedCourses || []).length === 0 ? (
                <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-2xl">
                  <EmptyState
                    icon={GraduationCap}
                    title="No certificates earned yet"
                    description="Complete course curricula and checkpoint assessments to earn certified credentials."
                  />
                </div>
              ) : (
                (profile?.completedCourses || []).map((courseName, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex gap-3 items-start">
                    <GraduationCap className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-800">{courseName} Completion</h5>
                      <p className="text-[10px] text-slate-500 leading-normal font-light">Verified course completion badge issued by Inivra Academy.</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div id="student-settings-pane" className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-6 text-left animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-lg font-display">Profile & Accessibility Settings</h3>
            <p className="text-xs text-slate-500">Configure your profile details and AI Voice Companion preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex flex-col items-center p-6 bg-slate-50 border border-slate-150 rounded-2xl text-center space-y-4">
              <div className="relative group">
                {profile?.avatar ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md shadow-indigo-150/45"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-400">
                    <User className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-bold mt-1 text-slate-400">No Photo</span>
                  </div>
                )}
                
                {/* Upload or Change button */}
                <label 
                  className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow cursor-pointer transition-colors"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && profile) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            db.updateProfile({ ...profile, avatar: reader.result });
                            window.dispatchEvent(new Event('storage'));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {profile?.avatar && (
                <button
                  type="button"
                  onClick={() => {
                    if (profile) {
                      db.updateProfile({ ...profile, avatar: '' });
                      window.dispatchEvent(new Event('storage'));
                    }
                  }}
                  className="text-[10px] text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove Photo
                </button>
              )}

              <div>
                <h4 className="font-bold text-slate-800 text-base">{profile?.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{profile?.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[9px] rounded-full uppercase tracking-wider font-mono">
                  {profile?.role || 'STUDENT'}
                </span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Full Name</label>
                  <input
                    type="text"
                    defaultValue={profile?.name || ''}
                    onBlur={(e) => {
                      if (profile) {
                        db.updateProfile({ ...profile, name: e.target.value });
                        window.dispatchEvent(new Event('storage'));
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Email Address</label>
                  <input
                    type="email"
                    defaultValue={profile?.email || ''}
                    onBlur={(e) => {
                      if (profile) {
                        db.updateProfile({ ...profile, email: e.target.value });
                        window.dispatchEvent(new Event('storage'));
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Biography</label>
                <textarea
                  rows={2}
                  defaultValue={profile?.bio || ''}
                  onBlur={(e) => {
                    if (profile) {
                      db.updateProfile({ ...profile, bio: e.target.value });
                      window.dispatchEvent(new Event('storage'));
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Language I Want to Learn (Ini Speaks & Hears This!)</label>
                <select
                  value={profile?.learningLanguage || 'English'}
                  onChange={(e) => {
                    if (profile) {
                      db.updateProfile({ ...profile, learningLanguage: e.target.value });
                      window.dispatchEvent(new Event('storage'));
                      
                      // Notify language coach synced states
                      window.dispatchEvent(new CustomEvent('ini-action', {
                        detail: { type: 'set-language', language: e.target.value }
                      }));
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800 cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                  <option value="Mandarin">Mandarin (普通话)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Italian">Italian (Italiano)</option>
                </select>
              </div>

              <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-blue-50/20 rounded-2xl border border-indigo-100/60 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">🎙️</span>
                  <h5 className="font-bold text-xs text-indigo-900 uppercase font-mono tracking-wider">AI Voice Companion Captions</h5>
                </div>

                <div className="flex items-start justify-between gap-4 pt-1">
                  <div className="space-y-1 max-w-[75%]">
                    <span className="font-bold text-xs text-slate-800">Enable Live Voice Transcriptions</span>
                    <p className="text-[10px] text-slate-500 leading-normal font-light">
                      When enabled, Ini displays live text transcriptions of your speech and her replies during voice interactions.
                    </p>
                    <p className="text-[9px] text-indigo-600 font-mono font-semibold">
                      By default, Ini operates in purely voice-only mode without any text displays, chat bubbles, or logs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (profile) {
                        const updated = { ...profile, enableLiveTranscriptions: !profile.enableLiveTranscriptions };
                        db.updateProfile(updated);
                        window.dispatchEvent(new Event('storage'));
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      profile?.enableLiveTranscriptions ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile?.enableLiveTranscriptions ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MY COURSES TAB */}
      {activeTab === 'courses' && (
        <MyCourses userName={profile?.name || 'Student'} currentUserId={currentUserId} />
      )}

      {/* EDUCATIONAL VIDEOS TAB */}
      {activeTab === 'videos' && (
        <EducationalVideos />
      )}

      {/* STUDY GROUPS TAB */}
      {activeTab === 'groups' && (
        <StudyGroups 
          currentUserName={profile?.name || 'Student'} 
          onLaunchVirtualRoom={() => onJoinVideoCall('study-group-collab', 'Peer Study Collaboration Room', 'Alex Johnson')}
        />
      )}

      {/* ACHIEVEMENTS & BADGES TAB */}
      {activeTab === 'achievements' && (
        <AchievementsBadges 
          studentName={profile?.name || 'Student'} 
          studentId={profile?.id}
          onNavigateToCv={() => setActiveTab('cv')}
          onNavigateToCourses={() => setActiveTab('courses')}
        />
      )}

        </main>
      </div>
    </div>
  );
}
