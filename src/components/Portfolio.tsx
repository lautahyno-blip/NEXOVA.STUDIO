import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  projectUrl?: string;
  createdAt: any;
}

const Portfolio: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const portfolioData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setItems(portfolioData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'portfolio');
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
        <p className="text-white/40 font-display text-xl uppercase tracking-widest">Belum ada project</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, index) => (
        <motion.div
           key={item.id}
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: index * 0.1 }}
           viewport={{ once: true }}
           className="group relative rounded-2xl overflow-hidden glass border-white/5"
         >
           <div className="aspect-[4/5] overflow-hidden">
             <img 
               src={item.imageUrl} 
               alt={item.title} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               referrerPolicy="no-referrer"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=800';
               }}
             />
             <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           </div>
           <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-brand-dark to-transparent">
             <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan mb-2 block">{item.category}</span>
             <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
             {item.projectUrl ? (
               <a 
                 href={item.projectUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs font-bold hover:text-brand-cyan transition-colors"
               >
                 View Project <ExternalLink size={14} />
               </a>
             ) : (
               <span className="text-[10px] text-white/40 italic">Project details coming soon</span>
             )}
           </div>
         </motion.div>
      ))}
    </div>
  );
};

export default Portfolio;
