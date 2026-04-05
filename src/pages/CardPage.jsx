import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { getCardBySlug, updateCard } from '../lib/cardsApi';
import CardPreview from '../components/CardPreview';
import LogoMark from '../components/LogoMark';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const BG = '#070910';
const CARD_BG = '#0d0f1a';
const BORDER = 'rgba(255,255,255,0.07)';

function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#F59E0B' : 'rgba(255,255,255,0.15)', fontSize: size }}>★</span>
      ))}
    </div>
  );
}

function ReviewsSection({ card, accent }) {
  const [publicReviews, setPublicReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!card.reviews_public) return;
    supabase.from('card_reviews').select('*').eq('card_id', card.id).order('created_at', { ascending: false })
      .then(({ data }) => setPublicReviews(data || []));
  }, [card.id, card.reviews_public]);

  const allReviews = [
    ...(card.manual_reviews || []).map(r => ({ ...r, isManual: true })),
    ...publicReviews.map(r => ({ name: r.reviewer_name, text: r.review_text, rating: r.rating, isManual: false })),
  ];

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    await supabase.from('card_reviews').insert({ card_id: card.id, reviewer_name: name.trim(), review_text: text.trim(), rating });
    setPublicReviews(prev => [{ reviewer_name: name, review_text: text, rating, created_at: new Date().toISOString() }, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setName(''); setText(''); setRating(5);
    setSubmitting(false);
  };

  if (allReviews.length === 0 && !card.reviews_public) return null;

  return (
    <section className="px-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: accent }}>המלצות</p>
        {card.reviews_public && !showForm && !submitted && (
          <button onClick={() => setShowForm(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
            + השאר תגובה
          </button>
        )}
        {submitted && <span className="text-xs font-bold" style={{ color: '#10B981' }}>תודה! ✓</span>}
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="rounded-2xl p-4 mb-4 space-y-3" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
                <span style={{ color: s <= (hoverRating || rating) ? '#F59E0B' : 'rgba(255,255,255,0.2)', fontSize: 24 }}>★</span>
              </button>
            ))}
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="השם שלך"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}` }} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="כתוב את התגובה שלך..." rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${BORDER}` }} />
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting || !name.trim() || !text.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, #F4938C, #5BC4C8)` }}>
              {submitting ? '...' : 'שלח תגובה'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-white/40">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {allReviews.map((r, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">{r.name}</p>
              <StarDisplay rating={r.rating} size={14} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.text}</p>
          </div>
        ))}
        {allReviews.length === 0 && card.reviews_public && (
          <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            היה הראשון להשאיר תגובה!
          </p>
        )}
      </div>
    </section>
  );
}

function FaqSection({ faq, accent }) {
  const [open, setOpen] = useState(null);
  return (
    <section className="px-5 pb-6">
      <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
        שאלות נפוצות
      </p>
      <div className="space-y-2">
        {faq.map((item, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-right"
              onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-bold text-white text-sm">{item.question}</span>
              <span className="text-lg transition-transform flex-shrink-0 mr-3"
                style={{ color: accent, transform: open === i ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>
                +
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ownerIsPro, setOwnerIsPro] = useState(null);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [popupImgIdx, setPopupImgIdx] = useState(0);
  const [editBizName, setEditBizName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSvcTitle, setEditSvcTitle] = useState('');
  const [localServices, setLocalServices] = useState([]);
  const localServicesRef = useRef([]);

  useEffect(() => {
    if (!slug) return;
    getCardBySlug(slug)
      .then(async data => {
        if (!data || !data.is_published) { setNotFound(true); }
        else {
          setCard(data);
          if (data.card_style === 'premium') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('plan, plan_expires_at')
              .eq('id', data.user_id)
              .single();
            const proActive = profile?.plan === 'pro' &&
              (!profile?.plan_expires_at || new Date(profile.plan_expires_at) > new Date());
            setOwnerIsPro(proActive);
          } else {
            setOwnerIsPro(true);
          }
          supabase.from('cards').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id).then(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (card && isEditMode) {
      setEditBizName(card.business_name || '');
      setEditDesc(card.description || '');
      setEditSvcTitle(card.services_section_title || 'השירותים שלנו');
      const svcs = card.card_services || [];
      setLocalServices(svcs);
      localServicesRef.current = svcs;
    }
  }, [card?.id, isEditMode]);

  useEffect(() => { localServicesRef.current = localServices; }, [localServices]);
  useEffect(() => { setPopupImgIdx(0); }, [selectedService?.title]);

  const isOwner = !!(user && card && user.id === card.user_id);
  const isPremiumDemo = !!(card && card.card_style === 'premium' && ownerIsPro === false);

  const saveField = async (field, value) => {
    setSaving(true);
    setCard(prev => ({ ...prev, [field]: value }));
    try { await updateCard(card.id, { [field]: value }); }
    finally { setSaving(false); }
  };

  const saveServices = async (svcs) => {
    setSaving(true);
    setCard(prev => ({ ...prev, card_services: svcs }));
    try { await updateCard(card.id, { services: svcs }); }
    finally { setSaving(false); }
  };

  const handleServicesReorder = (newOrder) => {
    setLocalServices(newOrder);
    localServicesRef.current = newOrder;
    saveServices(newOrder);
  };

  const updateLocalService = (idx, field, value) => {
    setLocalServices(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      localServicesRef.current = copy;
      return copy;
    });
  };

  const handleFinishEdit = async () => {
    setSaving(true);
    const svcs = localServicesRef.current;
    try {
      await updateCard(card.id, {
        business_name: editBizName,
        description: editDesc,
        services_section_title: editSvcTitle,
        services: svcs,
      });
      setCard(prev => ({
        ...prev,
        business_name: editBizName,
        description: editDesc,
        services_section_title: editSvcTitle,
        card_services: svcs,
      }));
    } finally {
      setSaving(false);
      setIsEditMode(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          <LogoMark size={26} color="white" />
        </div>
        <div className="flex gap-1.5 justify-center">
          {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#5BC4C8', animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" dir="rtl" style={{ background: BG }}>
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">הדף לא נמצא</h1>
        <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>הדף שחיפשת אינו קיים או שטרם פורסם.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-2xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          צור כרטיס משלך →
        </button>
      </div>
    </div>
  );

  // Premium card from a non-pro owner — guests see a branded Vizzit screen
  // Wait for auth to resolve before showing guest screen (avoid flash for owners)
  if (isPremiumDemo && !isOwner && !authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" dir="rtl" style={{ background: BG }}>
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 20px 50px -10px rgba(244,147,140,0.4)' }}>
          <LogoMark size={40} color="white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Vizzit</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>צור את כרטיס הביקור הדיגיטלי שלך בקלות ובחינם.</p>
        <button onClick={() => navigate('/')}
          className="px-8 py-3 rounded-2xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          צור כרטיס עכשיו →
        </button>
      </div>
    </div>
  );

  const accent = card.primary_color || '#7c5ce0';
  const waLink = card.phone
    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(card.whatsapp_message || '')}`
    : null;
  const hasSocial = card.instagram || card.facebook || card.tiktok;
  const services = isEditMode ? localServices : (card.card_services || []);
  const isClassic = (card.card_style || 'classic') === 'classic';

  // ── Classic style: use CardPreview layout ──────────────────────────────────
  if (isClassic && !isEditMode) {
    const fixedBarHeight = ((card.instagram || card.facebook || card.tiktok || card.location_url) ? 52 : 0) + 36;
    return (
      <div dir="rtl" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {isOwner && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-11"
            style={{ background: 'rgba(7,9,16,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>אתה צופה בדף שלך</span>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/builder/${card.id}`)}
                className="px-3 py-1 rounded-lg text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>builder</button>
              <button onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white"
                style={{ background: accent }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ערוך דף
              </button>
            </div>
          </div>
        )}
        <div className={isOwner ? 'pt-11' : ''}>
          <div style={{ paddingBottom: `${fixedBarHeight + 24}px` }}>
            <CardPreview data={card} compact={false} showActions={true} showSocial={false} />
          </div>
        </div>
        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          {(card.instagram || card.facebook || card.tiktok || card.location_url) && (
            <div className="flex justify-center gap-3 px-4 py-2">
              {card.instagram && <a href={`https://instagram.com/${card.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#E1306C' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>}
              {card.facebook && <a href={card.facebook.startsWith('http') ? card.facebook : `https://facebook.com/${card.facebook}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#1877F2' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
              {card.tiktok && <a href={`https://tiktok.com/@${card.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#010101' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.84 4.84 0 01-1.07-.1z"/></svg></a>}
              {card.location_url && <a href={card.location_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#4285F4' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></a>}
            </div>
          )}
          <div className="flex justify-center pb-3 pt-1">
            <a href="/" className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}><LogoMark size={9} color="white" /></div>
              <span className="text-[10px] text-gray-500">נוצר עם <strong>Vizzit</strong></span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Premium (dark) style ───────────────────────────────────────────────────
  return (
    <div dir="rtl" style={{ background: BG, minHeight: '100vh', color: 'white' }}>
      <style>{`
        @keyframes pulse-accent { 0%,100%{box-shadow:0 0 0 0 ${accent}55} 50%{box-shadow:0 0 0 10px ${accent}00} }
        .accent-pulse { animation: pulse-accent 2.5s infinite; }
        .dark-edit-field { border-bottom: 2px dashed rgba(255,255,255,0.25) !important; background: rgba(255,255,255,0.04) !important; outline: none !important; color: inherit; width: 100%; border-radius: 4px; padding: 2px 6px; }
        .dark-edit-field:focus { border-bottom-color: rgba(255,255,255,0.6) !important; background: rgba(255,255,255,0.07) !important; }
      `}</style>

      {/* ── OWNER BAR ── */}
      {isOwner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-11"
          style={{ background: 'rgba(7,9,16,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)' }}>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>אתה צופה בדף שלך</span>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <span className="text-[11px] font-medium" style={{ color: saving ? '#f4938c' : '#5bc4c8' }}>
                  {saving ? 'שומר...' : 'עריכה פעילה'}
                </span>
                <button onClick={handleFinishEdit} disabled={saving}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-60"
                  style={{ background: accent, color: 'white' }}>
                  {saving ? 'שומר...' : 'סיום עריכה'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate(`/builder/${card.id}`)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  builder
                </button>
                <button onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ background: accent }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ערוך דף
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── DEMO MODE BANNER (owner, non-pro premium) ── */}
      {isPremiumDemo && isOwner && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(13,15,26,0.96)', border: '1px solid rgba(244,147,140,0.35)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            <LogoMark size={16} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">מצב דמו ✦ גלוי רק לך</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>שדרג ל-Pro כדי לשתף את העמוד — ₪39/חודש</p>
          </div>
          <button onClick={() => navigate('/pro')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            שדרג
          </button>
        </div>
      )}

      <div className={`max-w-lg mx-auto ${isOwner ? 'pt-11' : ''}`}>

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-30 flex items-center justify-between px-5 h-14"
          style={{ background: 'rgba(7,9,16,0.9)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}`, top: isOwner ? 44 : 0 }}>
          <div className="flex items-center gap-2.5">
            {card.avatar_url
              ? <img src={card.avatar_url} className="w-7 h-7 rounded-lg object-cover" alt="" style={{ border: `1px solid ${BORDER}` }} />
              : <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '22' }}>
                  <svg viewBox="0 0 24 24" fill={accent} style={{ width: 14, height: 14 }}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                </div>
            }
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.15em' }}>
              {card.business_name}
            </span>
          </div>
          <div className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 opacity-60">
            <span className="block w-5 h-px bg-white rounded" />
            <span className="block w-3 h-px bg-white rounded" />
            <span className="block w-4 h-px bg-white rounded" />
          </div>
        </nav>

        {/* ── HERO ── */}
        <section>
          <div className="relative overflow-hidden" style={{ height: (card.avatar_url || card.background_video_url) ? 420 : 160 }}>
            {card.background_video_url ? (
              <>
                {(() => {
                  const parts = (card.background_video_position || '50% 30% cover').split(' ');
                  const objPos = `${parts[0] || '50%'} ${parts[1] || '30%'}`;
                  const objFit = parts[2] || 'cover';
                  return (
                    <video src={card.background_video_url} autoPlay loop muted playsInline
                      className="absolute inset-0 w-full h-full"
                      style={{ opacity: 0.65, objectFit: objFit, objectPosition: objFit === 'cover' ? objPos : 'center' }} />
                  );
                })()}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 0%, transparent 25%, transparent 75%, ${BG} 100%)` }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG} 0%, transparent 18%)` }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, rgba(7,9,16,0.55) 68%, ${BG} 100%)` }} />
              </>
            ) : card.avatar_url ? (
              <>
                <img src={card.avatar_url} alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  style={{ opacity: 0.65 }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 0%, transparent 25%, transparent 75%, ${BG} 100%)` }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG} 0%, transparent 18%)` }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, rgba(7,9,16,0.55) 68%, ${BG} 100%)` }} />
              </>
            ) : null}

            {/* Text centered in image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10"
              style={{ paddingTop: 40, paddingBottom: 20 }}>
              {isEditMode ? (
                <input value={editBizName} onChange={e => setEditBizName(e.target.value)}
                  className="dark-edit-field text-4xl font-black text-center block mb-2 w-full"
                  style={{ lineHeight: 1.15, fontStyle: 'italic' }} placeholder="שם העסק" />
              ) : (
                <h1 className="text-5xl font-black text-center leading-tight text-white"
                  style={{ fontStyle: 'italic', textShadow: '0 4px 32px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)', marginBottom: 10 }}>
                  {card.business_name}
                </h1>
              )}
              {isEditMode ? (
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  rows={2} className="dark-edit-field text-center text-sm resize-none block w-full"
                  style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }} placeholder="תיאור העסק" />
              ) : (
                card.description && (
                  <p className="text-center text-sm max-w-xs"
                    style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
                    {card.description}
                  </p>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── CONTACT GRID ── */}
        {(card.phone || card.location_url || card.booking_url) && (() => {
          const contactGrid = (
            <section className="px-5 pb-8">
              <div className="grid grid-cols-2 gap-2.5">
                {card.phone && (
                  <a href={`tel:${card.phone}`}
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-colors hover:bg-white/5"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}>
                      <PhoneIcon color={accent} />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>התקשר</span>
                  </a>
                )}
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22c55e18' }}>
                      <WAIcon color="#22c55e" />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>וואטסאפ</span>
                  </a>
                )}
                {card.location_url && (
                  <a href={card.location_url} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4285F418' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>מיקום</span>
                  </a>
                )}
                {card.booking_url && (
                  <a href={card.booking_url} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>קביעת תור</span>
                  </a>
                )}
              </div>
            </section>
          );
          return (card.contact_position || 'above') === 'above' ? contactGrid : null;
        })()}

        {/* ── SERVICES ── */}
        {services.length > 0 && (
          <section className="px-5 pb-10">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: accent }}>OUR EXPERTISE</span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>

            {/* Section title */}
            {isEditMode ? (
              <input value={editSvcTitle} onChange={e => setEditSvcTitle(e.target.value)}
                className="dark-edit-field text-2xl font-black mb-5 block" style={{ fontStyle: 'italic' }}
                placeholder="כותרת שירותים" />
            ) : (
              <h2 className="text-2xl font-black mb-5 text-white" style={{ fontStyle: 'italic' }}>
                {card.services_section_title || 'השירותים שלנו'}
              </h2>
            )}

            {/* Service cards */}
            {isEditMode ? (
              <Reorder.Group axis="y" values={localServices} onReorder={handleServicesReorder}
                className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {localServices.map((svc, i) => (
                  <Reorder.Item key={svc.id ?? i} value={svc}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}`, cursor: 'grab' }}
                    whileDrag={{ scale: 1.02, boxShadow: `0 8px 32px ${accent}22`, zIndex: 10 }}>
                    <div className="flex items-stretch">
                      {/* Drag handle */}
                      <div className="flex items-center justify-center px-3" style={{ borderLeft: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.2)' }}>
                        <svg width="12" height="18" viewBox="0 0 14 20" fill="currentColor">
                          <circle cx="4" cy="4" r="1.5"/><circle cx="10" cy="4" r="1.5"/>
                          <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/>
                          <circle cx="4" cy="16" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
                        </svg>
                      </div>
                      {svc.image_url && (
                        <div className="w-16 flex-shrink-0">
                          <img src={svc.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-3 space-y-1.5" onPointerDown={e => e.stopPropagation()}>
                        <input value={svc.title || ''} onChange={e => updateLocalService(i, 'title', e.target.value)}
                          onBlur={() => saveServices(localServicesRef.current)}
                          className="w-full text-sm font-bold bg-transparent outline-none pb-0.5"
                          style={{ color: 'white', borderBottom: '1px dashed rgba(255,255,255,0.15)' }}
                          placeholder="שם השירות" />
                        <input value={svc.description || ''} onChange={e => updateLocalService(i, 'description', e.target.value)}
                          onBlur={() => saveServices(localServicesRef.current)}
                          className="w-full text-xs bg-transparent outline-none pb-0.5"
                          style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}
                          placeholder="תיאור" />
                        <input value={svc.price || ''} onChange={e => updateLocalService(i, 'price', e.target.value)}
                          onBlur={() => saveServices(localServicesRef.current)}
                          className="w-24 text-xs font-bold bg-transparent outline-none pb-0.5"
                          style={{ color: accent, borderBottom: '1px dashed rgba(255,255,255,0.08)' }}
                          placeholder="מחיר" />
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : card.services_layout === 'grid' ? (
              <div className="grid grid-cols-2 gap-2.5">
                {services.map((svc, i) => {
                  const svcWaLink = waLink
                    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(`היי, אני מעוניין/ת בשירות: ${svc.title}`)}`
                    : null;
                  const isHalf = (svc.size || 'full') === 'half';
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${isHalf ? '' : 'col-span-2'}`}
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, height: isHalf ? 120 : 200 }}
                      onClick={() => setSelectedService({ ...svc, svcWaLink })}>
                      {svc.image_url ? (
                        <>
                          <img src={svc.image_url} alt={svc.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,9,16,0.88) 0%, rgba(7,9,16,0.2) 55%, transparent 100%)' }} />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: CARD_BG }}>
                          <svg viewBox="0 0 24 24" style={{ width: isHalf ? 28 : 40, height: isHalf ? 28 : 40, fill: accent + '40' }}>
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-end">
                        {svc.price && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block self-start"
                            style={{ background: accent + '33', color: accent }}>
                            {svc.price}
                          </span>
                        )}
                        <p className={`font-bold text-white leading-snug ${isHalf ? 'text-sm' : 'text-base'}`}>{svc.title}</p>
                        {!isHalf && svc.description && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{svc.description}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc, i) => {
                  const svcWaLink = waLink
                    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(`היי, אני מעוניין/ת בשירות: ${svc.title}`)}`
                    : null;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, minHeight: svc.image_url ? 120 : 'auto' }}
                      onClick={() => setSelectedService({ ...svc, svcWaLink })}>
                      {svc.image_url && (
                        <>
                          <img src={svc.image_url} alt={svc.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(13,15,26,0.2) 0%, rgba(13,15,26,0.85) 55%)' }} />
                        </>
                      )}
                      <div className="relative z-10 p-5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          {svc.price && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                              style={{ background: accent + '22', color: accent }}>
                              {svc.price}
                            </span>
                          )}
                          <p className="font-bold text-white text-base leading-snug">{svc.title}</p>
                          {svc.description && (
                            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{svc.description}</p>
                          )}
                        </div>
                        {svcWaLink && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                            style={{ background: accent + '22', border: `1px solid ${accent}44` }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── CONTACT GRID (below) ── */}
        {(card.contact_position || 'above') === 'below' && (card.phone || card.location_url || card.booking_url) && (
          <section className="px-5 pb-8">
            <div className="grid grid-cols-2 gap-2.5">
              {card.phone && (
                <a href={`tel:${card.phone}`} className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}><PhoneIcon color={accent} /></div>
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>CALL US</span>
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22c55e18' }}><WAIcon color="#22c55e" /></div>
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>WHATSAPP</span>
                </a>
              )}
              {card.location_url && (
                <a href={card.location_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4285F418' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>LOCATION</span>
                </a>
              )}
              {card.booking_url && (
                <a href={card.booking_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '18' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>BOOKING</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── REVIEWS ── */}
        {card.reviews_enabled && (
          <ReviewsSection card={card} accent={accent} />
        )}

        {/* ── FAQ ── */}
        {card.faq && card.faq.length > 0 && (
          <FaqSection faq={card.faq} accent={accent} />
        )}

        {/* ── SOCIAL ── */}
        {hasSocial && (
          <section className="px-5 pb-10">
            <div className="rounded-2xl p-6 text-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                עקבו אחרינו
              </p>
              <div className="flex justify-center gap-3">
                {card.instagram && (
                  <a href={`https://instagram.com/${card.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(225,48,108,0.15)', border: '1px solid rgba(225,48,108,0.25)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {card.facebook && (
                  <a href={card.facebook.startsWith('http') ? card.facebook : `https://facebook.com/${card.facebook}`} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.25)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {card.tiktok && (
                  <a href={`https://tiktok.com/@${card.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.84 4.84 0 01-1.07-.1z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="px-5 pb-10 pt-2">
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {card.business_name}
            </p>
            <div className="flex justify-center">
              <a href="/" className="inline-flex items-center gap-1.5 opacity-30 hover:opacity-70 transition-opacity">
                <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                  <LogoMark size={9} color="white" />
                </div>
                <span className="text-[10px] text-white">DESIGNED WITH <strong>VIZZIT</strong></span>
              </a>
            </div>
          </div>
        </footer>

      </div>

      {/* ── SERVICE POPUP ── */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedService(null)}>
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-3xl overflow-hidden"
              style={{ background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
              onClick={e => e.stopPropagation()}>

              {/* Image gallery */}
              {(() => {
                const imgs = [selectedService.popup_image_url, selectedService.image_url]
                  .filter(Boolean)
                  .filter((v, i, a) => a.indexOf(v) === i);
                if (!imgs.length) return null;
                const heroImg = imgs[popupImgIdx] || imgs[0];
                return (
                  <div className="relative w-full" style={{ height: 240 }}>
                    <img src={heroImg} alt={selectedService.title}
                      className="w-full h-full object-cover transition-opacity duration-200" style={{ opacity: 0.9 }} />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 45%, #0d0f1a 100%)` }} />
                    {/* Dots */}
                    {imgs.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                        {imgs.map((_, di) => (
                          <button key={di} onClick={e => { e.stopPropagation(); setPopupImgIdx(di); }}
                            className="transition-all rounded-full"
                            style={{ width: popupImgIdx === di ? 20 : 7, height: 7, background: popupImgIdx === di ? accent : 'rgba(255,255,255,0.4)' }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Content */}
              <div className="px-6 pb-8" style={{ paddingTop: (selectedService.popup_image_url || selectedService.image_url) ? 0 : 28 }}>
                {/* Price badge */}
                {selectedService.price && (
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                    style={{ background: accent + '22', color: accent, border: `1px solid ${accent}44` }}>
                    {selectedService.price}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-2xl font-black text-white mb-2" style={{ fontStyle: 'italic' }}>
                  {selectedService.title}
                </h3>

                {/* Description */}
                {selectedService.description && (
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    {selectedService.description}
                  </p>
                )}

                {/* CTA */}
                {selectedService.service_url && (
                  <a href={selectedService.service_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm mb-2"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 6px 24px rgba(244,147,140,0.35)' }}>
                    קבע תור / מידע נוסף →
                  </a>
                )}
                {selectedService.svcWaLink && (
                  <a href={selectedService.svcWaLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm"
                    style={{ background: accent, boxShadow: `0 6px 24px ${accent}50` }}>
                    <WAIcon /> שלחו הודעה על שירות זה
                  </a>
                )}

                {/* Close */}
                <button onClick={() => setSelectedService(null)}
                  className="w-full mt-3 py-3 rounded-2xl text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }}>
                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WAIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function PhoneIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}
