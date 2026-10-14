import React, { useState } from 'react';
import { db } from '../InivraDatabase';
import { UserProfile, MarketplaceProduct, Booking, FinancialRecord } from '../types';
import { Search, Sparkles, Filter, ShieldCheck, FileText, CheckCircle, Award, Calendar, DollarSign } from 'lucide-react';

interface EducatorsMarketplaceProps {
  currentUserId: string;
}

export default function EducatorsMarketplace({ currentUserId }: EducatorsMarketplaceProps) {
  // Database logs
  const [profiles, setProfiles] = useState<UserProfile[]>(db.getProfiles());
  const [products, setProducts] = useState<MarketplaceProduct[]>(db.getProducts());
  const tutorList = profiles.filter(p => p.role === 'Educator' && p.isVerified);

  // Search/Filters State
  const [tutorQuery, setTutorQuery] = useState('');
  const [maxRate, setMaxRate] = useState('100');
  const [resourceCategory, setResourceCategory] = useState<string>('All');

  // Interactive booking Modal State
  const [bookingTutor, setBookingTutor] = useState<UserProfile | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-07-20');
  const [bookingTime, setBookingTime] = useState('15:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter lists
  const filteredTutors = tutorList.filter(t => {
    const matchName = t.name.toLowerCase().includes(tutorQuery.toLowerCase()) || 
                      t.subjects?.some(s => s.toLowerCase().includes(tutorQuery.toLowerCase()));
    const matchPrice = (t.hourlyRate || 0) <= parseInt(maxRate);
    return matchName && matchPrice;
  });

  const filteredProducts = products.filter(p => {
    if (resourceCategory === 'All') return true;
    return p.category === resourceCategory;
  });

  // Action: Book a tutor
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTutor) return;

    const studentProfile = db.getProfile(currentUserId);
    if (!studentProfile) return;

    const sessionPrice = bookingTutor.hourlyRate || 40.00;

    // Check balance
    if (studentProfile.balance < sessionPrice) {
      alert("Insufficient account balance. Please top up funds or link a Stripe account first.");
      return;
    }

    // Deduct student, credit tutor
    studentProfile.balance -= sessionPrice;
    bookingTutor.balance += sessionPrice;

    db.updateProfile(studentProfile);
    db.updateProfile(bookingTutor);

    // Save Booking
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      studentId: currentUserId,
      studentName: studentProfile.name,
      tutorId: bookingTutor.id,
      tutorName: bookingTutor.name,
      tutorAvatar: bookingTutor.avatar,
      date: bookingDate,
      time: bookingTime,
      duration: 60,
      price: sessionPrice,
      status: 'Scheduled',
      videoCallId: `vc-${Date.now()}`,
      notes: bookingNotes
    };

    db.saveBooking(newBooking);

    // Logs
    db.addFinancialRecord({
      amount: -sessionPrice,
      type: 'Booking',
      description: `Booked 1-on-1 review with Tutor ${bookingTutor.name}`,
      referenceId: currentUserId
    });

    db.addFinancialRecord({
      amount: sessionPrice,
      type: 'Booking',
      description: `Student booked private lesson: ${studentProfile.name}`,
      referenceId: bookingTutor.id
    });

    db.addNotification({
      title: 'Tutor Booking Confirmed',
      message: `Your private lesson with Coach David Miller is scheduled on ${bookingDate} at ${bookingTime}.`,
      type: 'system'
    });

    setProfiles(db.getProfiles());
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingTutor(null);
      setBookingNotes('');
    }, 2500);
  };

  // Action: Purchase Worksheet / resource
  const handlePurchaseProduct = (prod: MarketplaceProduct) => {
    const buyerProfile = db.getProfile(currentUserId);
    const authorProfile = db.getProfile(prod.authorId);

    if (!buyerProfile) return;

    if (buyerProfile.balance < prod.price) {
      alert("Insufficient funds to complete marketplace purchase. Top up your Inivra Parent account.");
      return;
    }

    // Deduct and credit
    buyerProfile.balance -= prod.price;
    if (authorProfile) {
      authorProfile.balance += prod.price;
      db.updateProfile(authorProfile);
    }

    db.updateProfile(buyerProfile);

    // Record logs
    db.addFinancialRecord({
      amount: -prod.price,
      type: 'Sale',
      description: `Purchased study document: ${prod.title}`,
      referenceId: currentUserId
    });

    if (authorProfile) {
      db.addFinancialRecord({
        amount: prod.price,
        type: 'Sale',
        description: `Worksheet sale: ${prod.title}`,
        referenceId: prod.authorId
      });
    }

    // Update Product download count
    prod.downloads += 1;
    db.saveProduct(prod);

    db.addNotification({
      title: 'Material Purchase Successful',
      message: `You successfully bought "${prod.title}" for $${prod.price.toFixed(2)}. The document download is now ready.`,
      type: 'system'
    });

    setProfiles(db.getProfiles());
    setProducts(db.getProducts());
    alert(`Stripe split checkout successful! Deducted $${prod.price.toFixed(2)} from balance. Document downloads have commenced.`);
  };

  return (
    <div id="marketplace-page" className="space-y-8">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase bg-indigo-800 px-3 py-1 rounded-full font-mono border border-indigo-700">Educators & Resources</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The Inivra Hub</h2>
          <p className="text-indigo-200 text-sm font-light">Book 1-on-1 private tutoring slots or purchase high school preparatory worksheet materials.</p>
        </div>
        <div className="bg-slate-900/60 border border-indigo-800 px-5 py-3 rounded-2xl text-center space-y-0.5">
          <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase">Linked Stripe Wallet Balance</p>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">
            ${db.getProfile(currentUserId)?.balance.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Find verified tutors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Book 1-on-1 Private Tutoring sessions</h3>
            
            {/* Filtering parameters */}
            <div className="grid sm:grid-cols-2 gap-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={tutorQuery}
                  onChange={e => setTutorQuery(e.target.value)}
                  placeholder="Search tutors by name or subject (e.g. AP Physics)..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-mono">Max Rate:</span>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  value={maxRate}
                  onChange={e => setMaxRate(e.target.value)}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-xs font-bold text-indigo-600 font-mono">${maxRate}/hr</span>
              </div>
            </div>

            {/* Tutors Cards Roster */}
            <div className="space-y-4">
              {filteredTutors.map(t => (
                <div key={t.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-indigo-200 transition-all">
                  <div className="flex gap-3 items-start">
                    {t.avatar ? (
                      <img referrerPolicy="no-referrer" src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200 shrink-0">
                        {t.name ? t.name.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal font-light">{t.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {t.subjects?.map((sub, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">{sub}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">${t.hourlyRate}/hr</span>
                      <p className="text-[9px] text-slate-400 font-mono">{t.experience}</p>
                    </div>
                    <button
                      onClick={() => setBookingTutor(t)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-colors"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Digital products resources */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-slate-900 text-sm">Downloadable Worksheets</h3>
              <select 
                value={resourceCategory}
                onChange={e => setResourceCategory(e.target.value)}
                className="text-[10px] font-mono border border-slate-200 rounded p-1"
              >
                <option value="All">All Categories</option>
                <option value="Worksheet">Worksheet</option>
                <option value="PPT">Lecture slides</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="p-4 border border-slate-200 rounded-xl space-y-3 hover:border-indigo-150 transition-all">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{prod.title}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">Author: {prod.authorName}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-light leading-normal">{prod.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-xs font-extrabold text-slate-850 font-mono">${prod.price.toFixed(2)}</span>
                    <button
                      onClick={() => handlePurchaseProduct(prod)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-[10px] uppercase rounded-lg transition-colors border border-indigo-100"
                    >
                      Buy File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Booking Scheduling Modal overlay */}
      {bookingTutor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-150 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Schedule 1-on-1 private lesson</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Tutor: {bookingTutor.name} • hourlyRate: ${bookingTutor.hourlyRate}/hr</p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-semibold uppercase">Lesson Date</label>
                  <input 
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-semibold uppercase">Lesson Start Time</label>
                  <input 
                    type="time"
                    required
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold uppercase">Private Notes / Topics to study</label>
                <textarea 
                  rows={3}
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  placeholder="Tell your tutor which concepts you want to study (e.g. natural logarithms, graphing curves)..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {bookingSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Booking Successful! Balance deducted.
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setBookingTutor(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl shadow shadow-indigo-600/10 transition-colors"
                  >
                    Confirm & Book Lesson
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
