import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Video, PenTool, Briefcase, Utensils, ArrowLeft, CheckCircle, Calendar, 
  Clock, User, Mail, Users, Box, MonitorPlay, ClipboardList, Clock3, Menu, Lock, 
  Unlock, Check, X, Eye, CalendarPlus, Save, LogOut, Hash, AlertCircle, 
  AlertTriangle, History, LogIn, BarChart3, TrendingUp, PieChart, Settings, 
  RefreshCw, ChevronLeft, ChevronRight, Download, Search, Ban, Cpu, Zap, 
  FileX, ShieldCheck, Plus, Trash2, Edit2, MessageSquare, Bug, Lightbulb, 
  CheckSquare, Gamepad2, Trophy 
} from 'lucide-react';
import { db, auth, googleProvider } from './firebase-config'; 
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, setDoc, getDoc } from 'firebase/firestore'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import emailjs from '@emailjs/browser'; 

import salpointeLogo from './SC-LOGO-RGB.png'; 

// *** CONFIGURATION SECTION ***
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_dp1gjh1",   
  TEMPLATE_ID: "template_kyo4h1e", 
  PUBLIC_KEY: "CZo6tBrAGwmjLwTr6"    
};

const ALLOWED_ADMINS = [
    "krashka@salpointe.org", 
    "jelias@salpointe.org",
    "cneff@salpointe.org",
    "vdunk@salpointe.org",
    "amartin@salpointe.org",
    "jharris@salpointe.org",
    "lsaulsby@salpointe.org",
    "cjones@salpointe.org",
    "cbarry@salpointe.org",
    "erivers@salpointe.org" 
];

// *** DEFAULT FALLBACK INVENTORY ***
const DEFAULT_INVENTORY = {
  'Cinema Camera Kit': { count: 1, category: 'film', requiresTraining: true },
  'Gimbal / Stabilizer': { count: 6, category: 'film', requiresTraining: true },
  'DJI Mic Kit (Wireless)': { count: 4, category: 'film', requiresTraining: false },
  'DJI Flip Drone': { count: 1, category: 'film', requiresTraining: true },
  'Lighting Kit': { count: 6, category: 'film', requiresTraining: false },
  'Tripod': { count: 8, category: 'general', requiresTraining: false },
  
  'DSLR Camera Body': { count: 6, category: 'photo', requiresTraining: true },
  'Zoom Lens (18-55mm)': { count: 6, category: 'photo', requiresTraining: false },
  'Telephoto Lens (70-200mm)': { count: 2, category: 'photo', requiresTraining: false },
  'Portrait Lens (50mm)': { count: 3, category: 'photo', requiresTraining: false },
  'SD Card Reader': { count: 5, category: 'photo', requiresTraining: false },
  'Flash Unit': { count: 3, category: 'photo', requiresTraining: false },

  'Serving Trays': { count: 10, category: 'culinary', requiresTraining: false },
  'Chafing Dishes': { count: 4, category: 'culinary', requiresTraining: false }
};

const Departments = {
  LANDING: 'landing', 
  DASHBOARD: 'dashboard', 
  FILM: 'film',
  GRAPHIC: 'graphic',
  BUSINESS: 'business',
  CULINARY: 'culinary',
  PHOTO: 'photo',
  CALENDAR: 'calendar',
  QUEUE: 'queue',
  MY_REQUESTS: 'my_requests',
  ANALYTICS: 'analytics',
  INVENTORY: 'inventory',
  FEEDBACK: 'feedback',
  GAME: 'game'
};

const getDraftKey = (deptTitle) => `salpointe_draft_${deptTitle}`;

const sendNotificationEmail = (templateParams) => {
  if (EMAILJS_CONFIG.SERVICE_ID === "YOUR_SERVICE_ID_HERE") {
    console.warn("EmailJS not configured yet. Skipping email.");
    return;
  }
  emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams, EMAILJS_CONFIG.PUBLIC_KEY)
    .then((response) => console.log('EMAIL SUCCESS!', response.status, response.text), (err) => console.log('EMAIL FAILED...', err));
};

const formatDateSafe = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    try { return timestamp.toDate().toLocaleDateString(); } catch (e) { return 'Invalid Date'; }
};

const App = () => {
  const [currentView, setCurrentView] = useState('landing'); 
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY); 
  const [blackouts, setBlackouts] = useState([]);
  
  // Secret Game Unlock State
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAdminMode(ALLOWED_ADMINS.includes(user.email));
      } else {
        setCurrentUser(null);
        setAdminMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
        try {
            const docRef = doc(db, "settings", "inventory_v2"); 
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setInventory(docSnap.data());
            } else { 
                await setDoc(docRef, DEFAULT_INVENTORY); 
                setInventory(DEFAULT_INVENTORY); 
            }
        } catch (err) {
            console.error("Inventory fetch failed, using default", err);
            setInventory(DEFAULT_INVENTORY);
        }
    };
    fetchInventory();

    const q = query(collection(db, "blackout_dates"));
    const unsubscribeBlackouts = onSnapshot(q, (snapshot) => {
        const dates = snapshot.docs.map(doc => doc.id); 
        setBlackouts(dates);
    });
    
    return () => unsubscribeBlackouts();
  }, []);

  const handleLogin = async () => { 
      try { 
          await signInWithPopup(auth, googleProvider); 
          setCurrentView(Departments.DASHBOARD); 
      } catch (error) { 
          console.error("Login failed:", error); 
          alert("Login failed."); 
      } 
  };
  
  const handleLogout = async () => { await signOut(auth); setCurrentView('landing'); };
  const goHome = () => { setCurrentView('landing'); setSubmitted(false); };
  const goToDashboard = () => { setCurrentView(Departments.DASHBOARD); setSubmitted(false); };

  const handleSecretClick = () => {
      const newCount = logoClicks + 1;
      setLogoClicks(newCount);
      if (newCount === 7) {
          setCurrentView(Departments.GAME);
          setLogoClicks(0);
      }
  };

  const isRequestView = [Departments.FILM, Departments.GRAPHIC, Departments.BUSINESS, Departments.CULINARY, Departments.PHOTO].includes(currentView);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>

      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-3 relative z-10">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={goHome}>
            <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                <img src={salpointeLogo} alt="Salpointe Logo" className="w-10 h-10 relative z-10 object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                SALPOINTE <span className="text-red-500">CTE</span>
              </h1>
              <p className="text-[10px] md:text-xs text-cyan-500 uppercase tracking-[0.2em] font-mono">Tech Command Hub</p>
            </div>
          </div>
          
          {currentUser && (
            <button onClick={handleLogout} className="md:hidden absolute top-3 right-4 p-2 rounded-full bg-slate-800 border border-red-900/50 text-red-400 hover:bg-slate-700 z-50" title="Logout">
                <LogOut size={18} />
            </button>
          )}

          <nav className="flex items-center gap-1 md:gap-2 ml-auto">
            {!isRequestView && currentView !== 'landing' && currentView !== 'dashboard' && (
               <button onClick={goToDashboard} className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 px-3 py-2 rounded-lg transition-all flex items-center gap-2 mr-1 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <ArrowLeft size={16} /><span className="hidden sm:inline">Back</span>
              </button>
            )}

            {currentView !== 'landing' && (
                <button onClick={() => { setCurrentView(Departments.CALENDAR); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.CALENDAR ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}>
                <Calendar size={16} /><span className="hidden sm:inline">Schedule</span>
                </button>
            )}
            
            {currentUser ? (
                <>
                    {currentView !== 'landing' && (
                        <button onClick={() => { setCurrentView(Departments.MY_REQUESTS); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.MY_REQUESTS ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}>
                            <History size={16} /><span className="hidden sm:inline">My Requests</span>
                        </button>
                    )}
                    {adminMode && currentView !== 'landing' && (
                      <>
                        <button onClick={() => { setCurrentView(Departments.QUEUE); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.QUEUE ? 'bg-purple-950/50 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'border-transparent text-slate-400 hover:text-purple-400 hover:bg-slate-800'}`}>
                            <ClipboardList size={16} /><span className="hidden sm:inline">Queue</span>
                        </button>
                        <button onClick={() => { setCurrentView(Departments.ANALYTICS); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.ANALYTICS ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.15)]' : 'border-transparent text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}>
                            <BarChart3 size={16} /><span className="hidden sm:inline">Stats</span>
                        </button>
                        <button onClick={() => { setCurrentView(Departments.INVENTORY); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.INVENTORY ? 'bg-amber-950/50 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15)]' : 'border-transparent text-slate-400 hover:text-amber-400 hover:bg-slate-800'}`}>
                            <Settings size={16} /><span className="hidden sm:inline">Stock</span>
                        </button>
                      </>
                    )}
                    <div className="hidden md:block w-px h-6 bg-slate-700 mx-1"></div>
                    <button onClick={handleLogout} className="hidden md:flex ml-1 text-xs md:text-sm font-medium px-3 py-2 rounded-lg border border-red-900/30 hover:border-red-500 text-red-400 hover:bg-red-950/30 transition-all items-center gap-2" title={`Logged in as ${currentUser.email}`}>
                        <LogOut size={16} />
                    </button>
                </>
            ) : (
                <button onClick={handleLogin} className="ml-2 text-xs md:text-sm font-bold bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] border border-cyan-400">
                    <LogIn size={16} /> Login
                </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10 flex-grow w-full">
        {submitted ? (
          <SuccessView onReset={goToDashboard} />
        ) : (
          <>
            {currentView === Departments.LANDING && <LandingPage currentUser={currentUser} onLogin={handleLogin} onEnter={goToDashboard} />}
            {currentView === Departments.DASHBOARD && <ServiceGrid onViewChange={setCurrentView} currentUser={currentUser} />}
            
            {currentView === Departments.FILM && <FilmForm setSubmitted={setSubmitted} onCancel={goToDashboard} currentUser={currentUser} inventory={inventory} blackouts={blackouts} />}
            {currentView === Departments.GRAPHIC && <GraphicDesignForm setSubmitted={setSubmitted} onCancel={goToDashboard} currentUser={currentUser} />}
            {currentView === Departments.BUSINESS && <BusinessForm setSubmitted={setSubmitted} onCancel={goToDashboard} currentUser={currentUser} />}
            {currentView === Departments.CULINARY && <CulinaryForm setSubmitted={setSubmitted} onCancel={goToDashboard} currentUser={currentUser} />}
            {currentView === Departments.PHOTO && <PhotoForm setSubmitted={setSubmitted} onCancel={goToDashboard} currentUser={currentUser} inventory={inventory} blackouts={blackouts} />}
            
            {currentView === Departments.CALENDAR && <CalendarView adminMode={adminMode} blackouts={blackouts} />}
            {currentView === Departments.QUEUE && <RequestQueueView adminMode={adminMode} setAdminMode={setAdminMode} ALLOWED_ADMINS={ALLOWED_ADMINS} />}
            {currentView === Departments.MY_REQUESTS && <MyRequestsView currentUser={currentUser} />}
            {currentView === Departments.ANALYTICS && adminMode && <AnalyticsView />}
            {currentView === Departments.INVENTORY && adminMode && <InventoryManager inventory={inventory} setInventory={setInventory} />}
            {currentView === Departments.FEEDBACK && <FeedbackView currentUser={currentUser} adminMode={adminMode} setSubmitted={setSubmitted} onCancel={goToDashboard} />}
            {currentView === Departments.GAME && <GameView onExit={goToDashboard} />}
          </>
        )}
      </main>
      
      <footer className="text-center py-8 px-4 border-t border-slate-800/50 mt-auto relative z-10 bg-slate-900/50">
        <div className="flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <img src={salpointeLogo} alt="Salpointe Catholic High School" className="w-8 h-8 opacity-80 grayscale hover:grayscale-0 transition-all" />
            <p onClick={handleSecretClick} className="text-slate-500 text-xs font-mono tracking-widest uppercase cursor-default select-none">
                &copy; {new Date().getFullYear()} Salpointe Catholic High School <span className="text-slate-700 mx-2">|</span> CTE Department
            </p>
            <button onClick={() => setCurrentView(Departments.FEEDBACK)} className="text-xs text-cyan-600 hover:text-cyan-400 flex items-center gap-1 transition-colors mt-2">
                <MessageSquare size={12} /> Feedback & Support
            </button>
        </div>
      </footer>
    </div>
  );

  // --- Sub-Components ---
  
  function LandingPage({ currentUser, onLogin, onEnter }) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-fade-in">
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    System Online v1.0
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                    Master the Tools. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Create Without Limits.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Your direct link to the CTE professional inventory. Secure the assets you need to build your portfolio—from cinema cameras to culinary prep. If you can dream it, you can reserve it.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {currentUser ? (
                        <button onClick={onEnter} className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center gap-3 w-full sm:w-auto justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div><Zap size={24} className="fill-white" /> Initialize Hub
                        </button>
                    ) : (
                        <button onClick={onLogin} className="group px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 text-lg font-bold rounded-xl shadow-lg transition-all flex items-center gap-3 w-full sm:w-auto justify-center"><LogIn size={24} /> Login to Access</button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full text-left">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-red-500/30 transition-colors group"><div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform"><FileX size={24} /></div><h3 className="text-xl font-bold text-white mb-2">Paperless Protocol</h3><p className="text-slate-400 text-sm">Deprecated legacy analog logs. Requests are now digital, trackable, and impossible to lose.</p></div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors group"><div className="w-12 h-12 bg-cyan-900/20 rounded-lg flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform"><Cpu size={24} /></div><h3 className="text-xl font-bold text-white mb-2">Real-Time Inventory</h3><p className="text-slate-400 text-sm">Live database tracking prevents double-bookings. See exactly what gear is available, instantly.</p></div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors group"><div className="w-12 h-12 bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div><h3 className="text-xl font-bold text-white mb-2">Secure Access</h3><p className="text-slate-400 text-sm">Authenticated via Salpointe Google Workspace. Your data is protected and your history is saved.</p></div>
            </div>
        </div>
      );
  }

  function SuccessView({ onReset }) {
    return (
      <div className="max-w-lg mx-auto bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]"><CheckCircle size={40} /></div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Request Transmitted</h2>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">Your data has been securely logged in the mainframe. The department head has been notified via quantum link (email).</p>
        <button onClick={onReset} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]">Return to Dashboard</button>
      </div>
    );
  }

  function ServiceGrid({ onViewChange, currentUser }) {
    const [drafts, setDrafts] = useState({});
    useEffect(() => {
        const checkDrafts = () => {
            const status = {};
            const map = { [Departments.FILM]: 'Film', [Departments.GRAPHIC]: 'Graphic', [Departments.BUSINESS]: 'Business', [Departments.CULINARY]: 'Culinary', [Departments.PHOTO]: 'Photo' };
            Object.keys(map).forEach(deptId => { const key = getDraftKey(map[deptId]); if (localStorage.getItem(key)) status[deptId] = true; });
            setDrafts(status);
        };
        checkDrafts();
    }, []);

    const cards = [
      { id: Departments.FILM, title: "Film & TV", icon: Video, desc: "Checkout cameras, drones, and broadcast equipment.", color: "text-cyan-400", bg: "group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/50" },
      { id: Departments.GRAPHIC, title: "Graphic Design", icon: PenTool, desc: "Request logos, posters, websites, and creative assets.", color: "text-fuchsia-400", bg: "group-hover:shadow-fuchsia-500/20 group-hover:border-fuchsia-500/50" },
      { id: Departments.BUSINESS, title: "Business", icon: Briefcase, desc: "Submit business plans and startup consultations.", color: "text-emerald-400", bg: "group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/50" },
      { id: Departments.CULINARY, title: "Culinary Arts", icon: Utensils, desc: "Catering services for school clubs and events.", color: "text-amber-400", bg: "group-hover:shadow-amber-500/20 group-hover:border-amber-500/50" },
      { id: Departments.PHOTO, title: "Photography", icon: Camera, desc: "Reserve DSLR bodies, lenses, and event coverage.", color: "text-pink-400", bg: "group-hover:shadow-pink-500/20 group-hover:border-pink-500/50" }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{currentUser ? `Welcome, ${currentUser.displayName.split(' ')[0]}.` : "Access Granted."}</h2>
          <p className="text-slate-400 text-lg">Select a sector to initialize a request.</p>
        </div>
        {cards.map((card) => (
          <div key={card.id} onClick={() => onViewChange(card.id)} className={`group relative bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 cursor-pointer border border-slate-800 transition-all duration-300 hover:-translate-y-1 ${card.bg}`}>
            {drafts[card.id] && (<span className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Save size={12} /> RESUME</span>)}
            <div className={`w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-5 ${card.color} transition-transform group-hover:scale-110 duration-300`}><card.icon size={28} /></div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{card.title}</h3><p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  function ContactSection({ initialData = {}, currentUser }) {
    const defaultName = currentUser?.displayName || initialData.fullName || '';
    const defaultEmail = currentUser?.email || initialData.email || '';
    return (
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2"><User size={18} /> Identity Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Project Designation</label><input name="requestName" type="text" defaultValue={initialData.requestName || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" placeholder="e.g. Football Video" required /></div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Full Name</label><input name="fullName" type="text" defaultValue={defaultName} readOnly={!!currentUser} className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="Jane Doe" required /></div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Comm Link (Email)</label><input name="email" type="email" defaultValue={defaultEmail} readOnly={!!currentUser} className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="jdoe@salpointe.org" required /></div>
          <div className="md:col-span-2"><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Clearance Level</label><select name="role" defaultValue={initialData.role || 'Student'} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"><option>Student</option><option>Faculty / Staff</option><option>Club Representative</option></select></div>
        </div>
      </div>
    );
  }

  function InventorySelector({ inventory, category }) {
      // *** WHITE SCREEN FIX #1: Guard Clause ***
      if (!inventory) return <div className="p-4 text-xs text-slate-500 border border-slate-800 rounded bg-slate-950/50">Inventory data initializing...</div>;

      const filteredItems = Object.entries(inventory).filter(([_, item]) => item?.category === category);
      
      if (filteredItems.length === 0) return <div className="p-4 text-xs text-slate-500">No items available in this category.</div>;

      return (
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 mt-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Equipment Request</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map(([name, item]) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition-colors">
                          <div className="flex flex-col">
                              <span className="text-sm text-slate-200 font-medium">{name}</span>
                              {item.requiresTraining && <span className="text-[10px] text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Training Req.</span>}
                          </div>
                          <input type="number" name={`gear_${name}`} min="0" max="5" placeholder="0" className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-center text-white text-sm focus:border-cyan-500 outline-none" />
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  function MyRequestsView({ currentUser }) {
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "requests"), where("email", "==", currentUser.email), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), formattedDate: formatDateSafe(doc.data().createdAt) }));
            setMyRequests(reqs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);
    const handleCancel = async (id) => { if (window.confirm("Are you sure?")) await deleteDoc(doc(db, "requests", id)); };
    const getStatusBadge = (status) => {
        const styles = { 'Approved': 'bg-green-950/50 text-green-400 border-green-500/30', 'Denied': 'bg-red-950/50 text-red-400 border-red-500/30', 'Completed': 'bg-slate-800 text-slate-400 border-slate-700', 'default': 'bg-amber-950/50 text-amber-400 border-amber-500/30' };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status] || styles['default']}`}>{status}</span>;
    };
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-slate-950/50 border-b border-slate-800 p-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><History className="text-cyan-400" /> My Request History</h2></div>
            <div className="overflow-x-auto">
                {loading ? <div className="p-8 text-center text-slate-500 font-mono">LOADING DATA...</div> : myRequests.length === 0 ? <div className="p-12 text-center text-slate-500">No records found.</div> : (
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead><tr className="bg-slate-800/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-mono"><th className="p-4">Ref ID</th><th className="p-4">Dept</th><th className="p-4">Project</th><th className="p-4">Date Submitted</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-800">{myRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-800/50 transition-colors"><td className="p-4 text-cyan-400 font-mono text-xs">{req.displayId}</td><td className="p-4 text-slate-300 text-sm capitalize">{req.dept}</td><td className="p-4 font-semibold text-white text-sm">{req.title}</td><td className="p-4 text-slate-400 text-sm font-mono">{req.formattedDate}</td><td className="p-4">{getStatusBadge(req.status)}</td><td className="p-4">{req.status === 'Pending Review' && <button onClick={() => handleCancel(req.id)} className="text-xs text-red-400 border border-red-900 hover:bg-red-950/50 px-3 py-1 rounded transition-colors">Cancel</button>}</td></tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
  }

  function CalendarView({ adminMode, blackouts }) {
    const [displayDate, setDisplayDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [filter, setFilter] = useState('all');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const nextMonth = () => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() + 1)));
    const prevMonth = () => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() - 1)));
    useEffect(() => { const q = query(collection(db, "requests")); const unsubscribe = onSnapshot(q, (snapshot) => { const fetchedEvents = snapshot.docs.map(doc => { const data = doc.data(); let dateStr = data.eventDate || data.checkoutDate || data.pickupDate || data.deadline; if (!dateStr) return null; const [y, m, d] = dateStr.split('-').map(Number); const dateObj = new Date(y, m - 1, d); return { id: doc.id, title: data.title || data.requestName || "Request", displayId: data.displayId, dept: data.dept, type: (data.requestType === 'checkout' || data.dept === 'Graphic') ? 'checkout' : 'event', status: data.status, date: dateObj, ...data }; }).filter(e => e !== null && e.status === 'Approved'); setEvents(fetchedEvents); setLoading(false); }); return () => unsubscribe(); }, []);
    const handleDateClick = async (day) => { const clickedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day); const dateStr = clickedDate.toISOString().split('T')[0]; if (adminMode) { if (blackouts.includes(dateStr)) { if(window.confirm(`Re-open ${dateStr}?`)) await deleteDoc(doc(db, "blackout_dates", dateStr)); } else { if(window.confirm(`Blackout ${dateStr}?`)) await setDoc(doc(db, "blackout_dates", dateStr), { reason: "Closed" }); } return; } setSelectedDate(selectedDate === day ? null : day); };
    const getDaysInMonth = (date) => { const year = date.getFullYear(); const month = date.getMonth(); const days = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay(); return { days, firstDay, monthName: date.toLocaleString('default', { month: 'long' }), year }; };
    const { days, firstDay, monthName, year } = getDaysInMonth(displayDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const empties = Array.from({ length: firstDay }, (_, i) => i);
    const getEventsForDay = (dayNum) => events.filter(e => e.date.getDate() === dayNum && e.date.getMonth() === displayDate.getMonth() && e.date.getFullYear() === displayDate.getFullYear() && (filter === 'all' || e.dept === filter));
    const getGoogleCalendarUrl = (event) => { const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE"; const text = `&text=${encodeURIComponent(`[${event.dept}] ${event.title}`)}`; const details = `&details=${encodeURIComponent(`Ref: ${event.displayId}\nRequested by: ${event.fullName}\nRole: ${event.role}\nDetails: ${event.details || event.brief || event.description || 'N/A'}`)}`; const location = `&location=${encodeURIComponent(event.location || 'Salpointe Catholic High School')}`; const y = event.date.getFullYear(); const m = String(event.date.getMonth() + 1).padStart(2, '0'); const d = String(event.date.getDate()).padStart(2, '0'); const dateString = `${y}${m}${d}`; const nextDay = new Date(event.date); nextDay.setDate(nextDay.getDate() + 1); const ny = nextDay.getFullYear(); const nm = String(nextDay.getMonth() + 1).padStart(2, '0'); const nd = String(nextDay.getDate()).padStart(2, '0'); const nextDateString = `${ny}${nm}${nd}`; const dates = `&dates=${dateString}/${nextDateString}`; return `${baseUrl}${text}${dates}${details}${location}`; };

    return (
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div><div className="flex items-center gap-4 mb-1"><button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-cyan-400"><ChevronLeft size={24}/></button><h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">{monthName} <span className="text-slate-500">{year}</span></h2><button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-cyan-400"><ChevronRight size={24}/></button></div></div>
          <div className="flex bg-slate-800/50 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            {['all', Departments.FILM, Departments.PHOTO, Departments.CULINARY].map(f => (<button key={f} onClick={() => setFilter(f)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>{f === 'all' ? 'All' : f}</button>))}
          </div>
        </div>
        <div className="p-6">
           {adminMode && <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400 flex items-center gap-2 font-mono"><Ban size={14} className="text-red-400"/> Admin Mode: Click a date to toggle blackout.</div>}
           <div className="overflow-x-auto pb-2">
            {loading ? <div className="text-center py-8 text-slate-500 font-mono">LOADING MATRIX...</div> : (
              <div className="min-w-[600px] md:min-w-0 grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="bg-slate-900 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>)}
                {empties.map(i => <div key={`empty-${i}`} className="bg-slate-950/50 min-h-[80px] md:min-h-[100px]" />)}
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === new Date().getDate() && displayDate.getMonth() === new Date().getMonth() && displayDate.getFullYear() === new Date().getFullYear();
                  const currentDateStr = new Date(year, displayDate.getMonth(), day).toISOString().split('T')[0];
                  const isBlackout = blackouts.includes(currentDateStr);
                  return (
                    <div key={day} className={`min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-t border-slate-800 relative group cursor-pointer transition-colors ${isBlackout ? 'bg-slate-900/30' : 'bg-slate-950/50'} ${selectedDate === day ? 'bg-cyan-900/20 border-cyan-500/30' : 'hover:bg-slate-900'}`} onClick={() => handleDateClick(day)}>
                      <span className={`text-xs md:text-sm font-medium inline-block w-6 h-6 md:w-7 md:h-7 leading-6 md:leading-7 text-center rounded-full mb-1 ${isToday ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-slate-400'}`}>{day}</span>
                      {isBlackout ? (<div className="flex justify-center mt-2"><Ban className="text-red-900/50" size={20} /></div>) : (<div className="space-y-1">{dayEvents.map(e => <div key={e.id} className={`text-[10px] md:text-xs p-1 rounded border truncate ${e.type === 'checkout' ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'}`}>{e.title}</div>)}</div>)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedDate && !blackouts.includes(new Date(year, displayDate.getMonth(), selectedDate).toISOString().split('T')[0]) && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 animate-fade-in">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Calendar size={16} className="text-cyan-400"/> {monthName} {selectedDate}</h4>
              {getEventsForDay(selectedDate).length === 0 ? <p className="text-slate-500 text-sm">Sector clear. No events.</p> : (
                <div className="space-y-3">{getEventsForDay(selectedDate).map(e => (<div key={e.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm"><div><p className="font-bold text-slate-200 text-sm">{e.title}</p><p className="text-xs text-slate-400 uppercase">{e.dept} • {e.fullName}</p></div><a href={getGoogleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-white transition-colors"><CalendarPlus size={16}/></a></div>))}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function RequestQueueView({ adminMode, setAdminMode, ALLOWED_ADMINS }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => { const q = query(collection(db, "requests"), orderBy("createdAt", "desc")); const unsubscribe = onSnapshot(q, (snapshot) => { const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), formattedDate: formatDateSafe(doc.data().createdAt) })); setRequests(reqs); setLoading(false); }); return () => unsubscribe(); }, []);
    const handleStatusUpdate = async (req, newStatus) => { if (!window.confirm(`Confirm status change to: ${newStatus}?`)) return; await updateDoc(doc(db, "requests", req.id), { status: newStatus }); if (selectedRequest && selectedRequest.id === req.id) setSelectedRequest(prev => ({...prev, status: newStatus})); sendNotificationEmail({ to_name: req.fullName, to_email: req.email, subject: `Request Update: ${req.title}`, title: req.title, status: newStatus, message: `Status updated to ${newStatus}.` }); };
    const handleDelete = async (id) => { if(window.confirm("Delete this record permanently?")) { await deleteDoc(doc(db, "requests", id)); if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null); } };
    const downloadCSV = () => { const headers = ["ID", "Department", "Title", "User", "Email", "Date Submitted", "Status", "Details"]; const rows = requests.map(row => [row.displayId, row.dept, `"${row.title}"`, row.fullName, row.email, row.formattedDate, row.status, `"${(row.details || row.brief || row.description || '').replace(/"/g, '""')}"` ]); const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n'); const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "cte_requests_export.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    
    const filteredRequests = requests.filter(r => {
        const matchesDept = filter === 'all' ? true : r.dept?.toLowerCase().includes(filter.toLowerCase());
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (r.title && r.title.toLowerCase().includes(searchLower)) || 
            (r.fullName && r.fullName.toLowerCase().includes(searchLower)) || 
            (r.displayId && r.displayId.toLowerCase().includes(searchLower)) ||
            (r.email && r.email.toLowerCase().includes(searchLower));
        return matchesDept && matchesSearch;
    });

    const getStatusColor = (status) => { switch(status) { case 'Approved': return 'bg-green-950/50 text-green-400 border-green-500/30'; case 'Denied': return 'bg-red-950/50 text-red-400 border-red-500/30'; case 'Completed': return 'bg-slate-800 text-slate-400 border-slate-700'; default: return 'bg-amber-950/50 text-amber-400 border-amber-500/30'; }};

    return (
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-start sticky top-0 bg-slate-900 z-10">
                <div><h3 className="text-xl font-bold text-white">Data Packet</h3><div className="flex gap-3 text-xs text-cyan-500 font-mono mt-1"><span>ID: {selectedRequest.displayId || 'N/A'}</span><span className="opacity-50">| Ref: {selectedRequest.id}</span></div></div>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Sector</label><p className="font-semibold text-white capitalize">{selectedRequest.dept}</p></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Operative</label><p className="text-slate-200">{selectedRequest.fullName}</p></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Comm Link</label><p className="text-slate-200 font-mono text-sm">{selectedRequest.email}</p></div>
                 </div>
                 <div className="border-t border-slate-800 pt-4">
                    <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Briefcase size={16} className="text-cyan-500"/> Mission Details</h4>
                    <div className="bg-slate-950/50 rounded-lg p-4 space-y-4 border border-slate-800">
                      {Object.entries(selectedRequest).map(([key, value]) => {
                        if(['id', 'dept', 'status', 'fullName', 'email', 'role', 'formattedDate', 'createdAt', 'title', 'requestName', 'displayId'].includes(key)) return null;
                        if(Array.isArray(value)) return <div key={key}><label className="text-xs font-bold text-slate-500 uppercase block mb-1">{key}</label><ul className="list-disc list-inside text-sm text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">{value.map((v,i)=><li key={i}>{v}</li>)}</ul></div>;
                        return <div key={key}><label className="text-xs font-bold text-slate-500 uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label><p className="text-slate-300 text-sm whitespace-pre-wrap">{value}</p></div>
                      })}
                    </div>
                 </div>
                 {adminMode && (<div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"><h4 className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-wide">Command Actions</h4><div className="flex gap-3"><button onClick={() => handleStatusUpdate(selectedRequest, 'Approved')} className="flex-1 py-2 bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-900/50 rounded text-sm font-medium transition-colors">Approve</button><button onClick={() => handleStatusUpdate(selectedRequest, 'Denied')} className="flex-1 py-2 bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900/50 rounded text-sm font-medium transition-colors">Deny</button></div></div>)}
              </div>
            </div>
          </div>
        )}
        <div className="bg-slate-950/50 border-b border-slate-800 p-4 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div><h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white"><ClipboardList className="text-purple-400" /> Request Log</h2><p className="text-slate-400 text-sm">Live Database Feed</p></div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} /><input type="text" placeholder="Search database..." className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
            <div className="flex gap-2">
                <select className="bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All Sectors</option><option value="film">Film</option><option value="graphic">Graphic</option><option value="business">Business</option><option value="culinary">Culinary</option><option value="photo">Photo</option></select>
                {adminMode && (<button onClick={downloadCSV} className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors" title="Download CSV"><Download size={16} /> <span className="hidden sm:inline">Export</span></button>)}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-slate-500 font-mono">INITIALIZING STREAM...</div> : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead><tr className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase text-slate-500 font-mono"><th className="p-4">ID Code</th><th className="p-4">Sector</th><th className="p-4">Objective</th><th className="p-4">Agent</th><th className="p-4">Status</th><th className="p-4">View</th>{adminMode && <th className="p-4">Override</th>}</tr></thead>
              <tbody className="divide-y divide-slate-800">{filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-cyan-600 font-mono text-xs">{req.displayId}</td>
                    <td className="p-4 text-slate-400 text-sm capitalize">{req.dept}</td>
                    <td className="p-4 text-white font-medium text-sm">{req.title}</td>
                    <td className="p-4 text-slate-400 text-sm">{req.fullName}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(req.status)}`}>{req.status}</span></td>
                    <td className="p-4"><button onClick={() => setSelectedRequest(req)} className="text-slate-500 hover:text-cyan-400 p-2 transition-colors"><Eye size={20} /></button></td>
                    {adminMode && <td className="p-4 flex gap-2"><button onClick={() => handleStatusUpdate(req, 'Approved')} className="p-1 bg-green-900/20 text-green-500 rounded hover:bg-green-900/40"><Check size={16}/></button><button onClick={() => handleStatusUpdate(req, 'Denied')} className="p-1 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40"><X size={16}/></button><button onClick={() => handleDelete(req.id)} className="p-1 bg-slate-800 text-slate-500 rounded hover:bg-slate-700"><span className="font-mono text-xs font-bold px-1">DEL</span></button></td>}
                  </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  function AnalyticsView() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, deptCounts: {}, topEquipment: [] });
    useEffect(() => {
        const q = query(collection(db, "requests"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let total = 0, approved = 0, pending = 0, deptCounts = {}, equipmentCounts = {};
            snapshot.forEach(doc => {
            const data = doc.data(); total++;
            if (data.status === 'Approved' || data.status === 'Completed') approved++;
            if (data.status === 'Pending Review') pending++;
            deptCounts[data.dept] = (deptCounts[data.dept] || 0) + 1;
            if (data.equipment) { const items = Array.isArray(data.equipment) ? data.equipment : [data.equipment]; items.forEach(item => { equipmentCounts[item] = (equipmentCounts[item] || 0) + 1; }); }
            });
            const sortedEquipment = Object.entries(equipmentCounts).sort(([,a], [,b]) => b - a).slice(0, 5);
            setStats({ total, approved, pending, deptCounts, topEquipment: sortedEquipment });
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-emerald-400" /> Data Analytics</h2></div><div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm">Total Requests: <strong>{stats.total}</strong></div></div>
            {loading ? <div className="text-center py-12 text-slate-500 font-mono">CALCULATING...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-950/30 rounded-xl p-5 border border-emerald-500/20"><h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Approval Rate</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-emerald-400 font-mono">{approvalRate}%</span></div></div>
                <div className="bg-blue-950/30 rounded-xl p-5 border border-blue-500/20"><h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">Completed</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-blue-400 font-mono">{stats.approved}</span></div></div>
                <div className="bg-amber-950/30 rounded-xl p-5 border border-amber-500/20"><h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">Pending</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-amber-400 font-mono">{stats.pending}</span></div></div>
                <div className="md:col-span-2 bg-slate-950/50 rounded-xl border border-slate-800 p-5"><h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><PieChart size={16} className="text-purple-400" /> Requests by Department</h3><div className="space-y-4">{Object.entries(stats.deptCounts).sort(([,a], [,b]) => b - a).map(([dept, count]) => { const percentage = (count / stats.total) * 100; return (<div key={dept}><div className="flex justify-between text-xs mb-2 font-mono"><span className="text-slate-400">{dept}</span><span className="text-cyan-400">{count}</span></div><div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div></div></div>); })}</div></div>
              </div>
            )}
        </div>
    );
  }

  function InventoryManager({ inventory, setInventory }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localInventory, setLocalInventory] = useState(inventory || DEFAULT_INVENTORY);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCount, setNewItemCount] = useState(1);
    const [newItemCategory, setNewItemCategory] = useState('film');
    const [newItemTraining, setNewItemTraining] = useState(false);

    useEffect(() => { if (!isEditing && inventory) setLocalInventory(inventory); }, [inventory, isEditing]);

    const toggleEditMode = () => {
        if (isEditing && isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
        setLocalInventory(inventory); 
        setIsEditing(!isEditing);
        setIsDirty(false);
    };

    const handleChange = (name, field, value) => {
        setLocalInventory(prev => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
        setIsDirty(true);
    };

    const handleDelete = (name) => {
        if (window.confirm(`Permanently remove "${name}"?`)) {
            const updated = { ...localInventory };
            delete updated[name];
            setLocalInventory(updated);
            setIsDirty(true);
        }
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim() || localInventory[newItemName.trim()]) return alert("Invalid or duplicate name.");
        setLocalInventory(prev => ({ ...prev, [newItemName.trim()]: { count: parseInt(newItemCount) || 0, category: newItemCategory, requiresTraining: newItemTraining } }));
        setNewItemName(''); setNewItemCount(1); setIsDirty(true);
    };

    const handleSave = async () => {
        if (!window.confirm("Commit changes to live system?")) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "inventory_v2"), localInventory);
            setInventory(localInventory); setIsEditing(false); setIsDirty(false);
            alert("✅ Updated Successfully");
        } catch (error) { console.error(error); alert("❌ Save failed."); } finally { setSaving(false); }
    };

    const SECTIONS = [
        { id: 'film', label: 'Film & TV Equipment', icon: Video, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/20' },
        { id: 'photo', label: 'Photography Gear', icon: Camera, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-950/20' },
        { id: 'culinary', label: 'Culinary Supplies', icon: Utensils, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' },
        { id: 'general', label: 'General Stock', icon: Box, color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-900/50' }
    ];

    const groupedData = (() => {
        const grouped = { film: [], photo: [], culinary: [], general: [] };
        Object.entries(localInventory).forEach(([name, data]) => {
            const cat = data.category || 'general';
            if (grouped[cat]) grouped[cat].push({ name, ...data });
            else grouped['general'].push({ name, ...data });
        });
        return grouped;
    })();

    return (
      <div className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl border overflow-hidden shadow-2xl transition-colors duration-300 ${isEditing ? 'border-indigo-500/30' : 'border-slate-800'}`}>
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors ${isEditing ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-slate-950/50 border-slate-800'}`}>
            <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className={isEditing ? "text-indigo-400" : "text-amber-400"} /> Inventory Master List</h2><p className={`text-sm ${isEditing ? 'text-indigo-300' : 'text-slate-400'}`}>{isEditing ? "EDIT MODE ACTIVE" : "View-only mode."}</p></div>
            <div className="flex gap-3">
                {isEditing ? (<><button onClick={toggleEditMode} className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white border border-transparent hover:border-slate-600">Cancel</button><button onClick={handleSave} disabled={!isDirty || saving} className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg ${!isDirty ? 'bg-slate-800 text-slate-500' : 'bg-green-600 text-white'}`}>{saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Save Changes</button></>) : (<button onClick={toggleEditMode} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Edit2 size={18} /> Edit Inventory</button>)}
            </div>
        </div>
        {isEditing && (<div className="p-6 bg-slate-900/50 border-b border-indigo-500/20"><div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50"><form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full"><label className="block text-xs text-slate-500 mb-1 ml-1">Asset Name</label><input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 outline-none" placeholder="New Item Name" /></div><div className="w-24"><label className="block text-xs text-slate-500 mb-1 ml-1">Qty</label><input type="number" min="0" value={newItemCount} onChange={e => setNewItemCount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 outline-none" /></div><div className="w-40"><label className="block text-xs text-slate-500 mb-1 ml-1">Category</label><select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 outline-none"><option value="film">Film & TV</option><option value="photo">Photography</option><option value="culinary">Culinary</option><option value="general">General</option></select></div><div className="flex items-center gap-2 pb-3 px-2"><input type="checkbox" checked={newItemTraining} onChange={e => setNewItemTraining(e.target.checked)} className="w-4 h-4 rounded bg-slate-950 border-slate-600 accent-indigo-500" /><label className="text-xs text-slate-400">Training?</label></div><button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg shadow-lg"><Plus size={20} /></button></form></div></div>)}
        <div className="p-6 space-y-8">{SECTIONS.map((section) => { const items = groupedData[section.id]; if (!items || items.length === 0) return null; return (<div key={section.id} className="animate-fade-in"><div className={`flex items-center gap-3 mb-4 pb-2 border-b ${section.border}`}><div className={`p-2 rounded-lg ${section.bg} ${section.color}`}><section.icon size={20} /></div><h3 className={`text-lg font-bold ${section.color}`}>{section.label}</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (<div key={item.name} className={`group relative p-3 rounded-xl border transition-all ${isEditing ? 'bg-slate-900 border-indigo-900/30' : 'bg-slate-950/40 border-slate-800'}`}><div className="flex justify-between items-center h-full"><div className="flex-1 mr-4 min-w-0"><div className="font-medium text-slate-200 text-sm truncate">{item.name}</div>{isEditing ? (<label className="flex items-center gap-1.5 mt-1.5 cursor-pointer w-fit p-1 -ml-1 rounded hover:bg-slate-800"><input type="checkbox" checked={item.requiresTraining} onChange={(e) => handleChange(item.name, 'requiresTraining', e.target.checked)} className="rounded border-slate-600 bg-slate-800 accent-red-500 w-3 h-3"/><span className={`text-[10px] uppercase font-bold tracking-wide ${item.requiresTraining ? 'text-red-400' : 'text-slate-600'}`}>Training Required</span></label>) : (item.requiresTraining && <div className="mt-1"><span className="text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><AlertCircle size={8} /> TRAINING REQ</span></div>)}</div><div className="flex items-center gap-3">{isEditing ? (<><div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 overflow-hidden"><button onClick={() => handleChange(item.name, 'count', Math.max(0, item.count - 1))} className="px-2 py-1.5 text-slate-400 hover:text-white border-r border-slate-800">-</button><input type="number" value={item.count} onChange={(e) => handleChange(item.name, 'count', parseInt(e.target.value) || 0)} className="w-12 text-center bg-transparent text-sm font-mono text-white focus:outline-none appearance-none font-bold"/><button onClick={() => handleChange(item.name, 'count', item.count + 1)} className="px-2 py-1.5 text-slate-400 hover:text-white border-l border-slate-800">+</button></div><button onClick={() => handleDelete(item.name)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg"><Trash2 size={16} /></button></>) : (<div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[50px]"><span className={`text-sm font-mono font-bold ${item.count === 0 ? 'text-red-500' : 'text-cyan-400'}`}>{item.count}</span><span className="text-[9px] text-slate-600 uppercase font-bold tracking-wider">Stock</span></div>)}</div></div></div>))}</div></div>); })}</div>
      </div>
    );
  }

  function FeedbackView({ setSubmitted, onCancel }) {
      return (
          <FormContainer title="System Feedback" icon={MessageSquare} colorClass="bg-slate-500" setSubmitted={setSubmitted} onCancel={onCancel}>
             <div className="space-y-4">
                 <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-200">
                    <p>Encountered a bug or have a feature request? Let the development team know directly.</p>
                 </div>
                 <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Message Type</label><select name="feedbackType" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none"><option>Bug Report</option><option>Feature Request</option><option>General Inquiry</option></select></div>
                 <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Details</label><textarea name="details" rows={5} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="Describe the issue..." required></textarea></div>
             </div>
          </FormContainer>
      );
  }

  function InventorySelector({ inventory, category }) {
      // *** WHITE SCREEN FIX #1: Guard Clause ***
      if (!inventory) return <div className="p-4 text-xs text-slate-500 border border-slate-800 rounded bg-slate-950/50">Inventory data initializing...</div>;
      const filteredItems = Object.entries(inventory).filter(([_, item]) => item?.category === category);
      if (filteredItems.length === 0) return <div className="p-4 text-xs text-slate-500">No items available in this category.</div>;
      return (
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 mt-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Equipment Request</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map(([name, item]) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition-colors">
                          <div className="flex flex-col"><span className="text-sm text-slate-200 font-medium">{name}</span>{item.requiresTraining && <span className="text-[10px] text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Training Req.</span>}</div>
                          <input type="number" name={`gear_${name}`} min="0" max="5" placeholder="0" className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-center text-white text-sm focus:border-cyan-500 outline-none" />
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  function FilmForm(props) {
      return (
          <FormContainer title="Film & TV" icon={Video} colorClass="bg-cyan-400" {...props}>
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Checkout Date</label><input type="date" name="checkoutDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Return Date</label><input type="date" name="returnDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Shoot Location</label><input type="text" name="location" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="e.g. Gym, Field, Off-campus" required /></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Project Details</label><textarea name="details" rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="Describe the shoot..." required /></div>
                  <InventorySelector inventory={props.inventory} category="film" />
              </div>
          </FormContainer>
      );
  }

  function PhotoForm(props) {
      return (
          <FormContainer title="Photography" icon={Camera} colorClass="bg-pink-400" {...props}>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Checkout Date</label><input type="date" name="checkoutDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Return Date</label><input type="date" name="returnDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Event / Subject</label><input type="text" name="eventSubject" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="e.g. Senior Portraits" required /></div>
                  <InventorySelector inventory={props.inventory} category="photo" />
              </div>
          </FormContainer>
      );
  }

  function GraphicDesignForm(props) {
      return (
          <FormContainer title="Graphic Design" icon={PenTool} colorClass="bg-fuchsia-400" {...props}>
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Deadline</label><input type="date" name="deadline" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Format</label><select name="format" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none"><option>Digital (Social Media/Web)</option><option>Print (Poster/Flyer)</option><option>Apparel</option><option>Logo / Branding</option></select></div></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Design Brief</label><textarea name="brief" rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="Describe colors, style, text required..." required /></div>
              </div>
          </FormContainer>
      );
  }

  function BusinessForm(props) {
      return (
          <FormContainer title="Business & Startup" icon={Briefcase} colorClass="bg-emerald-400" {...props}>
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Meeting Date</label><input type="date" name="eventDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Service Type</label><select name="serviceType" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none"><option>Consultation</option><option>Business Plan Review</option><option>Marketing Strategy</option><option>Pitch Deck Prep</option></select></div></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Objective</label><textarea name="objective" rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="What are your goals?" required /></div>
              </div>
          </FormContainer>
      );
  }

  function CulinaryForm(props) {
      return (
          <FormContainer title="Culinary Arts" icon={Utensils} colorClass="bg-amber-400" {...props}>
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Event Date</label><input type="date" name="eventDate" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" required /></div><div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Headcount</label><input type="number" name="headcount" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="e.g. 50" required /></div></div>
                  <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Menu Requirements</label><textarea name="menu" rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none" placeholder="Dietary restrictions, food preferences..." required /></div>
              </div>
          </FormContainer>
      );
  }

  function GameView({ onExit }) {
      const canvasRef = useRef(null);
      const [gameState, setGameState] = useState('start'); const [score, setScore] = useState(0); const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('lancer_highscore') || '0'));
      const GRAVITY = 0.6; const JUMP_FORCE = -10; const SPEED = 5; const GROUND_HEIGHT = 50;
      const playerRef = useRef({ x: 50, y: 200, vy: 0, width: 40, height: 40, isJumping: false }); const obstaclesRef = useRef([]); const frameRef = useRef(0); const scoreRef = useRef(0); const loopRef = useRef(null);
      const jump = () => { if (!playerRef.current.isJumping) { playerRef.current.vy = JUMP_FORCE; playerRef.current.isJumping = true; } };
      const startGame = () => { setGameState('playing'); setScore(0); scoreRef.current = 0; playerRef.current = { x: 50, y: 200, vy: 0, width: 40, height: 40, isJumping: false }; obstaclesRef.current = []; frameRef.current = 0; gameLoop(); };
      const gameLoop = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, canvas.height - GROUND_HEIGHT); ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT); ctx.stroke(); const p = playerRef.current; p.vy += GRAVITY; p.y += p.vy; if (p.y > canvas.height - GROUND_HEIGHT - p.height) { p.y = canvas.height - GROUND_HEIGHT - p.height; p.vy = 0; p.isJumping = false; } ctx.font = '32px Arial'; ctx.fillText('🏇', p.x, p.y + 32); frameRef.current++; if (frameRef.current % 100 === 0) { const type = Math.random() > 0.5 ? '📹' : 'F'; obstaclesRef.current.push({ x: canvas.width, y: canvas.height - GROUND_HEIGHT - 30, width: 30, height: 30, type: type }); } for (let i = obstaclesRef.current.length - 1; i >= 0; i--) { const obs = obstaclesRef.current[i]; obs.x -= SPEED; ctx.fillStyle = obs.type === 'F' ? '#ef4444' : '#fbbf24'; ctx.font = '28px Arial'; ctx.fillText(obs.type, obs.x, obs.y + 28); if (p.x < obs.x + obs.width && p.x + p.width > obs.x && p.y < obs.y + obs.height && p.y + p.height > obs.y) { handleGameOver(); return; } if (obs.x + obs.width < 0) { obstaclesRef.current.splice(i, 1); scoreRef.current += 10; setScore(scoreRef.current); } } ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText(`SCORE: ${scoreRef.current}`, 10, 20); loopRef.current = requestAnimationFrame(gameLoop); };
      const handleGameOver = () => { cancelAnimationFrame(loopRef.current); setGameState('gameover'); if (scoreRef.current > highScore) { setHighScore(scoreRef.current); localStorage.setItem('lancer_highscore', scoreRef.current.toString()); } };
      useEffect(() => { const handleKeyDown = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { if (gameState === 'playing') jump(); else if (gameState !== 'playing') startGame(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [gameState]);
      return (
          <div className="max-w-3xl mx-auto bg-black border-4 border-slate-700 rounded-xl overflow-hidden font-mono shadow-2xl relative animate-fade-in select-none"><div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div><div className="bg-slate-900 p-4 border-b-4 border-slate-700 flex justify-between items-center relative z-20"><div className="text-green-400 text-xs flex items-center gap-2"><Gamepad2 size={14}/> LANCER_RUN.EXE</div><div className="text-yellow-400 text-xs flex items-center gap-2"><Trophy size={14}/> HI-SCORE: {highScore}</div><button onClick={onExit} className="text-red-500 hover:text-red-400 text-xs uppercase font-bold">[ EXIT SYSTEM ]</button></div><div className="relative bg-slate-950" style={{ height: '300px' }}><canvas ref={canvasRef} width={700} height={300} className="w-full h-full block"/>{gameState === 'start' && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20"><h2 className="text-4xl font-bold text-cyan-400 mb-4 tracking-widest glitch-text">LANCER RUN</h2><p className="text-slate-300 text-sm mb-6">Space/Up to Jump. Avoid the F's!</p><button onClick={startGame} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded blink-anim">INSERT COIN (START)</button></div>)}{gameState === 'gameover' && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 z-20 backdrop-blur-sm"><h2 className="text-4xl font-bold text-red-500 mb-2">CRITICAL FAILURE</h2><p className="text-white text-xl mb-6">FINAL SCORE: {score}</p><button onClick={startGame} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-slate-200">RETRY MISSION</button></div>)}</div></div>
      );
  }

};

export default App;