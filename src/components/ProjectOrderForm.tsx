import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Star, 
  Zap, 
  Calendar,
  CloudUpload,
  Info,
  ChevronRight,
  Hash,
  Copy,
  CreditCard,
  AlertTriangle,
  Upload,
  FileText,
  FileImage,
  Loader2,
  Sparkles,
  Shield,
  X
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notifyAdmin, sendAutoReply } from '../lib/email';
import toast from 'react-hot-toast';

interface ProjectOrderFormProps {
  initialService?: string;
  config?: any;
  selectedBudget?: string;
}

const ProjectOrderForm: React.FC<ProjectOrderFormProps> = ({ initialService, config, selectedBudget }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    socialMedia: '',
    serviceType: initialService || 'Canva Design',
    projectTitle: '',
    projectDetails: '',
    budgetRange: selectedBudget || 'Rp10.000',
    deadline: '',
    referenceUrl: '',
    preferredComm: 'Email',
    agreement: false,
    dpConfirmed: false,
    paymentProof: '' as string | null
  });

  useEffect(() => {
    if (selectedBudget) {
      setFormData(prev => ({ ...prev, budgetRange: selectedBudget }));
    }
  }, [selectedBudget]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<number | null>(null);
  const [isSlotChecking, setIsSlotChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const paymentNumber = "081945742463";

  // Minimum 24h from now
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (formData.deadline) {
      checkAvailability(formData.deadline);
    }
  }, [formData.deadline]);

  const checkAvailability = async (date: string) => {
    setIsSlotChecking(true);
    try {
      const q = query(collection(db, 'messages'), where('deadline', '==', date));
      const querySnapshot = await getDocs(q);
      const bookedCount = querySnapshot.size;
      setAvailableSlots(4 - bookedCount);
    } catch (e) {
      console.error("Error checking availability:", e);
      setAvailableSlots(null);
    } finally {
      setIsSlotChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dpConfirmed) return toast.error('Checklist pernyataan DP wajib dicentang');
    if (!formData.paymentProof) return toast.error('Silakan upload bukti pembayaran (DP) terlebih dahulu');
    if (!formData.agreement) return toast.error('Harap setujui syarat dan ketentuan layanan');
    
    if (availableSlots !== null && availableSlots <= 0) {
      return toast.error('Jadwal sudah penuh untuk tanggal ini. Silakan pilih hari lain.');
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        paymentStatus: 'pending_verification',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send Emails via EmailJS
      await Promise.all([
        notifyAdmin({ name: formData.fullName, email: formData.email, message: formData.projectDetails, type: formData.serviceType }),
        sendAutoReply({ name: formData.fullName, email: formData.email })
      ]).catch(err => console.warn('Email notification failed but project saved:', err));

      setIsSuccess(true);
      toast.success('Project request sent! Bukti pembayaran telah diterima.');
      
      // Reset after delay
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          fullName: '',
          email: '',
          socialMedia: '',
          serviceType: initialService || 'Canva Design',
          projectTitle: '',
          projectDetails: '',
          budgetRange: '$5 - $20',
          deadline: '',
          referenceUrl: '',
          preferredComm: 'Email',
          agreement: false,
          dpConfirmed: false,
          paymentProof: null
        });
        setAvailableSlots(null);
        setUploadProgress(0);
      }, 5000);
    } catch (e) {
      toast.error('Submission failed. Mohon coba lagi atau hubungi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentNumber);
    toast.success('Nomor Pembayaran disalin!');
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return toast.error('File tidak valid. Hanya JPG, PNG, JPEG, dan PDF.');
    }

    if (file.size > 800 * 1024) { // 800KB Limit for Firestore Base64
      return toast.error('File terlalu besar! Maksimal 800KB untuk keamanan sistem.');
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Gagal membaca file.');
    };
    reader.onloadstart = () => setUploadProgress(30);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    };
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, paymentProof: reader.result as string }));
      setUploadProgress(100);
      setIsUploading(false);
      toast.success('Bukti pembayaran berhasil diupload!');
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="glass p-8 md:p-12 rounded-[40px] border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Send size={120} />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Section 1: Identity */}
          <div className="space-y-6">
            <h4 className="text-brand-cyan text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              Identity
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Full Name</label>
                <input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all placeholder:text-white/10"
                  placeholder="Your complete name"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all placeholder:text-white/10"
                  placeholder="name@provider.com"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Social / Contact (Optional)</label>
                <input 
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all placeholder:text-white/10"
                  placeholder="@username or direct link"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Project Info */}
          <div className="space-y-6">
            <h4 className="text-brand-cyan text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              Service Specs
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Service Type</label>
                <select 
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all appearance-none cursor-pointer"
                >
                  <option value="Canva Design">Canva Design</option>
                  <option value="Thumbnail Design">Thumbnail Design</option>
                  <option value="AI Prompt Creation">AI Prompt Creation</option>
                  <option value="Social Media Branding">Social Media Branding</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Project Title</label>
                <input 
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all placeholder:text-white/10"
                  placeholder="Short catchy title"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Budget Range</label>
                <select 
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all appearance-none cursor-pointer"
                >
                  <option value="Rp10.000">Rp10.000 (Basic)</option>
                  <option value="Rp25.000">Rp25.000 (Standard)</option>
                  <option value="Rp50.000">Rp50.000 (Premium)</option>
                  <option value="Custom">Custom / More</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Deep Details */}
        <div className="space-y-6">
          <h4 className="text-brand-cyan text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
            Project Architecture
          </h4>
          
          <div>
            <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Project Details (Concept, Style, Colors, Requirements)</label>
            <textarea 
              name="projectDetails"
              value={formData.projectDetails}
              onChange={handleInputChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-6 outline-none focus:border-brand-cyan transition-all min-h-[160px] resize-none placeholder:text-white/10"
              placeholder="Be specific! The better the brief, the better the result."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Deadline (Min. 24h Completion)</label>
              <div className="relative">
                <input 
                  type="date"
                  name="deadline"
                  min={minDateStr}
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all cursor-pointer invert brightness-150"
                />
                {formData.deadline && (
                  <div className="mt-2 flex items-center gap-2">
                    {isSlotChecking ? (
                      <span className="text-[10px] text-white/20 animate-pulse">Checking availability...</span>
                    ) : availableSlots !== null ? (
                      availableSlots > 0 ? (
                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={10} /> {availableSlots} Slots Available
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Info size={10} /> Sudah Habis (Schedule Full)
                        </span>
                      )
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Preferred Communication</label>
              <select 
                name="preferredComm"
                value={formData.preferredComm}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all appearance-none cursor-pointer"
              >
                <option value="Email">Email</option>
                <option value="Telegram">Telegram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="TikTok">TikTok</option>
              </select>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Reference Link / Logo URL (Optional)</label>
                <input 
                  name="referenceUrl"
                  value={formData.referenceUrl}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-cyan transition-all placeholder:text-white/10"
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Validation & Payment */}
        <div className="pt-8 border-t border-white/5 space-y-12">
          
          {/* Payment Notice Section */}
          <div className="space-y-6">
            <h4 className="text-brand-cyan text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              Payment Notice Section
            </h4>

            <div className="glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden bg-gradient-to-br from-brand-cyan/5 to-transparent">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-cyan/10 blur-[80px] rounded-full" />
              
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-brand-cyan/20 p-3 rounded-2xl">
                  <CreditCard className="text-brand-cyan" size={24} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold italic mb-2 tracking-tight">Down Payment (DP) Required</p>
                  <p className="text-white/40 text-[11px] leading-relaxed italic">
                    Before submitting your project request, please send a down payment (DP) first to confirm your order and secure the project slot.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {['GoPay', 'OVO', 'DANA'].map(method => (
                      <span key={method} className="bg-white/5 px-4 py-2 rounded-full text-[10px] font-bold text-white/60 border border-white/10 hover:border-brand-cyan/50 hover:text-brand-cyan transition-colors">
                        {method}
                      </span>
                    ))}
                  </div>
                  <div className="glass bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group/pay">
                    <div className="flex items-center gap-3">
                      <Hash className="text-brand-cyan" size={16} />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/20">Payment Number</p>
                        <p className="text-lg font-mono font-bold tracking-wider text-brand-cyan">{paymentNumber}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={copyToClipboard}
                      className="p-3 bg-white/5 hover:bg-brand-cyan hover:text-brand-dark rounded-xl transition-all"
                      title="Copy Number"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Elegant Info Box */}
                <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-6 rounded-[24px] relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Sparkles size={40} className="text-brand-cyan" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-brand-cyan">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Secure Payment Agent</span>
                  </div>
                  <p className="text-[11px] text-white/70 italic leading-relaxed">
                    Setiap transaksi di Nexova Studio dilindungi oleh sistem verifikasi manual untuk memastikan keamanan slot pengerjaan kamu.
                  </p>
                  <div className="mt-4 pt-4 border-t border-brand-cyan/10 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20" />
                      <div className="w-6 h-6 rounded-full bg-brand-cyan/20 border border-brand-cyan/30" />
                      <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30" />
                    </div>
                    <span className="text-[9px] font-bold text-brand-cyan uppercase animate-pulse">Trusted Agency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof Section */}
          <div className="space-y-6">
            <h4 className="text-brand-cyan text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
              Payment Proof Feature
            </h4>

            <div 
              onDragOver={onDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-[32px] p-10 transition-all duration-300 group/upload flex flex-col items-center text-center ${
                formData.paymentProof 
                  ? 'border-green-500/30 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.05)]' 
                  : isDragging 
                    ? 'border-brand-cyan bg-brand-cyan/10 scale-[1.01]' 
                    : 'border-white/10 hover:border-brand-cyan/40 bg-white/5'
              }`}
            >
              <input 
                type="file" 
                id="proof-upload"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              />
              
              {formData.paymentProof ? (
                <div className="space-y-4 w-full">
                  <div className="relative w-24 h-24 mx-auto group/preview">
                    {formData.paymentProof.startsWith('data:application/pdf') ? (
                      <div className="w-full h-full glass border-white/20 rounded-2xl flex items-center justify-center text-brand-cyan">
                        <FileText size={32} />
                      </div>
                    ) : (
                      <img src={formData.paymentProof} className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/20" />
                    )}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, paymentProof: null }));
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-lg z-20"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div>
                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> Proof Uploaded Successfully
                    </p>
                    <p className="text-white/20 text-[9px] mt-1">Hanya admin yang dapat melihat dokumen ini</p>
                  </div>
                </div>
              ) : (
                <label htmlFor="proof-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="p-5 bg-brand-cyan/10 rounded-full group-hover/upload:scale-110 transition-transform duration-500 relative z-10">
                      <Upload className="text-brand-cyan" size={32} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-brand-cyan/20 blur-xl rounded-full opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold italic">Upload Payment Proof</p>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Drag & Drop or click to browse</p>
                    <p className="text-[9px] text-white/20 italic mt-4">Support: JPG, PNG, JPEG, PDF (Max 800KB)</p>
                  </div>
                </label>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden rounded-b-full">
                  <div 
                    className="h-full bg-brand-cyan shadow-[0_0_10px_#00ffff] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <p className="text-[10px] text-white/30 italic text-center leading-relaxed px-10">
              “Clients are required to upload payment proof after sending the DP payment to continue the order request process.”
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer group/check">
              <div className="relative flex items-center mt-1">
                <input 
                  type="checkbox"
                  name="dpConfirmed"
                  checked={formData.dpConfirmed}
                  onChange={handleInputChange}
                  className="peer h-5 w-5 opacity-0 absolute"
                />
                <div className="h-5 w-5 border-2 border-white/10 rounded group-hover/check:border-brand-cyan transition-colors peer-checked:bg-brand-cyan peer-checked:border-brand-cyan flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-cyan/20 opacity-0 peer-checked:animate-ping" />
                  <CheckCircle2 size={12} className="text-brand-dark opacity-0 peer-checked:opacity-100 relative z-10" />
                </div>
              </div>
              <span className="text-[11px] text-white/60 leading-relaxed font-bold italic tracking-tight group-hover/check:text-white transition-colors">
                I have sent the DP payment before submitting the order request.
              </span>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group/check">
              <div className="relative flex items-center mt-1">
                <input 
                  type="checkbox"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="peer h-5 w-5 opacity-0 absolute"
                />
                <div className="h-5 w-5 border-2 border-white/10 rounded group-hover/check:border-brand-cyan transition-colors peer-checked:bg-brand-cyan peer-checked:border-brand-cyan flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-brand-dark opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <span className="text-[10px] text-white/40 leading-relaxed group-hover/check:text-white/60 transition-colors">
                I understand that project discussions and revisions will follow the agreed service terms. 24h completion logic applies to verified briefs.
              </span>
            </label>
          </div>

          <div className="relative pt-4">
            {(!formData.dpConfirmed || !formData.paymentProof) && !isSuccess && (
              <div className="absolute -top-4 left-0 w-full flex justify-center">
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-lg flex items-center gap-2 animate-bounce">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-widest">Complete DP Required</span>
                </div>
              </div>
            )}
            
            <button 
              disabled={isSubmitting || isUploading || isSuccess || !formData.paymentProof || !formData.dpConfirmed || (availableSlots !== null && availableSlots <= 0)}
              className={`w-full py-6 rounded-full font-bold flex items-center justify-center gap-3 transition-all duration-500 shadow-xl relative group/submit overflow-hidden ${
                isSuccess 
                  ? 'bg-green-500 text-white' 
                  : (availableSlots !== null && availableSlots <= 0)
                    ? 'bg-red-500/10 text-red-400 cursor-not-allowed border border-red-500/20'
                    : (!formData.paymentProof || !formData.dpConfirmed || isUploading)
                      ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                      : 'bg-brand-cyan text-brand-dark hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] shadow-brand-cyan/20'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/submit:translate-y-0 transition-transform duration-500" />
              
              {isSubmitting ? (
                <span className="flex items-center gap-2 relative z-10">
                  <Loader2 className="animate-spin" size={20} />
                  Encrypting & Sending System...
                </span>
              ) : isUploading ? (
                <span className="flex items-center gap-2 relative z-10">
                  <Loader2 className="animate-spin" size={20} />
                  Uploading Assets... {uploadProgress}%
                </span>
              ) : isSuccess ? (
                <span className="flex items-center gap-2 relative z-10">Success! Order Matrix Initialized <CheckCircle2 size={20} /></span>
              ) : (availableSlots !== null && availableSlots <= 0) ? (
                'Schedule Full'
              ) : (
                <span className="flex items-center gap-3 relative z-10">
                  Initialize Order Request <ChevronRight size={20} className="group-hover/submit:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectOrderForm;
