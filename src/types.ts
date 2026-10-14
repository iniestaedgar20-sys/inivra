export type UserRole = 'Student' | 'Teacher' | 'Admin' | 'Parent' | 'Educator' | 'SchoolAdmin';

export type EducationLevel = 
  | 'Primary' // Primary / Elementary School
  | 'LowerSecondary' // Lower Secondary / Middle School
  | 'UpperSecondary' // Upper Secondary / High School
  | 'Vocational' // Technical and Vocational Education (TVET)
  | 'College' // College / Foundation
  | 'University' // Higher Education / University
  | 'AdultLearning'; // Adult & Lifelong Learning

export interface ActiveSession {
  sessionId: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning' | 'Lockout' | 'MFA_Verify';
}

export interface SchoolApproval {
  id: string;
  schoolName: string;
  adminEmail: string;
  taxId: string;
  address: string;
  phoneNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret: string;
  failedLoginAttempts: number;
  lockoutUntil: string | null;
  activeSessions: ActiveSession[];
  securityLogs: SecurityLog[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  qualifications?: string[];
  certifications?: string[];
  experience?: string;
  subjects?: string[];
  languages?: string[];
  hourlyRate?: number;
  rating?: number;
  reviewsCount?: number;
  isVerified?: boolean; // Admin approval for marketplace educators
  balance: number; // for earnings / payouts
  schoolId?: string; // Links to school for SchoolAdmin/Teacher/Student
  schoolName?: string; // Name of school / educational institution
  educationLevel?: EducationLevel; // Learner/Teacher tier (Primary to Adult)
  gradeYear?: string; // e.g. Grade 4, Year 8, 10th Grade, College Year 2
  isIndependent?: boolean; // Option for individual students or teachers who aren't associated with a school using the app
  completedCourses?: string[]; // Courses completed inside the app (e.g. AP Calculus)
  enrolledCourses?: string[]; // Enrolled course IDs
  activityDates?: string[]; // ISO date strings (YYYY-MM-DD) tracking real usage days
  lastActiveDate?: string;
  appAchievements?: string[]; // Achievements earned (e.g. Spanish Fluency, German A2)
  enableLiveTranscriptions?: boolean; // Accessibility preference for voice interaction text display
  learningLanguage?: string; // Language the student wants to learn (e.g. Spanish, French)
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  hasPowerpoint?: boolean;
  hasPdf?: boolean;
  resourceUrl?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  educationLevel?: EducationLevel | 'AllLevels';
  gradeLevel?: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  educatorId: string;
  educatorName: string;
  enrolledCount: number;
  lessons: Lesson[];
  quizzes: any[];
  materials: any[];
  reviews: Review[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  content: string;
  fileUrl?: string;
  score?: number;
  graded: boolean;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Pending';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: Submission[];
}

export interface Material {
  id: string;
  title: string;
  type: 'PDF' | 'PPT' | 'Excel' | 'Word' | 'Video' | 'Audio' | 'Image';
  size: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Excused';
}

export interface AttendanceLog {
  id: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  educationLevel?: EducationLevel;
  gradeYear?: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  code: string;
  schedule: string;
  description: string;
  announcements: Announcement[];
  assignments: Assignment[];
  materials: Material[];
  attendanceLogs: AttendanceLog[];
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  category: 'Lesson Plan' | 'PPT' | 'Worksheet' | 'PDF Note' | 'Exam Paper' | 'Revision Guide' | 'Template';
  price: number;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  downloads: number;
  rating: number;
  fileUrl: string;
  previewUrl?: string;
  uploadedAt: string;
  reviews: Review[];
}

export interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  price: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  videoCallId: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string;
  content: string;
  timestamp: string;
  attachmentName?: string;
  attachmentType?: string;
  reactions: string[];
  readBy?: string[];
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; avatar: string; role: UserRole }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface InivraNotification {
  id: string;
  userId?: string; // Target user recipient
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'assignment' | 'grade' | 'announcement' | 'booking' | 'payment' | 'message' | 'system' | 'withdrawal';
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: 'Sale' | 'Booking' | 'Payout' | 'Purchase' | 'Subscription';
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  referenceId: string;
}
