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
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
              <LogoMark size={16} color="white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">Vizzit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-gray-900 transition-colors">יתרונות</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">איך זה עובד</a>
            <a href="#demos" className="hover:text-gray-900 transition-colors">דוגמאות</a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <button onClick={() => navigate('/admin')}
                    className="text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                    style={{ background: '#0d0f1a', color: '#5BC4C8', border: '1px solid rgba(91,196,200,0.2)' }}>
                    ניהול
                  </button>
                )}
                <button onClick={() => navigate('/dashboard')}
                  className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: '#5BC4C8' }}>
                  הדפים שלי
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthOpen(true)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors hidden sm:block">
                  התחבר
                </button>
                <button onClick={handleCTA}
                  className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#5BC4C8', boxShadow: '0 2px 12px rgba(91,196,200,0.4)' }}>
                  התחל בחינם
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fcfc 0%, #ffffff 100%)' }}>
        {/* Subtle background accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #5BC4C820, transparent)' }} />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5BC4C815 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

            {/* Right (RTL first): text + builder */}
            <motion.div className="w-full md:flex-1"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8"
                style={{ background: '#f0fbfb', border: '1px solid #b2e8ea' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#5BC4C8' }} />
                <span className="text-xs font-bold" style={{ color: '#2a9aa0' }}>בחינם · 2 דקות מהיום</span>
              </div>

              <h1 className="font-black text-gray-900 leading-[1.08] tracking-tight mb-5"
                style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}>
                הלקוח הבא שלך<br />
                <span style={{ color: '#5BC4C8' }}>יגיע דרך הלינק שלך.</span>
              </h1>

              <p className="text-gray-400 leading-relaxed mb-8" style={{ fontSize: 16, maxWidth: 400 }}>
                עמוד מקצועי לעסק שלך — מה אתה עושה, כמה זה עולה, ואיך פונים אליך.
                שם בביו, שולחים בוואטסאפ, ומתחילים לקבל פניות.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <motion.button onClick={handleCTA} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm"
                  style={{ background: '#5BC4C8', boxShadow: '0 4px 20px rgba(91,196,200,0.38)' }}>
                  בנה את הלינק שלך
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </motion.button>
                <button onClick={() => navigate('/store-builder')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors group">
                  בנה חנות
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בטא</span>
                </button>
              </div>

              {/* Social proof numbers */}
              <div className="flex items-center gap-6">
                {[
                  { val: '500+', label: 'עסקים פעילים' },
                  { val: '₪0', label: 'עלות להתחלה' },
                  { val: '2 דק׳', label: 'עד שיש לינק' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-black text-gray-900" style={{ fontSize: 18 }}>{s.val}</span>
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Left (RTL second): mini-builder + phone */}
            <motion.div className="w-full md:w-auto md:flex-shrink-0 flex flex-col md:flex-row items-center gap-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>

              {/* Interactive mini-builder */}
              <div className="w-full md:w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#5BC4C8] transition-colors"
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
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div className="flex-1 min-w-0">
                      <input type="text" value={form.business_name} onChange={e => update('business_name', e.target.value)}
                        placeholder="שם העסק"
                        className="w-full text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
                        maxLength={60} />
                      <input type="text" value={form.description} onChange={e => update('description', e.target.value)}
                        placeholder="תיאור קצר"
                        className="w-full text-xs text-gray-400 placeholder-gray-300 focus:outline-none mt-0.5 bg-transparent"
                        maxLength={100} />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="text-sm">🇮🇱</span>
                      <div className="w-px h-3.5 bg-gray-200" />
                    </div>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="מספר טלפון" dir="ltr"
                      className="w-full border border-gray-100 rounded-xl pr-12 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#5BC4C8] bg-gray-50 transition-all" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400">צבע:</span>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => update('primary_color', c)}
                        className="w-4 h-4 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ background: c, boxShadow: form.primary_color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400" dir="ltr">
                    vizzit.online/<span style={{ color: '#5BC4C8' }} className="font-bold">{slugDisplay}</span>
                  </span>
                  {slugStatus === 'available' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">זמין ✓</span>}
                  {slugStatus === 'taken' && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">תפוס</span>}
                </div>
                <div className="px-4 pb-4 pt-2">
                  <button onClick={handleCTA}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ background: '#111827' }}>
                    {form.business_name ? `צור דף ל"${form.business_name}" ←` : 'קבל לינק עכשיו ←'}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-2">ללא כרטיס אשראי · בלי קוד</p>
                </div>
              </div>

              {/* Phone mockup - hidden on small mobile, visible md+ */}
              <div className="hidden md:flex flex-col items-center">
                <PhoneMockup>
                  <AnimatePresence mode="wait">
                    {!form.avatar_url ? (
                      <motion.button key="upload"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
                        style={{ background: `linear-gradient(160deg, ${form.primary_color} 0%, ${form.primary_color}99 100%)` }}
                        dir="rtl">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                        <p className="text-white/80 text-xs">הוסף תמונה לתצוגה</p>
                      </motion.button>
                    ) : (
                      <motion.div key="card"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }} className="h-full">
                        <CardPreview data={heroPhoneData} compact />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PhoneMockup>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {form.avatar_url ? 'תצוגה מקדימה חיה' : 'הוסף תמונה לתצוגה'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">

          <motion.div className="mb-16 max-w-xl"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5BC4C8' }}>למה Vizzit</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              כל מה שהלקוח צריך<br />
              <span className="text-gray-400 font-medium">כדי להגיע אליך.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: '2 דקות ויש לך עמוד',
                desc: 'ממלאים שם ומספר — מקבלים עמוד מוכן לשיתוף. אין עיצוב, אין קוד, אין סיבוכים.',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.7 19.79 19.79 0 012.12 4.07 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                title: 'לקוח לוחץ — ומגיע אליך',
                desc: 'וואטסאפ, שיחה ישירה, אינסטגרם — הכל על עמוד אחד. הלקוח לא צריך לחפש.',
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                title: 'לינק שלך. לתמיד.',
                desc: 'vizzit.online/שם-העסק — שים בביו, שלח בוואטסאפ, הדפס על כרטיס. לינק אחד לכל מקום.',
              },
            ].map((f, i) => (
              <motion.div key={i} className="bg-white p-8 flex flex-col gap-4"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0fbfb' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Store CTA card */}
          <motion.div className="mt-4 rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer group"
            style={{ background: '#0A0A0A' }}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            onClick={() => navigate('/store-builder')}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-black text-xl">חנות דיגיטלית</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בטא</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                בנה חנות עם קטגוריות, מוצרים עם תמונות ומחירים, וסיים הזמנות בוואטסאפ. מה שנדרש לשכבה הבאה.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white flex-shrink-0 transition-all group-hover:opacity-90"
              style={{ background: '#5BC4C8' }}>
              בנה חנות
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── PHONE DEMOS ── */}
      <section id="demos" className="py-24 px-5" style={{ background: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5BC4C8' }}>ראה בעצמך</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              כך נראים דפים פעילים
            </h2>
            <p className="text-gray-400 text-sm mt-3">עסקים אמיתיים שמשתמשים ב-Vizzit עכשיו</p>
          </motion.div>

          {/* Mobile: 3 phones in a row */}
          <div className="flex sm:hidden flex-row items-end justify-center gap-2">
            {DEMOS.map((demo, i) => (
              <motion.div key={i} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} style={{ marginBottom: i === 1 ? 16 : 0 }}>
                <motion.div animate={{ y: [0, i === 1 ? -8 : i === 0 ? -5 : -10, 0] }}
                  transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
                  <div style={{ width: 100, height: 218, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: 'scale(0.385)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      <PhoneMockup>{demo.card_style === 'premium' ? <PremiumPreview data={demo} /> : <CardPreview data={demo} compact />}</PhoneMockup>
                    </div>
                  </div>
                </motion.div>
                <p className="mt-1 text-[10px] font-medium text-gray-400 text-center">{demo.business_name}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: three phones */}
          <div className="hidden sm:flex flex-row items-end justify-center gap-10">
            {DEMOS.map((demo, i) => (
              <motion.div key={i} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }} style={{ marginBottom: i === 1 ? 24 : 0 }}>
                <motion.div animate={{ y: [0, i === 1 ? -10 : i === 0 ? -7 : -13, 0] }}
                  transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
                  <div style={{ width: 195, height: 450, position: 'relative' }}>
                    <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', position: 'absolute', top: 0, left: -32 }}>
                      <PhoneMockup>{demo.card_style === 'premium' ? <PremiumPreview data={demo} /> : <CardPreview data={demo} compact />}</PhoneMockup>
                    </div>
                  </div>
                </motion.div>
                <p className="mt-3 text-xs font-medium text-gray-400 text-center">{demo.business_name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5BC4C8' }}>תהליך</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              שלושה צעדים.<br />
              <span className="text-gray-400 font-medium">לינק מוכן.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'כותבים את הפרטים', desc: 'שם, מה אתה עושה, מספר טלפון. זה הכל. 60 שניות.' },
              { num: '02', title: 'מעלים תמונה', desc: 'תמונה שלך או של העבודה. העמוד נראה מקצועי אוטומטית.' },
              { num: '03', title: 'שולחים ומתחילים לקבל', desc: 'לינק אישי מוכן. שמים בביו, שולחים בוואטסאפ, מקבלים פניות.' },
            ].map((s, i) => (
              <motion.div key={i} className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <span className="font-black text-5xl" style={{ color: '#f0fbfb', WebkitTextStroke: '2px #b2e8ea' }}>{s.num}</span>
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-20 px-5" style={{ background: '#f8fafc' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { val: '500+', label: 'עסקים פעילים', sub: 'ספרים, מאמנים, צלמים ועוד' },
              { val: '₪0', label: 'עלות להתחלה', sub: 'חינם לתמיד לבסיסי' },
              { val: '2 דק׳', label: 'עד שיש לינק חי', sub: 'ממלאים ומקבלים' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <p className="font-black text-gray-900 leading-none mb-1" style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}>{s.val}</p>
                <p className="font-bold text-gray-700 text-sm mb-1">{s.label}</p>
                <p className="text-gray-400 text-xs">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-5 bg-white">
        <motion.div className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            <LogoMark size={24} color="white" />
          </div>

          <h2 className="font-black text-gray-900 leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
            תתחיל למכור תוך דקות.
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed" style={{ fontSize: 16 }}>
            לינק מקצועי לעסק שלך — מוכן, נקי, ועובד.<br />
            בלי קוד. בלי עיצוב. בלי כרטיס אשראי.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white text-sm"
              style={{ background: '#5BC4C8', boxShadow: '0 8px 32px rgba(91,196,200,0.4)' }}>
              בנה את הלינק שלך — בחינם
            </motion.button>
            <button onClick={() => navigate('/store-builder')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              נסה בונה חנות
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בטא</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0A0A' }} className="py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <LogoMark size={16} color="white" />
              </div>
              <span className="font-black text-white text-sm">Vizzit</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <a href="/privacy" className="hover:text-gray-400 transition-colors">פרטיות</a>
              <a href="/terms" className="hover:text-gray-400 transition-colors">תנאי שימוש</a>
              <button onClick={() => setAuthOpen(true)} className="hover:text-gray-400 transition-colors">צור קשר</button>
            </div>
            <p className="text-gray-700 text-xs">© 2025 Vizzit</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}
