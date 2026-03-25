import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import { saveDraft, uploadCardImage, toSlug, checkSlugAvailable, suggestSlugs } from '../lib/cardsApi';

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

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#16A34A', '#0284C7', '#EA580C', '#0F172A'];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULTS);
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  const fileInputRef = useRef(null);
  const slugTimer = useRef(null);

  const update = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Auto-generate slug from business name
  useEffect(() => {
    const generated = toSlug(form.business_name);
    setSlug(generated);
    if (!generated) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      const ok = await checkSlugAvailable(generated);
      setSlugStatus(ok ? 'available' : 'taken');
      if (!ok) {
        const alts = await suggestSlugs(generated);
        setSlugSuggestions(alts);
      } else {
        setSlugSuggestions([]);
      }
    }, 700);
  }, [form.business_name]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update('avatar_url', URL.createObjectURL(file));
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
  };

  const handleCTA = () => {
    saveDraft({ ...form, slug });
    if (user) navigate('/builder');
    else setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    saveDraft({ ...form, slug });
    navigate('/builder');
  };

  const slugDisplay = slug || 'שם-העסק';
  const hasName = form.business_name.trim().length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fafbff 0%, #f8f9ff 50%, #fafaff 100%)' }} dir="rtl">

      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-slate-100/80" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
            >
              M
            </div>
            <span className="font-black text-gray-900 text-xl tracking-tight">MyCard</span>
            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full text-indigo-600" style={{ background: '#ede9fe' }}>בטא</span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-1">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50"
              >
                הדפים שלי
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-4 py-2 rounded-xl hover:bg-gray-50"
                >
                  התחבר
                </button>
                <button
                  onClick={handleCTA}
                  className="text-sm font-semibold text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:shadow-md"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  התחל בחינם
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pt-10 pb-20">

        {/* Mobile hero */}
        <motion.div
          className="md:hidden text-center mb-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            בנה עכשיו — ראה חי ממש עכשיו
          </div>
          <h1 className="text-[28px] font-black text-gray-900 leading-[1.2] tracking-tight">
            האתר שלך מוכן<br />
            <span style={{ background: 'linear-gradient(120deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              תוך 2 דקות
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-2.5 leading-relaxed">
            מלא את הפרטים — ראה את הדף שלך חי בטלפון
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">

          {/* ── Right column: Builder ────────────────────────── */}
          <motion.div
            className="w-full md:flex-1 order-2 md:order-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Desktop hero */}
            <div className="hidden md:block mb-8">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-indigo-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                בנה עכשיו — ראה חי ממש עכשיו
              </div>
              <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                הכרטיס הדיגיטלי<br />
                <span style={{ background: 'linear-gradient(120deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  של העסק שלך
                </span>
              </h1>
              <p className="text-gray-500 text-lg mt-4 leading-relaxed max-w-sm">
                בנה דף עסקי מקצועי, קבל קישור אישי, ושתף עם לקוחות — הכל תוך דקות.
              </p>
            </div>

            {/* Builder card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100/80" style={{ boxShadow: '0 4px 32px -4px rgba(0,0,0,0.08), 0 1px 8px rgba(0,0,0,0.04)' }}>

              {/* Section: Identity */}
              <BuilderSection
                icon={<UserCircleIcon />}
                title="הזהות שלך"
                active={activeSection === 'identity'}
                onToggle={() => setActiveSection(activeSection === 'identity' ? null : 'identity')}
                preview={form.business_name ? form.business_name : null}
                always
              >
                <div className="space-y-4 pt-1">
                  {/* Avatar upload */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex-shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden group"
                      style={form.avatar_url ? {} : { background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', border: '2px dashed #a5b4fc' }}
                    >
                      {form.avatar_url ? (
                        <>
                          <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CameraIcon />
                          </div>
                          {uploadingImg && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <CameraIcon color="#818cf8" size={22} />
                          <span className="text-[10px] text-indigo-400 font-medium">תמונה</span>
                        </div>
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">לוגו / תמונת עסק</p>
                      <p className="text-xs text-gray-400 mt-0.5">תמונה מקצועית מגבירה אמון</p>
                      {form.avatar_url && (
                        <button onClick={() => update('avatar_url', '')} className="text-xs text-red-400 hover:text-red-500 mt-1">הסר</button>
                      )}
                    </div>
                  </div>

                  {/* Business name */}
                  <LabeledInput
                    label="שם העסק"
                    required
                    icon={<StoreIcon />}
                    value={form.business_name}
                    onChange={v => update('business_name', v)}
                    placeholder="המספרה של אבי"
                    maxLength={60}
                  />

                  {/* Description */}
                  <div>
                    <FieldLabel icon={<TextIcon />} label="תיאור קצר" />
                    <textarea
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      placeholder="קביעת תור תוך דקות — תספורת, צביעה ועוד"
                      rows={2}
                      maxLength={140}
                      className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none transition-all"
                    />
                  </div>
                </div>
              </BuilderSection>

              <Divider />

              {/* Section: Contact */}
              <BuilderSection
                icon={<PhoneRingIcon />}
                title="מספר WhatsApp"
                active={activeSection === 'contact'}
                onToggle={() => setActiveSection(activeSection === 'contact' ? null : 'contact')}
                preview={form.phone ? form.phone : null}
                always
              >
                <div className="pt-1">
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <span className="text-base">🇮🇱</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="050-000-0000"
                      dir="ltr"
                      className="w-full border border-gray-200 rounded-xl pr-[60px] pl-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">הלקוחות ישלחו הודעה ישירה ב-WhatsApp</p>
                </div>
              </BuilderSection>

              <Divider />

              {/* Section: Color */}
              <BuilderSection
                icon={<PaletteIcon />}
                title="צבע ראשי"
                active={activeSection === 'color'}
                onToggle={() => setActiveSection(activeSection === 'color' ? null : 'color')}
                always
                colorDot={form.primary_color}
              >
                <div className="pt-2">
                  <div className="flex gap-2.5 flex-wrap items-center">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => update('primary_color', c)}
                        className="w-9 h-9 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{
                          background: c,
                          boxShadow: form.primary_color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                          transform: form.primary_color === c ? 'scale(1.15)' : '',
                        }}
                      />
                    ))}
                    <label className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-indigo-300 transition-colors">
                      <input type="color" value={form.primary_color} onChange={e => update('primary_color', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    </label>
                  </div>
                </div>
              </BuilderSection>
            </div>

            {/* URL Preview block */}
            <AnimatePresence>
              {(hasName || slug) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-3 rounded-2xl border overflow-hidden"
                  style={{
                    background: slugStatus === 'available' ? '#f0fdf4' : slugStatus === 'taken' ? '#fff7ed' : '#f8faff',
                    borderColor: slugStatus === 'available' ? '#86efac' : slugStatus === 'taken' ? '#fed7aa' : '#e0e7ff',
                  }}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium">האתר שלך יהיה כאן</p>
                          <motion.p
                            key={slugDisplay}
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: 1 }}
                            className="text-sm font-bold text-gray-900 font-mono truncate"
                          >
                            {slugDisplay}<span className="text-indigo-400">.mycard.co.il</span>
                          </motion.p>
                        </div>
                      </div>
                      {slugStatus === 'checking' && <SmallSpinner />}
                      {slugStatus === 'available' && (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">זמין ✓</span>
                      )}
                      {slugStatus === 'taken' && (
                        <span className="text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">תפוס</span>
                      )}
                    </div>
                    {slugStatus === 'taken' && slugSuggestions.length > 0 && (
                      <div className="mt-2.5 flex gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">הצעות:</span>
                        {slugSuggestions.map(s => (
                          <button key={s} className="text-xs text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full font-mono transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl text-white font-black text-base mt-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                boxShadow: '0 12px 32px -6px rgba(79,70,229,0.45)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {hasName ? `פרסם את "${form.business_name}"` : 'צור את הדף שלי עכשיו'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </motion.button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 mt-3">
              {[
                { icon: '✓', text: 'חינמי לחלוטין' },
                { icon: '⚡', text: 'מוכן תוך 2 דקות' },
                { icon: '📱', text: 'מותאם לנייד' },
              ].map((t, i) => (
                <span key={i} className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <span>{t.icon}</span>{t.text}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Left column: Phone Preview ──────────────────── */}
          <motion.div
            className="flex-shrink-0 flex flex-col items-center order-1 md:order-2 w-full md:w-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-500">תצוגה מקדימה — חיה</span>
            </div>

            <PhoneMockup>
              <CardPreview data={form} compact />
            </PhoneMockup>

            {/* Browser bar below phone */}
            <motion.div
              className="mt-4 w-[260px] bg-white rounded-2xl border border-gray-200 px-3 py-2.5 flex items-center gap-2"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="flex gap-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 min-w-0">
                <motion.p
                  key={slugDisplay}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono text-gray-500 truncate text-left"
                >
                  {slugDisplay}.mycard.co.il
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Social proof strip ───────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-xs text-gray-400 font-medium mb-4 uppercase tracking-widest">מתאים לכל עסק</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {[
              { icon: '💈', name: 'מספרות' },
              { icon: '💅', name: 'נייל ארט' },
              { icon: '🏋️', name: 'כושר' },
              { icon: '🍕', name: 'מסעדות' },
              { icon: '🛠️', name: 'אינסטלטורים' },
              { icon: '🌿', name: 'טיפוח' },
              { icon: '🐾', name: 'בעלי חיים' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <span>{c.icon}</span>
                <span className="font-medium hidden sm:inline">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BuilderSection({ icon, title, children, always, preview, colorDot }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f0ff' }}>
          {icon}
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-gray-800">{title}</span>
          {preview && (
            <span className="text-xs text-gray-400 truncate hidden sm:inline">{preview}</span>
          )}
          {colorDot && (
            <span className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ background: colorDot }} />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-50 mx-5" />;
}

function LabeledInput({ label, icon, value, onChange, placeholder, required, maxLength }) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} required={required} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
      />
    </div>
  );
}

function FieldLabel({ icon, label, required }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      {required && <span className="text-red-400 text-xs">*</span>}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function UserCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function PhoneRingIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>;
}
function PaletteIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
}
function StoreIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function TextIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
}
function CameraIcon({ color = 'white', size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function Spinner() {
  return <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}
function SmallSpinner() {
  return <svg className="animate-spin w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}
