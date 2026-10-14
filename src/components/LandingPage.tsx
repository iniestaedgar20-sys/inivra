import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div 
      id="get-started-screen" 
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden font-sans select-none"
    >
      {/* Full Background Image */}
      <div id="get-started-bg-image" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
          alt="studyHUB-inivra learn background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Dark translucent overlay for maximum legibility and sleek contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/80 backdrop-blur-[2px]" />
      </div>

      {/* Subtle radial glow radiating from center */}
      <div 
        id="bg-glow"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,transparent_70%)] pointer-events-none z-1" 
      />

      {/* Spacing element to push content down for perfect vertical centring */}
      <div className="h-2" />

      {/* Main Centred Content Container with Frosted Glass Aesthetics */}
      <div 
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full relative z-10 space-y-6 sm:space-y-7 animate-in fade-in duration-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 p-7 sm:p-10 rounded-3xl shadow-2xl shadow-black/40 my-auto"
      >
        {/* Prominent Inivra Learn Logo (approx 120-150px wide) */}
        <div id="logo-container" className="w-[130px] sm:w-[140px] flex items-center justify-center transition-all duration-500 hover:scale-105">
          <img 
            id="logo-img"
            src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
            alt="studyHUB-inivra learn"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain drop-shadow-xl rounded-2xl border border-white/50"
          />
        </div>

        {/* Brand/Platform Name */}
        <div id="brand-info" className="space-y-2">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-tight font-sans">
            studyHUB<span className="text-[#2563EB] dark:text-blue-400 font-bold block text-lg sm:text-xl mt-0.5 tracking-wider uppercase">-inivra learn</span>
          </h1>
          {/* Welcome Message */}
          <p className="text-sm font-medium text-[#475569] dark:text-slate-300 max-w-[320px] mx-auto leading-relaxed">
            Empowering students and teachers through smarter digital learning.
          </p>
        </div>

        {/* Action Button & Link Section */}
        <div id="actions-container" className="w-full flex flex-col items-center gap-4 pt-2">
          {/* Main Royal Blue Get Started Button */}
          <button 
            id="get-started-btn"
            onClick={onGetStarted}
            className="w-full max-w-[260px] h-[54px] sm:h-[56px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[14px] text-[17px] sm:text-[18px] font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center cursor-pointer select-none border border-blue-400/30 outline-none hover:scale-[1.03]"
          >
            Get Started
          </button>

          {/* Already have an account text & Sign In link */}
          <p id="auth-switch-text" className="text-xs text-[#64748B] dark:text-slate-300 font-medium tracking-wide flex items-center gap-1">
            Already have an account?{' '}
            <button 
              id="sign-in-link-btn"
              onClick={onSignIn}
              className="text-[#2563EB] dark:text-blue-400 font-bold hover:underline cursor-pointer bg-transparent border-none p-0 outline-none hover:text-[#1D4ED8]"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Subtle Bottom Footer */}
      <footer 
        id="started-footer"
        className="w-full text-center py-4 text-[11px] text-slate-300/80 font-medium tracking-wide relative z-10 animate-in fade-in duration-1000 delay-300 drop-shadow"
      >
        © 2026 Inivra Learn. All Rights Reserved.
      </footer>
    </div>
  );
}
