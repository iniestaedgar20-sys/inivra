import { 
  UserProfile, Course, Classroom, MarketplaceProduct, 
  Booking, Message, Conversation, InivraNotification, FinancialRecord,
  UserAccount, ActiveSession, SecurityLog, SchoolApproval, UserRole
} from './types';
import { hashPassword } from './utils/crypto';
import { db as firestoreDb, auth as firestoreAuth, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Seed Accounts (linked to profiles)
const seedAccounts: UserAccount[] = [
  {
    id: 'user-student',
    email: 'alex.j@westbridge.edu',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Student',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [
      {
        sessionId: 'sess-init-student-1',
        deviceName: 'Windows Desktop',
        browser: 'Chrome',
        ipAddress: '192.168.1.102',
        location: 'San Francisco, CA',
        lastActive: '2026-07-16T15:00:00Z'
      }
    ],
    securityLogs: [
      {
        id: 'log-1',
        action: 'Account created and verified',
        timestamp: '2026-07-15T09:00:00Z',
        ipAddress: '127.0.0.1',
        status: 'Success'
      }
    ]
  },
  {
    id: 'user-teacher',
    email: 's.jenkins@westbridge.edu',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Teacher',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [
      {
        sessionId: 'sess-init-teacher-1',
        deviceName: 'macOS Workstation',
        browser: 'Safari',
        ipAddress: '192.168.1.105',
        location: 'Boston, MA',
        lastActive: '2026-07-16T14:45:00Z'
      }
    ],
    securityLogs: []
  },
  {
    id: 'user-admin',
    email: 'r.vance@westbridge.edu',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Admin',
    isEmailVerified: true,
    mfaEnabled: true,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [
      {
        sessionId: 'sess-init-admin-1',
        deviceName: 'Linux Server Admin Console',
        browser: 'Firefox',
        ipAddress: '10.0.0.1',
        location: 'Enterprise cloud core',
        lastActive: '2026-07-16T15:05:00Z'
      }
    ],
    securityLogs: [
      {
        id: 'log-admin-1',
        action: 'Administrator Session Initialized',
        timestamp: '2026-07-16T11:00:00Z',
        ipAddress: '10.0.0.1',
        status: 'Success'
      }
    ]
  },
  {
    id: 'user-educator',
    email: 'david.miller@inivra.com',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Educator',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [],
    securityLogs: []
  },
  {
    id: 'user-parent',
    email: 'mary.j@gmail.com',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Parent',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [],
    securityLogs: []
  },
  {
    id: 'user-iniesta',
    email: 'iniestaedgar20@gmail.com',
    passwordHash: hashPassword('InivraLearn2026!'),
    role: 'Teacher',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: '123456',
    failedLoginAttempts: 0,
    lockoutUntil: null,
    activeSessions: [],
    securityLogs: []
  }
];

// Seed School Approvals
const seedSchoolApprovals: SchoolApproval[] = [
  {
    id: 'school-app-1',
    schoolName: 'Westbridge Academy',
    adminEmail: 'r.vance@westbridge.edu',
    taxId: 'TAX-556677',
    address: '100 Academy Rd, Westbridge, MA',
    phoneNumber: '+1 (555) 012-3456',
    status: 'Approved',
    submittedAt: '2026-07-10T10:00:00-07:00'
  },
  {
    id: 'school-app-2',
    schoolName: 'Oakwood STEM High',
    adminEmail: 'admin@oakwoodstem.edu',
    taxId: 'TAX-112233',
    address: '456 Pine Ave, Oakwood, CA',
    phoneNumber: '+1 (555) 789-1011',
    status: 'Pending',
    submittedAt: '2026-07-15T14:30:00-07:00'
  }
];

// Helper to check and parse localStorage
const CURRENT_DB_VERSION = 'inivra_v8_real_comm_education_levels';

if (typeof window !== 'undefined') {
  try {
    const storedVersion = localStorage.getItem('inivra_db_version');
    if (storedVersion !== CURRENT_DB_VERSION) {
      // Clear legacy mock data so all accounts start clean and new seeds are loaded
      localStorage.removeItem('inivra_profiles');
      localStorage.removeItem('inivra_accounts');
      localStorage.removeItem('inivra_courses');
      localStorage.removeItem('inivra_classrooms');
      localStorage.removeItem('inivra_products');
      localStorage.removeItem('inivra_bookings');
      localStorage.removeItem('inivra_conversations');
      localStorage.removeItem('inivra_messages');
      localStorage.removeItem('inivra_notifications');
      localStorage.removeItem('inivra_finance');
      localStorage.setItem('inivra_db_version', CURRENT_DB_VERSION);
    }
  } catch (e) {
    console.warn("Storage version check error:", e);
  }
}

const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Clean Base Profiles supporting students & educators across all education levels
const seedProfiles: UserProfile[] = [
  {
    id: 'user-student',
    name: 'Alex Johnson',
    email: 'alex.j@westbridge.edu',
    role: 'Student',
    avatar: '', // Neutral initial badge by default
    educationLevel: 'UpperSecondary',
    gradeYear: '10th Grade',
    schoolName: 'Westbridge High School',
    bio: 'Secondary school student exploring sciences, algebra, and literature.',
    subjects: ['Mathematics', 'Biology', 'History', 'English Literature'],
    languages: ['English'],
    learningLanguage: 'English',
    balance: 0.00,
    isIndependent: false,
    completedCourses: [],
    appAchievements: []
  },
  {
    id: 'user-teacher',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@westbridge.edu',
    role: 'Teacher',
    avatar: '',
    educationLevel: 'UpperSecondary',
    gradeYear: 'Secondary Faculty',
    schoolName: 'Westbridge High School',
    bio: 'Mathematics & Science educator teaching middle and upper secondary school curricula.',
    subjects: ['Algebra II', 'General Science', 'Biology', 'Foundational Mathematics'],
    languages: ['English'],
    learningLanguage: 'English',
    balance: 0.00
  },
  {
    id: 'user-admin',
    name: 'Principal Robert Vance',
    email: 'r.vance@westbridge.edu',
    role: 'Admin',
    avatar: '',
    schoolName: 'Westbridge Educational Consortium',
    bio: 'Senior Educational Administrator supporting multi-tier schools from primary through vocational and secondary education.',
    balance: 0.00
  },
  {
    id: 'user-parent',
    name: 'Mary Johnson',
    email: 'mary.j@gmail.com',
    role: 'Parent',
    avatar: '',
    schoolName: 'Westbridge High School',
    bio: 'Parent of Alex Johnson (10th Grade).',
    balance: 0.00
  },
  {
    id: 'user-educator',
    name: 'David Miller',
    email: 'david.miller@inivra.com',
    role: 'Educator',
    avatar: '',
    educationLevel: 'AdultLearning',
    gradeYear: 'Vocational & Lifelong Learning',
    bio: 'Independent Educator supporting primary, secondary, vocational, and adult learners.',
    qualifications: ['M.S. in Physics', 'Certified Multi-Level STEM Instructor'],
    certifications: ['Certified Educator', 'Vocational Technical Instructor'],
    experience: 'Independent Educator & STEM Coach',
    subjects: ['General Science', 'Physics', 'Mathematics', 'Practical Technical Skills'],
    languages: ['English'],
    hourlyRate: 35.00,
    rating: 5.0,
    reviewsCount: 0,
    isVerified: true,
    balance: 0.00
  },
  {
    id: 'user-iniesta',
    name: 'iniesta',
    email: 'iniestaedgar20@gmail.com',
    role: 'Teacher',
    avatar: '',
    educationLevel: 'UpperSecondary',
    gradeYear: 'Lead Educator',
    schoolName: 'Westbridge High School',
    bio: 'Lead Educator & Curriculum Director across education levels.',
    subjects: ['Mathematics', 'Science', 'Computer Studies'],
    languages: ['English'],
    learningLanguage: 'English',
    balance: 0.00
  }
];

// Clean Database Stores (No fake sample, demo, or placeholder records)
const seedCourses: Course[] = [];
const seedClassrooms: Classroom[] = [];
const seedProducts: MarketplaceProduct[] = [];
const seedBookings: Booking[] = [];
const seedConversations: Conversation[] = [];
const seedMessages: Message[] = [];
const seedNotifications: InivraNotification[] = [];
const seedFinance: FinancialRecord[] = [];

// Database Class definition
class InivraDatabase {
  // Profiles
  getProfiles(): UserProfile[] {
    const list = getLocal<UserProfile[]>('inivra_profiles', seedProfiles);
    // Ensure all seed profiles exist
    for (const seed of seedProfiles) {
      if (!list.some(p => p.id === seed.id || p.email.toLowerCase().trim() === seed.email.toLowerCase().trim())) {
        list.push(seed);
      }
    }
    return list.map(p => {
      // If user profile has old hardcoded default unsplash photo, reset to empty
      if (p.avatar && p.avatar.includes('photo-1534528741775-53994a69daeb')) {
        return { ...p, avatar: '' };
      }
      return p;
    });
  }
  getProfile(id: string): UserProfile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }
  getProfilesByRole(role: UserRole): UserProfile[] {
    return this.getProfiles().filter(p => p.role === role);
  }
  // Cloud Firestore Synchronization
  private async syncToFirestore(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      if (firestoreAuth.currentUser) {
        await setDoc(doc(firestoreDb, collectionName, docId), data, { merge: true });
      }
    } catch (error) {
      console.warn(`Firestore sync notice (${collectionName}/${docId}):`, error);
    }
  }

  updateProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    setLocal('inivra_profiles', profiles);
    this.syncToFirestore('users', profile.id, profile);
  }

  // Record user activity for real daily streak calculation
  recordUserActivity(userId: string): number {
    const profile = this.getProfile(userId);
    if (!profile) return 1;

    const todayStr = new Date().toISOString().split('T')[0];
    const existingDates = new Set(profile.activityDates || []);
    existingDates.add(todayStr);
    const updatedDates = Array.from(existingDates).sort();

    const streak = this.calculateStreak(updatedDates);
    this.updateProfile({
      ...profile,
      activityDates: updatedDates,
      lastActiveDate: todayStr
    });
    return streak;
  }

  // Real consecutive days streak calculator
  calculateStreak(activityDates: string[] = []): number {
    if (!activityDates || activityDates.length === 0) return 1;
    const uniqueDates = Array.from(new Set(activityDates)).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user has logged today or yesterday
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 1; // Start new streak
    }

    let streak = 0;
    let checkDate = new Date();
    if (!uniqueDates.includes(today)) {
      checkDate = new Date(Date.now() - 86400000);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }

  // Automatically mark course completed & trigger real-time updates
  markCourseCompleted(userId: string, courseTitle: string): void {
    const profile = this.getProfile(userId);
    if (!profile) return;
    const currentCompleted = profile.completedCourses ? [...profile.completedCourses] : [];
    if (!currentCompleted.includes(courseTitle)) {
      currentCompleted.push(courseTitle);
      const todayStr = new Date().toISOString().split('T')[0];
      const dates = new Set(profile.activityDates || []);
      dates.add(todayStr);

      this.updateProfile({
        ...profile,
        completedCourses: currentCompleted,
        activityDates: Array.from(dates).sort(),
        lastActiveDate: todayStr
      });
      window.dispatchEvent(new Event('storage'));
    }
  }

  // Real teacher online presence verification
  isTeacherLoggedIn(teacherIdOrEmail: string): boolean {
    const account = this.getAccounts().find(a => 
      a.id === teacherIdOrEmail || 
      a.email.toLowerCase().trim() === teacherIdOrEmail.toLowerCase().trim()
    );
    return !!(account && account.activeSessions && account.activeSessions.length > 0);
  }

  // Courses
  getCourses(): Course[] {
    return getLocal<Course[]>('inivra_courses', seedCourses);
  }
  getCourse(id: string): Course | undefined {
    return this.getCourses().find(c => c.id === id);
  }
  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      courses[idx] = course;
    } else {
      courses.push(course);
    }
    setLocal('inivra_courses', courses);
    this.syncToFirestore('courses', course.id, course);
  }

  // Classrooms
  getClassrooms(): Classroom[] {
    return getLocal<Classroom[]>('inivra_classrooms', seedClassrooms);
  }
  getClassroom(id: string): Classroom | undefined {
    return this.getClassrooms().find(c => c.id === id);
  }
  getClassroomsForStudent(studentId: string): Classroom[] {
    return this.getClassrooms().filter(c => c.studentIds && c.studentIds.includes(studentId));
  }
  getClassroomsForTeacher(teacherId: string): Classroom[] {
    return this.getClassrooms().filter(c => c.teacherId === teacherId);
  }
  joinClassroom(classCode: string, studentId: string): { success: boolean; message: string; classroom?: Classroom } {
    const codeClean = classCode.trim().toUpperCase();
    const classrooms = this.getClassrooms();
    const target = classrooms.find(c => c.code.toUpperCase() === codeClean);
    if (!target) {
      return { success: false, message: 'Classroom not found. Please verify the class code with your teacher.' };
    }
    if (target.studentIds.includes(studentId)) {
      return { success: false, message: 'You are already enrolled in this classroom.', classroom: target };
    }
    target.studentIds.push(studentId);
    this.saveClassroom(target);
    return { success: true, message: `Successfully joined ${target.name}!`, classroom: target };
  }
  saveClassroom(classroom: Classroom): void {
    const classrooms = this.getClassrooms();
    const idx = classrooms.findIndex(c => c.id === classroom.id);
    if (idx !== -1) {
      classrooms[idx] = classroom;
    } else {
      classrooms.push(classroom);
    }
    setLocal('inivra_classrooms', classrooms);
    this.syncToFirestore('classrooms', classroom.id, classroom);
  }

  // Marketplace Products
  getProducts(): MarketplaceProduct[] {
    return getLocal<MarketplaceProduct[]>('inivra_products', seedProducts);
  }
  getProduct(id: string): MarketplaceProduct | undefined {
    return this.getProducts().find(p => p.id === id);
  }
  saveProduct(product: MarketplaceProduct): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    setLocal('inivra_products', products);
    this.syncToFirestore('marketplaceProducts', product.id, product);
  }

  // Bookings
  getBookings(): Booking[] {
    return getLocal<Booking[]>('inivra_bookings', seedBookings);
  }
  saveBooking(booking: Booking): void {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      bookings[idx] = booking;
    } else {
      bookings.push(booking);
    }
    setLocal('inivra_bookings', bookings);
    this.syncToFirestore('bookings', booking.id, booking);
  }

  // Messaging System
  getConversations(userId?: string): Conversation[] {
    const list = getLocal<Conversation[]>('inivra_conversations', seedConversations);
    if (!userId) return list;
    return list.filter(c => c.participants.some(p => p.id === userId));
  }

  getConversation(convId: string): Conversation | undefined {
    return this.getConversations().find(c => c.id === convId);
  }

  getMessages(conversationId: string): Message[] {
    const all = getLocal<Message[]>('inivra_messages', seedMessages);
    return all.filter(m => m.conversationId === conversationId);
  }

  markConversationAsRead(conversationId: string, currentUserId: string): void {
    const conversations = getLocal<Conversation[]>('inivra_conversations', seedConversations);
    const idx = conversations.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      conversations[idx].unreadCount = 0;
      setLocal('inivra_conversations', conversations);
      this.syncToFirestore('conversations', conversationId, conversations[idx]);
    }

    const messages = getLocal<Message[]>('inivra_messages', seedMessages);
    let updated = false;
    messages.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== currentUserId) {
        if (!m.readBy) m.readBy = [];
        if (!m.readBy.includes(currentUserId)) {
          m.readBy.push(currentUserId);
          updated = true;
        }
      }
    });
    if (updated) {
      setLocal('inivra_messages', messages);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inivra_message_read', { detail: { conversationId, currentUserId } }));
    }
  }

  saveMessage(msg: Message): void {
    const all = getLocal<Message[]>('inivra_messages', seedMessages);
    all.push(msg);
    setLocal('inivra_messages', all);

    // Update conversation last message & timestamp
    const conversations = getLocal<Conversation[]>('inivra_conversations', seedConversations);
    const idx = conversations.findIndex(c => c.id === msg.conversationId);
    let targetPartnerId: string | undefined = undefined;

    if (idx !== -1) {
      conversations[idx].lastMessage = msg.content;
      const now = new Date();
      conversations[idx].lastMessageTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const partner = conversations[idx].participants.find(p => p.id !== msg.senderId);
      if (partner) {
        targetPartnerId = partner.id;
        conversations[idx].unreadCount = (conversations[idx].unreadCount || 0) + 1;
      }
      setLocal('inivra_conversations', conversations);
      this.syncToFirestore('conversations', msg.conversationId, conversations[idx]);
    }
    this.syncToFirestore(`conversations/${msg.conversationId}/messages`, msg.id, msg);

    // Create a real notification for the recipient
    if (targetPartnerId) {
      this.addNotification({
        userId: targetPartnerId,
        title: `New message from ${msg.senderName}`,
        message: msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content,
        type: 'message'
      });
    }

    // Emit live window event so active components update without page reload
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inivra_message_event', { 
        detail: { message: msg, conversationId: msg.conversationId, recipientId: targetPartnerId } 
      }));
    }
  }

  createConversation(partnerId: string, partnerName: string, partnerAvatar: string, partnerRole: string, currentUserId: string): string {
    const conversations = getLocal<Conversation[]>('inivra_conversations', seedConversations);
    const existing = conversations.find(c => 
      c.participants.some(p => p.id === partnerId) && 
      c.participants.some(p => p.id === currentUserId)
    );
    if (existing) return existing.id;

    const currentUser = this.getProfile(currentUserId);
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      participants: [
        { id: currentUserId, name: currentUser?.name || 'You', avatar: currentUser?.avatar || '', role: currentUser?.role || 'Student' },
        { id: partnerId, name: partnerName, avatar: partnerAvatar, role: partnerRole as any }
      ],
      lastMessage: 'Conversation opened',
      lastMessageTime: 'Just now',
      unreadCount: 0
    };
    conversations.unshift(newConv);
    setLocal('inivra_conversations', conversations);
    this.syncToFirestore('conversations', newId, newConv);
    return newId;
  }

  // Notifications
  getNotifications(userId?: string): InivraNotification[] {
    const all = getLocal<InivraNotification[]>('inivra_notifications', seedNotifications);
    if (!userId) return all;
    return all.filter(n => !n.userId || n.userId === userId);
  }
  addNotification(not: Omit<InivraNotification, 'id' | 'date' | 'read'> & { userId?: string }): void {
    const notifications = getLocal<InivraNotification[]>('inivra_notifications', seedNotifications);
    const newNot: InivraNotification = {
      ...not,
      id: `not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNot);
    setLocal('inivra_notifications', notifications);
    this.syncToFirestore('notifications', newNot.id, newNot);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inivra_notification_event', { detail: newNot }));
    }
  }
  markNotificationAsRead(id: string): void {
    const notifications = getLocal<InivraNotification[]>('inivra_notifications', seedNotifications);
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      setLocal('inivra_notifications', notifications);
    }
  }
  clearNotifications(userId?: string): void {
    const notifications = getLocal<InivraNotification[]>('inivra_notifications', seedNotifications);
    notifications.forEach(n => {
      if (!userId || n.userId === userId || !n.userId) {
        n.read = true;
      }
    });
    setLocal('inivra_notifications', notifications);
  }

  // Financial records
  getFinanceRecords(): FinancialRecord[] {
    return getLocal<FinancialRecord[]>('inivra_finance', seedFinance);
  }
  addFinancialRecord(rec: Omit<FinancialRecord, 'id' | 'date' | 'status'>): void {
    const records = this.getFinanceRecords();
    const newRec: FinancialRecord = {
      ...rec,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed'
    };
    records.unshift(newRec);
    setLocal('inivra_finance', records);
  }

  // Authenticaton & Accounts Suite
  getAccounts(): UserAccount[] {
    const list = getLocal<UserAccount[]>('inivra_accounts', seedAccounts);
    for (const seed of seedAccounts) {
      if (!list.some(a => a.email.toLowerCase().trim() === seed.email.toLowerCase().trim())) {
        list.push(seed);
      }
    }
    return list;
  }

  getAccount(id: string): UserAccount | undefined {
    return this.getAccounts().find(a => a.id === id);
  }

  getAccountByEmail(email: string): UserAccount | undefined {
    const emailLower = email.toLowerCase().trim();
    return this.getAccounts().find(a => a.email.toLowerCase().trim() === emailLower);
  }

  saveAccount(account: UserAccount): void {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === account.id);
    if (idx !== -1) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    setLocal('inivra_accounts', accounts);
  }

  // School Registrations and Approvals
  getSchoolApprovals(): SchoolApproval[] {
    return getLocal<SchoolApproval[]>('inivra_school_approvals', seedSchoolApprovals);
  }

  getSchoolApproval(id: string): SchoolApproval | undefined {
    return this.getSchoolApprovals().find(s => s.id === id);
  }

  getSchoolApprovalByEmail(email: string): SchoolApproval | undefined {
    const emailLower = email.toLowerCase().trim();
    return this.getSchoolApprovals().find(s => s.adminEmail.toLowerCase().trim() === emailLower);
  }

  saveSchoolApproval(approval: SchoolApproval): void {
    const approvals = this.getSchoolApprovals();
    const idx = approvals.findIndex(s => s.id === approval.id);
    if (idx !== -1) {
      approvals[idx] = approval;
    } else {
      approvals.push(approval);
    }
    setLocal('inivra_school_approvals', approvals);
    this.syncToFirestore('schoolApprovals', approval.id, approval);
  }

  // Security and Session Utilities
  logSecurityEvent(accountId: string, action: string, ipAddress: string, status: SecurityLog['status']): void {
    const account = this.getAccount(accountId);
    if (!account) return;

    const newLog: SecurityLog = {
      id: `seclog-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      timestamp: new Date().toISOString(),
      ipAddress,
      status
    };

    account.securityLogs = account.securityLogs || [];
    account.securityLogs.unshift(newLog);
    // Keep last 100 logs
    if (account.securityLogs.length > 100) {
      account.securityLogs = account.securityLogs.slice(0, 100);
    }
    this.saveAccount(account);
  }

  addSession(accountId: string, session: ActiveSession): void {
    const account = this.getAccount(accountId);
    if (!account) return;

    account.activeSessions = account.activeSessions || [];
    account.activeSessions.unshift(session);
    this.saveAccount(account);
  }

  revokeSession(accountId: string, sessionId: string): void {
    const account = this.getAccount(accountId);
    if (!account) return;

    account.activeSessions = (account.activeSessions || []).filter(s => s.sessionId !== sessionId);
    this.saveAccount(account);
    
    // Also trigger notification
    this.addNotification({
      title: 'Session Revoked',
      message: `An active login session on browser was successfully revoked and logged out.`,
      type: 'system'
    });
  }

  clearSessions(accountId: string): void {
    const account = this.getAccount(accountId);
    if (!account) return;
    account.activeSessions = [];
    this.saveAccount(account);
  }
}

export const db = new InivraDatabase();
