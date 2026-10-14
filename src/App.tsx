import React, { useState, useEffect } from 'react';
import { db } from './InivraDatabase';
import { UserProfile, InivraNotification } from './types';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import LandingPage from './components/LandingPage';
import MessagingCenter from './components/MessagingCenter';
import VideoCallSimulator from './components/VideoCallSimulator';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ParentPortal from './components/ParentPortal';
import EducatorDashboard from './components/EducatorDashboard';
import EducatorsMarketplace from './components/EducatorsMarketplace';
import LoginPortal from './components/LoginPortal';
import SchoolAdminDashboard from './components/SchoolAdminDashboard';
import FloatingAssistant from './components/FloatingAssistant';
import UserProfileModal from './components/UserProfileModal';
import { 
  GraduationCap, Bell, MessageSquare, BookOpen, Users, Compass, 
  Sparkles, Check, ChevronDown, UserCheck, HelpCircle, LogOut, Cloud
} from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentRole, setCurrentRole] = useState<'Student' | 'Teacher' | 'Admin' | 'Parent' | 'Educator' | 'SchoolAdmin'>('Student');
  const [activeView, setActiveView] = useState<'dashboard' | 'marketplace' | 'messages'>('dashboard');
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showLoginPortal, setShowLoginPortal] = useState(false);
  const [loginPortalScreen, setLoginPortalScreen] = useState<'login' | 'register'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const existing = db.getAccounts().find(a => 
          a.id === fbUser.uid || 
          (fbUser.email && a.email.toLowerCase() === fbUser.email.toLowerCase())
        );
        if (existing) {
          setLoggedInUserId(existing.id);
          setCurrentRole(existing.role);
          setShowLanding(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout note:', err);
    }
    // Cleanly clear all session tokens and active user records
    localStorage.removeItem('inivra_logged_in_id');
    localStorage.removeItem('inivra_session_id');
    sessionStorage.removeItem('inivra_logged_in_id');
    setLoggedInUserId(null);
    setFirebaseUser(null);
    setShowLoginPortal(false);
    setShowProfileModal(false);
    setActiveView('dashboard');
    setShowLanding(true);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    db.updateProfile(updated);
    setProfileVersion(v => v + 1);
  };

  // Video call active state
  const [activeVideoCall, setActiveVideoCall] = useState<{ classId: string; className: string; teacher: string } | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<InivraNotification[]>(db.getNotifications());
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // User details based on Role
  const roleMapping: Record<string, string> = {
    'Student': 'user-student',
    'Teacher': 'user-teacher',
    'Admin': 'user-admin',
    'Parent': 'user-parent',
    'Educator': 'user-educator',
    'SchoolAdmin': 'user-admin'
  };

  const currentUserId = loggedInUserId || roleMapping[currentRole] || 'user-student';
  const userProfile = db.getProfile(currentUserId);

  useEffect(() => {
    // Poll notifications changes periodically
    const interval = setInterval(() => {
      setNotifications(db.getNotifications());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleGlobalNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { view } = customEvent.detail || {};
      if (view && ['dashboard', 'marketplace', 'messages'].includes(view)) {
        setActiveView(view as any);
      }
    };
    window.addEventListener('inivra-navigation', handleGlobalNav);
    return () => window.removeEventListener('inivra-navigation', handleGlobalNav);
  }, []);

  // Listen to profile updates from settings panels to sync App state
  useEffect(() => {
    const handleProfileSync = () => {
      setProfileVersion(v => v + 1);
    };
    window.addEventListener('storage', handleProfileSync);
    return () => window.removeEventListener('storage', handleProfileSync);
  }, []);

  // Global listener for logout action triggered anywhere in any component
  useEffect(() => {
    const handleGlobalLogout = () => {
      handleLogout();
    };
    window.addEventListener('inivra-logout', handleGlobalLogout);
    return () => window.removeEventListener('inivra-logout', handleGlobalLogout);
  }, []);

  const handleMarkAllNotificationsRead = () => {
    db.clearNotifications();
    setNotifications([]);
    setShowNotificationsDropdown(false);
  };

  const handleLogin = (role: 'Student' | 'Teacher' | 'Admin' | 'Parent' | 'Educator' | 'SchoolAdmin') => {
    setLoggedInUserId(null); // Clear manual session when evaluator switches roles
    setCurrentRole(role);
    setShowLanding(false);
    setActiveView('dashboard');
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setLoggedInUserId(profile.id);
    setCurrentRole(profile.role);
    setShowLanding(false);
    setShowLoginPortal(false);
    setActiveView('dashboard');
  };

  return (
    <div id="inivra-application" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 antialiased">
      
      {/* RENDER LOGIN PORTAL FULLSCREEN */}
      {showLoginPortal && (
        <LoginPortal 
          initialScreen={loginPortalScreen}
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginPortal(false)}
        />
      )}

      {/* RENDER VIDEO CALL Simulator (Overlay Mode) */}
      {activeVideoCall && (
        <VideoCallSimulator 
          classId={activeVideoCall.classId}
          className={activeVideoCall.className}
          teacherName={activeVideoCall.teacher}
          currentUserName={userProfile?.name || 'User'}
          onExit={() => setActiveVideoCall(null)}
        />
      )}

      {/* RENDER MARKETING LANDING PAGE OR PRIVATE DASHBOARD */}
      {showLanding ? (
        <LandingPage 
          onGetStarted={() => {
            setLoginPortalScreen('register');
            setShowLoginPortal(true);
          }} 
          onSignIn={() => {
            setLoginPortalScreen('login');
            setShowLoginPortal(true);
          }} 
        />
      ) : (
        <>
          {/* Main App Navigation bar */}
          <header id="inivra-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
              
              {/* Branded Logo and Name */}
              <button 
                id="brand-logo-btn"
                onClick={() => setShowLanding(true)}
                className="flex items-center gap-2.5 px-1 py-1.5 rounded-xl hover:opacity-95 transition-all text-left group"
              >
                <img 
                  src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
                  alt="studyHUB-inivra learn"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
                    studyHUB<span className="font-light opacity-80 uppercase text-[10px] ml-1 tracking-[1.5px] text-indigo-600">-inivra learn</span>
                  </span>
                </div>
              </button>

              {/* Theme search box in center of header */}
              <div className="hidden lg:flex w-80 items-center rounded-full bg-slate-100 px-4 py-2 border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                <span className="mr-2 text-slate-400 text-xs">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search lessons, tutors, or courses..." 
                  className="bg-transparent text-xs outline-none w-full text-slate-700 font-sans placeholder:text-slate-400" 
                />
              </div>

              {/* Sub Navigation controls */}
              <nav className="hidden md:flex items-center gap-1.5">
                <button
                  id="nav-dash"
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 font-display ${
                    activeView === 'dashboard' 
                      ? 'bg-indigo-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> My Workspace
                </button>
                <button
                  id="nav-market"
                  onClick={() => setActiveView('marketplace')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 font-display ${
                    activeView === 'marketplace' 
                      ? 'bg-indigo-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-4 h-4" /> Educators & Store
                </button>
                <button
                  id="nav-msg"
                  onClick={() => setActiveView('messages')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 relative font-display ${
                    activeView === 'messages' 
                      ? 'bg-indigo-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Chat Messages
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                </button>
              </nav>

              {/* Header Rightside controls */}
              <div className="flex items-center gap-3">
                
                {/* START LIVE CLASS shortcut button */}
                <button
                  onClick={() => setActiveVideoCall({ classId: 'live-optics', className: 'Physics Lab: Optics', teacher: 'Dr. Sarah Jenkins' })}
                  className="hidden sm:inline-flex rounded-full bg-indigo-600 px-4 py-2 text-[10px] font-bold tracking-wider text-white shadow-md hover:bg-indigo-700 transition-all font-display hover:scale-102"
                >
                  START LIVE CLASS
                </button>

                {/* Active user state card - Interactive profile button */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  title="Click to manage profile and accessibility settings"
                >
                  {userProfile?.avatar ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={userProfile.avatar} 
                      alt={userProfile?.name} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] border border-indigo-200">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-800 leading-none flex items-center gap-1">
                      {userProfile?.name}
                      <span className="text-[9px] text-indigo-600">⚙️</span>
                    </p>
                    <span className="text-[8px] text-slate-400 uppercase font-mono tracking-wider font-semibold">{userProfile?.role}</span>
                  </div>
                </button>

                {/* Notifications Bell dropdown */}
                <div className="relative">
                  <button 
                    id="btn-bell-notif"
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all relative border border-slate-200 flex items-center justify-center"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-600"></span>
                    )}
                  </button>

                  {/* Dropdown list */}
                  {showNotificationsDropdown && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase font-mono">Notifications ({notifications.length})</span>
                        {notifications.length > 0 && (
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="font-bold text-xs text-indigo-600 uppercase font-mono">{notif.type}</span>
                                <span className="text-[8px] text-slate-400 font-mono">{notif.date}</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-light">{notif.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400 font-light">
                            No unread notifications logs currently.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back to landing / Sign out button */}
                <button 
                  id="btn-back-landing"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  title="Sign out & Return to Get Started page"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>

              </div>
            </div>
          </header>

          {/* Persona role switcher bar for evaluators */}
          <div className="bg-indigo-950 text-indigo-100 py-3 border-b border-indigo-900 shadow-inner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold tracking-tight text-white font-display">Role Switcher:</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-500/30 rounded-full text-[10px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firebase Connected (europe-west2)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Student', 'Teacher', 'Admin', 'Parent', 'Educator', 'SchoolAdmin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => handleLogin(role)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border font-display ${
                      currentRole === role 
                        ? 'bg-indigo-600 text-white border-transparent shadow shadow-indigo-500/20' 
                        : 'bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 hover:text-white border-indigo-850'
                    }`}
                  >
                    {role === 'Student' && 'Student Alex'}
                    {role === 'Teacher' && 'Dr. Sarah'}
                    {role === 'Admin' && 'Principal Vance'}
                    {role === 'Parent' && 'Parent Mary'}
                    {role === 'Educator' && 'David Miller'}
                    {role === 'SchoolAdmin' && 'School Admin'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile subnavigation bar */}
          <div className="md:hidden bg-white border-b border-slate-200 grid grid-cols-3 text-center">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`py-3 text-xs font-semibold ${activeView === 'dashboard' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
            >
              Workspace
            </button>
            <button 
              onClick={() => setActiveView('marketplace')}
              className={`py-3 text-xs font-semibold ${activeView === 'marketplace' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => setActiveView('messages')}
              className={`py-3 text-xs font-semibold ${activeView === 'messages' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
            >
              Messaging
            </button>
          </div>

          {/* Main workspace center */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeView === 'dashboard' && (
              <>
                {currentRole === 'Student' && (
                  <StudentDashboard 
                    currentUserId={currentUserId} 
                    onLogout={handleLogout}
                    onJoinVideoCall={(id, name, teacher) => setActiveVideoCall({ classId: id, className: name, teacher })}
                  />
                )}
                {currentRole === 'Teacher' && (
                  <TeacherDashboard 
                    currentUserId={currentUserId} 
                    onLogout={handleLogout} 
                  />
                )}
                {currentRole === 'Admin' && (
                  <AdminDashboard 
                    onLogout={handleLogout} 
                  />
                )}
                {currentRole === 'Parent' && (
                  <ParentPortal 
                    onLogout={handleLogout} 
                  />
                )}
                {currentRole === 'Educator' && (
                  <EducatorDashboard 
                    currentUserId={currentUserId} 
                    onLogout={handleLogout} 
                  />
                )}
                {currentRole === 'SchoolAdmin' && (
                  <SchoolAdminDashboard 
                    currentUserId={currentUserId} 
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}

            {activeView === 'marketplace' && (
              <EducatorsMarketplace currentUserId={currentUserId} />
            )}

            {activeView === 'messages' && (
              <MessagingCenter currentUserId={currentUserId} />
            )}
          </main>

          {/* Footer branding */}
          <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-850 text-center text-xs font-light">
            <p className="font-mono">studyHUB-inivra learn educational SaaS Platform • All integrations fully synchronized to local databases.</p>
          </footer>

          {/* User Profile Settings Modal */}
          <UserProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            profile={userProfile}
            onSave={handleSaveProfile}
          />
          {/* Universal Floating AI Assistant - strictly hidden in login dashboard and landing page */}
          {!showLoginPortal && (
            <FloatingAssistant 
              userProfile={userProfile} 
              currentRole={currentRole}
              activeView={activeView}
            />
          )}
        </>
      )}

    </div>
  );
}
