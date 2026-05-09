import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, CheckCircle2, User, UserCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Feedback {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: any;
}

const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];
      setFeedbacks(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return toast.error('Please fill all fields');
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast.success('Thank you for your feedback!');
      setFormData({ name: '', rating: 5, comment: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to send feedback. Database policy might be active.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 italic">Client Echoes</h2>
            <p className="text-white/40 italic">Real signals from satisfied partners in the digital void.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 glass rounded-full font-bold text-sm hover:border-brand-cyan hover:text-brand-cyan transition-all flex items-center gap-2"
          >
            <MessageSquare size={18} />
            {showForm ? 'Close Transmission' : 'Send Signal (Feedback)'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <div className="glass p-8 rounded-[32px] border-brand-cyan/20 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Your ID (Name)</label>
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan"
                        placeholder="Anonymous or Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Rating Signal</label>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className="transition-transform active:scale-95"
                          >
                            <Star 
                              size={20} 
                              className={star <= formData.rating ? "text-brand-cyan fill-brand-cyan" : "text-white/20"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Transmission Data (Comment)</label>
                    <textarea 
                      value={formData.comment}
                      onChange={(e) => setFormData({...formData, comment: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 outline-none focus:border-brand-cyan min-h-[120px] resize-none"
                      placeholder="Your project experience..."
                      required
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-brand-cyan text-brand-dark rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Transmitting...' : 'Initialize Feedback'} <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[32px] border-white/5 hover:border-brand-cyan/20 transition-all flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-white italic">{item.name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < item.rating ? "text-brand-cyan fill-brand-cyan" : "text-white/10"} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed italic flex-1 truncate-3">
                "{item.comment}"
              </p>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Verified Partner</span>
                <CheckCircle2 size={12} className="text-brand-cyan/40" />
              </div>
            </motion.div>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <div className="text-center py-20 glass rounded-[40px] border-white/5">
            <p className="text-white/20 italic uppercase tracking-widest text-xs font-bold">No feedback signals received yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackSection;
