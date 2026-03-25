import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import AuthModal from '../components/AuthModal';
import UpgradeModal from '../components/UpgradeModal';
import { getMyCards, deleteCard } from '../lib/cardsApi';

const VISIT_KEY = 'mycard_dash_visits';

export default function DashboardPage() {
  const { user, logout, isPro } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  // Track visits → show upgrade modal after 3rd visit for free users
  useEffect(() => {
    if (!user || isPro) return;
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0') + 1;
    localStorage.setItem(VISIT_KEY, visits);
    if (visits === 3 || visits === 6) {
      setTimeout(() => setUpgradeOpen(true), 1800);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { setAuthOpen(true); return; }
    getMyCards(user.id)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (cardId) => {
    setDeletingId(cardId);
    try {
      await deleteCard(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleCopyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalViews = cards.reduce((s, c) => s + (c.views_count || 0), 0);
  const publishedCards = cards.filter(c => c.is_published);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>M</button>
            <span className="font-bold text-gray-900">MyCard</span>
            {isPro && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>PRO</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-100"
              >
                ✨ שדרג לפרו
              </button>
            )}
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              התנתק
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Free plan upgrade banner — shown when user has published cards */}
        {!isPro && publishedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setUpgradeOpen(true)}
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4F46E5 100%)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl flex-shrink-0">📊</span>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">
                    {totalViews > 0
                      ? `הכרטיס שלך קיבל ${totalViews} כניסות — כמה יצרו קשר?`
                      : 'שדרג לפרו וראה מי ביקר בכרטיס שלך'}
                  </p>
                  <p className="text-white/60 text-xs">₪49/חודש · ללא התחייבות</p>
                </div>
              </div>
              <span className="flex-shrink-0 text-xs font-bold bg-white text-indigo-700 px-3 py-1.5 rounded-xl whitespace-nowrap">
                שדרג →
              </span>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">הדפים שלי</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {cards.length > 0 ? `${cards.length} דף${cards.length !== 1 ? 'ים' : ''} · ${publishedCards.length} פורסמו` : 'נהל את כרטיסי הביקור שלך'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/builder')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px -2px rgba(79,70,229,0.35)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            דף חדש
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState onCreateClick={() => navigate('/builder')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {cards.map((card, i) => (
                <CardItem
                  key={card.id}
                  card={card}
                  index={i}
                  isPro={isPro}
                  copied={copied}
                  deletingId={deletingId}
                  onEdit={() => navigate(`/builder/${card.id}`)}
                  onView={() => window.open(`/c/${card.slug}`, '_blank')}
                  onCopy={() => handleCopyLink(card.slug)}
                  onPublish={() => navigate(`/builder/${card.id}`)}
                  onDelete={() => setConfirmDelete(card.id)}
                  onUpgrade={() => setUpgradeOpen(true)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">מחיקת דף</h3>
              <p className="text-sm text-gray-500 text-center mb-5">פעולה זו אינה ניתנת לביטול.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">ביטול</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingId === confirmDelete ? 'מוחק...' : 'מחק'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        viewsCount={totalViews}
        cardName={publishedCards[0]?.business_name || ''}
      />

      <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); navigate('/'); }} onSuccess={() => setAuthOpen(false)} />
    </div>
  );
}

// ─── Card item ────────────────────────────────────────────────────────────────
function CardItem({ card, index, isPro, copied, onEdit, onView, onCopy, onPublish, onDelete, onUpgrade }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center justify-between px-4"
        style={{ background: `linear-gradient(135deg, ${card.primary_color || '#4F46E5'}, ${card.primary_color || '#4F46E5'}cc)` }}
      >
        <div className="flex items-center gap-2.5">
          {card.avatar_url ? (
            <img src={card.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white/40" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate leading-tight">{card.business_name || 'ללא שם'}</p>
            <p className="text-white/60 text-[11px] truncate">{card.slug}.mycard.co.il</p>
          </div>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
          style={card.is_published
            ? { background: '#10B981', color: 'white' }
            : { background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
        >
          {card.is_published ? 'פורסם' : 'טיוטה'}
        </span>
      </div>

      <div className="p-4">
        {card.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-1">{card.description}</p>
        )}

        {/* Stats row */}
        <div className="flex gap-2 mb-4">
          {/* Views — free users can see this */}
          <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p className="text-base font-black text-gray-800">{card.views_count || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">כניסות</p>
          </div>

          {/* WhatsApp clicks — locked for free */}
          <div
            className={`flex-1 rounded-xl px-3 py-2 text-center relative overflow-hidden ${isPro ? 'bg-green-50' : 'bg-slate-50 cursor-pointer'}`}
            onClick={!isPro ? onUpgrade : undefined}
          >
            {isPro ? (
              <>
                <p className="text-base font-black text-green-600">{card.clicks_count || 0}</p>
                <p className="text-[10px] text-green-500 font-medium">WhatsApp</p>
              </>
            ) : (
              <>
                <div className="blur-sm select-none">
                  <p className="text-base font-black text-gray-400">—</p>
                  <p className="text-[10px] text-gray-300 font-medium">WhatsApp</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-400 bg-white/90 px-1.5 py-0.5 rounded-full">🔒 פרו</span>
                </div>
              </>
            )}
          </div>

          {/* Services count */}
          <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p className="text-base font-black text-gray-800">{card.card_services?.length || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">שירותים</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            ערוך
          </button>

          {card.is_published ? (
            <div className="grid grid-cols-2 gap-1.5">
              <a
                href={`/c/${card.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </a>
              <button
                onClick={onCopy}
                className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-colors ${copied === card.slug ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {copied === card.slug
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                }
              </button>
            </div>
          ) : (
            <button
              onClick={onPublish}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              פרסם
            </button>
          )}
        </div>

        <button
          onClick={onDelete}
          className="w-full mt-2 py-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          מחק דף
        </button>
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreateClick }) {
  return (
    <motion.div className="text-center py-16" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">עדיין אין לך דפים</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">צור את כרטיס הביקור הדיגיטלי הראשון שלך</p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px -2px rgba(79,70,229,0.35)' }}
      >
        צור דף ראשון
      </button>
    </motion.div>
  );
}
