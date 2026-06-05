import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, Wand2, History, Settings as SettingsIcon, 
  Search, LayoutGrid, ChevronRight, ArrowRight, ArrowLeft, Shield, HelpCircle, 
  Moon, Sun, Globe, Sparkles, LogOut, Check, Copy, Trash2, Info, Languages,
  MoreVertical, Share2, Pin, Undo, Redo, Edit2, X, AlertTriangle, Coins, PlayCircle,
  Lock, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  monitorAppUpdate, updateAppUpdate, clearAppUpdate, 
  incrementAdViews, monitorAdViews, 
  incrementUserOpen, fetchAllUserStats, monitorUserStats,
  syncUserData, incrementUserAdViews, getUserDoc, registerUser
} from './firebase-utils';

const translations: any = {
  en: { home: 'Home', notes: 'Notes', builder: 'Builder', history: 'History', settings: 'Settings', about: 'About', createPrompt: 'Create Prompt', recent: 'Recent', viewAll: 'View All', startProject: 'Start a new project', noHistory: 'No history yet.' },
  es: { home: 'Inicio', notes: 'Notas', builder: 'Creador', history: 'Historial', settings: 'Ajustes', about: 'Acerca de', createPrompt: 'Crear Prompt', recent: 'Reciente', viewAll: 'Ver Todo', startProject: 'Iniciar nuevo proyecto', noHistory: 'Sin historial aún.' },
  fr: { home: 'Accueil', notes: 'Notes', builder: 'Créateur', history: 'Historique', settings: 'Paramètres', about: 'À propos', createPrompt: 'Créer Prompt', recent: 'Récent', viewAll: 'Voir Tout', startProject: 'Démarrer un projet', noHistory: 'Aucun historique.' }
};



const AdsterraBanner = () => {
  return (
    <div className="w-full flex justify-center my-6 overflow-hidden">
      <div className="w-[320px] h-[50px] bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-center relative flex-shrink-0">
        <iframe
          srcDoc={`<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;text-align:center;overflow:hidden;"><script>atOptions = {'key' : '881a3a53a35faa08bc646ebed51328d4','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};</script><script src="https://www.highperformanceformat.com/881a3a53a35faa08bc646ebed51328d4/invoke.js"></script></body></html>`}
          width="320"
          height="50"
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-top-navigation allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 rounded-2xl"
          title="Advertisement"
        />
        {/* Placeholder text visible behind the iframe */}
        <span className="text-white/30 text-xs absolute pointer-events-none tracking-widest uppercase">ADVERTISEMENT</span>
      </div>
    </div>
  );
};

const AdsterraSquareBanner = () => {
  return (
    <div className="w-full flex justify-center my-0 overflow-hidden">
      <div className="w-[300px] h-[250px] bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-center relative flex-shrink-0">
        <iframe
          srcDoc={`<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;text-align:center;overflow:hidden;"><script>atOptions = {'key' : '0113bbfcf20f16f371fd963ed59aacbb','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};</script><script src="https://www.highperformanceformat.com/0113bbfcf20f16f371fd963ed59aacbb/invoke.js"></script></body></html>`}
          width="300"
          height="250"
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-top-navigation allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 rounded-2xl"
          title="Advertisement"
        />
        {/* Placeholder text visible behind the iframe */}
        <span className="text-white/30 text-xs absolute pointer-events-none tracking-widest uppercase">ADVERTISEMENT</span>
      </div>
    </div>
  );
};

const AdsterraNativeBanner = () => {
  return (
    <div className="w-full flex justify-center my-0 overflow-hidden">
      <div className="w-full max-w-[600px] min-h-[300px] bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-center relative flex-shrink-0">
        <iframe
          srcDoc={`<!DOCTYPE html><html><head></head><body style="margin:0;padding:0;text-align:center;"><script async="async" data-cfasync="false" src="https://pl29271929.profitablecpmratenetwork.com/bb69ef583463f69da669300a30c4519e/invoke.js"></script><div id="container-bb69ef583463f69da669300a30c4519e"></div></body></html>`}
          width="100%"
          height="100%"
          style={{ minHeight: '300px' }}
          frameBorder="0"
          scrolling="yes"
          sandbox="allow-scripts allow-top-navigation allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 rounded-2xl z-10"
          title="Native Advertisement"
        />
        {/* Placeholder text visible behind the iframe */}
        <span className="text-white/30 text-xs absolute pointer-events-none tracking-widest uppercase">ADVERTISEMENT</span>
      </div>
    </div>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState(() => localStorage.getItem('currentTab') || 'home');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [adConfig, setAdConfig] = useState<any>(null);
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('prompt_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [editData, setEditData] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('editingNote');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem('userPassword') || '');
  const [showNamePopup, setShowNamePopup] = useState(() => !localStorage.getItem('userName'));
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);

  const [globalApiKey, setGlobalApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  // Show API key popup only if we already have the name
  const [showGlobalApiPopup, setShowGlobalApiPopup] = useState(() => !showNamePopup && !localStorage.getItem('user_gemini_api_key'));
  const [tempGlobalApiKey, setTempGlobalApiKey] = useState(globalApiKey);

  const [credits, setCredits] = useState(() => parseInt(localStorage.getItem('credits') || '5', 10));

  const [appUpdateData, setAppUpdateData] = useState<any>(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  useEffect(() => {
    // Monitor App Update from Firebase
    const unsubUpdate = monitorAppUpdate((data) => {
      if (data) {
        setAppUpdateData(data);
        if (data.active && !(window as any).updateShown) {
          setShowUpdatePopup(true);
        } else if (!data.active) {
          setShowUpdatePopup(false);
        }
      } else {
        setAppUpdateData(null);
        setShowUpdatePopup(false);
      }
    });

    return () => {
      unsubUpdate();
    };
  }, []);

  useEffect(() => {
    if (userName) {
      // Analytics tracking (User opens per day)
      const today = new Date().toISOString().split('T')[0];
      if (!(window as any).appOpenedRecorded) {
        incrementUserOpen(userName, today);
        (window as any).appOpenedRecorded = true;
      }

      if (!globalApiKey && !showGlobalApiPopup) {
         setShowGlobalApiPopup(true);
      }
    }
  }, [userName]);

  const handleRegister = async () => {
    const trimmedName = authName.trim();
    const trimmedPass = authPassword;
    if (!trimmedName || !trimmedPass) {
      setAuthError('Name and Password are required');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const existingUser = await getUserDoc(trimmedName);
      if (existingUser) {
        setAuthError('Username already exists. Please login instead.');
      } else {
        await registerUser(trimmedName, trimmedPass);
        
        // Also save in local backup registry
        const localUsers = JSON.parse(localStorage.getItem('localUsersRegistry') || '{}');
        localUsers[trimmedName] = {
          password: trimmedPass,
          createdAt: Date.now(),
          credits: 5,
          history: [],
          totalAdViews: 0
        };
        localStorage.setItem('localUsersRegistry', JSON.stringify(localUsers));

        setUserName(trimmedName);
        setUserPassword(trimmedPass);
        localStorage.setItem('userName', trimmedName);
        localStorage.setItem('userPassword', trimmedPass);
        localStorage.setItem('credits', '5');
        setCredits(5);
        setHistory([]);
        localStorage.setItem('prompt_history', '[]');
        setShowNamePopup(false);
        setAuthName('');
        setAuthPassword('');
      }
    } catch (e: any) {
      // Offline / network fallback
      const localUsers = JSON.parse(localStorage.getItem('localUsersRegistry') || '{}');
      if (localUsers[trimmedName]) {
        setAuthError('Username already exists. Please login instead.');
      } else {
        localUsers[trimmedName] = {
          password: trimmedPass,
          createdAt: Date.now(),
          credits: 5,
          history: [],
          totalAdViews: 0
        };
        localStorage.setItem('localUsersRegistry', JSON.stringify(localUsers));

        setUserName(trimmedName);
        setUserPassword(trimmedPass);
        localStorage.setItem('userName', trimmedName);
        localStorage.setItem('userPassword', trimmedPass);
        localStorage.setItem('credits', '5');
        setCredits(5);
        setHistory([]);
        localStorage.setItem('prompt_history', '[]');
        setShowNamePopup(false);
        setAuthName('');
        setAuthPassword('');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    const trimmedName = authName.trim();
    const trimmedPass = authPassword;
    if (!trimmedName || !trimmedPass) {
      setAuthError('Name and Password are required');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const userDoc = await getUserDoc(trimmedName);
      if (!userDoc) {
        setAuthError('Account does not exist. Please register first.');
      } else if (userDoc.password !== trimmedPass) {
        setAuthError('Incorrect password. Please try again.');
      } else {
        setUserName(trimmedName);
        setUserPassword(trimmedPass);
        localStorage.setItem('userName', trimmedName);
        localStorage.setItem('userPassword', trimmedPass);
        
        const loadedCredits = userDoc.credits !== undefined ? userDoc.credits : 5;
        localStorage.setItem('credits', loadedCredits.toString());
        setCredits(loadedCredits);

        const loadedHistory = userDoc.history || [];
        localStorage.setItem('prompt_history', JSON.stringify(loadedHistory));
        setHistory(loadedHistory);

        // Update local backup registry as well
        const localUsers = JSON.parse(localStorage.getItem('localUsersRegistry') || '{}');
        localUsers[trimmedName] = {
          password: trimmedPass,
          createdAt: userDoc.createdAt || Date.now(),
          credits: loadedCredits,
          history: loadedHistory,
          totalAdViews: userDoc.totalAdViews || 0
        };
        localStorage.setItem('localUsersRegistry', JSON.stringify(localUsers));

        setShowNamePopup(false);
        setAuthName('');
        setAuthPassword('');
      }
    } catch (e: any) {
      // Offline / network fallback
      const localUsers = JSON.parse(localStorage.getItem('localUsersRegistry') || '{}');
      const localUser = localUsers[trimmedName];
      if (localUser) {
        if (localUser.password === trimmedPass) {
          setUserName(trimmedName);
          setUserPassword(trimmedPass);
          localStorage.setItem('userName', trimmedName);
          localStorage.setItem('userPassword', trimmedPass);
          
          const loadedCredits = localUser.credits !== undefined ? localUser.credits : 5;
          localStorage.setItem('credits', loadedCredits.toString());
          setCredits(loadedCredits);

          const loadedHistory = localUser.history || [];
          localStorage.setItem('prompt_history', JSON.stringify(loadedHistory));
          setHistory(loadedHistory);

          setShowNamePopup(false);
          setAuthName('');
          setAuthPassword('');
        } else {
          setAuthError('Incorrect password. Please try again.');
        }
      } else {
        setAuthError('Account does not exist locally. Please register or check connection.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveGlobalApiKey = () => {
    setGlobalApiKey(tempGlobalApiKey);
    localStorage.setItem('user_gemini_api_key', tempGlobalApiKey);
    setShowGlobalApiPopup(false);
  };

  useEffect(() => {
    localStorage.setItem('credits', credits.toString());
    if (userName) {
      syncUserData(userName, { credits });
    }
  }, [credits, userName]);

  useEffect(() => {
    localStorage.setItem('currentTab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (editingNote) localStorage.setItem('editingNote', JSON.stringify(editingNote));
    else localStorage.removeItem('editingNote');
  }, [editingNote]);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history));
    if (userName) {
      syncUserData(userName, { history });
    }
  }, [history, userName]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'light' ? 'light-theme' : 'dark';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleEdit = (item: any) => {
    setEditData(item.formData);
    setCurrentTab('builder');
  };

  const handleDelete = (id: number) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const handleStartNew = () => {
    setEditData(null);
    localStorage.removeItem('builder_step');
    localStorage.removeItem('builder_formData');
    localStorage.removeItem('builder_generatedPrompt');
    localStorage.removeItem('builder_generatedNoteId');
    // Important: we need to trigger BuilderPage to reset its state, we can use an event or a unique `editData` value. 
    // Setting editData to a special object:
    setEditData({ isNew: true });
    setCurrentTab('builder');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('user_gemini_api_key');
    localStorage.removeItem('prompt_history');
    localStorage.setItem('credits', '5');
    window.location.reload();
  };

  const t = translations[language] || translations.en;

  return (
    <div className={`min-h-screen bg-[#05030A] text-white font-sans selection:bg-purple-500/30 font-inter ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Desktop Sidebar (visible on md and above) */}
        {currentTab !== 'ad_view' && currentTab !== 'admin' && (
          <aside className="hidden md:flex w-72 bg-[#0C0A14] border-r border-white/5 flex-col p-6 sticky top-0 h-screen justify-between z-40 shrink-0">
            {/* Upper Section */}
            <div className="space-y-6">
              {/* BRANDING */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#60A5FA] flex items-center justify-center shadow-lg">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-[#A78BFA] to-[#60A5FA] bg-clip-text text-transparent tracking-tight">Prompt Builder</h1>
                  <p className="text-[10px] text-gray-500 font-medium">SaaS Workspace</p>
                </div>
              </div>

              {/* USER STATS PROFILE */}
              <div className="bg-[#12101F] border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs shrink-0">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="leading-tight overflow-hidden">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Profile</p>
                      <p className="text-sm font-bold text-white truncate max-w-[120px]">{userName || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1A162D] border border-yellow-500/30 px-2 py-1 rounded-full shrink-0">
                    <span className="text-xs">🪙</span>
                    <span className="font-bold text-yellow-200 text-xs">{credits}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setAdConfig(null);
                    setCurrentTab('ad_view');
                  }}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-yellow-500/5"
                >
                  <PlayCircle size={14} /> Watch Ad (+1 Credit)
                </button>
              </div>

              {/* NAVIGATION LINKS */}
              <nav className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Workspace Navigation</p>
                
                <button 
                  onClick={() => setCurrentTab('home')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'home' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Home size={18} />
                  <span>{t.home || 'Home'}</span>
                </button>

                <button 
                  onClick={handleStartNew}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'builder' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Wand2 size={18} />
                  <span>Start New Prompt</span>
                </button>

                <button 
                  onClick={() => setCurrentTab('notes')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'notes' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <FileText size={18} />
                  <span>{t.notes || 'Notes'}</span>
                </button>

                <button 
                  onClick={() => setCurrentTab('history')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'history' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <History size={18} />
                  <span>{t.history || 'History'}</span>
                </button>

                <button 
                  onClick={() => setCurrentTab('settings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'settings' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <SettingsIcon size={18} />
                  <span>{t.settings || 'Settings'}</span>
                </button>

                <button 
                  onClick={() => setCurrentTab('about')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    currentTab === 'about' 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Info size={18} />
                  <span>About</span>
                </button>

                {userName === 'admin' && (
                  <button 
                    onClick={() => setCurrentTab('admin')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      currentTab === 'admin' 
                        ? 'bg-red-600/10 text-red-400 border border-red-500/20' 
                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent'
                    }`}
                  >
                    <Shield size={18} />
                    <span>Admin Panel</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Bottom logout block */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between px-3 text-xs text-gray-500 font-semibold border-t border-white/5 pt-4">
                <span>V2.0.0</span>
                <span>Active Session</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold border border-red-500/10 hover:border-red-500/20 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </aside>
        )}

        {/* Right workspace container */}
        <main className="flex-1 min-h-screen">
          <AnimatePresence mode="wait">
            {currentTab === 'home' && <HomePage key="home" setCurrentTab={setCurrentTab} history={history} setEditData={setEditData} credits={credits} setCredits={setCredits} t={t} setAdConfig={setAdConfig} onStartNew={handleStartNew} />}
            {currentTab === 'notes' && <NotesPage key="notes" history={history} setHistory={setHistory} editingNote={editingNote} setEditingNote={setEditingNote} t={t} />}
            {currentTab === 'builder' && <BuilderPage key="builder" setCurrentTab={setCurrentTab} history={history} setHistory={setHistory} editData={editData} setEditData={setEditData} setEditingNote={setEditingNote} credits={credits} setCredits={setCredits} t={t} setAdConfig={setAdConfig} />}
            {currentTab === 'history' && <HistoryPage key="history" history={history} onEdit={handleEdit} onDelete={handleDelete} t={t} />}
            {currentTab === 'settings' && <SettingsPage key="settings" theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} setCurrentTab={setCurrentTab} t={t} apiKey={globalApiKey} setApiKey={setGlobalApiKey} onLogout={handleLogout} />}
            {currentTab === 'about' && <AboutPage key="about" setCurrentTab={setCurrentTab} t={t} />}
            {currentTab === 'ad_view' && <AdViewPage key="ad_view" setCurrentTab={setCurrentTab} setCredits={setCredits} adConfig={adConfig} userName={userName} />}
            {currentTab === 'admin' && <AdminPage key="admin" setCurrentTab={setCurrentTab} />}
          </AnimatePresence>
        </main>
      </div>
      {currentTab !== 'ad_view' && currentTab !== 'admin' && <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} t={t} onStartNew={handleStartNew} />}

      <AnimatePresence>
        {showUpdatePopup && appUpdateData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-[#1C1A2D] to-[#120F1C] border border-blue-500/20 rounded-[32px] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(59,130,246,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="flex justify-center mb-6 mt-2 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg relative z-10">
                  <Sparkles size={36} className="text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-2">{appUpdateData.title}</h2>
              <p className="text-blue-400 text-sm font-semibold text-center uppercase tracking-widest mb-6">Update Available</p>
              
              <div className="bg-black/30 rounded-2xl p-5 mb-8 border border-white/5 max-h-40 overflow-y-auto hide-scrollbar">
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{appUpdateData.features}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <a 
                  href={appUpdateData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShowUpdatePopup(false);
                    // Mark as shown so we don't annoy user on every refresh
                    (window as any).updateShown = true;
                  }}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-center shadow-lg hover:shadow-blue-500/25 transition-all text-[15px]"
                >
                  Update Now
                </a>
                <button 
                  onClick={() => {
                    setShowUpdatePopup(false);
                    (window as any).updateShown = true;
                  }}
                  className="w-full py-3 text-gray-500 text-sm font-medium hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!globalApiKey && !showGlobalApiPopup && (
        <div className="fixed bottom-24 left-4 right-4 bg-[#EF4444] text-white p-4 rounded-2xl text-center shadow-lg shadow-red-500/20 backdrop-blur-md z-[55] flex flex-col items-center justify-center gap-3 border border-white/10">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <AlertTriangle size={20} />
            NOT ENTER VALID API KEY
          </div>
          <button onClick={() => setShowGlobalApiPopup(true)} className="bg-white text-red-500 font-bold px-6 py-2.5 rounded-xl text-sm w-full transition-transform active:scale-95 shadow-sm">
            Enter API Key
          </button>
        </div>
      )}

      <AnimatePresence>
        {showNamePopup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-3">
                  <Sparkles className="text-purple-400" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white text-center">
                  {authMode === 'register' ? 'Create Account ✨' : 'Welcome Back! 👋'}
                </h3>
                <p className="text-xs text-gray-400 text-center mt-1 leading-relaxed">
                  {authMode === 'register' 
                    ? 'Register with your name and a password' 
                    : 'Enter your name and password to log in'}
                </p>
              </div>

              {/* Login/Register Tab Toggle as requested ("previous button" or already-registered option) */}
              <div className="flex bg-[#05030A] p-1 rounded-xl gap-1 border border-white/5 mb-5 select-none">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 text-center leading-relaxed font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">
                    Your Name
                  </label>
                  <input 
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-[#05030A] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium text-sm"
                    placeholder="Enter your name"
                    disabled={authLoading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="text-[10px] font-bold text-purple-400 hover:text-purple-300"
                    >
                      {showAuthPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input 
                    type={showAuthPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#05030A] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium text-sm font-mono"
                    placeholder="Enter password"
                    disabled={authLoading}
                  />
                </div>

                <div className="pt-2">
                  {authMode === 'register' ? (
                    <button 
                      onClick={handleRegister}
                      disabled={authLoading || !authName.trim() || !authPassword}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleLogin}
                      disabled={authLoading || !authName.trim() || !authPassword}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Logging In...' : 'Log In'}
                    </button>
                  )}
                </div>

                <div className="text-center pt-1">
                  {authMode === 'register' ? (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Already have an account? <span className="text-purple-400 font-bold">Log in here →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Need a new account? <span className="text-purple-400 font-bold">Register here →</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGlobalApiPopup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              {globalApiKey && (
                <button onClick={() => setShowGlobalApiPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
                  <X size={20} />
                </button>
              )}
              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="text-purple-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white text-center">Gemini API Key Needed</h3>
                <p className="text-sm text-gray-400 text-center mt-2 leading-relaxed">
                  Enter your valid Google Gemini API key to work properly. The key will be stored securely on your device for 1-2 months.
                </p>
              </div>
              
              <textarea 
                value={tempGlobalApiKey}
                onChange={(e) => setTempGlobalApiKey(e.target.value)}
                className="w-full bg-[#05030A] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-24 mb-4 text-sm font-mono placeholder:text-gray-600"
                placeholder="AIzaSy..."
                spellCheck="false"
              />
              <button 
                onClick={handleSaveGlobalApiKey}
                className="w-full py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform mb-3"
              >
                Save API Key
              </button>
              <a 
                href="https://aistudio.google.com/app/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors shadow-sm"
              >
                Create API Key
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BottomNav = ({ currentTab, setCurrentTab, t, onStartNew }: { currentTab: string, setCurrentTab: (tab: string) => void, t: any, onStartNew: () => void }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  if (isKeyboardOpen) return null;

  return (
    <div className="fixed bottom-3 left-4 right-4 sm:left-1/2 sm:right-auto sm:w-[380px] sm:-translate-x-1/2 z-50 md:hidden">
      <div className="bg-[#1A1625]/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.15)] rounded-full px-5 py-1.5 flex justify-between items-center relative">
        <NavItem icon={<Home />} label={t.home} isActive={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
        <NavItem icon={<FileText />} label={t.notes} isActive={currentTab === 'notes'} onClick={() => setCurrentTab('notes')} />
        
        {/* FAB */}
        <div className="relative -top-5">
          <button 
            onClick={onStartNew}
            className={`rounded-full p-1 bg-gradient-to-b from-[#2A253C] to-[#120F1C] border border-white/20 shadow-[0_8px_30px_rgba(168,85,247,0.5)] transition-all hover:scale-110 active:scale-95 ${currentTab === 'builder' ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.8)]' : ''}`}
          >
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" 
              alt="Create Prompt" 
              className={`w-[44px] h-[44px] object-cover rounded-full ${currentTab === 'builder' ? 'animate-pulse' : ''}`} 
            />
          </button>
        </div>

        <NavItem icon={<History />} label={t.history} isActive={currentTab === 'history'} onClick={() => setCurrentTab('history')} />
        <NavItem icon={<SettingsIcon />} label={t.settings} isActive={currentTab === 'settings'} onClick={() => setCurrentTab('settings')} />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-12 gap-1 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>
    {React.cloneElement(icon, { size: 20, className: isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : '' })}
    <span className="text-[9px] font-semibold tracking-wide">{label}</span>
  </button>
);

const AdViewPage = ({ setCurrentTab, setCredits, adConfig, userName }: any) => {
  const [page, setPage] = useState(adConfig?.startPage || 1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [clickedPage1, setClickedPage1] = useState(false);
  const [clickedPage2, setClickedPage2] = useState(false);
  const [isHoveringAd1, setIsHoveringAd1] = useState(false);
  const [isHoveringAd2, setIsHoveringAd2] = useState(false);

  useEffect(() => {
    // Analytics tracking (Ad page views)
    incrementAdViews();
    if (userName) {
      incrementUserAdViews(userName);
    }
  }, [page, userName]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    const handleBlur = () => {
      // If user is hovering any of the ad wrappers when focus is lost,
      // or if document activeElement is indeed an iframe, mark ad as clicked.
      if (isHoveringAd1 || isHoveringAd2 || (document.activeElement && document.activeElement.tagName === 'IFRAME')) {
        if (page === 1) {
          setClickedPage1(true);
        } else {
          setClickedPage2(true);
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    // Also track focus event to detect when the user comes back
    const handleFocus = () => {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        // Reset focus back to body so subsequent clicks can be registered
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [page, isHoveringAd1, isHoveringAd2]);

  const handleNext = () => {
    if (page === 1 && !adConfig) {
      setPage(2);
      setTimeLeft(10);
    } else {
      if (adConfig?.onComplete) {
        adConfig.onComplete();
      } else {
        setCredits((prev: number) => prev + 1);
      }
      setCurrentTab(adConfig?.nextTab || 'home');
    }
  };

  const showActionButton = page === 1 ? clickedPage1 : clickedPage2;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#05030A] z-[100] flex flex-col items-center overflow-y-auto py-4">
      {/* Top Header with counter / action */}
      <div className="w-full flex justify-between items-center px-4 mb-3 z-10 max-w-md mx-auto">
        <div>
          {showActionButton ? (
            <span className="text-green-500 font-bold text-xs bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1 select-none">
              ✅ Ad Clicked! Proceed now
            </span>
          ) : (
            <span className="text-red-500 font-bold text-xs bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse select-none">
              ⚠️ Please click on the advertisement
            </span>
          )}
        </div>
        
        {showActionButton && (
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-[#1A1A1A] shadow-md">
            <button onClick={handleNext} className="w-full h-full flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
              {page === 1 ? <ArrowRight size={18} /> : <X size={18} />}
            </button>
          </div>
        )}
      </div>
      
      {/* Advertising Content Area */}
      <div className="flex-1 w-full max-w-md flex flex-col items-center gap-4 px-4 pb-12">
        <div className="text-center w-full mb-1">
          <p className="text-[#FF3B30] text-xl sm:text-2xl font-extrabold uppercase tracking-widest animate-pulse select-none">
            Click on ads
          </p>
          <p className="text-gray-400 text-xs mt-1 select-none">
            {page === 1 ? "Click first ad to view the next page" : "Click second ad to finish and earn credits"}
          </p>
        </div>

        {page === 1 ? (
          <div className="space-y-4 w-full flex flex-col items-center relative">
            <div 
              onMouseEnter={() => setIsHoveringAd1(true)}
              onMouseLeave={() => setIsHoveringAd1(false)}
              className="relative w-[300px] h-[250px] transition-transform active:scale-[0.98] rounded-2xl overflow-hidden border border-white/10 bg-[#120F1C] shadow-lg"
            >
              <AdsterraSquareBanner />
              {/* Floating hint over the advertisement without blocking standard mouse pointer actions */}
              <div className="absolute top-2 left-2 bg-red-600/90 text-white font-bold text-[10px] px-2 py-1 rounded shadow pointer-events-none select-none z-20">
                🎯 CLICK HERE
              </div>
            </div>

            <div 
              onMouseEnter={() => setIsHoveringAd2(true)}
              onMouseLeave={() => setIsHoveringAd2(false)}
              className="relative w-[300px] h-[250px] transition-transform active:scale-[0.98] rounded-2xl overflow-hidden border border-white/10 bg-[#120F1C] shadow-lg"
            >
              <AdsterraSquareBanner />
              {/* Floating hint over the advertisement without blocking standard mouse pointer actions */}
              <div className="absolute top-2 left-2 bg-red-600/90 text-white font-bold text-[10px] px-2 py-1 rounded shadow pointer-events-none select-none z-20">
                🎯 CLICK HERE
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center relative">
            <div 
              onMouseEnter={() => setIsHoveringAd1(true)}
              onMouseLeave={() => setIsHoveringAd1(false)}
              className="relative w-full max-w-[600px] min-h-[300px] transition-transform active:scale-[0.98] rounded-2xl overflow-hidden border border-white/10 bg-[#120F1C] shadow-lg"
            >
              <AdsterraNativeBanner />
              {/* Floating hint over the advertisement without blocking standard mouse pointer actions */}
              <div className="absolute top-2 left-2 bg-red-600/90 text-white font-bold text-[10px] px-2 py-1 rounded shadow pointer-events-none select-none z-20">
                🎯 CLICK HERE
              </div>
            </div>

            <div 
              onMouseEnter={() => setIsHoveringAd2(true)}
              onMouseLeave={() => setIsHoveringAd2(false)}
              className="relative w-full max-w-[600px] min-h-[300px] transition-transform active:scale-[0.98] rounded-2xl overflow-hidden border border-white/10 bg-[#120F1C] shadow-lg"
            >
              <AdsterraNativeBanner />
              {/* Floating hint over the advertisement without blocking standard mouse pointer actions */}
              <div className="absolute top-2 left-2 bg-red-600/90 text-white font-bold text-[10px] px-2 py-1 rounded shadow pointer-events-none select-none z-20">
                🎯 CLICK HERE
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HomePage = ({ setCurrentTab, history, setEditData, credits, setCredits, t, setAdConfig, onStartNew }: any) => {
  const [showStartOptions, setShowStartOptions] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const startNewProject = () => {
    setShowStartOptions(false);
    onStartNew();
  };

  const openOldProject = (item: any) => {
    setEditData(item);
    setShowStartOptions(false);
    setCurrentTab('builder');
  };

  const watchAd = () => {
    setShowCreditsModal(false);
    setAdConfig(null); // Reset adConfig for default flow
    setCurrentTab('ad_view');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full relative">
      <header className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#A78BFA] to-[#60A5FA] bg-clip-text text-transparent mb-1 tracking-tight">Prompt Builder</h1>
          <p className="text-gray-400 text-sm">Craft the perfect AI prompt.</p>
        </div>
        <div 
          onClick={() => setShowCreditsModal(true)}
          className="flex items-center gap-1.5 bg-[#161423] border border-yellow-500/30 px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#1C1A2D] transition-colors shadow-lg shadow-yellow-500/5 group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform origin-center">🪙</span>
          <span className="font-bold text-yellow-100 text-sm">{credits}</span>
        </div>
      </header>

      <AnimatePresence>
        {showCreditsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-gradient-to-b from-[#0F1D45] to-[#040714] border border-blue-500/40 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-blue-500/15">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center p-1 border border-yellow-500/20 shadow-inner">
                      <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]">🪙</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Your Credits</h3>
                      <p className="text-yellow-500/80 text-sm font-medium">{credits} Credits Available</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCreditsModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <X size={18} className="text-gray-400 hover:text-white" />
                  </button>
                </div>

                <div className="bg-[#090D1F] rounded-2xl p-4 border border-blue-500/20 mb-2">
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    You need <strong className="text-white">1 Credit</strong> to generate a new AI prompt.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 rounded-xl border border-blue-500/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={18} className="text-blue-400" />
                      <span className="text-sm font-semibold text-blue-100">Watch Ads & Earn Credits</span>
                    </div>
                    <button 
                      onClick={watchAd}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                    >
                      Watch Ad (+1 Credit)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={() => setShowStartOptions(true)}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1E3A8A]/25 via-[#0B0F24]/95 to-[#020512] p-6 sm:p-8 mb-6 border border-[#3B82F6]/50 hover:border-[#A78BFA]/60 cursor-pointer group shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.25)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 group-hover:scale-x-105 transition-transform origin-left duration-500" />
        <div className="absolute top-6 right-6 text-[#60A5FA]/40 group-hover:text-[#A78BFA]/80 group-hover:rotate-12 transition-all duration-500">
          <Sparkles size={36} strokeWidth={1.5} className="filter drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center mb-5 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] overflow-hidden">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-full" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Create Prompt</h2>
        <p className="text-gray-300 text-sm mb-6 max-w-[85%] leading-relaxed">Use our step-by-step wizard to generate a highly optimized prompt for any AI.</p>
        <div className="flex items-center text-blue-400 group-hover:text-purple-300 font-semibold text-sm transition-colors">
          Start Building <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => setCurrentTab('notes')} 
          className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A] via-[#080C1D] to-[#030614] rounded-[24px] p-5 sm:p-6 border border-blue-500/35 hover:border-purple-500/50 cursor-pointer transition-all transform hover:-translate-y-1 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.15)] group"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-4 text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
            <FileText size={22} />
          </div>
          <h3 className="text-white font-bold mb-1 text-base sm:text-lg tracking-tight">Prompt Notes</h3>
          <p className="text-gray-400 text-xs">Your saved prompts</p>
        </div>
        <div 
          onClick={() => setCurrentTab('history')} 
          className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A] via-[#080C1D] to-[#030614] rounded-[24px] p-5 sm:p-6 border border-blue-500/35 hover:border-purple-500/50 cursor-pointer transition-all transform hover:-translate-y-1 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.15)] group"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-yellow-500 to-transparent opacity-60" />
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 flex items-center justify-center mb-4 text-yellow-500 border border-yellow-500/20 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all duration-300">
            <History size={22} />
          </div>
          <h3 className="text-white font-bold mb-1 text-base sm:text-lg tracking-tight">History</h3>
          <p className="text-gray-400 text-xs">Your past creations</p>
        </div>
      </div>

      <AdsterraBanner />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Creations</h3>
          <button onClick={() => setCurrentTab('history')} className="text-blue-400 hover:text-purple-300 text-xs font-semibold uppercase tracking-wider transition-colors">View All</button>
        </div>
        {history && history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {history.slice(0, 2).map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => setCurrentTab('history')} 
                className="relative overflow-hidden bg-gradient-to-r from-[#0F1E4A]/40 via-[#080C1D]/80 to-[#030614] rounded-2xl p-4 sm:p-5 border border-blue-500/30 cursor-pointer hover:border-purple-500/50 hover:from-[#11245A]/50 hover:to-[#050C21] transition-all transform hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_18px_rgba(139,92,246,0.1)] flex flex-col justify-between"
              >
                <h4 className="text-white font-bold text-sm truncate">{item.topic}</h4>
                <p className="text-gray-400 text-xs mt-1.5 truncate leading-relaxed">{item.prompt}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm bg-gradient-to-br from-[#0F1E4A]/20 to-[#030614] rounded-3xl border border-blue-500/25 shadow-inner">
            No recent prompts yet.
          </div>
        )}
      </div>

      <AnimatePresence>
        {showStartOptions && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-[#120F1C] border border-white/10 rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setShowStartOptions(false); }} 
                className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full cursor-pointer z-10"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-lg font-bold text-white mb-1">Build Prompt</h3>
              <p className="text-xs text-gray-400 mb-5">Choose how you want to start</p>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-4 mb-4 border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={startNewProject}
              >
                <div className="flex flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-purple-400 shadow-inner">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[15px]">Create New</h4>
                    <p className="text-gray-400 text-xs mt-0.5">Start a fresh project from scratch</p>
                  </div>
                </div>
              </div>

              {history && history.length > 0 && (
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  <h4 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-3">Recent Prompts</h4>
                  <div className="space-y-2">
                    {history.slice(0, 5).map((item: any) => (
                      <div 
                        key={item.id} 
                        onClick={() => openOldProject(item)}
                        className="bg-white/5 rounded-2xl p-3.5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-white font-medium text-sm truncate">{item.formData?.appName || item.topic || 'Untitled'}</h4>
                          <p className="text-gray-500 text-[11px] mt-1 truncate">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-gray-500 group-hover:text-purple-400 transition-colors">
                          <Edit2 size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NotesPage = ({ history, setHistory, editingNote, setEditingNote, t }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState('text-base');
  const [showMenu, setShowMenu] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Reset stacks when opening a new note
  useEffect(() => {
    if (editingNote) {
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [editingNote?.id]);

  const handleUpdateNote = (id: number, field: 'topic' | 'prompt' | 'isPinned', value: any) => {
    if (field === 'prompt' && editingNote) {
      setUndoStack(prev => {
        if (prev.length === 0 || prev[prev.length - 1] !== editingNote.prompt) {
          return [...prev, editingNote.prompt];
        }
        return prev;
      });
      setRedoStack([]);
    }

    const updatedHistory = history.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setHistory(updatedHistory);
    setEditingNote((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleUndo = () => {
    if (undoStack.length > 0 && editingNote) {
      const previousText = undoStack[undoStack.length - 1];
      setRedoStack(prev => [editingNote.prompt, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      
      const updatedHistory = history.map((item: any) => 
        item.id === editingNote.id ? { ...item, prompt: previousText } : item
      );
      setHistory(updatedHistory);
      setEditingNote((prev: any) => ({ ...prev, prompt: previousText }));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && editingNote) {
      const nextText = redoStack[0];
      setUndoStack(prev => [...prev, editingNote.prompt]);
      setRedoStack(prev => prev.slice(1));
      
      const updatedHistory = history.map((item: any) => 
        item.id === editingNote.id ? { ...item, prompt: nextText } : item
      );
      setHistory(updatedHistory);
      setEditingNote((prev: any) => ({ ...prev, prompt: nextText }));
    }
  };

  const filteredHistory = history.filter((item: any) => {
    const term = searchQuery.toLowerCase();
    const topic = (item.topic || '').toLowerCase();
    const prompt = (item.prompt || '').toLowerCase();
    return topic.includes(term) || prompt.includes(term);
  }).sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const DOT_COLORS = ['bg-[#FF3B6A]', 'bg-[#3B82F6]', 'bg-[#A855F7]', 'bg-[#EAB308]', 'bg-[#22C55E]', 'bg-[#06B6D4]'];

  if (editingNote) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-[60] flex flex-col bg-black md:bg-[#05030A]">
        {/* Inner container centered on desktop */}
        <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col bg-black md:border-x md:border-white/5 md:shadow-2xl md:my-6 md:rounded-[32px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-violet-600 to-blue-600 border-b border-white/5">
            <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setEditingNote(null)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-white" />
            </button>
            <input 
              type="text" 
              value={editingNote.topic}
              onChange={(e) => handleUpdateNote(editingNote.id, 'topic', e.target.value)}
              placeholder="Note Title"
              className="bg-transparent text-white font-medium text-lg focus:outline-none placeholder-gray-300 w-full font-['Roboto',_sans-serif]"
            />
          </div>
          <div className="relative ml-2">
            <button onClick={() => setShowMenu(!showMenu)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <MoreVertical size={24} className="text-white" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a2a2a] rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: editingNote.topic,
                          text: editingNote.prompt,
                        }).catch(console.error);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/5 flex items-center gap-3 text-sm"
                  >
                    <Share2 size={16} /> Share
                  </button>
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="text-xs text-gray-400 mb-2">Font Size</div>
                    <div className="flex justify-between gap-1">
                      <button onClick={() => setFontSize('text-sm')} className={`p-1.5 rounded flex-1 flex justify-center items-center ${fontSize === 'text-sm' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}><span className="text-sm">A</span></button>
                      <button onClick={() => setFontSize('text-base')} className={`p-1.5 rounded flex-1 flex justify-center items-center ${fontSize === 'text-base' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}><span className="text-base">A</span></button>
                      <button onClick={() => setFontSize('text-lg')} className={`p-1.5 rounded flex-1 flex justify-center items-center ${fontSize === 'text-lg' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}><span className="text-lg">A</span></button>
                      <button onClick={() => setFontSize('text-xl')} className={`p-1.5 rounded flex-1 flex justify-center items-center ${fontSize === 'text-xl' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}><span className="text-xl">A</span></button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Editor Area */}
        <textarea 
          value={editingNote.prompt}
          onChange={(e) => handleUpdateNote(editingNote.id, 'prompt', e.target.value)}
          placeholder="Note content..."
          className={`flex-1 w-full bg-transparent text-gray-200 ${fontSize} resize-none focus:outline-none font-['Roboto',_sans-serif] leading-relaxed p-5`}
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e1e1e] border-t border-white/5">
          <div className="flex gap-4">
            <button 
              onClick={() => handleUpdateNote(editingNote.id, 'isPinned', !editingNote.isPinned)}
              className={`p-3 rounded-full transition-colors ${editingNote.isPinned ? 'bg-purple-500/20 text-purple-400' : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-300'}`}
            >
              <Pin size={20} className={editingNote.isPinned ? "fill-current" : ""} />
            </button>
            <button 
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`p-3 rounded-full transition-colors ${undoStack.length === 0 ? 'bg-[#2a2a2a]/50 text-gray-600 cursor-not-allowed' : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-300'}`}
            >
              <Undo size={20} />
            </button>
            <button 
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-3 rounded-full transition-colors ${redoStack.length === 0 ? 'bg-[#2a2a2a]/50 text-gray-600 cursor-not-allowed' : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-300'}`}
            >
              <Redo size={20} />
            </button>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(editingNote.prompt)}
            className="p-3 rounded-full bg-[#2a2a2a] hover:bg-[#333] transition-colors text-gray-300"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full min-h-screen bg-[#05030A]">
      <header className="flex items-center justify-between mb-8 mt-2">
        <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-wide">Prompt Notes</h1>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)] overflow-hidden">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-full" />
        </div>
      </header>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
          <input 
            type="text" 
            placeholder="Search note..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gradient-to-r from-[#0F1E4A]/80 via-[#0C122C]/90 to-[#040714] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-400 border border-blue-500/25 focus:border-blue-500/55 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
          />
        </div>
        <button className="p-4 bg-gradient-to-b from-[#0F1E4A]/80 to-[#040714] border border-blue-500/25 rounded-2xl text-blue-400 hover:text-white hover:border-blue-500/55 transition-colors">
          <LayoutGrid size={20} />
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 bg-gradient-to-br from-[#0F1E4A]/20 to-[#030614] rounded-3xl border border-blue-500/25 py-20 px-6 shadow-inner">
          <FileText size={48} className="mx-auto mb-4 opacity-20 text-blue-400" />
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {filteredHistory.map((item: any, index: number) => {
            const dotColor = DOT_COLORS[index % DOT_COLORS.length];
            return (
              <div 
                key={item.id} 
                onClick={() => setEditingNote(item)}
                className="aspect-square relative overflow-hidden bg-gradient-to-br from-[#1E1B4B]/30 via-[#0A0817]/95 to-[#020108] rounded-2xl sm:rounded-[24px] p-3.5 sm:p-5 cursor-pointer hover:border-indigo-500/50 hover:from-[#251E5C]/50 hover:to-[#050312] transition-all transform hover:-translate-y-1 flex flex-col justify-between border border-indigo-500/25 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(99,102,241,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.15)] group"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500 to-transparent opacity-65" />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h3 className="text-white font-bold text-xs sm:text-[15px] mb-1 sm:mb-2.5 leading-snug tracking-tight group-hover:text-indigo-200 transition-colors line-clamp-2">{item.topic}</h3>
                  <p className="text-gray-300 text-[10px] sm:text-xs whitespace-pre-wrap line-clamp-4 sm:line-clamp-5 leading-relaxed flex-1 overflow-hidden">{item.prompt}</p>
                </div>
                <div className="flex justify-end mt-1 sm:mt-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${dotColor} shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-125 transition-transform`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const CATEGORIES = [
  "E-commerce", "Social Media", "Productivity", "Health & Fitness", 
  "Education", "Finance", "Entertainment", "Real Estate", "Travel", 
  "Food & Delivery", "Dating", "Gaming", "News", "Weather", 
  "Utilities", "Photography", "Video", "Music", "Sports", 
  "Medical", "Business", "Lifestyle", "Navigation", "Reference", 
  "Shopping", "Books", "Art & Design", "Auto & Vehicles", "Beauty", 
  "Events", "Parenting", "Pets", "Portfolio", "Blog"
];

const AI_PLATFORMS = ['AI Studio', 'Lovable AI', 'Claude AI', 'ChatGPT', 'Gemini', 'Bolt AI'];
const PROJECT_TYPES = ['App', 'Website', 'Web App'];
const PREDEFINED_FRAMEWORKS = ['HTML/CSS/JS', 'Flutter', 'Java', 'Kotlin', 'Next.js', 'React', 'Vue', 'React Native', 'Swift'];

const PREDEFINED_PALETTES = [
  { name: 'Neon Cyber', primary: '#8B5CF6', secondary: '#3B82F6', bg: '#05030A' },
  { name: 'Midnight Emerald', primary: '#10B981', secondary: '#06B6D4', bg: '#022C22' },
  { name: 'Sunset Glow', primary: '#F97316', secondary: '#E11D48', bg: '#2C101A' },
  { name: 'Ocean Depths', primary: '#0EA5E9', secondary: '#6366F1', bg: '#0F172A' },
  { name: 'Monochrome Dark', primary: '#F8FAFC', secondary: '#94A3B8', bg: '#09090B' },
  { name: 'Cherry Blossom', primary: '#F43F5E', secondary: '#F472B6', bg: '#2A0A18' },
];

const GradientTextarea = ({ value, onChange, placeholder, className = "min-h-[150px]" }: any) => (
  <div className="rounded-2xl p-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-lg shadow-purple-500/20">
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-[#120F1C] rounded-[14px] p-4 text-white placeholder-gray-500 focus:outline-none resize-none ${className}`}
    />
  </div>
);

const BuilderPage = ({ setCurrentTab, history, setHistory, editData, setEditData, setEditingNote, credits, setCredits, t, setAdConfig }: any) => {
  const [step, setStep] = useState(() => parseInt(localStorage.getItem('builder_step') || '1', 10));
  const totalSteps = 8;
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('Reading....');
  const [generatedPrompt, setGeneratedPrompt] = useState(() => localStorage.getItem('builder_generatedPrompt') || '');
  const [generatedNoteId, setGeneratedNoteId] = useState<number | null>(() => {
    const saved = localStorage.getItem('builder_generatedNoteId');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    if (isGenerating) {
      let stepIdx = 0;
      const steps = ['Reading....', 'Working....', 'Writing....'];
      setLoadingText(steps[stepIdx]);
      const interval = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setLoadingText(steps[stepIdx]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const initialFormData = {
    appName: '',
    topic: '',
    aiPlatform: '',
    projectType: '',
    category: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    backgroundColor: '#05030A',
    features: '',
    frameworks: [] as string[],
    customFrameworks: '',
    extraInstructions: ''
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('builder_formData');
      return saved ? JSON.parse(saved) : initialFormData;
    } catch(e) {
      return initialFormData;
    }
  });

  useEffect(() => {
    localStorage.setItem('builder_step', step.toString());
  }, [step]);
  
  useEffect(() => {
    localStorage.setItem('builder_generatedPrompt', generatedPrompt);
  }, [generatedPrompt]);
  
  useEffect(() => {
    if (generatedNoteId) localStorage.setItem('builder_generatedNoteId', generatedNoteId.toString());
    else localStorage.removeItem('builder_generatedNoteId');
  }, [generatedNoteId]);

  useEffect(() => {
    localStorage.setItem('builder_formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (editData) {
      if (editData.isNew) {
        setFormData(initialFormData);
        setStep(1);
        setGeneratedPrompt('');
        setGeneratedNoteId(null);
      } else {
        setFormData({ ...initialFormData, ...(editData.formData || editData) });
        setStep(1);
      }
      setTimeout(() => setEditData(null), 0);
    }
  }, [editData, setEditData]);

  const stepTitles = [
    "App Name & Topic",
    "AI Platform & Type",
    "Category",
    "Design & Colors",
    "Features",
    "Frameworks",
    "Extra Instructions",
    "Generated Prompt"
  ];

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.appName.trim().length > 0 && formData.topic.trim().length > 0;
      case 2: return formData.aiPlatform !== '' && formData.projectType !== '';
      case 3: return formData.category !== '';
      case 4: return true; // Colors have defaults
      case 5: return formData.features.trim().length > 0;
      case 6: return formData.frameworks?.length > 0 || formData.customFrameworks?.trim().length > 0;
      case 7: return true; // Extra instructions can be optional
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step === totalSteps - 1) {
      if (credits <= 0) {
        alert("You don't have enough credits to generate a prompt. Please watch an ad to earn more credits.");
        setCurrentTab('home');
        return;
      }
      setIsGenerating(true);
      setStep(step + 1);
      try {
        const userApiKey = localStorage.getItem('user_gemini_api_key');
        const apiKeyToUse = userApiKey || process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
        const systemInstruction = `You are an expert AI prompt engineer and senior software architect. 
The user will provide basic details for an application they want to build. 
Your job is to expand these minimum details into a highly detailed, comprehensive, and structured prompt that can be fed directly into an AI coding assistant (like Lovable, Cursor, Bolt, or ChatGPT).

Your generated prompt MUST follow this exact structure and formatting style, expanding heavily on the user's input:

Build a full-stack modern web app called "[App Name]" – a [Brief App Description] with necessary panels (e.g., User Panel, Admin Panel).

Tech Requirements:
- Frontend: [Frameworks/Libraries]
- Backend: [Backend tech]
- Database: [Database tech]
- Storage: [Storage tech]
- Authentication: [Auth method]

----------------------------------
🎨 UI/UX DESIGN (VERY IMPORTANT)
----------------------------------
- [Theme details]
- Primary accent: [Primary Color]
- Secondary accent: [Secondary Color]
- Background: [Background Color]
- [Styling details (e.g., Glassmorphism, animations)]
- Rounded corners
- Fancy modern font
- Layout style
- Mobile-first responsive design

----------------------------------
📱 USER PANEL (HOME PAGE)
----------------------------------
Design similar to [Reference App if applicable]:
[Detailed breakdown of headers, tabs, sections, card designs, and functionality]

----------------------------------
📄 [OTHER PAGES IN DETAIL]
----------------------------------
[Detailed breakdown of every other page/screen, including layout, components, and user actions]

----------------------------------
🧑💻 FOOTER
----------------------------------
[Footer details]

----------------------------------
🔐 [AUTH / ADMIN LOGIN IF APPLICABLE]
----------------------------------
[Login system details, default credentials if any]

----------------------------------
⚙️ [ADMIN DASHBOARD OR SETTINGS UI]
----------------------------------
[Detailed breakdown of admin/settings features]

----------------------------------
🔥 EXTRA FEATURES (IMPORTANT)
----------------------------------
- [Real-time updates, loading skeletons, toast notifications, smooth transitions, lazy loading, etc.]

----------------------------------
📦 DATA STRUCTURE (Database Schema)
----------------------------------
Collection: [Collection Name]
Fields:
- [Field 1]
- [Field 2]
...

----------------------------------
🚀 DEPLOYMENT & HOSTING INSTRUCTIONS
----------------------------------
- Specific instructions to make the app easily deployable and professional for hosting (e.g. environment variables setup, build scripts, Vercel/Firebase configuration).

----------------------------------
🎯 FINAL OUTPUT EXPECTATION
----------------------------------
- Fully working UI (no placeholders)
- Clean reusable components
- Functional backend system
- Beautiful experience

----------------------------------
IMPORTANT:
Make the UI visually premium, animated, and smooth.
Focus on performance and responsiveness.
Incorporate any extra instructions provided by the user.

Return ONLY the generated prompt text in Markdown format. Do not include any conversational filler before or after the prompt.`;

        const userContent = `
        Please generate a comprehensive prompt for the following app:
        
        App Name: ${formData.appName || 'Not specified'}
        Topic/Description: ${formData.topic || 'Not specified'}
        AI Platform Target: ${formData.aiPlatform || 'Not specified'}
        Project Type: ${formData.projectType || 'Not specified'}
        Category: ${formData.category || 'Not specified'}
        Design Colors: Primary ${formData.primaryColor}, Secondary ${formData.secondaryColor}, Background ${formData.backgroundColor}
        Requested Features: ${formData.features || 'Not specified'}
        Required Frameworks: ${formData.frameworks?.join(', ')} ${formData.customFrameworks ? ', ' + formData.customFrameworks : ''}
        Extra Instructions: ${formData.extraInstructions || 'None'}
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: userContent,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        const finalPrompt = response.text || "Failed to generate prompt.";
        setGeneratedPrompt(finalPrompt);

        const newHistoryItem = {
          id: Date.now(),
          date: new Date().toISOString(),
          topic: formData.appName || formData.topic || 'Untitled App',
          prompt: finalPrompt,
          formData: formData
        };
        setHistory([newHistoryItem, ...history]);
        setGeneratedNoteId(newHistoryItem.id);
        setCredits((prev: number) => prev - 1);
      } catch (error: any) {
        console.error("Error generating prompt:", error);
        setGeneratedPrompt(`An error occurred while generating the prompt: ${error.message || String(error)}. Please try again.`);
      } finally {
        setIsGenerating(false);
      }
    } else if (step === totalSteps) {
      setAdConfig({
        startPage: 2,
        nextTab: 'home',
        onComplete: () => {
          setStep(1);
          setFormData(initialFormData);
          setGeneratedPrompt('');
          setGeneratedNoteId(null);
        }
      });
      setCurrentTab('ad_view');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full min-h-screen flex flex-col">
      <header className="flex items-center mb-8 mt-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-[0_0_10px_rgba(139,92,246,0.3)] overflow-hidden">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Builder</h1>
          <p className="text-gray-500 text-xs mt-0.5">Step {step} of {totalSteps}</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative h-8 w-full bg-gradient-to-b from-[#1A1625] to-[#0A0710] rounded-full p-1 border border-white/10 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden mb-10">
        <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)] pointer-events-none" />
        
        {/* The fill */}
        <div 
          className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-400 relative transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.8)]"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        >
          {/* Glossy highlight on the fill */}
          <div className="absolute top-0 left-1 right-1 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full" />
          {/* Glowing tip */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/80 rounded-r-full blur-[2px]" />
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center tracking-tight">
          {step === 8 && <Sparkles className="mr-3 text-purple-400" size={24} />}
          {stepTitles[step - 1]}
        </h2>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">Enter your app name and describe the main topic.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">App Name</label>
                <div className="rounded-2xl p-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-lg shadow-purple-500/20">
                  <input
                    type="text"
                    value={formData.appName}
                    onChange={(e: any) => setFormData({...formData, appName: e.target.value})}
                    placeholder="e.g. FitTrack"
                    className="w-full bg-[#120F1C] rounded-[14px] p-4 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                <GradientTextarea 
                  value={formData.topic} 
                  onChange={(e: any) => setFormData({...formData, topic: e.target.value})} 
                  placeholder="A fitness tracking app that helps users monitor their daily workouts and diet..." 
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <h3 className="text-white font-medium mb-3">Select AI Platform</h3>
              <div className="flex flex-wrap gap-3">
                {AI_PLATFORMS.map(ai => (
                  <button 
                    key={ai}
                    onClick={() => setFormData({...formData, aiPlatform: ai})}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.aiPlatform === ai ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' : 'bg-[#120F1C] text-gray-400 border border-white/10 hover:border-purple-500/50'}`}
                  >
                    {ai}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">Project Type</h3>
              <div className="flex flex-wrap gap-3">
                {PROJECT_TYPES.map(pt => (
                  <button 
                    key={pt}
                    onClick={() => setFormData({...formData, projectType: pt})}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.projectType === pt ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' : 'bg-[#120F1C] text-gray-400 border border-white/10 hover:border-purple-500/50'}`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <p className="text-gray-400 text-sm mb-2">Select the category that best fits your project.</p>
            <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto hide-scrollbar pb-4">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${formData.category === cat ? 'bg-purple-500 text-white shadow-md shadow-purple-500/40' : 'bg-[#120F1C] text-gray-400 border border-white/5 hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">Choose a pre-defined palette or customize your own.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PREDEFINED_PALETTES.map(palette => {
                const isSelected = formData.primaryColor === palette.primary && 
                                   formData.secondaryColor === palette.secondary && 
                                   formData.backgroundColor === palette.bg;
                return (
                  <button
                    key={palette.name}
                    onClick={() => setFormData({...formData, primaryColor: palette.primary, secondaryColor: palette.secondary, backgroundColor: palette.bg})}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-[#120F1C] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: palette.primary }} />
                      <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: palette.secondary }} />
                      <div className="w-6 h-6 rounded-full shadow-inner border border-white/10" style={{ backgroundColor: palette.bg }} />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{palette.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-[1px] w-full bg-white/5 my-6" />

            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Custom Colors</p>
            <div className="space-y-3">
              {[
                { label: 'Primary Color', key: 'primaryColor' },
                { label: 'Secondary Color', key: 'secondaryColor' },
                { label: 'Background Color', key: 'backgroundColor' }
              ].map(colorField => (
                <div key={colorField.key} className="flex items-center justify-between bg-[#120F1C] p-4 rounded-2xl border border-white/5">
                  <span className="text-white font-medium">{colorField.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs uppercase font-mono">{(formData as any)[colorField.key]}</span>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shadow-inner">
                      <input 
                        type="color" 
                        value={(formData as any)[colorField.key]}
                        onChange={(e) => setFormData({...formData, [colorField.key]: e.target.value})}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">List the core features your app should have.</p>
            <GradientTextarea 
              value={formData.features} 
              onChange={(e: any) => setFormData({...formData, features: e.target.value})} 
              placeholder="- User authentication (Login/Signup)&#10;- Dashboard with analytics&#10;- Real-time chat..." 
              className="min-h-[200px]"
            />
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">Select the frameworks you need or add custom ones.</p>
            <div className="space-y-3 mb-6">
              {PREDEFINED_FRAMEWORKS.map(framework => {
                const isSelected = formData.frameworks?.includes(framework);
                return (
                  <div 
                    key={framework} 
                    onClick={() => {
                      if (isSelected) {
                        setFormData({...formData, frameworks: formData.frameworks.filter((f: string) => f !== framework)});
                      } else {
                        setFormData({...formData, frameworks: [...(formData.frameworks || []), framework]});
                      }
                    }}
                    className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-purple-500/10 border-purple-500/50' : 'bg-[#120F1C] border-white/5 hover:border-white/10'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-white/5 border border-white/10'}`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className={isSelected ? 'text-white font-medium' : 'text-gray-400'}>{framework}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="text-white font-medium mb-3 text-sm">Manual Framework Entry</h3>
              <GradientTextarea 
                value={formData.customFrameworks || formData.customPages || ''} 
                onChange={(e: any) => setFormData({...formData, customFrameworks: e.target.value})} 
                placeholder="e.g. Svelte, Angular, Express.js..." 
                className="min-h-[80px]"
              />
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <p className="text-gray-400 text-sm mb-4">Add any extra instructions for the AI.</p>
            <GradientTextarea 
              value={formData.extraInstructions} 
              onChange={(e: any) => setFormData({...formData, extraInstructions: e.target.value})} 
              placeholder="e.g. Make sure the UI is fully responsive. Use Framer Motion for animations. Ensure the code is split into reusable components..." 
              className="min-h-[250px]"
            />
          </motion.div>
        )}

        {step === 8 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl -z-10 rounded-[3rem]" />

            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-300 font-medium text-sm">
                {isGenerating ? 'AI is expanding your prompt...' : '✨ Your highly optimized prompt is ready.'}
              </p>
            </div>

            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <div className="bg-[#0A0710] rounded-[14px] overflow-hidden flex flex-col">
                {/* Window Header */}
                <div className="bg-[#120F1C] px-4 py-3 flex items-center justify-between border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-gray-500">prompt.txt</span>
                  <div className="w-12" /> {/* Spacer for balance */}
                </div>

                {/* Content */}
                <div className="p-5 max-h-[400px] overflow-y-auto hide-scrollbar min-h-[250px] flex flex-col relative">
                  {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-blue-400 py-12">
                      <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto animate-pulse text-purple-400" size={24} />
                      </div>
                      <p className="text-sm font-bold animate-pulse tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        {loadingText}
                      </p>
                    </div>
                  ) : (
                      <pre className="text-base text-white whitespace-pre-wrap font-['Roboto',_sans-serif] font-bold leading-relaxed selection:bg-purple-500/30">
                        {generatedPrompt}
                      </pre>
                  )}
                </div>
              </div>
            </div>

            {!isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center transition-all active:scale-[0.98] ${
                    copied 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-900/20' 
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-purple-900/20 hover:shadow-purple-500/40'
                  }`}
                >
                  {copied ? (
                    <><Check size={20} className="mr-2" /> Copied!</>
                  ) : (
                    <><Copy size={20} className="mr-2" /> Copy Prompt</>
                  )}
                </button>
                <button
                  onClick={() => {
                    setAdConfig({
                      startPage: 2,
                      nextTab: 'notes',
                      onComplete: () => {
                        if (generatedNoteId) {
                          const noteToEdit = history.find(h => h.id === generatedNoteId) || {
                            id: generatedNoteId,
                            topic: formData.appName || formData.topic || 'Untitled App',
                            prompt: generatedPrompt
                          };
                          setEditingNote(noteToEdit);
                        }
                      }
                    });
                    setCurrentTab('ad_view');
                  }}
                  className="px-6 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center transition-all active:scale-[0.98] bg-[#161423] hover:bg-[#1C1A2D] border border-white/10"
                >
                  <FileText size={20} className="mr-2" /> Edit
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        {step < totalSteps && (
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isGenerating}
            className="flex-1 py-4 rounded-2xl font-medium text-gray-500 disabled:opacity-30 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" /> Back
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={isGenerating || !isStepValid()}
          className={`${step === totalSteps ? 'w-full' : 'flex-[2]'} py-4 rounded-2xl font-medium text-white bg-gradient-to-r from-[#5B21B6] to-[#3B82F6] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-50 transition-transform active:scale-[0.98]`}
        >
          {step === totalSteps - 1 ? (
            <>Generate with AI <Sparkles size={18} className="ml-2" /></>
          ) : step === totalSteps ? (
            <>Go to Home <Home size={18} className="ml-2" /></>
          ) : (
            <>Next <ArrowRight size={18} className="ml-2" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const HistoryPage = ({ history, onEdit, onDelete, t }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full">
    <header className="flex items-center mb-6 mt-4">
      <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.25)] mr-4 text-yellow-400">
        <History size={22} className="animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">{t.history}</h1>
    </header>

    {/* Adsterra Ads Banner */}
    <AdsterraBanner />
    
    {!history || history.length === 0 ? (
      <div className="text-center py-20 text-gray-500 bg-gradient-to-br from-[#0F1E4A]/20 to-[#030614] rounded-3xl border border-blue-500/25 shadow-inner">
        <History size={48} className="mx-auto mb-4 opacity-20 text-blue-400" />
        <p className="text-sm font-medium">No history yet.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {history.map((item: any) => (
          <div 
            key={item.id} 
            className="relative overflow-hidden bg-gradient-to-r from-[#0F1D45]/40 via-[#080C1D]/80 to-[#030614] rounded-2xl p-5 border border-blue-500/30 hover:border-purple-500/50 hover:from-[#11245A]/50 hover:to-[#050C21] transition-all transform hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_18px_rgba(139,92,246,0.1)] flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-white truncate pr-4 tracker-tight">{item.topic}</h3>
              <span className="text-[10px] text-gray-400 font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">{item.prompt}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(item.prompt);
                }}
                className="flex-1 py-2.5 bg-[#0F1C42] hover:bg-[#142A66] border border-blue-500/30 text-blue-100 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                <Copy size={14} className="mr-1.5" /> Copy
              </button>
              <button 
                onClick={() => onEdit(item)}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/25 hover:to-indigo-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                <Wand2 size={14} className="mr-1.5" /> Edit
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

const SettingsPage = ({ theme, setTheme, language, setLanguage, setCurrentTab, t, apiKey, setApiKey, onLogout }: any) => {
  const [name, setName] = useState(() => localStorage.getItem('userName') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  
  const [password, setPassword] = useState(() => localStorage.getItem('userPassword') || '');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState(password);
  const [showEditPasswordPlain, setShowEditPasswordPlain] = useState(false);

  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutChecked, setLogoutChecked] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');

  const handleSavePassword = async () => {
    const trimmedPass = tempPassword;
    if (!trimmedPass) return;
    try {
      const currentUserName = localStorage.getItem('userName');
      if (currentUserName) {
        await syncUserData(currentUserName, { password: trimmedPass });
      }
      localStorage.setItem('userPassword', trimmedPass);
      setPassword(trimmedPass);
      setIsEditingPassword(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  
  const cycleLanguage = () => {
    const langs = ['en', 'es', 'fr'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const handleSaveName = () => {
    setName(tempName);
    localStorage.setItem('userName', tempName);
    setIsEditingName(false);
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('user_gemini_api_key', tempApiKey);
    setIsEditingApiKey(false);
  };

  const langDisplay: any = { en: 'English', es: 'Español', fr: 'Français' };

  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full">
      <header className="flex items-center mb-8 mt-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)] mr-4 text-blue-400">
          <SettingsIcon size={22} className="animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t.settings}</h1>
      </header>

      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F1E4A]/80 via-[#0C122C]/90 to-[#040714] border border-blue-500/35 rounded-[28px] p-5 mb-8 flex items-center shadow-2xl hover:border-purple-500/50 transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
        <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#3B82F6] flex items-center justify-center text-xl font-black text-white mr-4 shadow-lg border border-white/20 select-none">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">{name}</h2>
            <button onClick={() => { setTempName(name); setIsEditingName(true); }} className="text-blue-400 hover:text-white transition-colors bg-blue-500/10 hover:bg-blue-500/20 p-1.5 rounded-full">
              <Edit2 size={13} />
            </button>
          </div>
          <p className="text-blue-400 font-bold text-xs mt-0.5 tracking-wide">Pro Member</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-blue-400/85 uppercase tracking-widest mb-3 px-4">Preferences</h3>
        <div className="bg-gradient-to-b from-[#0F1D45]/45 to-[#040714]/95 border border-blue-500/35 rounded-3xl overflow-hidden shadow-xl">
          <SettingItem icon={theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />} label="Appearance" value={theme === 'dark' ? 'Dark' : 'Light'} onClick={toggleTheme} />
          <div className="h-[1px] bg-blue-500/15 mx-5" />
          <SettingItem icon={<Languages size={18} className="text-indigo-400" />} label="Language" value={langDisplay[language]} onClick={cycleLanguage} />
          <div className="h-[1px] bg-blue-500/15 mx-5" />
          <SettingItem 
            icon={<Sparkles size={18} className="text-purple-400" />} 
            label="Gemini API Key" 
            value={apiKey ? '••••••••' : 'Setup required'} 
            onClick={() => { setTempApiKey(apiKey); setIsEditingApiKey(true); }} 
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-blue-400/85 uppercase tracking-widest mb-3 px-4">Account & Security</h3>
        <div className="bg-gradient-to-b from-[#0F1D45]/45 to-[#040714]/95 border border-blue-500/35 rounded-3xl overflow-hidden shadow-xl">
          <SettingItem icon={<Shield size={18} className="text-cyan-400" />} label="Privacy & Security" />
          <div className="h-[1px] bg-blue-500/15 mx-5" />
          <SettingItem 
            icon={<Lock size={18} className="text-red-400" />} 
            label="Account Password" 
            value={password || 'Not Set'} 
            onClick={() => { setTempPassword(password); setIsEditingPassword(true); }} 
          />
          <div className="h-[1px] bg-blue-500/15 mx-5" />
          <SettingItem icon={<Info size={18} className="text-emerald-400" />} label={t.about} onClick={() => setCurrentTab('about')} />
        </div>
      </div>

      <AdsterraBanner />

      <button 
        onClick={() => { setLogoutChecked(false); setShowLogoutConfirm(true); }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/15 text-red-400 hover:text-red-300 font-extrabold border border-red-500/25 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] mb-6 cursor-pointer"
      >
        <LogOut size={18} className="mr-2" /> Log Out
      </button>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                  <LogOut size={26} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Log Out of Account?</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  You will be logged out of your account. You must enter your correct password next time to access your prompts and preferences.
                </p>
              </div>

              {/* Tick box required for logout */}
              <label className="flex items-start gap-4 bg-[#05030A] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all w-full mb-6 text-left select-none">
                <input 
                  type="checkbox" 
                  checked={logoutChecked} 
                  onChange={(e) => setLogoutChecked(e.target.checked)} 
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-purple-500/50 accent-purple-600 cursor-pointer animate-none"
                />
                <span className="text-[11px] text-gray-300 font-semibold leading-normal">
                  I understand, and want to log out of my profile.
                </span>
              </label>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowLogoutConfirm(false); setLogoutChecked(false); }}
                  className="flex-1 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-white/5 text-white font-semibold transition-colors border border-white/5 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={onLogout}
                  disabled={!logoutChecked}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:pointer-events-none text-sm flex items-center justify-center"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isEditingName && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Edit Name</h3>
                <button onClick={() => setIsEditingName(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <textarea 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-24 mb-4"
                placeholder="Enter your name"
              />
              <button 
                onClick={handleSaveName}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-[#5B21B6] to-[#3B82F6] shadow-lg shadow-blue-900/20"
              >
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {isEditingPassword && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Edit Password</h3>
                <button onClick={() => setIsEditingPassword(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Your updated password will be stored securely in your database doc.</p>
              
              <div className="relative mb-5">
                <input 
                  type={showEditPasswordPlain ? 'text' : 'password'}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-12 font-medium"
                  placeholder="Enter new password"
                />
                <button 
                  type="button"
                  onClick={() => setShowEditPasswordPlain(!showEditPasswordPlain)}
                  className="absolute right-3 top-3.5 text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  {showEditPasswordPlain ? 'Hide' : 'Show'}
                </button>
              </div>

              <button 
                onClick={handleSavePassword}
                disabled={!tempPassword}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-[#5B21B6] to-[#3B82F6] shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                Save Password
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {isEditingApiKey && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Gemini API Key</h3>
                <button onClick={() => setIsEditingApiKey(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Need an API key? Get one from Google AI Studio.</p>
              <textarea 
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-24 mb-4"
                placeholder="AIzaSy..."
              />
              <button 
                onClick={handleSaveApiKey}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-[#5B21B6] to-[#3B82F6] shadow-lg shadow-blue-900/20"
              >
                Save Key
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AboutPage = ({ setCurrentTab, t }: any) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (adminPassword === 'jaivalpandya@123') {
      setShowAdminLogin(false);
      setAdminPassword('');
      setError('');
      setCurrentTab('admin');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full">
      <header className="flex items-center mb-8 mt-4">
        <button onClick={() => setCurrentTab('settings')} className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#0F1E4A] to-[#040714] border border-blue-500/30 flex items-center justify-center mr-4 text-white hover:bg-blue-500/10 hover:border-blue-500/60 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <ArrowLeft size={20} className="text-blue-400" />
        </button>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t.about}</h1>
      </header>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F255C]/35 via-[#0A0E22]/95 to-[#030614] border border-blue-500/35 rounded-[28px] p-8 mb-8 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-[#A78BFA] flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(59,130,246,0.55)] border border-blue-400/30 p-[2.5px] overflow-hidden">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-[20px]" />
        </div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-blue-400 to-cyan-300 mb-2 tracking-tight">Prompt Builder</h2>
        <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-6">Version 2.0.0</p>
        
        <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Prompt Builder is an advanced AI-powered tool designed to help developers and creators craft the perfect prompts for AI coding assistants.
        </p>

        <div className="flex justify-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          <a href="#" className="text-blue-400/80 hover:text-purple-300 transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="text-blue-400/80 hover:text-purple-300 transition-colors">Privacy Policy</a>
        </div>
      </div>

      <AdsterraBanner />

      <div className="text-center text-gray-600 text-xs mt-6 relative">
        <p>© 2026 Prompt Builder. All rights reserved.</p>
        <p className="mt-1">Developed by Jaival Pandya</p>
        <p className="mt-1">Powered by Jaival Pandya</p>
        <div 
          onClick={() => setShowAdminLogin(true)}
          className="absolute bottom-0 left-0 right-0 h-10 cursor-default"
          style={{ opacity: 0 }}
        />
      </div>

      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#120F1C] border border-red-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-red-500 flex items-center gap-2">
                  <Shield size={20} /> Admin Area
                </h3>
                <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AdminPage = ({ setCurrentTab }: any) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'home'|'userData'|'userActivity'|'appUpdate'>('home');
  const [updateForm, setUpdateForm] = useState({ title: '', features: '', link: '' });
  
  const [userData, setUserData] = useState<any>({});
  const [adViews, setAdViews] = useState(0);

  const getUserTime = (username: string) => {
    const user = userData[username];
    if (!user) return 0;
    if (user.createdAt) return user.createdAt;
    // fallback to most recent date in opens
    const dates = Object.keys(user.opens || {});
    if (dates.length > 0) {
      dates.sort();
      const latestDate = dates[dates.length - 1];
      return new Date(latestDate).getTime();
    }
    return 0;
  };

  const sortedUsernames = Object.keys(userData).sort((a, b) => {
    return getUserTime(b) - getUserTime(a);
  });

  useEffect(() => {
    const unsubUser = monitorUserStats((stats) => {
      setUserData(stats);
    });
    const unsubAd = monitorAdViews((views) => {
      setAdViews(views);
    });

    return () => {
      unsubUser();
      unsubAd();
    };
  }, []);

  const handleUpdatePublish = async () => {
    if (!updateForm.title || !updateForm.link) return alert('Title and Link are required');
    try {
      await updateAppUpdate({
        ...updateForm,
        active: true,
        timestamp: Date.now()
      });
      alert('Update published successfully! Users will see it on app launch.');
      setUpdateForm({ title: '', features: '', link: '' });
      setActiveAdminTab('home');
    } catch (error) {
      alert('Error publishing update: ' + String(error));
    }
  };

  const clearUpdate = async () => {
    try {
      await clearAppUpdate();
      alert('Active update cleared.');
    } catch (error) {
       alert('Error clearing update: ' + String(error));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen bg-[#05030A] text-white p-4 sm:p-6 md:p-8 pb-32 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full">
      <header className="flex items-center mb-8 mt-4">
        <button onClick={() => activeAdminTab === 'home' ? setCurrentTab('home') : setActiveAdminTab('home')} className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#0F1E4A] to-[#040714] border border-blue-500/30 flex items-center justify-center mr-4 text-white hover:bg-blue-500/10 hover:border-blue-500/60 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <ArrowLeft size={20} className="text-blue-400" />
        </button>
        <h1 className="text-3xl font-extrabold text-red-500 flex items-center gap-2 tracking-tight">
          <Shield size={28} /> Admin Panel
        </h1>
      </header>

      {activeAdminTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => setActiveAdminTab('userData')} 
            className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A]/80 via-[#0C122C]/90 to-[#040714] border border-blue-500/35 hover:border-blue-500/60 rounded-2xl p-6 cursor-pointer transition-all transform hover:-translate-y-1 shadow-2xl flex flex-col justify-between group"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
            <div>
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><SettingsIcon size={20} className="text-blue-400 group-hover:animate-spin-slow" /> User Data</h2>
              <p className="text-blue-300/80 text-xs font-semibold leading-relaxed">View user logins, stored credits and daily active sessions.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 group-hover:text-white transition-colors bg-blue-500/10 px-2.5 py-1 rounded-md">Manage &rarr;</span>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveAdminTab('userActivity')} 
            className="relative overflow-hidden bg-gradient-to-br from-[#0D2E16]/40 via-[#071F11]/90 to-[#020D08] border border-emerald-500/35 hover:border-emerald-500/60 rounded-2xl p-6 cursor-pointer transition-all transform hover:-translate-y-1 shadow-2xl flex flex-col justify-between group"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500 to-transparent opacity-60" />
            <div>
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><PlayCircle size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" /> User Activity</h2>
              <p className="text-emerald-300/80 text-xs font-semibold leading-relaxed">Monitor ad impressions, screen transitions and page views.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 group-hover:text-white transition-colors bg-emerald-500/10 px-2.5 py-1 rounded-md">Monitor &rarr;</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveAdminTab('appUpdate')} 
            className="relative overflow-hidden bg-gradient-to-br from-[#2B1B04]/40 via-[#1C1204]/90 to-[#0B0702] border border-amber-500/35 hover:border-amber-500/60 rounded-2xl p-6 cursor-pointer transition-all transform hover:-translate-y-1 shadow-2xl flex flex-col justify-between group"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500 to-transparent opacity-60" />
            <div>
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Check size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" /> App Update Popup</h2>
              <p className="text-amber-300/80 text-xs font-semibold leading-relaxed">Publish new application releases, feature logs and mandatory updates.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 group-hover:text-white transition-colors bg-amber-500/10 px-2.5 py-1 rounded-md">Publish &rarr;</span>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'userData' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Detailed User Data</h2>
            <div className="flex flex-col items-end text-[10px] text-gray-300 bg-gradient-to-br from-[#0F1E4A] to-[#040714] border border-blue-500/30 px-3 py-2 rounded-2xl font-bold gap-1 shadow-sm leading-none">
              <span>👥 Total Users: <strong className="text-blue-400 text-xs font-black">{Object.keys(userData).length}</strong></span>
              <span className="mt-1">🟢 Active Users: <strong className="text-green-500 text-xs font-black">{
                Object.values(userData).filter((u: any) => {
                  if (!u.opens) return false;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  return Object.keys(u.opens).includes(todayStr) || Object.keys(u.opens).includes(yesterdayStr);
                }).length
              }</strong></span>
            </div>
          </div>
          {sortedUsernames.length === 0 ? <p className="text-gray-500 text-sm">No user data recorded yet.</p> : null}
          {sortedUsernames.map(username => {
            const data = userData[username];
            return (
              <div key={username} className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A]/30 via-[#0C122C]/90 to-[#040714] border border-blue-500/25 rounded-2xl p-5 shadow-lg">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-40" />
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-white text-lg tracking-tight">{username}</h3>
                  <div className="flex gap-2">
                    {data.credits !== undefined && (
                      <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">🪙 {data.credits} Credits</span>
                    )}
                    {data.totalAdViews !== undefined && (
                      <span className="bg-green-500/15 text-green-400 border border-green-500/25 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1"><PlayCircle size={12}/> {data.totalAdViews} Ads</span>
                    )}
                  </div>
                </div>
                
                <h4 className="text-blue-400 text-[10px] uppercase tracking-wider mb-2 font-black">Activity History</h4>
                <div className="space-y-2 mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {Object.keys(data.opens || {}).length === 0 ? <p className="text-gray-500 text-xs italic">No app opens recorded.</p> : null}
                  {Object.entries(data.opens || {}).map(([date, count]) => (
                    <div key={date} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400 font-mono">{date}</span>
                      <span className="bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">{String(count)} opens</span>
                    </div>
                  ))}
                </div>

                {data.history && data.history.length > 0 && (
                  <>
                    <h4 className="text-purple-400 text-[10px] uppercase tracking-wider mb-2 font-black">Generated Prompts ({data.history.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                      {data.history.map((h: any) => (
                        <div key={h.id} className="bg-white/[0.02] p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                          <p className="text-xs font-bold text-white truncate">{h.topic}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 leading-relaxed">{h.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {activeAdminTab === 'userActivity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">User Activity Analytics</h2>
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0D2E16]/40 via-[#071F11]/90 to-[#020D08] border border-emerald-500/35 rounded-2xl p-6 flex items-center gap-6 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500 to-transparent opacity-60" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <PlayCircle size={32} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Ad Impressions</p>
              <p className="text-4xl font-bold text-white">{adViews}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">All Users Details</h3>
            {sortedUsernames.length === 0 ? (
              <p className="text-gray-500 text-sm">No user activity recorded yet.</p>
            ) : (
              sortedUsernames.map((username) => {
                const data = userData[username];
                
                const todayStr = new Date().toISOString().split('T')[0];
                const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const isRecentActive = Object.keys(data.opens || {}).some(
                  date => date === todayStr || date === yesterdayStr
                );

                return (
                  <div key={username} className="relative overflow-hidden bg-gradient-to-br from-[#0F1E4A]/30 via-[#0C122C]/90 to-[#040714] border border-blue-500/25 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-transparent opacity-40" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base tracking-tight">{username}</h4>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isRecentActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isRecentActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                            {isRecentActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                            <PlayCircle size={10} /> {data.totalAdViews || 0} Ads Watched
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        📅 Open History
                      </h5>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl max-h-32 overflow-y-auto space-y-1.5 hide-scrollbar">
                        {Object.keys(data.opens || {}).length === 0 ? (
                          <p className="text-gray-500 text-xs italic">No app open history</p>
                        ) : (
                          Object.entries(data.opens || {})
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .map(([date, count]) => (
                              <div key={date} className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-mono">{date}</span>
                                <span className="text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-[10px]">
                                  {count} opens
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        ⚡ Build History ({data.history?.length || 0})
                      </h5>
                      {data.history && data.history.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                          {data.history.map((h: any, idx: number) => (
                            <div key={h.id || idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-1.5">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                                  {h.topic || 'Untitled'}
                                </span>
                                {h.category && (
                                  <span className="text-[8px] bg-blue-500/15 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded font-mono uppercase font-black">
                                    {h.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                                {h.prompt}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs italic bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                          No built prompts history
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {activeAdminTab === 'appUpdate' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Publish System Update</h2>
            <button onClick={clearUpdate} className="text-[11px] font-bold bg-red-500/10 text-red-400 px-3.5 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all">Clear Active Update</button>
          </div>
          <div className="relative overflow-hidden space-y-4 bg-gradient-to-br from-[#1E1102]/60 via-[#120B02]/90 to-[#040200] border border-amber-500/25 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500 to-transparent opacity-40" />
            <div>
              <label className="block text-amber-500 text-[10px] uppercase font-black tracking-widest mb-1.5">Update Title</label>
              <input value={updateForm.title} onChange={e => setUpdateForm({...updateForm, title: e.target.value})} placeholder="e.g. Version 2.1 is here!" className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-semibold" />
            </div>
            <div>
              <label className="block text-amber-500 text-[10px] uppercase font-black tracking-widest mb-1.5">New Features / Changelog</label>
              <textarea value={updateForm.features} onChange={e => setUpdateForm({...updateForm, features: e.target.value})} placeholder="What's new in this version?" className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none h-24 font-medium leading-relaxed" />
            </div>
            <div>
              <label className="block text-amber-500 text-[10px] uppercase font-black tracking-widest mb-1.5">Download Link / Action URL</label>
              <input value={updateForm.link} onChange={e => setUpdateForm({...updateForm, link: e.target.value})} placeholder="https://..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-semibold" />
            </div>
            <button onClick={handleUpdatePublish} className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-amber-500/10 active:scale-[0.99] active:brightness-95">
              Publish Update Notification to Users
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const SettingItem = ({ icon, label, value, onClick }: any) => (
  <div onClick={onClick} className="flex items-center justify-between p-4 px-5 hover:bg-white/5 cursor-pointer transition-colors">
    <div className="flex items-center text-gray-300">
      <div className="w-6 flex justify-center mr-3 text-gray-500">{icon}</div>
      <span className="font-medium text-sm">{label}</span>
    </div>
    <div className="flex items-center text-gray-500 text-xs">
      {value && <span className="mr-2">{value}</span>}
      <ChevronRight size={16} />
    </div>
  </div>
);
