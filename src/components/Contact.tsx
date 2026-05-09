import React from 'react';
import { Mail, ExternalLink, Send, MessageSquare, Image as LucideImage } from 'lucide-react';
import ProjectOrderForm from './ProjectOrderForm';

const Contact: React.FC<{ config?: any }> = ({ config }) => {
  const socialLinks = config?.socialLinks || {
    tiktok: 'https://www.tiktok.com/@smartdesigenlab_26',
    email: 'smartdesignlab01@gmail.com'
  };

  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-7xl font-bold mb-8">Ready to<br />Deploy?</h2>
          <p className="text-white/50 mb-12 text-lg italic">Phase 1: Project Inquiry – Secure your slot in our dev pipeline.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <ProjectOrderForm config={config} />

          {/* Social Links */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold italic">Quick Access Nodes</h3>
              <p className="text-white/30 text-sm italic">Direct protocols for urgent transmissions and visual audits.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialLinks.tiktok && (
                <a 
                  href="https://www.tiktok.com/@smartdesigenlab_26" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-8 glass rounded-[32px] flex flex-col items-center gap-4 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group"
                >
                  <MessageSquare size={40} className="text-white/60 group-hover:text-brand-cyan transition-colors" />
                  <div className="text-center">
                    <span className="font-bold block">TikTok</span>
                    <span className="text-xs text-white/40">@smartdesigenlab_26</span>
                  </div>
                </a>
              )}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-8 glass rounded-[32px] flex flex-col items-center gap-4 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group"
                >
                  <LucideImage size={40} className="text-white/60 group-hover:text-brand-cyan transition-colors" />
                  <div className="text-center">
                    <span className="font-bold block">Instagram</span>
                    <span className="text-xs text-white/40">Daily updates</span>
                  </div>
                </a>
              )}
              {socialLinks.telegram && (
                <a 
                  href={socialLinks.telegram} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-8 glass rounded-[32px] flex flex-col items-center gap-4 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group"
                >
                  <Send size={40} className="text-white/60 group-hover:text-brand-cyan transition-colors" />
                  <div className="text-center">
                    <span className="font-bold block">Telegram</span>
                    <span className="text-xs text-white/40">Direct chat</span>
                  </div>
                </a>
              )}
              <div className="p-8 glass rounded-[32px] flex flex-col items-center gap-4 border-white/5 group">
                <Mail size={40} className="text-white/60 group-hover:text-brand-cyan transition-colors" />
                <div className="text-center">
                  <span className="font-bold block text-sm">smartdesignlab01@gmail.com</span>
                  <span className="text-xs text-white/40 uppercase font-black tracking-widest mt-1">Official Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
