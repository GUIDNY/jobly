import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PhoneMockup from '../components/PhoneMockup';
import CardPreview from '../components/CardPreview';
import AuthModal from '../components/AuthModal';
import LogoMark from '../components/LogoMark';
import {
  loadDraft, clearDraft, toSlug, checkSlugAvailable, suggestSlugs,
  createCard, updateCard, uploadCardImage, getCardById,
} from '../lib/cardsApi';
import BgStylePicker from '../components/BgStylePicker';
import PremiumPreview from '../components/PremiumPreview';
import { supabase } from '../lib/supabase';

const STEPS = [
  { id: 1, label: 'פרטים בסיסיים' },
  { id: 2, label: 'שירותים' },
  { id: 3, label: 'קשר וקישורים' },
  { id: 4, label: 'עיצוב ופרסום' },
  { id: 5, label: '✦ פרמיום' },
];

const DEFAULT_CARD = {
  business_name: '', description: '', phone: '', avatar_url: '',
  whatsapp_message: 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
  instagram: '', facebook: '', tiktok: '', location_url: '', booking_url: '',
  template: 1, primary_color: '#4F46E5', background_style: 'gradient',
  services: [], services_layout: 'list',
  title_align: 'center', name_size: 'md',
  slug: '', card_style: 'classic', services_section_title: '', contact_position: 'above',
  faq: [],
  background_video_url: '',
  background_video_position: '50% 30% cover',
  reviews_enabled: false,
  reviews_public: false,
  manual_reviews: [],
};

export default function BuilderPage() {
  const { cardId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_CARD);
  const [dbCardId, setDbCardId] = useState(cardId || null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(!!cardId);
  const [saving, setSaving] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const slugCheckTimer = useRef(null);

  // Require auth — wait for session to load before checking
  useEffect(() => {
    if (!authLoading && !user) setAuthOpen(true);
  }, [user, authLoading]);

  // Load existing card or draft
  useEffect(() => {
    if (!user) return;
    if (cardId) {
      getCardById(cardId)
        .then(card => {
          const { card_services, ...rest } = card;
          setForm({
            ...DEFAULT_CARD, ...rest,
            services: card_services?.map(s => ({ title: s.title, description: s.description, image_url: s.image_url, popup_image_url: s.popup_image_url || '', price: s.price || '', size: s.size || 'full', service_url: s.service_url || '' })) || [],
            services_layout: rest.services_layout || 'list',
            contact_position: rest.contact_position || 'above',
            faq: rest.faq || [],
            background_video_url: rest.background_video_url || '',
          });
          setDbCardId(card.id);
          setIsLive(!!card.is_published);
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

  // visibleSteps order: classic=[1,2,3,4], premium=[1,2,3,5,4]
  const visibleSteps = form.card_style === 'premium'
    ? [STEPS[0], STEPS[1], STEPS[2], STEPS[4], STEPS[3]]
    : [STEPS[0], STEPS[1], STEPS[2], STEPS[3]];

  const currentIdx = visibleSteps.findIndex(s => s.id === step);
  const prevStepId = visibleSteps[currentIdx - 1]?.id ?? null;
  const nextStepId = visibleSteps[currentIdx + 1]?.id ?? null;
  const isLastStep = currentIdx === visibleSteps.length - 1;

  // If user switches to classic while on step 5 (פרמיום), go back to step 3
  useEffect(() => {
    if (form.card_style !== 'premium' && step === 5) setStep(3);
  }, [form.card_style]);

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
    if (!form.business_name.trim()) { setSaveError('נא למלא שם עסק'); return; }
    if (!form.slug || form.slug.length < 2) { setSaveError('כתובת הדף חסרה — מלא שם עסק'); return; }
    if (slugStatus === 'taken') { setSaveError('הכתובת תפוסה — בחר כתובת אחרת'); return; }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const payload = { ...form, services: form.services };
      if (dbCardId) {
        await updateCard(dbCardId, payload);
      } else {
        const card = await createCard(user.id, payload);
        setDbCardId(card.id);
        clearDraft();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err?.message || 'שגיאה בשמירה — נסה שוב');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!form.business_name.trim()) { setPublishError('נא למלא שם עסק'); return; }
    if (!form.slug || form.slug.length < 2) { setPublishError('כתובת הדף חסרה — מלא שם עסק'); return; }
    if (slugStatus === 'taken') { setPublishError('הכתובת תפוסה — בחר כתובת אחרת'); return; }
    if (slugStatus === 'checking') { setPublishError('ממתין לבדיקת זמינות הכתובת...'); return; }

    setPublishing(true);
    setPublishError('');
    try {
      const payload = { ...form, is_published: true, services: form.services };
      let card;
      if (dbCardId) {
        card = await updateCard(dbCardId, payload);
      } else {
        card = await createCard(user.id, { ...payload, is_published: true });
        setDbCardId(card.id);
        clearDraft();
      }
      setPublished(true);
    } catch (err) {
      console.error('Publish error:', err);
      setPublishError(err?.message || 'שגיאה בפרסום — נסה שוב');
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
            <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                <LogoMark size={16} color="white" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">Vizzit</span>
            </button>
            <span className="text-gray-300 hidden sm:block mx-2">/</span>
            <span className="text-sm text-gray-500 hidden sm:block">
              {cardId ? 'עריכת דף' : 'יצירת דף חדש'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hidden sm:block"
            >
              הדפים שלי
            </button>
            {saveError && <span className="text-xs text-red-500 font-medium hidden sm:block">{saveError}</span>}
            {saveSuccess && <span className="text-xs text-green-600 font-medium hidden sm:block">נשמר ✓</span>}
            <button
              onClick={handleSave}
              disabled={saving || imagesUploading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              {imagesUploading ? 'מעלה תמונה...' : saving ? 'שומר...' : 'שמור טיוטה'}
            </button>
          </div>
        </div>
      </nav>

      {/* Steps indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">

          {/* Mobile steps: circles row + active label below */}
          <div className="md:hidden pt-2.5 pb-2">
            <div className="flex items-center">
              {visibleSteps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => setStep(s.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all mx-auto"
                    style={
                      step === s.id
                        ? { background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', color: 'white', boxShadow: '0 2px 8px rgba(244,147,140,0.4)' }
                        : i < currentIdx
                        ? { background: '#10B981', color: 'white' }
                        : { background: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {i < currentIdx ? '✓' : i + 1}
                  </button>
                  {i < visibleSteps.length - 1 && (
                    <div className="flex-1 h-px mx-1" style={{ background: i < currentIdx ? '#10B981' : '#e5e7eb' }} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs font-semibold mt-2" style={{ color: '#F4938C' }}>
              {visibleSteps[currentIdx]?.label}
            </p>
          </div>

          {/* Desktop steps: full labels */}
          <div className="hidden md:flex items-center py-3 gap-0 justify-start overflow-x-auto">
            {visibleSteps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-shrink-0">
                <button onClick={() => setStep(s.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={
                      step === s.id
                        ? { background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', color: 'white' }
                        : i < currentIdx
                        ? { background: '#10B981', color: 'white' }
                        : { background: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {i < currentIdx ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap"
                    style={{ color: step === s.id ? '#F4938C' : i < currentIdx ? '#10B981' : '#9ca3af' }}>
                    {s.label}
                  </span>
                </button>
                {i < visibleSteps.length - 1 && (
                  <div className="w-6 h-px bg-gray-200 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Content — side by side on both mobile & desktop */}
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-3 md:py-6 flex gap-2 md:gap-8 items-start">

        {/* Form — right half on mobile, flex-1 on desktop */}
        <div className="w-1/2 md:flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1 form={form} update={update} slugStatus={slugStatus} slugSuggestions={slugSuggestions} dbCardId={dbCardId} onUploadingChange={setImagesUploading} />}
              {step === 2 && <Step2 form={form} update={update} userId={user?.id} dbCardId={dbCardId} onUploadingChange={setImagesUploading} />}
              {step === 3 && <Step3 form={form} update={update} />}
              {step === 4 && <Step4 form={form} update={update} dbCardId={dbCardId} onPublish={handlePublish} publishing={publishing} published={published} isLive={isLive} slug={form.slug} publishError={publishError} imagesUploading={imagesUploading} />}
              {step === 5 && <Step5 form={form} update={update} dbCardId={dbCardId} userId={user?.id} />}
            </motion.div>
          </AnimatePresence>

          {/* Step nav buttons */}
          <div className="flex justify-between mt-4 md:mt-6">
            <button
              onClick={() => prevStepId && setStep(prevStepId)}
              disabled={!prevStepId}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              הקודם
            </button>
            {!isLastStep ? (
              <button
                onClick={() => nextStepId && setStep(nextStepId)}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}
              >
                הבא
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing || imagesUploading}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-white transition-all disabled:opacity-70"
                style={{ background: published ? '#10B981' : 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}
              >
                {publishing ? 'מפרסם...' : published ? '✓ פורסם!' : isLive ? 'עדכן ופרסם' : 'פרסם עכשיו'}
              </button>
            )}
          </div>
        </div>

        {/* Phone preview — left half on mobile, left side on desktop */}
        <div className="w-1/2 md:w-auto md:flex-shrink-0 md:sticky md:top-16 md:self-start flex justify-center md:block">

          {/* Mobile: phone fills its half + style picker below */}
          <div className="md:hidden flex flex-col items-center gap-3">
            <div style={{ width: 182, height: 390, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                transform: 'scale(0.70)',
                transformOrigin: 'top left',
                width: 260,
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <PhoneMockup>
                  {form.card_style === 'premium'
                    ? <PremiumPreview data={previewData} />
                    : <CardPreview data={previewData} compact />}
                </PhoneMockup>
              </div>
            </div>
            <StylePicker value={form.card_style} color={form.primary_color} compact onChange={async (val) => {
              update('card_style', val);
              if (dbCardId) await updateCard(dbCardId, { card_style: val });
            }} />
          </div>

          {/* Desktop: full size */}
          <div className="hidden md:block">
            <p className="text-xs text-gray-400 text-center mb-3 font-medium">תצוגה מקדימה</p>
            <PhoneMockup>
              {form.card_style === 'premium'
                ? <PremiumPreview data={previewData} />
                : <CardPreview data={previewData} compact />}
            </PhoneMockup>
            <StylePicker value={form.card_style} color={form.primary_color} onChange={async (val) => {
              update('card_style', val);
              if (dbCardId) await updateCard(dbCardId, { card_style: val });
            }} />
          </div>
        </div>

      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => { setAuthOpen(false); if (!user) navigate('/'); }}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function Step1({ form, update, slugStatus, slugSuggestions, dbCardId, onUploadingChange }) {
  const fileInputRef = useRef(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const { user } = useAuth();

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update('avatar_url', URL.createObjectURL(file));
    // Auto-switch to image background style when photo is uploaded
    if (form.background_style === 'gradient' || form.background_style === 'solid') {
      update('background_style', 'image');
    }
    if (user) {
      setUploadingImg(true);
      onUploadingChange?.(true);
      try {
        const url = await uploadCardImage(user.id, file);
        update('avatar_url', url);
        // Auto-save to DB so refresh doesn't lose the image
        if (dbCardId) {
          await updateCard(dbCardId, { avatar_url: url });
        }
      } catch {
        update('avatar_url', '');
      } finally {
        setUploadingImg(false);
        onUploadingChange?.(false);
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
    <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 card-shadow space-y-3 md:space-y-5">
      <h2 className="text-sm md:text-lg font-bold text-gray-900">פרטים בסיסיים</h2>

      {/* Profile image */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">תמונת פרופיל</label>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex-shrink-0"
          >
            {form.avatar_url ? (
              <>
                <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                {uploadingImg && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span className="text-[10px] text-gray-400 hidden md:block">העלה</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <div className="min-w-0">
            <p className="text-xs text-gray-600 leading-tight">העלה לוגו או תמונת עסק</p>
            <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG · 5MB</p>
            {form.avatar_url && (
              <button onClick={() => update('avatar_url', '')} className="text-[10px] text-red-400 mt-1 hover:text-red-500">הסר</button>
            )}
          </div>
        </div>
      </div>

      {/* Business name */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">שם העסק *</label>
        <input
          type="text"
          value={form.business_name}
          onChange={e => update('business_name', e.target.value)}
          placeholder="המספרה של אבי"
          className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
          maxLength={60}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
        <textarea
          value={form.description}
          onChange={e => update('description', e.target.value)}
          placeholder="קביעת תור תוך דקות — תספורת, צביעה ועוד"
          rows={3}
          className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
          maxLength={160}
        />
        <p className="text-[10px] md:text-xs text-gray-400 mt-1 text-left">{form.description.length}/160</p>
      </div>

      {/* Text styling */}
      <div>
        <p className="text-[10px] md:text-xs font-semibold text-gray-500 mb-1.5 md:mb-2">סגנון טקסט</p>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div>
            <p className="text-[11px] text-gray-400 mb-1.5">יישור שם</p>
            <div className="flex gap-1">
              {[
                { value: 'right', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg> },
                { value: 'center', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg> },
                { value: 'left', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg> },
              ].map(opt => (
                <button key={opt.value} onClick={() => update('title_align', opt.value)}
                  className="flex-1 flex items-center justify-center py-2 rounded-lg border-2 transition-all"
                  style={form.title_align === opt.value
                    ? { borderColor: '#5BC4C8', background: '#f0fafa', color: '#2a9aa0' }
                    : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1.5">גודל שם</p>
            <div className="flex gap-1">
              {[
                { value: 'sm', label: 'S' },
                { value: 'md', label: 'M' },
                { value: 'lg', label: 'L' },
              ].map(opt => (
                <button key={opt.value} onClick={() => update('name_size', opt.value)}
                  className="flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all"
                  style={form.name_size === opt.value
                    ? { borderColor: '#5BC4C8', background: '#f0fafa', color: '#2a9aa0' }
                    : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
          כתובת הדף שלך
        </label>
        <div className="flex items-center gap-1 md:gap-2 bg-gray-50 border rounded-lg md:rounded-xl px-2 md:px-4 py-2 md:py-3" style={{ borderColor: sc.border }}>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">vizzit.online/</span>
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
function Step2({ form, update, userId, dbCardId, onUploadingChange }) {
  const fileRefs = useRef({});
  const popupFileRefs = useRef({});
  const [uploadingSet, setUploadingSet] = useState(new Set());
  const [uploadError, setUploadError] = useState('');
  const isPremium = form.card_style === 'premium';

  const setUploading = (i, val) => {
    setUploadingSet(prev => {
      const next = new Set(prev);
      val ? next.add(i) : next.delete(i);
      onUploadingChange?.(next.size > 0);
      return next;
    });
  };

  const addService = () => {
    if (form.services.length >= 5) return;
    update('services', [...form.services, { title: '', description: '', image_url: '', price: '', size: 'full' }]);
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
    setUploadError('');
    updateService(i, 'image_url', URL.createObjectURL(file));
    if (userId) {
      setUploading(i, true);
      try {
        const url = await uploadCardImage(userId, file);
        const updatedServices = [...form.services];
        updatedServices[i] = { ...updatedServices[i], image_url: url };
        updateService(i, 'image_url', url);
        if (dbCardId) await updateCard(dbCardId, { services: updatedServices });
      } catch (err) {
        console.error(err);
        setUploadError(err?.message || 'שגיאה בהעלאת תמונה');
        updateService(i, 'image_url', '');
      } finally {
        setUploading(i, false);
      }
    }
  };

  const handlePopupImage = async (i, file) => {
    if (!file) return;
    setUploadError('');
    updateService(i, 'popup_image_url', URL.createObjectURL(file));
    if (userId) {
      setUploading(`p${i}`, true);
      try {
        const url = await uploadCardImage(userId, file);
        const updatedServices = [...form.services];
        updatedServices[i] = { ...updatedServices[i], popup_image_url: url };
        updateService(i, 'popup_image_url', url);
        if (dbCardId) await updateCard(dbCardId, { services: updatedServices });
      } catch (err) {
        console.error(err);
        setUploadError(err?.message || 'שגיאה בהעלאת תמונה');
        updateService(i, 'popup_image_url', '');
      } finally {
        setUploading(`p${i}`, false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">השירותים שלך</h2>
        <span className="text-xs text-gray-400">{form.services.length}/5 שירותים</span>
      </div>
      <p className="text-sm text-gray-500">הוסף עד 5 שירותים שאתה מציע</p>
      {uploadError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{uploadError}</p>}

      {/* Layout picker */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">סגנון תצוגת שירותים</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'list', label: 'רשימה', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            )},
            { value: 'grid', label: 'רשת עם תמונות', icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            )},
          ].map(opt => (
            <button key={opt.value} onClick={async () => { update('services_layout', opt.value); if (dbCardId) await updateCard(dbCardId, { services_layout: opt.value }); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
              style={form.services_layout === opt.value
                ? { borderColor: '#5BC4C8', background: '#f0fafa', color: '#2a9aa0' }
                : { borderColor: '#e5e7eb', color: '#6b7280' }}>
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact position */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">מיקום כפתורי יצירת קשר</p>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          {[
            { value: 'above', label: 'מעל השירותים', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="10" rx="1"/></svg> },
            { value: 'below', label: 'מתחת לשירותים', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="10" rx="1"/><rect x="3" y="16" width="18" height="5" rx="1"/></svg> },
          ].map((opt, idx) => {
            const sel = (form.contact_position || 'above') === opt.value;
            return (
              <button key={opt.value} onClick={async () => { update('contact_position', opt.value); if (dbCardId) await updateCard(dbCardId, { contact_position: opt.value }); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${idx === 0 ? '' : 'border-r border-gray-200'}`}
                style={sel ? { background: '#f0fafa', color: '#2a9aa0' } : { background: 'white', color: '#6b7280' }}>
                {opt.icon}{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">כותרת סעיף השירותים</label>
        <input
          type="text"
          value={form.services_section_title || ''}
          onChange={e => update('services_section_title', e.target.value)}
          placeholder="השירותים שלנו"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
          maxLength={50}
        />
      </div>

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
              <input
                type="text"
                value={svc.price || ''}
                onChange={e => updateService(i, 'price', e.target.value)}
                placeholder="מחיר (למשל: ₪120 · 45 דק׳)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                maxLength={30}
              />
              {/* Size picker */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">גודל כרטיס השירות</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'full', label: 'רוחב מלא', icon: (
                      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="2" width="18" height="8" rx="2"/></svg>
                    )},
                    { value: 'half', label: 'חצי מסך', icon: (
                      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="2" width="7" height="8" rx="2"/><rect x="11" y="2" width="7" height="8" rx="2"/></svg>
                    )},
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => updateService(i, 'size', opt.value)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border-2 transition-all"
                      style={(svc.size || 'full') === opt.value
                        ? { borderColor: '#5BC4C8', background: '#f0fafa', color: '#2a9aa0' }
                        : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Service image */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">תמונת כרטיס</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileRefs.current[i]?.click()}
                    disabled={uploadingSet.has(i)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors disabled:opacity-60"
                  >
                    {uploadingSet.has(i) ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : svc.image_url ? (
                      <img src={svc.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    )}
                    {uploadingSet.has(i) ? 'מעלה...' : svc.image_url ? 'שנה תמונה' : 'הוסף תמונה'}
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
              {/* Premium popup image */}
              {isPremium && (
                <div className="rounded-xl p-3 border border-dashed" style={{ borderColor: '#a78bfa55', background: '#7c3aed08' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#7c3aed' }}>✦ תמונה בפופאפ (פרמיום)</p>
                  <p className="text-[11px] text-gray-400 mb-2">תמונה שתוצג גדולה כשפותחים את השירות. אם לא תועלה, יוצגת תמונת הכרטיס.</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => popupFileRefs.current[i]?.click()}
                      disabled={uploadingSet.has(`p${i}`)}
                      className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed rounded-xl transition-colors disabled:opacity-60"
                      style={{ borderColor: '#a78bfa88', color: '#7c3aed' }}
                    >
                      {uploadingSet.has(`p${i}`) ? (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : svc.popup_image_url ? (
                        <img src={svc.popup_image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                      {uploadingSet.has(`p${i}`) ? 'מעלה...' : svc.popup_image_url ? 'שנה תמונת פופאפ' : 'הוסף תמונת פופאפ'}
                    </button>
                    <input
                      ref={el => popupFileRefs.current[i] = el}
                      type="file" accept="image/*" className="hidden"
                      onChange={e => handlePopupImage(i, e.target.files?.[0])}
                    />
                    {svc.popup_image_url && (
                      <button onClick={() => updateService(i, 'popup_image_url', '')} className="text-xs text-red-400">הסר</button>
                    )}
                  </div>
                </div>
              )}
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

const COLORS = ['#4F46E5', '#5BC4C8', '#DB2777', '#DC2626', '#EA580C', '#16A34A', '#0284C7', '#0F172A', '#B45309', '#0891B2'];

function Step4({ form, update, dbCardId, onPublish, publishing, published, isLive, slug, publishError, imagesUploading }) {
  return (
    <div className="space-y-4">
      {/* Style picker */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-lg font-bold text-gray-900 mb-1">סגנון הדף</h2>
        <p className="text-sm text-gray-400 mb-4">בחר את המראה שמתאים לעסק שלך</p>
        <StylePicker
          value={form.card_style}
          color={form.primary_color}
          compact
          onChange={async (val) => {
            update('card_style', val);
            if (dbCardId) await updateCard(dbCardId, { card_style: val });
          }}
        />
      </div>

      {/* Color — shown for both styles */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-base font-bold text-gray-900 mb-3">צבע ראשי</h2>
        <div className="flex flex-wrap gap-2.5 items-center">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => update('primary_color', color)}
              className="w-9 h-9 rounded-full transition-transform hover:scale-110 flex-shrink-0"
              style={{ background: color, outline: form.primary_color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
            />
          ))}
          <label className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors relative">
            <input type="color" value={form.primary_color} onChange={e => update('primary_color', e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </label>
        </div>

        {/* BgStyle — only for classic */}
        {form.card_style !== 'premium' && (
          <>
            <div className="h-px bg-gray-100 my-5" />
            <BgStylePicker
              value={form.background_style || 'gradient'}
              onChange={v => update('background_style', v)}
              primaryColor={form.primary_color}
              avatarUrl={form.avatar_url}
            />
          </>
        )}
      </div>

      {/* Publish */}
      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h2 className="text-base font-bold text-gray-900 mb-2">פרסם את הדף</h2>
        {slug ? (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: '#f0fafa' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC4C8" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            <span className="text-sm font-mono" style={{ color: '#2a9aa0' }}>vizzit.online/{slug}</span>
          </div>
        ) : (
          <p className="text-sm text-orange-600 bg-orange-50 rounded-xl px-4 py-3 mb-4">הגדר שם עסק וכתובת דף בשלב 1</p>
        )}
        {published ? (
          <div className="space-y-3">
            {/* Success state */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3535, #5BC4C8)' }}>
              <div className="px-5 py-5 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-xl font-black text-white mb-1">האתר שלך מוכן!</p>
                <p className="text-white/70 text-sm mb-4">עכשיו שתף אותו עם לקוחות</p>
                <div className="bg-white/10 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  <span className="text-white font-mono text-sm">vizzit.online/{slug}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm flex items-center justify-center gap-1.5"
                  >
                    פתח את הדף
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://vizzit.online/${slug}`)}
                    className="px-4 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold"
                  >
                    העתק קישור
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
          {isLive && (
            <div className="mb-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/></svg>
              הדף כבר פורסם — שמור שינויים ולחץ עדכן
            </div>
          )}
          {publishError && (
            <div className="mb-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              {publishError}
            </div>
          )}
          <button
            onClick={onPublish}
            disabled={publishing || !slug || imagesUploading}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 8px 24px -4px rgba(91,196,200,0.4)' }}
          >
            {imagesUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                מעלה תמונה...
              </span>
            ) : publishing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                מפרסם...
              </span>
            ) : isLive ? 'עדכן ופרסם שינויים' : 'פרסם את הדף שלי'}
          </button>
          </>
        )}
      </div>
    </div>
  );
}


// ─── Step 5: Premium Features ─────────────────────────────────────────────────
function Step5({ form, update, dbCardId, userId }) {
  const isPremium = form.card_style === 'premium';

  const saveFaq = async (newFaq) => {
    update('faq', newFaq);
    if (dbCardId) await updateCard(dbCardId, { faq: newFaq }).catch(() => {});
  };

  const addFaq = () => saveFaq([...(form.faq || []), { question: '', answer: '' }]);
  const removeFaq = (i) => saveFaq((form.faq || []).filter((_, idx) => idx !== i));
  const updateFaq = (i, field, val) => {
    const next = (form.faq || []).map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    update('faq', next);
  };
  const saveFaqBlur = () => {
    if (dbCardId) updateCard(dbCardId, { faq: form.faq || [] }).catch(() => {});
  };

  if (!isPremium) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F4938C22, #5BC4C822)', border: '1px solid rgba(244,147,140,0.3)' }}>
          <span className="text-2xl">✦</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">פיצ׳רים פרמיום</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">שדרג לעיצוב פרמיום בשלב 4 כדי לגשת לפיצ׳רים הבלעדיים.</p>
        <button onClick={() => {}} className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          עבור לשלב 4 לבחירת פרמיום
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>✦ פרמיום</span>
          פיצ׳רים בלעדיים
        </h2>
        <p className="text-sm text-gray-400">הגדרות שמופיעות רק בעיצוב הפרמיום.</p>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-800">שאלות נפוצות (FAQ)</p>
            <p className="text-xs text-gray-400 mt-0.5">הוסף שאלות ותשובות שיופיעו בעמוד שלך</p>
          </div>
          <button onClick={addFaq}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            + הוסף שאלה
          </button>
        </div>

        {(!form.faq || form.faq.length === 0) && (
          <div className="text-center py-10 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400">אין שאלות עדיין. לחץ "+ הוסף שאלה" להתחיל.</p>
          </div>
        )}

        <div className="space-y-3">
          {(form.faq || []).map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">שאלה {i + 1}</span>
                <button onClick={() => removeFaq(i)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  מחק
                </button>
              </div>
              <input
                value={item.question}
                onChange={e => updateFaq(i, 'question', e.target.value)}
                onBlur={saveFaqBlur}
                placeholder="מה השאלה? למשל: כמה עולה תספורת?"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              />
              <textarea
                value={item.answer}
                onChange={e => updateFaq(i, 'answer', e.target.value)}
                onBlur={saveFaqBlur}
                placeholder="מה התשובה?"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Background Video */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-800">וידאו רקע ✦</p>
            <p className="text-xs text-gray-400 mt-0.5">וידאו שירוץ ברקע ה-Hero במקום תמונה. MP4 מומלץ, עד 20MB</p>
          </div>
          {form.background_video_url && (() => {
            const parts = (form.background_video_position || '50% 30% cover').split(' ');
            const currentFit = parts[2] || 'cover';
            const setFit = async (val) => {
              const pos = `${parts[0] || '50%'} ${parts[1] || '30%'} ${val}`;
              update('background_video_position', pos);
              if (dbCardId) await updateCard(dbCardId, { background_video_position: pos }).catch(() => {});
            };
            return (
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
                {[['cover','ממלא'],['contain','מלא']].map(([val, label]) => (
                  <button key={val} onClick={() => setFit(val)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    style={currentFit === val
                      ? { background: 'white', color: '#4F46E5', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                      : { color: '#9ca3af' }}>
                    {label}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
        {form.background_video_url ? (
          <VideoPositionPicker
            src={form.background_video_url}
            positionStr={form.background_video_position || '50% 30% cover'}
            onPositionChange={async (posStr) => {
              update('background_video_position', posStr);
              if (dbCardId) await updateCard(dbCardId, { background_video_position: posStr }).catch(() => {});
            }}
            onRemove={async () => {
              update('background_video_url', '');
              update('background_video_position', '50% 30% cover');
              if (dbCardId) await updateCard(dbCardId, { background_video_url: '', background_video_position: '50% 30% cover' }).catch(() => {});
            }}
          />
        ) : (
          <VideoUploadBox
            userId={userId}
            onUploaded={async (url) => {
              update('background_video_url', url);
              if (dbCardId) await updateCard(dbCardId, { background_video_url: url }).catch(() => {});
            }}
          />
        )}
      </div>

      {/* Service URLs */}
      {form.services && form.services.length > 0 && (
        <div>
          <div className="mb-3">
            <p className="text-sm font-bold text-gray-800">קישורי שירותים</p>
            <p className="text-xs text-gray-400 mt-0.5">הוסף קישור לכל שירות — יופיע כ"קבע תור" בפופ-אפ</p>
          </div>
          <div className="space-y-3">
            {form.services.map((svc, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white">
                <p className="text-xs font-bold text-gray-600 mb-2 truncate">{svc.title || `שירות ${i + 1}`}</p>
                <input
                  type="url"
                  value={svc.service_url || ''}
                  onChange={e => {
                    const next = form.services.map((s, idx) => idx === i ? { ...s, service_url: e.target.value } : s);
                    update('services', next);
                  }}
                  onBlur={() => {
                    if (dbCardId) updateCard(dbCardId, { services: form.services }).catch(() => {});
                  }}
                  placeholder="https://calendly.com/..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  dir="ltr"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-800">תגובות לקוחות ✦</p>
            <p className="text-xs text-gray-400 mt-0.5">הצג המלצות בעמוד שלך</p>
          </div>
          <button
            onClick={async () => {
              const val = !form.reviews_enabled;
              update('reviews_enabled', val);
              if (dbCardId) await updateCard(dbCardId, { reviews_enabled: val }).catch(() => {});
            }}
            className="relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0"
            style={{ background: form.reviews_enabled ? 'linear-gradient(135deg,#F4938C,#5BC4C8)' : '#e5e7eb' }}
          >
            <span className="inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5"
              style={{ transform: form.reviews_enabled ? 'translateX(-22px)' : 'translateX(-2px)' }} />
          </button>
        </div>

        {form.reviews_enabled && (
          <div className="space-y-4">
            {/* Public toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-700">פתח לקהל הרחב</p>
                <p className="text-xs text-gray-400 mt-0.5">כל מי שנכנס לכרטיס יוכל להשאיר תגובה</p>
              </div>
              <button
                onClick={async () => {
                  const val = !form.reviews_public;
                  update('reviews_public', val);
                  if (dbCardId) await updateCard(dbCardId, { reviews_public: val }).catch(() => {});
                }}
                className="relative inline-flex h-6 w-11 rounded-full transition-colors flex-shrink-0"
                style={{ background: form.reviews_public ? 'linear-gradient(135deg,#F4938C,#5BC4C8)' : '#e5e7eb' }}
              >
                <span className="inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5"
                  style={{ transform: form.reviews_public ? 'translateX(-22px)' : 'translateX(-2px)' }} />
              </button>
            </div>

            {/* Manual reviews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-600">תגובות שהוספת בעצמך</p>
                <button
                  onClick={() => {
                    const next = [...(form.manual_reviews || []), { name: '', text: '', rating: 5 }];
                    update('manual_reviews', next);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>
                  + הוסף
                </button>
              </div>

              {(!form.manual_reviews || form.manual_reviews.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4 rounded-2xl border-2 border-dashed border-gray-200">
                  לחץ "+ הוסף" כדי להוסיף תגובה ידנית
                </p>
              )}

              <div className="space-y-3">
                {(form.manual_reviews || []).map((r, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      {/* Stars */}
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => {
                            const next = form.manual_reviews.map((x,idx) => idx===i ? {...x, rating: star} : x);
                            update('manual_reviews', next);
                          }}>
                            <span style={{ color: star <= r.rating ? '#F59E0B' : '#d1d5db', fontSize: 18 }}>★</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => {
                        const next = form.manual_reviews.filter((_,idx) => idx !== i);
                        update('manual_reviews', next);
                        if (dbCardId) updateCard(dbCardId, { manual_reviews: next }).catch(() => {});
                      }} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">
                        מחק
                      </button>
                    </div>
                    <input
                      value={r.name}
                      onChange={e => {
                        const next = form.manual_reviews.map((x,idx) => idx===i ? {...x, name: e.target.value} : x);
                        update('manual_reviews', next);
                      }}
                      onBlur={() => { if (dbCardId) updateCard(dbCardId, { manual_reviews: form.manual_reviews }).catch(() => {}); }}
                      placeholder="שם הלקוח"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    />
                    <textarea
                      value={r.text}
                      onChange={e => {
                        const next = form.manual_reviews.map((x,idx) => idx===i ? {...x, text: e.target.value} : x);
                        update('manual_reviews', next);
                      }}
                      onBlur={() => { if (dbCardId) updateCard(dbCardId, { manual_reviews: form.manual_reviews }).catch(() => {}); }}
                      placeholder="מה אמר הלקוח?"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Video Upload Box ──────────────────────────────────────────────────────────
function VideoUploadBox({ userId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setError('הקובץ גדול מ-20MB'); return; }
    setError('');
    setUploading(true);
    try {
      const path = `${userId || 'anon'}/video_${Date.now()}.mp4`;
      const { data, error: upErr } = await supabase.storage
        .from('card-images')
        .upload(path, file, { upsert: true, contentType: file.type || 'video/mp4' });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(data.path);
      onUploaded(publicUrl);
    } catch (err) {
      console.error('Video upload error:', err);
      setError('שגיאה: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="video/mp4,video/webm,video/mov" className="hidden" onChange={handle} />
      <button onClick={() => ref.current?.click()} disabled={uploading}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">
        {uploading ? (
          <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce bg-indigo-400" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        )}
        <span className="text-sm font-medium text-gray-500">{uploading ? 'מעלה...' : 'העלה וידאו רקע (MP4)'}</span>
        <span className="text-xs text-gray-400">עד 20MB</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

// ─── Video Position Picker ─────────────────────────────────────────────────────
// positionStr format: "X% Y% [fit]"  e.g. "50% 30% cover" or "40% 60% contain"
function parsePositionStr(str) {
  const parts = (str || '50% 30% cover').split(' ');
  return { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 30, fit: parts[2] || 'cover' };
}

function VideoPositionPicker({ src, positionStr, onPositionChange, onRemove }) {
  const containerRef = useRef();
  const dragging = useRef(false);

  const parsed = parsePositionStr(positionStr);
  const [pos, setPos] = useState({ x: parsed.x, y: parsed.y });
  const fit = parsed.fit;

  const buildStr = (x, y) => `${x}% ${y}% ${fit}`;

  const updateFromEvent = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)));
    setPos({ x, y });
    return buildStr(x, y);
  };

  const onMouseDown = (e) => { e.preventDefault(); dragging.current = true; updateFromEvent(e); };
  const onMouseMove = (e) => { if (!dragging.current) return; updateFromEvent(e); };
  const onMouseUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    const s = updateFromEvent(e);
    onPositionChange(s);
  };
  const onTouchStart = (e) => { dragging.current = true; updateFromEvent(e); };
  const onTouchMove = (e) => { if (!dragging.current) return; e.preventDefault(); updateFromEvent(e); };
  const onTouchEnd = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    onPositionChange(buildStr(pos.x, pos.y));
  };

  const isCover = fit !== 'contain';

  return (
    <div className="space-y-2">
      {isCover && <p className="text-xs text-gray-500">גרור את הנקודה כדי לבחור איזה חלק בוידאו יוצג</p>}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-gray-200 select-none"
        style={{ height: 180, background: '#000', cursor: isCover ? 'crosshair' : 'default' }}
        onMouseDown={isCover ? onMouseDown : undefined}
        onMouseMove={isCover ? onMouseMove : undefined}
        onMouseUp={isCover ? onMouseUp : undefined}
        onMouseLeave={isCover ? onMouseUp : undefined}
        onTouchStart={isCover ? onTouchStart : undefined}
        onTouchMove={isCover ? onTouchMove : undefined}
        onTouchEnd={isCover ? onTouchEnd : undefined}
      >
        <video
          src={src}
          autoPlay loop muted playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: isCover ? 'cover' : 'contain',
            objectPosition: isCover ? `${pos.x}% ${pos.y}%` : 'center',
            pointerEvents: 'none',
          }}
        />
        {/* Drag handle — only in cover mode */}
        {isCover && (
          <div
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              border: '3px solid rgba(79,70,229,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#4F46E5">
              <path d="M12 2l3 5H9l3-5zm0 20l-3-5h6l-3 5zm10-10l-5 3V9l5 3zM2 12l5-3v6L2 12z"/>
            </svg>
          </div>
        )}
        {/* Remove button */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onRemove}
          className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          הסר וידאו
        </button>
      </div>
      {isCover && <p className="text-xs text-gray-400 text-center">מיקום: {pos.x}% × {pos.y}%</p>}
    </div>
  );
}

// ─── Style Picker ─────────────────────────────────────────────────────────────
function StylePicker({ value, color, onChange, dark = false, compact = false }) {
  const accent = color || '#4F46E5';
  const styles = [
    { id: 'classic', label: 'קלאסי', sub: 'עממי · ריאלי' },
    { id: 'premium', label: 'פרמיום', sub: 'אקסקלוסיבי' },
  ];
  return (
    <div className={compact ? '' : 'mt-4'}>
      {!compact && (
        <p className={`text-xs font-bold text-center mb-3 tracking-wide ${dark ? 'text-white/50' : 'text-gray-400'}`}>
          בחר סגנון דף
        </p>
      )}
      {compact ? (
        /* Two small phone-shaped cards with gap */
        <div className="flex gap-3 justify-center">
          {styles.map(s => {
            const selected = (value || 'classic') === s.id;
            return (
              <button key={s.id} onClick={() => onChange(s.id)}
                className="flex flex-col items-center gap-1.5 transition-all"
                style={{ outline: 'none' }}>
                {/* Phone frame */}
                <div style={{
                  width: 72, borderRadius: 12,
                  border: selected ? `2px solid ${accent}` : '2px solid #e5e7eb',
                  boxShadow: selected ? `0 0 0 3px ${accent}22` : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.15s',
                }}>
                  {s.id === 'classic'
                    ? <ClassicThumb color={accent} compact />
                    : <PremiumThumb color={accent} compact />}
                </div>
                <span className="text-[11px] font-bold"
                  style={{ color: selected ? accent : '#9ca3af' }}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {styles.map(s => {
            const selected = (value || 'classic') === s.id;
            return (
              <button key={s.id} onClick={() => onChange(s.id)}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  border: selected ? `2px solid ${accent}` : `2px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  boxShadow: selected ? `0 0 0 3px ${accent}22` : 'none',
                }}>
                <div>
                  {s.id === 'classic'
                    ? <ClassicThumb color={accent} compact={false} />
                    : <PremiumThumb color={accent} compact={false} />}
                </div>
                <div className="py-2 text-center" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f9fafb' }}>
                  <p className="text-xs font-bold"
                    style={{ color: selected ? accent : (dark ? 'rgba(255,255,255,0.6)' : '#6b7280') }}>
                    {s.label}
                  </p>
                  <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-gray-400'}`}>{s.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClassicThumb({ color, compact }) {
  return (
    <div style={{ background: '#f8fafc', aspectRatio: compact ? '3/4' : '9/14', position: 'relative', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, height: '38%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.25)', marginBottom: 4, border: '1.5px solid rgba(255,255,255,0.4)' }} />
        <div style={{ width: 50, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.85)', marginBottom: 3 }} />
        <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={{ background: 'white', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 20, borderRadius: 6, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.8)' }} />
        </div>
        {[60, 80, 50].map((w, i) => (
          <div key={i} style={{ height: 3, width: `${w}%`, borderRadius: 2, background: '#e5e7eb' }} />
        ))}
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
          {[1,2].map(i => <div key={i} style={{ flex: 1, height: 28, borderRadius: 6, background: '#f1f5f9', border: '1px solid #e5e7eb' }} />)}
        </div>
      </div>
    </div>
  );
}

function PremiumThumb({ color, compact }) {
  return (
    <div style={{ background: '#070910', aspectRatio: compact ? '3/4' : '9/14', overflow: 'hidden', padding: compact ? '5px 7px' : '8px 10px', display: 'flex', flexDirection: 'column', gap: compact ? 3 : 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: `${color}33` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[14,10,12].map((w,i) => <div key={i} style={{ width: w, height: 1.5, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />)}
        </div>
      </div>
      <div style={{ alignSelf: 'center', padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}55` }}>
        <div style={{ width: 28, height: 3, borderRadius: 2, background: color + 'aa' }} />
      </div>
      <div style={{ alignSelf: 'center', width: 55, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.85)' }} />
      <div style={{ alignSelf: 'center', width: 38, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.2)', marginBottom: 2 }} />
      <div style={{ height: 18, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 30, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.7)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 2 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 24, borderRadius: 6, background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: `${color}22` }} />
          </div>
        ))}
      </div>
      <div style={{ height: 22, borderRadius: 6, background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.07)', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 30, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.5)' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: `${color}33` }} />
      </div>
    </div>
  );
}
