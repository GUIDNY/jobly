import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import AuthModal from '../components/AuthModal';
import { getMyCards, deleteCard } from '../lib/cardsApi';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>M</button>
            <span className="font-bold text-gray-900">MyCard</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            )}
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">הדפים שלי</h1>
            <p className="text-sm text-gray-500 mt-0.5">נהל את כרטיסי הביקור הדיגיטליים שלך</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/builder')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-semibold text-sm shadow-md"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px -2px rgba(79,70,229,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            דף חדש
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
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
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden card-shadow border border-gray-100"
                >
                  {/* Card color header */}
                  <div
                    className="h-16 flex items-center justify-between px-4"
                    style={{ background: `linear-gradient(135deg, ${card.primary_color || '#4F46E5'}, ${card.primary_color || '#4F46E5'}cc)` }}
                  >
                    <div className="flex items-center gap-2.5">
                      {card.avatar_url ? (
                        <img src={card.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white/50" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">{card.business_name || 'ללא שם'}</p>
                        <p className="text-white/70 text-xs">{card.slug}.mycard.co.il</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={card.is_published ? { background: '#10B981', color: 'white' } : { background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {card.is_published ? 'פורסם' : 'טיוטה'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {card.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{card.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800">{card.views_count || 0}</p>
                        <p className="text-xs text-gray-400">צפיות</p>
                      </div>
                      <div className="w-px bg-gray-100" />
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800">{card.card_services?.length || 0}</p>
                        <p className="text-xs text-gray-400">שירותים</p>
                      </div>
                      <div className="w-px bg-gray-100" />
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-800">
                          {card.template === 1 ? '1' : card.template === 2 ? '2' : '3'}
                        </p>
                        <p className="text-xs text-gray-400">תבנית</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/builder/${card.id}`)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        ערוך
                      </button>
                      {card.is_published ? (
                        <div className="grid grid-cols-2 gap-1">
                          <a
                            href={`/c/${card.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            צפה
                          </a>
                          <button
                            onClick={() => handleCopyLink(card.slug)}
                            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                            קישור
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/builder/${card.id}?step=4`)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="10 15 15 12 10 9"/></svg>
                          פרסם
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setConfirmDelete(card.id)}
                      className="w-full mt-2 py-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      מחק דף
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              dir="rtl"
            >
              <div className="text-3xl text-center mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">מחיקת דף</h3>
              <p className="text-sm text-gray-500 text-center mb-5">פעולה זו אינה ניתנת לביטול. הדף יימחק לצמיתות.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </button>
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

      <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); navigate('/'); }} onSuccess={() => setAuthOpen(false)} />
    </div>
  );
}

function EmptyState({ onCreateClick }) {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">עדיין אין לך דפים</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        צור את כרטיס הביקור הדיגיטלי הראשון שלך ושתף אותו עם העולם
      </p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-md"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px -2px rgba(79,70,229,0.35)' }}
      >
        צור דף ראשון
      </button>
    </motion.div>
  );
}
