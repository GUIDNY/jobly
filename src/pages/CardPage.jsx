import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { getCardBySlug, updateCard } from '../lib/cardsApi';
import CardPreview from '../components/CardPreview';
import LogoMark from '../components/LogoMark';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function CardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editBizName, setEditBizName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSvcTitle, setEditSvcTitle] = useState('');
  const [localServices, setLocalServices] = useState([]);
  const localServicesRef = useRef([]);

  useEffect(() => {
    if (!slug) return;
    getCardBySlug(slug)
      .then(data => {
        if (!data || !data.is_published) {
          setNotFound(true);
        } else {
          setCard(data);
          supabase.from('cards')
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', data.id)
            .then(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Sync local edit state only when entering edit mode (card id changes or edit mode turns on)
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

  const isOwner = !!(user && card && user.id === card.user_id);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            <LogoMark size={30} color="white" />
          </div>
          <div className="flex gap-1.5 justify-center mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 dir-rtl" dir="rtl"
        style={{ background: '#f8fafc' }}>
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: '#f1f5f9' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">הדף לא נמצא</h1>
          <p className="text-gray-400 text-sm mb-7">הדף שחיפשת אינו קיים או שטרם פורסם.</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            צור כרטיס משלך →
          </button>
        </div>
      </div>
    );
  }

  const color = card.primary_color || '#4F46E5';
  const waLink = card.phone
    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(card.whatsapp_message || '')}`
    : null;

  const hasSocial = card.instagram || card.facebook || card.tiktok || card.location_url;
  const fixedBarHeight = (hasSocial ? 52 : 0) + 36;
  const services = isEditMode ? localServices : (card.card_services || []);

  return (
    <>
      {/* ══════════════════════════════════════════
          OWNER BAR — visible only to the page owner
      ══════════════════════════════════════════ */}
      {isOwner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-11"
          style={{ background: '#0f0f14', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-xs text-white/50 font-medium">אתה צופה בדף שלך</span>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <span className="text-[11px] font-medium" style={{ color: saving ? '#f4938c' : '#5bc4c8' }}>
                  {saving ? 'שומר...' : 'שינויים נשמרים אוטומטית ✓'}
                </span>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors">
                  סיום עריכה
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/builder/${card.id}`)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-white/60 hover:text-white/90 transition-colors">
                  פתח builder
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
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

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════════════════ */}
      <div className={`md:hidden ${isOwner ? 'pt-11' : ''}`}>
        {isEditMode ? (
          /* ── Mobile inline edit view ── */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} dir="rtl"
            style={{ paddingBottom: `${fixedBarHeight + 24}px` }}>
            {/* Header strip */}
            <div className="relative px-5 pt-8 pb-6 text-center"
              style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
              {card.avatar_url && (
                <img src={card.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 shadow-lg"
                  style={{ border: '2px solid rgba(255,255,255,0.35)' }} />
              )}
              <input
                value={editBizName}
                onChange={e => setEditBizName(e.target.value)}
                onBlur={() => saveField('business_name', editBizName)}
                className="text-xl font-black text-white text-center w-full bg-transparent border-b-2 border-dashed border-white/40 outline-none pb-0.5 focus:border-white/80"
                placeholder="שם העסק"
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                onBlur={() => saveField('description', editDesc)}
                rows={2}
                className="mt-2 text-sm text-white/80 text-center w-full bg-transparent border-b border-dashed border-white/20 outline-none pb-0.5 resize-none focus:border-white/60"
                placeholder="תיאור העסק (אופציונלי)"
              />
              <p className="text-white/50 text-[11px] mt-3">לשינוי תמונה, צבע ועוד — פתח builder</p>
            </div>

            {/* Services drag-and-drop */}
            {localServices.length > 0 && (
              <div className="px-4 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={editSvcTitle}
                    onChange={e => setEditSvcTitle(e.target.value)}
                    onBlur={() => saveField('services_section_title', editSvcTitle)}
                    className="text-sm font-black text-gray-800 border-b-2 border-dashed border-teal-300 outline-none bg-transparent"
                  />
                  <span className="text-xs text-gray-400 font-normal">(גרור)</span>
                </div>
                <Reorder.Group axis="y" values={localServices} onReorder={handleServicesReorder}
                  className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {localServices.map((svc, i) => (
                    <Reorder.Item key={svc.id ?? i} value={svc}
                      className="bg-white rounded-2xl border-2 border-dashed border-teal-100 overflow-hidden"
                      style={{ cursor: 'grab' }}
                      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(91,196,200,0.2)', zIndex: 10 }}>
                      <div className="flex items-stretch">
                        {/* Drag handle */}
                        <div className="flex items-center justify-center px-3 bg-teal-50/60 border-l border-teal-100 text-teal-300 flex-shrink-0">
                          <svg width="12" height="18" viewBox="0 0 14 20" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5"/><circle cx="10" cy="4" r="1.5"/>
                            <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/>
                            <circle cx="4" cy="16" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
                          </svg>
                        </div>
                        {svc.image_url && (
                          <div className="w-14 flex-shrink-0">
                            <img src={svc.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 p-3 space-y-1.5" onPointerDown={e => e.stopPropagation()}>
                          <input
                            value={svc.title || ''}
                            onChange={e => updateLocalService(i, 'title', e.target.value)}
                            onBlur={() => saveServices(localServicesRef.current)}
                            className="w-full text-sm font-bold text-gray-900 border-b border-dashed border-gray-200 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                            placeholder="שם השירות"
                          />
                          <input
                            value={svc.description || ''}
                            onChange={e => updateLocalService(i, 'description', e.target.value)}
                            onBlur={() => saveServices(localServicesRef.current)}
                            className="w-full text-xs text-gray-500 border-b border-dashed border-gray-100 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                            placeholder="תיאור"
                          />
                          <input
                            value={svc.price || ''}
                            onChange={e => updateLocalService(i, 'price', e.target.value)}
                            onBlur={() => saveServices(localServicesRef.current)}
                            className="w-24 text-xs font-bold border-b border-dashed border-gray-100 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                            style={{ color }}
                            placeholder="מחיר"
                          />
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Normal mobile view ── */
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
            <div style={{ paddingBottom: `${fixedBarHeight + 24}px` }}>
              <CardPreview data={card} compact={false} showActions={true} showSocial={false} />
            </div>
          </motion.div>
        )}

        {/* Mobile fixed bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          {hasSocial && (
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

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <style>{`
        @keyframes pulse-wa { 0%,100%{box-shadow:0 0 0 0 #22c55e66} 50%{box-shadow:0 0 0 10px #22c55e00} }
        .wa-pulse { animation: pulse-wa 2.2s infinite; }
        .svc-card:hover .svc-cta { color: #16a34a; }
        .edit-field { border-bottom: 2px dashed rgba(91,196,200,0.7) !important; background: rgba(91,196,200,0.04) !important; outline: none !important; border-radius: 4px; padding: 2px 4px; }
        .edit-field:focus { background: rgba(91,196,200,0.10) !important; border-bottom-color: #5BC4C8 !important; }
      `}</style>
      <div className={`hidden md:flex flex-col min-h-screen ${isOwner ? 'pt-11' : ''}`} style={{ background: '#f0f4f8' }} dir="rtl">

        {/* ── Nav ── */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-8 h-13 flex items-center justify-between" style={{ height: 52 }}>
            <div className="flex items-center gap-2.5">
              {card.avatar_url
                ? <img src={card.avatar_url} className="w-7 h-7 rounded-lg object-cover" alt="" />
                : <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '22' }}><svg viewBox="0 0 24 24" fill={color} style={{ width: 14, height: 14 }}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>
              }
              <span className="font-bold text-gray-800 text-sm">{card.business_name}</span>
              <span className="text-yellow-400 text-xs">★★★★★</span>
              <span className="text-gray-400 text-xs">4.9</span>
            </div>
            <div className="flex items-center gap-3">
              {hasSocial && (
                <div className="flex items-center gap-1.5">
                  {card.instagram && <a href={`https://instagram.com/${card.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: '#E1306C' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>}
                  {card.facebook && <a href={card.facebook.startsWith('http') ? card.facebook : `https://facebook.com/${card.facebook}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: '#1877F2' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
                  {card.tiktok && <a href={`https://tiktok.com/@${card.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: '#010101' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.84 4.84 0 01-1.07-.1z"/></svg></a>}
                  {card.location_url && <a href={card.location_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: '#4285F4' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></a>}
                </div>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                  style={{ background: '#25D366' }}>
                  <WAIcon /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="w-full relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.08) 0%, transparent 45%)' }} />
          <div className="max-w-6xl mx-auto px-8 py-10 flex items-center gap-10 relative z-10">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {card.avatar_url
                ? <img src={card.avatar_url} alt="" className="w-32 h-32 rounded-3xl object-cover shadow-2xl" style={{ border: '3px solid rgba(255,255,255,0.35)' }} />
                : <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: 'rgba(255,255,255,0.18)', border: '3px solid rgba(255,255,255,0.35)' }}>
                    <svg viewBox="0 0 24 24" fill="white" style={{ width: 52, height: 52, opacity: 0.85 }}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  </div>
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-300 text-sm tracking-wide">★★★★★</span>
                <span className="text-white/80 text-sm font-medium">4.9 · <span className="font-bold text-white">127+ לקוחות מרוצים</span></span>
              </div>
              {isEditMode ? (
                <input
                  value={editBizName}
                  onChange={e => setEditBizName(e.target.value)}
                  onBlur={() => saveField('business_name', editBizName)}
                  className="edit-field text-3xl font-black text-white leading-tight w-full bg-transparent"
                  style={{ color: 'white' }}
                  placeholder="שם העסק"
                />
              ) : (
                <h1 className="text-3xl font-black text-white leading-tight">{card.business_name}</h1>
              )}
              {isEditMode ? (
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  onBlur={() => saveField('description', editDesc)}
                  rows={2}
                  className="edit-field text-white/80 text-base mt-1.5 w-full bg-transparent resize-none"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  placeholder="תיאור העסק (אופציונלי)"
                />
              ) : (
                card.description && <p className="text-white/80 text-base mt-1.5 max-w-lg">{card.description}</p>
              )}
              <div className="flex gap-2 mt-4 flex-wrap">
                {[['⚡','מענה תוך דקות'],['✓','שירות מקצועי'],['👥','לקוחות מרוצים']].map(([icon, label]) => (
                  <span key={label} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
            {/* Hero CTA */}
            {waLink && (
              <div className="flex-shrink-0 text-center">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="wa-pulse flex flex-col items-center gap-0.5 px-7 py-4 rounded-2xl text-white font-black shadow-2xl hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', minWidth: 220 }}>
                  <span className="flex items-center gap-2 text-base"><WAIcon /> קבע תור עכשיו</span>
                  <span className="text-green-100 text-xs font-normal">מענה תוך דקות ⚡</span>
                </a>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-sm">🔥</span>
                  <span className="text-white text-xs font-bold">נותרו 3 תורים אחרונים להיום</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-6xl mx-auto px-8 py-8 flex gap-7 items-start flex-1 w-full">

          {/* Services */}
          <div className="flex-1 min-w-0">
            {services.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editSvcTitle}
                        onChange={e => setEditSvcTitle(e.target.value)}
                        onBlur={() => saveField('services_section_title', editSvcTitle)}
                        className="text-lg font-black text-gray-900 border-b-2 border-dashed border-teal-300 outline-none bg-transparent"
                      />
                      <span className="text-xs text-gray-400 font-normal">(גרור לשינוי סדר)</span>
                    </div>
                  ) : (
                    <h2 className="text-lg font-black text-gray-900">{card.services_section_title || 'השירותים שלנו'}</h2>
                  )}
                </div>

                {isEditMode ? (
                  /* ── Drag-and-drop list (edit mode) ── */
                  <Reorder.Group axis="y" values={localServices} onReorder={handleServicesReorder} className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {localServices.map((svc, i) => (
                      <Reorder.Item key={svc.id ?? i} value={svc}
                        className="bg-white rounded-2xl border-2 border-dashed border-teal-100 overflow-hidden"
                        style={{ cursor: 'grab' }}
                        whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(91,196,200,0.18)', zIndex: 10 }}>
                        <div className="flex items-stretch gap-0">
                          {/* Drag handle */}
                          <div className="flex items-center justify-center px-3 bg-teal-50/50 border-l border-teal-100 text-teal-300 hover:text-teal-500 transition-colors flex-shrink-0">
                            <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
                              <circle cx="4" cy="4" r="1.5"/><circle cx="10" cy="4" r="1.5"/>
                              <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/>
                              <circle cx="4" cy="16" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
                            </svg>
                          </div>
                          {/* Service image thumb */}
                          {svc.image_url && (
                            <div className="w-16 flex-shrink-0">
                              <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {/* Editable fields */}
                          <div className="flex-1 p-3 space-y-1.5" onPointerDown={e => e.stopPropagation()}>
                            <input
                              value={svc.title || ''}
                              onChange={e => updateLocalService(i, 'title', e.target.value)}
                              onBlur={() => saveServices(localServicesRef.current)}
                              className="w-full text-sm font-bold text-gray-900 border-b border-dashed border-gray-200 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                              placeholder="שם השירות"
                            />
                            <input
                              value={svc.description || ''}
                              onChange={e => updateLocalService(i, 'description', e.target.value)}
                              onBlur={() => saveServices(localServicesRef.current)}
                              className="w-full text-xs text-gray-500 border-b border-dashed border-gray-100 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                              placeholder="תיאור (אופציונלי)"
                            />
                            <input
                              value={svc.price || ''}
                              onChange={e => updateLocalService(i, 'price', e.target.value)}
                              onBlur={() => saveServices(localServicesRef.current)}
                              className="w-24 text-xs font-bold border-b border-dashed border-gray-100 pb-0.5 outline-none bg-transparent focus:border-teal-400"
                              style={{ color }}
                              placeholder="מחיר (אופציונלי)"
                            />
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  /* ── Grid view (normal mode) ── */
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((svc, i) => {
                      const isFull = (svc.size || 'full') !== 'half';
                      const svcWaLink = waLink
                        ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(`היי, אני מעוניין/ת בשירות: ${svc.title}`)}`
                        : null;
                      return (
                        <div key={i} className={`svc-card bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${isFull ? 'col-span-2' : 'col-span-1'}`}
                          onClick={() => svcWaLink && window.open(svcWaLink, '_blank')}>
                          {svc.image_url && (
                            <div className="relative" style={{ height: isFull ? 200 : 140 }}>
                              <img src={svc.image_url} alt={svc.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                              {svc.price && <span className="absolute top-2.5 left-2.5 font-bold rounded-lg px-2.5 py-1 text-xs text-white" style={{ background: color }}>{svc.price}</span>}
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-sm leading-tight">{svc.title}</p>
                                {svc.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{svc.description}</p>}
                                {!svc.image_url && svc.price && <span className="inline-block mt-1.5 font-bold rounded-lg px-2 py-0.5 text-xs" style={{ background: color + '18', color }}>{svc.price}</span>}
                              </div>
                              {svcWaLink && (
                                <span className="svc-cta flex-shrink-0 text-xs font-bold whitespace-nowrap transition-colors" style={{ color: '#16a34a' }}>
                                  לקביעת תור ←
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-68 flex-shrink-0 sticky top-16 space-y-3" style={{ width: 268 }}>

            {/* Main CTA */}
            {waLink && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="wa-pulse flex flex-col items-center gap-0.5 w-full py-3.5 rounded-xl text-white font-black hover:scale-[1.02] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 18px #22c55e40' }}>
                  <span className="flex items-center gap-1.5 text-sm"><WAIcon /> קבע תור עכשיו ב-WhatsApp</span>
                  <span className="text-green-100 text-xs font-normal">מענה תוך דקות ⚡</span>
                </a>
                <div className="flex items-center justify-center gap-1.5 mt-2.5 py-1.5 rounded-lg" style={{ background: '#fff7ed' }}>
                  <span className="text-xs">🔥</span>
                  <span className="text-orange-600 text-xs font-bold">3 תורים אחרונים להיום</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {card.phone && (
                    <a href={`tel:${card.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <PhoneIcon /> התקשר
                    </a>
                  )}
                  {card.booking_url && (
                    <a href={card.booking_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      קבע תור
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
              {[['👥','127+ לקוחות מרוצים'],['⚡','מענה תוך דקות'],['✓','שירות מהיר ומקצועי'],['🔒','ללא התחייבות מראש']].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs text-gray-700 font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Vizzit */}
            <div className="text-center pt-1">
              <a href="/" className="inline-flex items-center gap-1.5 opacity-35 hover:opacity-70 transition-opacity">
                <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}><LogoMark size={9} color="white" /></div>
                <span className="text-xs text-gray-500">נוצר עם <strong>Vizzit</strong></span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Floating sticky CTA (bottom) ── */}
        {waLink && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-2xl hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 6px 24px #22c55e55' }}>
              <WAIcon /> קבע תור ב-WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function WAIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}
