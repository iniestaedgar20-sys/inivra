import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, Paperclip, X, Volume2, VolumeX, 
  RotateCcw, Copy, Check, BookOpen, FileText, Calendar, 
  BarChart2, FolderOpen, Globe, Brain, Video, MessageSquare, 
  Users, ArrowRight, Lightbulb, FileCheck
} from 'lucide-react';
import { UserProfile } from '../types';

export interface IniChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
    content?: string;
  };
  navigationAction?: {
    tabKey: string;
    tabLabel: string;
  };
}

interface IniChatWorkspaceProps {
  studentProfile?: UserProfile | null;
  userProfile?: UserProfile | null;
  role?: string;
  onNavigateTab: (tab: string) => void;
}

const INI_AVATAR = "https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png";

export default function IniChatWorkspace({ studentProfile, userProfile, role, onNavigateTab }: IniChatWorkspaceProps) {
  const profile = userProfile || studentProfile;
  const userRole = role || profile?.role || 'Student';
  const isTeacher = userRole === 'Teacher' || userRole === 'Educator';
  const activeUserId = profile?.id || (isTeacher ? 'teacher_user' : 'default_student');
  const activeUserName = profile?.name || (isTeacher ? 'Educator' : 'Student');
  const firstName = activeUserName.split(' ')[0];

  // Conversation state stored per user
  const [messages, setMessages] = useState<IniChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`inivra_ini_chat_${activeUserId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // New account starts completely EMPTY
    return [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Attached document state
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
    content?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save conversation state
  useEffect(() => {
    try {
      localStorage.setItem(`inivra_ini_chat_${activeUserId}`, JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages, activeUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Text-to-speech helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner speech
    const cleanSpeech = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Female')) && v.lang.startsWith('en')) ||
      voices.find(v => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech-to-text recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Format size
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    // Attempt to read text content if text-based
    const isTextBased = file.type.includes('text') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv');

    if (isTextBased) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: sizeStr,
          type: file.type || 'text/plain',
          content: event.target?.result as string
        });
      };
      reader.readAsText(file);
    } else {
      // For PDFs, Word, PPTs, or images, store metadata
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        content: `Attached file: ${file.name} (${sizeStr}, type: ${file.type || 'document'}). Please answer the student's questions regarding this learning material.`
      });
    }

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  // Detect in-app navigation request from user's query
  const detectNavigationIntent = (text: string): { tabKey: string; tabLabel: string } | null => {
    const lower = text.toLowerCase();
    
    if (lower.includes('lesson plan') || lower.includes('lesson')) {
      return { tabKey: 'lesson_plans', tabLabel: 'Lesson Plans' };
    }
    if (lower.includes('student') || lower.includes('roster')) {
      return { tabKey: 'students', tabLabel: 'My Students' };
    }
    if (lower.includes('my course') || lower.includes('open course') || lower.includes('view courses') || lower.includes('show courses')) {
      return { tabKey: 'courses', tabLabel: 'My Courses' };
    }
    if (lower.includes('assignment') || lower.includes('homework') || lower.includes('show task') || lower.includes('open task')) {
      return { tabKey: 'assignments', tabLabel: 'Assignments' };
    }
    if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('my classes') || lower.includes('show classes')) {
      return { tabKey: isTeacher ? 'schedule' : 'timetable', tabLabel: isTeacher ? 'Class Schedule' : 'Timetable' };
    }
    if (lower.includes('gradebook') || lower.includes('grading') || lower.includes('grade') || lower.includes('progress') || lower.includes('report card') || lower.includes('my score') || lower.includes('gpa')) {
      return { tabKey: isTeacher ? 'gradebook' : 'grades', tabLabel: isTeacher ? 'Gradebook' : 'Grades & Progress' };
    }
    if (lower.includes('summarizer') || lower.includes('summary')) {
      return { tabKey: 'summarizer', tabLabel: 'AI Document Summarizer' };
    }
    if (lower.includes('notes') || lower.includes('resource') || lower.includes('study material')) {
      return { tabKey: 'resources', tabLabel: 'Notes & Resources' };
    }
    if (lower.includes('language') || lower.includes('spanish') || lower.includes('french') || lower.includes('german') || lower.includes('speaking practice')) {
      return { tabKey: 'language', tabLabel: 'Language Coach' };
    }
    if (lower.includes('quiz') || lower.includes('flashcard') || lower.includes('test prep') || lower.includes('study cards') || lower.includes('exam')) {
      return { tabKey: 'quizzes', tabLabel: 'Flashcards & Quizzes' };
    }
    if (lower.includes('video') || lower.includes('lesson video') || lower.includes('watch lecture')) {
      return { tabKey: 'videos', tabLabel: 'Video Lessons' };
    }
    if (lower.includes('message') || lower.includes('inbox') || lower.includes('teacher message') || lower.includes('chat')) {
      return { tabKey: isTeacher ? 'messages_tab' : 'messages', tabLabel: 'Messages Center' };
    }
    if (lower.includes('study group') || lower.includes('peer group') || lower.includes('classmates')) {
      return { tabKey: 'groups', tabLabel: 'Study Groups' };
    }

    return null;
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!query && !attachedFile) return;

    if (isThinking) return;

    // Check navigation intent
    const navIntent = detectNavigationIntent(query);

    // Check creator / owner intent
    const queryLower = query.toLowerCase();
    const isCreatorQuery = (
      (queryLower.includes('who') && (queryLower.includes('created') || queryLower.includes('made') || queryLower.includes('built') || queryLower.includes('founded') || queryLower.includes('designed') || queryLower.includes('owns') || queryLower.includes('owner') || queryLower.includes('creator'))) ||
      queryLower.includes('who created inivra') ||
      queryLower.includes('who created inivra learn') ||
      queryLower.includes('who made inivra') ||
      queryLower.includes('who owns inivra') ||
      queryLower.includes('who is the owner') ||
      queryLower.includes('who is the creator') ||
      queryLower.includes('who is your creator') ||
      queryLower.includes('who is your owner') ||
      queryLower.includes('who is the founder') ||
      queryLower.includes('who created you')
    );

    const userMessage: IniChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query || `Please analyze this attached file: ${attachedFile?.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachedFile ? { ...attachedFile } : undefined
    };

    if (isCreatorQuery) {
      const ownerReply = 'The owner is iniesta.';
      const assistantMessage: IniChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: ownerReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, userMessage, assistantMessage]);
      setInputMessage('');
      setAttachedFile(null);
      if (voiceModeActive) {
        speakText(ownerReply);
      }
      return;
    }

    const currentAttached = attachedFile;
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setAttachedFile(null);
    setIsThinking(true);

    try {
      // Build conversation history payload for multi-turn context memory
      const historyPayload = newHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userName: firstName,
          history: historyPayload,
          attachment: currentAttached ? {
            name: currentAttached.name,
            type: currentAttached.type,
            content: currentAttached.content
          } : undefined,
          context: `${userRole}: ${activeUserName}. Current view: Inivra Learn AI Assistant workspace. Help with ${isTeacher ? 'pedagogy, lesson planning, rubric generation, grading, differentiation, and academic guidance' : 'learning, homework help, active recall, concept explanation, and study habits'}. If user asked to navigate or open a section of Inivra, explain clearly and confirm navigation.`
        })
      });

      const data = await response.json();
      let aiText = data.text || "I'm here to guide you through this concept. What specific part would you like to explore first?";

      // If navigation intent was detected, append supportive navigation confirmation if not already present
      let navigationAction = navIntent || undefined;
      if (navIntent) {
        if (!aiText.toLowerCase().includes(navIntent.tabLabel.toLowerCase())) {
          aiText += `\n\nI've also prepared the **${navIntent.tabLabel}** section for you. Click the button below to jump straight there!`;
        }
      }

      const assistantMessage: IniChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        navigationAction
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If voice mode is active, read the response aloud
      if (voiceModeActive) {
        speakText(aiText);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      const fallbackMsg: IniChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `I received your request regarding **"${query}"**. Let's break this down systematically:\n\n1. **Core Concept**: Clarify the primary academic objectives and key variables.\n2. **Step-by-Step Breakdown**: Walk through the standard framework or methodology.\n3. **Practical Application**: Would you like to review an example or generate customized exercises?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        navigationAction: navIntent || undefined
      };
      setMessages(prev => [...prev, fallbackMsg]);
      if (voiceModeActive) {
        speakText(fallbackMsg.content);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    if (messages.length === 0) return;
    if (window.confirm("Are you sure you want to clear your current conversation with Ini?")) {
      stopSpeaking();
      setMessages([]);
      try {
        localStorage.removeItem(`inivra_ini_chat_${activeUserId}`);
      } catch (e) {}
    }
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      
      {/* 1. Header Bar */}
      <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <img 
              src={INI_AVATAR} 
              alt="Ini Logo" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover border border-blue-200 shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
                Ini — AI Learning Assistant
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Active Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-light">
              Your intelligent learning assistant
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Mode Toggle */}
          <button
            onClick={() => {
              const nextState = !voiceModeActive;
              setVoiceModeActive(nextState);
              if (!nextState) stopSpeaking();
            }}
            title={voiceModeActive ? "Voice mode enabled (Ini reads responses aloud)" : "Enable voice mode"}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              voiceModeActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {voiceModeActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{voiceModeActive ? 'Voice: ON' : 'Voice: OFF'}</span>
          </button>

          {/* Stop speaking if active */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              title="Stop speech"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1 animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mute</span>
            </button>
          )}

          {/* Clear conversation */}
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              title="Clear conversation"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* EMPTY STATE: Shown when no messages exist */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 sm:py-12 space-y-6">
            
            {/* Ini Avatar Card */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 shadow-xl shadow-blue-500/15">
                <img 
                  src={INI_AVATAR} 
                  alt="Ini Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[22px] border-2 border-white/80"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-150 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-700 font-mono">Ready</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
                Hello, {activeUserName}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-md mx-auto">
                {isTeacher 
                  ? "I'm Ini, your AI teaching partner. Ask me to design lesson plans, generate quizzes, build rubrics, analyze curriculum files, or navigate Inivra."
                  : "I'm Ini, your AI learning assistant. Ask me anything about your studies, or ask me to help you navigate Inivra."}
              </p>
            </div>

            {/* Action suggestions (Clickable prompt action buttons, NOT fake history) */}
            <div className="w-full pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-3">
                Action Suggestions
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {isTeacher ? (
                  <>
                    <button
                      onClick={() => setInputMessage("Draft a 45-minute interactive lesson plan on Newton's Three Laws of Motion with learning objectives and discussion prompts.")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Plan a lesson
                    </button>

                    <button
                      onClick={() => setInputMessage("Generate 5 conceptual multiple-choice quiz questions with detailed answer explanations on cellular respiration.")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Create quiz questions
                    </button>

                    <button
                      onClick={() => setInputMessage("Create a 4-tier grading rubric for a high-school argumentative essay evaluating thesis, evidence, structure, and mechanics.")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Generate rubric
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Analyze syllabus/file
                    </button>

                    <button
                      onClick={() => setInputMessage("How do I create assignments, update the gradebook, and manage student rosters on Inivra?")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      Teacher tools guide
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setInputMessage("Can you explain how photosynthesis works step-by-step?")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Explain a topic
                    </button>

                    <button
                      onClick={() => setInputMessage("Can you guide me step-by-step through solving quadratic equations?")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Help with homework
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Summarize a document
                    </button>

                    <button
                      onClick={() => setInputMessage("Let's practice conversational Spanish. Ask me a beginner question to get started!")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      Practice a language
                    </button>

                    <button
                      onClick={() => setInputMessage("How do I navigate my courses, view assignments, and check my grades on Inivra?")}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Help me use Inivra
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Subject coverage tags */}
            <div className="pt-4 border-t border-slate-100 w-full">
              <p className="text-[11px] text-slate-400 font-mono">
                Mathematics • Biology • Chemistry • Physics • Geography • History • Languages • English • Portuguese
              </p>
            </div>

          </div>
        ) : (
          /* ACTIVE MESSAGES STREAM */
          <div className="max-w-3xl mx-auto space-y-6 pb-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Ini Avatar for Assistant messages */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 self-start mt-1">
                    <img 
                      src={INI_AVATAR} 
                      alt="Ini" 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-xl object-cover border border-blue-200 shadow-sm"
                    />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* User Attachment Chip */}
                  {msg.attachment && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono mb-1 shadow-sm">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold truncate max-w-[200px]">{msg.attachment.name}</span>
                      <span className="text-blue-500 text-[10px]">({msg.attachment.size})</span>
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div 
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-600/10'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-sm whitespace-pre-wrap font-sans'
                    }`}
                  >
                    {/* Render message text */}
                    <div>{msg.content}</div>

                    {/* Interactive App Navigation Button if generated */}
                    {msg.navigationAction && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Platform Action:</span>
                        <button
                          onClick={() => onNavigateTab(msg.navigationAction!.tabKey)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <span>Open {msg.navigationAction.tabLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Utilities footer */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 font-mono ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>

                    {msg.role === 'assistant' && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-slate-600 transition-colors flex items-center gap-0.5"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-blue-600 transition-colors flex items-center gap-0.5"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 self-start mt-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold font-display shadow-sm">
                      {firstName[0]}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex gap-3.5 justify-start items-center">
                <img 
                  src={INI_AVATAR} 
                  alt="Ini Thinking" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover border border-blue-200 shadow-sm animate-pulse"
                />
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-600 flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]"></span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Ini is synthesizing an explanation...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* 3. Bottom Chat Input Area */}
      <div className="p-4 sm:p-5 border-t border-slate-150 bg-white">
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* File Attachment Preview Banner (if selected) */}
          {attachedFile && (
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-blue-500 font-mono text-[10px] flex-shrink-0">({attachedFile.size})</span>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1 text-blue-400 hover:text-blue-700 rounded-lg transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Listening... Speak your question now. Tap microphone to finish.</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg"
            className="hidden" 
          />

          {/* Input Box and Actions */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white transition-all shadow-sm">
            
            {/* Attach Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach document, notes, presentation, or PDF"
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Ini anything..."
              disabled={isThinking}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 px-2 font-normal"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop listening" : "Speak to Ini"}
              className={`p-2.5 rounded-xl transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!inputMessage.trim() && !attachedFile) || isThinking}
              title="Send message"
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>

          </div>

          {/* Quick Footer hint */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
            <span>Press Enter to send • 📎 Supports PDF, Word, PPT, Notes</span>
            <span className="hidden sm:inline">Powered by Inivra AI Core</span>
          </div>

        </div>
      </div>

    </div>
  );
}
