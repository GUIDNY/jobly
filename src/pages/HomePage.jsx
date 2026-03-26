import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import BgStylePicker from '../components/BgStylePicker';
import LogoMark from '../components/LogoMark';
import { saveDraft, uploadCardImage, toSlug, checkSlugAvailable, suggestSlugs } from '../lib/cardsApi';

const DEFAULTS = {
  business_name: '',
  description: '',
  phone: '',
  avatar_url: '',
  template: 1,
  primary_color: '#111827',
  background_style: 'gradient',
  whatsapp_message: 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
  card_services: [],
};

const COLORS = ['#111827', '#4F46E5', '#5BC4C8', '#DB2777', '#DC2626', '#16A34A', '#0284C7', '#EA580C'];

// Static hero phone demo — placeholder state shown until user enters their own data
const HERO_DEMO = {
  business_name: 'שם העסק שלך',
  description: 'תיאור קצר של העסק שלך',
  phone: '',
  primary_color: '#5BC4C8',
  template: 1,
  background_style: 'gradient',
  avatar_url: '',
  whatsapp_position: 'bottom',
  card_services: [
    { title: 'שירות לדוגמה', description: '₪100 · 45 דקות' },
    { title: 'שירות נוסף', description: '₪150 · 60 דקות' },
  ],
};

// Demo phones for the showcase section
const DEMOS = [
  {
    business_name: 'המספרה של אבי',
    description: 'תספורות גבר ועיצוב זקן',
    phone: '0501234567',
    primary_color: '#111827',
    template: 1,
    background_style: 'image',
    whatsapp_position: 'bottom',
    avatar_url: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=600',
    card_services: [
      { title: 'תספורת גבר', description: '₪60 · 30 דקות' },
      { title: 'עיצוב זקן', description: '₪40 · 20 דקות' },
    ],
  },
  {
    business_name: 'נגה נייל ארט',
    description: 'עיצוב ציפורניים מקצועי',
    phone: '0521234567',
    primary_color: '#DB2777',
    template: 1,
    background_style: 'image',
    whatsapp_position: 'bottom',
    avatar_url: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=600',
    card_services: [
      { title: 'ג׳ל מלא', description: '₪120 · 60 דקות' },
      { title: 'עיצוב ארט', description: '₪150 · 75 דקות' },
    ],
  },
  {
    business_name: 'גיל מאמן כושר',
    description: 'אימון אישי — שינוי אמיתי',
    phone: '0531234567',
    primary_color: '#16A34A',
    template: 1,
    background_style: 'image',
    whatsapp_position: 'bottom',
    avatar_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
    card_services: [
      { title: 'אימון אישי', description: '₪180 · 60 דקות' },
      { title: 'תוכנית תזונה', description: '₪300 · חד פעמי' },
    ],
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    title: 'כפתור WhatsApp מובנה',
    desc: 'לקוח לוחץ — נפתח WhatsApp עם הודעה מוכנה. אפס חיכוך.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    title: 'כתובת אישית',
    desc: 'vizzit.online/שם-העסק — שתף ללקוחות, שים בביו.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    title: 'מותאם לנייד',
    desc: 'כל לקוח רואה את הדף שלך מושלם בטלפון.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'מוכן תוך 2 דקות',
    desc: 'ממלאים שם, טלפון ותיאור — הדף חי ומוכן לשיתוף.',
  },
];

const TESTIMONIALS = [
  { name: 'אבי כהן', role: 'ספר, תל אביב', text: 'תוך 3 דקות הייתה לי כתובת שלחתי ללקוחות.', stars: 5 },
  { name: 'נגה לוי', role: 'קוסמטיקאית, רמת גן', text: 'הלקוחות פשוט לוחצות על WhatsApp ישר מהכרטיס.', stars: 5 },
  { name: 'גיל שמעון', role: 'מאמן כושר, הרצליה', text: 'שמתי את הקישור בביו ותוך יום קיבלתי 4 פניות.', stars: 5 },
  { name: 'מיכל ברק', role: 'מאפרת, חולון', text: 'ניסיתי לבנות ב-Wix — שעות. פה? 5 דקות.', stars: 5 },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULTS);
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle');
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const fileInputRef = useRef(null);
  const slugTimer = useRef(null);

  const update = useCallback((field, value) => setForm(prev => ({ ...prev, [field]: value })), []);

  // Slug from business name
  useEffect(() => {
    const generated = toSlug(form.business_name);
    setSlug(generated);
    if (!generated) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      const ok = await checkSlugAvailable(generated);
      setSlugStatus(ok ? 'available' : 'taken');
      if (!ok) { const alts = await suggestSlugs(generated); setSlugSuggestions(alts); }
      else setSlugSuggestions([]);
    }, 700);
  }, [form.business_name]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update('avatar_url', URL.createObjectURL(file));
    if (form.background_style === 'gradient' || form.background_style === 'solid') {
      update('background_style', 'image');
    }
    if (user) {
      try {
        setUploadingImg(true);
        const url = await uploadCardImage(user.id, file);
        update('avatar_url', url);
      } catch (err) { console.error(err); }
      finally { setUploadingImg(false); }
    }
  };

  const handleCTA = () => {
    saveDraft({ ...form, slug });
    if (user) navigate('/builder');
    else setAuthOpen(true);
  };

  const handleAuthSuccess = () => { saveDraft({ ...form, slug }); navigate('/builder'); };
  const slugDisplay = slug || 'שם-העסק';

  // Hero phone content
  const heroPhoneData = { ...form, card_services: form.card_services || [] };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#ffffff' }} dir="rtl">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={36} />
            <span className="font-black text-gray-900 text-lg tracking-tight">Vizzit</span>
          </div>
          <div className="flex items-center gap-1">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                הדפים שלי
              </button>
            ) : (
              <>
                <button onClick={() => setAuthOpen(true)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  התחבר
                </button>
                <button onClick={handleCTA} className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: '#111827' }}>
                  התחל בחינם
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left: text + builder card */}
            <motion.div
              className="w-full md:flex-1 order-2 md:order-1"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            >
              {/* Headline */}
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5" style={{ background: '#f0fafa', border: '1px solid #b2e5e7' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5BC4C8' }} />
                  <span className="text-xs font-bold tracking-wide" style={{ color: '#2a9aa0' }}>כרטיס ביקור דיגיטלי</span>
                </div>
                <h1 className="text-[40px] md:text-[54px] font-black text-gray-900 leading-[1.08] tracking-tight">
                  הדרך החכמה<br />
                  <span style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    לקבל יותר לקוחות
                  </span>
                </h1>
                <p className="text-gray-400 text-base leading-relaxed mt-4 max-w-sm">
                  לקוחות רואים את הכרטיס שלך — ופונים אליך ישירות בוואטסאפ. בחינם, תוך דקות.
                </p>
              </div>

              {/* Builder card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                {/* Avatar + Name */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3.5">
                    <button onClick={() => fileInputRef.current?.click()} className="relative flex-shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden group border border-gray-200 hover:border-gray-400 transition-colors"
                      style={form.avatar_url ? {} : { background: '#f9fafb' }}>
                      {form.avatar_url ? (
                        <>
                          <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          </div>
                          {uploadingImg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <span className="text-[9px] text-gray-400 font-medium">תמונה</span>
                        </div>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div className="flex-1 min-w-0">
                      <input type="text" value={form.business_name} onChange={e => update('business_name', e.target.value)}
                        placeholder="שם העסק שלך"
                        className="w-full text-base font-black text-gray-900 placeholder-gray-300 focus:outline-none border-b border-transparent focus:border-gray-300 transition-colors pb-0.5 bg-transparent"
                        maxLength={60} />
                      <input type="text" value={form.description} onChange={e => update('description', e.target.value)}
                        placeholder="תיאור קצר..."
                        className="w-full text-sm text-gray-500 placeholder-gray-300 focus:outline-none mt-1 bg-transparent"
                        maxLength={100} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="text-sm leading-none">🇮🇱</span>
                      <div className="w-px h-3.5 bg-gray-200" />
                    </div>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="מספר טלפון" dir="ltr"
                      className="w-full border border-gray-200 rounded-xl pr-12 pl-3 py-3 text-sm focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-400 ml-1">צבע:</span>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => update('primary_color', c)}
                        className="w-6 h-6 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ background: c, boxShadow: form.primary_color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none', transform: form.primary_color === c ? 'scale(1.15)' : '' }} />
                    ))}
                  </div>
                </div>

                {/* Background style */}
                <div className="border-t border-gray-100 px-4 py-3">
                  <BgStylePicker value={form.background_style} onChange={v => update('background_style', v)} primaryColor={form.primary_color} avatarUrl={form.avatar_url} />
                </div>

                {/* Slug */}
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    <span className="text-xs font-mono text-gray-600 truncate">
                      <span className="text-gray-400">vizzit.online/</span>
                      <motion.span key={slugDisplay} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-bold" style={{ color: '#5BC4C8' }}>{slugDisplay}</motion.span>
                    </span>
                  </div>
                  {slugStatus === 'checking' && <svg className="animate-spin w-3 h-3 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  {slugStatus === 'available' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">זמין ✓</span>}
                  {slugStatus === 'taken' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">תפוס</span>
                      {slugSuggestions[0] && <button onClick={() => {}} className="text-[10px] font-mono hover:underline" style={{ color: '#5BC4C8' }}>{slugSuggestions[0]}</button>}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-4 pb-4 pt-2">
                  <motion.button onClick={handleCTA} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-white font-black text-base"
                    style={{ background: '#111827' }}
                  >
                    {form.business_name ? `צור כרטיס ל"${form.business_name}" →` : 'צור כרטיס ביקור בחינם →'}
                  </motion.button>
                  <p className="text-center text-xs text-gray-400 mt-2">ללא כרטיס אשראי · מוכן תוך 2 דקות</p>
                </div>
              </div>
            </motion.div>

            {/* Right: animated phone */}
            <motion.div
              className="flex-shrink-0 flex flex-col items-center order-1 md:order-2 w-full md:w-auto"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-400">
                  {form.avatar_url ? 'תצוגה מקדימה חיה' : 'התחל מהתמונה שלך'}
                </span>
              </div>

              <PhoneMockup>
                <AnimatePresence mode="wait">
                  {!form.avatar_url ? (
                    /* ── Upload screen: fill entire phone ── */
                    <motion.button
                      key="upload"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer"
                      style={{ background: `linear-gradient(160deg, ${form.primary_color} 0%, ${form.primary_color}99 100%)` }}
                      dir="rtl"
                    >
                      {/* Upload circle */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.12)' }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-base leading-tight">הוסף תמונה</p>
                          <p className="text-white/60 text-xs mt-1">לחץ להעלאה</p>
                        </div>
                      </div>
                      {/* Preview of how it'll look */}
                      <div className="flex flex-col items-center gap-1 opacity-40">
                        <div className="h-px w-16 bg-white/40" />
                        <p className="text-white/70 text-[10px]">הכרטיס שלך יופיע כאן</p>
                      </div>
                    </motion.button>
                  ) : (
                    /* ── Card preview after upload ── */
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="h-full"
                    >
                      <CardPreview data={heroPhoneData} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </PhoneMockup>

              {/* URL bar */}
              <div className="mt-3 w-[260px] bg-white rounded-xl border border-gray-200 px-3 py-2 flex items-center gap-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="flex gap-1 flex-shrink-0">
                  {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                </div>
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 min-w-0">
                  <motion.p key={slugDisplay} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                    className="text-xs font-mono text-gray-500 truncate text-left">
                    vizzit.online/{slugDisplay}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ──────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            אלפי עסקים בישראל כבר משתמשים
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { emoji: '💈', label: 'מספרות' },
              { emoji: '💅', label: 'נייל ארט' },
              { emoji: '🏋️', label: 'מאמני כושר' },
              { emoji: '🛠️', label: 'בעלי מקצוע' },
              { emoji: '🌿', label: 'קוסמטיקאיות' },
              { emoji: '🍕', label: 'מסעדות' },
              { emoji: '📸', label: 'צלמים' },
              { emoji: '🎨', label: 'מעצבים' },
            ].map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 hover:border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg leading-none">{b.emoji}</span>
                <span className="text-xs font-semibold text-gray-600">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">למה Vizzit</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              כל מה שלקוח צריך<br />כדי לפנות אליך
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                className="rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all"
                style={{ background: '#f9fafb' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-4 text-gray-700"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-20 px-5" style={{ background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">איך זה עובד</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">שלושה צעדים. דף מוכן.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'ממלאים פרטים', desc: 'שם עסק, תיאור קצר ומספר טלפון.' },
              { num: '02', title: 'בוחרים עיצוב', desc: 'צבע, תמונה ורקע. רואים תוצאה חיה.' },
              { num: '03', title: 'מפרסמים ומשתפים', desc: 'מקבלים כתובת אישית. שולחים ללקוחות.' },
            ].map((step, i) => (
              <motion.div key={i} className="flex gap-4 items-start"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}>
                <span className="text-4xl font-black text-gray-100 leading-none select-none flex-shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PHONES ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">דוגמאות אמיתיות</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              ככה זה נראה ללקוחות שלך
            </h2>
          </motion.div>

          <div className="flex flex-row items-end justify-center gap-1 sm:gap-4 md:gap-6">
            {DEMOS.map((demo, i) => (
              <motion.div key={i}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                style={{ marginBottom: i === 1 ? 20 : 0 }}
              >
                <motion.div
                  animate={{ y: [0, i === 1 ? -10 : i === 0 ? -7 : -13, 0] }}
                  transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                >
                  {/* Mobile: small */}
                  <div className="block sm:hidden" style={{ width: 91, height: 205, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      <PhoneMockup>
                        <CardPreview data={demo} compact />
                      </PhoneMockup>
                    </div>
                  </div>
                  {/* Desktop: larger */}
                  <div className="hidden sm:block" style={{ width: 195, height: 450, position: 'relative' }}>
                    <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', position: 'absolute', top: 0, left: -32 }}>
                      <PhoneMockup>
                        <CardPreview data={demo} compact />
                      </PhoneMockup>
                    </div>
                  </div>
                </motion.div>
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold text-gray-400 text-center">{demo.business_name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">מה אומרים עליהם</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">בעלי עסקים אוהבים Vizzit</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                className="rounded-2xl p-5 border border-gray-100"
                style={{ background: '#f9fafb' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#111827"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-5" style={{ background: '#111827' }}>
        <motion.div className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
            מוכן להתחיל?
          </h2>
          <p className="text-white/50 text-lg mb-8">
            תוך 2 דקות יהיה לך כרטיס ביקור דיגיטלי שעובד.
          </p>
          <motion.button onClick={handleCTA} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-black text-lg px-8 py-4 rounded-xl">
            צור כרטיס ביקור בחינם
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </motion.button>
          <p className="text-white/30 text-sm mt-4">ללא כרטיס אשראי · ללא התחייבות</p>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-black py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white"><LogoMark size={18} color="#111827" /></div>
            <span className="font-black text-white text-base">Vizzit</span>
          </div>
          <p className="text-gray-600 text-xs text-center">כרטיס ביקור דיגיטלי לבעלי עסקים ישראלים</p>
          <p className="text-gray-700 text-xs">© 2025 Vizzit</p>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
