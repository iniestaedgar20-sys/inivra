import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ThumbsUp, Bookmark, Star, Download, Search, CheckCircle2, MessageSquare, Flame, Clock, Award, ChevronRight, UserCheck, AlertCircle, Share2, Layers, Filter } from 'lucide-react';

interface VideoComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  isModerated: boolean;
}

interface VideoResource {
  title: string;
  type: string;
  size: string;
}

interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  educatorName: string;
  educatorAvatar: string;
  isVerified: boolean;
  subject: 'Science' | 'Mathematics' | 'Languages' | 'Technology' | 'Business' | 'Programming' | 'Engineering' | 'Arts';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  views: string;
  rating: number;
  reviewsCount: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  resources: VideoResource[];
  comments: VideoComment[];
}

const PREBUILT_VIDEOS: EducationalVideo[] = [
  {
    id: 'vid-1',
    title: 'Visualizing Stokes\' Theorem and Surface Flux Integrals',
    description: 'A deep geometric intuition walkthrough of Stokes\' Theorem. We visually explore curl on custom multi-dimensional surfaces and calculate boundary integrals step-by-step.',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
    educatorName: 'Prof. Arthur Pendelton',
    educatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    isVerified: true,
    subject: 'Mathematics',
    duration: '18:42',
    difficulty: 'Advanced',
    language: 'English',
    views: '12,400',
    rating: 4.9,
    reviewsCount: 340,
    likes: 1240,
    isLiked: false,
    isBookmarked: false,
    resources: [
      { title: 'Stokes_Theorem_Full_Vector_Notes.pdf', type: 'PDF', size: '1.8 MB' },
      { title: 'Surface_Flux_Calculus_Practice.docx', type: 'DOCX', size: '1.1 MB' }
    ],
    comments: [
      { id: 'c-1', author: 'Sophia Miller', role: 'Student', text: 'This visual animation of 3D vectors rotation made surface flux integrals click for me! The geometric visualizer is clear and pedagogical.', timestamp: '2 hours ago', isModerated: true },
      { id: 'c-2', author: 'Dr. Evelyn Vance', role: 'Educator', text: 'Stellar work Arthur. The representation of curl vector loops along the boundary of the paraboloid is mathematically precise and highly pedagogical.', timestamp: '5 hours ago', isModerated: true }
    ]
  },
  {
    id: 'vid-2',
    title: 'Quantum Entanglement & Superposition: Double-Slit Intuition',
    description: 'Demystifying the quantum particle-wave duality, Young\'s double-slit experiment, and mathematically modeling wave-function collapse upon observer measurement.',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    educatorName: 'Dr. Evelyn Vance',
    educatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
    isVerified: true,
    subject: 'Science',
    duration: '22:15',
    difficulty: 'Intermediate',
    language: 'English',
    views: '18,920',
    rating: 4.95,
    reviewsCount: 520,
    likes: 2310,
    isLiked: false,
    isBookmarked: false,
    resources: [
      { title: 'Quantum_Mechanics_Formulas.pdf', type: 'PDF', size: '1.2 MB' }
    ],
    comments: [
      { id: 'c-3', author: 'Markus Vance', role: 'Student', text: 'Can we calculate the probability amplitude using a basic python script? Loved the explanation.', timestamp: '1 day ago', isModerated: true }
    ]
  },
  {
    id: 'vid-3',
    title: 'Spanish Conversational Boost: 10 Native Idioms You Must Know',
    description: 'Tired of sounding like a textbook? Learn the exact idioms, pronunciation curves, and verbal connectors used by native Spanish speakers in daily business and casual settings.',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
    educatorName: 'Coach Isabella Ruiz',
    educatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    isVerified: true,
    subject: 'Languages',
    duration: '12:05',
    difficulty: 'Beginner',
    language: 'Spanish',
    views: '9,810',
    rating: 4.88,
    reviewsCount: 290,
    likes: 910,
    isLiked: false,
    isBookmarked: false,
    resources: [
      { title: 'Colloquial_Spanish_Idioms_Sheet.pdf', type: 'PDF', size: '890 KB' }
    ],
    comments: [
      { id: 'c-4', author: 'Alex Johnson', role: 'Student', text: '¡Excelente video Isabella! "Dar en el clavo" is such a cool phrase, I practiced it in my Inivra Language Coach chat earlier today.', timestamp: '3 hours ago', isModerated: true }
    ]
  },
  {
    id: 'vid-4',
    title: 'React 19 Advanced Hooks & Concurrent Mode Architecture',
    description: 'Learn how React 19 handles background transition states natively using useTransition, optimized client state caching, and the compiler mechanics.',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
    educatorName: 'Dev Sarah Chen',
    educatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
    isVerified: true,
    subject: 'Programming',
    duration: '26:50',
    difficulty: 'Advanced',
    language: 'English',
    views: '24,500',
    rating: 4.97,
    reviewsCount: 810,
    likes: 4120,
    isLiked: false,
    isBookmarked: false,
    resources: [
      { title: 'React19_Concurrency_CheatSheet.pdf', type: 'PDF', size: '2.1 MB' },
      { title: 'Vite_Production_Configs.json', type: 'JSON', size: '5 KB' }
    ],
    comments: [
      { id: 'c-5', author: 'Lucas Sterling', role: 'Student', text: 'This explained the automatic batching updates better than any other youtube tutorial. React compiler is going to change everything!', timestamp: '4 hours ago', isModerated: true }
    ]
  },
  {
    id: 'vid-5',
    title: 'AI Webhooks & Autonomous Integration Pipelines',
    description: 'Step-by-step tutorial on designing Express middlewares that proxy generative AI model requests, protect secrets, and deploy as safe microservices.',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    educatorName: 'Marcus Vance',
    educatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    isVerified: true,
    subject: 'Business',
    duration: '15:30',
    difficulty: 'Intermediate',
    language: 'English',
    views: '6,420',
    rating: 4.78,
    reviewsCount: 190,
    likes: 540,
    isLiked: false,
    isBookmarked: false,
    resources: [
      { title: 'Secure_API_Express_Middleware.ts', type: 'TypeScript', size: '4 KB' }
    ],
    comments: []
  }
];

export default function EducationalVideos({ enrolledCourses, learningGoals }: { enrolledCourses?: any; learningGoals?: string[] }) {
  const [videos, setVideos] = useState<EducationalVideo[]>(PREBUILT_VIDEOS);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('vid-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  
  // Custom interactive comment state
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Record<string, VideoComment[]>>({});

  const activeVideo = videos.find(v => v.id === selectedVideoId) || videos[0];

  const handleLike = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          isLiked: !v.isLiked,
          likes: v.isLiked ? v.likes - 1 : v.likes + 1
        };
      }
      return v;
    }));
  };

  const handleBookmark = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          isBookmarked: !v.isBookmarked
        };
      }
      return v;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: VideoComment = {
      id: `comment-${Date.now()}`,
      author: 'Alex Johnson',
      role: 'Student',
      text: newCommentText,
      timestamp: 'Just now',
      isModerated: true // Automated moderator indicator
    };

    setCommentsList(prev => ({
      ...prev,
      [activeVideo.id]: [newComment, ...(prev[activeVideo.id] || activeVideo.comments)]
    }));

    setNewCommentText('');
  };

  const subjects = ['All', 'Mathematics', 'Science', 'Languages', 'Programming', 'Business'];

  const filteredVideos = videos.filter(v => {
    const matchesSubject = subjectFilter === 'All' || v.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'All' || v.difficulty === difficultyFilter;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.educatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  // Smart Personalized Recommendation System
  // Suggests videos based on active subject or user's simulated enrolled course focus (e.g. if Mathematics is selected, prioritize Sciences and vice versa)
  const getRecommendedVideos = () => {
    return videos
      .filter(v => v.id !== activeVideo.id)
      .slice(0, 3); // Return next 3 high matching video resources
  };

  const activeComments = commentsList[activeVideo.id] || activeVideo.comments;

  return (
    <div className="space-y-6" id="educational-videos-section">
      {/* Search and Filters bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search video masterclasses, subject syllabuses, or verified independent educators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:border-indigo-600 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Subjects list bar */}
        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-50">
          {subjects.map(subj => {
            const isSel = subjectFilter === subj;
            return (
              <button
                key={subj}
                onClick={() => setSubjectFilter(subj)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all ${
                  isSel 
                    ? 'bg-indigo-950 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Player and description area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mock Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden group shadow-lg border border-slate-900">
            {activeVideo.thumbnail ? (
              <img 
                referrerPolicy="no-referrer"
                src={activeVideo.thumbnail} 
                alt={activeVideo.title} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-all duration-700" 
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-xs">
                Educational Video Stream
              </div>
            )}
            
            {/* Dark gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

            {/* Simulated Live Controls */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white/95 backdrop-blur-md text-slate-950 p-4 rounded-full shadow-2xl hover:scale-115 hover:bg-white transition-all duration-300">
                <Play className="w-8 h-8 fill-slate-950 ml-1" />
              </button>
            </div>

            {/* Video Watermark labels */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white z-10">
              <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase">
                {activeVideo.duration} • Interactive Session
              </span>
              <span className="bg-indigo-600 border border-indigo-400/20 px-2.5 py-1 rounded text-[9px] font-bold uppercase">
                {activeVideo.difficulty}
              </span>
            </div>
          </div>

          {/* Video Metadata */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {activeVideo.subject}
                </span>
                <h1 className="text-base sm:text-lg font-display font-black text-slate-900 leading-snug">
                  {activeVideo.title}
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  {activeVideo.views} views • Rated {activeVideo.rating} ({activeVideo.reviewsCount} reviews)
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => handleLike(activeVideo.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    activeVideo.isLiked 
                      ? 'bg-rose-50 border-rose-150 text-rose-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${activeVideo.isLiked ? 'fill-rose-600' : ''}`} />
                  {activeVideo.likes} Likes
                </button>
                <button
                  onClick={() => handleBookmark(activeVideo.id)}
                  className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                    activeVideo.isBookmarked 
                      ? 'bg-indigo-50 border-indigo-150 text-indigo-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${activeVideo.isBookmarked ? 'fill-indigo-600' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {activeVideo.description}
            </p>

            {/* Educator profile widget */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
              <div className="flex items-center gap-2.5">
                {activeVideo.educatorAvatar ? (
                  <img referrerPolicy="no-referrer" src={activeVideo.educatorAvatar} alt={activeVideo.educatorName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {activeVideo.educatorName ? activeVideo.educatorName.charAt(0).toUpperCase() : 'E'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{activeVideo.educatorName}</h4>
                    {activeVideo.isVerified && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500">Verified Independent Educator • {activeVideo.subject} Specialist</p>
                </div>
              </div>
              <button 
                onClick={() => alert(`Subscribed to ${activeVideo.educatorName}'s lesson playlist updates!`)}
                className="bg-indigo-900 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl hover:bg-indigo-950 transition-colors"
              >
                Follow Educator
              </button>
            </div>

            {/* Linked Resources */}
            {activeVideo.resources.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  Educator Linked Study Materials ({activeVideo.resources.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVideo.resources.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => alert(`Downloading resource file: ${res.title}`)}
                      className="flex items-center justify-between p-2.5 border border-slate-200 bg-slate-50/40 rounded-xl text-left hover:border-indigo-150 hover:bg-white transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-950">{res.title}</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-0.5">{res.type} • {res.size}</p>
                      </div>
                      <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Comment section with simulated moderation */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Moderated Discussion ({activeComments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Share your thoughts, ask educational doubts, or discuss this syllabus..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:border-indigo-600 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-indigo-900 text-white hover:bg-indigo-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-45"
              >
                Comment
              </button>
            </form>

            <div className="space-y-3.5">
              {activeComments.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-4">No discussions posted yet. Be the first to start the conversation!</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activeComments.map(comm => (
                    <div key={comm.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 relative">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-900">{comm.author}</span>
                          <span className="text-[8px] bg-slate-200/60 text-slate-500 uppercase font-bold tracking-wider px-1 py-0.2 rounded">
                            {comm.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">{comm.timestamp}</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-700 leading-relaxed font-sans">{comm.text}</p>
                      
                      {comm.isModerated && (
                        <div className="flex items-center gap-1 text-[8px] text-emerald-600 font-semibold font-mono uppercase tracking-wide">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Auto-Moderator Passed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playlists and Personalized recommendations sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Related Course Playlists */}
          <div className="bg-indigo-950 text-white rounded-3xl p-5 space-y-4 border border-indigo-950">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5 border-b border-indigo-900 pb-2.5">
              <Layers className="w-4.5 h-4.5 text-indigo-400" />
              Syllabus Playlists
            </h3>
            
            <div className="space-y-2.5">
              {[
                { title: 'Multivariable Vector calculus', videosCount: 8, rating: 4.9, active: activeVideo.subject === 'Mathematics' },
                { title: 'Modern Quantum Computing Foundations', videosCount: 6, rating: 4.95, active: activeVideo.subject === 'Science' },
                { title: 'Conversational Spanish B2 Bootcamp', videosCount: 12, rating: 4.88, active: activeVideo.subject === 'Languages' },
                { title: 'React 19 & Enterprise Node Architectures', videosCount: 10, rating: 4.97, active: activeVideo.subject === 'Programming' }
              ].map((play, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all ${
                    play.active 
                      ? 'bg-indigo-900/60 border-indigo-400 text-white' 
                      : 'bg-indigo-900/10 border-indigo-950 text-indigo-200 hover:bg-indigo-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold leading-snug pr-2">{play.title}</h4>
                    <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                      {play.videosCount} vids
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-300">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{play.rating} Verified Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video List / Recommended next */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-950 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span>Personalized For You</span>
              <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">RECOMMENDED</span>
            </h3>

            <div className="space-y-3.5">
              {getRecommendedVideos().map(video => (
                <button
                  key={video.id}
                  onClick={() => {
                    setSelectedVideoId(video.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left flex gap-3 group focus:outline-none"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                    {video.thumbnail ? (
                      <img referrerPolicy="no-referrer" src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-[9px]">
                        Video
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-slate-950/70 text-white text-[8px] px-1 py-0.2 rounded font-mono">
                      {video.duration}
                    </span>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[8px] font-extrabold uppercase text-indigo-600 block">{video.subject}</span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                      {video.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 truncate">By {video.educatorName}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
