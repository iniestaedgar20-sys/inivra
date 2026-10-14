import React, { useState } from 'react';
import { 
  FolderOpen, FileText, Download, Sparkles, Upload, 
  Search, BookOpen, Clock, CheckCircle2, ArrowRight, X, FileCheck
} from 'lucide-react';
import AISummarizer from './AISummarizer';

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX';
  size: string;
  summary: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Differential Calculus & Derivative Rules Master Summary',
    subject: 'Mathematics',
    teacher: 'Dr. Sarah Jenkins',
    date: 'July 14, 2026',
    fileType: 'PDF',
    size: '2.4 MB',
    summary: 'Comprehensive review of product, quotient, and chain rules with trigonometric derivatives.'
  },
  {
    id: 'n2',
    title: 'Rotational Dynamics & Moment of Inertia Cheat Sheet',
    subject: 'Physics',
    teacher: 'Prof. Marcus Vance',
    date: 'July 12, 2026',
    fileType: 'PDF',
    size: '1.8 MB',
    summary: 'Equations for solid cylinders, spheres, parallel axis theorem, and angular momentum conservation.'
  },
  {
    id: 'n3',
    title: 'Organic Chemistry: Alkane & Alkene Reaction Mechanisms',
    subject: 'Chemistry',
    teacher: 'Dr. Emily Watson',
    date: 'July 10, 2026',
    fileType: 'PDF',
    size: '3.1 MB',
    summary: 'Step-by-step electrophilic addition, Markovnikov rule, and halogenation pathways.'
  },
  {
    id: 'n4',
    title: 'Python Data Structures & Algorithmic Complexity Guide',
    subject: 'Computer Science',
    teacher: 'iniesta',
    date: 'July 15, 2026',
    fileType: 'DOCX',
    size: '950 KB',
    summary: 'Big-O cheat sheet, stack/queue operations, hash maps, and binary search implementation.'
  },
  {
    id: 'n5',
    title: 'Spanish Subjunctive Mood & Irregular Verbs Table',
    subject: 'Languages',
    teacher: 'Elena Rostova',
    date: 'July 08, 2026',
    fileType: 'PDF',
    size: '1.2 MB',
    summary: 'Complete conjugation guide for dar, ir, ser, haber, estar, saber with real example drills.'
  }
];

export default function NotesResourcesHub({ userName }: { userName: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'materials' | 'summarizer'>('materials');
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload note form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newSummary, setNewSummary] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubj = selectedSubject === 'All' || n.subject === selectedSubject;
    return matchesSearch && matchesSubj;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: newTitle.trim(),
      subject: newSubject,
      teacher: userName || 'Student Upload',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileType: 'PDF',
      size: '1.5 MB',
      summary: newSummary.trim() || 'Uploaded study guide and lecture notes.'
    };

    setNotes([newNote, ...notes]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewSummary('');
    triggerToast('Study notes successfully uploaded to repository!');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl border border-slate-700 animate-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Notes & Academic Resources</h2>
          </div>
          <p className="text-xs text-slate-500 font-light max-w-xl">
            Access certified lecture notes, downloadable syllabus cheat sheets, or employ the AI Document Summarizer to distill textbooks in seconds.
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'materials'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Notes & Materials
          </button>
          <button
            onClick={() => setActiveSubTab('summarizer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'summarizer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Document Summarizer
          </button>
        </div>
      </div>

      {/* SUBTAB 1: NOTES & STUDY MATERIALS */}
      {activeSubTab === 'materials' && (
        <div className="space-y-5">
          
          {/* Controls Bar: Search, Filters, Upload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex justify-between items-center flex-wrap gap-4">
            
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search lecture notes, guides, or formulas..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Subject dropdown */}
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Languages">Languages</option>
              </select>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Study Material
            </button>
          </div>

          {/* Notes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                      {note.subject}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {note.fileType} • {note.size}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug font-display">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">
                    {note.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>By {note.teacher}</span>
                    <span>{note.date}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => triggerToast(`Downloading "${note.title}"...`)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('summarizer');
                      }}
                      title="Summarize with AI"
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Summarize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI SUMMARIZER */}
      {activeSubTab === 'summarizer' && (
        <AISummarizer />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">Upload Study Material</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Linear Algebra Eigenvector Lecture Notes"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Languages">Languages</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brief Description / Chapter Topics</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Key topics and concepts covered in this document..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Mock upload zone */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-1 bg-slate-50">
                <FileCheck className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag & drop your PDF or notes here</p>
                <p className="text-[10px] text-slate-400">Supports PDF, DOCX, TXT up to 25MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
