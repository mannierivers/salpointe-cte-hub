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
  Download, // Added Download for CSV
  Search,   // Added Search for Queue
  Ban       // Added Ban for Blackout Dates
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
    "lsaulsby@salpointe.org",
    "jharris@salpointe.org",
    "cjones@salpointe.org",
    "groche@salpointe.org",
    "tespinosa@salpointe.org",
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
  const [blackouts, setBlackouts] = useState([]); // Global state for blackout dates

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
    // Fetch Inventory
    const fetchInventory = async () => {
        const docRef = doc(db, "settings", "inventory");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setInventory(docSnap.data());
        else { await setDoc(docRef, DEFAULT_INVENTORY); setInventory(DEFAULT_INVENTORY); }
    };
    fetchInventory();

    // Fetch Blackouts
    const q = query(collection(db, "blackout_dates"));
    const unsubscribeBlackouts = onSnapshot(q, (snapshot) => {
        const dates = snapshot.docs.map(doc => doc.id); // Doc ID is the YYYY-MM-DD string
        setBlackouts(dates);
    });
    
    return () => unsubscribeBlackouts();
  }, []);

  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed:", error); alert("Login failed."); } };
  const handleLogout = async () => { await signOut(auth); goHome(); };
  const goHome = () => { setCurrentView('home'); setSubmitted(false); };
  const isRequestView = ['home', Departments.FILM, Departments.GRAPHIC, Departments.BUSINESS, Departments.CULINARY, Departments.PHOTO].includes(currentView);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={goHome}>
            <img src={salpointeLogo} alt="Salpointe Catholic Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-wide leading-tight">Salpointe Catholic</h1>
              <p className="text-[10px] md:text-xs text-red-200 uppercase tracking-wider">CTE Request Hub</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 md:gap-2 ml-auto">
            {!isRequestView && currentView !== 'home' && (
               <button onClick={goHome} className="text-xs md:text-sm bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 mr-1">
                <ArrowLeft size={16} /><span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button onClick={() => { setCurrentView(Departments.CALENDAR); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.CALENDAR ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}>
              <Calendar size={16} /><span className="hidden sm:inline">Schedule</span>
            </button>
            
            {currentUser ? (
                <>
                    <button onClick={() => { setCurrentView(Departments.MY_REQUESTS); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.MY_REQUESTS ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}>
                        <History size={16} /><span className="hidden sm:inline">My Requests</span>
                    </button>
                    {adminMode && (
                      <>
                        <button onClick={() => { setCurrentView(Departments.QUEUE); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.QUEUE ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}>
                            <ClipboardList size={16} /><span className="hidden sm:inline">Queue</span>
                        </button>
                        <button onClick={() => { setCurrentView(Departments.ANALYTICS); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.ANALYTICS ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}>
                            <BarChart3 size={16} /><span className="hidden sm:inline">Stats</span>
                        </button>
                        <button onClick={() => { setCurrentView(Departments.INVENTORY); setSubmitted(false); }} className={`text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentView === Departments.INVENTORY ? 'bg-red-950 text-white shadow-inner' : 'text-red-100 hover:bg-red-800 hover:text-white'}`}>
                            <Settings size={16} /><span className="hidden sm:inline">Stock</span>
                        </button>
                      </>
                    )}
                    <button onClick={handleLogout} className="ml-2 text-xs md:text-sm font-medium px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-950 text-red-200 hover:text-white transition-colors flex items-center gap-2" title={`Logged in as ${currentUser.email}`}>
                        <LogOut size={16} />
                    </button>
                </>
            ) : (
                <button onClick={handleLogin} className="ml-2 text-xs md:text-sm font-bold bg-white text-red-900 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2 shadow-sm">
                    <LogIn size={16} /> Login
                </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
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
      
      <footer className="text-center text-slate-400 text-xs md:text-sm py-8 px-4">&copy; {new Date().getFullYear()} Salpointe Catholic High School CTE Department</footer>
    </div>
  );

  // --- Sub-Components ---

  function SuccessView({ onReset }) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 text-center animate-fade-in-up mt-8 md:mt-16">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"><CheckCircle size={32} className="md:w-10 md:h-10" /></div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Request Received!</h2>
        <p className="text-slate-600 mb-8 text-sm md:text-base">Your request has been saved to the database and the department head has been notified.</p>
        <button onClick={onReset} className="bg-red-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-lg hover:shadow-xl w-full text-sm md:text-base">Submit Another Request</button>
      </div>
    );
  }

  function Dashboard({ onViewChange, currentUser }) {
    // ... (Same as previous)
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
      { id: Departments.FILM, title: "Film & TV", icon: Video, desc: "Checkout equipment (cameras, drones) or request event recording/broadcasting.", color: "bg-blue-50 text-blue-700 border-blue-200" },
      { id: Departments.GRAPHIC, title: "Graphic Design", icon: PenTool, desc: "Request creative assets like logos, posters, flyers, or website designs.", color: "bg-purple-50 text-purple-700 border-purple-200" },
      { id: Departments.BUSINESS, title: "Business", icon: Briefcase, desc: "Submit business plans for review or request consultation for student startups.", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { id: Departments.CULINARY, title: "Culinary Arts", icon: Utensils, desc: "Request catering services for school clubs, faculty meetings, or special events.", color: "bg-orange-50 text-orange-700 border-orange-200" },
      { id: Departments.PHOTO, title: "Photography", icon: Camera, desc: "Reserve cameras/lenses or request a photographer for your event.", color: "bg-pink-50 text-pink-700 border-pink-200" }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-full mb-2 md:mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{currentUser ? `Welcome, ${currentUser.displayName.split(' ')[0]}.` : "Welcome, Lancer."}</h2>
          <p className="text-slate-600 text-sm md:text-base">Select a department below to start your request.</p>
        </div>
        {cards.map((card) => (
          <div key={card.id} onClick={() => onViewChange(card.id)} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-5 md:p-6 cursor-pointer transition-all hover:-translate-y-1 flex flex-col h-full active:scale-95 md:active:scale-100">
            {drafts[card.id] && (<span className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10"><Save size={12} /> Resume Draft</span>)}
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><card.icon size={24} /></div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{card.title}</h3><p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  function ContactSection({ initialData = {}, currentUser }) {
    const defaultName = currentUser?.displayName || initialData.fullName || '';
    const defaultEmail = currentUser?.email || initialData.email || '';
    return (
      <div className="bg-slate-50 p-5 md:p-6 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><User size={18} /> Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-600 mb-1">Project / Request Name</label><input name="requestName" type="text" defaultValue={initialData.requestName || ''} className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" placeholder="e.g. Football Video, Catering for NHS" required /></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label><input name="fullName" type="text" defaultValue={defaultName} readOnly={!!currentUser} className={`w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm ${currentUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} placeholder="Jane Doe" required /></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">Salpointe Email</label><input name="email" type="email" defaultValue={defaultEmail} readOnly={!!currentUser} className={`w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm ${currentUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} placeholder="jdoe@salpointe.org" required /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-600 mb-1">Role</label><select name="role" defaultValue={initialData.role || 'Student'} className="w-full rounded-md border-slate-300 shadow-sm p-2.5 border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm bg-white"><option>Student</option><option>Faculty / Staff</option><option>Club Representative</option></select></div>
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
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 text-white p-6 flex justify-between items-center"><div><h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Settings className="text-amber-400" /> Inventory Manager</h2><p className="text-slate-400 text-sm">Update Total Equipment Counts</p></div><button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">{saving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} {saving ? 'Saving...' : 'Save Changes'}</button></div>
            <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(localInventory).map(([item, count]) => (<div key={item} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center"><span className="font-medium text-slate-700 text-sm">{item.replace('*','')}</span><input type="number" min="0" value={count} onChange={(e) => handleChange(item, e.target.value)} className="w-20 p-2 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"/></div>))}</div></div>
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
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-emerald-600" /> CTE Insights</h2><p className="text-slate-500 text-sm">Real-time usage metrics and trends.</p></div><div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-600 font-mono text-sm">Total Requests: <strong>{stats.total}</strong></div></div>
          {loading ? <div className="text-center py-12 text-slate-400">Crunching numbers...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100"><h4 className="text-emerald-800 font-bold text-sm uppercase tracking-wide mb-1">Approval Rate</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-emerald-600">{approvalRate}%</span><span className="text-emerald-500 text-sm mb-1">of all requests</span></div></div>
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100"><h4 className="text-blue-800 font-bold text-sm uppercase tracking-wide mb-1">Completed / Approved</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-blue-600">{stats.approved}</span><span className="text-blue-500 text-sm mb-1">projects greenlit</span></div></div>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100"><h4 className="text-amber-800 font-bold text-sm uppercase tracking-wide mb-1">Pending Review</h4><div className="flex items-end gap-2"><span className="text-4xl font-bold text-amber-600">{stats.pending}</span><span className="text-amber-500 text-sm mb-1">awaiting action</span></div></div>
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={18} className="text-slate-400" /> Requests by Department</h3><div className="space-y-4">{Object.entries(stats.deptCounts).sort(([,a], [,b]) => b - a).map(([dept, count]) => { const percentage = (count / stats.total) * 100; return (<div key={dept}><div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-700">{dept}</span><span className="text-slate-500">{count} requests</span></div><div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className="bg-red-800 h-3 rounded-full" style={{ width: `${percentage}%` }}></div></div></div>); })}</div></div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Camera size={18} className="text-slate-400" /> Top Equipment</h3><ul className="space-y-3">{stats.topEquipment.map(([item, count], index) => (<li key={item} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{index + 1}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 truncate">{item.replace(' *', '')}</p><p className="text-xs text-slate-400">{count} checkouts</p></div></li>))}</ul></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function MyRequestsView({ currentUser }) {
    // ... (Existing Code)
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
    const getStatusColor = (status) => { switch(status) { case 'Approved': return 'bg-green-100 text-green-700'; case 'Denied': return 'bg-red-100 text-red-700'; case 'Completed': return 'bg-slate-100 text-slate-600'; default: return 'bg-yellow-100 text-yellow-700'; }};
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"><div className="bg-red-900 text-white p-6"><h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><History className="text-amber-400" /> My Request History</h2></div><div className="overflow-x-auto">{loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : myRequests.length === 0 ? <div className="p-12 text-center text-slate-500">No requests found.</div> : (<table className="w-full text-left border-collapse min-w-[700px]"><thead><tr className="bg-slate-50 border-b text-xs uppercase text-slate-500"><th className="p-4">ID</th><th className="p-4">Dept</th><th className="p-4">Request</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{myRequests.map((req) => (<tr key={req.id} className="hover:bg-slate-50"><td className="p-4 text-slate-400 font-mono text-xs">{req.displayId}</td><td className="p-4 capitalize text-sm">{req.dept}</td><td className="p-4 font-semibold text-sm">{req.title}</td><td className="p-4 text-sm">{req.formattedDate}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(req.status)}`}>{req.status}</span></td><td className="p-4">{req.status === 'Pending Review' && <button onClick={() => handleCancel(req.id)} className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50">Cancel</button>}</td></tr>))}</tbody></table>)}</div></div>
    );
  }

  // --- NEW: Calendar with Blackout Dates ---

  function CalendarView({ adminMode, blackouts }) {
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

        // Admin Toggle Blackout
        if (adminMode) {
            if (blackouts.includes(dateStr)) {
                if(window.confirm(`Re-open ${dateStr}?`)) await deleteDoc(doc(db, "blackout_dates", dateStr));
            } else {
                if(window.confirm(`Blackout ${dateStr}? Students will not be able to book this date.`)) await setDoc(doc(db, "blackout_dates", dateStr), { reason: "Closed" });
            }
            return;
        }
        
        // Normal User Click
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
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-red-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-4 mb-1">
                 <button onClick={prevMonth} className="p-1 hover:bg-red-800 rounded-full transition-colors"><ChevronLeft size={24}/></button>
                 <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">{monthName} {year}</h2>
                 <button onClick={nextMonth} className="p-1 hover:bg-red-800 rounded-full transition-colors"><ChevronRight size={24}/></button>
             </div>
             <p className="text-red-200 text-sm ml-1">Approved requests and checkouts</p>
          </div>
          <div className="flex bg-red-800 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            {['all', Departments.FILM, Departments.PHOTO, Departments.CULINARY].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f ? 'bg-white text-red-900 shadow-sm' : 'text-red-200 hover:text-white'}`}>{f === 'all' ? 'All' : f}</button>
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6">
           {adminMode && <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 flex items-center gap-2"><Ban size={14}/> Admin Mode: Click a date to toggle blackout status (close/open).</div>}
           <div className="overflow-x-auto pb-2">
            {loading ? <div className="text-center py-8 text-slate-400">Loading schedule...</div> : (
              <div className="min-w-[600px] md:min-w-0 grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>)}
                {empties.map(i => <div key={`empty-${i}`} className="bg-white min-h-[80px] md:min-h-[100px]" />)}
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === new Date().getDate() && displayDate.getMonth() === new Date().getMonth() && displayDate.getFullYear() === new Date().getFullYear();
                  const currentDateStr = new Date(year, displayDate.getMonth(), day).toISOString().split('T')[0];
                  const isBlackout = blackouts.includes(currentDateStr);

                  return (
                    <div 
                      key={day} 
                      className={`min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-t border-slate-100 relative group cursor-pointer transition-colors 
                        ${isBlackout ? 'bg-gray-100' : 'bg-white'} 
                        ${selectedDate === day ? 'bg-red-50' : 'hover:bg-slate-50'}`
                      } 
                      onClick={() => handleDateClick(day)}
                    >
                      <span className={`text-xs md:text-sm font-medium inline-block w-6 h-6 md:w-7 md:h-7 leading-6 md:leading-7 text-center rounded-full mb-1 ${isToday ? 'bg-red-900 text-white' : 'text-slate-700'}`}>{day}</span>
                      {isBlackout ? (
                          <div className="flex justify-center mt-2"><Ban className="text-gray-300" size={20} /></div>
                      ) : (
                        <div className="space-y-1">{dayEvents.map(e => <div key={e.id} className={`text-[10px] md:text-xs p-1 rounded border truncate ${e.type === 'checkout' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{e.title}</div>)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedDate && !blackouts.includes(new Date(year, displayDate.getMonth(), selectedDate).toISOString().split('T')[0]) && (
            <div className="mt-4 md:mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
              <h4 className="font-bold text-slate-800 mb-3">Events for {monthName} {selectedDate}</h4>
              {getEventsForDay(selectedDate).length === 0 ? <p className="text-slate-500 text-sm">No approved events.</p> : (
                <div className="space-y-3">{getEventsForDay(selectedDate).map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <div><p className="font-bold text-slate-800 text-sm">{e.title}</p><p className="text-xs text-slate-500 uppercase">{e.dept} • {e.fullName}</p></div>
                        <a href={getGoogleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="bg-slate-50 hover:bg-slate-100 p-2 rounded text-slate-600"><CalendarPlus size={16}/></a>
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
    const [searchTerm, setSearchTerm] = useState(''); // Added Search State
    
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
      if (!window.confirm(`Mark as ${newStatus}?`)) return;
      await updateDoc(doc(db, "requests", req.id), { status: newStatus });
      if (selectedRequest && selectedRequest.id === req.id) setSelectedRequest(prev => ({...prev, status: newStatus}));
      sendNotificationEmail({ to_name: req.fullName, to_email: req.email, subject: `Request Update: ${req.title}`, title: req.title, status: newStatus, message: `Status updated to ${newStatus}.` });
    };

    const handleDelete = async (id) => {
      if(window.confirm("Delete request?")) {
        await deleteDoc(doc(db, "requests", id));
        if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null);
      }
    };

    // CSV EXPORT FUNCTION
    const downloadCSV = () => {
      const headers = ["ID", "Department", "Title", "User", "Email", "Date Submitted", "Status", "Details"];
      const rows = requests.map(row => [
        row.displayId,
        row.dept,
        `"${row.title}"`, 
        row.fullName,
        row.email,
        row.formattedDate,
        row.status,
        `"${(row.details || row.brief || row.description || '').replace(/"/g, '""')}"` 
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "cte_requests_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Filter Logic (Dept + Search)
    const filteredRequests = requests.filter(r => {
        const matchesDept = filter === 'all' ? true : r.dept?.toLowerCase().includes(filter.toLowerCase());
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            r.title?.toLowerCase().includes(searchLower) || 
            r.fullName?.toLowerCase().includes(searchLower) || 
            r.displayId?.toLowerCase().includes(searchLower) ||
            r.email?.toLowerCase().includes(searchLower);
        return matchesDept && matchesSearch;
    });

    const getStatusColor = (status) => { switch(status) { case 'Approved': return 'bg-green-100 text-green-700'; case 'Denied': return 'bg-red-100 text-red-700'; case 'Completed': return 'bg-slate-100 text-slate-600'; default: return 'bg-yellow-100 text-yellow-700'; }};

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
        {/* Modal code remains the same... omitting for brevity but assumed present */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                <div><h3 className="text-xl font-bold text-slate-800">Request Details</h3><p className="text-xs text-slate-400 font-mono mt-1">ID: {selectedRequest.displayId}</p></div>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Department</label><p className="font-semibold text-slate-800 capitalize">{selectedRequest.dept}</p></div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Status</label><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Submitted By</label><p className="text-slate-800">{selectedRequest.fullName}</p></div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Contact</label><p className="text-slate-800">{selectedRequest.email}</p></div>
                 </div>
                 <hr className="border-slate-100" />
                 <div><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-slate-400"/> Details</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100">
                      {Object.entries(selectedRequest).map(([key, value]) => {
                        if(['id', 'dept', 'status', 'fullName', 'email', 'role', 'formattedDate', 'createdAt', 'title', 'requestName', 'displayId'].includes(key)) return null;
                        if(Array.isArray(value)) return <div key={key}><label className="text-xs font-bold text-slate-500 uppercase block mb-1">{key}</label><ul className="list-disc list-inside text-sm bg-white p-2 rounded border">{value.map((v,i)=><li key={i}>{v}</li>)}</ul></div>;
                        return <div key={key}><label className="text-xs font-bold text-slate-500 uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label><p className="text-slate-700 text-sm">{value}</p></div>
                      })}
                    </div>
                 </div>
                 {adminMode && (<div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100"><h4 className="font-bold text-indigo-900 mb-2 text-sm">Admin Actions</h4><div className="flex gap-3"><button onClick={() => handleStatusUpdate(selectedRequest, 'Approved')} className="flex-1 py-2 bg-green-600 text-white rounded text-sm">Approve</button><button onClick={() => handleStatusUpdate(selectedRequest, 'Denied')} className="flex-1 py-2 bg-red-600 text-white rounded text-sm">Deny</button></div></div>)}
              </div>
            </div>
          </div>
        )}

        <div className="bg-indigo-900 text-white p-4 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div><h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><ClipboardList className="text-indigo-300" /> All Requests</h2><p className="text-indigo-200 text-sm">Live Admin Queue</p></div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* SEARCH BAR */}
            <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300" size={16} />
                <input 
                    type="text" 
                    placeholder="Search requests..." 
                    className="w-full bg-indigo-800 text-white border border-indigo-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-indigo-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <select className="bg-indigo-800 text-white border border-indigo-700 rounded-lg px-4 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All Depts</option><option value="film">Film</option><option value="graphic">Graphic</option><option value="business">Business</option><option value="culinary">Culinary</option><option value="photo">Photo</option></select>
                {/* EXPORT BUTTON */}
                {adminMode && (
                    <button onClick={downloadCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors" title="Download CSV">
                        <Download size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead><tr className="bg-slate-50 border-b text-xs uppercase text-slate-500"><th className="p-4">ID</th><th className="p-4">Dept</th><th className="p-4">Request</th><th className="p-4">User</th><th className="p-4">Status</th><th className="p-4">View</th>{adminMode && <th className="p-4">Action</th>}</tr></thead>
              <tbody className="divide-y divide-slate-100">{filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-400 font-mono text-xs">{req.displayId}</td>
                    <td className="p-4 text-slate-700 text-sm capitalize">{req.dept}</td>
                    <td className="p-4 text-slate-800 font-semibold text-sm">{req.title}</td>
                    <td className="p-4 text-slate-600 text-sm">{req.fullName}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(req.status)}`}>{req.status}</span></td>
                    <td className="p-4"><button onClick={() => setSelectedRequest(req)} className="text-slate-400 hover:text-indigo-600 p-2"><Eye size={20} /></button></td>
                    {adminMode && <td className="p-4 flex gap-2"><button onClick={() => handleStatusUpdate(req, 'Approved')} className="p-1 bg-green-100 text-green-700 rounded"><Check size={16}/></button><button onClick={() => handleStatusUpdate(req, 'Denied')} className="p-1 bg-red-100 text-red-700 rounded"><X size={16}/></button><button onClick={() => handleDelete(req.id)} className="p-1 bg-slate-100 text-slate-700 rounded"><span className="font-mono text-xs font-bold px-1">DEL</span></button></td>}
                  </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  function FormContainer({ title, icon: Icon, colorClass, children, setSubmitted, initialData = {}, onCancel, currentUser, blackouts = [] }) { // Added blackouts prop
    const formRef = useRef(null);
    const draftKey = getDraftKey(title);
    const [showExitPrompt, setShowExitPrompt] = useState(false);

    // Save Draft Logic
    const saveDraftToStorage = () => {
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
        return true;
    };

    const handleSaveDraftButton = (e) => { e.preventDefault(); saveDraftToStorage(); alert('Draft saved!'); };
    const handleCancelRequest = () => { setShowExitPrompt(true); };
    const confirmSaveAndExit = () => { saveDraftToStorage(); setShowExitPrompt(false); onCancel(); };
    const confirmDiscardAndExit = () => { localStorage.removeItem(draftKey); setShowExitPrompt(false); onCancel(); };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = {};
      for (const [key, value] of formData.entries()) { if (data[key]) { if (!Array.isArray(data[key])) data[key] = [data[key]]; data[key].push(value); } else { data[key] = value; } }
      
      // *** BLACKOUT VALIDATION ***
      // Check any date fields against the blackouts array
      const dateFields = ['checkoutDate', 'returnDate', 'eventDate', 'pickupDate', 'deadline'];
      let conflictFound = false;
      
      dateFields.forEach(field => {
          if (data[field] && blackouts.includes(data[field])) {
              conflictFound = true;
          }
      });

      if (conflictFound) {
          alert("One of your selected dates is marked as a Blackout Date (Holiday/Closed). Please choose a different date.");
          return; // Stop submission
      }
      
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
      } catch (error) { console.error(error); alert("Error submitting."); }
    };

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden relative">
        {showExitPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600"><AlertTriangle size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Unsaved Changes</h3>
                    <p className="text-slate-600 mb-6">Do you want to save your draft?</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={confirmSaveAndExit} className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 flex items-center justify-center gap-2"><Save size={18} /> Save Draft & Exit</button>
                        <button onClick={confirmDiscardAndExit} className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50">Discard Changes</button>
                        <button onClick={() => setShowExitPrompt(false)} className="w-full text-slate-400 py-2 hover:text-slate-600 text-sm">Keep Editing</button>
                    </div>
                </div>
            </div>
        )}
        <div className={`h-2 ${colorClass}`}></div>
        <div className="p-5 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3"><div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}><Icon size={24} className={`md:w-7 md:h-7 ${colorClass.replace('bg-', 'text-')}`} /></div><div><h2 className="text-xl md:text-2xl font-bold text-slate-800">{title} Request</h2><p className="text-slate-500 text-xs md:text-sm">Please fill out all details accurately.</p></div></div>
            <button type="button" onClick={handleCancelRequest} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <form ref={formRef} onSubmit={handleSubmit}>
            <ContactSection initialData={initialData} currentUser={currentUser} />
            {children}
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button type="button" onClick={handleCancelRequest} className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 hover:text-slate-700 transition-colors">Cancel</button>
              <button type="button" onClick={handleSaveDraftButton} className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"><Save size={18} /> Save Draft</button>
              <button type="submit" className="w-full sm:w-auto bg-red-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors shadow-lg active:scale-95 md:active:scale-100">Submit Request</button>
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}><Box className="mx-auto mb-2" /> Equipment Checkout</button>
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300'}`}><MonitorPlay className="mx-auto mb-2" /> Broadcasting/Recording Team</button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 mb-4"><strong>Note:</strong> Equipment must be returned by 8:00 AM the following school day.</div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Checkout Date</label><input name="checkoutDate" defaultValue={initialData.checkoutDate} onChange={handleDateChange} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} onChange={handleDateChange} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
             </div>
             {isSingleDay && (
                <div className="mb-4 animate-fade-in bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-1">Duration / Specific Hours</label>
                    <select name="durationHours" defaultValue={initialData.durationHours} className="w-full rounded-md border-blue-300 border p-2.5 text-sm bg-white"><option value="">Select Duration...</option><option value="1 Hour">1 Hour</option><option value="2 Hours">2 Hours</option><option value="Full Day (School Hours)">Full Day</option><option value="Overnight">Overnight</option></select>
                </div>
             )}
             <label className="block text-sm font-medium text-slate-700">Select Equipment Needed: <span className="text-red-500 text-xs font-normal ml-1">* Requires Training</span></label>
             {!datesSelected ? (
                 <div className="p-4 bg-slate-100 rounded text-center text-slate-500 text-sm"><AlertCircle className="inline-block mr-2 w-4 h-4 mb-1"/>Please select dates above to check equipment availability.</div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {['Cinema Camera Kit *', 'Gimbal / Stabilizer *', 'DJI Mic Kit (Wireless)', 'DJI Flip Drone *', 'Tripod', 'Lighting Kit'].map((item) => {
                     const remaining = availableStock[item] !== undefined ? availableStock[item] : 99; const isSoldOut = remaining <= 0;
                     return (<label key={item} className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${isSoldOut ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer active:bg-blue-50'}`}><input type="checkbox" name="equipment" value={item} disabled={isSoldOut} defaultChecked={initialData.equipment?.includes(item)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" /><div className="flex-1"><span className="text-slate-700 text-sm block">{item}</span><span className={`text-xs ${isSoldOut ? 'text-red-600 font-bold' : 'text-green-600'}`}>{isSoldOut ? 'Unavailable for dates' : `${remaining} available`}</span></div></label>);
                   })}
                 </div>
             )}
             <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" required className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" /><span className="text-sm text-slate-700 leading-tight"><strong>Terms & Conditions:</strong> I agree to pay for equipment in full at market value in the event of damage beyond repair, lost, or stolen equipment.</span></label></div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
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

  function GraphicDesignForm({ setSubmitted, onCancel, currentUser }) {
    const title = 'Graphic';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={PenTool} colorClass="bg-purple-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser}>
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

  function BusinessForm({ setSubmitted, onCancel, currentUser }) {
    const title = 'Business';
    const draftKey = getDraftKey(title);
    const initialData = JSON.parse(localStorage.getItem(draftKey) || '{}');
    return (
      <FormContainer title={title} icon={Briefcase} colorClass="bg-emerald-600" setSubmitted={setSubmitted} initialData={initialData} onCancel={onCancel} currentUser={currentUser}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Assistance Needed</label><select name="assistanceType" defaultValue={initialData.assistanceType} className="w-full rounded-md border-slate-300 border p-2.5 text-sm shadow-sm bg-white"><option>Business Plan Review</option><option>Financial Modeling Help</option><option>Marketing Strategy</option><option>General Mentorship</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Idea Description</label><textarea name="description" defaultValue={initialData.description} className="w-full rounded-md border-slate-300 border p-2.5 text-sm h-40" placeholder="Briefly describe your product..." required></textarea></div>
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
        <div className="space-y-4">
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

  function PhotoForm({ setSubmitted, onCancel, currentUser, inventory, blackouts }) { // Added blackouts
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setRequestType('service')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'service' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}><Users className="mx-auto mb-2" /> Event Coverage</button>
            <button type="button" onClick={() => setRequestType('checkout')} className={`p-4 rounded-lg border-2 text-center transition-all ${requestType === 'checkout' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 hover:border-pink-300'}`}><Box className="mx-auto mb-2" /> Equipment Checkout</button>
          </div>
        </div>
        {requestType === 'checkout' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-pink-50 p-4 rounded-md border border-pink-100 text-sm text-pink-800 mb-4"><strong>Requirement:</strong> Photo I completion required.</div>
             
             {/* Dates Moved Up */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date</label><input name="pickupDate" defaultValue={initialData.pickupDate} onChange={handleDateChange} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
               <div><label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label><input name="returnDate" defaultValue={initialData.returnDate} onChange={handleDateChange} type="date" className="w-full rounded-md border-slate-300 border p-2.5 text-sm" required /></div>
             </div>

             {/* Single Day Hours Selection for Photo */}
             {isSingleDay && (
                <div className="mb-4 animate-fade-in bg-pink-50 p-4 rounded-lg border border-pink-100">
                    <label className="block text-sm font-bold text-pink-800 mb-1">Duration / Specific Hours</label>
                    <select name="durationHours" defaultValue={initialData.durationHours} className="w-full rounded-md border-pink-300 border p-2.5 text-sm bg-white"><option value="">Select Duration...</option><option value="1 Hour">1 Hour</option><option value="2 Hours">2 Hours</option><option value="Full Day (School Hours)">Full Day</option><option value="Overnight">Overnight</option></select>
                </div>
             )}

             <label className="block text-sm font-medium text-slate-700">Select Equipment Needed:</label>
             
             {!datesSelected ? (
                 <div className="p-4 bg-slate-100 rounded text-center text-slate-500 text-sm">
                     <AlertCircle className="inline-block mr-2 w-4 h-4 mb-1"/>
                     Please select dates above to check equipment availability.
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {['DSLR Camera Body', 'Zoom Lens (18-55mm)', 'Telephoto Lens (70-200mm)', 'Portrait Lens (50mm)', 'SD Card Reader', 'Tripod', 'Flash Unit'].map((item) => {
                     const remaining = availableStock[item] !== undefined ? availableStock[item] : 99; 
                     const isSoldOut = remaining <= 0;
                     
                     return (
                        <label key={item} className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${isSoldOut ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer active:bg-pink-50'}`}>
                        <input 
                            type="checkbox" 
                            name="equipment" 
                            value={item} 
                            disabled={isSoldOut}
                            defaultChecked={initialData.equipment?.includes(item)} 
                            className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" 
                        />
                        <div className="flex-1">
                            <span className="text-slate-700 text-sm block">{item}</span>
                            <span className={`text-xs ${isSoldOut ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                {isSoldOut ? 'Unavailable for dates' : `${remaining} available`}
                            </span>
                        </div>
                        </label>
                     );
                   })}
                 </div>
             )}

             {/* Terms & Conditions for Photo */}
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