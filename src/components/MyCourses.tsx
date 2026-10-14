import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, GraduationCap, Award, ChevronRight, CheckCircle2, Search, ArrowLeft, Download, Share2, Briefcase, Plus, ThumbsUp, Star, Filter, ShieldCheck, Lock, PlayCircle, ClipboardCheck, X } from 'lucide-react';
import { db } from '../InivraDatabase';
import EmptyState from './EmptyState';
import { downloadCertificateFile } from './AchievementsBadges';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Science' | 'Mathematics' | 'Languages' | 'Technology' | 'Business' | 'Programming' | 'Engineering' | 'Health' | 'Personal Development' | 'Arts';
  provider: string;
  creator: string;
  duration: string;
  lessonsCount: number;
  rating: number;
  reviewsCount: number;
  image: string;
  isVerified: boolean;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

interface Certificate {
  id: string;
  courseTitle: string;
  studentName: string;
  date: string;
  creator: string;
  provider: string;
  certId: string;
}

const PREBUILT_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to Quantum Computing & Mechanics',
    description: 'Explore qubits, superposition, quantum gates, and entanglement. Master key foundations of quantum algorithms and secure encryption.',
    category: 'Science',
    provider: 'Stanford Online Academy',
    creator: 'Dr. Evelyn Vance',
    duration: '12 Hours',
    lessonsCount: 4,
    rating: 4.9,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    lessons: [
      { id: 'l1-1', title: 'Foundations of Quantum Information', duration: '25 min', content: 'Quantum computing represents a fundamental shift in how we process information. Traditional computers store data in bits (0s or 1s). Quantum computers, however, use qubits. Qubits can exist in a state of superposition, representing both 0 and 1 simultaneously. This enables exponential processing speeds for specific computational tasks, such as prime factorization, cryptographic analysis, and physical simulation.' },
      { id: 'l1-2', title: 'Superposition & Qubits in Practice', duration: '30 min', content: 'Mathematically, a qubit is represented as a vector in a two-dimensional Hilbert space. Superposition is expressed as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are probability amplitudes. According to quantum mechanics, when the qubit is measured, the system collapses to state |0⟩ with probability |α|² or state |1⟩ with probability |β|². The sum of the probabilities must always equal 1: |α|² + |β|² = 1.' },
      { id: 'l1-3', title: 'Quantum Logic Gates & Circuits', duration: '35 min', content: 'Traditional computers use Boolean logic gates (AND, OR, NOT). Quantum computers utilize unitary transformations represented as matrices. Major quantum gates include: the Hadamard Gate (H) which puts a qubit into a perfect superposition; the Pauli-X Gate (equivalent to classical NOT); and the Controlled-NOT (CNOT) gate, which entangles two qubits. Entanglement is a unique state where the measurement of one qubit instantly determines the state of the other.' },
      { id: 'l1-4', title: 'Shor\'s and Grover\'s Algorithms', duration: '40 min', content: 'Two major algorithms prove quantum supremacy. Shor\'s algorithm factors large integers in polynomial time, posing a structural threat to traditional RSA encryption systems. Grover\'s algorithm searches unsorted databases in O(√N) time, compared to classical linear search O(N). These achievements underscore the critical need for post-quantum cryptographic standards.' }
    ],
    quiz: [
      {
        question: 'Which quantum gate is primarily used to put a qubit into a state of superposition?',
        options: ['Pauli-X Gate', 'Hadamard Gate (H)', 'CNOT Gate', 'Toffoli Gate'],
        correctIdx: 1
      },
      {
        question: 'If a qubit state is |ψ⟩ = α|0⟩ + β|1⟩, what constraint do the probability amplitudes α and β satisfy?',
        options: ['α + β = 1', '|α| + |β| = 1', '|α|² + |β|² = 1', 'α / β = 1'],
        correctIdx: 2
      },
      {
        question: 'What is the search time complexity of Grover\'s algorithm on an unsorted database of N items, compared to classical search?',
        options: ['O(log N) compared to O(N)', 'O(√N) compared to O(N)', 'O(N) compared to O(N²)', 'O(1) compared to O(log N)'],
        correctIdx: 1
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Mastering Advanced Calculus III: Vector Fields & Integrals',
    description: 'Master multi-variable calculus, gradients, divergence, curl, and fundamental theorems including Green\'s, Stokes\', and Divergence theorem.',
    category: 'Mathematics',
    provider: 'MIT Open Learning',
    creator: 'Prof. Arthur Pendelton',
    duration: '16 Hours',
    lessonsCount: 4,
    rating: 4.8,
    reviewsCount: 980,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    lessons: [
      { id: 'l2-1', title: 'Vector Fields & Parametric Curves', duration: '30 min', content: 'A vector field F in R³ associates a vector F(x,y,z) to each point in its domain. Common physical examples include gravitational fields, wind velocity vectors, and magnetic fields. A vector field is conservative if it is the gradient of some scalar function f, i.e., F = ∇f. In such cases, f is called the potential function, and any line integral within this field is path-independent.' },
      { id: 'l2-2', title: 'Divergence and Curl Operator Mechanics', duration: '25 min', content: 'Divergence measures the net expansion of a vector field from a point (the source or sink strength). It is a scalar field calculated as div(F) = ∇ · F. Curl measures the rotation or spin of the vector field around a point. It is a vector field calculated as curl(F) = ∇ × F. If curl(F) = 0 everywhere, the vector field is irrotational.' },
      { id: 'l2-3', title: 'Green\'s and Stokes\' Theorems', duration: '35 min', content: 'Green\'s Theorem relates a line integral around a simple closed curve C to a double integral over the plane region D bounded by C. Stokes\' Theorem generalizes this to three dimensions: the line integral of F along the boundary curve C of a surface S equals the surface integral of the curl of F over S: ∮_C F · dr = ∬_S (∇ × F) · dS.' },
      { id: 'l2-4', title: 'The Divergence (Gauss) Theorem', duration: '40 min', content: 'The Divergence Theorem relates the flux of a vector field through a closed surface S to the triple integral of the divergence over the solid volume E enclosed by S: ∬_S F · dS = ∭_E (∇ · F) dV. This theorem is fundamental in electrodynamics, physics fluid mechanics, and thermodynamics.' }
    ],
    quiz: [
      {
        question: 'What is a vector field called if its curl is equal to zero everywhere (∇ × F = 0)?',
        options: ['Solenoidal', 'Divergent', 'Irrotational', 'Incompressible'],
        correctIdx: 2
      },
      {
        question: 'Stokes\' Theorem relates a line integral around a boundary curve C to what kind of integral over the surface S?',
        options: ['Double integral of the divergence of F', 'Double integral of the curl of F', 'Triple integral of the gradient of F', 'Surface integral of F itself'],
        correctIdx: 1
      },
      {
        question: 'If a vector field F is conservative (F = ∇f), what is the value of the line integral ∮_C F · dr around any closed curve C?',
        options: ['Zero', 'Infinity', 'Equal to the surface area', 'Dependant on the potential value'],
        correctIdx: 0
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Spanish B2 Conversational Fluency & Cultural Mastery',
    description: 'Transition from intermediate grammar to spontaneous speaking. Learn native idioms, business etiquette, and advanced structural contexts.',
    category: 'Languages',
    provider: 'Inivra Language Academy',
    creator: 'Coach Isabella Ruiz',
    duration: '10 Hours',
    lessonsCount: 4,
    rating: 4.95,
    reviewsCount: 1840,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    lessons: [
      { id: 'l3-1', title: 'Mastering the Subjunctive Mood (Subjuntivo)', duration: '20 min', content: 'The subjunctive mood in Spanish is essential for expressing doubts, desires, emotions, unknowns, and hypothetical scenarios. Unlike the indicative, which deals with objective reality, the subjunctive highlights subjective perception. Key trigger expressions include: "Quiero que...", "Es necesario que...", "Dudo que...", or "Ojalá que...". The conjugation requires switching vowels (e.g., -ar verbs take -e endings).' },
      { id: 'l3-2', title: 'Idiomatic Expressions & Colloquialisms', duration: '25 min', content: 'To sound truly fluent, you must adopt natural idioms. For example, "Dar en el clavo" means to hit the nail on the head. "Tomar el pelo" means to pull someone\'s leg. "Estar de mala leche" means to be in a bad mood. Understanding these colloquialisms prevents translation blunders and builds deep cultural rapport with native speakers.' },
      { id: 'l3-3', title: 'Business Spanish and Formal Etiquette', duration: '30 min', content: 'In formal business environments, address partners as "Usted" and use courteous greetings like "Estimado Sr./Sra." to establish respect. Master essential business vocabulary: "reunión de negocios" (business meeting), "presupuesto" (budget), "negociación" (negotiation), and "plazo de entrega" (delivery deadline). Keep arguments structured and polite.' },
      { id: 'l3-4', title: 'Academic Presentations and Debate', duration: '30 min', content: 'In academic or structural Spanish debates, utilize precise transition connectors to organize your thoughts: "En primer lugar" (first of all), "Por lo tanto" (therefore), "A pesar de" (despite), and "En resumen" (in summary). Express complex arguments clearly while respecting other speakers.' }
    ],
    quiz: [
      {
        question: 'Which phrase correctly triggers the Spanish Subjunctive mood?',
        options: ['Creo que él viene hoy.', 'Dudo que ella tenga el documento.', 'Es verdad que nosotros sabemos.', 'Él dice que tiene sueño.'],
        correctIdx: 1
      },
      {
        question: 'What is the idiomatic meaning of the Spanish expression "Dar en el clavo"?',
        options: ['To throw in the towel', 'To hit the nail on the head', 'To pull someone\'s leg', 'To lose one\'s mind'],
        correctIdx: 1
      },
      {
        question: 'What is the professional Spanish term for a "business meeting"?',
        options: ['Cita casual', 'Reunión de negocios', 'Plazo de entrega', 'Presupuesto formal'],
        correctIdx: 1
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Full-Stack React & Node.js Production Architecture',
    description: 'Learn modern React 19, TypeScript state-management, Express middlewares, relational DB schemas, and robust backend deployment.',
    category: 'Programming',
    provider: 'Vanguard Technical Academy',
    creator: 'Dev Sarah Chen',
    duration: '18 Hours',
    lessonsCount: 4,
    rating: 4.92,
    reviewsCount: 3120,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    lessons: [
      { id: 'l4-1', title: 'React 19 Hooks and State Management', duration: '35 min', content: 'React 19 introduces major optimizations in component rendering and state orchestration. Standard patterns use functional components with hooks like useState, useEffect, and useMemo. It is critical to design clean props hierarchies, avoid redundant state duplications, and manage side effects properly. Use custom hooks to isolate reusable business logic from the visual components.' },
      { id: 'l4-2', title: 'Building Secure Express API Middleware', duration: '30 min', content: 'An Express server functions as the central routing hub. Express routes should handle specific HTTP methods (GET, POST, PUT, DELETE). To secure your routes, always implement middleware. Middlewares can parse JSON request bodies, authorize JWT session tokens, apply rate-limiting to prevent DDoS attacks, and catch error exceptions systematically.' },
      { id: 'l4-3', title: 'TypeScript Interfaces & API Contracts', duration: '25 min', content: 'TypeScript guarantees full compile-time safety. To build a robust full-stack app, always establish clear type declarations and API contracts. Define shared interfaces for model structures, network request payloads, and API server responses. This ensures complete system synchronization and prevents runtime exceptions.' },
      { id: 'l4-4', title: 'CI/CD and High Availability Deployments', duration: '40 min', content: 'Production deployment requires a pipeline. Build your frontend into static assets using tools like Vite, and serve them alongside your backend server in containerized environments (like Docker and Cloud Run). Configure persistent database connections securely, run automatic schema migrations, and implement error monitoring dashboards.' }
    ],
    quiz: [
      {
        question: 'In full-stack architectures, what is the primary role of Express middleware?',
        options: ['To compile TS code to JS', 'To execute pre-routing logic, validations, or authentication', 'To manage client-side state', 'To bundle CSS stylesheet classes'],
        correctIdx: 1
      },
      {
        question: 'Which React hook is optimal for caching computed values to prevent unnecessary recalculations on every render?',
        options: ['useEffect', 'useState', 'useMemo', 'useRef'],
        correctIdx: 2
      },
      {
        question: 'Why is TypeScript critical for large-scale full-stack application development?',
        options: ['It speed up actual runtime code execution', 'It guarantees type-safety and catches bugs at compile-time', 'It replaces the need for a database', 'It styles the user interface automatically'],
        correctIdx: 1
      }
    ]
  },
  {
    id: 'course-5',
    title: 'AI-Powered Business Operations & Strategy',
    description: 'Harness LLMs, automation pipelines, and machine learning models to maximize workspace efficiency, financial projections, and product shipping.',
    category: 'Business',
    provider: 'Inivra Business School',
    creator: 'Marcus Vance',
    duration: '8 Hours',
    lessonsCount: 4,
    rating: 4.75,
    reviewsCount: 820,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    lessons: [
      { id: 'l5-1', title: 'Generative AI and Enterprise Productivity', duration: '20 min', content: 'Generative AI models are revolutionizing modern workplaces. Companies utilize Large Language Models (LLMs) to write draft documents, summarize heavy market research sheets, automate customer support via intelligent agents, and generate boilerplate code. Integrating these workflows raises average productivity metrics by over 40%.' },
      { id: 'l5-2', title: 'Predictive Analytics & Financial Modeling', duration: '25 min', content: 'While Generative AI processes text, predictive analytics leverages historical data and machine learning to forecast future trends. Business analysts build linear and logistical regression models to calculate customer churn, project quarterly revenue goals, and model inventory requirements with high mathematical accuracy.' },
      { id: 'l5-3', title: 'Automation Pipelines & Tool Integrations', duration: '30 min', content: 'True efficiency is realized through automated pipelines. By combining LLM logic with automated API integrations (using webhooks or cloud functions), systems can listen for new emails, analyze customer sentiment, auto-categorize tickets, query database records, and draft replies instantly without human intervention.' },
      { id: 'l5-4', title: 'Ethics, Security & Governance in AI', duration: '30 min', content: 'Adopting AI requires solid risk assessment. Enterprises must implement strict data governance: protect customer privacy, guarantee that training datasets are unbiased, secure secret API keys, monitor model hallucinations, and ensure humans oversee critical operational decisions.' }
    ],
    quiz: [
      {
        question: 'What is the main difference between Generative AI and Predictive Analytics in business?',
        options: ['Generative AI creates new content; Predictive Analytics forecasts future trends based on historical data', 'Generative AI is cheaper than Predictive Analytics', 'Predictive Analytics does not require any datasets', 'There is no difference between them'],
        correctIdx: 0
      },
      {
        question: 'What is an effective way to prevent unauthorized data exposure when using AI APIs?',
        options: ['Publishing API keys in public repositories', 'Enforcing strict data governance and keeping sensitive parameters server-side', 'Disabling all server-side middlewares', 'Running the API requests client-side without guards'],
        correctIdx: 1
      },
      {
        question: 'Which mechanism enables different applications to sync and trigger automated pipelines in real-time?',
        options: ['Static CSS stylesheets', 'API Webhooks and background triggers', 'Manual Excel sheet imports', 'Client browser reload timers'],
        correctIdx: 1
      }
    ]
  }
];

export default function MyCourses({ userName, currentUserId }: { userName: string; currentUserId?: string }) {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, { currentLessonIdx: number; completedLessons: string[]; score?: number; isCompleted: boolean }>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Lesson view state
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Completed Certificates
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Load initially completed courses and certificates from user profile
  useEffect(() => {
    if (currentUserId) {
      const profile = db.getProfile(currentUserId);
      if (profile && profile.completedCourses && profile.completedCourses.length > 0) {
        // Sync completed courses in enrolledCourses state
        setEnrolledCourses(prev => {
          const next = { ...prev };
          let changed = false;
          profile.completedCourses?.forEach(title => {
            const matched = PREBUILT_COURSES.find(c => c.title === title);
            if (matched && !next[matched.id]?.isCompleted) {
              next[matched.id] = {
                currentLessonIdx: 0,
                completedLessons: matched.lessons.map(l => l.id),
                isCompleted: true,
                score: 100
              };
              changed = true;
            }
          });
          return changed ? next : prev;
        });

        // Sync completed courses into certificates list
        setCertificates(prev => {
          const next = [...prev];
          let changed = false;
          profile.completedCourses?.forEach((title, idx) => {
            if (!next.some(cert => cert.courseTitle === title)) {
              const matched = PREBUILT_COURSES.find(c => c.title === title);
              next.push({
                id: `cert-loaded-${idx}`,
                courseTitle: title,
                studentName: userName,
                date: '2026-07-19',
                creator: matched?.creator || 'Inivra Global Faculty',
                provider: matched?.provider || 'Inivra Global Academy',
                certId: `CERT-${(matched?.id || 'GEN').toUpperCase()}-${1000 + idx}-INIVRA`
              });
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    }
  }, [currentUserId, userName]);

  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const categories = ['All', 'Science', 'Mathematics', 'Languages', 'Business', 'Programming', 'Personal Development'];

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => ({
      ...prev,
      [courseId]: { currentLessonIdx: 0, completedLessons: [], isCompleted: false }
    }));
  };

  const handleCompleteLesson = (courseId: string, lessonId: string) => {
    setEnrolledCourses(prev => {
      const existing = prev[courseId];
      if (!existing) return prev;
      const alreadyCompleted = existing.completedLessons.includes(lessonId);
      const newCompleted = alreadyCompleted ? existing.completedLessons : [...existing.completedLessons, lessonId];
      return {
        ...prev,
        [courseId]: {
          ...existing,
          completedLessons: newCompleted
        }
      };
    });
  };

  const submitQuiz = (course: Course) => {
    let correctCount = 0;
    course.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIdx) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / course.quiz.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    if (percentage >= 80) {
      // Complete course and issue Certificate
      setEnrolledCourses(prev => ({
        ...prev,
        [course.id]: {
          ...prev[course.id],
          isCompleted: true,
          score: percentage
        }
      }));

      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        courseTitle: course.title,
        studentName: userName,
        date: new Date().toISOString().split('T')[0],
        creator: course.creator,
        provider: course.provider,
        certId: `CERT-${course.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-INIVRA`
      };

      setCertificates(prev => [...prev, newCert]);
      
      // Automatically save course completion to database for real-time dashboard and achievements
      if (currentUserId) {
        db.markCourseCompleted(currentUserId, course.title);
        window.dispatchEvent(new Event('storage'));
      }

      // Save notification to DB if possible
      try {
        db.addNotification({
          title: '🎉 Course Completed!',
          message: `Congratulations! You scored ${percentage}% and passed "${course.title}". Your Certificate is ready for download!`,
          type: 'grade'
        });
      } catch (e) {}
    }
  };

  const filteredCourses = PREBUILT_COURSES.filter(c => {
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCourse = PREBUILT_COURSES.find(c => c.id === activeCourseId);

  // Trigger browser print or custom dialog
  const exportCertificate = (cert: Certificate) => {
    window.print();
  };

  return (
    <div className="space-y-6" id="my-courses-section">
      <AnimatePresence mode="wait">
        {!activeCourseId && !activeCertificate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-950">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Inivra Academy Pro
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight leading-tight">
                  Professional Curriculum & Certifications
                </h2>
                <p className="text-indigo-200 text-xs sm:text-sm font-light leading-relaxed">
                  Enroll in accredited courses crafted by verified educators and leading universities. Complete lessons, pass rigorous quizzes, and export professional certificates to boost your career.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none w-1/2 flex items-center justify-center">
                <GraduationCap className="w-48 h-48 text-indigo-400" />
              </div>
            </div>

            {/* Enrolled Courses Dashboard Progress */}
            {Object.keys(enrolledCourses).length > 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-950 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <PlayCircle className="w-4.5 h-4.5 text-indigo-600" />
                  Your Active Learning Path
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PREBUILT_COURSES.filter(c => enrolledCourses[c.id]).map(course => {
                    const progress = enrolledCourses[course.id];
                    const completedPct = Math.round((progress.completedLessons.length / course.lessons.length) * 100);
                    return (
                      <div key={course.id} className="border border-slate-150 rounded-2xl p-4 hover:border-indigo-150 transition-all bg-slate-50/20 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            {course.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{course.title}</h4>
                          <p className="text-[10px] text-slate-500">By {course.creator} • {course.provider}</p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-slate-700">
                            <span>Syllabus Progress</span>
                            <span>{completedPct}% ({progress.completedLessons.length}/{course.lessons.length} Lessons)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${completedPct}%` }}></div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          {progress.isCompleted ? (
                            <button
                              onClick={() => {
                                const matched = certificates.find(ce => ce.courseTitle === course.title);
                                if (matched) setActiveCertificate(matched);
                              }}
                              className="w-full text-center bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl py-2 text-[10px] font-bold tracking-wide hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5" />
                              View Earned Certificate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveCourseId(course.id);
                                setSelectedLessonIdx(progress.completedLessons.length < course.lessons.length ? progress.completedLessons.length : 0);
                                setIsTakingQuiz(false);
                                setQuizSubmitted(false);
                              }}
                              className="w-full text-center bg-indigo-900 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-950 transition-all flex items-center justify-center gap-1"
                            >
                              Continue Course
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                description="Join or add a course to get started."
                actionText="Browse Courses"
                onAction={() => {
                  const el = document.getElementById('browse-courses-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Main Course Finder and Certificates */}
            <div id="browse-courses-catalog" className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Sidebar Filters */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-950 flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1">
                    {categories.map(cat => {
                      const isSel = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                            isSel 
                              ? 'bg-indigo-50 text-indigo-900 font-bold border-l-4 border-indigo-600' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                            {cat === 'All' ? PREBUILT_COURSES.length : PREBUILT_COURSES.filter(c => c.category === cat).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Earned Certificates Widgets */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Award className="w-4.5 h-4.5 text-emerald-600" />
                    My Certificates ({certificates.length})
                  </h3>
                  {certificates.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">No certificates earned yet. Pass a course quiz with 80% to unlock!</p>
                  ) : (
                    <div className="space-y-2">
                      {certificates.map(cert => (
                        <button
                          key={cert.id}
                          onClick={() => setActiveCertificate(cert)}
                          className="w-full text-left p-2.5 border border-slate-150 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/10 transition-all flex items-center gap-2"
                        >
                          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg">
                            <Award className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-900 truncate leading-tight">{cert.courseTitle}</p>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">{cert.certId}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Course Catalog Grid */}
              <div className="lg:col-span-3 space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search professional courses, syllabus topics, or leading universities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="bg-white border border-slate-150 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-xs text-slate-500 font-medium">No courses matched your query. Try selection on the category filter panel!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredCourses.map(course => {
                      const isEnrolled = !!enrolledCourses[course.id];
                      const isCompleted = enrolledCourses[course.id]?.isCompleted;
                      return (
                        <div key={course.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                          <div className="relative h-36">
                            {course.image ? (
                              <img referrerPolicy="no-referrer" src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-blue-700 flex items-center justify-center text-white font-bold text-sm p-4 text-center">
                                {course.title}
                              </div>
                            )}
                            <div className="absolute top-2.5 left-2.5 bg-slate-950/70 backdrop-blur-md text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border border-white/15">
                              {course.category}
                            </div>
                            <div className="absolute bottom-2 left-2 bg-indigo-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {course.rating} ({course.reviewsCount})
                            </div>
                          </div>

                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span className="font-semibold text-slate-700">{course.provider}</span>
                                {course.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 fill-indigo-50" />}
                              </div>
                              <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                                {course.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-medium text-slate-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                {course.lessonsCount} Modules
                              </span>
                              <span>•</span>
                              <span>{course.duration} Syllabus</span>
                            </div>
                          </div>

                          <div className="p-4 pt-0">
                            {isCompleted ? (
                              <button
                                onClick={() => {
                                  const matched = certificates.find(ce => ce.courseTitle === course.title);
                                  if (matched) setActiveCertificate(matched);
                                }}
                                className="w-full bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Award className="w-4 h-4" />
                                View Earned Certificate
                              </button>
                            ) : isEnrolled ? (
                              <button
                                onClick={() => {
                                  setActiveCourseId(course.id);
                                  const progress = enrolledCourses[course.id];
                                  setSelectedLessonIdx(progress.completedLessons.length < course.lessons.length ? progress.completedLessons.length : 0);
                                  setIsTakingQuiz(false);
                                  setQuizSubmitted(false);
                                }}
                                className="w-full bg-indigo-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-950 transition-all flex items-center justify-center gap-1"
                              >
                                Continue Learning
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                className="w-full bg-slate-100 border border-slate-200 text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-150 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                Enroll in Course
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ACTIVE LESSONS VIEW */}
        {activeCourseId && activeCourse && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left sidebar: Lessons list */}
            <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-4 space-y-4">
              <button
                onClick={() => setActiveCourseId(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Curriculum
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">{activeCourse.category}</span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{activeCourse.title}</h3>
                <p className="text-[9px] text-slate-500">Instructor: {activeCourse.creator} • {activeCourse.provider}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span>Syllabus Progress</span>
                  <span>
                    {Math.round((enrolledCourses[activeCourse.id]?.completedLessons.length / activeCourse.lessons.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300" 
                    style={{ width: `${(enrolledCourses[activeCourse.id]?.completedLessons.length / activeCourse.lessons.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modules & Content</h4>
                <div className="flex flex-col gap-1.5">
                  {activeCourse.lessons.map((les, index) => {
                    const isSelected = selectedLessonIdx === index && !isTakingQuiz;
                    const isCompleted = enrolledCourses[activeCourse.id]?.completedLessons.includes(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setSelectedLessonIdx(index);
                          setIsTakingQuiz(false);
                          setQuizSubmitted(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' 
                            : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[8px] font-bold font-mono">
                              {index + 1}
                            </div>
                          )}
                          <span className="truncate leading-tight">{les.title}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">{les.duration}</span>
                      </button>
                    );
                  })}

                  {/* Course Certification Quiz */}
                  <button
                    onClick={() => {
                      setIsTakingQuiz(true);
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                      isTakingQuiz 
                        ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold' 
                        : 'bg-slate-50 border-dashed border-slate-300 text-slate-800 hover:bg-amber-50/40 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold">Final Certification Quiz</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right container: Active lesson content / Quiz */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6">
              {!isTakingQuiz ? (
                // Single Module View
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase">MODULE {selectedLessonIdx + 1} OF {activeCourse.lessons.length}</span>
                      <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
                        {activeCourse.lessons[selectedLessonIdx].title}
                      </h2>
                    </div>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-mono">
                      {activeCourse.lessons[selectedLessonIdx].duration} Read
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap space-y-4">
                    <p>{activeCourse.lessons[selectedLessonIdx].content}</p>
                    <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                        Key Insight & Pedagogical Summary
                      </h4>
                      <p className="text-[11px] text-indigo-900 font-light leading-relaxed">
                        Mastering this conceptual baseline will directly assist you in completing the final quiz. Ensure you take brief notes and identify practical formula parameters before clicking below to record this module as completed.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        handleCompleteLesson(activeCourse.id, activeCourse.lessons[selectedLessonIdx].id);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        enrolledCourses[activeCourse.id]?.completedLessons.includes(activeCourse.lessons[selectedLessonIdx].id)
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {enrolledCourses[activeCourse.id]?.completedLessons.includes(activeCourse.lessons[selectedLessonIdx].id)
                        ? 'Completed (Checked)'
                        : 'Mark as Completed'}
                    </button>

                    {selectedLessonIdx < activeCourse.lessons.length - 1 ? (
                      <button
                        onClick={() => {
                          const currentId = activeCourse.lessons[selectedLessonIdx].id;
                          handleCompleteLesson(activeCourse.id, currentId);
                          setSelectedLessonIdx(prev => prev + 1);
                        }}
                        className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200 hover:border-indigo-150 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        Next Module
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const currentId = activeCourse.lessons[selectedLessonIdx].id;
                          handleCompleteLesson(activeCourse.id, currentId);
                          setIsTakingQuiz(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        Unlock Certification Quiz
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Quiz View
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 space-y-1">
                    <span className="text-[10px] text-amber-600 font-extrabold tracking-widest uppercase">ACCREDITATION CHALLENGE</span>
                    <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
                      Final Certificate Quiz
                    </h2>
                    <p className="text-xs text-slate-500 font-light">Score at least 80% to earn your verified Certificate of Completion.</p>
                  </div>

                  {!quizSubmitted ? (
                    <div className="space-y-5">
                      {activeCourse.quiz.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/30 space-y-3">
                          <p className="text-xs font-bold text-slate-900 leading-snug">{qIdx + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isChecked = quizAnswers[qIdx] === oIdx;
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                  className={`w-full text-left p-2.5 border rounded-xl text-xs transition-all flex items-center gap-2.5 ${
                                    isChecked
                                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                                    isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="leading-tight">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => submitQuiz(activeCourse)}
                        className="w-full bg-indigo-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-indigo-950 transition-all uppercase tracking-wider"
                      >
                        Submit Quiz & Calculate Results
                      </button>
                    </div>
                  ) : (
                    // Quiz results
                    <div className="p-6 border border-slate-150 rounded-3xl text-center space-y-4">
                      {quizScore >= 80 ? (
                        <>
                          <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                            <Award className="w-9 h-9" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">Congratulations, {userName}!</h3>
                          <p className="text-xs text-slate-600 max-w-md mx-auto">
                            You scored **{quizScore}%** and successfully passed the examination. Your official credentials have been compiled and signed by **{activeCourse.creator}**.
                          </p>
                          <div className="flex gap-2 justify-center pt-2">
                            <button
                              onClick={() => {
                                const matched = certificates.find(ce => ce.courseTitle === activeCourse.title);
                                if (matched) setActiveCertificate(matched);
                              }}
                              className="bg-indigo-900 text-white hover:bg-indigo-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                            >
                              <Award className="w-4 h-4" />
                              View Certificate
                            </button>
                            <button
                              onClick={() => {
                                setIsTakingQuiz(false);
                                setQuizSubmitted(false);
                                setActiveCourseId(null);
                              }}
                              className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                            >
                              Back to Academy
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-500 border border-rose-200 rounded-full flex items-center justify-center">
                            <X className="w-8 h-8" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">Attempt Unsuccessful</h3>
                          <p className="text-xs text-slate-600 max-w-sm mx-auto">
                            You scored **{quizScore}%** but need **80% or higher** to pass. Review the lessons syllabus and try again whenever you feel comfortable!
                          </p>
                          <div className="flex gap-2 justify-center pt-2">
                            <button
                              onClick={() => {
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                              }}
                              className="bg-indigo-900 text-white hover:bg-indigo-950 px-4 py-2.5 rounded-xl text-xs font-bold"
                            >
                              Retry Examination
                            </button>
                            <button
                              onClick={() => {
                                setIsTakingQuiz(false);
                                setQuizSubmitted(false);
                              }}
                              className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold"
                            >
                              Review Lessons
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* FULL HIGH CONTRAST CERTIFICATE DIALOG VIEW */}
        {activeCertificate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-3xl mx-auto space-y-6"
            id="certificate-viewer"
          >
            {/* Control actions */}
            <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <button
                onClick={() => setActiveCertificate(null)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    downloadCertificateFile({
                      title: 'Certificate of Course Completion',
                      courseTitle: activeCertificate.courseTitle,
                      recipient: activeCertificate.studentName || userName,
                      date: activeCertificate.date,
                      certId: activeCertificate.certId,
                      description: `For verified mastery of curriculum modules and examinations in affiliation with ${activeCertificate.provider}.`
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Certificate
                </button>
                <button
                  onClick={() => exportCertificate(activeCertificate)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    if (currentUserId) {
                      const profile = db.getProfile(currentUserId);
                      if (profile) {
                        const currentCompleted = profile.completedCourses ? [...profile.completedCourses] : [];
                        if (!currentCompleted.includes(activeCertificate.courseTitle)) {
                          currentCompleted.push(activeCertificate.courseTitle);
                          db.updateProfile({
                            ...profile,
                            completedCourses: currentCompleted
                          });
                          window.dispatchEvent(new Event('storage'));
                        }
                      }
                    }
                    alert(`Certificate ${activeCertificate.certId} has been linked to your Inivra CV profile successfully!`);
                  }}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Save to CV Profile
                </button>
                <button
                  onClick={() => alert(`Direct link to certificate ${activeCertificate.certId} copied to clipboard! Ready to share on LinkedIn.`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Certificate
                </button>
              </div>
            </div>

            {/* Certificate Display Card */}
            <div className="bg-[#FAF8F5] border-[12px] border-[#2E3B55] rounded-xl p-8 sm:p-12 relative shadow-2xl text-[#1E293B] font-serif space-y-8 select-none">
              {/* Outer double gold/slate border line */}
              <div className="absolute inset-2 border-2 border-dashed border-[#D4AF37]/50 pointer-events-none"></div>

              {/* Gold seal */}
              <div className="absolute bottom-6 right-8 opacity-20 sm:opacity-100 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#D4AF37] rounded-full animate-pulse border-4 border-double border-white shadow-md"></div>
                  <Award className="w-10 h-10 text-white relative z-10" />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest font-sans mt-1.5 text-[#8B6E2C]">Verified Seal</span>
              </div>

              {/* Watermark symbol background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <GraduationCap className="w-96 h-96" />
              </div>

              <div className="text-center space-y-4">
                <span className="text-[11px] uppercase tracking-[0.3em] font-sans font-black text-[#D4AF37] block">
                  Certificate of Completion
                </span>
                <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
                <p className="text-xs italic text-slate-500 font-light font-sans">This is officially issued to accredit that</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E3A8A] font-serif capitalize">
                  {activeCertificate.studentName}
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                  has successfully passed all academic modules, syllabus requirements, and certified examinations under the expert instruction of Inivra Learn verified educators for:
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-900 py-1 border-b border-slate-200/50 max-w-xl mx-auto">
                  {activeCertificate.courseTitle}
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Offered in affiliation with <strong className="text-slate-700">{activeCertificate.provider}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200/80 font-sans text-xs items-end max-w-2xl mx-auto">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">VERIFIED INSTRUCTOR</p>
                  <p className="font-bold text-slate-800 italic border-b border-slate-300 pb-1">{activeCertificate.creator}</p>
                  <p className="text-[9px] text-slate-400 font-light">Lead Course Academic</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ACADEMIC METRICS</p>
                  <p className="font-bold text-slate-800 pb-1">Issued {activeCertificate.date}</p>
                  <p className="text-[9px] text-[#8B6E2C] font-mono font-bold">{activeCertificate.certId}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
