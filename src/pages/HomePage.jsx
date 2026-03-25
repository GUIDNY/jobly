import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import { saveDraft, uploadCardImage, toSlug } from '../lib/cardsApi';

const DEFAULTS = {
  business_name: '',
  description: '',
  phone: '',
  avatar_url: '',
  template: 1,
  primary_color: '#4F46E5',
  whatsapp_message: 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
  card_services: [],
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULTS);
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

  const update = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    update('avatar_url', localUrl);

    if (user) {
      try {
        setUploadingImg(true);
        const url = await uploadCardImage(user.id, file);
        update('avatar_url', url);
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingImg(false);
      }
    }
    // Store file for later upload after auth
    update('_pendingImageFile', file);
  };

  const handleCTA = () => {
    saveDraft(form);
    if (user) {
      navigate('/builder');
    } else {
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    saveDraft(form);
    navigate('/builder');
  };

  const slugPreview = toSlug(form.business_name) || 'שם-העסק';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              M
            </div>
            <span className="font-bold text-gray-900 text-lg">MyCard</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-indigo-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                הדפים שלי
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2"
              >
                התחבר
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        {/* Header text - mobile only */}
        <motion.div
          className="text-center mb-6 md:hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            הכרטיס הדיגיטלי שלך<br />
            <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              תוך 2 דקות
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">מלא את הפרטים — ראה את הדף שלך חי</p>
        </motion.div>

        {/* Main layout: form + phone */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-8 md:gap-12">

          {/* Phone mockup */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PhoneMockup>
              <CardPreview data={form} compact />
            </PhoneMockup>
            {/* URL preview */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-400">האתר שלך יהיה כאן:</p>
              <motion.p
                key={slugPreview}
                className="text-sm font-medium text-indigo-600 mt-0.5"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {slugPreview}.mycard.co.il
              </motion.p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="w-full md:max-w-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {/* Header text - desktop */}
            <div className="hidden md:block mb-6">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                צור את הכרטיס<br />
                הדיגיטלי שלך
              </h1>
              <p className="text-gray-500 mt-2">מלא את הפרטים ורואים אותך חי בשניות</p>
            </div>

            <div className="bg-white rounded-3xl p-5 card-shadow space-y-4">
              {/* Profile image */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex-shrink-0"
                >
                  {form.avatar_url ? (
                    <>
                      <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                      {uploadingImg && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">תמונה</span>
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700 mb-0.5">תמונת פרופיל</p>
                  <p className="text-xs text-gray-400">לחץ להעלאת תמונת העסק</p>
                </div>
              </div>

              {/* Business name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  שם העסק
                  <span className="text-red-400 mr-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={e => update('business_name', e.target.value)}
                  placeholder="המספרה של אבי"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור קצר</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="קביעת תור תוך דקות — תספורת, צביעה ועוד"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">מספר WhatsApp</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">🇮🇱</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="050-000-0000"
                    className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">צבע ראשי</label>
                <div className="flex gap-2 flex-wrap">
                  {['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#16A34A', '#0284C7', '#0F172A'].map(color => (
                    <button
                      key={color}
                      onClick={() => update('primary_color', color)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                      style={{
                        background: color,
                        outline: form.primary_color === color ? `3px solid ${color}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                  <label className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                    <input type="color" value={form.primary_color} onChange={e => update('primary_color', e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </label>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleCTA}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl text-white font-bold text-base mt-4 shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 8px 24px -4px rgba(79,70,229,0.4)' }}
            >
              צור את הדף שלי ←
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-2">חינמי לחלוטין · ללא כרטיס אשראי</p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: '⚡', text: 'תוך 2 דקות' },
                { icon: '📱', text: 'מותאם לנייד' },
                { icon: '🔗', text: 'קישור אישי' },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 text-center card-shadow">
                  <div className="text-xl mb-1">{f.icon}</div>
                  <p className="text-xs text-gray-600 font-medium">{f.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social proof */}
      <div className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">מצטרפים לאלפי בעלי עסקים שכבר בנו את הכרטיס שלהם</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            {['💈 מספרות', '💅 נייל ארט', '🏋️ מאמני כושר', '🍕 מסעדות', '🛠️ אינסטלטורים'].map((item, i) => (
              <span key={i} className="text-xs text-gray-400 hidden sm:inline">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
