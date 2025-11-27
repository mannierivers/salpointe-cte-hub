import React, { useState } from 'react';
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
  Menu 
} from 'lucide-react';

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
            {/* Replaced the 'S' div with the imported logo */}
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
            {currentView === Departments.FILM && <FilmForm />}
            {currentView === Departments.GRAPHIC && <GraphicDesignForm />}
            {currentView === Departments.BUSINESS && <BusinessForm />}
            {currentView === Departments.CULINARY && <CulinaryForm />}
            {currentView === Departments.PHOTO && <PhotoForm />}
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
          Your request has been forwarded to the department head. You will receive a confirmation email shortly at your school address.
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

  function ContactSection() {
    return (
      <div className="bg-slate-50 p-5 md:p-6 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={18} /> Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input type="text" className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Salpointe Email</label>
            <input type="email" className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" placeholder="jdoe@salpointe.org" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
            <select className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm bg-white">
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

    // Generate some mock events relative to today
    const generateEvents = () => {
      const events = [];
      const types = ['checkout', 'event'];
      // ... same logic as before
      events.push({ id: 1, title: 'Varsity Football vs. Walden Grove', dept: Departments.FILM, type: 'event', offset: 2 });
      events.push({ id: 2, title: 'Homecoming Assembly Photos', dept: Departments.PHOTO, type: 'event', offset: 5 });
      events.push({ id: 3, title: 'Faculty Luncheon Catering', dept: Departments.CULINARY, type: 'event', offset: 7 });
      events.push({ id: 4, title: 'Cinema Camera Kit #1', dept: Departments.FILM, type: 'checkout', offset: 1 });
      events.push({ id: 5, title: 'Canon DSLR Kit A', dept: Departments.PHOTO, type: 'checkout', offset: 3 });
      events.push({ id: 6, title: 'DJI Drone (M. Johnson)', dept: Departments.FILM, type: 'checkout', offset: 0 });
      
      return events.map(e => {
        const d = new Date();
        d.setDate(today.getDate() + e.offset);
        return { ...e, date: d };
      });
    };

    const events = generateEvents();

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

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-red-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Calendar className="text-amber-400" size={24} /> Master Schedule
            </h2>
            <p className="text-red-200 text-sm">View availability and upcoming events</p>
          </div>
          <div className="flex bg-red-800 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter(Departments.FILM)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.FILM ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}
            >
              Film
            </button>
            <button 
              onClick={() => setFilter(Departments.PHOTO)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.PHOTO ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}
            >
              Photo
            </button>
            <button 
              onClick={() => setFilter(Departments.CULINARY)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${filter === Departments.CULINARY ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}
            >
              Culinary
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">{monthName} {year}</h3>
            <div className="flex gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
                <span className="text-slate-600">Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></div>
                <span className="text-slate-600">Events</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid Wrapper for horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] md:min-w-0 grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
              
              {empties.map(i => <div key={`empty-${i}`} className="bg-white min-h-[80px] md:min-h-[100px]" />)}
              
              {daysArray.map(day => {
                const dayEvents = getEventsForDay(day);
                const isToday = day === today.getDate();
                
                return (
                  <div 
                    key={day} 
                    className={`bg-white min-h-[80px] md:min-h-[100px] p-1 md:p-2 hover:bg-slate-50 transition-colors border-t border-slate-100 relative group cursor-pointer ${selectedDate === day ? 'bg-yellow-50' : ''}`}
                    onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                  >
                    <span className={`text-xs md:text-sm font-medium inline-block w-6 h-6 md:w-7 md:h-7 leading-6 md:leading-7 text-center rounded-full mb-1 ${isToday ? 'bg-red-900 text-white' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`text-[10px] md:text-xs p-1 rounded border truncate ${
                            event.type === 'checkout' 
                              ? 'bg-blue-50 border-blue-100 text-blue-700' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {selectedDate && (
            <div className="mt-4 md:mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
              <h4 className="font-bold text-slate-800 mb-3">Details for {monthName} {selectedDate}</h4>
              {getEventsForDay(selectedDate).length === 0 ? (
                <p className="text-slate-500 text-sm">No events scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDay(selectedDate).map(event => (
                    <div key={event.id} className="flex items-start gap-3 bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${event.type === 'checkout' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {event.type === 'checkout' ? <Box size={14} /> : <Calendar size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{event.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{event.dept} Dept • {event.type === 'checkout' ? 'Equipment Return' : 'Service Request'}</p>
                      </div>
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

  // --- Request Queue Component ---

  function RequestQueueView() {
    const [filter, setFilter] = useState('all');

    // Mock Data for the Queue
    const requests = [
      { id: 'REQ-1024', dept: 'Film & TV', title: 'Varsity Football Livestream', requester: 'Coach S.', date: 'Oct 24', status: 'Approved', statusColor: 'bg-green-100 text-green-700' },
      { id: 'REQ-1025', dept: 'Culinary', title: 'NHS Induction Ceremony Catering', requester: 'Mrs. L.', date: 'Oct 25', status: 'Pending Review', statusColor: 'bg-yellow-100 text-yellow-700' },
      { id: 'REQ-1026', dept: 'Graphic Design', title: 'Kairos Retreat T-Shirts', requester: 'Campus Min.', date: 'Oct 26', status: 'In Progress', statusColor: 'bg-blue-100 text-blue-700' },
      { id: 'REQ-1027', dept: 'Photo', title: 'Senior Panorama', requester: 'Yearbook', date: 'Oct 26', status: 'Pending Review', statusColor: 'bg-yellow-100 text-yellow-700' },
      { id: 'REQ-1028', dept: 'Business', title: 'DECA Pitch Deck Review', requester: 'Student Team A', date: 'Oct 27', status: 'Completed', statusColor: 'bg-slate-100 text-slate-600' },
      { id: 'REQ-1029', dept: 'Film & TV', title: 'Sony A7S III Kit Checkout', requester: 'Adv. Film Student', date: 'Oct 27', status: 'Approved', statusColor: 'bg-green-100 text-green-700' },
      { id: 'REQ-1030', dept: 'Graphic Design', title: 'Winter Concert Program', requester: 'Fine Arts', date: 'Oct 28', status: 'Pending Review', statusColor: 'bg-yellow-100 text-yellow-700' },
    ];

    const filteredRequests = filter === 'all' 
      ? requests 
      : requests.filter(r => r.dept.toLowerCase().includes(filter.toLowerCase()));

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-indigo-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="text-indigo-300" /> Request Status Queue
            </h2>
            <p className="text-indigo-200 text-sm">Track the progress of project and equipment requests.</p>
          </div>
          
          <select 
            className="w-full md:w-auto bg-indigo-800 text-white border border-indigo-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="film">Film & TV</option>
            <option value="graphic">Graphic Design</option>
            <option value="business">Business</option>
            <option value="culinary">Culinary</option>
            <option value="photo">Photography</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Request Details</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-400 font-mono text-xs">{req.id}</td>
                  <td className="p-4 text-slate-700 font-medium text-sm">{req.dept}</td>
                  <td className="p-4 text-slate-800 font-semibold text-sm md:text-base">{req.title}</td>
                  <td className="p-4 text-slate-600 text-sm">{req.requester}</td>
                  <td className="p-4 text-slate-500 text-sm">
                    <div className="flex items-center gap-2 w-max">
                      <Clock3 size={14} /> {req.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${req.statusColor}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No pending requests found for this filter.
            </div>
          )}
        </div>
      </div>
    );
  }

  function FormContainer({ title, icon: Icon, colorClass, children }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      // Simulate API call
      setTimeout(() => setSubmitted(true), 800);
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
          
          <form onSubmit={handleSubmit}>
            <ContactSection />
            {children}
            
            <div className="mt-8 flex justify-end">
              <button type="submit" className="w-full md:w-auto bg-red-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-lg active:scale-95 md:active:scale-100">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Department Specific Forms ---

  function FilmForm() {
    const [requestType, setRequestType] = useState('checkout'); // 'checkout' or 'service'

    return (
      <FormContainer title="Film & TV" icon={Video} colorClass="bg-blue-600">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRequestType('checkout')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <Box className="mx-auto mb-2" />
              Equipment Checkout
            </button>
            <button 
              type="button"
              onClick={() => setRequestType('service')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <MonitorPlay className="mx-auto mb-2" />
              Broadcasting/Recording Team
            </button>
          </div>
        </div>

        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 mb-4">
              <strong>Note:</strong> Equipment must be returned by 8:00 AM the following school day unless approved otherwise.
            </div>
            <label className="block text-sm font-medium text-slate-700">Select Equipment Needed:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Cinema Camera Kit', 'Gimbal / Stabilizer', 'DJI Mic Kit (Wireless)', 'DJI Flip Drone', 'Tripod', 'Lighting Kit'].map((item) => (
                <label key={item} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors active:bg-blue-50">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Checkout Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
              <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Varsity Football vs. Walden Grove" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Needed</label>
              <select className="w-full rounded-md border-slate-300 border p-2.5 text-sm bg-white">
                <option>Live Broadcast (Stream)</option>
                <option>Event Recording (Edited later)</option>
                <option>Raw Footage Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Details / Location</label>
              <textarea className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="Describe specific shots needed or location details..."></textarea>
            </div>
          </div>
        )}
      </FormContainer>
    );
  }

  function GraphicDesignForm() {
    return (
      <FormContainer title="Graphic Design" icon={PenTool} colorClass="bg-purple-600">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
            <select className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white">
              <option>Event Poster / Flyer</option>
              <option>Logo Design</option>
              <option>Website Design / Mockup</option>
              <option>Social Media Graphics</option>
              <option>T-Shirt / Merch Design</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions / Format</label>
              <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., 11x17, Instagram Square" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline Needed</label>
              <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Design Brief</label>
            <p className="text-xs text-slate-500 mb-2">Include text content, preferred colors, inspiration, and target audience.</p>
            <textarea className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-32" placeholder="Please include the exact text to be on the design..." required></textarea>
          </div>
        </div>
      </FormContainer>
    );
  }

  function BusinessForm() {
    return (
      <FormContainer title="Business & Entrepreneurship" icon={Briefcase} colorClass="bg-emerald-600">
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100 text-emerald-800 mb-4 text-sm">
            Have a business idea? The Business department can help you refine your plan, analyze your market, or prepare for pitch competitions.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name (Tentative)</label>
            <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="Project Alpha" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nature of Assistance</label>
            <select className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white">
              <option>Business Plan Review</option>
              <option>Financial Modeling Help</option>
              <option>Marketing Strategy</option>
              <option>General Mentorship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Executive Summary / Idea Description</label>
            <textarea className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-40" placeholder="Briefly describe your product or service..." required></textarea>
          </div>
        </div>
      </FormContainer>
    );
  }

  function CulinaryForm() {
    return (
      <FormContainer title="Culinary Arts" icon={Utensils} colorClass="bg-orange-500">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
            <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Faculty Luncheon" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
              <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serve Time</label>
              <input type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Guest Count</label>
              <input type="number" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" min="1" placeholder="50" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Style</label>
            <select className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white">
              <option>Buffet Style</option>
              <option>Boxed Lunches</option>
              <option>Plated Service (Limited availability)</option>
              <option>Appetizers / Finger Foods</option>
              <option>Dessert Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Menu Preferences & Dietary Restrictions</label>
            <textarea className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="e.g., Italian theme, need 5 vegetarian options, 2 gluten free..." required></textarea>
          </div>
        </div>
      </FormContainer>
    );
  }

  function PhotoForm() {
    const [requestType, setRequestType] = useState('service'); 

    return (
      <FormContainer title="Photography" icon={Camera} colorClass="bg-pink-600">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRequestType('service')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}
            >
              <Users className="mx-auto mb-2" />
              Event Coverage
            </button>
            <button 
              type="button"
              onClick={() => setRequestType('checkout')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}
            >
              <Box className="mx-auto mb-2" />
              Equipment Checkout
            </button>
          </div>
        </div>

        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-pink-50 p-4 rounded-md border border-pink-100 text-sm text-pink-800 mb-4">
              <strong>Requirement:</strong> You must have completed Photo I to check out DSLR bodies.
            </div>
            <label className="block text-sm font-medium text-slate-700">Select Equipment Needed:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['DSLR Camera Body', 'Zoom Lens (18-55mm)', 'Telephoto Lens (70-200mm)', 'Portrait Lens (50mm)', 'SD Card Reader', 'Tripod', 'Flash Unit'].map((item) => (
                <label key={item} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer active:bg-pink-50">
                  <input type="checkbox" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
              <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Homecoming Assembly" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input type="time" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" placeholder="e.g., Gym, Courtyard, Off-campus" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specific Shots Requested</label>
              <textarea className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-24" placeholder="Describe key moments or people to capture..."></textarea>
            </div>
          </div>
        )}
      </FormContainer>
    );
  }
};

export default App;