import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Volume2, VolumeX, X, Send, Command, Volume1, Languages, Check, Eye, EyeOff, MessageSquare, ChevronDown, Globe } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

export interface AssistantLanguageConfig {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  synthLang: string;
  recogLang: string;
  welcome: string;
}

export const SUPPORTED_LANGUAGES: Record<string, AssistantLanguageConfig> = {
  English: {
    id: 'English',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    synthLang: 'en-US',
    recogLang: 'en-US',
    welcome: 'Hello! I am Ini, your AI assistant. How can I help you today?'
  },
  Spanish: {
    id: 'Spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    synthLang: 'es-ES',
    recogLang: 'es-ES',
    welcome: '¡Hola! Soy Ini, tu asistente educativo. ¿En qué te puedo ayudar hoy?'
  },
  French: {
    id: 'French',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    synthLang: 'fr-FR',
    recogLang: 'fr-FR',
    welcome: 'Bonjour! Je suis Ini, ton assistant éducatif. Comment puis-je t\'aider aujourd\'hui?'
  },
  German: {
    id: 'German',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    synthLang: 'de-DE',
    recogLang: 'de-DE',
    welcome: 'Hallo! Ich bin Ini, dein Lernassistent. Wie kann ich dir heute helfen?'
  },
  Portuguese: {
    id: 'Portuguese',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    synthLang: 'pt-BR',
    recogLang: 'pt-BR',
    welcome: 'Olá! Sou a Ini, sua assistente de aprendizagem. Como posso te ajudar hoje?'
  },
  Italian: {
    id: 'Italian',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    synthLang: 'it-IT',
    recogLang: 'it-IT',
    welcome: 'Ciao! Sono Ini, il tuo assistente per lo studio. Come posso aiutarti oggi?'
  },
  Mandarin: {
    id: 'Mandarin',
    name: 'Mandarin',
    nativeName: '中文',
    flag: '🇨🇳',
    synthLang: 'zh-CN',
    recogLang: 'zh-CN',
    welcome: '你好！我是Ini，你的学习助手。今天有什么我可以帮你的吗？'
  },
  Japanese: {
    id: 'Japanese',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    synthLang: 'ja-JP',
    recogLang: 'ja-JP',
    welcome: 'こんにちは！学習アシスタントのIniです。今日はどのようなお手伝いをしましょうか？'
  }
};

// Detect user voice or text intent to change the assistant's language
export const detectLanguageSwitchIntent = (text: string): string | null => {
  const t = text.toLowerCase().trim();

  if (
    t.includes('speak in english') || 
    t.includes('speak english') || 
    t.includes('switch to english') || 
    t.includes('change language to english') || 
    t.includes('set language to english') || 
    t.includes('talk in english') ||
    t.includes('in english')
  ) return 'English';

  if (
    t.includes('speak in spanish') || 
    t.includes('speak spanish') || 
    t.includes('switch to spanish') || 
    t.includes('change language to spanish') || 
    t.includes('set language to spanish') ||
    t.includes('habla en español') || 
    t.includes('habla espanol') || 
    t.includes('cambiar a español') ||
    t.includes('cambia a español') ||
    t.includes('en español')
  ) return 'Spanish';

  if (
    t.includes('speak in french') || 
    t.includes('speak french') || 
    t.includes('switch to french') || 
    t.includes('change language to french') || 
    t.includes('set language to french') ||
    t.includes('parle en français') || 
    t.includes('parle francais') || 
    t.includes('en français')
  ) return 'French';

  if (
    t.includes('speak in german') || 
    t.includes('speak german') || 
    t.includes('switch to german') || 
    t.includes('change language to german') || 
    t.includes('set language to german') ||
    t.includes('auf deutsch') || 
    t.includes('sprich auf deutsch')
  ) return 'German';

  if (
    t.includes('speak in portuguese') || 
    t.includes('speak portuguese') || 
    t.includes('switch to portuguese') || 
    t.includes('change language to portuguese') || 
    t.includes('set language to portuguese') ||
    t.includes('fale em português') || 
    t.includes('mudar para português') ||
    t.includes('em português')
  ) return 'Portuguese';

  if (
    t.includes('speak in italian') || 
    t.includes('speak italian') || 
    t.includes('switch to italian') || 
    t.includes('change language to italian') || 
    t.includes('set language to italian') ||
    t.includes('parla in italiano') || 
    t.includes('in italiano')
  ) return 'Italian';

  if (
    t.includes('speak in mandarin') || 
    t.includes('speak in chinese') || 
    t.includes('speak chinese') || 
    t.includes('speak mandarin') || 
    t.includes('switch to mandarin') || 
    t.includes('switch to chinese') || 
    t.includes('change language to chinese') || 
    t.includes('说中文') || 
    t.includes('说普通话')
  ) return 'Mandarin';

  if (
    t.includes('speak in japanese') || 
    t.includes('speak japanese') || 
    t.includes('switch to japanese') || 
    t.includes('change language to japanese') || 
    t.includes('日本語で') || 
    t.includes('日本語を話して')
  ) return 'Japanese';

  return null;
};

interface FloatingAssistantProps {
  userProfile: UserProfile | undefined;
  currentRole: UserRole;
  activeView: 'dashboard' | 'marketplace' | 'messages';
}

export default function FloatingAssistant({ userProfile, currentRole, activeView }: FloatingAssistantProps) {
  const userName = userProfile?.name || (currentRole === 'Teacher' ? 'Educator' : 'Student');
  const firstName = userName.split(' ')[0];
  const initialGreeting = `Hello ${userName}, how can I help you today?`;

  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState('Ini is ready to assist you');
  const [voiceRecognizedText, setVoiceRecognizedText] = useState('');
  const [voiceReplyText, setVoiceReplyText] = useState(initialGreeting);
  
  // Accessibility & Continuous session
  const [showTranscriptions, setShowTranscriptions] = useState(false);
  const [isContinuousActive, setIsContinuousActive] = useState(false);
  const [isSpeakingPracticeActive, setIsSpeakingPracticeActive] = useState(false);

  // Floating assistant primary speaking language (First language MUST be English)
  const [assistantLanguage, setAssistantLanguage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ini_assistant_language');
      if (saved && SUPPORTED_LANGUAGES[saved]) return saved;
    } catch (e) {}
    return 'English';
  });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Synchronized language coach states (for language course tab)
  const [dashboardTab, setDashboardTab] = useState<string>('dashboard');
  const [langLanguage, setLangLanguage] = useState<string>('Spanish');
  const [langSkill, setLangSkill] = useState<string | null>(null);
  const [hasChosenLanguage, setHasChosenLanguage] = useState<boolean>(false);

  // Switch assistant language with immediate voice/text confirmation
  const handleSelectLanguage = (langKey: string, speakFeedback: boolean = true) => {
    if (!SUPPORTED_LANGUAGES[langKey]) return;
    setAssistantLanguage(langKey);
    try {
      localStorage.setItem('ini_assistant_language', langKey);
    } catch (e) {}
    setIsLangMenuOpen(false);

    const config = SUPPORTED_LANGUAGES[langKey];
    let confirmText = `Switched language to ${config.name}. How can I help you today?`;
    if (langKey === 'Spanish') confirmText = `¡Listo! He cambiado el idioma a español. ¿En qué te puedo ayudar hoy?`;
    else if (langKey === 'French') confirmText = `C'est fait! La langue est passée au français. Comment puis-je t'aider aujourd'hui?`;
    else if (langKey === 'German') confirmText = `Sprache auf Deutsch geändert. Wie kann ich dir heute helfen?`;
    else if (langKey === 'Portuguese') confirmText = `Idioma alterado para português. Como posso te ajudar hoje?`;
    else if (langKey === 'Italian') confirmText = `Lingua cambiata in italiano. Come posso aiutarti oggi?`;
    else if (langKey === 'Mandarin') confirmText = `已将语言切换为中文。今天有什么我可以帮你的吗？`;
    else if (langKey === 'Japanese') confirmText = `言語を日本語に切り替えました。今日はどのようなお手伝いをしましょうか？`;
    else if (langKey === 'English') confirmText = `Switched language back to English. How can I help you today?`;

    setVoiceReplyText(confirmText);
    setVoiceStatusText(`Active language: ${config.flag} ${config.name}`);

    if (speakFeedback) {
      speakText(confirmText, config.synthLang, () => {
        if (isContinuousActive) {
          startSpeechRecognition();
        }
      });
    }
  };

  // Text Mode states
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; timestamp: string }[]>([
    {
      role: 'model',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasGreetedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const noSpeechRetriesRef = useRef(0);

  const liveTranscriptionsEnabled = !!userProfile?.enableLiveTranscriptions;

  // Setup default mode based on SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMode('text');
      setVoiceStatusText('Voice mode unsupported in this browser. Please use Text Mode.');
    }
  }, []);

  // Sync captions show state when accessibility changes
  useEffect(() => {
    if (!liveTranscriptionsEnabled) {
      setShowTranscriptions(false);
    } else {
      setShowTranscriptions(true);
    }
  }, [liveTranscriptionsEnabled]);

  const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      try {
        if ((window as any)._activeUtterance) {
          const oldUtter = (window as any)._activeUtterance;
          oldUtter.onstart = null;
          oldUtter.onend = null;
          oldUtter.onerror = null;
        }
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Error canceling speech:", e);
      }
      (window as any)._activeUtterance = null;
      setIsSpeaking(false);
    }
  };

  // TTS speech handler with onComplete hook
  const speakText = (text: string, forceLang?: string, onComplete?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    cancelSpeech();

    if (isMuted) {
      if (onComplete) onComplete();
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    (window as any)._activeUtterance = utter; // Prevent garbage collection on long sentences (Chrome bug)

    // Determine language voice code - Strictly default to assistantLanguage (English first)
    let langCode = forceLang;
    if (!langCode) {
      if (isSpeakingPracticeActive && dashboardTab === 'language' && langLanguage) {
        langCode = SUPPORTED_LANGUAGES[langLanguage]?.synthLang || 'en-US';
      } else {
        langCode = SUPPORTED_LANGUAGES[assistantLanguage]?.synthLang || 'en-US';
      }
    }

    utter.lang = langCode;

    let safetyTimeout: any = null;
    const clearSafety = () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
    };

    const handleSpeechEnd = () => {
      clearSafety();
      (window as any)._activeUtterance = null;
      setIsSpeaking(false);
      setVoiceStatusText('Ready');
      if (onComplete) onComplete();
    };

    utter.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
      setIsThinking(false);
      setVoiceStatusText('Ini is speaking...');

      clearSafety();
      // Generous but safe upper bound: 100ms per character + 3s buffer
      const estimatedDuration = Math.max(3000, text.length * 100);
      safetyTimeout = setTimeout(() => {
        console.warn("Speech synthesis safety timeout reached. Forcing completion.");
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
        handleSpeechEnd();
      }, estimatedDuration);
    };

    utter.onend = () => {
      handleSpeechEnd();
    };

    utter.onerror = (e: any) => {
      console.warn("Speech synthesis error event:", e);
      handleSpeechEnd();
    };

    try {
      // Chrome requires a resume() before starting speech to recover from random pauses/stuck state
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error("Failed to execute speak():", err);
      handleSpeechEnd();
    }
  };

  // Setup speech recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    cancelSpeech();

    if (recognitionRef.current) {
      try {
        // Detach event handlers first to prevent race conditions or duplicate triggers during abort
        recognitionRef.current.onstart = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (err) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;

    // Pick code based on Speaking Practice target language or assistant's active language (default English)
    let langCode = 'en-US';
    if (isSpeakingPracticeActive && dashboardTab === 'language' && langLanguage) {
      langCode = SUPPORTED_LANGUAGES[langLanguage]?.recogLang || 'en-US';
    } else {
      langCode = SUPPORTED_LANGUAGES[assistantLanguage]?.recogLang || 'en-US';
    }

    recognition.lang = langCode;

    recognition.onstart = () => {
      setIsListening(true);
      setIsSpeaking(false);
      setIsThinking(false);
      setVoiceStatusText('Ini is listening...');
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error || e);
      setIsListening(false);
      
      const errCode = e.error;
      
      if (errCode === 'no-speech') {
        // Give the user a grace window if they just started listening or took a breath
        if (noSpeechRetriesRef.current < 2 && isOpen && isContinuousActive) {
          noSpeechRetriesRef.current += 1;
          setVoiceStatusText('Listening... Speak now or tap to talk.');
          setTimeout(() => {
            if (isOpen && isContinuousActive && !isSpeaking && !isThinking && !isProcessingRef.current) {
              startSpeechRecognition();
            }
          }, 350);
          return;
        }
        setIsContinuousActive(false);
        setVoiceStatusText('Tap Ini to speak anytime!');
      } else {
        setIsContinuousActive(false);
        if (errCode === 'not-allowed') {
          setVoiceStatusText('Microphone permission denied. Please allow microphone access in your browser or iframe settings, or use Text Mode.');
        } else if (errCode === 'audio-capture') {
          setVoiceStatusText('No microphone detected or it is already in use by another app. Please use Text Mode.');
        } else if (errCode === 'network') {
          setVoiceStatusText('Network error during speech recognition. Please check your connection or use Text Mode.');
        } else if (errCode === 'language-not-supported') {
          setVoiceStatusText(`The language ${assistantLanguage || 'selected'} is not supported by your browser's speech recognition. Please use Text Mode.`);
        } else {
          setVoiceStatusText(`Voice input error: ${errCode || 'Unknown'}. Please tap Ini to try again, or use Text Mode.`);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart on end to keep listening if continuous mode is active and we are not speaking, thinking, or processing
      if (isOpen && isContinuousActive && !isSpeaking && !isThinking && !isProcessingRef.current) {
        setTimeout(() => {
          if (isOpen && isContinuousActive && !isSpeaking && !isThinking && !isListening && !isProcessingRef.current) {
            startSpeechRecognition();
          }
        }, 600);
      }
    };

    recognition.onresult = async (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      noSpeechRetriesRef.current = 0;

      // Real-time live transcript feedback while the user is still speaking
      if (interimTranscript && !finalTranscript) {
        setVoiceRecognizedText(interimTranscript);
        setVoiceStatusText(`Ini is listening: "${interimTranscript}"`);
        return;
      }

      const rawSpeech = (finalTranscript || interimTranscript).trim();
      if (!rawSpeech) return;

      // Mark as processing immediately to prevent the onend callback from scheduling an auto-restart
      isProcessingRef.current = true;
      setIsThinking(true);
      setVoiceStatusText('Ini is thinking...');

      // Filter/strip wake words
      let cleanSpeech = rawSpeech.replace(/^(hey\s+)?ini\,?\s*/i, '');
      setVoiceRecognizedText(cleanSpeech);

      // Continuous session cancel / goodbye words
      const textLower = cleanSpeech.toLowerCase().trim();
      if (
        textLower === 'goodbye' ||
        textLower === 'goodbye ini' ||
        textLower === 'stop listening' ||
        textLower === 'thank you' ||
        textLower === 'thank you ini' ||
        textLower === 'thank you so much' ||
        textLower === 'stop' ||
        textLower === 'bye' ||
        textLower === 'bye ini'
      ) {
        setIsContinuousActive(false);
        setIsSpeakingPracticeActive(false);
        setIsThinking(false);
        isProcessingRef.current = false;
        speakText(`You're welcome, ${firstName}! Have a wonderful day. Goodbye!`);
        setVoiceStatusText('Conversation ended.');
        return;
      }

      // Voice Language Switch detection (user asks Ini to speak or switch language)
      const requestedLang = detectLanguageSwitchIntent(cleanSpeech);
      if (requestedLang) {
        setIsThinking(false);
        isProcessingRef.current = false;
        handleSelectLanguage(requestedLang, true);
        return;
      }

      // Creator & Owner Intent Check
      const isCreatorQuery = (
        (textLower.includes('who') && (textLower.includes('created') || textLower.includes('made') || textLower.includes('built') || textLower.includes('founded') || textLower.includes('designed') || textLower.includes('owns') || textLower.includes('owner') || textLower.includes('creator'))) ||
        textLower.includes('who created inivra') ||
        textLower.includes('who created inivra learn') ||
        textLower.includes('who made inivra') ||
        textLower.includes('who owns inivra') ||
        textLower.includes('who is the owner') ||
        textLower.includes('who is the creator') ||
        textLower.includes('who is your creator') ||
        textLower.includes('who is your owner') ||
        textLower.includes('who is the founder') ||
        textLower.includes('who created you')
      );

      if (isCreatorQuery) {
        const ownerReply = 'The owner is iniesta.';
        setVoiceReplyText(ownerReply);
        setIsThinking(false);
        isProcessingRef.current = false;
        speakText(ownerReply, 'en-US', () => {
          if (isContinuousActive) startSpeechRecognition();
        });
        return;
      }

      // 1. Language Coach Speaking Practice (active only within Language Coach tab)
      if (isSpeakingPracticeActive && dashboardTab === 'language') {
        try {
          const activeCoachLang = langLanguage || 'Spanish';
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: cleanSpeech,
              userName: userName,
              context: `Student practicing ${activeCoachLang} speaking in Language Coach Speaking Practice.`,
              systemInstruction: `You are Ini, the expert Language Coach tutor for ${activeCoachLang}. Speak only in ${activeCoachLang} (with extremely rare brief translations in English if absolutely necessary to explain a complex term). Your goal is to: hold natural, warm conversations; politely correct pronunciation or grammar mistakes; introduce new vocabulary; explain mistakes; ask follow-up questions; simulate real-life situations; and adjust your difficulty according to their proficiency. Keep your responses short (1-2 sentences maximum) so that it is suitable for speech. Always address the user by their name (${userName}).`
            })
          });

          const data = await res.json();
          const tutorReply = data.text || `Excellent try! Let's continue speaking in ${activeCoachLang}.`;
          setVoiceReplyText(tutorReply);

          setIsThinking(false);
          isProcessingRef.current = false;
          speakText(tutorReply, undefined, () => {
            if (isContinuousActive) {
              startSpeechRecognition();
            }
          });
        } catch (err) {
          setIsThinking(false);
          isProcessingRef.current = false;
          speakText(`Sorry, ${firstName}. I had a connection hiccup. Let's try again!`, 'en-US', () => {
            if (isContinuousActive) startSpeechRecognition();
          });
        }
        return;
      }

      // 2. Language selection stage
      if (dashboardTab === 'language' && !hasChosenLanguage) {
        let matchedLang = '';
        if (textLower.includes('spanish') || textLower.includes('español')) matchedLang = 'Spanish';
        else if (textLower.includes('french') || textLower.includes('français')) matchedLang = 'French';
        else if (textLower.includes('german') || textLower.includes('deutsch')) matchedLang = 'German';
        else if (textLower.includes('portuguese') || textLower.includes('português')) matchedLang = 'Portuguese';
        else if (textLower.includes('mandarin') || textLower.includes('chinese')) matchedLang = 'Mandarin';
        else if (textLower.includes('japanese') || textLower.includes('nihongo')) matchedLang = 'Japanese';
        else if (textLower.includes('italian') || textLower.includes('italiano')) matchedLang = 'Italian';
        else if (textLower.includes('english')) matchedLang = 'English';

        if (matchedLang) {
          window.dispatchEvent(new CustomEvent('ini-action', {
            detail: { type: 'set-language', language: matchedLang }
          }));
          const reply = `Wonderful! I've selected ${matchedLang} for you. Which skill would you like to practice today? Speaking, Listening, Reading, Writing, Grammar, Vocabulary, or Pronunciation?`;
          setVoiceReplyText(reply);
          setIsThinking(false);
          isProcessingRef.current = false;
          speakText(reply, 'en-US', () => {
            if (isContinuousActive) startSpeechRecognition();
          });
          return;
        }
      }

      // 3. Skill selection stage
      if (dashboardTab === 'language' && hasChosenLanguage && !langSkill) {
        let matchedSkill = '';
        if (textLower.includes('speaking')) matchedSkill = 'speaking';
        else if (textLower.includes('listening')) matchedSkill = 'listening';
        else if (textLower.includes('reading')) matchedSkill = 'reading';
        else if (textLower.includes('writing')) matchedSkill = 'writing';
        else if (textLower.includes('grammar')) matchedSkill = 'grammar';
        else if (textLower.includes('vocabulary')) matchedSkill = 'vocabulary';
        else if (textLower.includes('pronunciation')) matchedSkill = 'pronunciation';

        if (matchedSkill) {
          window.dispatchEvent(new CustomEvent('ini-action', {
            detail: { type: 'set-skill', skill: matchedSkill }
          }));
          
          if (matchedSkill === 'speaking') {
            setIsSpeakingPracticeActive(true);
            const tutorGreet = `Let's begin Speaking Practice in ${langLanguage}! Go ahead and speak to me in ${langLanguage}. I will reply and guide you in ${langLanguage} only!`;
            setVoiceReplyText(tutorGreet);
            setIsThinking(false);
            isProcessingRef.current = false;
            speakText(tutorGreet, 'en-US', () => {
              if (isContinuousActive) startSpeechRecognition();
            });
          } else {
            const openSkillMsg = `Perfect! Opening your ${matchedSkill} practice module now. Use the layout on your screen to complete the exercises!`;
            setVoiceReplyText(openSkillMsg);
            setIsThinking(false);
            isProcessingRef.current = false;
            speakText(openSkillMsg, 'en-US');
            setIsContinuousActive(false);
          }
          return;
        }
      }

      // 4. General Platform Commands parser
      let handledNav = false;
      let navMsg = '';

      if (textLower.includes('assignment') || textLower.includes('homework') || textLower.includes('task')) {
        handledNav = true;
        navMsg = `Opening your assignments now, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'homework', role: currentRole } 
        }));
      } else if (textLower.includes('message') || textLower.includes('chat') || textLower.includes('inbox')) {
        handledNav = true;
        navMsg = `Taking you to your chat messages now, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'messages', tab: 'messaging', role: currentRole } 
        }));
      } else if (textLower.includes('grades') || textLower.includes('grading') || textLower.includes('progress')) {
        handledNav = true;
        navMsg = `Opening your grades and progress section, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: currentRole === 'Teacher' ? 'grading' : 'grades', role: currentRole } 
        }));
      } else if (textLower.includes('schedule') || textLower.includes('calendar') || textLower.includes('class')) {
        handledNav = true;
        navMsg = `Opening today's active classes, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'classes', role: currentRole } 
        }));
      } else if (textLower.includes('language coach') || textLower.includes('learn language') || textLower.includes('language learning')) {
        handledNav = true;
        navMsg = `Opening the Language Coach, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'language', role: currentRole } 
        }));
      } else if (textLower.includes('summarizer') || textLower.includes('summary')) {
        handledNav = true;
        navMsg = `Opening the AI summarizer tool, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'summarizer', role: currentRole } 
        }));
      } else if (textLower.includes('lesson plan') || textLower.includes('lesson')) {
        handledNav = true;
        navMsg = `Opening your lesson plans, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'lesson_plans', role: currentRole } 
        }));
      } else if (textLower.includes('student') || textLower.includes('roster')) {
        handledNav = true;
        navMsg = `Opening your students list, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'students', role: currentRole } 
        }));
      } else if (textLower.includes('flashcard') || textLower.includes('quiz') || textLower.includes('exam')) {
        handledNav = true;
        navMsg = `Opening your quizzes and flashcards studio, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'quizzes', role: currentRole } 
        }));
      } else if (textLower.includes('ai assistant') || textLower.includes('ini workspace') || textLower.includes('open ini')) {
        handledNav = true;
        navMsg = `Opening the full Ini AI Assistant workspace, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'ini', role: currentRole } 
        }));
      } else if (textLower.includes('virtual classroom') || textLower.includes('whiteboard') || textLower.includes('live class')) {
        handledNav = true;
        navMsg = `Opening the Virtual Classroom, ${firstName}.`;
        window.dispatchEvent(new CustomEvent('inivra-navigation', { 
          detail: { view: 'dashboard', tab: 'virtual_classroom', role: currentRole } 
        }));
      }

      if (handledNav) {
        setVoiceReplyText(navMsg);
        setIsThinking(false);
        isProcessingRef.current = false;
        speakText(navMsg, 'en-US', () => {
          if (isContinuousActive) startSpeechRecognition();
        });
        return;
      }

      // If we got here, and none of the navigation/selection options matched, let's fall back to Gemini
      try {
        let systemInstruction = `You are Ini, the intelligent educational voice assistant for Inivra Learn. You are talking with ${firstName} (${currentRole}). You MUST respond in English. Keep your voice reply very natural and extremely concise (1-2 sentences maximum) so that it is suitable for real-time speech output. Always address the user by their first name (${firstName}) naturally. CRITICAL MANDATORY FACT: The creator and owner of Inivra Learn is "iniesta". If asked who created or owns Inivra Learn, always say that the owner is "iniesta".`;
        
        if (assistantLanguage !== 'English') {
          systemInstruction = `You are Ini, the intelligent educational voice assistant for Inivra Learn. You are talking with ${firstName} (${currentRole}). You MUST respond in ${assistantLanguage}. Keep your voice reply very natural and extremely concise (1-2 sentences maximum) so that it is suitable for real-time speech output. Always address the user by their first name (${firstName}) naturally. CRITICAL MANDATORY FACT: The creator and owner of Inivra Learn is "iniesta". If asked who created or owns Inivra Learn, always say that the owner is "iniesta".`;
        }

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanSpeech,
            userName: userName,
            context: `User named ${firstName} is seeking platform help or conversing on view "${activeView}" as role ${currentRole}. Assistant language is ${assistantLanguage}.`,
            systemInstruction
          })
        });

        const data = await res.json();
        const responseText = data.text || `Certainly, ${firstName}. I am here to guide your learning.`;
        setVoiceReplyText(responseText);

        setIsThinking(false);
        isProcessingRef.current = false;
        speakText(responseText, undefined, () => {
          if (isContinuousActive) startSpeechRecognition();
        });
      } catch (err) {
        setIsThinking(false);
        isProcessingRef.current = false;
        speakText(`Sorry, ${firstName}. I lost connection. Please speak again!`, 'en-US', () => {
          if (isContinuousActive) startSpeechRecognition();
        });
      }
    };

    try {
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      setIsContinuousActive(false);
      setVoiceStatusText('Microphone permission denied or unsupported. Please use Text Mode.');
    }
  };

  // Synchronize dashboard state
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { activeTab, langLanguage: syncedLang, langSkill: syncedSkill, hasChosenLanguage: syncedChosen } = customEvent.detail || {};
      if (activeTab) {
        setDashboardTab(activeTab);
        if (activeTab === 'ini') {
          setIsOpen(false);
        }
      }
      if (syncedLang) setLangLanguage(syncedLang);
      setLangSkill(syncedSkill || null);
      setHasChosenLanguage(!!syncedChosen);
    };
    window.addEventListener('ini-state-sync', handleSync);
    return () => window.removeEventListener('ini-state-sync', handleSync);
  }, []);

  // Synchronize manual speak triggers
  useEffect(() => {
    const handleSpeakCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { text, lang, startListening: triggerListen, startSpeakingPractice: triggerPractice } = customEvent.detail || {};
      if (text) {
        setIsOpen(true);
        setMode('voice');
        setVoiceStatusText('Ini is speaking...');
        setVoiceRecognizedText('');
        
        setIsContinuousActive(true);
        if (triggerPractice) {
          setIsSpeakingPracticeActive(true);
        }

        speakText(text, lang || 'en-US', () => {
          if (triggerListen) {
            startSpeechRecognition();
          }
        });
      }
    };
    window.addEventListener('ini-speak-command', handleSpeakCommand);
    return () => window.removeEventListener('ini-speak-command', handleSpeakCommand);
  }, [langLanguage, langSkill]);

  // Background wakephrase detection for hands-free activation ("Hey Ini")
  useEffect(() => {
    if (isOpen) return; // Only listen in background when Ini is not already open

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let wakeRecognition: any = null;
    let active = true;

    const startWakeListening = () => {
      if (!active) return;
      try {
        wakeRecognition = new SpeechRecognition();
        wakeRecognition.continuous = false;
        wakeRecognition.interimResults = false;
        wakeRecognition.lang = 'en-US';

        wakeRecognition.onstart = () => {
          console.info('Hands-free wakephrase detection active... Speak "Hey Ini" to activate.');
        };

        wakeRecognition.onresult = (event: any) => {
          if (!event.results || event.results.length === 0) return;
          const rawText = event.results[0][0].transcript.toLowerCase();
          
          if (rawText.includes('hey ini') || rawText.includes('ini') || rawText.includes('eh ini') || rawText.includes('hola ini') || rawText.includes('oye ini') || rawText.includes('bonjour ini') || rawText.includes('hallo ini')) {
            // Wake phrase detected! Stop the wakephrase listener first
            active = false;
            try {
              wakeRecognition.onstart = null;
              wakeRecognition.onerror = null;
              wakeRecognition.onend = null;
              wakeRecognition.onresult = null;
              wakeRecognition.abort();
            } catch (e) {}
            
            // Wait 350ms for the browser to release the microphone before opening main interface
            setTimeout(() => {
              setIsOpen(true);
              setMode('voice');
              setIsContinuousActive(true);
              
              let welcomeMsg = `Hi ${firstName}! I heard you. How can I help you today?`;
              let responseLangCode = 'en-US';

              if (assistantLanguage === 'Spanish') {
                welcomeMsg = `¡Hola ${firstName}! Te escucho. ¿En qué te puedo ayudar hoy?`;
                responseLangCode = 'es-ES';
              } else if (assistantLanguage === 'French') {
                welcomeMsg = `Salut ${firstName}! Je t'entends. Comment puis-je t'aider aujourd'hui?`;
                responseLangCode = 'fr-FR';
              } else if (assistantLanguage === 'German') {
                welcomeMsg = `Hallo ${firstName}! Ich höre dich. Wie kann ich dir heute helfen?`;
                responseLangCode = 'de-DE';
              } else if (assistantLanguage === 'Portuguese') {
                welcomeMsg = `Olá ${firstName}! Estou te ouvindo. Como posso te ajudar hoje?`;
                responseLangCode = 'pt-BR';
              } else if (assistantLanguage === 'Mandarin') {
                welcomeMsg = `你好 ${firstName}！我听到你了。今天有什么我可以帮你的吗？`;
                responseLangCode = 'zh-CN';
              } else if (assistantLanguage === 'Japanese') {
                welcomeMsg = `こんにちは ${firstName}！聞こえていますよ。今日はどのようなお手伝いをしましょうか？`;
                responseLangCode = 'ja-JP';
              } else if (assistantLanguage === 'Italian') {
                welcomeMsg = `Ciao ${firstName}! Ti sento. Come posso aiutarti oggi?`;
                responseLangCode = 'it-IT';
              }

              speakText(welcomeMsg, responseLangCode, () => {
                startSpeechRecognition();
              });
            }, 350);
          }
        };

        wakeRecognition.onerror = (e: any) => {
          console.info('Wakephrase detection error info:', e.error || e);
          const isFatal = e.error === 'not-allowed' || e.error === 'service-not-allowed';
          if (isFatal) {
            active = false;
          }
        };

        wakeRecognition.onend = () => {
          if (active) {
            setTimeout(startWakeListening, 800);
          }
        };

        wakeRecognition.start();
      } catch (err) {
        console.error('Wakephrase setup error:', err);
      }
    };

    startWakeListening();

    return () => {
      active = false;
      if (wakeRecognition) {
        try {
          wakeRecognition.onstart = null;
          wakeRecognition.onerror = null;
          wakeRecognition.onend = null;
          wakeRecognition.onresult = null;
          wakeRecognition.abort();
        } catch (e) {}
      }
    };
  }, [isOpen, firstName]);

  // Automatic spoken and visual welcome as soon as user opens the app
  useEffect(() => {
    const targetName = userProfile?.name || userName || 'there';
    const greetingMsg = `Hello ${targetName}, how can I help you today?`;
    
    setIsOpen(true);
    setVoiceReplyText(greetingMsg);
    setVoiceStatusText('Ini is speaking...');

    const timer = setTimeout(() => {
      speakText(greetingMsg, 'en-US');
    }, 450);

    return () => clearTimeout(timer);
  }, [userProfile?.id, currentRole]);

  // Handle active view/tab change speech triggers (e.g. entering Language tab)
  const lastTabRef = useRef<string | null>(null);
  useEffect(() => {
    if (dashboardTab === 'language' && lastTabRef.current !== 'language') {
      lastTabRef.current = 'language';
      if (!hasChosenLanguage) {
        const coachWelcome = `Hello, ${userName}. Welcome to the Language Coach. Which language would you like to learn today?`;
        setIsOpen(true);
        setMode('voice');
        setIsContinuousActive(true);
        setIsSpeakingPracticeActive(false);

        speakText(coachWelcome, 'en-US', () => {
          startSpeechRecognition();
        });
      }
    } else if (dashboardTab !== 'language') {
      lastTabRef.current = dashboardTab;
    }
  }, [dashboardTab, hasChosenLanguage, userName]);

  // Handle language switch prompts
  const lastLanguageRef = useRef<string | null>(null);
  useEffect(() => {
    if (dashboardTab === 'language' && hasChosenLanguage && !langSkill && lastLanguageRef.current !== langLanguage) {
      lastLanguageRef.current = langLanguage;
      const skillPrompt = `Which skill would you like to practice today in ${langLanguage}? Speaking, Listening, Reading, Writing, Grammar, Vocabulary, or Pronunciation?`;
      
      setIsOpen(true);
      setMode('voice');
      setIsContinuousActive(true);
      setIsSpeakingPracticeActive(false);

      speakText(skillPrompt, 'en-US', () => {
        startSpeechRecognition();
      });
    }
  }, [dashboardTab, hasChosenLanguage, langLanguage, langSkill]);

  // Scroll to bottom in text mode
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle text message submission
  const handleSendTextMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setInputText('');

    setMessages(prev => [...prev, {
      role: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Check if user requested a language change in text
    const langChange = detectLanguageSwitchIntent(userMsg);
    if (langChange) {
      handleSelectLanguage(langChange, false);
      const confMsg = langChange === 'English'
        ? `I have switched my language to English. How can I help you today?`
        : `I have switched my language to ${SUPPORTED_LANGUAGES[langChange]?.name || langChange}. How can I help you today?`;
      setMessages(prev => [...prev, {
        role: 'model',
        text: confMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakText(confMsg, SUPPORTED_LANGUAGES[langChange]?.synthLang);
      return;
    }

    // Creator & Owner Intent Check in Text Mode
    const userMsgLower = userMsg.toLowerCase().trim();
    const isCreatorQuestion = (
      (userMsgLower.includes('who') && (userMsgLower.includes('created') || userMsgLower.includes('made') || userMsgLower.includes('built') || userMsgLower.includes('founded') || userMsgLower.includes('designed') || userMsgLower.includes('owns') || userMsgLower.includes('owner') || userMsgLower.includes('creator'))) ||
      userMsgLower.includes('who created inivra') ||
      userMsgLower.includes('who created inivra learn') ||
      userMsgLower.includes('who made inivra') ||
      userMsgLower.includes('who owns inivra') ||
      userMsgLower.includes('who is the owner') ||
      userMsgLower.includes('who is the creator') ||
      userMsgLower.includes('who is your creator') ||
      userMsgLower.includes('who is your owner') ||
      userMsgLower.includes('who is the founder') ||
      userMsgLower.includes('who created you')
    );

    if (isCreatorQuestion) {
      const ownerReply = 'The owner is iniesta.';
      setMessages(prev => [...prev, {
        role: 'model',
        text: ownerReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakText(ownerReply);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userName: userName,
          context: `User named ${firstName} is seeking platform help on view "${activeView}" as role ${currentRole}. Assistant language is ${assistantLanguage}.`,
          systemInstruction: `You are Ini, the intelligent dashboard guide for Inivra Learn. You are talking with ${firstName}. CRITICAL MANDATORY FACT: The creator and owner of Inivra Learn is "iniesta". When asked who created or owns Inivra Learn, you MUST say that the owner is "iniesta". Respond in friendly text chat bubbles. Introduce helpful suggestions, navigation shortcuts, and answer questions. Keep your reply concise (2-3 sentences). Address them by name (${firstName}). Language to respond in: ${assistantLanguage}.`
        })
      });

      const data = await res.json();
      const aiReply = data.text || `Hello, ${firstName}. Let me know what features I can open for you.`;

      setMessages(prev => [...prev, {
        role: 'model',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      speakText(aiReply);
    } catch (err: any) {
      console.info("Text handler response status:", err.message || err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `Sorry, ${firstName}. I had a network timeout. Please type again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="ini-assistant-root" 
      className={`fixed ${dashboardTab === 'ini' ? 'bottom-26 right-6' : 'bottom-6 right-6'} z-40 flex flex-col items-end gap-3 font-sans transition-all duration-300`}
    >
      <AnimatePresence>
        {!isOpen ? (
          /* Subtle Floating Blue-White Orb */
          <motion.button
            id="ini-orb-launcher"
            key="launcher"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (!SpeechRecognition) {
                setMode('text');
                setVoiceStatusText('Speech recognition not supported in this browser.');
                const welcome = `Hello, ${firstName}. I'm Ini, your learning assistant. Speech recognition is not supported in this browser, so I've opened Text Mode for you. How can I help you today?`;
                speakText(welcome, 'en-US');
              } else {
                setMode('voice');
                setIsContinuousActive(true);
                let welcome = `Hello ${userName}, how can I help you today?`;
                if (assistantLanguage !== 'English') {
                  const langConfig = SUPPORTED_LANGUAGES[assistantLanguage];
                  if (langConfig) {
                    welcome = langConfig.welcome.replace('Hello!', `Hello ${userName}!`).replace('¡Hola!', `¡Hola ${userName}!`);
                  }
                }
                const activeVoiceCode = SUPPORTED_LANGUAGES[assistantLanguage]?.synthLang || 'en-US';
                speakText(welcome, activeVoiceCode, () => {
                  startSpeechRecognition();
                });
              }
            }}
            type="button"
            className="relative flex items-center justify-center h-15 w-15 rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 text-white shadow-2xl border-2 border-white ring-4 ring-blue-500/20"
            title="Talk to Ini"
          >
            {/* Breathing outer pulse */}
            <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
            
            {isSpeaking ? (
              <div className="flex gap-0.5 items-center justify-center">
                <span className="w-1 h-3 bg-white rounded animate-pulse"></span>
                <span className="w-1 h-5 bg-white rounded animate-pulse delay-75"></span>
                <span className="w-1 h-3 bg-white rounded animate-pulse delay-150"></span>
              </div>
            ) : (
              <img 
                src="https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png"
                alt="Ini Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
            )}
            
            {/* AI badge */}
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full text-white border border-white uppercase tracking-wider shadow">
              Ini
            </span>
          </motion.button>
        ) : (
          /* Expanded Panel - Custom Premium UI */
          <motion.div
            id="ini-panel"
            key="panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-85 md:w-96 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-[30px] shadow-3xl overflow-hidden flex flex-col border-t-4 border-t-blue-500 animate-in fade-in"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-4 py-4 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://i.postimg.cc/m2D0fYXN/Chat-GPT-Image-Jul-17-2026-10-55-39-PM.png"
                    alt="Ini AI"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-inner"
                  />
                  <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-400 border-2 border-blue-500 rounded-full animate-pulse"></span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-xs tracking-wider uppercase font-display flex items-center gap-1.5">
                    Ini Voice Assistant
                  </h4>
                  <p className="text-[10px] opacity-90 font-light">Online • Companion Tutor</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Language Switcher Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white text-[11px] font-semibold transition-all border border-white/20 shadow-xs cursor-pointer"
                    title="Change assistant language"
                  >
                    <span>{SUPPORTED_LANGUAGES[assistantLanguage]?.flag || '🇺🇸'}</span>
                    <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider">
                      {SUPPORTED_LANGUAGES[assistantLanguage]?.id || 'English'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-white/80 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isLangMenuOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-52 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Assistant Language</span>
                        <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">Default: 🇺🇸 English</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => handleSelectLanguage(lang.id, true)}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-blue-50 transition-colors cursor-pointer ${
                              assistantLanguage === lang.id ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{lang.flag}</span>
                              <span className="font-medium">{lang.name}</span>
                              <span className="text-[10px] text-slate-400">({lang.nativeName})</span>
                            </span>
                            {assistantLanguage === lang.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Speaker Mute button */}
                <button
                  type="button"
                  onClick={() => {
                    const muted = !isMuted;
                    setIsMuted(muted);
                    if (muted) {
                      cancelSpeech();
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
                </button>

                {/* Minimize button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsContinuousActive(false);
                    cancelSpeech();
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
                  title="Minimize"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode selection (Voice/Text) - Always show so users can fallback if SpeechRecognition fails */}
            <div className="bg-slate-100 p-1 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode('voice');
                  setIsContinuousActive(true);
                  cancelSpeech();
                }}
                className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'voice' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🎙️ Voice-First Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('text');
                  setIsContinuousActive(false);
                  cancelSpeech();
                }}
                className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'text' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                💬 Text Mode
              </button>
            </div>

            {/* Main Content Area */}
            {mode === 'voice' ? (
              /* VOICE MODE: Pure Voice Controller (No text history by default) */
              <div className="p-6 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-[300px]">
                
                {/* Visual animated ring structures */}
                <div className="relative flex items-center justify-center py-4">
                  {/* Glowing waves */}
                  <AnimatePresence>
                    {isListening && (
                      <>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                          className="absolute w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500/30"
                        />
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          className="absolute w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500/30"
                        />
                      </>
                    )}
                    {isSpeaking && (
                      <>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0.6 }}
                          animate={{ scale: 1.9, opacity: 0 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className="absolute w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400/30"
                        />
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0.6 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }}
                          className="absolute w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-400/30"
                        />
                      </>
                    )}
                    {isThinking && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute w-24 h-24 rounded-full border-2 border-dashed border-blue-500/40"
                      />
                    )}
                  </AnimatePresence>

                  {/* Central Voice Orb */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SpeechRecognition) {
                        setMode('text');
                        setVoiceStatusText('Voice mode unsupported in this browser. Please use Text Mode.');
                        return;
                      }

                      if (isListening) {
                        setIsListening(false);
                        setIsContinuousActive(false);
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.onstart = null;
                            recognitionRef.current.onerror = null;
                            recognitionRef.current.onend = null;
                            recognitionRef.current.onresult = null;
                            recognitionRef.current.abort();
                          } catch (e) {}
                        }
                        setVoiceStatusText('Ready');
                      } else {
                        // Cancel any ongoing speech synthesis first so user can talk immediately
                        cancelSpeech();
                        noSpeechRetriesRef.current = 0;
                        setIsContinuousActive(true);
                        setVoiceStatusText('Starting microphone...');
                        startSpeechRecognition();
                      }
                    }}
                    type="button"
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white ring-8 ${
                      isListening
                        ? "bg-gradient-to-tr from-rose-500 via-rose-400 to-pink-500 ring-rose-500/10"
                        : isSpeaking
                        ? "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 ring-emerald-500/10"
                        : isThinking
                        ? "bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-500 ring-indigo-500/10"
                        : "bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 ring-blue-500/10"
                    } transition-all duration-300`}
                  >
                    <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce' : ''}`} />
                    <span className="text-[9px] font-bold mt-1.5 tracking-widest uppercase">
                      {isListening ? 'Listening' : isSpeaking ? 'Speaking' : isThinking ? 'Thinking' : 'Tap to Talk'}
                    </span>
                  </motion.button>
                </div>

                {/* State Tag Display */}
                <div className="text-center space-y-1.5 px-3">
                  <div className="flex gap-1.5 justify-center items-center">
                    <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : isSpeaking ? 'bg-emerald-500 animate-pulse' : isThinking ? 'bg-indigo-500' : 'bg-blue-400'}`}></span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                      {isListening ? 'listening mode' : isSpeaking ? 'speaking mode' : isThinking ? 'thinking mode' : 'voice idle'}
                    </span>
                  </div>

                  {/* Active Language Badge */}
                  <div className="flex justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
                      title="Click to switch assistant language"
                    >
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>Language: <strong className="text-slate-900 font-semibold">{SUPPORTED_LANGUAGES[assistantLanguage]?.flag} {SUPPORTED_LANGUAGES[assistantLanguage]?.name}</strong></span>
                      <span className="text-[9px] text-blue-600 font-bold ml-0.5 hover:underline">Change</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-light leading-relaxed min-h-[36px] max-w-[260px] mx-auto">
                    {voiceStatusText}
                  </p>

                  {(voiceStatusText.toLowerCase().includes('denied') || voiceStatusText.toLowerCase().includes('unsupported') || voiceStatusText.toLowerCase().includes('permission') || voiceStatusText.toLowerCase().includes('fail')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('text');
                        setIsContinuousActive(false);
                        cancelSpeech();
                      }}
                      className="mt-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-200 transition-all cursor-pointer"
                    >
                      💬 Click here to type instead
                    </button>
                  )}
                </div>

                {/* ACCESSIBILITY: Optional Live Transcription Subtitles for User speech */}
                {liveTranscriptionsEnabled && showTranscriptions && voiceRecognizedText && (
                  <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-3 text-left space-y-2 animate-in fade-in max-h-36 overflow-y-auto">
                    <div className="text-[11px] text-slate-600">
                      <strong className="text-blue-600">You: </strong>
                      <span>"{voiceRecognizedText}"</span>
                    </div>
                  </div>
                )}

                {/* Real-time Dynamic Waveform visual feedback */}
                {(isListening || isSpeaking) && (
                  <div className="flex gap-1 items-center justify-center py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
                      const duration = 0.5 + Math.random() * 0.5;
                      const delay = Math.random() * 0.3;
                      return (
                        <motion.span
                          key={bar}
                          animate={{ height: [8, 24, 8] }}
                          transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
                          className={`w-1 rounded-full ${isListening ? 'bg-rose-500/80' : 'bg-blue-500/80'}`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Accessibility toggle at bottom of voice screen */}
                {liveTranscriptionsEnabled && (
                  <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100 animate-in fade-in">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Accessibility Captions</span>
                    <button
                      type="button"
                      onClick={() => setShowTranscriptions(!showTranscriptions)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        showTranscriptions 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {showTranscriptions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {showTranscriptions ? 'Captions: ON' : 'Captions: OFF'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* TEXT MODE: Classical typing assistant with chat bubble history */
              <>
                <div className="flex-1 max-h-60 min-h-[220px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-blue-100'
                      }`}>
                        <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                        <span className={`block text-[8px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start items-center gap-2 animate-pulse">
                      <span className="bg-blue-50 text-blue-500 p-2.5 rounded-xl text-[10px] border border-blue-100">Ini is thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions pills */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1">
                  {(currentRole === 'Teacher'
                    ? [
                        'Open lesson plans',
                        'Open gradebook',
                        'Open assignments',
                        'Open AI assistant',
                        'Open language coach'
                      ]
                    : [
                        'Open assignments', 
                        'Explain my grades', 
                        assistantLanguage === 'English' ? 'Speak in Spanish' : 'Speak in English',
                        'Open language coach'
                      ]
                  ).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setInputText(s); }}
                      className="text-[9px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg px-2.5 py-1 transition-all border border-slate-200/50 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Form input */}
                <form onSubmit={handleSendTextMessage} className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Ini anything about your courses..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
