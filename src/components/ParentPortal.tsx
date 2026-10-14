import React, { useState } from 'react';
import { db } from '../InivraDatabase';
import { Sparkles, Calendar, BookOpen, Clock, Users, HelpCircle, CheckCircle, GraduationCap, LogOut } from 'lucide-react';
import EmptyState from './EmptyState';

interface ParentPortalProps {
  onLogout?: () => void;
}

export default function ParentPortal({ onLogout }: ParentPortalProps = {}) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'ai-report'>('attendance');
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportResult, setReportResult] = useState<string>('');

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tab, role } = customEvent.detail || {};
      if (role && role !== 'Parent') return;

      if (tab === 'grades') {
        setActiveTab('grades');
      } else if (tab === 'report') {
        setActiveTab('ai-report');
      }
    };
    window.addEventListener('inivra-navigation', handleNav);
    return () => window.removeEventListener('inivra-navigation', handleNav);
  }, []);

  // Get available students
  const availableStudents = db.getProfilesByRole('Student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    availableStudents[0]?.id || 'user-student'
  );

  // Get student info
  const studentProfile = db.getProfile(selectedStudentId) || availableStudents[0];
  const classrooms = db.getClassrooms();

  // Find all assignments submitted or assigned to student
  const studentAssignments = classrooms.flatMap(c => 
    c.assignments.map(a => ({
      ...a,
      courseTitle: c.name,
      submission: a.submissions.find(s => s.studentId === (studentProfile?.id || 'user-student'))
    }))
  );

  // Graded submissions calculation
  const gradedSubmissions = studentAssignments.filter(a => a.submission?.graded);
  const averageGrade = gradedSubmissions.length > 0
    ? Math.round(
        gradedSubmissions.reduce((acc, curr) => acc + ((curr.submission?.score || 0) / (curr.maxScore || 100)) * 100, 0) / gradedSubmissions.length
      )
    : null;

  // Attendance records (clean starting state)
  const [attendanceDays, setAttendanceDays] = useState<{ day: number; status: string }[]>([]);

  // Scheduled meeting blocks (clean starting state)
  const [scheduledMeetings, setScheduledMeetings] = useState<{ id: string; topic: string; teacher: string; date: string; time: string; status: string }[]>([]);

  // AI progress report narrative generator
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    setReportResult('');
    try {
      const studentName = studentProfile?.name || 'the student';
      const promptText = studentAssignments.length > 0
        ? `Please generate a structured, encouraging parent progress report for ${studentName}. Graded assignments count: ${gradedSubmissions.length}. Average score: ${averageGrade !== null ? `${averageGrade}%` : 'In progress'}.`
        : `Please generate a helpful welcome orientation summary for the parents of ${studentName}. The school term has just started and initial curriculum assignments and diagnostic reviews are underway.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          context: "Write as Inivra AI Senior Academic Analyst. Translate educational milestones into clear, encouraging parent insights.",
          systemInstruction: "You are the Inivra Academic Summarizer."
        })
      });
      const data = await response.json();
      setReportResult(data.text || `Academic Progress Digest: ${studentName} is registered and active on Inivra Learn. As upcoming coursework and attendance registers are recorded by instructors, detailed mastery analytics and chapter diagnostics will populate automatically here.`);
    } catch (e) {
      console.error(e);
      setReportResult(`Academic Progress Digest: ${studentProfile?.name || 'Student'} is enrolled and ready for coursework. Detailed chapter metrics and teacher feedback will be synthesized as assignments are submitted and graded.`);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div id="parent-portal" className="space-y-8">
      
      {/* Main heading */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Parent Portal</h2>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <p className="text-indigo-200 text-sm font-light">
              Monitoring: <span className="font-semibold text-white">{studentProfile?.name || 'Enrolled Student'}</span>
            </p>
            {availableStudents.length > 1 && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-purple-950/60 border border-purple-400/40 text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-300"
              >
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id} className="text-slate-900">
                    {s.name} ({s.educationLevel || 'Student'})
                  </option>
                ))}
              </select>
            )}
          </div>
          {studentProfile?.educationLevel && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold border border-white/20 mt-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {studentProfile.educationLevel === 'Primary' ? 'Primary / Elementary' :
                 studentProfile.educationLevel === 'LowerSecondary' ? 'Lower Secondary / Middle School' :
                 studentProfile.educationLevel === 'UpperSecondary' ? 'Upper Secondary / High School' :
                 studentProfile.educationLevel === 'Vocational' ? 'Vocational & TVET' :
                 studentProfile.educationLevel === 'College' ? 'College' :
                 studentProfile.educationLevel === 'University' ? 'University' :
                 'Adult & Lifelong Learning'}
                {studentProfile.gradeYear ? ` • ${studentProfile.gradeYear}` : ''}
                {studentProfile.isIndependent ? ' • Independent' : (studentProfile.schoolName ? ` • ${studentProfile.schoolName}` : '')}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          <span className="bg-purple-800/80 px-4 py-2 rounded-xl text-xs font-semibold font-mono border border-purple-700">
            {averageGrade !== null ? `Average Grade: ${averageGrade}%` : 'Grades: In Progress'}
          </span>
          <span className="bg-indigo-800/80 px-4 py-2 rounded-xl text-xs font-semibold font-mono border border-indigo-700">
            {attendanceDays.length > 0 ? `Attendance: 100%` : 'Attendance: New Term'}
          </span>
          <button
            id="parent-logout-btn"
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
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Attendance calendar
        </button>
        <button 
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'grades' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Grades & Submissions
        </button>
        <button 
          onClick={() => setActiveTab('ai-report')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'ai-report' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          AI progress summary
        </button>
      </div>

      {/* RENDER ACTIVE TABS */}

      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar visual grid */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Current Term Attendance Logs</h3>
            {attendanceDays.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No attendance entries recorded yet"
                description="Attendance records will appear here as teachers log attendance during scheduled lectures."
              />
            ) : (
              <div className="grid grid-cols-7 gap-2.5 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                  <span key={h} className="text-[10px] uppercase font-bold text-slate-400 py-1">{h}</span>
                ))}
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNumber = idx + 1;
                  const record = attendanceDays.find(d => d.day === dayNumber);
                  const isWeekend = (dayNumber + 2) % 7 === 6 || (dayNumber + 2) % 7 === 0;

                  return (
                    <div 
                      key={idx} 
                      className={`p-2 border rounded-xl text-xs font-semibold flex flex-col justify-between items-center h-16 ${
                        isWeekend ? 'bg-slate-50 border-slate-100 text-slate-300' :
                        record ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                        'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{dayNumber}</span>
                      {!isWeekend && (
                        <span className={`text-[8px] font-bold uppercase ${record ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {record ? record.status : 'Scheduled'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meetings and reminders */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Parent Teacher Meetings</h3>
            {scheduledMeetings.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No meetings scheduled"
                description="Upcoming conferences, parent-teacher consults, and advisor office hours will appear here."
              />
            ) : (
              scheduledMeetings.map(meet => (
                <div key={meet.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-xs text-slate-900">{meet.topic}</h4>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 rounded">{meet.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Host: {meet.teacher} • Date: {meet.date} • Time: {meet.time}</p>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Academic Performance & Gradebook</h3>
          {studentAssignments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No graded coursework recorded yet"
              description="Course assignments, test scores, and teacher evaluations will appear here as coursework is completed."
            />
          ) : (
            <div className="space-y-3">
              {studentAssignments.map(asg => {
                const sub = asg.submission;
                return (
                  <div key={asg.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded uppercase">{asg.courseTitle}</span>
                        <p className="text-sm font-semibold text-slate-800">{asg.title}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Max Score: {asg.maxScore} • Submitted on: {sub?.submissionDate || 'Pending'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-indigo-600 font-mono">
                        {sub?.graded ? `${sub.score}/${asg.maxScore}` : sub ? 'Submitted' : 'Pending'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">{sub?.graded ? 'Graded by teacher' : sub ? 'Review pending' : 'Not submitted'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai-report' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Inivra AI Academic Progress Digest</h3>
          </div>

          <p className="text-sm text-slate-600 font-light leading-relaxed">
            Generate an automated, comprehensive summary of your child's academic trajectory, strengths, subject benchmarks, and targeted focus tips synthesized directly by Inivra AI.
          </p>

          <button 
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow shadow-indigo-600/10 transition-colors"
          >
            {loadingReport ? 'Generating report...' : 'Generate AI Academic Performance Digest'}
          </button>

          {reportResult && (
            <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <CheckCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900">AI Performance Digest Report</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-light whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200 font-mono">
                {reportResult}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
