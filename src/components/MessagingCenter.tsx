import React, { useState, useEffect, useRef } from 'react';
import { db } from '../InivraDatabase';
import { Message, Conversation, UserProfile } from '../types';
import { 
  Send, Paperclip, Search, CheckCheck, Circle, Image, FileText, 
  UserPlus, MessageSquare, X, Users, GraduationCap, ShieldCheck, 
  School, Check, ArrowLeft
} from 'lucide-react';

interface MessagingCenterProps {
  currentUserId: string;
  onClose?: () => void;
}

export default function MessagingCenter({ currentUserId, onClose }: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messageSearch, setMessageSearch] = useState<string>('');
  const [attachment, setAttachment] = useState<{ name: string; type: string; url?: string } | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [contactSearch, setContactSearch] = useState<string>('');
  const [contactCategory, setContactCategory] = useState<'all' | 'teachers' | 'students' | 'admins'>('all');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = db.getProfile(currentUserId) || {
    id: currentUserId,
    name: 'You',
    role: 'Student',
    avatar: '',
    email: ''
  };

  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      db.markConversationAsRead(activeConvId, currentUserId);
      loadConversations();
    }
  }, [activeConvId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time listener for incoming messages
  useEffect(() => {
    const handleIncomingMessage = (e: any) => {
      const { message, conversationId, recipientId } = e.detail || {};
      if (conversationId === activeConvId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        if (recipientId === currentUserId) {
          db.markConversationAsRead(activeConvId, currentUserId);
        }
      }
      loadConversations();
    };

    const handleMessageRead = (e: any) => {
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    };

    const handleStorageUpdate = () => {
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    };

    window.addEventListener('inivra_message_event', handleIncomingMessage);
    window.addEventListener('inivra_message_read', handleMessageRead);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('inivra_message_event', handleIncomingMessage);
      window.removeEventListener('inivra_message_read', handleMessageRead);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [activeConvId, currentUserId]);

  const loadConversations = () => {
    // Only return conversations where currentUserId is an actual participant
    const list = db.getConversations(currentUserId);
    setConversations(list);
    if (list.length > 0 && !activeConvId) {
      setActiveConvId(list[0].id);
    } else if (list.length === 0) {
      setActiveConvId('');
    }
  };

  const loadMessages = (convId: string) => {
    const list = db.getMessages(convId);
    setMessages(list);
  };

  // Find partner in active conversation
  const getActivePartner = () => {
    const conv = conversations.find(c => c.id === activeConvId);
    if (!conv) return null;
    return conv.participants.find(p => p.id !== currentUserId) || null;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;
    if (!activeConvId) return;

    const partner = getActivePartner();
    if (!partner) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: activeConvId,
      senderId: currentUserId,
      senderName: currentUser?.name || 'You',
      senderAvatar: currentUser?.avatar || '',
      recipientId: partner.id,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      reactions: []
    };

    // Save strictly to real database & Firestore sync
    db.saveMessage(newMsg);
    
    // Update local state immediately for instant responsive UX
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setAttachment(null);
    loadConversations();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('image/') 
      ? 'Image' 
      : file.type.includes('pdf') 
      ? 'PDF' 
      : 'Document';

    setAttachment({
      name: file.name,
      type
    });
  };

  const handleStartConversationWith = (partner: UserProfile) => {
    const convId = db.createConversation(
      partner.id,
      partner.name,
      partner.avatar || '',
      partner.role,
      currentUserId
    );
    setActiveConvId(convId);
    loadConversations();
    setShowNewChatModal(false);
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    const allMsgs = JSON.parse(localStorage.getItem('inivra_messages') || '[]');
    const idx = allMsgs.findIndex((m: any) => m.id === msgId);
    if (idx !== -1) {
      const reactions = allMsgs[idx].reactions || [];
      if (reactions.includes(emoji)) {
        allMsgs[idx].reactions = reactions.filter((r: any) => r !== emoji);
      } else {
        allMsgs[idx].reactions = [...reactions, emoji];
      }
      localStorage.setItem('inivra_messages', JSON.stringify(allMsgs));
    }

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = [...m.reactions];
        return {
          ...m,
          reactions: reactions.includes(emoji) 
            ? reactions.filter(r => r !== emoji) 
            : [...reactions, emoji]
        };
      }
      return m;
    }));
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const partner = c.participants.find(p => p.id !== currentUserId);
    if (!partner) return false;
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const activePartner = getActivePartner();

  // Filter contacts for starting a new real conversation
  const allProfiles = db.getProfiles().filter(p => p.id !== currentUserId);
  const filteredProfiles = allProfiles.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (p.subjects && p.subjects.some(s => s.toLowerCase().includes(contactSearch.toLowerCase())));

    if (!matchSearch) return false;

    if (contactCategory === 'teachers') {
      return p.role === 'Teacher' || p.role === 'Educator';
    }
    if (contactCategory === 'students') {
      return p.role === 'Student';
    }
    if (contactCategory === 'admins') {
      return p.role === 'Admin' || p.role === 'SchoolAdmin';
    }
    return true;
  });

  return (
    <div id="messaging-center" className="grid grid-cols-1 md:grid-cols-12 h-[620px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
      
      {/* Sidebar / Conversation List Column */}
      <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50">
        
        {/* Sidebar Header */}
        <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Direct Messages</h3>
              <p className="text-[11px] text-slate-500 font-medium">Real-time user communication</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowNewChatModal(true)}
                title="Start New Conversation"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
              {onClose && (
                <button 
                  onClick={onClose} 
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-xs focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800">No messages yet</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                  Your conversations with teachers, classmates, and other authorized users will appear here.
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Start a Conversation
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const partner = conv.participants.find(p => p.id !== currentUserId);
              if (!partner) return null;
              const isActive = conv.id === activeConvId;
              const hasUnread = (conv.unreadCount || 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-3 rounded-2xl text-left flex items-start gap-3 transition-all relative ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                      : 'hover:bg-slate-100 border border-transparent bg-white/70'
                  }`}
                >
                  <div className="relative shrink-0">
                    {partner.avatar ? (
                      <img referrerPolicy="no-referrer" src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {partner.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {partner.name}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${hasUnread ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                      {conv.lastMessage || 'Conversation started'}
                    </p>
                  </div>

                  {hasUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="md:col-span-8 flex flex-col h-full bg-slate-50/40">
        {activePartner ? (
          <>
            {/* Active Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activePartner.avatar ? (
                    <img referrerPolicy="no-referrer" src={activePartner.avatar} alt={activePartner.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                      {activePartner.name ? activePartner.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    {activePartner.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {activePartner.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Direct Channel</span>
                  </div>
                </div>
              </div>

              {/* Message Search inside current thread */}
              <div className="relative w-40">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Find text..."
                  value={messageSearch}
                  onChange={e => setMessageSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-100 focus:bg-white text-xs border border-transparent focus:border-blue-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 stroke-1 text-slate-300" />
                  <p className="text-xs font-medium">No messages exchanged yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Send a message to start communicating directly with {activePartner.name}.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : ''}`}>
                      {!isMe && (
                        msg.senderAvatar ? (
                          <img referrerPolicy="no-referrer" src={msg.senderAvatar} alt={msg.senderName} className="w-7 h-7 rounded-full object-cover mt-0.5 border border-slate-200" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] mt-0.5 border border-blue-200 shrink-0">
                            {msg.senderName.charAt(0)}
                          </div>
                        )
                      )}
                      <div className="space-y-1 max-w-[75%]">
                        <div className={`p-3.5 rounded-2xl relative group ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-xs' 
                            : 'bg-white border border-slate-200 rounded-tl-none text-slate-800 shadow-xs'
                        }`}>
                          
                          {/* Content */}
                          {msg.content && (
                            <p className="text-xs font-normal leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}

                          {/* Attachment Display */}
                          {msg.attachmentName && (
                            <div className={`flex items-center gap-2 p-2 mt-2 rounded-xl text-xs ${
                              isMe ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {msg.attachmentType === 'Image' ? <Image className="w-3.5 h-3.5 shrink-0" /> : <FileText className="w-3.5 h-3.5 shrink-0" />}
                              <span className="font-semibold truncate max-w-xs text-[11px]">{msg.attachmentName}</span>
                            </div>
                          )}

                          {/* Reactions Badge */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs text-[10px] text-slate-700">
                              {msg.reactions.map((r, i) => <span key={i}>{r}</span>)}
                            </div>
                          )}

                          {/* Reaction Trigger Panel */}
                          <div className={`absolute top-0 opacity-0 group-hover:opacity-100 flex gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-md z-10 transition-opacity ${
                            isMe ? '-left-24' : '-right-24'
                          }`}>
                            {['👍', '❤️', '👏', '💡'].map(emoji => (
                              <button 
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform p-0.5 text-xs"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timestamp & Read state */}
                        <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 font-mono ${isMe ? 'justify-end' : ''}`}>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Form */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              
              {/* Attachment Preview Bar */}
              {attachment && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2 px-3 rounded-xl text-xs text-blue-700">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold truncate max-w-md">{attachment.name}</span>
                  </div>
                  <button 
                    onClick={() => setAttachment(null)} 
                    className="text-red-500 font-bold hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />

                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach File / Document"
                  className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-colors border border-transparent"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Send direct message to ${activePartner.name}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-100 focus:bg-white text-xs border border-transparent focus:border-blue-500 rounded-xl focus:outline-none transition-all"
                />

                <button 
                  type="submit"
                  disabled={!inputText.trim() && !attachment}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-extrabold text-slate-800 text-sm">No Active Conversation Selected</h4>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Choose an existing conversation from the list, or start a new direct chat with teachers, classmates, or administration.
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Start New Message
            </button>
          </div>
        )}
      </div>

      {/* New Conversation Modal / Contact Picker */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[540px]">
            
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">New Message</h3>
                  <p className="text-[10px] text-slate-500">Select an authorized recipient</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="p-3 border-b space-y-2 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, subject, or email..."
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                {[
                  { key: 'all', label: 'All Contacts' },
                  { key: 'teachers', label: 'Teachers' },
                  { key: 'students', label: 'Students' },
                  { key: 'admins', label: 'Administrators' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setContactCategory(tab.key as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                      contactCategory === tab.key 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts Directory */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredProfiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No contacts found</p>
                  <p className="text-[10px] text-slate-400">Try adjusting your search criteria.</p>
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleStartConversationWith(profile)}
                    className="w-full p-3 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl flex items-center gap-3 transition-all text-left group"
                  >
                    <div className="relative shrink-0">
                      {profile.avatar ? (
                        <img referrerPolicy="no-referrer" src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {profile.name}
                        </h4>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {profile.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {profile.subjects && profile.subjects.length > 0 
                          ? profile.subjects.join(', ')
                          : profile.schoolName || profile.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

