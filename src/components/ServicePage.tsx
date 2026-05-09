import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  Star, 
  MessageCircle, 
  Mail, 
  Send, 
  Clock, 
  RefreshCcw, 
  FileText, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notifyAdmin, sendAutoReply } from '../lib/email';
import ProjectOrderForm from './ProjectOrderForm';

interface PriceCardProps {
  type: string;
  price: string;
  features: string[];
  recommended?: boolean;
  onSelect?: (price: string) => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ type, price, features, recommended, onSelect }) => (
  <div className={`glass p-8 rounded-[32px] relative flex flex-col h-full border-white/5 ${recommended ? 'border-brand-cyan/50 bg-brand-cyan/5' : ''}`}>
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-cyan text-brand-dark text-[10px] font-bold uppercase rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)]">
        Best Choice
      </div>
    )}
    <div className="mb-8">
      <h4 className="text-xl font-bold mb-2">{type}</h4>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{price}</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm text-white/60">
          <CheckCircle2 size={16} className="text-brand-cyan" /> {f}
        </li>
      ))}
    </ul>
    <button 
      onClick={() => onSelect?.(price)}
      className={`w-full py-4 rounded-xl font-bold transition-all ${recommended ? 'bg-brand-cyan text-brand-dark shadow-[0_10px_20px_rgba(0,255,255,0.2)]' : 'glass hover:bg-white/10'}`}
    >
      Choose Plan
    </button>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left group">
        <span className="text-lg font-bold group-hover:text-brand-cyan transition-colors">{question}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-cyan' : 'text-white/20'}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="mt-4 text-white/50 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ServicePage: React.FC<{ config?: any }> = ({ config }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<string | undefined>(undefined);

  const socialLinks = config?.socialLinks || {
    tiktok: 'https://www.tiktok.com/@smartdesigenlab_26',
    email: 'smartdesignlab01@gmail.com'
  };

  const categoryMap: any = {
    'canva': 'Canva Design',
    'ai': 'AI Prompt Creation',
    'thumbnail': 'YouTube Thumbnail Design',
    'social': 'Social Media Design'
  };

  const currentCategory = categoryMap[categoryId || ''] || 'Our Services';

  useEffect(() => {
    const q = query(
      collection(db, 'portfolio'), 
      where('category', '==', currentCategory),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (s) => {
      setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [categoryId, currentCategory]);

  const onSelectPlan = (price: string) => {
    setSelectedBudget(price);
    const element = document.getElementById('order-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-brand-cyan transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Hero */}
        <section className="relative mb-32">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-cyan/10 blur-[120px] rounded-full" />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
            <h1 className="text-5xl md:text-8xl font-display font-bold italic mb-6">{currentCategory}</h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto italic">Premium visual solutions crafted with precision and digital artistry.</p>
          </motion.div>
        </section>

        {/* Description */}
        <div className="grid md:grid-cols-2 gap-20 mb-32 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6 italic text-brand-cyan">NEXOVA<span className="not-italic text-white">.QUALITY</span></h2>
            <p className="text-white/60 leading-relaxed text-lg italic">
              Our {currentCategory} service is designed for those who seek more than just common graphics. We focus on psychological triggers, aesthetic balance, and modern trends to ensure your content stands out in a crowded digital space.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {[ 
              { icon: Zap, label: 'Fast Response' },
              { icon: Star, label: 'Premium Quality' },
              { icon: Clock, label: 'On-time Delivery' },
              { icon: RefreshCcw, label: 'Unlimited Support' }
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-2xl flex flex-col items-center gap-3 text-center border-white/5">
                <feature.icon className="text-brand-cyan" size={24} />
                <span className="text-sm font-bold">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Showcase */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold mb-12 text-center">Portfolio Showcase</h2>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin text-brand-cyan" /></div>
          ) : items.length === 0 ? (
            <div className="glass p-20 rounded-[40px] text-center border-white/5">
               <p className="text-white/20 text-xl font-display uppercase tracking-widest italic">Belum ada project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="group relative aspect-[4/5] rounded-3xl overflow-hidden glass border-white/5 cursor-pointer">
                  <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="text-brand-cyan" size={48} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Pricing */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold mb-12 text-center">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PriceCard 
              type="BASIC" 
              price="Rp10.000" 
              features={[
                '1 Design Concept', 
                '1 Revision', 
                'High Resolution File', 
                '2 Days Delivery'
              ]} 
              onSelect={onSelectPlan}
            />
            <PriceCard 
              type="STANDARD" 
              price="Rp25.000" 
              features={[
                '2 Design Concepts', 
                '3 Revisions', 
                'Source File Included', 
                'Priority Support',
                '2 Days Delivery'
              ]} 
              recommended 
              onSelect={onSelectPlan}
            />
            <PriceCard 
              type="PREMIUM" 
              price="Rp50.000" 
              features={[
                '4 Design Concepts', 
                'Unlimited Revisions', 
                'Full Commercial Use', 
                'Fast Response Support',
                'Fast Delivery'
              ]} 
              onSelect={onSelectPlan}
            />
          </div>
        </section>

        {/* Ordering & Contact */}
        <section id="order-form-section" className="grid lg:grid-cols-2 gap-16 mb-32 scroll-mt-24">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">Order Now</h2>
            <p className="text-white/50 italic">Pick your preferred platform or use the direct form to start your project with us.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-brand-cyan/5 hover:border-brand-cyan transition-all group">
                  <Star className="text-white/40 group-hover:text-brand-cyan transition-colors" />
                  <span className="text-xs font-bold">Instagram</span>
                </a>
              )}
              {socialLinks.telegram && (
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-brand-cyan/5 hover:border-brand-cyan transition-all group">
                  <Send className="text-white/40 group-hover:text-brand-cyan transition-colors" />
                  <span className="text-xs font-bold">Telegram</span>
                </a>
              )}
              {socialLinks.tiktok && (
                <a href="https://www.tiktok.com/@smartdesigenlab_26" target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-brand-cyan/5 hover:border-brand-cyan transition-all group">
                  <Zap className="text-white/40 group-hover:text-brand-cyan transition-colors" />
                  <span className="text-xs font-bold">TikTok</span>
                </a>
              )}
              <div className="glass p-6 rounded-2xl flex flex-col items-center gap-3 group">
                <Mail className="text-white/40" />
                <span className="text-[10px] font-bold text-white/30 text-center">smartdesignlab01@gmail.com</span>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border-brand-cyan/20">
              <h3 className="text-xl font-bold mb-6 italic">Why Choose This Service?</h3>
              <div className="space-y-4">
                {[ 'Fast Response & Delivery', 'Modern & Aesthetic Designs', 'Premium Quality Standards', 'Clean Communication' ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/80 italic">
                    <CheckCircle2 size={16} className="text-brand-cyan" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ProjectOrderForm initialService={currentCategory} config={config} selectedBudget={selectedBudget} />
        </section>

        {/* FAQ */}
        <section className="mb-32 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="glass p-8 md:p-12 rounded-[40px] border-white/5">
            <FAQItem question="Berapa lama pengerjaan?" answer="Biasanya pengerjaan memakan waktu 1-3 hari tergantung kompleksitas project dan antrean." />
            <FAQItem question="Revisi berapa kali?" answer="Kami menawarkan revisi sesuai paket yang dipilih, biasanya mulai dari 2 kali hingga tak terbatas." />
            <FAQItem question="Format file apa saja?" answer="File akan dikirim dalam format PNG, JPG, dan Source Files (PSD/Canva Link) sesuai paket." />
            <FAQItem question="Cara pemesanan?" answer="Pilih paket, isi form request, atau hubungi kami langsung via platform yang tersedia." />
          </div>
        </section>

        {/* Related Services */}
        <section>
          <h2 className="text-3xl font-bold mb-12 text-center italic">Related Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categoryMap).filter(([id]) => id !== categoryId).map(([id, label], i) => (
              <Link key={id} to={`/service/${id}`} className="glass p-8 rounded-2xl border-white/5 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center mb-4 group-hover:bg-brand-cyan group-hover:text-brand-dark transition-all">
                  <ExternalLink size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicePage;
