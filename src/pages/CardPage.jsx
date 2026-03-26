import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCardBySlug } from '../lib/cardsApi';
import CardPreview from '../components/CardPreview';
import LogoMark from '../components/LogoMark';
import { supabase } from '../lib/supabase';

export default function CardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getCardBySlug(slug)
      .then(data => {
        if (!data || !data.is_published) {
          setNotFound(true);
        } else {
          setCard(data);
          // Track view (fire and forget)
          supabase.from('cards')
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', data.id)
            .then(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}><LogoMark size={28} color="white" /></div>
          <svg className="animate-spin w-6 h-6 text-indigo-400 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4" dir="rtl">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">הדף לא נמצא</h1>
          <p className="text-gray-500 mb-6">הדף שחיפשת אינו קיים או שטרם פורסם.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            צור כרטיס משלך
          </button>
        </div>
      </div>
    );
  }

  const waLink = card.phone
    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(card.whatsapp_message || '')}`
    : null;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Full screen card on mobile, centered on desktop */}
      <div className="max-w-md mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <CardPreview data={card} compact={false} />
        </motion.div>
      </div>

      {/* Sticky action bar */}
      {card.phone && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-3 max-w-md mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '28rem' }}>
          <div className="flex gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: '#25D366' }}
            >
              <WAIcon />
              WhatsApp
            </a>
            <a
              href={`tel:${card.phone}`}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 border-gray-200 text-gray-700 bg-white"
            >
              <PhoneIcon />
              התקשר
            </a>
          </div>
        </div>
      )}

      {/* MyCard branding badge — free plan watermark */}
      <div className="fixed top-3 left-3 z-10">
        <a
          href="/"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-indigo-100 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all group"
          style={{ boxShadow: '0 2px 12px rgba(79,70,229,0.12)' }}
        >
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}><LogoMark size={12} color="white" /></div>
          <div>
            <p className="text-[10px] font-black text-gray-800 leading-tight">MyCard</p>
            <p className="text-[9px] text-indigo-400 font-medium leading-tight group-hover:text-indigo-600 transition-colors">צור כרטיס בחינם</p>
          </div>
        </a>
      </div>
    </div>
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
