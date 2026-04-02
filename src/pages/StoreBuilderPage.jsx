import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import LogoMark from '../components/LogoMark';
import { uploadCardImage } from '../lib/cardsApi';

// ─── Trust badge SVGs ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'bit', label: 'bit' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'apple', label: 'Apple Pay' },
];

function PaymentBadge({ id }) {
  if (id === 'visa') return (
    <div style={{ background: '#1a1f71', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center' }}>
      <span style={{ color: 'white', fontWeight: 900, fontSize: 11, fontStyle: 'italic', letterSpacing: '-0.5px' }}>VISA</span>
    </div>
  );
  if (id === 'mastercard') return (
    <div style={{ background: 'white', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #eee' }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#EB001B' }} />
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#F79E1B', marginLeft: -6 }} />
    </div>
  );
  if (id === 'bit') return (
    <div style={{ background: '#ff6b35', borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ color: 'white', fontWeight: 900, fontSize: 11 }}>bit</span>
    </div>
  );
  if (id === 'paypal') return (
    <div style={{ background: '#003087', borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ color: 'white', fontWeight: 900, fontSize: 10 }}>Pay<span style={{ color: '#009cde' }}>Pal</span></span>
    </div>
  );
  if (id === 'apple') return (
    <div style={{ background: '#000', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
      <svg width="10" height="12" viewBox="0 0 14 17" fill="white"><path d="M12.5 8.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.8-.8-3-.8C2.8 3.5.7 4.8.7 7.9c0 2 .8 4.1 1.8 5.5.9 1.3 1.8 2.6 3 2.6 1.2-.1 1.6-.8 3-.8s1.8.8 3 .8c1.3 0 2.1-1.3 2.9-2.6.5-.7.9-1.5 1.2-2.4-2.7-1.1-2.1-4.5-.1-5.2zM9.8 2.3C10.6 1.3 11.1.1 11 .1 9.9.1 8.5.8 7.6 1.8c-.8 1-.6 2-.5 2.1 1.1 0 2.2-.8 2.7-1.6z"/></svg>
      <span style={{ color: 'white', fontWeight: 700, fontSize: 9 }}>Pay</span>
    </div>
  );
  return null;
}

// ─── Store Preview (phone) ─────────────────────────────────────────────────────
function StorePreview({ data, onBuy }) {
  const { image, name, tagline, price, originalPrice, ctaText, description, bullets, paymentMethods, reviews, accentColor, storeName } = data;
  const accent = accentColor || '#F4938C';
  const hasImage = !!image;

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo', 'Segoe UI', sans-serif", background: '#f8f9fa', minHeight: '100%', overflowY: 'auto' }}>
      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: hasImage ? 240 : 160, background: hasImage ? 'transparent' : `linear-gradient(135deg, ${accent}33, ${accent}11)`, overflow: 'hidden' }}>
        {hasImage ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>העלה תמונת מוצר</span>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,0.3))' }} />
        {/* Store name badge */}
        {storeName && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px' }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{storeName}</span>
          </div>
        )}
      </div>

      {/* Content card */}
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', marginTop: -16, position: 'relative', padding: '16px 14px 80px' }}>
        {/* Product name + tagline */}
        <h1 style={{ fontSize: 18, fontWeight: 900, color: '#111', margin: '0 0 4px', lineHeight: 1.2 }}>
          {name || 'שם המוצר'}
        </h1>
        {tagline && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px' }}>{tagline}</p>}

        {/* Stars + reviews count */}
        {reviews && reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= 4.5 ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span style={{ fontSize: 10, color: '#6b7280' }}>({reviews.length} ביקורות)</span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: accent }}>₪{price || '0'}</span>
          {originalPrice && <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>₪{originalPrice}</span>}
          {originalPrice && price && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: '#d1fae5', padding: '2px 6px', borderRadius: 20 }}>
            {Math.round((1 - Number(price) / Number(originalPrice)) * 100)}% הנחה
          </span>}
        </div>

        {/* CTA Button */}
        <button
          onClick={onBuy}
          style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: `linear-gradient(135deg, ${accent}, #5BC4C8)`, color: 'white', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 10, boxShadow: `0 4px 16px ${accent}44` }}>
          {ctaText || 'קנה עכשיו'}
        </button>

        {/* Payment badges */}
        {paymentMethods && paymentMethods.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {paymentMethods.map(id => <PaymentBadge key={id} id={id} />)}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#f3f4f6', margin: '14px 0' }} />

        {/* What's included */}
        {bullets && bullets.filter(b => b.trim()).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 }}>מה כלול?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bullets.filter(b => b.trim()).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 6 }}>אודות המוצר</p>
            <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description}</p>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.filter(r => r.text).length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 10 }}>מה אומרים הלקוחות</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reviews.filter(r => r.text).map((r, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, #5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 800 }}>{(r.name || 'א')[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#111', margin: 0 }}>{r.name || 'לקוח מרוצה'}</p>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(s => <svg key={s} width="9" height="9" viewBox="0 0 24 24" fill={s <= (r.rating || 5) ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #f3f4f6', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>מחיר</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: accent, margin: 0 }}>₪{price || '0'}</p>
        </div>
        <button onClick={onBuy} style={{ flex: 2, padding: '11px 0', borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #5BC4C8)`, color: 'white', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          {ctaText || 'קנה עכשיו'} →
        </button>
      </div>
    </div>
  );
}

// ─── Demo Checkout Modal ───────────────────────────────────────────────────────
function CheckoutModal({ data, onClose }) {
  const [step, setStep] = useState('form'); // form | success
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const accent = data.accentColor || '#F4938C';

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('success'); }, 1800);
  };

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        dir="rtl"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, position: 'relative', zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}
        className="md:rounded-2xl md:mb-0"
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '12px auto 0' }} />

        {step === 'success' ? (
          <div style={{ padding: '32px 24px 40px', textAlign: 'center' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </motion.div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 8 }}>התשלום הצליח! 🎉</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>ההזמנה שלך התקבלה בהצלחה</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 28 }}>אישור נשלח לאימייל שלך</p>
            <div style={{ background: '#f0fdf4', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#374151', margin: '0 0 4px', fontWeight: 600 }}>{data.name || 'המוצר'}</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#10B981' }}>₪{data.price || '0'}</p>
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' }}>
              סגור
            </button>
            <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 12 }}>⚠️ זהו תשלום דמו — לא בוצעה עסקה אמיתית</p>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#111', margin: 0 }}>השלמת הרכישה</h2>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>זהו תהליך תשלום דמו</p>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Order summary */}
            <div style={{ background: '#f9fafb', borderRadius: 14, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              {data.image && <img src={data.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name || 'המוצר'}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>כמות: 1</p>
              </div>
              <p style={{ fontSize: 16, fontWeight: 900, color: accent, flexShrink: 0 }}>₪{data.price || '0'}</p>
            </div>

            {/* Card form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>מספר כרטיס</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={cardNum}
                    onChange={e => setCardNum(formatCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    dir="ltr"
                    style={{ width: '100%', padding: '11px 40px 11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', letterSpacing: '1px', background: '#fafafa' }}
                  />
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3 }}>
                    <div style={{ width: 12, height: 8, borderRadius: 2, background: '#EB001B' }} />
                    <div style={{ width: 12, height: 8, borderRadius: 2, background: '#F79E1B', marginLeft: -5 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>תוקף</label>
                  <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" dir="ltr"
                    style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>CVV</label>
                  <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••"
                    style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>ת.ז.</label>
                  <input placeholder="000000000"
                    style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>שם בעל הכרטיס</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Israel Israeli"
                  dir="ltr"
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 14, background: `linear-gradient(135deg, ${accent}, #5BC4C8)`, color: 'white', fontWeight: 900, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'opacity 0.15s', marginTop: 4, boxShadow: `0 4px 20px ${accent}44` }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    מעבד תשלום...
                  </span>
                ) : `שלם ₪${data.price || '0'}`}
              </button>

              {/* Security note */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>תשלום מאובטח · SSL מוצפן</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Builder ──────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  storeName: '',
  image: '',
  name: '',
  tagline: '',
  price: '',
  originalPrice: '',
  ctaText: 'קנה עכשיו',
  description: '',
  bullets: ['', '', ''],
  paymentMethods: ['visa', 'mastercard', 'bit'],
  reviews: [
    { name: 'דני כהן', rating: 5, text: 'מוצר מעולה, ממליץ בחום!' },
    { name: 'שירה לוי', rating: 5, text: 'שירות מהיר ואיכות גבוהה' },
  ],
  accentColor: '#F4938C',
};

export default function StoreBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(DEFAULT_DATA);
  const [activeSection, setActiveSection] = useState('product');
  const [showCheckout, setShowCheckout] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(true);
  const fileRef = useRef(null);

  // Mobile bottom-sheet states
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showPriceSheet, setShowPriceSheet] = useState(false);
  const [showColorSheet, setShowColorSheet] = useState(false);
  const [showDescSheet, setShowDescSheet] = useState(false);
  const [showBulletsSheet, setShowBulletsSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showReviewsSheet, setShowReviewsSheet] = useState(false);

  const upd = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = async (file) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadCardImage(user.id, file);
      upd('image', url);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const SECTIONS = [
    { id: 'product', label: 'מוצר', icon: '📦' },
    { id: 'details', label: 'פרטים', icon: '📝' },
    { id: 'payment', label: 'תשלום', icon: '💳' },
    { id: 'reviews', label: 'ביקורות', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              חזור
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                <span style={{ fontSize: 14 }}>🛍️</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">בילדר חנות</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#fef3c7', color: '#d97706' }}>בטא</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              שמור טיוטה
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 2px 10px rgba(244,147,140,0.4)' }}>
              פרסם חנות
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile steps bar */}
      <div className="md:hidden bg-white border-b border-gray-100">
        <div className="px-3 pt-2.5 pb-2">
          <div className="flex items-start">
            {SECTIONS.map((s, i) => {
              const currentIdx = SECTIONS.findIndex(x => x.id === activeSection);
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 mx-auto">
                    <button onClick={() => setActiveSection(s.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={activeSection === s.id
                        ? { background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', color: 'white', boxShadow: '0 2px 8px rgba(244,147,140,0.4)' }
                        : i < currentIdx
                        ? { background: '#10B981', color: 'white' }
                        : { background: '#f3f4f6', color: '#9ca3af' }}>
                      {i < currentIdx ? '✓' : s.icon}
                    </button>
                    <span className="text-[9px] font-medium text-center leading-tight w-12 break-words"
                      style={{ color: activeSection === s.id ? '#F4938C' : i < currentIdx ? '#10B981' : '#9ca3af' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < SECTIONS.length - 1 && (
                    <div className="flex-1 h-px mt-4 mx-0.5"
                      style={{ background: i < SECTIONS.findIndex(x => x.id === activeSection) ? '#10B981' : '#e5e7eb' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-6 flex gap-2 md:gap-6 items-start">

        {/* ── Form Panel ── */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">

          {/* Section tabs — desktop only */}
          <div className="hidden md:flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={activeSection === s.id
                  ? { background: 'linear-gradient(135deg, #F4938C22, #5BC4C822)', color: '#F4938C', boxShadow: '0 1px 4px rgba(244,147,140,0.2)' }
                  : { color: '#9ca3af' }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* ── Section: Product ── */}
          {activeSection === 'product' && (
            <motion.div key="product" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Image upload — hero */}
              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-sm font-bold text-gray-800 mb-3">תמונת המוצר</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer rounded-2xl overflow-hidden transition-all hover:opacity-90"
                  style={{ height: 220, background: data.image ? 'transparent' : 'linear-gradient(135deg, #f9fafb, #f3f4f6)', border: data.image ? 'none' : '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {data.image ? (
                    <>
                      <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 13, opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          החלף תמונה
                        </span>
                      </div>
                    </>
                  ) : uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <p className="text-sm text-gray-500">מעלה...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C22, #5BC4C822)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4938C" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">העלה תמונת מוצר</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · עד 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files?.[0])} />
                {data.image && (
                  <button onClick={() => upd('image', '')} className="text-xs text-red-400 hover:text-red-500 mt-2">הסר תמונה</button>
                )}
              </div>

              {/* Product basics */}
              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 space-y-3 md:space-y-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-xs md:text-sm font-bold text-gray-800">פרטי המוצר</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">שם העסק / חנות</label>
                    <input value={data.storeName} onChange={e => upd('storeName', e.target.value)}
                      placeholder="הממתקים של תמי"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">צבע ראשי</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={data.accentColor} onChange={e => upd('accentColor', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <span className="text-xs text-gray-500">{data.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">שם המוצר *</label>
                  <input value={data.name} onChange={e => upd('name', e.target.value)}
                    placeholder="למשל: קורס צילום מקצועי"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">תגית / טקסט משנה</label>
                  <input value={data.tagline} onChange={e => upd('tagline', e.target.value)}
                    placeholder="תיאור קצר שמופיע מתחת לשם"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">מחיר (₪) *</label>
                    <input type="number" value={data.price} onChange={e => upd('price', e.target.value)}
                      placeholder="199"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">מחיר מקורי (לפני הנחה)</label>
                    <input type="number" value={data.originalPrice} onChange={e => upd('originalPrice', e.target.value)}
                      placeholder="299"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-gray-500 mb-1">טקסט כפתור קנייה</label>
                  <div className="flex gap-2 flex-wrap">
                    {['קנה עכשיו', 'הזמן עכשיו', 'לרכישה', 'שלם ורכוש'].map(opt => (
                      <button key={opt} onClick={() => upd('ctaText', opt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                        style={data.ctaText === opt ? { borderColor: '#F4938C', background: '#fff5f4', color: '#F4938C' } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                        {opt}
                      </button>
                    ))}
                    <input value={data.ctaText} onChange={e => upd('ctaText', e.target.value)}
                      placeholder="טקסט מותאם..."
                      className="flex-1 min-w-24 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Section: Details ── */}
          {activeSection === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 space-y-3 md:space-y-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-xs md:text-sm font-bold text-gray-800">תיאור המוצר</p>
                <textarea value={data.description} onChange={e => upd('description', e.target.value)}
                  placeholder="ספר על המוצר — מה הוא עושה, למה כדאי לקנות אותו, מה מיוחד בו..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" />
              </div>

              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 space-y-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm font-bold text-gray-800">מה כלול? (רשימת יתרונות)</p>
                  <button onClick={() => upd('bullets', [...data.bullets, ''])}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                    + הוסף
                  </button>
                </div>
                {data.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F4938C22' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F4938C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <input value={b} onChange={e => { const next = [...data.bullets]; next[i] = e.target.value; upd('bullets', next); }}
                      placeholder={`יתרון ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                    {data.bullets.length > 1 && (
                      <button onClick={() => upd('bullets', data.bullets.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-400 hover:text-red-500 px-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Section: Payment ── */}
          {activeSection === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 space-y-3 md:space-y-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-xs md:text-sm font-bold text-gray-800">אמצעי תשלום (תגי אמון)</p>
                <p className="text-xs text-gray-400">בחר אילו לוגואים יוצגו מתחת לכפתור הקנייה</p>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id}
                      onClick={() => {
                        const has = data.paymentMethods.includes(pm.id);
                        upd('paymentMethods', has ? data.paymentMethods.filter(x => x !== pm.id) : [...data.paymentMethods, pm.id]);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                      style={data.paymentMethods.includes(pm.id) ? { borderColor: '#F4938C', background: '#fff5f4' } : { borderColor: '#e5e7eb', background: 'white' }}>
                      <PaymentBadge id={pm.id} />
                      <span className="text-sm font-medium text-gray-700">{pm.label}</span>
                      {data.paymentMethods.includes(pm.id) && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F4938C" strokeWidth="2.5" className="mr-auto"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed" style={{ borderColor: '#F4938C44', background: '#fff5f4' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-800">מסך סליקה דמו</p>
                    <p className="text-xs text-gray-500 mt-0.5">לחץ על "קנה עכשיו" בתצוגה המקדימה לראות את חוויית הסליקה</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Section: Reviews ── */}
          {activeSection === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 space-y-3 md:space-y-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm font-bold text-gray-800">ביקורות לקוחות</p>
                  <button onClick={() => upd('reviews', [...data.reviews, { name: '', rating: 5, text: '' }])}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                    + הוסף ביקורת
                  </button>
                </div>
                {data.reviews.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => { const next = [...data.reviews]; next[i] = { ...r, rating: s }; upd('reviews', next); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={s <= r.rating ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => upd('reviews', data.reviews.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-400 hover:text-red-500">מחק</button>
                    </div>
                    <input value={r.name} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, name: e.target.value }; upd('reviews', next); }}
                      placeholder="שם הלקוח"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                    <textarea value={r.text} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, text: e.target.value }; upd('reviews', next); }}
                      placeholder="מה אמר הלקוח?"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Phone Preview Column ── */}
        <div className="md:w-auto md:flex-shrink-0 md:sticky md:top-16 md:self-start flex justify-center md:block"
          style={{ width: showPhonePreview ? '50%' : 'auto', transition: 'width 0.3s ease', flexShrink: 0 }}>

          {/* Mobile: scaled phone + eye toggle */}
          <div className="md:hidden flex flex-col items-center gap-2">
            <AnimatePresence>
              {showPhonePreview && (
                <motion.div key="store-phone"
                  initial={{ opacity: 0, scaleY: 0.8 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.8 }}
                  transition={{ duration: 0.2 }} style={{ transformOrigin: 'top center' }}>
                  <div style={{ width: 182, height: 390, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ transform: 'scale(0.70)', transformOrigin: 'top left', width: 260, position: 'absolute', top: 0, left: 0 }}>
                      {/* Mini phone shell */}
                      <div style={{ width: 260, background: '#0a0a0a', borderRadius: 44, padding: 8, boxShadow: '0 0 0 1.5px #2a2a2a' }}>
                        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 70, height: 22, background: '#000', borderRadius: 11, zIndex: 10 }} />
                        <div style={{ borderRadius: 36, overflow: 'hidden', background: '#f8f9fa', height: 520 }}>
                          <StorePreview data={data} onBuy={() => setShowCheckout(true)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Eye toggle */}
            <button onClick={() => setShowPhonePreview(v => !v)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors hover:bg-gray-100">
              {showPhonePreview ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
              <span className="text-[9px] text-gray-400">{showPhonePreview ? 'הסתר' : 'הצג'}</span>
            </button>
          </div>

          {/* Desktop: full phone */}
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 self-stretch justify-center bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 0 3px #bbf7d0' }} />
              <span className="text-xs text-gray-500 font-medium">תצוגה חיה</span>
            </div>

            <div style={{ width: 280, height: 580, background: '#0a0a0a', borderRadius: 44, padding: 10, boxShadow: '0 0 0 1.5px #2a2a2a, 0 32px 80px rgba(0,0,0,0.25)', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#000', borderRadius: 12, zIndex: 10 }} />
              <div style={{ position: 'absolute', right: -3, top: 120, width: 3, height: 60, background: '#1a1a1a', borderRadius: '0 2px 2px 0' }} />
              <div style={{ borderRadius: 36, overflow: 'hidden', height: '100%', background: '#f8f9fa', position: 'relative' }}>
                <div style={{ height: 44, background: data.image ? 'transparent' : '#f8f9fa', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 6px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: data.image ? 'white' : '#111' }}>9:41</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <svg width="12" height="9" viewBox="0 0 17 12" fill="none">{[0,1,2,3].map(i => <rect key={i} x={i*4.5} y={12-(i+1)*3} width="3" height={(i+1)*3} rx="1" fill={data.image ? 'white' : '#111'} />)}</svg>
                    <svg width="12" height="9" viewBox="0 0 15 12" fill={data.image ? 'white' : '#111'}><path d="M7.5 9.5a1 1 0 110 2 1 1 0 010-2z"/><path d="M4.5 7a4.5 4.5 0 016 0" stroke={data.image ? 'white' : '#111'} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M2 4.5a7.5 7.5 0 0111 0" stroke={data.image ? 'white' : '#111'} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div style={{ height: '100%', overflowY: 'auto' }}>
                  <StorePreview data={data} onBuy={() => setShowCheckout(true)} />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">לחץ "קנה עכשיו" לסליקה דמו</p>
          </div>
        </div>
      </div>

      {/* Checkout demo modal */}
      <AnimatePresence>
        {showCheckout && <CheckoutModal data={data} onClose={() => setShowCheckout(false)} />}
      </AnimatePresence>
    </div>
  );
}
