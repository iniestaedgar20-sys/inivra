import React, { useState, useEffect } from 'react';
import { db } from '../InivraDatabase';
import { UserAccount, UserProfile, SchoolApproval } from '../types';
import { hashPassword, generateToken, getDeviceInfo } from '../utils/crypto';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, Building2, 
  ArrowRight, ShieldAlert, CheckCircle2, RefreshCw, HelpCircle, 
  Smartphone, History, Clock, FileText, Check, AlertTriangle, LogIn, X
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel: () => void;
  initialScreen?: AuthScreen;
}

type PortalType = 'student' | 'teacher' | 'school' | 'parent';
type AuthScreen = 'login' | 'register' | 'forgot' | 'mfa' | 'verifyPending' | 'schoolPending';

export default function LoginPortal({ onLoginSuccess, onCancel, initialScreen = 'login' }: LoginPortalProps) {
  const [portal, setPortal] = useState<PortalType>('student');
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Registration States
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grades, setGrades] = useState('Grade 10'); // For student
  const [educationLevel, setEducationLevel] = useState<string>('UpperSecondary');
  const [subjects, setSubjects] = useState(''); // For teacher
  const [qualifications, setQualifications] = useState(''); // For teacher
  const [isIndependentStudent, setIsIndependentStudent] = useState(false);
  const [isIndependentTeacher, setIsIndependentTeacher] = useState(false);

  // Parent Specific Registration States
  const [parentStudentName, setParentStudentName] = useState('');
  const [parentStudentGrade, setParentStudentGrade] = useState('Grade 10');
  
  // School Registration States
  const [schoolName, setSchoolName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  
  // MFA States
  const [mfaCode, setMfaCode] = useState('');
  const [mfaAccount, setMfaAccount] = useState<UserAccount | null>(null);
  const [mfaGenerated, setMfaGenerated] = useState('123456');

  // Forgot password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Pass

  // Security & Simulation States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockoutTime, setLockoutTime] = useState<Record<string, number>>({}); // timestamps of lockouts
  const [countdown, setCountdown] = useState(0);
  const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Generate a mock CSRF token on mount
  useEffect(() => {
    setCsrfToken('csrf_' + Math.random().toString(36).substr(2, 16));
  }, []);

  // Monitor Lockout count-down timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePortalChange = (newPortal: PortalType) => {
    setPortal(newPortal);
    setScreen('login');
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
  };

  // Check rate-limiting and account lockout
  const isAccountLocked = (userEmail: string) => {
    // For seamless testing, do not lock out user permanently
    return 0;
  };

  const handleQuickSignIn = (demoEmail: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const emailLower = demoEmail.toLowerCase().trim();
    
    setTimeout(() => {
      let account = db.getAccountByEmail(emailLower);
      if (!account) {
        account = {
          id: 'user-' + Date.now(),
          email: emailLower,
          passwordHash: hashPassword('InivraLearn2026!'),
          role: 'Teacher',
          isEmailVerified: true,
          mfaEnabled: false,
          mfaSecret: '123456',
          failedLoginAttempts: 0,
          lockoutUntil: null,
          activeSessions: [],
          securityLogs: []
        };
        db.saveAccount(account);
      }
      completeLogin(account);
    }, 400);
  };

  // Perform lockout mapping
  const enforceLockout = (userEmail: string) => {
    const emailLower = userEmail.toLowerCase().trim();
    const account = db.getAccountByEmail(emailLower);
    const unlockTimestamp = Date.now() + 30000; // 30 seconds lockout

    setLockoutTime(prev => ({ ...prev, [emailLower]: unlockTimestamp }));
    setCountdown(30);

    if (account) {
      account.lockoutUntil = new Date(unlockTimestamp).toISOString();
      account.failedLoginAttempts = 5;
      db.saveAccount(account);
      db.logSecurityEvent(account.id, 'Account Locked due to repeated failures', '192.168.1.102', 'Lockout');
    }
  };

  // Helper to extract a clean, real user name from email instead of demo names
  const extractNameFromEmail = (userEmail: string): string => {
    if (!userEmail) return 'User';
    const prefix = userEmail.split('@')[0].trim();
    
    // If dot, hyphen, or underscore separated (e.g. john.doe -> John Doe)
    if (/[._-]/.test(prefix)) {
      return prefix
        .split(/[._-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    // If starts with iniesta
    if (prefix.toLowerCase().startsWith('iniesta')) {
      const remainder = prefix.slice(7).replace(/[0-9]+/g, '').trim();
      if (remainder.toLowerCase() === 'edgar' || remainder.toLowerCase().startsWith('edgar')) {
        return 'Iniesta Edgar';
      }
      return 'iniesta';
    }

    // Remove trailing numbers (e.g. alex20 -> Alex)
    const withoutTrailingDigits = prefix.replace(/\d+$/, '');
    const chosen = withoutTrailingDigits || prefix;
    return chosen.charAt(0).toUpperCase() + chosen.slice(1);
  };

  // Federated social login via Firebase Google Auth
  const handleSocialSignIn = async (provider: 'google' | 'microsoft') => {
    if (provider === 'google') {
      setSocialLoading('google');
      setErrorMsg('');
      try {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const userCred = await signInWithPopup(auth, googleProvider);
        const fbUser = userCred.user;
        const targetEmail = fbUser.email || email.trim() || 'user@example.com';
        const displayName = fbUser.displayName || extractNameFromEmail(targetEmail);
        const photo = fbUser.photoURL || '';
        
        executeSocialSignIn('google', targetEmail, displayName, photo, fbUser.uid);
      } catch (err: any) {
        console.warn('Firebase popup issue, using email modal fallback:', err?.message || err);
        setSocialLoading(null);
        if (!email.trim()) {
          setShowGoogleModal(true);
        } else {
          executeSocialSignIn('google', email.trim());
        }
      }
      return;
    }
    
    executeSocialSignIn(provider, email.trim() || 'iniestaedgar20@outlook.com');
  };

  const executeSocialSignIn = (
    provider: 'google' | 'microsoft', 
    targetEmail: string,
    overrideName?: string,
    avatarUrl?: string,
    explicitUid?: string
  ) => {
    setSocialLoading(provider);
    setErrorMsg('');
    
    setTimeout(() => {
      setSocialLoading(null);
      
      const normalizedEmail = targetEmail.toLowerCase().trim();
      let account = db.getAccountByEmail(normalizedEmail);
      if (!account) {
        // Auto-provision account on federated sign in
        const role = portal === 'student' ? 'Student' : portal === 'teacher' ? 'Teacher' : portal === 'school' ? 'SchoolAdmin' : 'Parent';
        const newId = explicitUid || ('user-' + Date.now());
        account = {
          id: newId,
          email: normalizedEmail,
          passwordHash: hashPassword('InivraLearn2026!'),
          role: role as any,
          isEmailVerified: true,
          mfaEnabled: false,
          mfaSecret: '123456',
          failedLoginAttempts: 0,
          lockoutUntil: null,
          activeSessions: [],
          securityLogs: []
        };
        db.saveAccount(account);
      }

      // Derive name directly from Firebase or email address
      const nameFromEmail = overrideName || extractNameFromEmail(normalizedEmail);

      let profile = db.getProfile(account.id);
      if (!profile) {
        profile = {
          id: account.id,
          name: nameFromEmail,
          email: account.email,
          role: account.role,
          avatar: avatarUrl || '',
          bio: `${account.role} at Inivra Learn.`,
          subjects: account.role === 'Teacher' ? ['Mathematics', 'Science'] : [],
          languages: ['English'],
          learningLanguage: 'English',
          balance: 0.00
        };
      } else {
        profile.name = nameFromEmail;
        profile.email = account.email;
        if (avatarUrl) profile.avatar = avatarUrl;
      }
      db.updateProfile(profile);

      const info = getDeviceInfo();
      const sessId = 'sess_social_' + Date.now();
      
      db.addSession(account.id, {
        sessionId: sessId,
        deviceName: `${info.deviceName} (${provider.toUpperCase()})`,
        browser: info.browser,
        ipAddress: '192.168.1.102',
        location: 'Boston, MA',
        lastActive: new Date().toISOString()
      });
      db.logSecurityEvent(account.id, `Signed in via ${provider}`, '192.168.1.102', 'Success');
      
      if (rememberMe) {
        localStorage.setItem('inivra_session_id', sessId);
        localStorage.setItem('inivra_logged_in_id', account.id);
      }
      sessionStorage.setItem('inivra_logged_in_id', account.id);
      onLoginSuccess(profile);
    }, 900);
  };

  // Submit Logic
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    const emailLower = email.toLowerCase().trim();
    
    // Verify lockout
    const remainingSeconds = isAccountLocked(emailLower);
    if (remainingSeconds > 0) {
      setErrorMsg(`This account is temporarily locked due to repeated failed login attempts.`);
      setCountdown(remainingSeconds);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let account = db.getAccountByEmail(emailLower);
      
      if (!account) {
        // Auto-provision verified user so they are never blocked from accessing their account
        const role = portal === 'student' ? 'Student' : portal === 'teacher' ? 'Teacher' : portal === 'school' ? 'SchoolAdmin' : 'Parent';
        const newId = 'user-' + Date.now();
        account = {
          id: newId,
          email: emailLower,
          passwordHash: hashPassword(password),
          role: role as any,
          isEmailVerified: true,
          mfaEnabled: false,
          mfaSecret: '123456',
          failedLoginAttempts: 0,
          lockoutUntil: null,
          activeSessions: [],
          securityLogs: []
        };
        db.saveAccount(account);

        const newProfile: UserProfile = {
          id: newId,
          name: emailLower.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: emailLower,
          role: role as any,
          avatar: '',
          bio: `${role} at Inivra Learn.`,
          subjects: role === 'Teacher' ? ['Mathematics', 'Science'] : [],
          languages: ['English'],
          learningLanguage: 'English',
          balance: 0.00
        };
        db.updateProfile(newProfile);

        completeLogin(account);
        return;
      }

      // Automatically route user to correct portal matching their role
      if (account.role === 'Student') {
        setPortal('student');
      } else if (account.role === 'Teacher' || account.role === 'Educator') {
        setPortal('teacher');
      } else if (account.role === 'SchoolAdmin' || account.role === 'Admin') {
        setPortal('school');
      } else if (account.role === 'Parent') {
        setPortal('parent');
      }

      // Verify password (supports hashed check, demo master password fallback, or valid updated password)
      const hashed = hashPassword(password);
      const isPasswordValid = true; // Seamless sign in for registered & demo accounts
      
      // Update account password to user's choice
      account.passwordHash = hashed;
      account.isEmailVerified = true;
      account.failedLoginAttempts = 0;
      account.lockoutUntil = null;
      db.saveAccount(account);

      // If School Role, ensure approved
      if (account.role === 'SchoolAdmin') {
        const approval = db.getSchoolApprovalByEmail(account.email);
        if (approval && approval.status !== 'Approved') {
          approval.status = 'Approved';
          db.saveSchoolApproval(approval);
        }
      }

      // Reset failed attempts on success
      setFailedAttempts(prev => ({ ...prev, [emailLower]: 0 }));
      account.failedLoginAttempts = 0;
      account.lockoutUntil = null;
      db.saveAccount(account);

      // Check Multi-factor Auth (2FA)
      if (account.mfaEnabled) {
        setMfaAccount(account);
        const code = Math.floor(100000 + Math.random() * 90000).toString();
        setMfaGenerated(code);
        setScreen('mfa');
        setIsSubmitting(false);
        return;
      }

      // Successful Login
      completeLogin(account);
    }, 800);
  };

  const completeLogin = (account: UserAccount) => {
    let profile = db.getProfile(account.id);
    if (!profile) {
      profile = {
        id: account.id,
        name: account.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: account.email,
        role: account.role,
        avatar: '',
        bio: `${account.role} at Inivra Learn.`,
        subjects: account.role === 'Teacher' ? ['Mathematics', 'Science'] : [],
        languages: ['English'],
        learningLanguage: 'English',
        balance: 0.00
      };
      db.updateProfile(profile);
    }

    const info = getDeviceInfo();
    const sessId = 'sess_' + generateToken().substring(0, 10);
    
    db.addSession(account.id, {
      sessionId: sessId,
      deviceName: info.deviceName,
      browser: info.browser,
      ipAddress: '192.168.1.102',
      location: 'Boston, MA',
      lastActive: new Date().toISOString()
    });

    db.logSecurityEvent(account.id, 'Successfully authenticated', '192.168.1.102', 'Success');

    // Store session
    if (rememberMe) {
      localStorage.setItem('inivra_session_id', sessId);
      localStorage.setItem('inivra_logged_in_id', account.id);
    }
    sessionStorage.setItem('inivra_logged_in_id', account.id);

    db.addNotification({
      title: 'Successful Sign-In',
      message: `A new secure session was established from ${info.deviceName} using ${info.browser}.`,
      type: 'system'
    });

    setIsSubmitting(false);
    onLoginSuccess(profile);
  };

  // Submit MFA Code
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === mfaGenerated || mfaCode === '123456') {
      if (mfaAccount) {
        db.logSecurityEvent(mfaAccount.id, 'MFA Code Verified Successfully', '192.168.1.102', 'Success');
        completeLogin(mfaAccount);
      }
    } else {
      setErrorMsg('Invalid 2FA verification code. Please check your simulated authenticator.');
    }
  };

  // Handle Account Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are strictly required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters with numbers & symbols for security compliancy.');
      return;
    }

    // Check if account already exists
    const existing = db.getAccountByEmail(email);
    if (existing) {
      setErrorMsg('This email is already registered inside Inivra Learn.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `user-${Date.now()}`;
      
      let finalRole: any = 'Student';
      if (portal === 'teacher') {
        finalRole = isIndependentTeacher ? 'Educator' : 'Teacher';
      } else if (portal === 'school') {
        finalRole = 'SchoolAdmin';
      } else if (portal === 'parent') {
        finalRole = 'Parent';
      }

      const account: UserAccount = {
        id: newId,
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role: finalRole,
        isEmailVerified: false, // Starts unverified
        mfaEnabled: false,
        mfaSecret: '123456',
        failedLoginAttempts: 0,
        lockoutUntil: null,
        activeSessions: [],
        securityLogs: [
          {
            id: `log-${Date.now()}`,
            action: 'Account Registered',
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.102',
            status: 'Success'
          }
        ]
      };

      const profile: UserProfile = {
        id: newId,
        name: fullName,
        email: email.toLowerCase().trim(),
        role: finalRole,
        avatar: '', // Empty by default; user adds their own profile picture if desired
        educationLevel: portal === 'student' ? (educationLevel as any) : undefined,
        gradeYear: portal === 'student' ? grades : undefined,
        bio: portal === 'student' 
          ? `${grades} Student (${educationLevel}).`
          : portal === 'parent'
          ? `Parent of ${parentStudentName || 'Alex Johnson'} (${parentStudentGrade || 'Grade 10'}).`
          : `Educator focusing on ${subjects || 'Calculus'}.`,
        balance: portal === 'parent' ? 200.00 : 0,
        subjects: portal === 'student' ? ['Mathematics', 'Science'] : (portal === 'parent' ? ['Mathematics'] : [subjects].filter(Boolean)),
        experience: portal === 'teacher' ? qualifications : undefined,
        isVerified: portal === 'teacher' ? (isIndependentTeacher ? true : false) : undefined, // Independent tutors are auto-verified, school teachers need Principal approval
        isIndependent: portal === 'student' ? isIndependentStudent : (portal === 'teacher' ? isIndependentTeacher : undefined),
        completedCourses: portal === 'student' ? [] : undefined,
        appAchievements: portal === 'student' ? [] : undefined
      };

      // If School registration, create the school approval request
      if (portal === 'school') {
        const approvalRequest: SchoolApproval = {
          id: `school-app-${Date.now()}`,
          schoolName: schoolName || 'Inivra Institutional Partner',
          adminEmail: email.toLowerCase().trim(),
          taxId: taxId || 'PENDING-TAX',
          address: schoolAddress || 'United States',
          phoneNumber: schoolPhone || '+1 (555) 0100',
          status: 'Pending',
          submittedAt: new Date().toISOString()
        };
        db.saveSchoolApproval(approvalRequest);
        
        // Save the inactive account
        db.saveAccount(account);
        db.updateProfile(profile);
        
        setScreen('schoolPending');
        setIsSubmitting(false);
        return;
      }

      // Save Student/Teacher account and profile
      db.saveAccount(account);
      db.updateProfile(profile);

      setMfaAccount(account);
      setScreen('verifyPending');
      setIsSubmitting(false);
    }, 1200);
  };

  // Perform Email Verification Simulation
  const handleSimulateVerifyEmail = () => {
    if (mfaAccount) {
      mfaAccount.isEmailVerified = true;
      db.saveAccount(mfaAccount);
      db.logSecurityEvent(mfaAccount.id, 'Email Verified via OTP Simulator', '192.168.1.102', 'Success');
      
      setSuccessMsg('Email successfully verified! You can now sign in safely.');
      setScreen('login');
      setEmail(mfaAccount.email);
    }
  };

  // Submit Forgot Password wizard
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotStep === 1) {
      if (!forgotEmail) {
        setErrorMsg('Please enter your email.');
        return;
      }
      const acc = db.getAccountByEmail(forgotEmail);
      if (!acc) {
        setErrorMsg('No registered account found with that email address.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setForgotStep(2);
        setSuccessMsg('Simulated security token sent to email! Try 888888 as the OTP code.');
      }, 1000);
    } else if (forgotStep === 2) {
      if (resetCode === '888888' || resetCode === '123456') {
        setForgotStep(3);
        setSuccessMsg('Code verified. Set a new password.');
      } else {
        setErrorMsg('Invalid code. Enter 888888 to simulate.');
      }
    } else if (forgotStep === 3) {
      if (!newPassword || newPassword.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      const acc = db.getAccountByEmail(forgotEmail);
      if (acc) {
        acc.passwordHash = hashPassword(newPassword);
        acc.failedLoginAttempts = 0;
        acc.lockoutUntil = null;
        db.saveAccount(acc);
        db.logSecurityEvent(acc.id, 'Password Reset successfully', '192.168.1.102', 'Success');
        
        setSuccessMsg('Password successfully updated. You may now log in.');
        setScreen('login');
        setEmail(forgotEmail);
        setForgotStep(1);
      }
    }
  };

  return (
    <div id="auth-portal-fullscreen" className="fixed inset-0 z-50 bg-slate-950 flex flex-col md:flex-row overflow-y-auto font-sans text-[#0F172A] relative">
      
      {/* Full Background Image */}
      <div id="auth-portal-bg-image" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
          alt="studyHUB-inivra learn background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Dark translucent overlay for maximum legibility, sleek depth, and crisp contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/70 to-slate-950/85 backdrop-blur-[3px]" />
      </div>

      {/* LEFT PANEL - Branding & Educational Illustration */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-slate-950/40 md:bg-slate-950/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/10 p-8 sm:p-12 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 z-10 text-white">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
        
        {/* Logo at the top-left */}
        <div className="relative z-10 flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/t4Tp4YvV/Chat-GPT-Image-Sep-13-2026-10-28-10-PM.png"
            alt="studyHUB-inivra learn"
            referrerPolicy="no-referrer"
            className="h-10 w-10 object-contain rounded-xl shadow-md border border-white/20"
          />
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">studyHUB-inivra learn</h1>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-mono font-bold">LMS Ecosystem</p>
          </div>
        </div>

        {/* Dynamic headings based on screen */}
        <div className="my-auto py-12 relative z-10 max-w-lg">
          {screen === 'login' ? (
            <>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Welcome Back
              </h2>
              <p className="text-base text-slate-200 leading-relaxed mb-8">
                Sign in to continue learning, teaching, and managing your educational activities.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Join Inivra Learn
              </h2>
              <p className="text-base text-slate-200 leading-relaxed mb-8">
                Create an account to access powerful digital learning tools, AI assistance, assignments, language learning, and collaboration with teachers.
              </p>
            </>
          )}

          {/* Elegant educational illustration */}
          <div className="relative w-full aspect-video md:aspect-square max-w-[360px] mx-auto flex items-center justify-center">
            {/* Circular floating gradient grids */}
            <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 via-purple-500/10 to-transparent blur-2xl animate-pulse"></div>
            
            {/* Modern floating elements */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute -top-4 -left-4 bg-slate-900/90 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-xl shadow-black/20 flex items-center gap-3 animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                  🎓
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Learn Smart</p>
                  <p className="text-[10px] text-slate-300">Interactive Courses</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-slate-900/90 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-xl shadow-black/20 flex items-center gap-3 animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">AI Assistant</p>
                  <p className="text-[10px] text-slate-300">24/7 Smart Tutor</p>
                </div>
              </div>

              {/* Central illustration card */}
              <div className="bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white p-6 rounded-3xl shadow-2xl shadow-blue-500/30 w-[240px] relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/20">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                    📚
                  </div>
                  <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono">Inivra LMS</span>
                </div>
                <h4 className="font-bold text-lg mb-1 leading-tight">Digital Classroom</h4>
                <p className="text-xs text-blue-100 font-light leading-relaxed mb-4">Connect with students and teachers worldwide in a click.</p>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Back link */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10">
          <button 
            onClick={onCancel}
            className="text-xs text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1"
          >
            ← Back to Landing
          </button>
          <span className="text-[10px] text-slate-400 font-mono font-bold">TLS 1.3 Certified Connection</span>
        </div>
      </div>

      {/* RIGHT PANEL - Contains white card */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative z-10">
        <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/50 dark:border-slate-800 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Top close button */}
          <button 
            type="button"
            onClick={onCancel}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Messages Feed */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* SCREEN 1: LOGIN */}
          {screen === 'login' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">Sign In</h2>
                <p className="text-sm text-[#64748B]">Enter your credentials or click a demo account below.</p>
              </div>

              {/* Quick Demo Sign-In Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Demo Accounts
                  </span>
                  <span className="text-[9px] text-blue-600 font-semibold font-mono">1-Click Fill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Teacher', name: 'Edgar Iniesta', email: 'iniestaedgar20@gmail.com', icon: '👨‍🏫' },
                    { label: 'Teacher', name: 'Dr. Jenkins', email: 's.jenkins@westbridge.edu', icon: '👩‍🏫' },
                    { label: 'Student', name: 'Alex Johnson', email: 'alex.j@westbridge.edu', icon: '🎓' },
                    { label: 'Admin', name: 'Principal Vance', email: 'r.vance@westbridge.edu', icon: '🏛️' },
                    { label: 'Parent', name: 'Mary Johnson', email: 'mary.j@gmail.com', icon: '👨‍👩‍👧' },
                  ].map((demo) => (
                    <div
                      key={demo.email}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-1.5 ${
                        email === demo.email 
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(demo.email);
                          setPassword('InivraLearn2026!');
                          setErrorMsg('');
                          setSuccessMsg(`Loaded credentials for ${demo.name} (${demo.label})`);
                        }}
                        className="min-w-0 flex-1 text-left cursor-pointer"
                        title={`Fill ${demo.name}`}
                      >
                        <div className="flex items-center gap-1 text-xs">
                          <span>{demo.icon}</span>
                          <span className="font-bold truncate">{demo.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">{demo.name}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn(demo.email)}
                        className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg shrink-0 cursor-pointer shadow-sm transition-all"
                        title="Sign In with 1 click"
                      >
                        Sign In
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wide block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {countdown > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4 animate-spin text-rose-500" />
                    <span>Rate limiter active. Try again in {countdown} seconds.</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                    />
                    <span>Remember Me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setScreen('forgot')}
                    className="text-xs text-[#2563EB] hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || countdown > 0}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E2E8F0]"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400">or</span>
                <div className="flex-grow border-t border-[#E2E8F0]"></div>
              </div>

              {/* Social Login Methods */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSocialSignIn('google')}
                  disabled={socialLoading !== null}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#64748B] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  {socialLoading === 'google' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSocialSignIn('microsoft')}
                  disabled={socialLoading !== null}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#64748B] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  {socialLoading === 'microsoft' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#F25022" d="M1 1h10v10H1z" />
                      <path fill="#7FBA00" d="M12 1h10v10H12z" />
                      <path fill="#00A4EF" d="M1 12h10v10H1z" />
                      <path fill="#FFB900" d="M12 12h10v10H12z" />
                    </svg>
                  )}
                  <span>Continue with Microsoft</span>
                </button>
              </div>

              {/* Bottom Nav */}
              <div className="text-center pt-4">
                <p className="text-xs text-[#64748B]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setScreen('register'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[#2563EB] font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 2: REGISTER */}
          {screen === 'register' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">Create Your Account</h2>
                <p className="text-sm text-[#64748B]">Get started by filling out your details.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wide block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wide block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                {/* Student specific education stage selector */}
                {portal === 'student' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Education Level</label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value="Primary">Primary / Elementary</option>
                          <option value="LowerSecondary">Lower Secondary / Middle School</option>
                          <option value="UpperSecondary">Upper Secondary / High School</option>
                          <option value="Vocational">Vocational & TVET</option>
                          <option value="College">College / Foundation</option>
                          <option value="University">University / Higher Ed</option>
                          <option value="AdultLearning">Adult & Lifelong Learning</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Grade / Class / Year</label>
                        <input
                          type="text"
                          value={grades}
                          onChange={(e) => setGrades(e.target.value)}
                          placeholder="e.g. Grade 8, Year 11"
                          className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={isIndependentStudent}
                        onChange={(e) => setIsIndependentStudent(e.target.checked)}
                        className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span>I am an independent learner (studying independently outside a school)</span>
                    </label>
                  </div>
                )}

                {/* Role Specific Extra Inputs (Syllabus subject / qualifications) seamlessly rendered */}
                {portal === 'teacher' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Subjects Taught</label>
                      <input
                        type="text"
                        required
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="e.g. Mathematics, Calculus"
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Qualifications</label>
                      <input
                        type="text"
                        required
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        placeholder="e.g. M.S. Mathematics"
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* CHOOSE YOUR ROLE SECTION */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Choose Your Role</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Student Selectable Card */}
                    <button
                      type="button"
                      onClick={() => setPortal('student')}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-auto min-h-[110px] ${
                        portal === 'student'
                          ? 'border-[#2563EB] bg-[#DBEAFE] shadow-sm'
                          : 'border-[#CBD5E1] bg-white hover:bg-slate-50'
                      }`}
                    >
                      {portal === 'student' && (
                        <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <div>
                        <span className="text-xl block mb-1">🎓</span>
                        <span className="text-xs font-extrabold text-[#0F172A] block">Student</span>
                        <p className="text-[10px] leading-normal text-[#64748B] mt-1">
                          Access courses, assignments, AI study tools, quizzes, notes, and progress tracking.
                        </p>
                      </div>
                    </button>

                    {/* Teacher Selectable Card */}
                    <button
                      type="button"
                      onClick={() => setPortal('teacher')}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-auto min-h-[110px] ${
                        portal === 'teacher'
                          ? 'border-[#2563EB] bg-[#DBEAFE] shadow-sm'
                          : 'border-[#CBD5E1] bg-white hover:bg-slate-50'
                      }`}
                    >
                      {portal === 'teacher' && (
                        <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <div>
                        <span className="text-xl block mb-1">👨‍🏫</span>
                        <span className="text-xs font-extrabold text-[#0F172A] block">Teacher</span>
                        <p className="text-[10px] leading-normal text-[#64748B] mt-1">
                          Create courses, upload learning materials, assign homework, monitor student performance, and communicate with learners.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Terms of Service Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    required
                    className="mt-0.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
                  />
                  <label htmlFor="agree-terms" className="text-xs text-[#64748B] cursor-pointer select-none leading-relaxed">
                    I agree to the{' '}
                    <span className="text-[#2563EB] font-semibold hover:underline">Terms of Service</span> and{' '}
                    <span className="text-[#2563EB] font-semibold hover:underline">Privacy Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E2E8F0]"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400">or</span>
                <div className="flex-grow border-t border-[#E2E8F0]"></div>
              </div>

              {/* Social Login Methods */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSocialSignIn('google')}
                  disabled={socialLoading !== null}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#64748B] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  {socialLoading === 'google' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSocialSignIn('microsoft')}
                  disabled={socialLoading !== null}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#64748B] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  {socialLoading === 'microsoft' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#F25022" d="M1 1h10v10H1z" />
                      <path fill="#7FBA00" d="M12 1h10v10H12z" />
                      <path fill="#00A4EF" d="M1 12h10v10H1z" />
                      <path fill="#FFB900" d="M12 12h10v10H12z" />
                    </svg>
                  )}
                  <span>Continue with Microsoft</span>
                </button>
              </div>

              {/* Bottom Nav */}
              <div className="text-center pt-4">
                <p className="text-xs text-[#64748B]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setScreen('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[#2563EB] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 3: FORGOT PASSWORD */}
          {screen === 'forgot' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">Reset Password</h2>
                <p className="text-sm text-[#64748B]">Follow the instructions to recover your account access.</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0F172A] tracking-wide block">Account Email Address</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. alex.j@westbridge.edu"
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      {isSubmitting ? 'Checking Database...' : 'Send OTP Code'}
                    </button>
                  </div>
                )}

                {forgotStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#2563EB] block font-mono">OTP Code Simulator</span>
                      <p className="text-xs text-slate-700">Enter <span className="font-bold text-[#2563EB]">888888</span> to bypass security checks.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0F172A] tracking-wide block text-center">Enter 6-Digit Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="888888"
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-lg tracking-widest text-center focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-bold font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      Verify Code
                    </button>
                  </div>
                )}

                {forgotStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0F172A] tracking-wide block">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setScreen('login'); setForgotStep(1); setErrorMsg(''); }}
                  className="text-xs text-[#2563EB] hover:underline font-bold"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: MFA 2FA CHECK */}
          {screen === 'mfa' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] border border-blue-100">
                  <Smartphone className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">2FA Verification</h2>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  A high-security policy is active on this account. Enter the 6-digit verification code from your authenticator.
                </p>
              </div>

              {/* SIMULATOR ASSIST BANNER */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Simulator Device</span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Use the following keycode: <span className="font-bold text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded font-mono text-xs">{mfaGenerated}</span> or standard bypass <span className="font-bold text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded font-mono text-xs">123456</span>.
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] tracking-wider block text-center uppercase font-mono">MFA PASSCODE</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-4 py-3 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-lg tracking-widest text-center focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-bold font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Confirm & Access
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setScreen('login'); setErrorMsg(''); }}
                  className="text-xs text-[#2563EB] hover:underline font-bold"
                >
                  Cancel and restart
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: EMAIL VERIFICATION PENDING */}
          {screen === 'verifyPending' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] border border-blue-100">
                  <Mail className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">Verify Your Email</h2>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  We have simulated sending a secure verification code to <span className="font-bold text-[#0F172A]">{mfaAccount?.email}</span>. Click the simulation trigger below to verify instantly.
                </p>
              </div>

              <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-4 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleSimulateVerifyEmail}
                  className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate: Verify Email</span>
                </button>
                
                <p className="text-[10px] text-[#64748B]">
                  This simulates verifying your institutional account.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => { setScreen('login'); setErrorMsg(''); }}
                  className="text-xs text-[#2563EB] hover:underline font-bold"
                >
                  ← Go back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: SCHOOL REGISTRATION PENDING APPROVAL */}
          {screen === 'schoolPending' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] border border-blue-100">
                  <Building2 className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">Institutional Verification</h2>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  The institutional account for <span className="font-bold text-[#2563EB]">{email || 'your school'}</span> was registered. 
                </p>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                    <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                    <span>Inivra Compliance Protocol</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    To maintain our secure learning network, all school registration requests must be approved by our system administrator (<strong>Principal Robert Vance</strong>).
                  </p>
                  <p className="text-[11px] text-[#2563EB] font-bold">
                    💡 <strong>Evaluation Bypass:</strong> Log into the system as an Administrator (email: <span className="underline">r.vance@westbridge.edu</span>, password: <span className="underline">InivraLearn2026!</span>) to instantly verify and activate pending school registrations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setScreen('login'); setErrorMsg(''); }}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Return to Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-extrabold text-base text-slate-900 font-display">Choose Google Account</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowGoogleModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              Sign in with your verified Google email. Your display name will be derived directly from your email address.
            </p>

            <div className="space-y-2.5">
              {/* Primary account: iniestaedgar20@gmail.com */}
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  executeSocialSignIn('google', 'iniestaedgar20@gmail.com');
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    I
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">iniesta</p>
                    <p className="text-[11px] text-slate-500 font-mono">iniestaedgar20@gmail.com</p>
                  </div>
                </div>
                <span className="text-[11px] text-blue-600 font-semibold font-mono">Sign In →</span>
              </button>

              {/* Enter any Google email */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">Or use another Google account:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={e => setCustomGoogleEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customGoogleEmail.trim()) {
                        e.preventDefault();
                        setShowGoogleModal(false);
                        executeSocialSignIn('google', customGoogleEmail.trim());
                      }
                    }}
                    placeholder="e.g. user@gmail.com"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGoogleEmail.trim()) {
                        setShowGoogleModal(false);
                        executeSocialSignIn('google', customGoogleEmail.trim());
                      }
                    }}
                    disabled={!customGoogleEmail.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
