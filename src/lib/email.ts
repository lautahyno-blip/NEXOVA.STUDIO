import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

/**
 * EMAILJS CONFIGURATION GUIDE
 * 1. Create an account at https://www.emailjs.com/
 * 2. Add an Email Service (e.g., Gmail) -> Get Service ID
 * 3. Create two Email Templates -> Get Template IDs
 *    - Admin Notification Template
 *    - Client Auto-Reply Template
 * 4. Go to Account -> API Keys -> Get Public Key
 */

interface EmailParams {
  to_name: string;
  to_email: string;
  from_name?: string;
  message?: string;
  project_type?: string;
  budget?: string;
  status?: string;
  message_response?: string;
}

// GANTI VALUES DI BAWAH INI DENGAN DATA EMAILJS KAMU
const SERVICE_ID = "service_xxxxxxx"; // Ganti dengan Service ID kamu
const ADMIN_TEMPLATE_ID = "template_xxxxxxx"; // Ganti dengan Admin Template ID
const REPLY_TEMPLATE_ID = "template_xxxxxxx"; // Ganti dengan Client Reply Template ID
const PUBLIC_KEY = "xxxxxxxxxxxxxxxxx"; // Ganti dengan Public Key kamu

export const sendEmail = async (templateId: string, params: EmailParams) => {
  try {
    const result = await emailjs.send(SERVICE_ID, templateId, params as any, PUBLIC_KEY);
    return result;
  } catch (error) {
    console.error('EmailJS Error:', error);
    toast.error('Gagal mengirim email. Silakan cek Service ID / Public Key.');
    throw error;
  }
};

export const notifyAdmin = async (params: { name: string; email: string; message: string; type?: string }) => {
  try {
    await sendEmail(ADMIN_TEMPLATE_ID, {
      to_name: 'Admin',
      to_email: 'smartdesignlab01@gmail.com', // Email tujuan admin
      from_name: params.name,
      message: params.message,
      project_type: params.type || 'General Inquiry',
    });
  } catch (e) {
    console.error('Failed to notify admin');
  }
};

export const sendAutoReply = async (params: { name: string; email: string }) => {
  try {
    await sendEmail(REPLY_TEMPLATE_ID, {
      to_name: params.name,
      to_email: params.email,
      message_response: "Terima kasih telah menghubungi kami. Permintaan project kamu sudah kami terima dan akan segera kami review!"
    });
  } catch (e) {
    console.error('Failed to send auto-reply');
  }
};
