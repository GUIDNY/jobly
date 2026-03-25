import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import BgStylePicker from '../components/BgStylePicker';
import { saveDraft, uploadCardImage, toSlug, checkSlugAvailable, suggestSlugs } from '../lib/cardsApi';

const DEFAULTS = {
  business_name: '',
  description: '',
  phone: '',
  avatar_url: '',
  template: 1,
  primary_color: '#4F46E5',
  background_style: 'gradient',
  whatsapp_message: 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
  card_services: [],
};

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#16A34A', '#0284C7', '#EA580C', '#0F172A'];

// Demo data for the preview section
const DEMOS = [
  {
    business_name: 'המספרה של אבי',
    description: 'תספורות גבר ועיצוב זקן — קביעת תור תוך שניות',
    phone: '0501234567',
    primary_color: '#0F172A',
    template: 1,
    card_services: [
      { title: 'תספורת גבר', description: '₪60 · 30 דקות' },
      { title: 'עיצוב זקן', description: '₪40 · 20 דקות' },
    ],
    instagram: 'avi.barber',
  },
  {
    business_name: 'נגה נייל ארט',
    description: 'עיצוב ציפורניים מקצועי — כל הסגנונות, כל הגוונים',
    phone: '0521234567',
    primary_color: '#DB2777',
    template: 1,
    card_services: [
      { title: 'ג׳ל מלא', description: '₪120 · 60 דקות' },
      { title: 'עיצוב ארט', description: '₪150 · 75 דקות' },
    ],
    instagram: 'noga.nails',
  },
  {
    business_name: 'גיל מאמן כושר',
    description: 'אימון אישי — שינוי אמיתי, תוצאות מדידות',
    phone: '0531234567',
    primary_color: '#16A34A',
    template: 1,
    card_services: [
      { title: 'אימון אישי', description: '₪180 · 60 דקות' },
      { title: 'תוכנית תזונה', description: '₪300 · חד פעמי' },
    ],
    instagram: 'gil.fit',
  },
];

const TESTIMONIALS = [
  { name: 'אבי כהן', role: 'ספר', location: 'תל אביב', text: 'תוך 3 דקות הייתה לי כתובת שלחתי ללקוחות. אלופים.', stars: 5 },
  { name: 'נגה לוי', role: 'קוסמטיקאית', location: 'רמת גן', text: 'הלקוחות שלי פשוט לוחצות על WhatsApp ישר מהכרטיס. מושלם.', stars: 5 },
  { name: 'גיל שמעון', role: 'מאמן כושר', location: 'הרצליה', text: 'שמתי את הקישור בביו של האינסטגרם ותוך יום קיבלתי 4 פניות.', stars: 5 },
  { name: 'מיכל ברק', role: 'מאפרת', location: 'חולון', text: 'ניסיתי לבנות אתר ב-Wix — שעות. פה? 5 דקות. אין מה לדבר.', stars: 5 },
  { name: 'דוד אזולאי', role: 'אינסטלטור', location: 'פתח תקווה', text: 'עכשיו יש לי קישור שאני שולח לכל לקוח חדש. נראה מקצועי.', stars: 5 },
];

const FEATURES = [
  { icon: <WAIcon />, title: 'כפתור WhatsApp מובנה', desc: 'לקוח לוחץ — נפתח WhatsApp עם הודעה מוכנה. אפס חיכוך.' },
  { icon: <LinkIcon />, title: 'כתובת אישית', desc: 'שם-העסק.mycard.co.il — שלח ללקוחות, שים בביו.' },
  { icon: <MobileIcon />, title: 'מותאם לנייד', desc: 'כל לקוח רואה את הדף שלך מושלם בטלפון.' },
  { icon: <ClockIcon />, title: 'מוכן תוך דקות', desc: 'ממלאים שם, תיאור וטלפון — הדף חי ומוכן.' },
  { icon: <StarIcon />, title: 'ללא ידע טכני', desc: 'לא צריך לדעת כלום. פשוט ממלאים ומפרסמים.' },
  { icon: <ServicesIcon />, title: 'רשימת שירותים', desc: 'הצג מה אתה מציע עם תמונות ותיאורים קצרים.' },
];

const USE_CASES = [
  { icon: '💈', title: 'ספרים ומספרות', desc: 'קישור לקביעת תור + WhatsApp ישיר + גלריה' },
  { icon: '💅', title: 'נייל ארט וקוסמטיקה', desc: 'תמונות עבודות + מחירון + זמינות' },
  { icon: '🏋️', title: 'מאמני כושר', desc: 'שירותים + ביו + קישור לתשלום' },
  { icon: '🛠️', title: 'בעלי מקצוע', desc: 'אינסטלטורים, חשמלאים, נגרים — שם + טלפון + מיקום' },
  { icon: '🌿', title: 'טיפוח ובריאות', desc: 'טיפולים, מחירים, זימון' },
  { icon: '🐾', title: 'שירותי בעלי חיים', desc: 'מטפחים, מאלפים, וטרינרים' },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULTS);
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle');
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [demoIndex, setDemoIndex] = useState(0);

  const fileInputRef = useRef(null);
  const slugTimer = useRef(null);
  const heroRef = useRef(null);

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

  // Auto-rotate demo
  useEffect(() => {
    const t = setInterval(() => setDemoIndex(i => (i + 1) % DEMOS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update('avatar_url', URL.createObjectURL(file));
    if (user) {
      try { setUploadingImg(true); const url = await uploadCardImage(user.id, file); update('avatar_url', url); }
      catch (err) { console.error(err); }
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

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#fafbff' }} dir="rtl">

      {/* ═══════════════════════════════════════════════════════ NAV */}
      <nav className="sticky top-0 z-40 border-b border-slate-100/80" style={{ background: 'rgba(250,251,255,0.94)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>M</div>
            <span className="font-black text-gray-900 text-xl tracking-tight">MyCard</span>
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-600" style={{ background: '#ede9fe' }}>בטא</span>
          </div>
          <div className="flex items-center gap-1">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">הדפים שלי</button>
            ) : (
              <>
                <button onClick={() => setAuthOpen(true)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">התחבר</button>
                <button onClick={handleCTA} className="text-sm font-bold text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>התחל בחינם</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ paddingTop: 72, paddingBottom: 80 }}>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-6xl mx-auto px-5">
          {/* Mobile headline */}
          <motion.div className="md:hidden text-center mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Pill>⚡ בנה עכשיו — ראה חי מיד</Pill>
            <h1 className="text-[32px] font-black text-gray-900 leading-[1.15] mt-4 tracking-tight">
              בנה אתר לעסק שלך<br />
              <GradientText>תוך דקה</GradientText>
            </h1>
            <p className="text-gray-500 text-[15px] mt-3 leading-relaxed">
              לקוחות נכנסים, לוחצים על WhatsApp וקובעים תור
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">
            {/* Form column */}
            <motion.div className="w-full md:flex-1 order-2 md:order-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
              <div className="hidden md:block mb-8">
                <Pill>⚡ בנה עכשיו — ראה חי מיד</Pill>
                <h1 className="text-[52px] font-black text-gray-900 leading-[1.1] mt-5 tracking-tight">
                  בנה אתר<br />לעסק שלך<br /><GradientText>תוך דקה</GradientText>
                </h1>
                <p className="text-gray-500 text-xl mt-4 leading-relaxed max-w-sm">
                  לקוחות נכנסים, לוחצים על WhatsApp וקובעים תור
                </p>
              </div>

              {/* Builder card */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Avatar + Name section */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="relative flex-shrink-0 w-[68px] h-[68px] rounded-2xl overflow-hidden group" style={form.avatar_url ? {} : { background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)', border: '2px dashed #a5b4fc' }}>
                      {form.avatar_url ? (
                        <>
                          <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CamIcon />
                          </div>
                          {uploadingImg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Spinner /></div>}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <CamIcon color="#818cf8" size={20} />
                          <span className="text-[10px] text-indigo-400 font-semibold">תמונה</span>
                        </div>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={form.business_name}
                        onChange={e => update('business_name', e.target.value)}
                        placeholder="המספרה של אבי"
                        maxLength={60}
                        className="w-full text-lg font-black text-gray-900 placeholder-gray-300 focus:outline-none border-b-2 border-transparent focus:border-indigo-300 transition-colors pb-1 bg-transparent"
                      />
                      <input
                        type="text"
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                        placeholder="תיאור קצר של העסק..."
                        maxLength={100}
                        className="w-full text-sm text-gray-500 placeholder-gray-300 focus:outline-none mt-1 bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="text-base leading-none">🇮🇱</span>
                      <div className="w-px h-4 bg-gray-200" />
                    </div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="050-000-0000"
                      dir="ltr"
                      className="w-full border border-gray-200 rounded-2xl pr-14 pl-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                    />
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-400 ml-1">צבע:</span>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => update('primary_color', c)}
                        className="w-7 h-7 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ background: c, boxShadow: form.primary_color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none', transform: form.primary_color === c ? 'scale(1.18)' : '' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Slug block */}
                <div className="border-t border-gray-50 px-5 py-3.5 flex items-center justify-between gap-3" style={{ background: '#fafafa' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    <span className="text-xs font-mono text-gray-700 truncate">
                      <span className="text-gray-400">mycard.co.il/</span>
                      <motion.span key={slugDisplay} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-bold text-indigo-600">{slugDisplay}</motion.span>
                    </span>
                  </div>
                  {slugStatus === 'checking' && <SmallSpinner />}
                  {slugStatus === 'available' && <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">זמין ✓</span>}
                  {slugStatus === 'taken' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">תפוס</span>
                      {slugSuggestions[0] && <button onClick={() => {}} className="text-[11px] text-indigo-500 font-mono hover:underline">{slugSuggestions[0]}</button>}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <motion.button onClick={handleCTA} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl text-white font-black text-lg mt-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', boxShadow: '0 14px 36px -6px rgba(79,70,229,0.45)' }}
              >
                {form.business_name ? `פרסם את "${form.business_name}" עכשיו →` : 'צור לי אתר עכשיו →'}
              </motion.button>

              <div className="flex items-center justify-center gap-5 mt-3">
                {['✓ ללא כרטיס אשראי', '⚡ מוכן תוך 2 דקות', '📱 מותאם לנייד'].map((t, i) => (
                  <span key={i} className="text-xs text-gray-400 font-medium">{t}</span>
                ))}
              </div>
            </motion.div>

            {/* Phone column */}
            <motion.div className="flex-shrink-0 flex flex-col items-center order-1 md:order-2 w-full md:w-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-400">תצוגה מקדימה — חיה</span>
              </div>
              <PhoneMockup><CardPreview data={form} compact /></PhoneMockup>
              {/* Browser bar */}
              <div className="mt-3 w-[260px] bg-white rounded-2xl border border-gray-200 px-3 py-2.5 flex items-center gap-2" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex gap-1 flex-shrink-0">
                  {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                </div>
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 min-w-0">
                  <motion.p key={slugDisplay} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-xs font-mono text-gray-500 truncate text-left">
                    {slugDisplay}.mycard.co.il
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ SOCIAL PROOF */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            אלפי עסקים כבר משתמשים ב-MyCard
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <motion.div key={i} className="bg-slate-50 rounded-2xl p-5 border border-gray-100"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Business names strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {['💈 המספרה של אבי', '💅 נגה נייל', '🏋️ גיל פיטנס', '🌿 ספא לילה', '🛠️ דוד אינסטלציה', '🍕 פיצה ירון', '🐾 מספרת כלבים'].map((b, i) => (
              <span key={i} className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader pill="איך זה עובד" title="שלושה צעדים. דף מוכן." sub="מהרישום ועד הפרסום — פחות מ-2 דקות" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 relative">
            {/* Connector line — desktop */}
            <div className="hidden md:block absolute top-10 right-[16.66%] left-[16.66%] h-px" style={{ background: 'linear-gradient(90deg, #e0e7ff, #c7d2fe, #e0e7ff)' }} />

            {[
              { num: '01', icon: '✏️', title: 'ממלאים פרטים בסיסיים', desc: 'שם עסק, תיאור קצר, מספר טלפון ותמונה. לוקח פחות מדקה.' },
              { num: '02', icon: '📱', title: 'רואים מיד את הדף בנייד', desc: 'כל שינוי מתעדכן חי בטלפון. רואים בדיוק מה הלקוח יראה.' },
              { num: '03', icon: '🚀', title: 'מפרסמים ומשתפים לינק', desc: 'לוחצים פרסם. מקבלים כתובת אישית. שולחים ללקוחות.' },
            ].map((step, i) => (
              <motion.div key={i} className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-5 relative z-10"
                  style={{ background: 'white', boxShadow: '0 8px 32px -8px rgba(79,70,229,0.15), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8e4ff' }}>
                  {step.icon}
                </div>
                <span className="text-xs font-black text-indigo-300 tracking-widest mb-2">{step.num}</span>
                <h3 className="text-base font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ LIVE PREVIEW */}
      <section className="py-24 px-5" style={{ background: 'linear-gradient(160deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            pill="תצוגה מקדימה"
            title="נראה מקצועי. עובד לכל עסק."
            sub="ספרים, קוסמטיקאיות, מאמנים — MyCard מתאים לכולם"
            light
          />

          <div className="flex flex-wrap justify-center gap-8 mt-14 items-start">
            {DEMOS.map((demo, i) => (
              <motion.div key={i} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ transform: i === 1 ? 'translateY(-16px)' : '' }}
              >
                <PhoneMockup className="transform scale-[0.88]">
                  <CardPreview data={demo} compact />
                </PhoneMockup>
                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-white/80">{demo.business_name}</p>
                  <p className="text-xs text-white/40 font-mono mt-0.5">{toSlug(demo.business_name)}.mycard.co.il</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ FEATURES */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeader pill="יכולות" title="כל מה שעסק קטן צריך" sub="בלי להכניע. בלי לבלבל. רק מה שעובד." />

          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-14"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-slate-50 rounded-3xl p-5 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:scale-110 transform"
                  style={{ background: 'white', boxShadow: '0 4px 16px -4px rgba(79,70,229,0.12)', border: '1px solid #e8e4ff' }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ DOMAIN */}
      <section className="py-24 px-5" style={{ background: 'linear-gradient(160deg,#f8f9ff 0%,#f0f0ff 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text */}
            <motion.div className="flex-1 md:order-2" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Pill>כתובת אישית</Pill>
              <h2 className="text-4xl font-black text-gray-900 mt-5 leading-tight tracking-tight">
                האתר שלך,<br />עם כתובת משלך
              </h2>
              <p className="text-gray-500 text-lg mt-4 leading-relaxed">
                שלח ללקוחות, שים בביו של האינסטגרם, והתחל לקבל פניות
              </p>
              <div className="mt-6 space-y-3">
                {['שם שנוח לזכור ולשתף', 'עובד גם ב-WhatsApp וגם ב-SMS', 'קישור קצר למסמכים ועלונים'].map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#4F46E5' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Domain display */}
            <motion.div className="flex-shrink-0 md:order-1" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: '0 20px 60px -12px rgba(79,70,229,0.2)', border: '1px solid #e0e7ff' }}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>

                {/* Animated domain examples */}
                <div className="space-y-2.5">
                  {['avibarber', 'noga-nails', 'gil-fitness'].map((d, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-sm font-mono text-gray-700 text-left" dir="ltr">
                        <span className="font-bold text-indigo-600">{d}</span>
                        <span className="text-gray-400">.mycard.co.il</span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-4 font-medium">הכתובת שלך מוכנה תוך שניות</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ USE CASES */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeader pill="למי זה מתאים" title="לכל עסק קטן בישראל" sub="מספרות ועד מאמנים — MyCard עובד לכולם" />

          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-white rounded-3xl p-5 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all cursor-default"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="text-3xl mb-3">{uc.icon}</div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{uc.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ MORE TESTIMONIALS */}
      <section className="py-16 px-5 bg-slate-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TESTIMONIALS.slice(3).map((t, i) => (
              <motion.div key={i} className="bg-white rounded-2xl p-5 border border-gray-100"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, s) => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>{t.name[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ FINAL CTA */}
      <section className="py-28 px-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#4F46E5 50%,#7C3AED 100%)' }}>
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#818cf8,transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#a78bfa,transparent)', transform: 'translate(-30%,30%)' }} />
        </div>

        <motion.div className="max-w-2xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            ללא כרטיס אשראי · חינמי לחלוטין
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
            מוכן להתחיל?
          </h2>
          <p className="text-white/70 text-xl mb-10 leading-relaxed">
            תוך 2 דקות יהיה לך אתר מקצועי שלקוחות יכולים לפנות אליך ישירות
          </p>

          <motion.button onClick={handleCTA} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 bg-white text-indigo-700 font-black text-xl px-10 py-5 rounded-2xl shadow-2xl transition-all hover:shadow-white/20"
            style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.4)' }}
          >
            צור לי אתר עכשיו
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </motion.button>

          <div className="flex items-center justify-center gap-6 mt-6">
            {['✓ חינמי', '⚡ 2 דקות', '📱 מותאם לנייד', '🔗 כתובת אישית'].map((t, i) => (
              <span key={i} className="text-sm text-white/50 font-medium">{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════ FOOTER */}
      <footer className="bg-gray-900 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>M</div>
            <span className="font-black text-white text-lg">MyCard</span>
          </div>
          <p className="text-gray-500 text-sm text-center">כרטיס ביקור דיגיטלי לבעלי עסקים ישראלים</p>
          <p className="text-gray-600 text-xs">© 2025 MyCard · כל הזכויות שמורות</p>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Pill({ children }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-100" style={{ background: '#ede9fe' }}>
      {children}
    </div>
  );
}

function GradientText({ children }) {
  return (
    <span style={{ background: 'linear-gradient(120deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {children}
    </span>
  );
}

function SectionHeader({ pill, title, sub, light = false }) {
  return (
    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      {light ? (
        <div className="inline-flex items-center gap-1.5 text-white/60 text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 mb-5">{pill}</div>
      ) : (
        <div className="mb-5"><Pill>{pill}</Pill></div>
      )}
      <h2 className={`text-4xl font-black leading-tight tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {sub && <p className={`text-lg mt-3 max-w-md mx-auto leading-relaxed ${light ? 'text-white/60' : 'text-gray-500'}`}>{sub}</p>}
    </motion.div>
  );
}

// ─── Feature Icons ────────────────────────────────────────────────────────────
function WAIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
function LinkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
}
function MobileIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function StarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#4F46E5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
}
function ServicesIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}

// ─── Utility Icons ────────────────────────────────────────────────────────────
function CamIcon({ color = 'white', size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function Spinner() {
  return <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}
function SmallSpinner() {
  return <svg className="animate-spin w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}
