import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  LogOut, 
  MessageSquare, 
  Image as LucideImage, 
  Layout, 
  Settings,
  Lock,
  X,
  Send,
  Loader2,
  Trash,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  User,
  Globe,
  Palette,
  Share2,
  Search,
  Zap,
  Shield,
  Activity,
  Monitor,
  Database,
  Type,
  Hash,
  Sparkles,
  Link as LinkIcon,
  CreditCard,
  FileText
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { isAdmin, login, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'messages' | 'site' | 'settings'>('portfolio');
  const [activeSettingTab, setActiveSettingTab] = useState<'profile' | 'account' | 'website' | 'socials' | 'notifications' | 'seo' | 'appearance' | 'advanced'>('profile');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [portfolio, setPortfolio] = useState<any[]>([]);
  
  // Site Config State
  const [siteConfig, setSiteConfig] = useState<any>({
    heroTitle1: 'NEXOVA',
    heroTitle2: 'STUDIO',
    heroSubtext: 'Elevating digital content through premium design and AI-driven precision.',
    aboutText: "We don't just design; we architect digital experiences. By combining human intuition with AI speed, we deliver assets that are both emotionally resonant and technically flawless.",
    categories: ['Canva Design', 'AI Prompt Creation', 'YouTube Thumbnail Design', 'Social Media Design'],
    services: [
      { id: 'canva', title: 'Canva Design', price: 'Rp10.000', status: 'active' },
      { id: 'ai', title: 'AI Prompt Creation', price: 'Rp15.000', status: 'active' },
      { id: 'thumbnail', title: 'YouTube Thumbnail Design', price: 'Rp25.000', status: 'active' },
      { id: 'social', title: 'Social Media Design', price: 'Rp10.000', status: 'active' }
    ]
  });
  const [isSavingSite, setIsSavingSite] = useState(false);

  // Admin Account Settings
  const [adminProfile, setAdminProfile] = useState<any>({
    displayName: 'Admin Nexova',
    bio: 'Professional Multimedia Designer & Content Strategist.',
    avatar: ''
  });
  const [adminAuth, setAdminAuth] = useState<any>({
    newUsername: '',
    newPassword: '',
    currentPassword: ''
  });

  // SEO & Optimization
  const [seoConfig, setSeoConfig] = useState<any>({
    title: 'Nexova Studio | Multimedia & Creative Design',
    description: 'Premier multimedia studio delivering AI-powered design solutions.',
    keywords: 'design, multimedia, ai, creative, portfolio'
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState<any>({
    tiktok: 'https://www.tiktok.com/@smartdesigenlab_26',
    instagram: '',
    telegram: '',
    email: 'smartdesignlab01@gmail.com'
  });

  // Appearance & Performance
  const [appearanceConfig, setAppearanceConfig] = useState<any>({
    themeMode: 'dark',
    accentColor: '#00ffff',
    blurIntensity: '120px',
    animationSpeed: '0.8s',
    glowEnabled: true
  });

  // Portfolio Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Canva Design');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const qP = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
      const unsubP = onSnapshot(qP, (s) => setPortfolio(s.docs.map(d => ({ id: d.id, ...d.data() }))));

      const qM = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubM = onSnapshot(qM, (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));

      const qF = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
      const unsubF = onSnapshot(qF, (s) => setFeedbacks(s.docs.map(d => ({ id: d.id, ...d.data() }))));

      // Listen for site config
      const unsubS = onSnapshot(doc(db, 'site', 'config'), (s) => {
        if (s.exists()) setSiteConfig(s.data());
      });

      return () => { unsubP(); unsubM(); unsubF(); unsubS(); };
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'messages' && messages.length > 0) {
      const markAsRead = async () => {
        const { updateDoc, doc } = await import('firebase/firestore');
        const unreadMessages = messages.filter(m => !m.isRead);
        
        for (const msg of unreadMessages) {
          try {
            await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
          } catch (e) {
            console.error("Error marking as read:", e);
          }
        }
      };
      markAsRead();
    }
  }, [activeTab, messages]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      toast.success('Admin login successful');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImageUrl) return toast.error('Fill in required fields');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'portfolio'), {
        title: newTitle,
        category: newCategory,
        imageUrl: newImageUrl,
        projectUrl: newProjectUrl,
        createdAt: serverTimestamp()
      });
      toast.success('Project added!');
      setIsAddingProject(false);
      setNewTitle(''); setNewImageUrl(''); setNewProjectUrl('');
    } catch (e) {
      toast.error('Failed to add project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Verifikasi: Hapus project ini?')) {
      await deleteDoc(doc(db, 'portfolio', id));
      toast.success('Project deleted');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Hapus pesan ini secara permanen?')) {
      await deleteDoc(doc(db, 'messages', id));
      toast.success('Message deleted');
    }
  };
 
  const handleDeleteFeedback = async (id: string) => {
    if (window.confirm('Hapus feedback ini?')) {
      await deleteDoc(doc(db, 'feedback', id));
      toast.success('Feedback deleted');
    }
  };

  const handleUpdateMessageStatus = async (msg: any, status: 'accepted' | 'rejected') => {
    const { updateDoc, doc } = await import('firebase/firestore');
    
    try {
      await updateDoc(doc(db, 'messages', msg.id), { status });
      toast.success(`Message ${status}`);
      
      // Notify Admin/User using the email utility
      if (status === 'accepted') {
        const { notifyAdmin, sendAutoReply } = await import('../lib/email');
        await notifyAdmin({ name: msg.fullName || msg.name, email: msg.email, message: msg.projectDetails });
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePaymentStatus = async (msgId: string, paymentStatus: 'valid' | 'invalid' | 'pending_verification') => {
    const { updateDoc, doc } = await import('firebase/firestore');
    try {
      await updateDoc(doc(db, 'messages', msgId), { paymentStatus });
      toast.success(`Payment marked as ${paymentStatus}`);
    } catch (e) {
      toast.error('Failed to update payment status');
    }
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSite(true);
    const { setDoc, doc } = await import('firebase/firestore');
    try {
      await setDoc(doc(db, 'site', 'config'), siteConfig);
      toast.success('Site content updated!');
    } catch (e) {
      toast.error('Failed to update site content');
    } finally {
      setIsSavingSite(false);
    }
  };

  const handleSaveAllSettings = async () => {
    setIsSavingSite(true);
    const { setDoc, doc } = await import('firebase/firestore');
    try {
      const mergedConfig = {
        ...siteConfig,
        adminProfile,
        seoConfig,
        socialLinks,
        appearanceConfig,
        accentColor: appearanceConfig.accentColor
      };
      await setDoc(doc(db, 'site', 'config'), mergedConfig);
      toast.success('System configuration synchronized!');
    } catch (e) {
      toast.error('Failed to sync settings');
    } finally {
      setIsSavingSite(false);
    }
  };

  const handleLogoutAction = () => {
    logout();
    toast.success('Logged out');
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-brand-dark"><Loader2 className="animate-spin text-brand-cyan" size={48} /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-cyan/10 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass p-12 rounded-[40px] max-w-sm w-full text-center border-white/5 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
        >
          {/* Neon Glow Lines */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_20px_rgba(0,255,255,0.8)]" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5" />
          
          <div className="w-20 h-20 bg-brand-cyan/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-shadow">
            <Lock size={40} className="text-brand-cyan" />
          </div>
          
          <h2 className="text-4xl font-bold mb-3 font-display italic tracking-tighter">NEXOVA<span className="text-white/20 not-italic text-sm ml-2">CORE</span></h2>
          <p className="text-white/40 mb-10 italic text-xs uppercase tracking-[0.2em]">Authorized Access Only</p>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                placeholder="Secure Username"
                required
              />
            </div>
            <div className="relative">
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                placeholder="Control Password"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-brand-cyan text-brand-dark rounded-full font-bold hover:bg-white transition-all duration-500 shadow-[0_10px_30px_rgba(0,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 mt-6 group/btn"
            >
              Initialize Session <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-12 text-[10px] text-white/20 font-bold uppercase tracking-widest italic">
            Nexova Studio Management v1.0
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <h2 className="text-sm font-bold text-white/20 uppercase tracking-widest px-4 mb-4">Management</h2>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-brand-cyan text-brand-dark' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Layout size={20} /> Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-brand-cyan text-brand-dark' : 'hover:bg-white/5 text-white/60'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={20} /> Messages
            </div>
            {messages.filter(m => !m.isRead && m.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] leading-none">
                {messages.filter(m => !m.isRead && m.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('feedback' as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === ('feedback' as any) ? 'bg-brand-cyan text-brand-dark' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Star size={20} /> Feedback
          </button>
          <button 
            onClick={() => setActiveTab('site')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'site' ? 'bg-brand-cyan text-brand-dark' : 'hover:bg-white/5 text-white/60'}`}
          >
            <LucideImage size={20} /> Site Content
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-brand-cyan text-brand-dark' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Settings size={20} /> Settings
          </button>
          <div className="pt-8 border-t border-white/5">
            <button onClick={handleLogoutAction} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 glass p-8 rounded-3xl min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'portfolio' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Portfolio Management</h3>
                  <button 
                    onClick={() => setIsAddingProject(true)}
                    className="p-2 rounded-xl bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan hover:text-brand-dark transition-all"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolio.map(item => (
                    <div key={item.id} className="glass p-4 rounded-2xl flex gap-4 items-center group">
                      <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm">{item.title}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">{item.category}</p>
                      </div>
                      <button onClick={() => handleDeleteProject(item.id)} className="text-white/20 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* ... existing messages content ... */}
              </motion.div>
            )}
 
            {activeTab === ('feedback' as any) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Client Feedback Management</h3>
                </div>
                <div className="space-y-4">
                  {feedbacks.length === 0 ? (
                    <div className="glass p-12 rounded-3xl border-dashed border-white/10 text-center">
                      <p className="text-white/20 italic">No feedback messages found.</p>
                    </div>
                  ) : (
                    feedbacks.map(f => (
                      <div key={f.id} className="glass p-6 rounded-2xl border-white/5 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold">{f.name}</p>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < f.rating ? "text-brand-cyan fill-brand-cyan" : "text-white/10"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-white/60 text-sm italic">"{f.comment}"</p>
                          <p className="text-[9px] text-white/20 uppercase font-mono mt-4">
                            Received: {f.createdAt?.toDate().toLocaleString()}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteFeedback(f.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Trash size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'site' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-2xl font-bold mb-8">Manage Homepage Content</h3>
                <form onSubmit={handleSaveSiteConfig} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Hero Title Part 1 (NEXOVA)</label>
                      <input 
                        value={siteConfig.heroTitle1} 
                        onChange={e => setSiteConfig({...siteConfig, heroTitle1: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Hero Title Part 2 (.STUDIO)</label>
                      <input 
                        value={siteConfig.heroTitle2} 
                        onChange={e => setSiteConfig({...siteConfig, heroTitle2: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Hero Subtext</label>
                    <textarea 
                      value={siteConfig.heroSubtext} 
                      onChange={e => setSiteConfig({...siteConfig, heroSubtext: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">About Section Narrative</label>
                    <textarea 
                      value={siteConfig.aboutText} 
                      onChange={e => setSiteConfig({...siteConfig, aboutText: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors min-h-[150px]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSavingSite}
                    className="w-full py-4 bg-brand-cyan text-brand-dark rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingSite ? <Loader2 className="animate-spin" /> : 'Update Home Page Content'}
                  </button>
                </form>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-8">
                {/* Sub-navigation */}
                <div className="w-full lg:w-48 space-y-1">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'account', label: 'Account', icon: Lock },
                    { id: 'website', label: 'Website', icon: Globe },
                    { id: 'socials', label: 'Socials', icon: Share2 },
                    { id: 'notifications', label: 'Emails', icon: Zap },
                    { id: 'seo', label: 'SEO', icon: Search },
                    { id: 'appearance', label: 'Visuals', icon: Palette },
                    { id: 'advanced', label: 'System', icon: Database },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSettingTab === tab.id ? 'bg-white/10 text-brand-cyan shadow-sm border border-white/5' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                    >
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    {activeSettingTab === 'profile' && (
                      <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/20 flex items-center justify-center">
                            <User className="text-brand-cyan" size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Profile Settings</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Public identity details</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Display Name</label>
                            <input value={adminProfile.displayName} onChange={e => setAdminProfile({...adminProfile, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Bio / Slogan</label>
                            <textarea value={adminProfile.bio} onChange={e => setAdminProfile({...adminProfile, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors min-h-[100px]" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Avatar URL</label>
                            <input value={adminProfile.avatar} onChange={e => setAdminProfile({...adminProfile, avatar: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                          </div>
                          <button onClick={handleSaveAllSettings} disabled={isSavingSite} className="py-3 px-8 bg-brand-cyan text-brand-dark rounded-full font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Save Changes'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'account' && (
                      <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6 text-red-400">
                          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Lock size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Account Credentials</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Security & Authentication</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs text-red-400/80 mb-4 italic">
                            Verification: Updating admin credentials will require a re-login after current session ends.
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">New Username</label>
                            <input value={adminAuth.newUsername} onChange={e => setAdminAuth({...adminAuth, newUsername: e.target.value})} className="w-full bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors" placeholder="e.g. mark" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">New Password</label>
                            <input type="password" value={adminAuth.newPassword} onChange={e => setAdminAuth({...adminAuth, newPassword: e.target.value})} className="w-full bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors" placeholder="••••••••" />
                          </div>
                          <button 
                            disabled={isSavingSite}
                            onClick={async () => {
                              if (!adminAuth.newUsername || !adminAuth.newPassword) return toast.error('Both fields are required');
                              setIsSavingSite(true);
                              const { setDoc, doc } = await import('firebase/firestore');
                              try {
                                await setDoc(doc(db, 'site', 'admin'), {
                                  username: adminAuth.newUsername,
                                  password: adminAuth.newPassword
                                });
                                toast.success('Security matrix updated! Login sync complete.');
                                setAdminAuth({ newUsername: '', newPassword: '', currentPassword: '' });
                              } catch (e) {
                                toast.error('Failed to update credentials');
                              } finally {
                                setIsSavingSite(false);
                              }
                            }} 
                            className="py-3 px-8 bg-red-500/20 text-red-400 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Update Core Credentials'}
                          </button>
                          
                          <div className="pt-8 border-t border-white/5">
                            <button onClick={handleLogoutAction} className="flex items-center gap-2 text-white/40 hover:text-red-400 font-bold transition-colors">
                              <LogOut size={16} /> Terminate All Sessions
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'website' && (
                      <motion.div key="website" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6 text-brand-cyan">
                          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                            <Globe size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Brand Core</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Voice & Identity</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Hero Text 1</label>
                              <input value={siteConfig.heroTitle1} onChange={e => setSiteConfig({...siteConfig, heroTitle1: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Hero Text 2</label>
                              <input value={siteConfig.heroTitle2} onChange={e => setSiteConfig({...siteConfig, heroTitle2: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Global Slogan</label>
                            <input value={siteConfig.heroSubtext} onChange={e => setSiteConfig({...siteConfig, heroSubtext: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">About Narrative</label>
                            <textarea value={siteConfig.aboutText} onChange={e => setSiteConfig({...siteConfig, aboutText: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors min-h-[120px]" />
                          </div>
                          <button onClick={handleSaveAllSettings} disabled={isSavingSite} className="py-3 px-8 bg-brand-cyan text-brand-dark rounded-full font-bold hover:bg-white transition-all">
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Publish Content'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'socials' && (
                      <motion.div key="socials" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Share2 size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Social Ecosystem</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">External platform links</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div className="grid gap-4">
                            {[
                              { key: 'tiktok', label: 'TikTok', icon: MessageSquare },
                              { key: 'instagram', label: 'Instagram', icon: LucideImage },
                              { key: 'telegram', label: 'Telegram', icon: Send },
                              { key: 'fiverr', label: 'Fiverr', icon: ExternalLink },
                              { key: 'email', label: 'Contact Email', icon: Mail }
                            ].map(platform => (
                              <div key={platform.key} className="flex gap-4">
                                <div className="w-12 h-12 glass border-white/5 flex items-center justify-center rounded-xl shrink-0">
                                  <platform.icon size={20} className="text-white/40" />
                                </div>
                                <div className="flex-1">
                                  <input 
                                    value={socialLinks[platform.key]} 
                                    onChange={e => setSocialLinks({...socialLinks, [platform.key]: e.target.value})} 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors text-xs" 
                                    placeholder={`${platform.label} Link`} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={handleSaveAllSettings} disabled={isSavingSite} className="py-4 px-8 bg-white text-brand-dark rounded-full font-bold hover:bg-brand-cyan transition-all">
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Link Connections'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'notifications' && (
                      <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6 text-brand-cyan">
                          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                            <Zap size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Email Dynamics</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">EmailJS Automations</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-5 rounded-2xl border-white/5">
                              <h5 className="font-bold text-xs mb-1">Service ID</h5>
                              <p className="text-[10px] text-white/20 font-mono italic">Loaded from .env</p>
                            </div>
                            <div className="glass p-5 rounded-2xl border-white/5">
                              <h5 className="font-bold text-xs mb-1">Public Key</h5>
                              <p className="text-[10px] text-white/20 font-mono italic">Loaded from .env</p>
                            </div>
                          </div>
                          <div className="p-6 glass border-white/5 rounded-3xl space-y-4">
                            <h5 className="font-bold text-sm mb-4">Functional Test</h5>
                            <button onClick={() => toast.loading('Sending verification test...')} className="w-full py-4 glass border-white/10 rounded-xl text-xs font-bold hover:border-brand-cyan transition-all">Send Test Auto-Reply</button>
                            <p className="text-[10px] text-white/20 text-center italic">Ensure your EmailJS templates match the specified parameters.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'seo' && (
                      <motion.div key="seo" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Search size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Search Optimizer</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Metadata & SEO controls</p>
                          </div>
                        </div>
                        <div className="space-y-4 max-w-xl">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Page Title Prefix</label>
                            <input value={seoConfig.title} onChange={e => setSeoConfig({...seoConfig, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Meta Description</label>
                            <textarea value={seoConfig.description} onChange={e => setSeoConfig({...seoConfig, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors min-h-[80px]" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Keywords (Comma Separated)</label>
                            <input value={seoConfig.keywords} onChange={e => setSeoConfig({...seoConfig, keywords: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" />
                          </div>
                          <button onClick={handleSaveAllSettings} disabled={isSavingSite} className="py-3 px-8 bg-brand-cyan text-brand-dark rounded-full font-bold hover:bg-white transition-all shadow-lg">
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Verify & Save SEO'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'appearance' && (
                      <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6 text-brand-cyan">
                          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                            <Palette size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">Visual Core</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Theme & Aesthetics</p>
                          </div>
                        </div>
                        <div className="space-y-6 max-w-xl">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 mb-4 block">Primary Accent Color</label>
                            <div className="flex gap-4">
                              <input 
                                type="color" 
                                value={appearanceConfig.accentColor} 
                                onChange={e => setAppearanceConfig({...appearanceConfig, accentColor: e.target.value})}
                                className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-2xl p-0 overflow-hidden shadow-2xl" 
                              />
                              <div className="flex-1">
                                <input value={appearanceConfig.accentColor} onChange={e => setAppearanceConfig({...appearanceConfig, accentColor: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors font-mono" />
                                <p className="text-[10px] text-white/20 mt-2 font-bold uppercase tracking-widest">Current Signature Neon</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Blur Intensity</label>
                               <select value={appearanceConfig.blurIntensity} onChange={e => setAppearanceConfig({...appearanceConfig, blurIntensity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer">
                                  <option value="40px">Minimal</option>
                                  <option value="120px">Standard</option>
                                  <option value="200px">Deep Glow</option>
                               </select>
                            </div>
                            <div>
                               <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Anim Speed</label>
                               <select value={appearanceConfig.animationSpeed} onChange={e => setAppearanceConfig({...appearanceConfig, animationSpeed: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer">
                                  <option value="0.4s">Fast</option>
                                  <option value="0.8s">Standard</option>
                                  <option value="1.2s">Slow</option>
                               </select>
                            </div>
                          </div>
                          <button 
                            onClick={handleSaveAllSettings}
                            disabled={isSavingSite}
                            className="py-4 px-12 bg-white text-brand-dark rounded-full font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2"
                          >
                            {isSavingSite ? <Loader2 className="animate-spin size-4" /> : 'Apply Visual Matrix'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeSettingTab === 'advanced' && (
                      <motion.div key="advanced" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Database size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic">System Matrix</h4>
                            <p className="text-white/40 text-xs italic uppercase tracking-widest">Advanced data controls</p>
                          </div>
                        </div>
                        
                        <div className="space-y-8 max-w-2xl">
                          <div className="p-6 glass border-white/5 rounded-3xl">
                            <h5 className="font-bold mb-4 flex items-center gap-2">
                              <Database size={18} className="text-brand-cyan" /> Portfolio Categories
                            </h5>
                            <div className="flex gap-2 mb-4">
                              <input 
                                id="new-cat" 
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-cyan transition-colors" 
                                placeholder="Add new category..." 
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('new-cat') as HTMLInputElement;
                                  if (input.value) {
                                    setSiteConfig({...siteConfig, categories: [...(siteConfig.categories || []), input.value]});
                                    input.value = '';
                                  }
                                }}
                                className="px-4 py-2 bg-brand-cyan text-brand-dark rounded-xl text-xs font-bold hover:bg-white transition-colors"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {siteConfig.categories?.map((cat: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold">
                                  {cat}
                                  <button 
                                    type="button"
                                    onClick={() => setSiteConfig({...siteConfig, categories: siteConfig.categories.filter((_: any, idx: number) => idx !== i)})}
                                    className="text-white/20 hover:text-red-400 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-6 glass border-white/5 rounded-3xl">
                            <h5 className="font-bold mb-4 flex items-center gap-2">
                              <Zap size={18} className="text-brand-cyan" /> Service Node Management
                            </h5>
                            <div className="space-y-3">
                              {siteConfig.services?.map((svc: any, i: number) => (
                                <div key={i} className="flex gap-4 items-center glass p-4 rounded-xl border-white/5 group hover:border-brand-cyan/20 transition-all">
                                  <div className="flex-1 space-y-1">
                                    <input 
                                      value={svc.title} 
                                      onChange={e => {
                                        const newSvcs = [...siteConfig.services];
                                        newSvcs[i].title = e.target.value;
                                        setSiteConfig({...siteConfig, services: newSvcs});
                                      }}
                                      className="bg-transparent border-none outline-none font-bold text-xs w-full focus:text-brand-cyan transition-colors"
                                      placeholder="Service Title"
                                    />
                                    <input 
                                      value={svc.price} 
                                      onChange={e => {
                                        const newSvcs = [...siteConfig.services];
                                        newSvcs[i].price = e.target.value;
                                        setSiteConfig({...siteConfig, services: newSvcs});
                                      }}
                                      className="bg-transparent border-none outline-none text-[10px] text-white/40 w-full focus:text-white"
                                      placeholder="Price (e.g. $25)"
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setSiteConfig({...siteConfig, services: siteConfig.services.filter((_: any, idx: number) => idx !== i)})}
                                    className="text-white/10 hover:text-red-500 transition-colors"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button"
                                onClick={() => setSiteConfig({...siteConfig, services: [...(siteConfig.services || []), { title: 'New Service', price: '$0', id: Date.now().toString() }]})}
                                className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[10px] uppercase font-bold text-white/40 hover:border-brand-cyan hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all"
                              >
                                + Add New Service Node
                              </button>
                            </div>
                          </div>

                          <div className="pt-8 border-t border-white/5 flex gap-4">
                            <button 
                              onClick={handleSaveAllSettings} 
                              disabled={isSavingSite} 
                              className="flex-1 py-4 bg-brand-cyan text-brand-dark rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_10px_30px_rgba(0,255,255,0.2)]"
                            >
                              {isSavingSite ? <Loader2 className="animate-spin size-4" /> : <Database size={18} />}
                              Finalize System State
                            </button>
                            <button 
                              type="button"
                              onClick={() => toast.success('Backup protocol initiated...')}
                              className="flex-1 py-4 glass border-white/10 rounded-full font-bold text-white/40 hover:bg-white/5 transition-all text-sm"
                            >
                              Export Data Backup
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAddingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingProject(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-8 rounded-[32px] max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Add New Project</h3>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Project Title</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" placeholder="e.g. Cyberpunk Thumbnail" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors appearance-none text-sm">
                    {siteConfig.categories?.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Image URL (Unsplash/Direct Link)</label>
                  <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Project Link (Optional)</label>
                  <input value={newProjectUrl} onChange={e => setNewProjectUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-cyan transition-colors" placeholder="https://..." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingProject(false)} className="flex-1 py-4 glass rounded-xl font-bold">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-brand-cyan text-brand-dark rounded-xl font-bold flex items-center justify-center">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
