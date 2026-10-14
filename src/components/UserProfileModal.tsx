import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, FileText, Sparkles, Volume2, Shield, Check, Settings, MessageSquare, Eye, EyeOff, Camera, Trash2, GraduationCap, Building2 } from 'lucide-react';
import { UserProfile, EducationLevel } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | undefined;
  onSave: (updated: UserProfile) => void;
}

export default function UserProfileModal({ isOpen, onClose, profile, onSave }: UserProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>('');
  const [gradeYear, setGradeYear] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isIndependent, setIsIndependent] = useState(false);
  const [enableLiveTranscriptions, setEnableLiveTranscriptions] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
      setEducationLevel(profile.educationLevel || 'UpperSecondary');
      setGradeYear(profile.gradeYear || '');
      setSchoolName(profile.schoolName || '');
      setIsIndependent(!!profile.isIndependent);
      setEnableLiveTranscriptions(!!profile.enableLiveTranscriptions);
    }
  }, [profile, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      name,
      email,
      bio,
      avatar,
      educationLevel: (educationLevel as EducationLevel) || undefined,
      gradeYear: gradeYear || undefined,
      schoolName: isIndependent ? 'Independent Learner' : (schoolName || undefined),
      isIndependent,
      enableLiveTranscriptions
    };

    onSave(updatedProfile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="user-profile-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white rounded-[28px] shadow-3xl overflow-hidden border border-slate-150 flex flex-col max-h-[90vh]"
          >
            {/* Upper decorative color block */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 h-2.5 w-full" />

            {/* Header section */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Settings className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-base text-slate-900 tracking-tight font-display">
                    Profile & Preferences
                  </h3>
                  <p className="text-[10px] text-slate-500 font-light">Manage your student credentials & voice configurations</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Form content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative group shrink-0">
                  {avatar ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={avatar}
                      alt="Avatar"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shadow-indigo-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-400">
                      <User className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  )}
                  <label 
                    className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow cursor-pointer transition-colors" 
                    title="Upload profile picture"
                  >
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-800 leading-snug truncate">{profile?.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono tracking-wide truncate">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[8px] rounded-full uppercase tracking-wider font-mono">
                      {profile?.role || 'STUDENT'}
                    </span>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* Email field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800"
                  />
                </div>

                {/* Bio field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Personal Biography
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Describe your learning background or interests..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-slate-800 resize-none"
                  />
                </div>

                {/* EDUCATION LEVEL & STAGE */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                        Education Level & Curriculum
                      </h5>
                      <p className="text-[9px] text-slate-500">Inivra supports learners from primary school through lifelong education</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase font-mono">
                        Current Level
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                      >
                        <option value="Primary">Primary / Elementary School</option>
                        <option value="LowerSecondary">Lower Secondary / Middle School</option>
                        <option value="UpperSecondary">Upper Secondary / High School</option>
                        <option value="Vocational">Vocational & Technical (TVET)</option>
                        <option value="College">College / Foundation</option>
                        <option value="University">University / Higher Education</option>
                        <option value="AdultLearning">Adult & Lifelong Learning</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase font-mono">
                        Grade / Year / Class
                      </label>
                      <input
                        type="text"
                        value={gradeYear}
                        onChange={(e) => setGradeYear(e.target.value)}
                        placeholder="e.g. Grade 5, Year 9, Year 12"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* School or Independent Learner */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase font-mono flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> School / Institution
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-indigo-600 font-semibold">
                        <input
                          type="checkbox"
                          checked={isIndependent}
                          onChange={(e) => setIsIndependent(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        Independent (Not enrolled with a school)
                      </label>
                    </div>
                    {!isIndependent && (
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Oakridge Academy, Lincoln Public School"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ACCESSIBILITY SECTION - CUSTOM ACCESSIBILITY PREFERENCE TOGGLE */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/50 via-blue-50/20 to-indigo-50/30 rounded-2xl border border-indigo-100/80 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-indigo-900 uppercase font-mono tracking-wider">
                      AI Companion Settings
                    </h5>
                    <p className="text-[9px] text-indigo-600/80 font-light">Configure voice interaction interfaces</p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 pt-1">
                  <div className="space-y-1 max-w-[75%]">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      Enable Live Voice Transcriptions
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal font-light">
                      When enabled, Ini displays live text transcriptions of your speech and her replies during voice interactions.
                    </p>
                    <p className="text-[9px] text-indigo-600 font-mono font-medium">
                      By default, Ini operates in purely voice-only mode without any text, chat bubbles, or logs.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setEnableLiveTranscriptions(!enableLiveTranscriptions)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enableLiveTranscriptions ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enableLiveTranscriptions ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save message or footer actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" /> Saved Successfully!
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
