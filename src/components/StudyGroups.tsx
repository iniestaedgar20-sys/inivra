import React, { useState } from 'react';
import { 
  Users, Search, Plus, MessageSquare, Video, FileText, 
  Calendar, Clock, CheckCircle2, Send, Sparkles, X, Share2, Shield
} from 'lucide-react';

interface GroupMessage {
  id: string;
  sender: string;
  senderRole: string;
  time: string;
  text: string;
  isSelf?: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  topic: string;
  description: string;
  membersCount: number;
  maxMembers: number;
  nextSession: string;
  status: 'Live Now' | 'Scheduled' | 'Inactive';
  members: { name: string; role: string; isOnline: boolean }[];
  notes: string;
  messages: GroupMessage[];
}

const INITIAL_GROUPS: StudyGroup[] = [
  {
    id: 'grp-1',
    name: 'Calculus & Linear Algebra Squad',
    subject: 'Mathematics',
    topic: 'Differential Equations & Matrix Transformations',
    description: 'Weekly collaborative problem-solving group tackling advanced calculus problem sets, derivative tests, and linear algebra matrices.',
    membersCount: 6,
    maxMembers: 8,
    nextSession: 'Today at 5:00 PM',
    status: 'Live Now',
    members: [
      { name: 'Alex Johnson', role: 'Group Leader', isOnline: true },
      { name: 'Sophia Chen', role: 'Member', isOnline: true },
      { name: 'Marcus Bell', role: 'Member', isOnline: true },
      { name: 'Elena Rostova', role: 'Member', isOnline: false },
      { name: 'David Kim', role: 'Member', isOnline: false }
    ],
    notes: 'Key formulas to review:\n1. Integration by parts: ∫u dv = uv - ∫v du\n2. Determinant of 2x2 matrix: det(A) = ad - bc\n3. Eigenvalue equation: det(A - λI) = 0',
    messages: [
      { id: 'm1', sender: 'Sophia Chen', senderRole: 'Student', time: '4:45 PM', text: 'Hey everyone! Has anyone solved Problem 4 on page 142?' },
      { id: 'm2', sender: 'Alex Johnson', senderRole: 'Student', time: '4:47 PM', text: 'Yes! You have to substitute u = sin(x) first, then it simplifies cleanly.' },
      { id: 'm3', sender: 'Marcus Bell', senderRole: 'Student', time: '4:52 PM', text: 'Awesome, thanks Alex! Let us jump into the virtual room at 5.' }
    ]
  },
  {
    id: 'grp-2',
    name: 'AP Physics 1 Mechanics Lab',
    subject: 'Physics',
    topic: 'Rotational Dynamics & Torque Equilibriums',
    description: 'Deep dive into Newtonian mechanics, rotational momentum, and lab simulation data analysis.',
    membersCount: 4,
    maxMembers: 6,
    nextSession: 'Tomorrow at 4:30 PM',
    status: 'Scheduled',
    members: [
      { name: 'Liam O\'Connor', role: 'Group Leader', isOnline: true },
      { name: 'Alex Johnson', role: 'Member', isOnline: true },
      { name: 'Chloe Martin', role: 'Member', isOnline: false },
      { name: 'Zack Patel', role: 'Member', isOnline: false }
    ],
    notes: '• Torque equation: τ = rF sin(θ)\n• Rotational kinetic energy: K = 1/2 I ω²\n• Conservation of angular momentum holds when external net torque = 0',
    messages: [
      { id: 'p1', sender: 'Liam O\'Connor', senderRole: 'Student', time: 'Yesterday', text: 'Reminder: bring your lab notebook readings for tomorrow session!' }
    ]
  },
  {
    id: 'grp-3',
    name: 'Polyglot Spanish & French Exchange',
    subject: 'Languages',
    topic: 'Conversational Fluency & Subjunctive Mood',
    description: 'Practice real conversational speaking drills with peers and Ini AI language coach prompts.',
    membersCount: 8,
    maxMembers: 10,
    nextSession: 'Thursday at 6:00 PM',
    status: 'Scheduled',
    members: [
      { name: 'Maria Santos', role: 'Group Leader', isOnline: true },
      { name: 'Jean-Luc Dubois', role: 'Co-Host', isOnline: true },
      { name: 'Alex Johnson', role: 'Member', isOnline: true },
      { name: 'Emma Wilson', role: 'Member', isOnline: false }
    ],
    notes: 'Spanish subjunctive triggers:\n• WEIRDO: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt, Ojalá.\nFrench: il faut que + subjonctif.',
    messages: [
      { id: 'l1', sender: 'Maria Santos', senderRole: 'Student', time: '2 days ago', text: '¡Hola a todos! Let us practice 15 minutes of pure Spanish next call.' }
    ]
  },
  {
    id: 'grp-4',
    name: 'Python & Web Algorithms Club',
    subject: 'Computer Science',
    topic: 'Data Structures, Binary Trees & Sorting',
    description: 'Weekly coding challenge review, LeetCode style problems, and full-stack project building.',
    membersCount: 5,
    maxMembers: 8,
    nextSession: 'Friday at 3:00 PM',
    status: 'Scheduled',
    members: [
      { name: 'Devon Lee', role: 'Group Leader', isOnline: true },
      { name: 'Aisha Kahn', role: 'Member', isOnline: true },
      { name: 'Alex Johnson', role: 'Member', isOnline: true }
    ],
    notes: 'Time Complexities to remember:\n• Binary Search: O(log n)\n• QuickSort average: O(n log n)\n• Hash Table lookup: O(1)',
    messages: [
      { id: 'c1', sender: 'Devon Lee', senderRole: 'Student', time: '3 days ago', text: 'Reviewing graph traversals (BFS vs DFS) this Friday!' }
    ]
  }
];

export default function StudyGroups({ 
  currentUserName, 
  onLaunchVirtualRoom 
}: { 
  currentUserName: string; 
  onLaunchVirtualRoom?: () => void;
}) {
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('grp-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New group form
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTopic, setNewTopic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  // Active chat state
  const [chatInput, setChatInput] = useState('');
  const [activeNotes, setActiveNotes] = useState<string>('');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || g.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedGroup) return;

    const newMessage: GroupMessage = {
      id: 'msg-' + Date.now(),
      sender: currentUserName || 'You',
      senderRole: 'Student',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatInput.trim(),
      isSelf: true
    };

    setGroups(prev => prev.map(g => {
      if (g.id === selectedGroup.id) {
        return {
          ...g,
          messages: [...g.messages, newMessage]
        };
      }
      return g;
    }));

    setChatInput('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroup = {
      id: 'grp-' + Date.now(),
      name: newGroupName.trim(),
      subject: newSubject,
      topic: newTopic.trim() || 'General Academic Exploration',
      description: newDesc.trim() || 'Collaborative student study circle on Inivra Learn.',
      membersCount: 1,
      maxMembers: 8,
      nextSession: newSchedule.trim() || 'Weekly Scheduled Session',
      status: 'Scheduled',
      members: [
        { name: currentUserName || 'You', role: 'Group Leader', isOnline: true }
      ],
      notes: 'Study notes will be documented here by group members.',
      messages: [
        {
          id: 'welcome-msg',
          sender: 'System',
          senderRole: 'Inivra Learn',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Welcome to ${newGroupName.trim()}! Study collaboratively and achieve academic excellence.`
        }
      ]
    };

    setGroups([newGroup, ...groups]);
    setSelectedGroupId(newGroup.id);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewTopic('');
    setNewDesc('');
    setNewSchedule('');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Study Groups & Peer Collaboration</h2>
          </div>
          <p className="text-xs text-slate-500 font-light max-w-xl">
            Join or establish focused peer study circles. Collaborate in real-time, share curated class notes, and launch live video study sessions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Study Group
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Groups List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Subject Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search groups, subjects, or topics..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Subject Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {['All', 'Mathematics', 'Physics', 'Languages', 'Computer Science'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Scrollable List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredGroups.map(group => {
              const isSelected = group.id === selectedGroupId;
              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {group.subject}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      group.status === 'Live Now'
                        ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${group.status === 'Live Now' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {group.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1">{group.name}</h3>
                  <p className="text-xs text-slate-500 font-light line-clamp-2 mb-3">{group.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {group.membersCount}/{group.maxMembers} Students
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {group.nextSession}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Group Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {selectedGroup && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              
              {/* Active Group Header */}
              <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
                      {selectedGroup.subject}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">{selectedGroup.topic}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-display">{selectedGroup.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onLaunchVirtualRoom) {
                        onLaunchVirtualRoom();
                      } else {
                        alert('Launching virtual collaboration room for ' + selectedGroup.name);
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" /> Start / Join Virtual Call
                  </button>
                </div>
              </div>

              {/* Members Roster Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Group Members:</span>
                  <div className="flex -space-x-2">
                    {selectedGroup.members.map((m, idx) => (
                      <div
                        key={idx}
                        title={`${m.name} (${m.role}) - ${m.isOnline ? 'Online' : 'Offline'}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white relative shadow-2xs ${
                          idx % 3 === 0 ? 'bg-blue-600' : idx % 3 === 1 ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}
                      >
                        {m.name.charAt(0)}
                        {m.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-white" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedGroup.members.filter(m => m.isOnline).length} active now
                </span>
              </div>

              {/* Shared Group Notes Scratchpad */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-display">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Collaborative Study Notes & Key Formulas
                  </span>
                  {isSavedNotes && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved to Study Hub
                    </span>
                  )}
                </div>
                <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-3.5 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedGroup.notes}
                </div>
              </div>

              {/* Group Discussion Feed */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-display">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Study Group Discussion Feed
                </span>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 h-64 overflow-y-auto space-y-3">
                  {selectedGroup.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{msg.sender}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className={`px-3.5 py-2 rounded-2xl text-xs max-w-sm ${
                        msg.isSelf 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input Box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Share a thought, formula, or question with the group..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Create Study Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-lg text-slate-900 font-display">Create Peer Study Group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Study Group Title</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="e.g. Organic Chemistry Problem Solvers"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Languages">Languages</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Meeting Schedule</label>
                  <input
                    type="text"
                    value={newSchedule}
                    onChange={e => setNewSchedule(e.target.value)}
                    placeholder="e.g. Tuesdays at 4:00 PM"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specific Topic or Exam Target</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Midterm Chapter 4 Review & Practice Problems"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Group Description & Collaboration Goals</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Briefly explain what group members will collaborate on and practice..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  Launch Study Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
