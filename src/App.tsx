import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, Wand2, History, Settings as SettingsIcon, 
  Search, LayoutGrid, ChevronRight, ArrowRight, ArrowLeft, Shield, HelpCircle, 
  Moon, Sun, Globe, Sparkles, LogOut, Check, Copy, Trash2, Info, Languages,
  MoreVertical, Share2, Pin, Undo, Redo, Edit2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const translations: any = {
  en: { home: 'Home', notes: 'Notes', builder: 'Builder', history: 'History', settings: 'Settings', about: 'About', createPrompt: 'Create Prompt', recent: 'Recent', viewAll: 'View All', startProject: 'Start a new project', noHistory: 'No history yet.' },
  es: { home: 'Inicio', notes: 'Notas', builder: 'Creador', history: 'Historial', settings: 'Ajustes', about: 'Acerca de', createPrompt: 'Crear Prompt', recent: 'Reciente', viewAll: 'Ver Todo', startProject: 'Iniciar nuevo proyecto', noHistory: 'Sin historial aún.' },
  fr: { home: 'Accueil', notes: 'Notes', builder: 'Créateur', history: 'Historique', settings: 'Paramètres', about: 'À propos', createPrompt: 'Créer Prompt', recent: 'Récent', viewAll: 'Voir Tout', startProject: 'Démarrer un projet', noHistory: 'Aucun historique.' }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('prompt_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [editData, setEditData] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history));
  }, [history]);

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

  const t = translations[language] || translations.en;

  return (
    <div className={`min-h-screen bg-[#05030A] text-white font-sans selection:bg-purple-500/30 font-inter ${theme === 'light' ? 'light-theme' : ''}`}>
      <AnimatePresence mode="wait">
        {currentTab === 'home' && <HomePage key="home" setCurrentTab={setCurrentTab} history={history} t={t} />}
        {currentTab === 'notes' && <NotesPage key="notes" history={history} setHistory={setHistory} editingNote={editingNote} setEditingNote={setEditingNote} t={t} />}
        {currentTab === 'builder' && <BuilderPage key="builder" setCurrentTab={setCurrentTab} history={history} setHistory={setHistory} editData={editData} setEditData={setEditData} setEditingNote={setEditingNote} t={t} />}
        {currentTab === 'history' && <HistoryPage key="history" history={history} onEdit={handleEdit} onDelete={handleDelete} t={t} />}
        {currentTab === 'settings' && <SettingsPage key="settings" theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} setCurrentTab={setCurrentTab} t={t} />}
        {currentTab === 'about' && <AboutPage key="about" setCurrentTab={setCurrentTab} t={t} />}
      </AnimatePresence>
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} t={t} />
    </div>
  );
}

const BottomNav = ({ currentTab, setCurrentTab, t }: { currentTab: string, setCurrentTab: (tab: string) => void, t: any }) => {
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#05030A]/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 pb-6 flex justify-between items-center z-50">
      <NavItem icon={<Home />} label={t.home} isActive={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
      <NavItem icon={<FileText />} label={t.notes} isActive={currentTab === 'notes'} onClick={() => setCurrentTab('notes')} />
      
      {/* FAB */}
      <div className="relative -top-5">
        <button 
          onClick={() => setCurrentTab('builder')}
          className={`rounded-full shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-transform hover:scale-105 active:scale-95 ${currentTab === 'builder' ? 'ring-4 ring-purple-500/50' : ''}`}
        >
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" 
            alt="Create Prompt" 
            className={`w-14 h-14 object-cover rounded-full ${currentTab === 'builder' ? 'animate-pulse' : ''}`} 
          />
        </button>
      </div>

      <NavItem icon={<History />} label={t.history} isActive={currentTab === 'history'} onClick={() => setCurrentTab('history')} />
      <NavItem icon={<SettingsIcon />} label={t.settings} isActive={currentTab === 'settings'} onClick={() => setCurrentTab('settings')} />
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 gap-1.5 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>
    {React.cloneElement(icon, { size: 22, className: isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : '' })}
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

const HomePage = ({ setCurrentTab, history, t }: { setCurrentTab: (tab: string) => void, history: any[], t: any, key?: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32">
    <header className="mb-8 mt-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#A78BFA] to-[#60A5FA] bg-clip-text text-transparent mb-2 tracking-tight">Prompt Builder</h1>
      <p className="text-gray-400 text-sm">Craft the perfect AI prompt.</p>
    </header>

    <div 
      onClick={() => setCurrentTab('builder')}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2A1B4E] to-[#161224] p-6 mb-6 border border-purple-500/20 cursor-pointer group shadow-xl shadow-purple-900/10"
    >
      <div className="absolute top-6 right-6 text-purple-400/40 group-hover:text-purple-400/60 transition-colors">
        <Sparkles size={32} strokeWidth={1.5} />
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(139,92,246,0.4)] overflow-hidden">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-full" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Create Prompt</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-[85%] leading-relaxed">Use our step-by-step wizard to generate a highly optimized prompt for any AI.</p>
      <div className="flex items-center text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
        Start Building <ArrowRight size={16} className="ml-1.5" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-8">
      <div onClick={() => setCurrentTab('notes')} className="bg-[#120F1C] rounded-[24px] p-5 border border-white/5 cursor-pointer hover:bg-[#1A1625] transition-colors">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
          <FileText size={20} />
        </div>
        <h3 className="text-white font-semibold mb-1">Prompt Notes</h3>
        <p className="text-gray-500 text-xs">Your saved prompts</p>
      </div>
      <div onClick={() => setCurrentTab('history')} className="bg-[#120F1C] rounded-[24px] p-5 border border-white/5 cursor-pointer hover:bg-[#1A1625] transition-colors">
        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 text-yellow-500">
          <History size={20} />
        </div>
        <h3 className="text-white font-semibold mb-1">History</h3>
        <p className="text-gray-500 text-xs">Your past creations</p>
      </div>
    </div>

    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Recent</h3>
        <button onClick={() => setCurrentTab('history')} className="text-purple-400 text-xs font-medium uppercase tracking-wider">View All</button>
      </div>
      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.slice(0, 2).map((item: any) => (
            <div key={item.id} onClick={() => setCurrentTab('history')} className="bg-[#120F1C] rounded-2xl p-4 border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
              <h4 className="text-white font-medium text-sm truncate">{item.topic}</h4>
              <p className="text-gray-500 text-xs mt-1 truncate">{item.prompt}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600 text-sm bg-[#120F1C] rounded-3xl border border-white/5">
          No recent prompts yet.
        </div>
      )}
    </div>
  </motion.div>
);

const NotesPage = ({ history, setHistory, editingNote, setEditingNote, t }: { history: any[], setHistory: any, editingNote: any, setEditingNote: any, t: any }) => {
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

  const filteredHistory = history.filter((item: any) => 
    item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const DOT_COLORS = ['bg-[#FF3B6A]', 'bg-[#3B82F6]', 'bg-[#A855F7]', 'bg-[#EAB308]', 'bg-[#22C55E]', 'bg-[#06B6D4]'];

  if (editingNote) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-0 z-[60] flex flex-col bg-[#121212]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-[#2E1065] border-b border-white/5">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setEditingNote(null)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-white" />
            </button>
            <input 
              type="text" 
              value={editingNote.topic}
              onChange={(e) => handleUpdateNote(editingNote.id, 'topic', e.target.value)}
              placeholder="Note Title"
              className="bg-transparent text-white font-medium text-lg focus:outline-none placeholder-gray-500 w-full"
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
          className={`flex-1 w-full bg-transparent text-gray-200 ${fontSize} resize-none focus:outline-none font-['Inter',_sans-serif] leading-relaxed p-5`}
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
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32 min-h-screen bg-[#05030A]">
      <header className="flex items-center justify-between mb-8 mt-2">
        <h1 className="text-[28px] font-bold text-white tracking-wide">Prompt Notes</h1>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)] overflow-hidden">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-full" />
        </div>
      </header>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search note..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161423] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <button className="p-4 bg-[#161423] rounded-2xl text-gray-400 hover:text-white transition-colors">
          <LayoutGrid size={20} />
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="columns-2 gap-4 space-y-4">
          {filteredHistory.map((item: any, index: number) => {
            const dotColor = DOT_COLORS[index % DOT_COLORS.length];
            return (
              <div 
                key={item.id} 
                onClick={() => setEditingNote(item)}
                className="break-inside-avoid bg-[#161423] rounded-[24px] p-5 cursor-pointer hover:bg-[#1C1A2D] transition-colors relative flex flex-col min-h-[160px]"
              >
                <h3 className="text-white font-bold text-[15px] mb-3 leading-snug">{item.topic}</h3>
                <p className="text-gray-400 text-xs whitespace-pre-wrap line-clamp-5 leading-relaxed flex-1">{item.prompt}</p>
                <div className="flex justify-end mt-4">
                  <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
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
const PREDEFINED_PAGES = ['Home page', 'Main page', 'Splash screen page', 'About page', 'Contact page', 'History page', 'Enter page'];

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

const BuilderPage = ({ setCurrentTab, history, setHistory, editData, setEditData, setEditingNote, t }: any) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedNoteId, setGeneratedNoteId] = useState<number | null>(null);

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
    pages: [] as string[],
    customPages: '',
    extraInstructions: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editData) {
      setFormData({ ...initialFormData, ...editData });
      setStep(1);
      setEditData(null);
    }
  }, [editData, setEditData]);

  const stepTitles = [
    "App Name & Topic",
    "AI Platform & Type",
    "Category",
    "Design & Colors",
    "Features",
    "Pages",
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
      case 6: return formData.pages.length > 0 || formData.customPages.trim().length > 0;
      case 7: return true; // Extra instructions can be optional
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step === totalSteps - 1) {
      setIsGenerating(true);
      setStep(step + 1);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = "You are an expert AI prompt engineer. The user will provide basic details for an app they want to build. Your job is to expand these minimum details into a highly detailed, comprehensive, and maximum-length prompt that can be fed into an AI coding assistant (like Lovable, Cursor, or Bolt). Automatically add relevant core features, best practices for UI/UX, architecture suggestions, and detailed page structures based on the user's brief input. Return ONLY the generated prompt text, nothing else.";

        const userContent = `
        App Name: ${formData.appName || 'Not specified'}
        Topic/Description: ${formData.topic || 'Not specified'}
        AI Platform: ${formData.aiPlatform || 'Not specified'}
        Project Type: ${formData.projectType || 'Not specified'}
        Category: ${formData.category || 'Not specified'}
        Colors: Primary ${formData.primaryColor}, Secondary ${formData.secondaryColor}, Background ${formData.backgroundColor}
        Features: ${formData.features || 'Not specified'}
        Pages: ${formData.pages.join(', ')} ${formData.customPages}
        Extra Instructions: ${formData.extraInstructions || 'None'}
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
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
      } catch (error) {
        console.error("Error generating prompt:", error);
        setGeneratedPrompt("An error occurred while generating the prompt. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    } else if (step === totalSteps) {
      setCurrentTab('home');
      setStep(1);
      setFormData(initialFormData);
      setGeneratedPrompt('');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32 min-h-screen flex flex-col">
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
            <p className="text-gray-400 text-sm mb-4">Select the pages you need or add custom ones.</p>
            <div className="space-y-3 mb-6">
              {PREDEFINED_PAGES.map(page => {
                const isSelected = formData.pages.includes(page);
                return (
                  <div 
                    key={page} 
                    onClick={() => {
                      if (isSelected) {
                        setFormData({...formData, pages: formData.pages.filter(p => p !== page)});
                      } else {
                        setFormData({...formData, pages: [...formData.pages, page]});
                      }
                    }}
                    className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-purple-500/10 border-purple-500/50' : 'bg-[#120F1C] border-white/5 hover:border-white/10'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-white/5 border border-white/10'}`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className={isSelected ? 'text-white font-medium' : 'text-gray-400'}>{page}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="text-white font-medium mb-3 text-sm">Manual Page Entry</h3>
              <GradientTextarea 
                value={formData.customPages} 
                onChange={(e: any) => setFormData({...formData, customPages: e.target.value})} 
                placeholder="e.g. Settings page, User Profile page, Checkout page..." 
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
                        Generating Prompt...
                      </p>
                    </div>
                  ) : (
                    <pre className="text-sm text-white whitespace-pre-wrap font-['JetBrains_Mono',_monospace] leading-relaxed selection:bg-purple-500/30">
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
                    if (generatedNoteId) {
                      const noteToEdit = history.find(h => h.id === generatedNoteId) || {
                        id: generatedNoteId,
                        topic: formData.appName || formData.topic || 'Untitled App',
                        prompt: generatedPrompt
                      };
                      setEditingNote(noteToEdit);
                      setCurrentTab('notes');
                    }
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
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32">
    <header className="flex items-center mb-8 mt-4">
      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4 text-yellow-500">
        <History size={20} />
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">{t.history}</h1>
    </header>
    
    {!history || history.length === 0 ? (
      <div className="text-center py-16 text-gray-600 bg-[#120F1C] rounded-3xl border border-white/5">
        <History size={40} className="mx-auto mb-4 opacity-20" />
        <p className="text-sm">No history yet.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {history.map((item: any) => (
          <div key={item.id} className="bg-[#120F1C] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-white truncate pr-4">{item.topic}</h3>
              <span className="text-[10px] text-gray-500 whitespace-nowrap">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{item.prompt}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(item.prompt);
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center"
              >
                <Copy size={14} className="mr-1.5" /> Copy
              </button>
              <button 
                onClick={() => onEdit(item)}
                className="flex-1 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium rounded-xl transition-colors flex items-center justify-center"
              >
                <Wand2 size={14} className="mr-1.5" /> Edit
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-xl transition-colors flex items-center justify-center"
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

const SettingsPage = ({ theme, setTheme, language, setLanguage, setCurrentTab, t }: any) => {
  const [name, setName] = useState(() => localStorage.getItem('userName') || 'Jaival Pandya');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

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

  const langDisplay: any = { en: 'English', es: 'Español', fr: 'Français' };

  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32">
      <header className="flex items-center mb-8 mt-4">
        <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center mr-4 text-gray-400">
          <SettingsIcon size={20} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t.settings}</h1>
      </header>

      <div className="bg-[#120F1C] border border-white/5 rounded-[28px] p-5 mb-8 flex items-center shadow-lg shadow-black/20">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#3B82F6] flex items-center justify-center text-lg font-bold text-white mr-4 shadow-inner">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{name}</h2>
            <button onClick={() => { setTempName(name); setIsEditingName(true); }} className="text-gray-400 hover:text-white transition-colors">
              <Edit2 size={14} />
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">Pro Member</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-4">Preferences</h3>
        <div className="bg-[#120F1C] border border-white/5 rounded-3xl overflow-hidden">
          <SettingItem icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} label="Appearance" value={theme === 'dark' ? 'Dark' : 'Light'} onClick={toggleTheme} />
          <div className="h-[1px] bg-white/5 mx-5" />
          <SettingItem icon={<Languages size={18} />} label="Language" value={langDisplay[language]} onClick={cycleLanguage} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-4">Account & Security</h3>
        <div className="bg-[#120F1C] border border-white/5 rounded-3xl overflow-hidden">
          <SettingItem icon={<Shield size={18} />} label="Privacy & Security" />
          <div className="h-[1px] bg-white/5 mx-5" />
          <SettingItem icon={<Info size={18} />} label={t.about} onClick={() => setCurrentTab('about')} />
        </div>
      </div>

      <button className="w-full py-4 rounded-2xl bg-red-500/5 text-red-500 font-medium border border-red-500/10 flex items-center justify-center hover:bg-red-500/10 transition-colors">
        <LogOut size={18} className="mr-2" /> Sign Out
      </button>

      <AnimatePresence>
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
      </AnimatePresence>
    </motion.div>
  );
};

const AboutPage = ({ setCurrentTab, t }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 pb-32">
    <header className="flex items-center mb-8 mt-4">
      <button onClick={() => setCurrentTab('settings')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 text-white hover:bg-white/10 transition-colors">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-3xl font-bold text-white tracking-tight">{t.about}</h1>
    </header>

    <div className="bg-[#120F1C] border border-white/5 rounded-[28px] p-8 mb-8 text-center shadow-lg shadow-black/20">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(139,92,246,0.4)] overflow-hidden">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiP8PtPcn_lYed8oigp1S0lt3qnSwtz0ifjHgxc3iKF01mdzKLRtm5Bq8gjxQd4-j69avgRw_AmPYyonScYLVsoXQ0tYn-AyRfnRGPEaoVcCucFH6M6j_gLA7pbPkbEfP2mv6qEkoI4I07ZDs-b_dnX85SgV4qM2lIekCWSJeilBojFT1x7vpVD5VTR5D2/s1120/45435.png" alt="Robot" className="w-full h-full object-cover rounded-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Prompt Builder</h2>
      <p className="text-gray-400 text-sm mb-6">Version 2.0.0</p>
      
      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        Prompt Builder is an advanced AI-powered tool designed to help developers and creators craft the perfect prompts for AI coding assistants.
      </p>

      <div className="flex justify-center gap-4 text-gray-500">
        <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
        <span>•</span>
        <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
      </div>
    </div>

    <div className="text-center text-gray-600 text-xs">
      <p>© 2026 Prompt Builder. All rights reserved.</p>
      <p className="mt-1">Developed by Jaival Pandya</p>
      <p className="mt-1">Powered by Gemini AI</p>
    </div>
  </motion.div>
);

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
