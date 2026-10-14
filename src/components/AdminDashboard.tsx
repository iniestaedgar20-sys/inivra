import React, { useState } from 'react';
import { db } from '../InivraDatabase';
import { UserProfile, FinancialRecord, SchoolApproval, UserAccount } from '../types';
import { 
  Building2, Sparkles, ShieldCheck, Check, Landmark, GraduationCap, 
  Users, FolderGit, CalendarDays, Receipt, TrendingUp, XCircle, FileText, BookOpen, LogOut
} from 'lucide-react';
import EmptyState from './EmptyState';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'users' | 'curriculum' | 'finance' | 'ai-admin' | 'schools'>('users');
  
  // Local state for profile verification & creation
  const [profiles, setProfiles] = useState<UserProfile[]>(db.getProfiles());
  const [financeRecords] = useState<FinancialRecord[]>(db.getFinanceRecords());
  const [approvals, setApprovals] = useState<SchoolApproval[]>(db.getSchoolApprovals());

  // Curriculum State (Initialized clean)
  const [curriculumList, setCurriculumList] = useState<{ id: string; subject: string; topic: string; level: string }[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newLevel, setNewLevel] = useState('Grade 10');

  // AI Administrator state
  const [metricType, setMetricType] = useState('Marketplace Tutor Enrollment');
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tab, role } = customEvent.detail || {};
      if (role && role !== 'Admin') return;
      if (tab && ['users', 'curriculum', 'finance', 'ai-admin', 'schools'].includes(tab)) {
        setActiveTab(tab as any);
      }
    };
    window.addEventListener('inivra-navigation', handleNav);
    return () => window.removeEventListener('inivra-navigation', handleNav);
  }, []);

  // Approve freelance marketplace tutor
  const handleVerifyEducator = (educatorId: string) => {
    const profilesList = db.getProfiles();
    const target = profilesList.find(p => p.id === educatorId);
    if (target) {
      target.isVerified = true;
      db.updateProfile(target);
      setProfiles(db.getProfiles());
      db.addNotification({
        title: 'Educator Profile Verified',
        message: `Your professional profile for Inivra Marketplace has been approved and published by Admin Principal Vance.`,
        type: 'system'
      });
      alert(`Coach David Miller verified in database log! Profile is now publicly active for private tutoring bookings.`);
    }
  };

  // Approve institutional school registration
  const handleVerifySchool = (approvalId: string) => {
    const apps = db.getSchoolApprovals();
    const app = apps.find(a => a.id === approvalId);
    if (app) {
      app.status = 'Approved';
      db.saveSchoolApproval(app);
      setApprovals(db.getSchoolApprovals());

      // Find or create associated SchoolAdmin account
      const account = db.getAccountByEmail(app.adminEmail);
      if (account) {
        account.isEmailVerified = true;
        account.role = 'SchoolAdmin';
        db.saveAccount(account);
        db.logSecurityEvent(account.id, 'School Registration Approved & Verified by Super Admin', '10.0.0.1', 'Success');
      }

      db.addNotification({
        title: 'Institutional School Approved',
        message: `${app.schoolName} has been verified and registered as a fully accredited partner school under Inivra Learn.`,
        type: 'system'
      });
      alert(`Institutional credentials for ${app.schoolName} successfully verified. School can now sign in.`);
    }
  };

  const handleRejectSchool = (approvalId: string) => {
    const apps = db.getSchoolApprovals();
    const app = apps.find(a => a.id === approvalId);
    if (app) {
      app.status = 'Rejected';
      db.saveSchoolApproval(app);
      setApprovals(db.getSchoolApprovals());
      
      db.addNotification({
        title: 'Institutional Application Rejected',
        message: `${app.schoolName} failed registration compliance checks.`,
        type: 'system'
      });
      alert(`Application for ${app.schoolName} rejected.`);
    }
  };

  // Add a curriculum
  const handleAddCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newTopic) return;
    setCurriculumList(prev => [
      ...prev,
      {
        id: `curr-${Date.now()}`,
        subject: newSubject,
        topic: newTopic,
        level: newLevel
      }
    ]);
    setNewSubject('');
    setNewTopic('');
  };

  // Generate AI enrollment forecasts
  const handleGenerateForecast = async () => {
    setLoadingAnalysis(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/ai/admin-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricType,
          currentMetrics: {
            activeStudents: profiles.filter(p => p.role === 'Student').length,
            activeTutors: profiles.filter(p => p.role === 'Educator' || p.role === 'Teacher').length,
            marketplaceTransactions: financeRecords.length,
            commissionsDeducted: financeRecords.reduce((acc, r) => acc + (r.amount > 0 ? r.amount * 0.15 : 0), 0)
          }
        })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div id="admin-dashboard" className="space-y-8">
      
      {/* Welcome and high level numbers */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Administrative Suite</h2>
          <p className="text-indigo-200 text-sm font-light">Welcome back, Principal Vance. Track school compliance, approve educators, and review financial ledgers.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          <span className="bg-indigo-800/80 px-4 py-2 rounded-xl text-xs font-semibold font-mono border border-indigo-700">
            {profiles.length} Registered User{profiles.length === 1 ? '' : 's'}
          </span>
          <span className="bg-slate-800/80 px-4 py-2 rounded-xl text-xs font-semibold font-mono border border-slate-700">
            Platform Commission: 15%
          </span>
          <button
            id="admin-logout-btn"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                window.dispatchEvent(new CustomEvent('inivra-logout'));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all border border-rose-500 shadow-sm"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          User & Tutor Approvals
        </button>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Curriculum & Departments
        </button>
        <button 
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'finance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Financial Logs & Split ledger
        </button>
        <button 
          onClick={() => setActiveTab('ai-admin')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'ai-admin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          AI Administrative forecasting
        </button>
        <button 
          onClick={() => setActiveTab('schools')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'schools' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          School Registrations
        </button>
      </div>

      {/* RENDER ACTIVE TABS */}

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">User Management & Marketplace Educator Approvals</h3>
            <span className="text-xs text-slate-500 font-mono">Verify freelance tutors credentials</span>
          </div>

          <div className="space-y-4">
            {profiles.map(p => (
              <div key={p.id} className="p-4 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  {p.avatar ? (
                    <img referrerPolicy="no-referrer" src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                      {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{p.email} • Role: {p.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.role === 'Educator' && (
                    <>
                      {p.isVerified ? (
                        <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> Verified Educator
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyEducator(p.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        >
                          Verify credentials & Approve Tutor
                        </button>
                      )}
                    </>
                  )}
                  {p.role !== 'Educator' && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-mono">
                      Account Registered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Curriculum item */}
          <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Add Academic syllabus</h3>
            <form onSubmit={handleAddCurriculum} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Subject Department</label>
                <input 
                  type="text" 
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Science / Biology"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Topic description</label>
                <input 
                  type="text" 
                  required
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Cell division structures"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Target level</label>
                <select 
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wide rounded-xl shadow-md transition-colors"
              >
                Publish Syllabus
              </button>
            </form>
          </div>

          {/* Curriculum map list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Active Syllabus list</h3>
            {curriculumList.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No curriculum syllabus entries"
                description="Use the form on the left to add syllabus topics, departments, and academic target levels."
              />
            ) : (
              <div className="space-y-3">
                {curriculumList.map(curr => (
                  <div key={curr.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-indigo-600">{curr.subject}</h4>
                      <p className="text-sm font-semibold text-slate-800">{curr.topic}</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">{curr.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Financial ledger & Stripe split Logs</h3>
            <span className="text-xs text-slate-500 font-mono">Real-time split Commission bookkeeping</span>
          </div>

          {financeRecords.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No financial transactions recorded"
              description="Platform fee split entries and payout ledgers will automatically log here as marketplace bookings occur."
            />
          ) : (
            <div className="space-y-3">
              {financeRecords.map(rec => (
                <div key={rec.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      rec.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {rec.amount > 0 ? '+' : ''}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">{rec.description}</p>
                      <p className="text-xs text-slate-500 font-mono">Ref code: {rec.id} • Date: {rec.date} • Type: {rec.type}</p>
                    </div>
                  </div>

                  <span className={`text-sm font-bold font-mono ${
                    rec.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    ${rec.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI ADMINISTRATIVE FORECASTING TAB */}
      {activeTab === 'ai-admin' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Inivra AI Academic forecasting</h3>
          </div>

          <p className="text-sm text-slate-600 font-light leading-relaxed">
            Need forecasts of student enrollment trends, strategic tutoring expansion recommendations, or school institutional reports? Select a parameter below and call Inivra AI to generate projections.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={metricType}
              onChange={e => setMetricType(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="Marketplace Tutor Enrollment">Marketplace Tutor Enrollment Projections</option>
              <option value="Science Course enrollment split">Science Course enrollment splits</option>
              <option value="Institutional compliance metrics and billing">Institutional compliance metrics and school billing</option>
            </select>
            <button 
              onClick={handleGenerateForecast}
              disabled={loadingAnalysis}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
            >
              {loadingAnalysis ? 'Analyzing Trends...' : 'Generate AI Forecast'}
            </button>
          </div>

          {aiAnalysis && (
            <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <TrendingUp className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900">AI projection Report: {metricType}</h4>
              </div>
              <div className="space-y-3 text-xs leading-relaxed font-light text-slate-700">
                <div className="bg-white p-4 border border-slate-250 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Growth Trend:</span>
                  <p>{aiAnalysis.trend}</p>
                </div>
                <div className="bg-white p-4 border border-slate-250 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Projections:</span>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    {aiAnalysis.projection.map((proj: any, idx: number) => (
                      <li key={idx}>
                        <strong>{proj.period}:</strong> {proj.predicted}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-4 border border-slate-250 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Strategic recommendations:</span>
                  <p>{aiAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SCHOOL REGISTRATIONS TAB */}
      {activeTab === 'schools' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Institutional Accreditation & School Verification Workflow</h3>
            <span className="text-xs text-slate-500 font-mono">Verify registered state tax IDs and administrator credentials</span>
          </div>

          <div className="space-y-4">
            {approvals.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No school registration requests"
                description="Accreditation and institutional onboarding submissions will appear here for review and verification."
              />
            ) : (
              approvals.map(app => (
                <div key={app.id} className="p-5 border border-slate-200 rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-base text-slate-900">{app.schoolName}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        app.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 font-mono">
                      <p><strong>Admin Email:</strong> {app.adminEmail}</p>
                      <p><strong>Tax ID:</strong> {app.taxId}</p>
                      <p><strong>Address:</strong> {app.address}</p>
                      <p><strong>Phone:</strong> {app.phoneNumber}</p>
                      <p className="col-span-2"><strong>Submitted:</strong> {new Date(app.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleVerifySchool(app.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                        >
                          Verify & Activate
                        </button>
                        <button
                          onClick={() => handleRejectSchool(app.id)}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Decline
                        </button>
                      </>
                    ) : app.status === 'Approved' ? (
                      <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Fully Verified
                      </span>
                    ) : (
                      <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Application Declined
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
