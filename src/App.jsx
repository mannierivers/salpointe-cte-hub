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
  Save,
  LogOut,
  Hash,
  AlertCircle,
  AlertTriangle,
  History,
  LogIn,
  BarChart3,
  TrendingUp,
  PieChart,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Ban,
  Cpu // Added CPU icon for tech feel
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
    "erivers@salpointe.org" 
];

// *** DEFAULT FALLBACK INVENTORY ***
const DEFAULT_INVENTORY = {
  'Cinema Camera Kit *': 1,       
  'Gimbal / Stabilizer *': 6,
  'DJI Mic Kit (Wireless)': 4,
  'DJI Flip Drone *': 1,
  'Tripod': 4,                    
  'Lighting Kit': 6,
  'DSLR Camera Body': 6,
  'Zoom Lens (18-55mm)': 6,
  'Telephoto Lens (70-200mm)': 2,
  'Portrait Lens (50mm)': 3,
  'SD Card Reader': 5,
  'Flash Unit': 3
};

const Departments = {
  FILM: 'film',
  GRAPHIC: 'graphic',
  BUSINESS: 'business',
  CULINARY: 'culinary',
  PHOTO: 'photo',
  CALENDAR: 'calendar',
  QUEUE: 'queue',
  MY_REQUESTS: 'my_requests',
  ANALYTICS: 'analytics',
  INVENTORY: 'inventory'
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

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY); 
  const [blackouts, setBlackouts] = useState([]);

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
        const docRef = doc(db, "settings", "inventory");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setInventory(docSnap.data());
        else { await setDoc(docRef, DEFAULT_INVENTORY); setInventory(DEFAULT_INVENTORY); }
    };
    fetchInventory();

    const q = query(collection(db, "blackout_dates"));
    const unsubscribeBlackouts = onSnapshot(q, (snapshot) => {
        const dates = snapshot.docs.map(doc => doc.id); 
        setBlackouts(dates);
    });
    
    return () => unsubscribeBlackouts();
  }, []);

  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed:", error); alert("Login failed."); } };
  const handleLogout = async () => { await signOut(auth); goHome(); };
  const goHome = () => { setCurrentView('home'); setSubmitted(false); };
  const isRequestView = ['home', Departments.FILM, Departments.GRAPHIC, Departments.BUSINESS, Departments.CULINARY, Departments.PHOTO].includes(currentView);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Futuristic Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>

      {/* Header */}
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
          
          <nav className="flex items-center gap-1 md:gap-2 ml-auto">
            {!isRequestView && currentView !== 'home' && (
               <button onClick={goHome} className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 px-3 py-2 rounded-lg transition-all flex items-center gap-2 mr-1 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <ArrowLeft size={16} /><span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button onClick={() => { setCurrentView(Departments.CALENDAR); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.CALENDAR ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}>
              <Calendar size={16} /><span className="hidden sm:inline">Schedule</span>
            </button>
            
            {currentUser ? (
                <>
                    <button onClick={() => { setCurrentView(Departments.MY_REQUESTS); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2 border ${currentView === Departments.MY_REQUESTS ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}>
                        <History size={16} /><span className="hidden sm:inline">My Requests</span>
                    </button>
                    {adminMode && (
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
                    <div className="w-px h-6 bg-slate-700 mx-1"></div>
                    <button onClick={handleLogout} className="ml-1 text-xs md:text-sm font-medium px-3 py-2 rounded-lg border border-red-900/30 hover:border-red-500 text-red-400 hover:bg-red-950/30 transition-all flex items-center gap-2" title={`Logged in as ${currentUser.email}`}>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {submitted ? (
          <SuccessView onReset={goHome} />
        ) : (
          <>
            {currentView === 'home' && <Dashboard onViewChange={setCurrentView} currentUser={currentUser} />}
            
            {/* Forms receive blackouts for validation */}
            {currentView === Departments.FILM && <FilmForm setSubmitted={setSubmitted} onCancel={goHome} currentUser={currentUser} inventory={inventory} blackouts={blackouts} />}
            {currentView === Departments.GRAPHIC && <GraphicDesignForm setSubmitted={setSubmitted} onCancel={goHome} currentUser={currentUser} />}
            {currentView === Departments.BUSINESS && <BusinessForm setSubmitted={setSubmitted} onCancel={goHome} currentUser={currentUser} />}
            {currentView === Departments.CULINARY && <CulinaryForm setSubmitted={setSubmitted} onCancel={goHome} currentUser={currentUser} />}
            {currentView === Departments.PHOTO && <PhotoForm setSubmitted={setSubmitted} onCancel={goHome} currentUser={currentUser} inventory={inventory} blackouts={blackouts} />}
            
            {currentView === Departments.CALENDAR && <CalendarView adminMode={adminMode} blackouts={blackouts} />}
            {currentView === Departments.QUEUE && <RequestQueueView adminMode={adminMode} setAdminMode={setAdminMode} ALLOWED_ADMINS={ALLOWED_ADMINS} />}
            {currentView === Departments.MY_REQUESTS && <MyRequestsView currentUser={currentUser} />}
            {currentView === Departments.ANALYTICS && adminMode && <AnalyticsView />}
            {currentView === Departments.INVENTORY && adminMode && <InventoryManager inventory={inventory} setInventory={setInventory} />}
          </>
        )}
      </main>
      
      {/* Footer with Salpointe Tag */}
      <footer className="text-center py-10 px-4 border-t border-slate-800/50 mt-auto relative z-10">
        <div className="flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <img src={salpointeLogo} alt="Salpointe Catholic High School" className="w-8 h-8 opacity-80 grayscale hover:grayscale-0 transition-all" />
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
                &copy; {new Date().getFullYear()} Salpointe Catholic High School <span className="text-slate-700 mx-2">|</span> CTE Department
            </p>
        </div>
      </footer>
    </div>
  );

  // --- Sub-Components ---

  function SuccessView({ onReset }) {
    return (
      <div className="max-w-lg mx-auto bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Request Transmitted</h2>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Your data has been securely logged in the mainframe. The department head has been notified via quantum link (email).
        </p>
        <button onClick={onReset} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]">
          Submit Another Request
        </button>
      </div>
    );
  }

  function Dashboard({ onViewChange, currentUser }) {
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
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            {currentUser ? `Welcome, ${currentUser.displayName.split(' ')[0]}.` : "Welcome, Lancer."}
          </h2>
          <p className="text-slate-400 text-lg">Select a sector to initialize a request.</p>
        </div>
        {cards.map((card) => (
          <div 
            key={card.id} 
            onClick={() => onViewChange(card.id)} 
            className={`group relative bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 cursor-pointer border border-slate-800 transition-all duration-300 hover:-translate-y-1 ${card.bg}`}
          >
            {drafts[card.id] && (<span className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Save size={12} /> RESUME</span>)}
            <div className={`w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-5 ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                <card.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
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
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Project Designation</label>
            <input name="requestName" type="text" defaultValue={initialData.requestName || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" placeholder="e.g. Football Video" required />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Full Name</label>
            <input name="fullName" type="text" defaultValue={defaultName} readOnly={!!currentUser} className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Comm Link (Email)</label>
            <input name="email" type="email" defaultValue={defaultEmail} readOnly={!!currentUser} className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="jdoe@salpointe.org" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Clearance Level</label>
            <select name="role" defaultValue={initialData.role || 'Student'} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all">
                <option>Student</option><option>Faculty / Staff</option><option>Club Representative</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  function InventoryManager({ inventory, setInventory }) {
    const [localInventory, setLocalInventory] = useState(inventory);
    const [saving, setSaving] = useState(false);
    const handleChange = (item, value) => { setLocalInventory(prev => ({ ...prev, [item]: parseInt(value) || 0 })); };
    const handleSave = async () => {
        setSaving(true);
        try { await setDoc(doc(db, "settings", "inventory"), localInventory); setInventory(localInventory); alert("Inventory updated successfully!"); } catch (error) { console.error("Error saving inventory:", error); alert("Failed to save inventory."); }
        setSaving(false);
    };
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-slate-950/50 border-b border-slate-800 p-6 flex justify-between items-center">
                <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="text-amber-400" /> Inventory Matrix</h2></div>
                <button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">{saving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} {saving ? 'Processing...' : 'Save'}</button>
            </div>
            <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(localInventory).map(([item, count]) => (<div key={item} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 flex justify-between items-center hover:border-slate-600 transition-colors"><span className="font-mono text-slate-300 text-sm truncate mr-4">{item.replace('*','')}</span><input type="number" min="0" value={count} onChange={(e) => handleChange(item, e.target.value)} className="w-20 p-2 bg-slate-950 border border-slate-700 rounded text-center font-bold text-cyan-400 focus:border-cyan-500 outline-none"/></div>))}</div></div>
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
      <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-emerald-400" /> Data Analytics</h2></div><div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm">Total Requests: <strong>{stats.total}</strong></div></div>
          {loading ? <div className="text-center py-12 text-slate-500 font-mono">CALCULATING...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-950/30 rounded-xl p-5 border border-emerald-500/20"><h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Approval Rate</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-emerald-400 font-mono">{approvalRate}%</span></div></div>
              <div className="bg-blue-950/30 rounded-xl p-5 border border-blue-500/20"><h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">Completed</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-blue-400 font-mono">{stats.approved}</span></div></div>
              <div className="bg-amber-950/30 rounded-xl p-5 border border-amber-500/20"><h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">Pending</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-amber-400 font-mono">{stats.pending}</span></div></div>
              
              <div className="md:col-span-2 bg-slate-950/50 rounded-xl border border-slate-800 p-5"><h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><PieChart size={16} className="text-purple-400" /> Requests by Department</h3><div className="space-y-4">{Object.entries(stats.deptCounts).sort(([,a], [,b]) => b - a).map(([dept, count]) => { const percentage = (count / stats.total) * 100; return (<div key={dept}><div className="flex justify-between text-xs mb-2 font-mono"><span className="text-slate-400">{dept}</span><span className="text-cyan-400">{count}</span></div><div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-purple-500 h-2 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${percentage}%` }}></div></div></div>); })}</div></div>
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-5"><h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Camera size={16} className="text-pink-400" /> Top Gear</h3><ul className="space-y-3">{stats.topEquipment.map(([item, count], index) => (<li key={item} className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-mono border border-slate-700">{index + 1}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-300 truncate">{item.replace(' *', '')}</p><p className="text-xs text-slate-500 font-mono">{count} uses</p></div></li>))}</ul></div>
            </div>
          )}
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
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), formattedDate: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A' }));
            setMyRequests(reqs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);
    const handleCancel = async (id) => { if (window.confirm("Are you sure?")) await deleteDoc(doc(db, "requests", id)); };
    
    const getStatusBadge = (status) => {
        const styles = {
            'Approved': 'bg-green-950/50 text-green-400 border-green-500/30',
            'Denied': 'bg-red-950/50 text-red-400 border-red-500/30',
            'Completed': 'bg-slate-800 text-slate-400 border-slate-700',
            'default': 'bg-amber-950/50 text-amber-400 border-amber-500/30'
        };
        const style = styles[status] || styles['default'];
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${style}`}>{status}</span>;
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-slate-950/50 border-b border-slate-800 p-6"><h2 className="text-xl font-bold text-white flex items-center gap-2"><History className="text-cyan-400" /> My Request History</h2></div>
            <div className="overflow-x-auto">
                {loading ? <div className="p-8 text-center text-slate-500 font-mono">LOADING DATA...</div> : myRequests.length === 0 ? <div className="p-12 text-center text-slate-500">No records found in local database.</div> : (
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

  // --- NEW: Calendar with Blackout Dates ---

  function CalendarView({ adminMode, blackouts }) {
    // ... (State setup same as before)
    const [displayDate, setDisplayDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [filter, setFilter] = useState('all');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const nextMonth = () => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() + 1)));
    const prevMonth = () => setDisplayDate(new Date(displayDate.setMonth(displayDate.getMonth() - 1)));

    useEffect(() => {
      const q = query(collection(db, "requests")); 
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedEvents = snapshot.docs.map(doc => {
                  const data = doc.data();
                  let dateStr = data.eventDate || data.checkoutDate || data.pickupDate || data.deadline;
                  if (!dateStr) return null; 
                  const [y, m, d] = dateStr.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);
                  return { id: doc.id, title: data.title || data.requestName || "Request", displayId: data.displayId, dept: data.dept, type: (data.requestType === 'checkout' || data.dept === 'Graphic') ? 'checkout' : 'event', status: data.status, date: dateObj, ...data };
              }).filter(e => e !== null && e.status === 'Approved'); 
          setEvents(fetchedEvents);
          setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    const handleDateClick = async (day) => {
        const clickedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
        const dateStr = clickedDate.toISOString().split('T')[0];
        if (adminMode) {
            if (blackouts.includes(dateStr)) { if(window.confirm(`Re-open ${dateStr}?`)) await deleteDoc(doc(db, "blackout_dates", dateStr)); } 
            else { if(window.confirm(`Blackout ${dateStr}?`)) await setDoc(doc(db, "blackout_dates", dateStr), { reason: "Closed" }); }
            return;
        }
        setSelectedDate(selectedDate === day ? null : day);
    };

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      return { days, firstDay, monthName: date.toLocaleString('default', { month: 'long' }), year };
    };
    
    const { days, firstDay, monthName, year } = getDaysInMonth(displayDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const empties = Array.from({ length: firstDay }, (_, i) => i);
    const getEventsForDay = (dayNum) => events.filter(e => e.date.getDate() === dayNum && e.date.getMonth() === displayDate.getMonth() && e.date.getFullYear() === displayDate.getFullYear() && (filter === 'all' || e.dept === filter));
    const getGoogleCalendarUrl = (event) => {
      const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
      const text = `&text=${encodeURIComponent(`[${event.dept}] ${event.title}`)}`;
      const details = `&details=${encodeURIComponent(`Ref: ${event.displayId}\nRequested by: ${event.fullName}\nRole: ${event.role}\nDetails: ${event.details || event.brief || event.description || 'N/A'}`)}`;
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
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-4 mb-1">
                 <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-cyan-400"><ChevronLeft size={24}/></button>
                 <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">{monthName} <span className="text-slate-500">{year}</span></h2>
                 <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-cyan-400"><ChevronRight size={24}/></button>
             </div>
          </div>
          <div className="flex bg-slate-800/50 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            {['all', Departments.FILM, Departments.PHOTO, Departments.CULINARY].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>{f === 'all' ? 'All' : f}</button>
            ))}
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
                    <div 
                      key={day} 
                      className={`min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-t border-slate-800 relative group cursor-pointer transition-colors 
                        ${isBlackout ? 'bg-slate-900/30' : 'bg-slate-950/50'} 
                        ${selectedDate === day ? 'bg-cyan-900/20 border-cyan-500/30' : 'hover:bg-slate-900'}`
                      } 
                      onClick={() => handleDateClick(day)}
                    >
                      <span className={`text-xs md:text-sm font-medium inline-block w-6 h-6 md:w-7 md:h-7 leading-6 md:leading-7 text-center rounded-full mb-1 ${isToday ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-slate-400'}`}>{day}</span>
                      {isBlackout ? (
                          <div className="flex justify-center mt-2"><Ban className="text-red-900/50" size={20} /></div>
                      ) : (
                        <div className="space-y-1">{dayEvents.map(e => <div key={e.id} className={`text-[10px] md:text-xs p-1 rounded border truncate ${e.type === 'checkout' ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'}`}>{e.title}</div>)}</div>
                      )}
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
                <div className="space-y-3">{getEventsForDay(selectedDate).map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm">
                        <div><p className="font-bold text-slate-200 text-sm">{e.title}</p><p className="text-xs text-slate-400 uppercase">{e.dept} • {e.fullName}</p></div>
                        <a href={getGoogleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-white transition-colors"><CalendarPlus size={16}/></a>
                    </div>
                ))}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Real-Time Request Queue Component ---

  function RequestQueueView({ adminMode, setAdminMode, ALLOWED_ADMINS }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), formattedDate: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A' }));
        setRequests(reqs);
        setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (req, newStatus) => {
      if (!window.confirm(`Confirm status change to: ${newStatus}?`)) return;
      await updateDoc(doc(db, "requests", req.id), { status: newStatus });
      if (selectedRequest && selectedRequest.id === req.id) setSelectedRequest(prev => ({...prev, status: newStatus}));
      sendNotificationEmail({ to_name: req.fullName, to_email: req.email, subject: `Request Update: ${req.title}`, title: req.title, status: newStatus, message: `Status updated to ${newStatus}.` });
    };

    const handleDelete = async (id) => {
      if(window.confirm("Delete this record permanently?")) {
        await deleteDoc(doc(db, "requests", id));
        if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null);
      }
    };

    const downloadCSV = () => {
      const headers = ["ID", "Department", "Title", "User", "Email", "Date Submitted", "Status", "Details"];
      const rows = requests.map(row => [row.displayId, row.dept, `"${row.title}"`, row.fullName, row.email, row.formattedDate, row.status, `"${(row.details || row.brief || row.description || '').replace(/"/g, '""')}"` ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cte_requests_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const filteredRequests = requests.filter(r => {
        const matchesDept = filter === 'all' ? true : r.dept?.toLowerCase().includes(filter.toLowerCase());
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = r.title?.toLowerCase().includes(searchLower) || r.fullName?.toLowerCase().includes(searchLower) || r.displayId?.toLowerCase().includes(searchLower) || r.email?.toLowerCase().includes(searchLower);
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

  function FormContainer({ title, icon: Icon, colorClass, children, setSubmitted, initialData = {}, onCancel, currentUser, blackouts = [] }) { 
    const formRef = useRef(null);
    const draftKey = getDraftKey(title);
    const [showExitPrompt, setShowExitPrompt] = useState(false);

    const saveDraftToStorage = () => {
        const formData = new FormData(formRef.current);
        const data = {};
        for (const [key, value] of formData.entries()) { if (data[key]) { if (!Array.isArray(data[key])) data[key] = [data[key]]; data[key].push(value); } else { data[key] = value; } }
        localStorage.setItem(draftKey, JSON.stringify(data));
        return true;
    };

    const handleSaveDraftButton = (e) => { e.preventDefault(); saveDraftToStorage(); alert('Draft secured in local cache.'); };
    const handleCancelRequest = () => { setShowExitPrompt(true); };
    const confirmSaveAndExit = () => { saveDraftToStorage(); setShowExitPrompt(false); onCancel(); };
    const confirmDiscardAndExit = () => { localStorage.removeItem(draftKey); setShowExitPrompt(false); onCancel(); };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {};
      for (const [key, value] of formData.entries()) { if (data[key]) { if (!Array.isArray(data[key])) data[key] = [data[key]]; data[key].push(value); } else { data[key] = value; } }
      
      const dateFields = ['checkoutDate', 'returnDate', 'eventDate', 'pickupDate', 'deadline'];
      let conflictFound = false;
      dateFields.forEach(field => { if (data[field] && blackouts.includes(data[field])) { conflictFound = true; } });

      if (conflictFound) { alert("Date blocked by admin protocol. Select alternative."); return; }
      
      try {
        const timestampSuffix = Date.now().toString().slice(-4);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const displayId = `REQ-${timestampSuffix}-${randomNum}`;

        await addDoc(collection(db, "requests"), {
          ...data,
          dept: title,
          displayId: displayId, 
          status: "Pending Review",
          createdAt: new Date(),
          title: data.requestName || data.eventName || data.projectType || data.businessName || "New Request" 
        });
        
        sendNotificationEmail({ to_name: "Admin", to_email: "erivers@salpointe.org", subject: `New Request: ${data.requestName}`, title: data.requestName, status: "Pending Review", message: `New request (${displayId}) from ${data.fullName}.` });
        localStorage.removeItem(draftKey);
        setSubmitted(true);
      } catch (error) { console.error(error); alert("Transmission error."); }
    };

    return (
      <div className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative">
        {showExitPrompt && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
                <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full p-6 text-center">
                    <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border border-amber-500/20"><AlertTriangle size={32} /></div>
                    <h3 className="text-xl font-bold text-white mb-2">Unsaved Data Detected</h3>
                    <p className="text-slate-400 mb-6">Secure local draft before termination?</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={confirmSaveAndExit} className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-500 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.3)]"><Save size={18} /> Secure Draft & Exit</button>
                        <button onClick={confirmDiscardAndExit} className="w-full bg-transparent border border-red-900/50 text-red-400 py-3 rounded-lg font-semibold hover:bg-red-950/30 hover:border-red-500 transition-all">Purge Data & Exit</button>
                        <button onClick={() => setShowExitPrompt(false)} className="w-full text-slate-500 py-2 hover:text-slate-300 text-sm">Return to Editor</button>
                    </div>
                </div>
            </div>
        )}
        <div className={`h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50`}></div>
        <div className="p-5 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 ${colorClass.replace('bg-', 'text-')}`}><Icon size={28} /></div>
                <div><h2 className="text-2xl font-bold text-white tracking-wide">{title} Protocol</h2><p className="text-slate-500 text-xs md:text-sm font-mono uppercase">Input Required Data</p></div>
            </div>
            <button type="button" onClick={handleCancelRequest} className="text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <form ref={formRef} onSubmit={handleSubmit}>
            <ContactSection initialData={initialData} currentUser={currentUser} />
            {children}
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-800">
              <button type="button" onClick={handleCancelRequest} className="flex items-center justify-center gap-2 bg-transparent border border-slate-700 text-slate-400 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 hover:text-white transition-all">Abort</button>
              <button type="button" onClick={handleSaveDraftButton} className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-cyan-400 px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 hover:border-cyan-500/50 transition-all"><Save size={18} /> Save Draft</button>
              <button type="submit" className="w-full sm:w-auto bg-cyan-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] tracking-wide">INITIALIZE REQUEST</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Department Specific Forms ---

  function FilmForm({ setSubmitted, onCancel, currentUser, inventory, blackouts }) { // Added blackouts
    const title = 'Film';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    const [requestType, setRequestType] = useState(initialData.requestType || 'checkout'); 
    
    const [availableStock, setAvailableStock] = useState({});
    const [datesSelected, setDatesSelected] = useState(false);
    const [dateRange, setDateRange] = useState({ start: initialData.checkoutDate || '', end: initialData.returnDate || '' });

    const handleDateChange = (e) => {
        const newDates = { ...dateRange, [e.target.name === 'checkoutDate' ? 'start' : 'end']: e.target.value };
        setDateRange(newDates);
    };

    useEffect(() => {
        const calculateAvailability = async () => {
            if (!dateRange.start || !dateRange.end || requestType !== 'checkout') {
                setDatesSelected(false);
                return;
            }
            setDatesSelected(true);
            const q = query(collection(db, "requests"), where("dept", "==", "Film"), where("requestType", "==", "checkout"));
            const querySnapshot = await getDocs(q);
            const usageCounts = {};
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'Denied' || data.status === 'Completed') return;
                const reqStart = data.checkoutDate;
                const reqEnd = data.returnDate;
                if (reqStart <= dateRange.end && reqEnd >= dateRange.start) {
                    if (data.equipment) {
                        const items = Array.isArray(data.equipment) ? data.equipment : [data.equipment];
                        items.forEach(item => { usageCounts[item] = (usageCounts[item] || 0) + 1; });
                    }
                }
            });
            const stockStatus = {};
            Object.keys(inventory).forEach(item => { stockStatus[item] = Math.max(0, inventory[item] - (usageCounts[item] || 0)); });
            setAvailableStock(stockStatus);
        };
        calculateAvailability();
    }, [dateRange, requestType, inventory]); 

    const isSingleDay = dateRange.start && dateRange.end && dateRange.start === dateRange.end;

    return (
      <FormContainer title={title} icon={Video} colorClass="bg-blue-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser} blackouts={blackouts}>
        <input type="hidden" name="requestType" value={requestType} />
        <div className="mb-6">
          <label className="block text-xs font-mono text-slate-500 uppercase mb-2 ml-1">Operation Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${requestType === 'checkout' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}><Box size={24} /><span className="font-bold">Equipment Checkout</span></button>
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${requestType === 'service' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}><MonitorPlay size={24} /><span className="font-bold">Production Team</span></button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 text-sm text-blue-200 flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5 text-blue-400" size={16}/><p><strong>Protocol:</strong> Equipment return deadline is 0800 hours the following school day.</p></div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Checkout Date</label><input name="checkoutDate" defaultValue={initialData.checkoutDate} onChange={handleDateChange} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" required /></div>
               <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} onChange={handleDateChange} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" required /></div>
             </div>
             {isSingleDay && (
                <div className="animate-fade-in bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="block text-xs font-mono text-cyan-400 uppercase mb-1">Specific Duration</label>
                    <select name="durationHours" defaultValue={initialData.durationHours} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none"><option value="">Select Duration...</option><option value="1 Hour">1 Hour</option><option value="2 Hours">2 Hours</option><option value="Full Day (School Hours)">Full Day</option><option value="Overnight">Overnight</option></select>
                </div>
             )}
             <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-3 ml-1">Select Assets <span className="text-red-500 ml-2 normal-case tracking-normal">* Certification Required</span></label>
                {!datesSelected ? (
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-500 text-sm border-dashed"><Calendar className="inline-block mr-2 w-4 h-4 mb-1"/>Select dates above to initialize inventory check.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Cinema Camera Kit *', 'Gimbal / Stabilizer *', 'DJI Mic Kit (Wireless)', 'DJI Flip Drone *', 'Tripod', 'Lighting Kit'].map((item) => {
                        const remaining = availableStock[item] !== undefined ? availableStock[item] : 99; const isSoldOut = remaining <= 0;
                        return (<label key={item} className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${isSoldOut ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(8,145,178,0.1)] cursor-pointer'}`}><input type="checkbox" name="equipment" value={item} disabled={isSoldOut} defaultChecked={initialData.equipment?.includes(item)} className="w-5 h-5 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-slate-800" /><div className="flex-1"><span className="text-slate-200 text-sm block font-medium">{item.replace('*','')} {item.includes('*') && <span className="text-red-400">*</span>}</span><span className={`text-[10px] font-mono uppercase tracking-wider ${isSoldOut ? 'text-red-500' : 'text-emerald-500'}`}>{isSoldOut ? 'OFFLINE / UNAVAILABLE' : `${remaining} UNITS ACTIVE`}</span></div></label>);
                    })}
                    </div>
                )}
             </div>
             <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" required className="mt-1 w-5 h-5 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-slate-800" /><span className="text-xs text-slate-400 leading-relaxed"><strong>LIABILITY WAIVER:</strong> By initializing this request, I accept full financial responsibility for equipment repair or replacement at market value in the event of damage, loss, or theft during my checkout period.</span></label></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Event Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" required /></div>
              <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Start Time</label><input name="startTime" defaultValue={initialData.startTime} type="time" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" required /></div>
            </div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Service Required</label><select name="serviceType" defaultValue={initialData.serviceType} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none"><option>Live Broadcast (Stream)</option><option>Event Recording (Edited later)</option><option>Raw Footage Only</option></select></div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Mission Details</label><textarea name="details" defaultValue={initialData.details} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-cyan-500 outline-none h-24" placeholder="Describe specific shots, locations, or requirements..."></textarea></div>
          </div>
        )}
      </FormContainer>
    );
  }

  function GraphicDesignForm({ setSubmitted, onCancel, currentUser }) {
    const title = 'Graphic';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={PenTool} colorClass="bg-purple-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser}>
        <div className="space-y-6">
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Project Type</label><select name="projectType" defaultValue={initialData.projectType} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none"><option>Event Poster / Flyer</option><option>Logo Design</option><option>Website Design</option><option>T-Shirt / Merch</option></select></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Dimensions</label><input name="dimensions" defaultValue={initialData.dimensions} type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" placeholder="e.g., 11x17" /></div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Deadline</label><input name="deadline" defaultValue={initialData.deadline} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none" required /></div>
          </div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Creative Brief</label><textarea name="brief" defaultValue={initialData.brief} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-purple-500 outline-none h-32" placeholder="Text content, colors, inspiration..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function BusinessForm({ setSubmitted, onCancel, currentUser }) {
    const title = 'Business';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={Briefcase} colorClass="bg-emerald-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser}>
        <div className="space-y-6">
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Support Required</label><select name="assistanceType" defaultValue={initialData.assistanceType} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"><option>Business Plan Review</option><option>Financial Modeling Help</option><option>Marketing Strategy</option><option>General Mentorship</option></select></div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Concept Overview</label><textarea name="description" defaultValue={initialData.description} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none h-40" placeholder="Briefly describe your product or service..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function CulinaryForm({ setSubmitted, onCancel, currentUser }) {
    const title = 'Culinary';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={Utensils} colorClass="bg-orange-500" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Event Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-amber-500 outline-none" required /></div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Serve Time</label><input name="serveTime" defaultValue={initialData.serveTime} type="time" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-amber-500 outline-none" required /></div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Guest Count</label><input name="guestCount" defaultValue={initialData.guestCount} type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-amber-500 outline-none" min="1" placeholder="50" required /></div>
          </div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Service Style</label><select name="serviceStyle" defaultValue={initialData.serviceStyle} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-amber-500 outline-none"><option>Buffet Style</option><option>Boxed Lunches</option><option>Plated Service</option><option>Appetizers</option></select></div>
          <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Dietary Requirements</label><textarea name="menuNotes" defaultValue={initialData.menuNotes} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-amber-500 outline-none h-24" placeholder="Preferences, allergies, restrictions..." required></textarea></div>
        </div>
      </FormContainer>
    );
  }

  function PhotoForm({ setSubmitted, onCancel, currentUser, inventory, blackouts }) { 
    const title = 'Photo';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    const [requestType, setRequestType] = useState(initialData.requestType || 'service'); 
    
    const [availableStock, setAvailableStock] = useState({});
    const [datesSelected, setDatesSelected] = useState(false);
    const [dateRange, setDateRange] = useState({ start: initialData.pickupDate || '', end: initialData.returnDate || '' });

    const handleDateChange = (e) => {
        const newDates = { ...dateRange, [e.target.name === 'pickupDate' ? 'start' : 'end']: e.target.value };
        setDateRange(newDates);
    };

    useEffect(() => {
        const calculateAvailability = async () => {
            if (!dateRange.start || !dateRange.end || requestType !== 'checkout') {
                setDatesSelected(false);
                return;
            }
            setDatesSelected(true);

            const q = query(
                collection(db, "requests"), 
                where("dept", "==", "Photo"),
                where("requestType", "==", "checkout") 
            );
            
            const querySnapshot = await getDocs(q);
            const usageCounts = {};

            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'Denied' || data.status === 'Completed') return;

                const reqStart = data.pickupDate; 
                const reqEnd = data.returnDate;
                
                if (reqStart <= dateRange.end && reqEnd >= dateRange.start) {
                    if (data.equipment) {
                        const items = Array.isArray(data.equipment) ? data.equipment : [data.equipment];
                        items.forEach(item => {
                            usageCounts[item] = (usageCounts[item] || 0) + 1;
                        });
                    }
                }
            });

            const stockStatus = {};
            Object.keys(inventory).forEach(item => { 
                const total = inventory[item];
                const used = usageCounts[item] || 0;
                stockStatus[item] = Math.max(0, total - used);
            });
            
            setAvailableStock(stockStatus);
        };

        calculateAvailability();
    }, [dateRange, requestType, inventory]); 

    const isSingleDay = dateRange.start && dateRange.end && dateRange.start === dateRange.end;

    return (
      <FormContainer title={title} icon={Camera} colorClass="bg-pink-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser} blackouts={blackouts}>
        <input type="hidden" name="requestType" value={requestType} />
        <div className="mb-6">
          <label className="block text-xs font-mono text-slate-500 uppercase mb-2 ml-1">Operation Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${requestType === 'service' ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}><Users size={24} /><span className="font-bold">Event Coverage</span></button>
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${requestType === 'checkout' ? 'bg-pink-950/40 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}><Box size={24} /><span className="font-bold">Equipment Checkout</span></button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-pink-900/20 p-4 rounded-lg border border-pink-500/30 text-sm text-pink-200 flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5 text-pink-400" size={16}/><p><strong>Requirement:</strong> Advanced Photo I certification required for DSLR bodies.</p></div>
             
             {/* Dates Moved Up */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Pickup Date</label><input name="pickupDate" defaultValue={initialData.pickupDate} onChange={handleDateChange} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none" required /></div>
               <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} onChange={handleDateChange} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none" required /></div>
             </div>

             {/* Single Day Hours Selection for Photo */}
             {isSingleDay && (
                <div className="mb-4 animate-fade-in bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="block text-xs font-mono text-pink-400 uppercase mb-1">Specific Duration</label>
                    <select name="durationHours" defaultValue={initialData.durationHours} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none"><option value="">Select Duration...</option><option value="1 Hour">1 Hour</option><option value="2 Hours">2 Hours</option><option value="Full Day (School Hours)">Full Day</option><option value="Overnight">Overnight</option></select>
                </div>
             )}

             <div>
                <label className="block text-xs font-mono text-slate-500 uppercase mb-3 ml-1">Select Assets</label>
                {!datesSelected ? (
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-500 text-sm border-dashed"><Calendar className="inline-block mr-2 w-4 h-4 mb-1"/>Select dates above to initialize inventory check.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['DSLR Camera Body', 'Zoom Lens (18-55mm)', 'Telephoto Lens (70-200mm)', 'Portrait Lens (50mm)', 'SD Card Reader', 'Tripod', 'Flash Unit'].map((item) => {
                        const remaining = availableStock[item] !== undefined ? availableStock[item] : 99; 
                        const isSoldOut = remaining <= 0;
                        
                        return (
                            <label key={item} className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${isSoldOut ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900 border-slate-800 hover:border-pink-500/50 hover:shadow-[0_0_10px_rgba(236,72,153,0.1)] cursor-pointer'}`}><input type="checkbox" name="equipment" value={item} disabled={isSoldOut} defaultChecked={initialData.equipment?.includes(item)} className="w-5 h-5 rounded border-slate-600 text-pink-600 focus:ring-pink-500 bg-slate-800" /><div className="flex-1"><span className="text-slate-200 text-sm block font-medium">{item}</span><span className={`text-[10px] font-mono uppercase tracking-wider ${isSoldOut ? 'text-red-500' : 'text-emerald-500'}`}>{isSoldOut ? 'OFFLINE / UNAVAILABLE' : `${remaining} UNITS ACTIVE`}</span></div></label>
                        );
                    })}
                    </div>
                )}
             </div>

             {/* Terms & Conditions for Photo */}
             <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" required className="mt-1 w-5 h-5 rounded border-slate-600 text-pink-600 focus:ring-pink-500 bg-slate-800" /><span className="text-xs text-slate-400 leading-relaxed"><strong>LIABILITY WAIVER:</strong> By initializing this request, I accept full financial responsibility for equipment repair or replacement at market value in the event of damage, loss, or theft during my checkout period.</span></label></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Event Date</label><input name="eventDate" defaultValue={initialData.eventDate} type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none" required /></div>
              <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Start Time</label><input name="startTime" defaultValue={initialData.startTime} type="time" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none" required /></div>
            </div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Location</label><input name="location" defaultValue={initialData.location} type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none" placeholder="e.g., Gym" /></div>
            <div><label className="block text-xs font-mono text-slate-500 uppercase mb-1 ml-1">Shot List</label><textarea name="shotList" defaultValue={initialData.shotList} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-pink-500 outline-none h-24" placeholder="Key moments..."></textarea></div>
          </div>
        )}
      </FormContainer>
    );
  }
};

export default App;