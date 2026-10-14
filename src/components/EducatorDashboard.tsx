import React, { useState } from 'react';
import { db } from '../InivraDatabase';
import { MarketplaceProduct, Booking, UserProfile, FinancialRecord } from '../types';
import { 
  Sparkles, Plus, Wallet, FileText, Check, Landmark, CalendarRange, 
  Trash, Award, TrendingUp, DollarSign, LogOut
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import EmptyState from './EmptyState';

interface EducatorDashboardProps {
  currentUserId: string;
  onLogout?: () => void;
}

export default function EducatorDashboard({ currentUserId, onLogout }: EducatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'products' | 'wallet'>('profile');

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tab, role } = customEvent.detail || {};
      if (role && role !== 'Educator') return;

      if (tab === 'classes' || tab === 'schedule') {
        setActiveTab('schedule');
      } else if (tab === 'homework' || tab === 'products') {
        setActiveTab('products');
      }
    };
    window.addEventListener('inivra-navigation', handleNav);
    return () => window.removeEventListener('inivra-navigation', handleNav);
  }, []);

  // Fetch state from DB
  const [profile, setProfile] = useState<UserProfile | undefined>(db.getProfile(currentUserId));
  const [bookings, setBookings] = useState<Booking[]>(db.getBookings().filter(b => b.tutorId === currentUserId));
  const [products, setProducts] = useState<MarketplaceProduct[]>(db.getProducts().filter(p => p.authorId === currentUserId));
  const [financeRecords, setFinanceRecords] = useState<FinancialRecord[]>(db.getFinanceRecords().filter(r => r.referenceId === currentUserId || r.type === 'Sale'));

  // Digital product creation form state
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('8.50');
  const [prodCategory, setProdCategory] = useState<'Worksheet' | 'PPT' | 'Exam Paper' | 'PDF Note'>('Worksheet');

  // Payout request State
  const [payoutAmount, setPayoutAmount] = useState('150');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Recharts Revenue over months (Seeding David Miller earnings log)
  const revenueData = [
    { month: 'Feb', earnings: 450 },
    { month: 'Mar', earnings: 1200 },
    { month: 'Apr', earnings: 890 },
    { month: 'May', earnings: 1540 },
    { month: 'Jun', earnings: 1890 }
  ];

  // Modify educator profile settings
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    db.updateProfile(profile);
    setProfile(db.getProfile(currentUserId));
    alert("Profile settings successfully synchronized in local storage!");
  };

  // Publish worksheet/digital notes to public store
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle) return;

    const newProd: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      title: prodTitle,
      description: prodDesc,
      category: prodCategory as any,
      price: parseFloat(prodPrice) || 5.00,
      authorId: currentUserId,
      authorName: profile?.name || 'Coach David Miller',
      authorAvatar: profile?.avatar || '',
      downloads: 0,
      rating: 5.0,
      fileUrl: `${prodTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      uploadedAt: new Date().toISOString().split('T')[0],
      reviews: []
    };

    db.saveProduct(newProd);
    setProducts(db.getProducts().filter(p => p.authorId === currentUserId));
    setProdTitle('');
    setProdDesc('');
    alert(`Resource "${prodTitle}" published successfully! Accessible now under the public digital marketplace.`);
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    const all = db.getProducts();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem('inivra_products', JSON.stringify(filtered));
    setProducts(db.getProducts().filter(p => p.authorId === currentUserId));
  };

  // Request Stripe Payout withdrawal
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const amt = parseFloat(payoutAmount);
    if (amt <= 0 || amt > profile.balance) {
      alert("Invalid withdrawal amount. Exceeds current wallet balance.");
      return;
    }

    // Deduct and log transaction
    profile.balance -= amt;
    db.updateProfile(profile);
    db.addFinancialRecord({
      amount: -amt,
      type: 'Payout',
      description: `Stripe Payout Withdrawal approved to Bank coordinate`,
      referenceId: currentUserId
    });

    setProfile(db.getProfile(currentUserId));
    setFinanceRecords(db.getFinanceRecords().filter(r => r.referenceId === currentUserId || r.type === 'Payout'));
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  return (
    <div id="educator-dashboard" className="space-y-6">
      
      {/* Educator Header with Log Out action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Educator Workspace</h2>
          <p className="text-xs text-slate-500">Manage digital downloads, student appointments, and Stripe payout requests.</p>
        </div>
        <button
          id="educator-logout-btn"
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              window.dispatchEvent(new CustomEvent('inivra-logout'));
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Wallet balance top overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between border border-indigo-850">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-indigo-300 font-mono tracking-wider">Independent Earnings</span>
            <h2 className="text-3xl font-extrabold font-mono">${profile?.balance.toFixed(2) || "0.00"}</h2>
            <p className="text-xs text-indigo-200">Stripe split balances cleared</p>
          </div>
          <Wallet className="w-12 h-12 text-indigo-400 stroke-1" />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 font-mono tracking-wider">Total Sales Downloads</span>
            <h2 className="text-2xl font-extrabold text-slate-800 font-mono">
              {products.reduce((acc, p) => acc + (p.downloads || 0), 0)} Downloads
            </h2>
            <p className="text-xs text-slate-500">Resource Store commission processed</p>
          </div>
          <FileText className="w-10 h-10 text-slate-300 stroke-1" />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 font-mono tracking-wider">Private Bookings Schedule</span>
            <h2 className="text-2xl font-extrabold text-slate-800 font-mono">{bookings.length} Session slots</h2>
            <p className="text-xs text-slate-500">1-on-1 private tutoring calendar</p>
          </div>
          <CalendarRange className="w-10 h-10 text-slate-300 stroke-1" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          My Tutor Profile Settings
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          My Booking Schedule
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          My Marketplace Resources
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'wallet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Payout Wallet & Revenue Charts
        </button>
      </div>

      {/* RENDER TAB SECTIONS */}

      {activeTab === 'profile' && profile && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">Public Tutor Profile Parameters</h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Define your credentials, subject competencies, hourly pricing structures, and bio summaries.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Hourly rate ($ USD)</label>
                <input 
                  type="number"
                  value={profile.hourlyRate || 0}
                  onChange={e => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Subject credentials</label>
                <input 
                  type="text"
                  value={profile.subjects?.join(', ') || ''}
                  onChange={e => setProfile({ ...profile, subjects: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g. AP Physics, Calculus, Mechanics"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Experience duration</label>
                <input 
                  type="text"
                  value={profile.experience || ''}
                  onChange={e => setProfile({ ...profile, experience: e.target.value })}
                  placeholder="e.g. 20 Years Teaching"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold uppercase">Bio description (displays on search directory)</label>
              <textarea 
                rows={3}
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all shadow"
            >
              Synchronize Profile Settings
            </button>
          </form>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Tutoring Booking ledger</h3>
          <div className="space-y-3">
            {bookings.length > 0 ? (
              bookings.map(book => (
                <div key={book.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-slate-900">Student: {book.studentName}</h4>
                    <p className="text-xs text-slate-500 font-mono">Date: {book.date} • Session time: {book.time} ({book.duration} mins) • Price: ${book.price}</p>
                    {book.notes && <p className="text-[11px] text-slate-400 font-light mt-1">Goal: "{book.notes}"</p>}
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-2 py-0.5 rounded uppercase">Confirmed</span>
                </div>
              ))
            ) : (
              <EmptyState
                icon={CalendarRange}
                title="No tutoring bookings yet"
                description="When students book 1-on-1 private tutoring sessions with you, they will appear on this schedule."
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Product Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base">Publish Digital worksheet</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Resource Title</label>
                <input 
                  type="text" 
                  required
                  value={prodTitle}
                  onChange={e => setProdTitle(e.target.value)}
                  placeholder="e.g. Classical Mechanics Exam review"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-semibold uppercase">Category</label>
                  <select 
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Worksheet">Worksheet</option>
                    <option value="PPT">Lecture slides</option>
                    <option value="Exam Paper">Exam Paper</option>
                    <option value="PDF Note">Revision Notes</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-semibold uppercase">Price ($ USD)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Resource description</label>
                <textarea 
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="Provide instructions or outline what pages and answers are included..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-md transition-colors"
              >
                Publish on Digital Marketplace
              </button>
            </form>
          </div>

          {/* Published Products Roster */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">My Published Store files</h3>
            
            {products.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No published resources yet"
                description="Publish study guides, exam papers, or revision slides using the form on the left."
              />
            ) : (
              <div className="space-y-3">
                {products.map(prod => (
                  <div key={prod.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900">{prod.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Price: ${prod.price.toFixed(2)} • Category: {prod.category} • Sales: {prod.downloads}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'wallet' && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue chart with Area chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tutoring Revenue analytics</h3>
              <span className="text-xs text-slate-500 font-mono">Monthly earnings performance</span>
            </div>

            {financeRecords.length === 0 && (profile?.balance || 0) === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No earnings recorded yet"
                description="Your monthly earnings performance analytics will populate as students purchase your worksheets or book sessions."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="earnings" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Stripe withdrawal parameters */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Request Bank payout</h3>
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Amount to withdraw ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Maximum Available: ${profile.balance.toFixed(2)}</span>
              </div>

              {payoutSuccess ? (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-center text-xs">
                  Withdrawal processed! Balance deducted.
                </div>
              ) : (
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-md transition-colors"
                >
                  Request Stripe Withdrawal
                </button>
              )}
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
