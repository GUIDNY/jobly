import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import PremiumPreview from '../components/PremiumPreview';
import AuthModal from '../components/AuthModal';
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

const DEMOS = [
  {
    business_name: 'המספרה של אבי',
    description: 'תספורות גבר ועיצוב זקן',
    phone: '0501234567',
    primary_color: '#F4938C',
    card_style: 'premium',
    contact_position: 'above',
    instagram: 'avi.barber',
    facebook: 'avibarber',
    tiktok: 'avibarber',
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
    primary_color: '#5BC4C8',
    card_style: 'premium',
    contact_position: 'above',
    avatar_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
    card_services: [
      { title: 'אימון אישי', description: '₪180 · 60 דקות' },
      { title: 'תוכנית תזונה', description: '₪300 · חד פעמי' },
    ],
  },
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
  const heroPhoneData = { ...form, card_services: form.card_services || [] };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white" dir="rtl">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
              <LogoMark size={18} color="white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">Vizzit</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">יתרונות</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">איך זה עובד</a>
            <a href="#showcase" className="hover:text-gray-900 transition-colors">דוגמאות</a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <button onClick={() => navigate('/admin')}
                    className="text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:opacity-90"
                    style={{ background: '#0d0f1a', color: '#5BC4C8', border: '1px solid rgba(91,196,200,0.3)' }}>
                    ניהול
                  </button>
                )}
                <button onClick={() => navigate('/dashboard')}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                  style={{ background: '#5BC4C8' }}>
                  הדפים שלי
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthOpen(true)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block">
                  התחבר
                </button>
                <button onClick={handleCTA}
                  className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ background: '#5BC4C8' }}>
                  התחל בחינם
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#fafafa' }}>
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

            {/* Right (RTL first): text + interactive builder */}
            <motion.div className="w-full md:flex-1"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 border"
                style={{ background: '#f0fafa', borderColor: '#b2e5e7' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5BC4C8' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2a9aa0' }}>חינם · מוכן תוך 2 דקות</span>
              </div>

              <h1 className="text-[38px] md:text-[52px] font-black text-gray-900 leading-[1.1] tracking-tight mb-5">
                שתי דקות מעכשיו<br />
                <span style={{ color: '#5BC4C8' }}>יהיה לך עמוד שעובד בשבילך.</span>
              </h1>
              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
                עמוד אחד עם כל הפרטים של העסק שלך — מה אתה עושה, כמה זה עולה, ואיך פונים אליך.
                הלקוח רואה, לוחץ על וואטסאפ, ומגיע. זה כל הסיפור.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <motion.button onClick={handleCTA} whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm"
                  style={{ background: '#5BC4C8', boxShadow: '0 4px 20px rgba(91,196,200,0.35)' }}>
                  בנה את הלינק שלך
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </motion.button>
                <button onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                  ראה דוגמאות
                </button>
              </div>

              {/* Interactive mini-builder */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#5BC4C8] transition-colors"
                      style={form.avatar_url ? {} : { background: '#f9fafb' }}>
                      {form.avatar_url ? (
                        <>
                          <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                          {uploadingImg && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <span className="text-[9px] text-gray-400">תמונה</span>
                        </div>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div className="flex-1 min-w-0">
                      <input type="text" value={form.business_name} onChange={e => update('business_name', e.target.value)}
                        placeholder="שם העסק שלך"
                        className="w-full text-sm font-black text-gray-900 placeholder-gray-300 focus:outline-none border-b border-transparent focus:border-gray-200 pb-0.5 bg-transparent transition-colors"
                        maxLength={60} />
                      <input type="text" value={form.description} onChange={e => update('description', e.target.value)}
                        placeholder="תיאור קצר..."
                        className="w-full text-xs text-gray-500 placeholder-gray-300 focus:outline-none mt-1 bg-transparent"
                        maxLength={100} />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="text-sm leading-none">🇮🇱</span>
                      <div className="w-px h-3.5 bg-gray-200" />
                    </div>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="מספר טלפון" dir="ltr"
                      className="w-full border border-gray-100 rounded-xl pr-12 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#5BC4C8] bg-gray-50 transition-all" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-400">צבע:</span>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => update('primary_color', c)}
                        className="w-5 h-5 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ background: c, boxShadow: form.primary_color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400" dir="ltr">
                    vizzit.online/<span style={{ color: '#5BC4C8' }} className="font-bold">{slugDisplay}</span>
                  </span>
                  {slugStatus === 'available' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">זמין ✓</span>}
                  {slugStatus === 'taken' && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">תפוס</span>}
                </div>
                <div className="px-4 pb-4 pt-1">
                  <button onClick={handleCTA}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: '#111827' }}>
                    {form.business_name ? `צור עמוד ל"${form.business_name}" ←` : 'קבל לינק עכשיו — בחינם ←'}
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-2">ללא כרטיס אשראי · בלי קוד · בלי עיצוב</p>
                </div>
              </div>
            </motion.div>

            {/* Left (RTL second): phone mockup */}
            <motion.div className="flex-shrink-0 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <PhoneMockup>
                <AnimatePresence mode="wait">
                  {!form.avatar_url ? (
                    <motion.button key="upload"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer"
                      style={{ background: `linear-gradient(160deg, ${form.primary_color} 0%, ${form.primary_color}99 100%)` }}
                      dir="rtl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.12)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-sm">הוסף תמונה</p>
                          <p className="text-white/60 text-xs mt-0.5">לחץ להעלאה</p>
                        </div>
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div key="card"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }} className="h-full">
                      <CardPreview data={heroPhoneData} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </PhoneMockup>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {form.avatar_url ? 'תצוגה מקדימה חיה' : 'לחץ להוספת תמונה'}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── FEATURES BENTO ── */}
      <section id="features" className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              כל מה שהלקוח צריך<br />
              <span style={{ color: '#5BC4C8' }}>כדי לפנות אליך.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* כרטיס 1 */}
            <motion.div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100 flex flex-col" style={{ background: '#f9fafb' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5" style={{ background: '#5BC4C820' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 mb-1 sm:mb-2 leading-snug">2 דקות ויש לך עמוד</h3>
              <p className="hidden sm:block text-sm text-gray-500 leading-relaxed">
                ממלאים שם, מספר וקצת פרטים — ומקבלים עמוד שמוכן לשיתוף. בלי לבזבז יום על עיצוב.
              </p>
              <p className="sm:hidden text-xs text-gray-500 leading-relaxed">ממלאים פרטים ומקבלים עמוד מוכן לשיתוף.</p>
            </motion.div>

            {/* כרטיס 2 - כהה */}
            <motion.div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col" style={{ background: '#111827' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5" style={{ background: 'rgba(91,196,200,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.7 19.79 19.79 0 012.12 4.07 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-white mb-1 sm:mb-2 leading-snug">לקוח לוחץ — ומגיע אליך</h3>
              <p className="hidden sm:block text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                כפתור וואטסאפ, שיחה ישירה, אינסטגרם — הכל על עמוד אחד. לקוח לא צריך לחפש אותך.
              </p>
              <p className="sm:hidden text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>וואטסאפ, שיחה, אינסטגרם — הכל במקום אחד.</p>
            </motion.div>

            {/* כרטיס 3 - תכלת */}
            <motion.div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col" style={{ background: '#5BC4C8' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-white mb-1 sm:mb-2 leading-snug">לינק שלך. לתמיד.</h3>
              <p className="hidden sm:block text-sm text-white/70 leading-relaxed mb-5">
                vizzit.online/שם-העסק — שים בביו, שלח בוואטסאפ, הדפס על כרטיס ביקור. לינק אחד לכל מקום.
              </p>
              <p className="sm:hidden text-xs text-white/75 leading-relaxed mb-3">לינק קבוע לעסק — בביו, בוואטסאפ, על כרטיס ביקור.</p>
              <div className="hidden sm:flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v7"/></svg>
                  שיתוף QR
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  שיתוף לינק
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                  שמירה לטלפון
                </span>
              </div>
              <div className="sm:hidden flex flex-col gap-1.5">
                {['QR', 'לינק', 'לטלפון'].map((t, i) => (
                  <span key={i} className="text-[11px] font-semibold text-white/80">· שיתוף {t}</span>
                ))}
              </div>
            </motion.div>

            {/* כרטיס 4 - עם תמונות */}
            <motion.div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100 flex flex-col" style={{ background: '#f9fafb' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5" style={{ background: '#f0fafa' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 mb-1 sm:mb-2 leading-snug">שירותים בתמונות</h3>
              <p className="hidden sm:block text-sm text-gray-500 leading-relaxed mb-4">
                מוסיפים שירותים עם מחיר ותמונה. הלקוח רואה בדיוק מה הוא מקבל — ופונה מוכן לרכישה.
              </p>
              <p className="sm:hidden text-xs text-gray-500 leading-relaxed mb-3">שירותים עם מחיר ותמונה — לקוח פונה מוכן.</p>
              <div className="flex gap-2">
                {DEMOS.slice(0, 2).map((d, i) => (
                  <div key={i} className="flex-1 h-12 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden">
                    <img src={d.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PHONE DEMOS ── */}
      <section className="py-20 px-5 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#5BC4C8' }}>ראה בעצמך</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              דוגמאות לדפים פעילים
            </h2>
          </motion.div>
          {/* Mobile: 3 phones in a row, small */}
          <div className="flex sm:hidden flex-row items-end justify-center gap-1">
            {DEMOS.map((demo, i) => (
              <motion.div key={i} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} style={{ marginBottom: i === 1 ? 14 : 0 }}>
                <motion.div animate={{ y: [0, i === 1 ? -8 : i === 0 ? -5 : -10, 0] }}
                  transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
                  <div style={{ width: 100, height: 218, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.385)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      <PhoneMockup>{demo.card_style === 'premium' ? <PremiumPreview data={demo} /> : <CardPreview data={demo} compact />}</PhoneMockup>
                    </div>
                  </div>
                </motion.div>
                <p className="mt-1 text-[10px] font-semibold text-gray-400 text-center">{demo.business_name}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: three phones */}
          <div className="hidden sm:flex flex-row items-end justify-center gap-8">
            {DEMOS.map((demo, i) => (
              <motion.div key={i} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }} style={{ marginBottom: i === 1 ? 20 : 0 }}>
                <motion.div animate={{ y: [0, i === 1 ? -10 : i === 0 ? -7 : -13, 0] }}
                  transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
                  <div style={{ width: 195, height: 450, position: 'relative' }}>
                    <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', position: 'absolute', top: 0, left: -32 }}>
                      <PhoneMockup>{demo.card_style === 'premium' ? <PremiumPreview data={demo} /> : <CardPreview data={demo} compact />}</PhoneMockup>
                    </div>
                  </div>
                </motion.div>
                <p className="mt-2 text-xs font-semibold text-gray-400 text-center">{demo.business_name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-5" style={{ background: '#f9fafb' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Right (RTL): text */}
            <motion.div className="flex-1"
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                שלושה צעדים.<br />לינק מוכן.
              </h2>
              <div className="space-y-6 mt-8">
                {[
                  { num: '1', title: 'כותבים את הפרטים', desc: 'שם, מה אתה עושה, מספר טלפון. זה הכל.' },
                  { num: '2', title: 'מעלים תמונה', desc: 'תמונה שלך או של העבודה. העמוד נראה מקצועי אוטומטית.' },
                  { num: '3', title: 'שולחים ללקוחות', desc: 'מקבלים לינק אישי. שמים בביו, שולחים בוואטסאפ, מתחילים לקבל פניות.' },
                ].map((s, i) => (
                  <motion.div key={i} className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: '#5BC4C8' }}>{s.num}</div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm mb-0.5">{s.title}</h3>
                      <p className="text-sm text-gray-500">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Left (RTL): editor mockup */}
            <motion.div className="flex-1 flex justify-center"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 overflow-hidden"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Vizzit עורך</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">שם העסק</p>
                    <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700">
                      סוכנות Vizzit Creative
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">צבע ראשי</p>
                    <div className="flex gap-2">
                      {['#5BC4C8','#DC2626','#111827','#4F46E5'].map((c,i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2"
                          style={{ background: c, borderColor: i === 0 ? c : 'transparent', boxShadow: i === 0 ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none' }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">שירותים</p>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#5BC4C820' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">עיצוב מותגי</span>
                    </div>
                  </div>
                  <button onClick={handleCTA}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: '#5BC4C8' }}>
                    תצוגה מקדימה ←
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ── */}
      <section id="showcase" className="py-20 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">

          <motion.div className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: '#5BC4C8' }}>
              קהילת המקצוענים שלנו
            </span>
          </motion.div>

          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}>
            <h2 className="text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
              מתאים לכל סוג של עסק
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              בין אם אתה ספר, מאמן, צלם או בעל מקצוע — Vizzit מתאים לעסק שלך בדיוק כמו שצריך.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', badge: 'NEW', badgeBg: '#1a1a2e', name: 'כושר ואימונים אישיים', desc: 'תוכניות אימון, פניות ישירות וניהול לקוחות בצורה חכמה.' },
              { img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80', badge: '150+ עסקים', badgeBg: '#5BC4C8', name: 'אמנות הציפורן והמניקור', desc: 'ניהול תורים, גלריית עבודות ותקשורת נוחה עם לקוחות.' },
              { img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80', badge: 'POPULAR', badgeBg: '#5BC4C8', name: 'ניהול תורים חכם לספרים', desc: 'הציגו את עבודותיכם ואפשרו ללקוחות לפנות בקלות.' },
              { img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80', badge: 'Premium', badgeBg: '#8b5cf6', name: 'צלמים ויוצרי תוכן', desc: 'שדרגו גלריות ובנו ויזואליות חזקות ומערכת ממירה.' },
              { img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80', badge: 'FEATURED', badgeBg: '#5BC4C8', name: 'קוסמטיקה ואסתטיקה', desc: 'ניהול זמן חכם, מחירון ברור ועבודת לקוחות מרוצים.' },
              { img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80', badge: 'Essential', badgeBg: '#64748b', name: 'פתרונות לנותני שירות', desc: 'ניהול פרויקטים ותקשורת מלאה עם הלקוח ממקום אחד.' },
            ].map((item, i) => (
              <motion.div key={i}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ height: 300 }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate('/builder')}>
                <img src={item.img} alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: item.badgeBg }}>
                    {item.badge}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-5 text-right">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1.5">{item.name}</h3>
                  <p className="text-white/65 text-xs leading-relaxed mb-3">{item.desc}</p>
                  <span className="text-xs font-semibold" style={{ color: '#5BC4C8' }}>למידע נוסף ←</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-5" style={{ background: 'linear-gradient(135deg, #1a6b6e 0%, #5BC4C8 100%)' }}>
        <motion.div className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            עמוד מקצועי לעסק שלך<br />בלחיצת כפתור אחת.
          </h2>
          <p className="text-white/70 mb-10 text-base">
            תוך 2 דקות יש לך עמוד שמרכז את כל העסק שלך ומביא פניות.<br />בחינם. בלי קוד. בלי עיצוב.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-black text-gray-900 bg-white text-sm"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              בנה את הלינק שלך — בחינם
            </motion.button>
            <button onClick={() => setAuthOpen(true)}
              className="px-8 py-4 rounded-2xl font-semibold text-white text-sm border-2 border-white/30 hover:border-white/60 transition-colors">
              דבר איתנו
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <LogoMark size={18} color="white" />
              </div>
              <span className="font-black text-white">Vizzit</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <a href="/privacy" className="hover:text-gray-300 transition-colors">מדיניות פרטיות</a>
              <a href="/terms" className="hover:text-gray-300 transition-colors">תנאי שימוש</a>
              <button onClick={() => setAuthOpen(true)} className="hover:text-gray-300 transition-colors">צור קשר</button>
            </div>
            <p className="text-gray-600 text-xs">© 2025 Vizzit · כל הזכויות שמורות</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
