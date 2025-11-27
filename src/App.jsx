import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  PenTool, 
  Briefcase, 
  Utensils, 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Users,
  Box,
  MonitorPlay,
  ClipboardList, 
  Clock3,
  Menu,
  Lock,
  Unlock,
  Check,
  X,
  Eye, 
  CalendarPlus,
  Save // Added Save icon
} from 'lucide-react';
import { db } from './firebase-config'; // Import database connection
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

import salpointeLogo from './SC-LOGO-RGB.png'; 

const Departments = {
  FILM: 'film',
  GRAPHIC: 'graphic',
  BUSINESS: 'business',
  CULINARY: 'culinary',
  PHOTO: 'photo',
  CALENDAR: 'calendar',
  QUEUE: 'queue'
};

const getDraftKey = (deptTitle) => `salpointe_draft_${deptTitle}`;

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [submitted, setSubmitted] = useState(false);

  // Reset function to go back home
  const goHome = () => {
    setCurrentView('home');
    setSubmitted(false);
  };

  const isRequestView = ['home', Departments.FILM, Departments.GRAPHIC, Departments.BUSINESS, Departments.CULINARY, Departments.PHOTO].includes(currentView);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={goHome}>
            {/* Logo */}
            <img src={salpointeLogo} alt="Salpointe Catholic Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-wide leading-tight">Salpointe Catholic</h1>
              <p className="text-[10px] md:text-xs text-red-200 uppercase tracking-wider">CTE Request Hub</p>
            </div>
          </div>
          
          {/* Global Navigation */}
          <nav className="flex items-center gap-1 md:gap-2 ml-auto">
            <button 
              onClick={goHome}
              className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${isRequestView ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}
            >
              <PenTool size={16} />
              <span className="hidden sm:inline">New Request</span>
            </button>
            <button 
              onClick={() => { setCurrentView(Departments.CALENDAR); setSubmitted(false); }}
              className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.CALENDAR ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Schedule</span>
            </button>
            <button 
              onClick={() => { setCurrentView(Departments.QUEUE); setSubmitted(false); }}
              className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.QUEUE ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}
            >
              <ClipboardList size={16} />
              <span className="hidden sm:inline">Queue</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {submitted ? (
          <SuccessView onReset={goHome} />
        ) : (
          <>
            {currentView === 'home' && <Dashboard onViewChange={setCurrentView} />}
            {currentView === Departments.FILM && <FilmForm setSubmitted={setSubmitted} />}
            {currentView === Departments.GRAPHIC && <GraphicDesignForm setSubmitted={setSubmitted} />}
            {currentView === Departments.BUSINESS && <BusinessForm setSubmitted={setSubmitted} />}
            {currentView === Departments.CULINARY && <CulinaryForm setSubmitted={setSubmitted} />}
            {currentView === Departments.PHOTO && <PhotoForm setSubmitted={setSubmitted} />}
            {currentView === Departments.CALENDAR && <CalendarView />}
            {currentView === Departments.QUEUE && <RequestQueueView />}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs md:text-sm py-8 px-4">
        &copy; {new Date().getFullYear()} Salpointe Catholic High School CTE Department
      </footer>
    </div>
  );

  // --- Sub-Components ---

  function SuccessView({ onReset }) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 text-center animate-fade-in-up mt-8 md:mt-16">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <CheckCircle size={32} className="md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Request Received!</h2>
        <p className="text-slate-600 mb-8 text-sm md:text-base">
          Your request has been saved to the database. You can track its status in the Queue.
        </p>
        <button 
          onClick={onReset}
          className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-lg hover:shadow-xl w-full text-sm md:text-base"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  function Dashboard({ onViewChange }) {
    const cards = [
      { 
        id: Departments.FILM, 
        title: "Film & TV", 
        icon: Video, 
        desc: "Checkout equipment (cameras, drones) or request event recording/broadcasting.",
        color: "bg-blue-50 text-blue-700 border-blue-200"
      },
      { 
        id: Departments.GRAPHIC, 
        title: "Graphic Design", 
        icon: PenTool, 
        desc: "Request creative assets like logos, posters, flyers, or website designs.",
        color: "bg-purple-50 text-purple-700 border-purple-200"
      },
      { 
        id: Departments.BUSINESS, 
        title: "Business", 
        icon: Briefcase, 
        desc: "Submit business plans for review or request consultation for student startups.",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200"
      },
      { 
        id: Departments.CULINARY, 
        title: "Culinary Arts", 
        icon: Utensils, 
        desc: "Request catering services for school clubs, faculty meetings, or special events.",
        color: "bg-orange-50 text-orange-700 border-orange-200"
      },
      { 
        id: Departments.PHOTO, 
        title: "Photography", 
        icon: Camera, 
        desc: "Reserve cameras/lenses or request a photographer for your event.",
        color: "bg-pink-50 text-pink-700 border-pink-200"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-full mb-2 md:mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome, Lancer.</h2>
          <p className="text-slate-600 text-sm md:text-base">Select a department below to start your request.</p>
        </div>
        
        {cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => onViewChange(card.id)}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-5 md:p-6 cursor-pointer transition-all hover:-translate-y-1 flex flex-col h-full active:scale-95 md:active:scale-100"
          >
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  // --- Shared Form Components ---

  function ContactSection({ initialData = {} }) {
    return (
      <div className="bg-slate-50 p-5 md:p-6 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={18} /> Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input name="fullName" type="text" defaultValue={initialData.fullName || ''} className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Salpointe Email</label>
            <input name="email" type="email" defaultValue={initialData.email || ''} className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" placeholder="jdoe@salpointe.org" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
            <select name="role" defaultValue={initialData.role || 'Student'} className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm bg-white">
              <option>Student</option>
              <option>Faculty / Staff</option>
              <option>Club Representative</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // --- Calendar Component ---

  function CalendarView() {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(null);
    const [filter, setFilter] = useState('all');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const q = query(collection(db, "requests")); 
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedEvents = snapshot.docs
              .map(doc => {
                  const data = doc.data();
                  // Determine which date field to use based on request type
                  let dateStr = data.eventDate || data.checkoutDate || data.pickupDate || data.deadline;
                  if (!dateStr) return null; 

                  // Create date object ensuring timezone issues don't shift the day
                  const [y, m, d] = dateStr.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);

                  return {
                      id: doc.id,
                      title: data.title || "Request",
                      dept: data.dept,
                      type: (data.requestType === 'checkout' || data.dept === 'Graphic') ? 'checkout' : 'event',
                      status: data.status,
                      date: dateObj,
                      // Keep original data for GCal link generation
                      ...data
                  };
              })
              .filter(e => e !== null && e.status === 'Approved'); // ONLY SHOW APPROVED
          
          setEvents(fetchedEvents);
          setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      return { days, firstDay, monthName: date.toLocaleString('default', { month: 'long' }), year };
    };

    const { days, firstDay, monthName, year } = getDaysInMonth(today);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const empties = Array.from({ length: firstDay }, (_, i) => i);

    const getEventsForDay = (dayNum) => {
      return events.filter(e => {
        return e.date.getDate() === dayNum && 
               e.date.getMonth() === today.getMonth() &&
               (filter === 'all' || e.dept === filter);
      });
    };

    // Generate Google Calendar Link
    const getGoogleCalendarUrl = (event) => {
      const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
      const text = `&text=${encodeURIComponent(`[${event.dept}] ${event.title}`)}`;
      const details = `&details=${encodeURIComponent(`Requested by: ${event.fullName}\nRole: ${event.role}\nDetails: ${event.details || event.brief || event.description || 'N/A'}`)}`;
      const location = `&location=${encodeURIComponent(event.location || 'Salpointe Catholic High School')}`;
      
      const y = event.date.getFullYear();
      const m = String(event.date.getMonth() + 1).padStart(2, '0');
      const d = String(event.date.getDate()).padStart(2, '0');
      const dateString = `${y}${m}${d}`;
      
      const nextDay = new Date(event.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const ny = nextDay.getFullYear();
      const nm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDay.getDate()).padStart(2, '0');
      const nextDateString = `${ny}${nm}${nd}`;

      const dates = `&dates=${dateString}/${nextDateString}`; 

      return `${baseUrl}${text}${dates}${details}${location}`;
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-red-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Calendar className="text-amber-400" size={24} /> Master Schedule
            </h2>
            <p className="text-red-200 text-sm">Approved requests and checkouts</p>
          </div>
          <div className="flex bg-red-800 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            <button onClick={() => setFilter('all')} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}>All</button>
            <button onClick={() => setFilter(Departments.FILM)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.FILM ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}>Film</button>
            <button onClick={() => setFilter(Departments.PHOTO)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.PHOTO ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}>Photo</button>
            <button onClick={() => setFilter(Departments.CULINARY)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.CULINARY ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}>Culinary</button>
          </div>
        </div>

        <div className="p-4 md:p-6">
           <div className="overflow-x-auto pb-2">
            {loading ? <div className="text-center py-8 text-slate-400">Loading schedule...</div> : (
              <div className="min-w-[600px] md:min-w-0 grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
                ))}
                {empties.map(i => <div key={`empty-${i}`} className="bg-white min-h-[80px] md:min-h-[100px]" />)}
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === today.getDate();
                  const isSelected = selectedDate === day;
                  
                  return (
                    <div 
                      key={day} 
                      className={`bg-white min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-t border-slate-100 relative group cursor-pointer transition-colors ${isSelected ? 'bg-red-50' : 'hover:bg-slate-50'}`} 
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                    >
                      <span className={`text-xs md:text-sm font-medium inline-block w-6 h-6 md:w-7 md:h-7 leading-6 md:leading-7 text-center rounded-full mb-1 ${isToday ? 'bg-red-900 text-white' : 'text-slate-700'}`}>{day}</span>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div key={event.id} className={`text-[10px] md:text-xs p-1 rounded border truncate ${event.type === 'checkout' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {selectedDate && (
            <div className="mt-4 md:mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
              <h4 className="font-bold text-slate-800 mb-3">Events for {monthName} {selectedDate}</h4>
              {getEventsForDay(selectedDate).length === 0 ? (
                <p className="text-slate-500 text-sm">No approved events for this day.</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDay(selectedDate).map(event => (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${event.type === 'checkout' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {event.type === 'checkout' ? <Box size={14} /> : <Calendar size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{event.title}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">{event.dept} Dept • {event.fullName}</p>
                        </div>
                      </div>
                      
                      {/* Google Calendar Button */}
                      <a 
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        <CalendarPlus size={14} />
                        <span className="hidden sm:inline">Add to Google Calendar</span>
                        <span className="sm:hidden">Add</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Real-Time Request Queue Component ---

  function RequestQueueView() {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [adminMode, setAdminMode] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null); 
    
    // FETCH REAL DATA
    useEffect(() => {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedDate: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
        }));
        setRequests(reqs);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
      const requestRef = doc(db, "requests", id);
      await updateDoc(requestRef, {
        status: newStatus
      });
      if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(prev => ({...prev, status: newStatus}));
      }
    };

    const handleDelete = async (id) => {
      if(window.confirm("Are you sure you want to delete this request?")) {
        await deleteDoc(doc(db, "requests", id));
        if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null);
      }
    };

    const toggleAdmin = () => {
      if (adminMode) {
        setAdminMode(false);
      } else {
        const pin = prompt("Enter Admin PIN:"); 
        if (pin === "1950") setAdminMode(true);
      }
    };

    const filteredRequests = filter === 'all' 
      ? requests 
      : requests.filter(r => r.dept?.toLowerCase().includes(filter.toLowerCase()));

    const getStatusColor = (status) => {
      switch(status) {
        case 'Approved': return 'bg-green-100 text-green-700';
        case 'Denied': return 'bg-red-100 text-red-700';
        case 'Completed': return 'bg-slate-100 text-slate-600';
        default: return 'bg-yellow-100 text-yellow-700'; 
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
        {/* MODAL FOR DETAILS */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Request Details</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedRequest.id}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Standard Info */}
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
                      <p className="font-semibold text-slate-800 text-lg capitalize">{selectedRequest.dept}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Submitted By</label>
                      <p className="text-slate-800">{selectedRequest.fullName}</p>
                      <p className="text-slate-500 text-xs">{selectedRequest.role}</p>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact</label>
                       <p className="text-slate-800">{selectedRequest.email}</p>
                    </div>
                     <div>
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Date Submitted</label>
                       <p className="text-slate-800">{selectedRequest.formattedDate}</p>
                    </div>
                 </div>
                 
                 <hr className="border-slate-100" />
                 
                 {/* Dynamic Details */}
                 <div>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-slate-400"/> Project / Event Information
                    </h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100">
                      {Object.entries(selectedRequest).map(([key, value]) => {
                        if(['id', 'dept', 'status', 'fullName', 'email', 'role', 'formattedDate', 'createdAt', 'title'].includes(key)) return null;
                        
                        const label = key.replace(/([A-Z])/g, ' $1').trim();
                        
                        if(Array.isArray(value)) return (
                           <div key={key}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                            <ul className="list-disc list-inside text-slate-700 text-sm bg-white p-2 rounded border border-slate-200">
                              {value.map((v, i) => <li key={i}>{v}</li>)}
                            </ul>
                           </div>
                        );

                        return (
                          <div key={key}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{value ? value.toString() : 'N/A'}</p>
                          </div>
                        )
                      })}
                    </div>
                 </div>
                 
                 {/* Admin Actions in Modal */}
                 {adminMode && (
                     <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                         <h4 className="font-bold text-indigo-900 mb-2 text-sm">Admin Actions</h4>
                         <div className="flex gap-3">
                            <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Approved')} className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm">Approve</button>
                            <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Denied')} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm">Deny</button>
                            <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Completed')} className="flex-1 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 font-medium text-sm">Mark Complete</button>
                         </div>
                     </div>
                 )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-xl">
                <button onClick={() => setSelectedRequest(null)} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-indigo-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="text-indigo-300" /> Request Status Queue
            </h2>
            <p className="text-indigo-200 text-sm">Real-time updates from database.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
             <button onClick={toggleAdmin} className="p-2 text-indigo-300 hover:text-white transition-colors" title="Admin Login">
               {adminMode ? <Unlock size={18} /> : <Lock size={18} />}
             </button>
            <select 
              className="flex-1 md:w-auto bg-indigo-800 text-white border border-indigo-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="film">Film</option>
              <option value="graphic">Graphic</option>
              <option value="business">Business</option>
              <option value="culinary">Culinary</option>
              <option value="photo">Photo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading requests...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Department</th>
                  <th className="p-4">Request Details</th>
                  <th className="p-4">Requester</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th> 
                  {adminMode && <th className="p-4">Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-700 font-medium text-sm capitalize">{req.dept}</td>
                    <td className="p-4 text-slate-800 font-semibold text-sm md:text-base">
                      {req.title || req.eventName || req.projectType || "General Request"}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{req.fullName}</td>
                    <td className="p-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-2 w-max">
                        <Clock3 size={14} /> {req.formattedDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4">
                         <button onClick={() => setSelectedRequest(req)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50" title="View Details">
                             <Eye size={20} />
                         </button>
                    </td>
                    {adminMode && (
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleStatusUpdate(req.id, 'Approved')} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve"><Check size={16}/></button>
                        <button onClick={() => handleStatusUpdate(req.id, 'Denied')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Deny"><X size={16}/></button>
                        <button onClick={() => handleDelete(req.id)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200" title="Delete"><span className="font-mono text-xs font-bold px-1">DEL</span></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredRequests.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No pending requests found.
            </div>
          )}
        </div>
      </div>
    );
  }

  function FormContainer({ title, icon: Icon, colorClass, children, setSubmitted }) {
    const formRef = useRef(null);
    const draftKey = getDraftKey(title);

    const handleSaveDraft = (e) => {
        e.preventDefault();
        const formData = new FormData(formRef.current);
        const data = {};
        for (const [key, value] of formData.entries()) {
             if (data[key]) {
                  if (!Array.isArray(data[key])) data[key] = [data[key]];
                  data[key].push(value);
             } else {
                  data[key] = value;
             }
        }
        localStorage.setItem(draftKey, JSON.stringify(data));
        alert('Draft saved! You can resume this form later on this device.');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = {};
      
      for (const [key, value] of formData.entries()) {
          if (data[key]) {
              if (!Array.isArray(data[key])) {
                  data[key] = [data[key]];
              }
              data[key].push(value);
          } else {
              data[key] = value;
          }
      }
      
      try {
        await addDoc(collection(db, "requests"), {
          ...data,
          dept: title,
          status: "Pending Review",
          createdAt: new Date(),
          title: data.eventName || data.projectType || data.businessName || "New Request" 
        });
        
        // Clear draft after successful submission
        localStorage.removeItem(draftKey);
        setSubmitted(true);
      } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error submitting request. See console.");
      }
    };

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className={`h-2 ${colorClass}`}></div>
        <div className="p-5 md:p-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-100">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
              <Icon size={24} className={`md:w-7 md:h-7 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">{title} Request</h2>
              <p className="text-slate-500 text-xs md:text-sm">Please fill out all details accurately.</p>
            </div>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit}>
            <ContactSection initialData={children.props.initialData} />
            {children}
            
            <div className="mt-8 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                <Save size={18} /> Save Draft
              </button>
              <button type="submit" className="w-full md:w-auto bg-red-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-lg active:scale-95 md:active:scale-100">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Department Specific Forms (Updated to have name attributes) ---

  function FilmForm({ setSubmitted }) {
    const title = 'Film';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    const [requestType, setRequestType] = useState(initialData.requestType || 'checkout'); 

    return (
      <FormContainer title={title} icon={Video} colorClass="bg-blue-600" setSubmitted={setSubmitted} initialData={initialData}>
        <input type="hidden" name="requestType" value={requestType} />
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}>
              <Box className="mx-auto mb-2" /> Equipment Checkout
            </button>
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}>
              <MonitorPlay className="mx-auto mb-2" /> Broadcasting/Recording Team
            </button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 mb-4"><strong>Note:</strong> Equipment must be returned by 8:00 AM the following school day.</div>
             <label className="block text-sm font-medium text-slate-700">
               Select Equipment Needed: <span className="text-red-500 text-xs font-normal ml-1">* Requires Training</span>
             </label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {['Cinema Camera Kit *', 'Gimbal / Stabilizer *', 'DJI Mic Kit (Wireless)', 'DJI Flip Drone *', 'Tripod', 'Lighting Kit'].map((item) => (
                 <label key={item} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors active:bg-blue-50">
                   <input type="checkbox" name="equipment" value={item} defaultChecked={initialData.equipment?.includes(item)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                   <span className="text-slate-700 text-sm">{item}</span>
                 </label>
               ))}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Checkout Date</label><input name="checkoutDate" defaultValue={initialData.checkoutDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
             </div>

             {/* Terms & Conditions */}
             <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                  <span className="text-sm text-slate-700 leading-tight">
                    <strong>Terms & Conditions:</strong> I agree to pay for equipment in full at market value in the event of damage beyond repair, lost, or stolen equipment.
                  </span>
                </label>
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label><input name="eventName" defaultValue={initialData.eventName} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Varsity Football" required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label><input name="startTime" defaultValue={initialData.startTime} type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Service Needed</label><select name="serviceType" defaultValue={initialData.serviceType} className="w-full rounded-md border-slate-300 border p-2.5 text-sm bg-white"><option>Live Broadcast (Stream)</option><option>Event Recording (Edited later)</option><option>Raw Footage Only</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Details</label><textarea name="details" defaultValue={initialData.details} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="Describe specifics..."></textarea></div>
          </div>
        )}
      </FormContainer>
    );
  }

  function GraphicDesignForm({ setSubmitted }) {
    const title = 'Graphic';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={PenTool} colorClass="bg-purple-600" setSubmitted={setSubmitted} initialData={initialData}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label><select name="projectType" defaultValue={initialData.projectType} className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white"><option>Event Poster / Flyer</option><option>Logo Design</option><option>Website Design</option><option>T-Shirt / Merch</option></select></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Dimensions</label><input name="dimensions" defaultValue={initialData.dimensions} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., 11x17" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label><input name="deadline" defaultValue={initialData.deadline} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Design Brief</label><textarea name="brief" defaultValue={initialData.brief} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-32" placeholder="Text content, colors, inspiration..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function BusinessForm({ setSubmitted }) {
    const title = 'Business';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={Briefcase} colorClass="bg-emerald-600" setSubmitted={setSubmitted} initialData={initialData}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label><input name="businessName" defaultValue={initialData.businessName} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="Project Alpha" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Assistance Needed</label><select name="assistanceType" defaultValue={initialData.assistanceType} className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white"><option>Business Plan Review</option><option>Financial Modeling Help</option><option>Marketing Strategy</option><option>General Mentorship</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Idea Description</label><textarea name="description" defaultValue={initialData.description} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-40" placeholder="Briefly describe your product..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function CulinaryForm({ setSubmitted }) {
    const title = 'Culinary';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={Utensils} colorClass="bg-orange-500" setSubmitted={setSubmitted} initialData={initialData}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label><input name="eventName" defaultValue={initialData.eventName} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Faculty Luncheon" required /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Serve Time</label><input name="serveTime" defaultValue={initialData.serveTime} type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Guest Count</label><input name="guestCount" defaultValue={initialData.guestCount} type="number" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" min="1" placeholder="50" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Service Style</label><select name="serviceStyle" defaultValue={initialData.serviceStyle} className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white"><option>Buffet Style</option><option>Boxed Lunches</option><option>Plated Service</option><option>Appetizers</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Menu/Dietary Notes</label><textarea name="menuNotes" defaultValue={initialData.menuNotes} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="Preferences, allergies..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function PhotoForm({ setSubmitted }) {
    const title = 'Photo';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    const [requestType, setRequestType] = useState(initialData.requestType || 'service'); 
    return (
      <FormContainer title={title} icon={Camera} colorClass="bg-pink-600" setSubmitted={setSubmitted} initialData={initialData}>
        <input type="hidden" name="requestType" value={requestType} />
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}><Users className="mx-auto mb-2" /> Event Coverage</button>
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}><Box className="mx-auto mb-2" /> Equipment Checkout</button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-pink-50 p-4 rounded-md border border-pink-100 text-sm text-pink-800 mb-4"><strong>Requirement:</strong> Photo I completion required.</div>
             <label className="block text-sm font-medium text-slate-700">Select Equipment Needed:</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {['DSLR Camera Body', 'Zoom Lens (18-55mm)', 'Telephoto Lens (70-200mm)', 'Portrait Lens (50mm)', 'SD Card Reader', 'Tripod', 'Flash Unit'].map((item) => (
                 <label key={item} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer active:bg-pink-50">
                   <input type="checkbox" name="equipment" value={item} defaultChecked={initialData.equipment?.includes(item)} className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                   <span className="text-slate-700 text-sm">{item}</span>
                 </label>
               ))}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date</label><input name="pickupDate" defaultValue={initialData.pickupDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
             </div>

             {/* Terms & Conditions for Photo as well */}
             <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300" />
                  <span className="text-sm text-slate-700 leading-tight">
                    <strong>Terms & Conditions:</strong> I agree to pay for equipment in full at market value in the event of damage beyond repair, lost, or stolen equipment.
                  </span>
                </label>
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label><input name="eventName" defaultValue={initialData.eventName} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Homecoming" required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label><input name="startTime" defaultValue={initialData.startTime} type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><input name="location" defaultValue={initialData.location} type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Gym" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Specific Shots</label><textarea name="shotList" defaultValue={initialData.shotList} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="Key moments..."></textarea></div>
          </div>
        )}
      </FormContainer>
    );
  }
};

export default App;