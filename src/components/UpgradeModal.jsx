import { motion, AnimatePresence } from 'framer-motion';

// Configure your payment link here (Stripe, Cardcom, etc.)
const UPGRADE_URL = import.meta.env.VITE_UPGRADE_URL || null;

const FEATURES = [
  { icon: '📊', text: 'סטטיסטיקות מלאות — כניסות, לחיצות ו-WhatsApp' },
  { icon: '✨', text: 'הסרת לוגו Vizzit מהכרטיס שלך' },
  { icon: '∞', text: 'שירותים ללא הגבלה' },
  { icon: '⚡', text: 'תמיכה מועדפת בוואטסאפ' },
];

export default function UpgradeModal({ isOpen, onClose, viewsCount = 0, cardName = '' }) {
  const handleUpgrade = () => {
    if (UPGRADE_URL) {
      window.open(UPGRADE_URL, '_blank');
    } else {
      // Fallback: WhatsApp to admin for manual processing
      const email = typeof window !== 'undefined'
        ? (document.querySelector('meta[name="user-email"]')?.content || '')
        : '';
      const msg = encodeURIComponent(
        `היי, רוצה לשדרג את Vizzit שלי לפרו (49₪/חודש)${email ? `. המייל שלי: ${email}` : ''}`
      );
      window.open(`https://wa.me/972500000000?text=${msg}`, '_blank');
    }
    onClose();
  };

  // Pick a dynamic headline based on views
  const viewsLine = viewsCount > 0
    ? `הכרטיס שלך${cardName ? ` "${cardName}"` : ''} קיבל כבר ${viewsCount} כניסות.`
    : `הכרטיס שלך${cardName ? ` "${cardName}"` : ''} כבר חי באוויר.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          dir="rtl"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="relative overflow-hidden px-6 pt-5 pb-6"
              style={{ background: 'linear-gradient(135deg, #1a3535 0%, #F4938C 60%, #5BC4C8 100%)' }}>
              {/* Background orb */}
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', transform: 'translate(-30%, -30%)' }} />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3 text-2xl">
                  📈
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  קבל יותר פניות<br />מהכרטיס שלך
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  {viewsLine}<br />
                  <span className="text-white/90 font-semibold">כמה מהם יצרו איתך קשר?</span>
                </p>
              </div>
            </div>

            {/* Stats preview — locked */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">מה אתה מפספס</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'כניסות', value: viewsCount > 0 ? viewsCount : '—', sub: 'השבוע', real: viewsCount > 0 },
                  { label: 'לחיצות WhatsApp', value: '🔒', sub: 'נעול', real: false },
                  { label: 'לקוחות חדשים', value: '🔒', sub: 'נעול', real: false },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl p-3 text-center ${s.real ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <p className={`text-xl font-black ${s.real ? 'text-indigo-600' : 'text-gray-300'}`}>
                      {s.value}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 leading-tight">{s.label}</p>
                    {!s.real && <p className="text-[9px] text-gray-300 mt-0.5">פרו</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div className="px-6 py-4">
              <div className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-base w-6 flex-shrink-0 text-center">{f.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="px-6 pb-6">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 8px 32px -8px rgba(91,196,200,0.5)' }}>
                <div className="px-5 py-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-black text-white">₪49</span>
                    <span className="text-white/70 text-sm font-medium">לחודש</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-white/60 text-xs flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ללא התחייבות
                    </span>
                    <span className="text-white/60 text-xs flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ביטול בכל רגע
                    </span>
                  </div>

                  <motion.button
                    onClick={handleUpgrade}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl bg-white font-black text-indigo-700 text-base transition-all"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                  >
                    שדרג עכשיו →
                  </motion.button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
              >
                אולי מאוחר יותר
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
