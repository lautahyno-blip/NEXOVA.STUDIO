import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  Palette, 
  Zap, 
  Hash, 
  ArrowUpRight, 
  Mail, 
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  Cpu,
  Monitor,
  Lock,
  MessageSquare
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { Toaster } from 'react-hot-toast';

// --- Internal ---
import { AuthProvider, useAuth } from './context/AuthContext';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import ServicePage from './components/ServicePage';

// --- Types ---
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isExternal?: boolean;
}

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
  slug: string;
}

// --- Components ---

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick, isExternal }) => {
  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-white/60 hover:text-brand-cyan transition-colors duration-300 relative group"
      >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-cyan transition-all duration-300 group-hover:w-full" />
      </a>
    );
  }
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="text-sm font-medium text-white/60 hover:text-brand-cyan transition-colors duration-300 relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-cyan transition-all duration-300 group-hover:w-full" />
    </a>
  );
};

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, delay, slug }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="glass p-8 rounded-2xl group hover:bg-white/10 transition-all duration-500 border-white/5 hover:border-brand-cyan/30 flex flex-col h-full"
  >
    <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center mb-6 group-hover:bg-brand-cyan group-hover:text-brand-dark transition-all duration-500">
      <Icon size={24} className="text-brand-cyan group-hover:text-brand-dark transition-colors duration-500" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-white/60 leading-relaxed text-sm mb-6 flex-1">{description}</p>
    <Link 
      to={`/service/${slug}`}
      className="inline-flex items-center gap-2 text-brand-cyan font-bold text-sm group-hover:gap-3 transition-all"
    >
      Explores Details <ArrowUpRight size={16} />
    </Link>
  </motion.div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4 glass-dark' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          to="/"
          className="text-2xl font-display font-bold tracking-tighter text-brand-cyan italic"
        >
          NEXOVA<span className="text-white not-italic">.STUDIO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {isHome ? (
            <>
              <NavLink href="#home">Home</NavLink>
              <NavLink href="#about">About</NavLink>
              <NavLink href="#services">Services</NavLink>
              <NavLink href="#portfolio">Portfolio</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </>
          ) : (
            <Link to="/" className="text-sm font-medium text-white/60 hover:text-brand-cyan transition-colors">Back to Home</Link>
          )}
          
          <button 
            onClick={() => {
              if (isHome) {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#contact';
              }
            }}
            className="px-5 py-2 rounded-full bg-brand-cyan text-brand-dark text-sm font-bold hover:bg-white transition-all duration-300"
          >
            Let's Talk
          </button>

          {isAdmin && (
            <Link to="/admin" className="p-2 rounded-full transition-all text-brand-cyan bg-brand-cyan/10">
              <Lock size={18} />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark overflow-hidden"
          >
            <div className="flex flex-col gap-6 p-8">
              {isHome ? (
                <>
                  <NavLink href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
                  <NavLink href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</NavLink>
                  <NavLink href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</NavLink>
                  <NavLink href="#portfolio" onClick={() => setIsMobileMenuOpen(false)}>Portfolio</NavLink>
                  <NavLink href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink>
                </>
              ) : (
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-white/60">Back to Home</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Home = ({ config }: { config: any }) => {
  const heroTitle1 = config?.heroTitle1 || 'NEXOVA';
  const heroTitle2 = config?.heroTitle2 || 'STUDIO';
  const heroSubtext = config?.heroSubtext || 'Elevating digital content through premium design and AI-driven precision.';
  const aboutText = config?.aboutText || "We don't just design; we architect digital experiences. By combining human intuition with AI speed, we deliver assets that are both emotionally resonant and technically flawless.";
  const accentColor = config?.accentColor || '#00ffff';
  const socialLinks = config?.socialLinks || {
    tiktok: 'https://www.tiktok.com/@smartdesigenlab_26',
    email: 'smartdesignlab01@gmail.com'
  };

  return (
    <>
      <style>
        {`
          :root {
            --brand-cyan: ${accentColor};
          }
          .text-brand-cyan { color: var(--brand-cyan); }
          .bg-brand-cyan { background-color: var(--brand-cyan); }
          .border-brand-cyan { border-color: var(--brand-cyan); }
          .from-brand-cyan { --tw-gradient-from: var(--brand-cyan) var(--tw-gradient-from-position); }
          .to-brand-cyan { --tw-gradient-to: var(--brand-cyan) var(--tw-gradient-to-position); }
          .shadow-brand-cyan { --tw-shadow-color: var(--brand-cyan); }
        `}
      </style>
      
      {/* --- Hero Section --- */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            Digital Creative Agency
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-display font-bold leading-[0.9] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
          >
            {heroTitle1} <br />
            <span className="text-brand-cyan italic">{heroTitle2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 mb-12 font-light leading-relaxed italic"
          >
            {heroSubtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#portfolio" className="w-full sm:w-auto px-10 py-5 bg-brand-cyan text-brand-dark rounded-full font-bold flex items-center justify-center gap-2 group hover:bg-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,255,255,0.2)]">
              View Portfolio <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <a href="#contact" className="w-full sm:w-auto px-10 py-5 glass text-white rounded-full font-bold hover:bg-white/10 transition-all duration-300">
              Work With Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[40px] overflow-hidden glass p-3"
            >
              <img 
                src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800" 
                alt="Digital Art" 
                className="w-full h-full object-cover rounded-[32px] opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
              <div className="absolute bottom-8 left-8 p-6 glass rounded-2xl border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan mb-1">Born in the void</p>
                <p className="text-xs text-white/40 italic">Established 2024</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8 italic tracking-tighter">NEXOVA<span className="not-italic text-brand-cyan">.DNA</span></h2>
              <p className="text-xl text-white/60 leading-relaxed mb-8 italic font-light">
                {aboutText}
              </p>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-dark transition-all duration-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-0.5 italic">Premium Standards</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Industry Leading Quality</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-dark transition-all duration-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-0.5 italic">Future Mindset</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest">AI Assisted Innovation</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    {/* --- Services Section --- */}
    <section id="services" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 italic">Our Premium Services</h2>
          <p className="text-white/40 max-w-xl mx-auto italic">Tailored solutions for digital growth and visual dominance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard 
            icon={Palette} 
            title="Canva Design" 
            description="Professional, editable templates and assets crafted for your brand's unique presence." 
            delay={0.1}
            slug="canva"
          />
          <ServiceCard 
            icon={Zap} 
            title="AI Prompt Creation" 
            description="Unlock the future with custom-engineered prompts for Midjourney and DALL-E." 
            delay={0.2}
            slug="ai"
          />
          <ServiceCard 
            icon={Youtube} 
            title="Thumbnail Design" 
            description="High-CTR YouTube thumbnails that drive clicks and amplify your reach." 
            delay={0.3}
            slug="thumbnail"
          />
          <ServiceCard 
            icon={Hash} 
            title="Social Branding" 
            description="Cohesive visual identity for modern platforms like TikTok, IG, and Twitter." 
            delay={0.4}
            slug="social"
          />
        </div>
      </div>
    </section>

    {/* --- Portfolio Gallery --- */}
    <section id="portfolio" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 italic">Recent Expeditions</h2>
            <p className="text-white/40 max-w-sm italic">A selection of recent projects and creative breakthroughs.</p>
          </div>
        </div>
        <Portfolio />
      </div>
    </section>

    <Contact config={config} />

    {/* --- Footer --- */}
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-xl font-display font-bold tracking-tighter text-white/50">
          {heroTitle1}<span className="text-white/20">.{heroTitle2.replace('.', '')}</span>
        </div>
        <div className="flex gap-8 text-sm text-white/40">
          {socialLinks.tiktok && <a href="https://www.tiktok.com/@smartdesigenlab_26" target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors">TikTok</a>}
          {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors">Instagram</a>}
          {socialLinks.telegram && <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors">Telegram</a>}
          {socialLinks.email && <div className="text-[10px] font-bold text-white/20">smartdesignlab01@gmail.com</div>}
          <Link to="/admin" className="hover:text-brand-cyan transition-colors border-l border-white/10 pl-8">Admin Access</Link>
        </div>
        <p className="text-xs text-white/20">© 2024 {heroTitle1} {heroTitle2}. Crafted with precision.</p>
      </div>
    </footer>
  </>
  );
};

export default function App() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site', 'config'), (s) => {
      if (s.exists()) setConfig(s.data());
    });
    return () => unsub();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="animated-gradient min-h-screen selection:bg-brand-cyan selection:text-brand-dark overflow-x-hidden">
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              duration: 3000,
              style: { 
                background: '#0a0a1a', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              } 
            }} 
          />
          <Navbar />
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home config={config} />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/service/:categoryId" element={<ServicePage config={config} />} />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </Router>
  );
}
