import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import {
  loadDraft, clearDraft, toSlug, checkSlugAvailable, suggestSlugs,
  createCard, updateCard, uploadCardImage, getCardById,
} from '../lib/cardsApi';
import BgStylePicker from '../components/BgStylePicker';

const STEPS = [
  { id: 1, label: 'פרטים בסיסיים' },
  { id: 2, label: 'שירותים' },
  { id: 3, label: 'קשר וקישורים' },
  { id: 4, label: 'עיצוב ופרסום' },
];

const DEFAULT_CARD = {
  business_name: '', description: '', phone: '', avatar_url: '',
  whatsapp_message: 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
  instagram: '', facebook: '', tiktok: '', location_url: '', booking_url: '',
  template: 1, primary_color: '#4F46E5', background_style: 'gradient',
  services: [],
  slug: '',
};

export default function BuilderPage() {
  const { cardId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_CARD);
  const [dbCardId, setDbCardId] = useState(cardId || null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(!!cardId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const slugCheckTimer = useRef(null);

  // Require auth
  useEffect(() => {
    if (!user) setAuthOpen(true);
  }, [user]);

  // Load existing card or draft
  useEffect(() => {
    if (!user) return;
    if (cardId) {
      getCardById(cardId)
        .then(card => {
          const { card_services, ...rest } = card;
          setForm({
            ...DEFAULT_CARD, ...rest,
            services: card_services?.map(s => ({ title: s.title, description: s.description, image_url: s.image_url })) || [],
          });
          setDbCardId(card.id);
          setPublished(card.is_published);
        })
        .catch(() => navigate('/dashboard'))
        .finally(() => setLoading(false));
    } else {
      const draft = loadDraft();
      if (draft) {
        setForm(prev => ({
          ...prev,
          ...draft,
          slug: draft.slug || toSlug(draft.business_name),
          services: draft.services || [],
        }));
      }
      setLoading(false);
    }
  }, [user, cardId, navigate]);

  // Auto-generate slug from business name
  useEffect(() => {
    if (!form.business_name || dbCardId) return;
    const generated = toSlug(form.business_name);
    if (generated && generated !== form.slug) {
      setForm(prev => ({ ...prev, slug: generated }));
    }
  }, [form.business_name]);

  // Slug availability check with debounce
  useEffect(() => {
    if (!form.slug || form.slug.length < 2) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(async () => {
      const available = await checkSlugAvailable(form.slug, dbCardId);
      setSlugStatus(available ? 'available' : 'taken');
      if (!available) {
        const suggestions = await suggestSlugs(form.slug);
        setSlugSuggestions(suggestions);
      } else {
        setSlugSuggestions([]);
      }
    }, 600);
  }, [form.slug, dbCardId]);

  const update = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!form.business_name.trim()) return;

    setSaving(true);
    try {
      const payload = { ...form, services: form.services };
      if (dbCardId) {
        await updateCard(dbCardId, payload);
      } else {
        if (slugStatus === 'taken') return;
        const card = await createCard(user.id, payload);
        setDbCardId(card.id);
        clearDraft();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!form.business_name.trim()) return;

    setPublishing(true);
    try {
      const payload = { ...form, is_published: true, services: form.services };
      let card;
      if (dbCardId) {
        card = await updateCard(dbCardId, payload);
      } else {
        if (slugStatus === 'taken') return;
        card = await createCard(user.id, { ...payload, is_published: true });
        setDbCardId(card.id);
        clearDraft();
      }
      setPublished(true);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setPublishing(false);
    }
  };

  const previewData = {
    ...form,
    card_services: form.services || [],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 mt-3">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>M</button>
            <span className="font-bold text-gray-900 hidden sm:block">MyCard</span>
            <span className="text-gray-300 hidden sm:block mx-2">/</span>
            <span className="text-sm text-gray-500 hidden sm:block">
              {cardId ? 'עריכת דף' : 'יצירת דף חדש'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 sm:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              תצוגה
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hidden sm:block"
            >
              הדפים שלי
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              {saving ? 'שומר...' : 'שמור טיוטה'}
            </button>
          </div>
        </div>
      </nav>

      {/* Steps indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto py-3 gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setStep(s.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={
                      step === s.id
                        ? { background: '#4F46E5', color: 'white' }
                        : step > s.id
                        ? { background: '#10B981', color: 'white' }
                        : { background: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: step === s.id ? '#4F46E5' : step > s.id ? '#10B981' : '#9ca3af' }}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="w-6 h-px bg-gray-200 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-8">
        {/* Form */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1 form={form} update={update} slugStatus={slugStatus} slugSuggestions={slugSuggestions} dbCardId={dbCardId} />}
              {step === 2 && <Step2 form={form} update={update} userId={user?.id} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} onPublish={handlePublish} publishing={publishing} published={published} slug={form.slug} />}
            </motion.div>
          </AnimatePresence>

          {/* Step nav buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              הקודם
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(s => Math.min(4, s + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                הבא
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing || published}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70"
                style={{ background: published ? '#10B981' : 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                {publishing ? 'מפרסם...' : published ? '✓ פורסם!' : 'פרסם עכשיו'}
              </button>
            )}
          </div>
        </div>

        {/* Phone preview - desktop */}
        <div className="hidden md:block flex-shrink-0 sticky top-20 self-start">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium">תצוגה מקדימה</p>
          <PhoneMockup>
            <CardPreview data={previewData} compact />
          </PhoneMockup>
        </div>
      </div>

      {/* Mobile preview modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <PhoneMockup>
                <CardPreview data={previewData} compact />
              </PhoneMockup>
              <button onClick={() => setShowPreview(false)} className="mt-4 w-full py-2 text-white/60 text-sm text-center">
                סגור תצוגה
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={authOpen}
        onClose={() => { setAuthOpen(false); if (!user) navigate('/'); }}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function Step1({ form, update, slugStatus, slugSuggestions, dbCardId }) {
  const fileInputRef = useRef(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const { user } = useAuth();

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update('avatar_url', URL.createObjectURL(file));
    if (user) {
      setUploadingImg(true);
      try {
        const url = await uploadCardImage(user.id, file);
        update('avatar_url', url);
      } finally {
        setUploadingImg(false);
      }
    }
  };

  const slugColors = {
    idle: { border: '#e5e7eb', text: '', icon: null },
    checking: { border: '#e5e7eb', text: 'בודק זמינות...', icon: null },
    available: { border: '#10b981', text: 'זמין! ✓', icon: '✓' },
    taken: { border: '#ef4444', text: 'כבר תפוס', icon: '✗' },
  };
  const sc = slugColors[slugStatus];

  return (
    <div className="bg-white rounded-3xl p-6 card-shadow space-y-5">
      <h2 className="text-lg font-bold text-gray-900">פרטים בסיסיים</h2>

      {/* Profile image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">תמונת פרופיל</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex-shrink-0"
          >
            {form.avatar_url ? (
              <>
                <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                {uploadingImg && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span className="text-xs text-gray-400">העלה תמונה</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <div>
            <p className="text-sm text-gray-600">העלה לוגו או תמונת עסק</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP · עד 5MB</p>
            {form.avatar_url && (
              <button onClick={() => update('avatar_url', '')} className="text-xs text-red-400 mt-1 hover:text-red-500">הסר תמונה</button>
            )}
          </div>
        </div>
      </div>

      {/* Business name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">שם העסק *</label>
        <input
          type="text"
          value={form.business_name}
          onChange={e => update('business_name', e.target.value)}
          placeholder="המספרה של אבי"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
          maxLength={60}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור קצר</label>
        <textarea
          value={form.description}
          onChange={e => update('description', e.target.value)}
          placeholder="קביעת תור תוך דקות — תספורת, צביעה ועוד"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
          maxLength={160}
        />
        <p className="text-xs text-gray-400 mt-1 text-left">{form.description.length}/160</p>
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          כתובת הדף שלך
        </label>
        <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-4 py-3" style={{ borderColor: sc.border }}>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">mycard.co.il/</span>
          <input
            type="text"
            value={form.slug}
            onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'))}
            placeholder="shem-haesek"
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            dir="ltr"
            disabled={dbCardId && form.is_published}
          />
          {slugStatus !== 'idle' && (
            <span className="text-xs flex-shrink-0" style={{ color: slugStatus === 'available' ? '#10b981' : slugStatus === 'taken' ? '#ef4444' : '#9ca3af' }}>
              {sc.text}
            </span>
          )}
        </div>
        {slugSuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">הצעות חלופיות:</p>
            <div className="flex flex-wrap gap-2">
              {slugSuggestions.map(s => (
                <button key={s} onClick={() => update('slug', s)}
                  className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Services ─────────────────────────────────────────────────────────
function Step2({ form, update, userId }) {
  const fileRefs = useRef({});

  const addService = () => {
    if (form.services.length >= 5) return;
    update('services', [...form.services, { title: '', description: '', image_url: '' }]);
  };

  const updateService = (i, field, value) => {
    const next = [...form.services];
    next[i] = { ...next[i], [field]: value };
    update('services', next);
  };

  const removeService = (i) => {
    update('services', form.services.filter((_, idx) => idx !== i));
  };

  const handleServiceImage = async (i, file) => {
    if (!file) return;
    updateService(i, 'image_url', URL.createObjectURL(file));
    if (userId) {
      try {
        const url = await uploadCardImage(userId, file);
        updateService(i, 'image_url', url);
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">השירותים שלך</h2>
        <span className="text-xs text-gray-400">{form.services.length}/5 שירותים</span>
      </div>
      <p className="text-sm text-gray-500">הוסף עד 5 שירותים שאתה מציע</p>

      <AnimatePresence>
        {form.services.map((svc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">שירות {i + 1}</span>
              <button onClick={() => removeService(i)} className="text-gray-400 hover:text-red-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              </button>
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                value={svc.title}
                onChange={e => updateService(i, 'title', e.target.value)}
                placeholder="שם השירות (למשל: תספורת גבר)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                maxLength={50}
              />
              <textarea
                value={svc.description}
                onChange={e => updateService(i, 'description', e.target.value)}
                placeholder="תיאור קצר (אופציונלי)"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white resize-none"
                maxLength={100}
              />
              {/* Service image */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRefs.current[i]?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  {svc.image_url ? (
                    <img src={svc.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                  {svc.image_url ? 'שנה תמונה' : 'הוסף תמונה'}
                </button>
                <input
                  ref={el => fileRefs.current[i] = el}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => handleServiceImage(i, e.target.files?.[0])}
                />
                {svc.image_url && (
                  <button onClick={() => updateService(i, 'image_url', '')} className="text-xs text-red-400">הסר</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {form.services.length < 5 && (
        <button
          onClick={addService}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          הוסף שירות
        </button>
      )}
    </div>
  );
}

// ─── Step 3: Contact & Links ──────────────────────────────────────────────────
function Step3({ form, update }) {
  return (
    <div className="bg-white rounded-3xl p-6 card-shadow space-y-5">
      <h2 className="text-lg font-bold text-gray-900">יצירת קשר וקישורים</h2>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">מספר טלפון / WhatsApp *</label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">🇮🇱</span>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
            placeholder="050-000-0000"
            className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            dir="ltr"
          />
        </div>
      </div>

      {/* WhatsApp message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">הודעת WhatsApp מוכנה</label>
        <textarea
          value={form.whatsapp_message}
          onChange={e => update('whatsapp_message', e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none"
          maxLength={200}
        />
        <p className="text-xs text-gray-400 mt-1">זו ההודעה שתישלח אוטומטית כשלוחצים על כפתור WhatsApp</p>
      </div>

      {/* Booking URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span>🗓️</span> קישור לקביעת תור
          </span>
        </label>
        <input
          type="url"
          value={form.booking_url}
          onChange={e => update('booking_url', e.target.value)}
          placeholder="https://calendly.com/..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
          dir="ltr"
        />
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Instagram */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5"><span>📸</span> Instagram</span>
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={e => update('instagram', e.target.value.replace('@', ''))}
            placeholder="username"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            dir="ltr"
          />
        </div>

        {/* Facebook */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5"><span>👍</span> Facebook</span>
          </label>
          <input
            type="text"
            value={form.facebook}
            onChange={e => update('facebook', e.target.value)}
            placeholder="username or URL"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            dir="ltr"
          />
        </div>

        {/* TikTok */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5"><span>🎵</span> TikTok</span>
          </label>
          <input
            type="text"
            value={form.tiktok}
            onChange={e => update('tiktok', e.target.value.replace('@', ''))}
            placeholder="username"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            dir="ltr"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5"><span>📍</span> Google Maps</span>
          </label>
          <input
            type="url"
            value={form.location_url}
            onChange={e => update('location_url', e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Design & Publish ─────────────────────────────────────────────────
const TEMPLATES = [
  { id: 1, name: 'כותרת גרדיאנט', desc: 'קלאסי ומרשים' },
  { id: 2, name: 'תמונה מלאה', desc: 'ויזואלי ומקצועי' },
  { id: 3, name: 'מינימליסטי', desc: 'נקי ופשוט' },
];

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#16A34A', '#0284C7', '#0F172A', '#B45309', '#0891B2'];

function Step4({ form, update, onPublish, publishing, published, slug }) {
  return (
    <div className="space-y-4">
      {/* Template selection */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-lg font-bold text-gray-900 mb-4">בחר תבנית</h2>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => update('template', t.id)}
              className="p-3 rounded-2xl border-2 text-center transition-all hover:bg-indigo-50"
              style={form.template === t.id ? { borderColor: '#4F46E5', background: '#eff6ff' } : { borderColor: '#e5e7eb' }}
            >
              <div
                className="w-full h-16 rounded-xl mb-2 flex items-end justify-center overflow-hidden"
                style={
                  t.id === 1 ? { background: `linear-gradient(160deg, ${form.primary_color} 0%, ${form.primary_color}99 100%)` }
                  : t.id === 2 ? { background: `linear-gradient(135deg, ${form.primary_color}33, ${form.primary_color}66)` }
                  : { background: `linear-gradient(160deg, ${form.primary_color}15 0%, #f8fafc 60%)` }
                }
              >
                <div className="bg-white/80 w-full text-center p-1 text-[8px] font-medium text-gray-600">{form.business_name || 'שם העסק'}</div>
              </div>
              <p className="text-xs font-semibold text-gray-700">{t.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-base font-bold text-gray-900 mb-3">צבע ראשי</h2>
        <div className="flex flex-wrap gap-2.5 items-center">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => update('primary_color', color)}
              className="w-9 h-9 rounded-full transition-transform hover:scale-110 flex-shrink-0"
              style={{
                background: color,
                outline: form.primary_color === color ? `3px solid ${color}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
          <label className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors relative">
            <input type="color" value={form.primary_color} onChange={e => update('primary_color', e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: form.primary_color + '15' }}>
          <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: form.primary_color }} />
          <span className="text-sm text-gray-600">הצבע שנבחר: <span className="font-mono text-xs">{form.primary_color}</span></span>
        </div>
      </div>

      {/* Publish */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-base font-bold text-gray-900 mb-2">פרסם את הדף</h2>
        {slug ? (
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-3 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            <span className="text-sm text-indigo-700 font-mono">{slug}.mycard.co.il</span>
          </div>
        ) : (
          <p className="text-sm text-orange-600 bg-orange-50 rounded-xl px-4 py-3 mb-4">הגדר שם עסק וכתובת דף בשלב 1</p>
        )}
        {published ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold text-green-700">הדף שלך פורסם!</p>
            <p className="text-sm text-green-600 mt-1">
              <span className="font-mono">{slug}.mycard.co.il</span>
            </p>
            <a
              href={`/c/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
            >
              פתח את הדף שלי
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        ) : (
          <button
            onClick={onPublish}
            disabled={publishing || !slug}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 8px 24px -4px rgba(79,70,229,0.4)' }}
          >
            {publishing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                מפרסם...
              </span>
            ) : '🚀 פרסם את הדף שלי'}
          </button>
        )}
      </div>
    </div>
  );
}
