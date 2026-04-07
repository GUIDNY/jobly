import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import LogoMark from '../components/LogoMark';
import { uploadCardImage, createStore, updateStore, publishStore, getStoreById, checkStoreSlugAvailable, toSlug } from '../lib/cardsApi';

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

        {/* CTA Button - WhatsApp */}
        <button
          onClick={onBuy}
          style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 10, boxShadow: '0 4px 16px rgba(37,211,102,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
          {ctaText || 'הזמן בוואטסאפ'}
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
        <button onClick={onBuy} style={{ flex: 2, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
          הזמן בוואטסאפ
        </button>
      </div>
    </div>
  );
}

// ─── Demo Checkout Modal (WhatsApp) ───────────────────────────────────────────
function CheckoutModal({ data, onClose }) {
  const [sent, setSent] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const accent = data.accentColor || '#F4938C';

  const sendWhatsApp = () => {
    const msg = `שלום, אני מעוניין/ת להזמין:\n• ${data.name||'המוצר'} — ₪${data.price||'0'}${customerName ? `\n\nשם: ${customerName}` : ''}${note ? `\nהערה: ${note}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div dir="rtl" initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
        transition={{ type:'spring', damping:28, stiffness:320 }}
        style={{ background:'white', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:480, position:'relative', zIndex:1, maxHeight:'90vh', overflowY:'auto' }}
        className="md:rounded-2xl">
        <div style={{ width:40, height:4, background:'#e5e7eb', borderRadius:2, margin:'12px auto 0' }} />
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              style={{ padding:'32px 24px 48px', textAlign:'center' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 8px 32px rgba(37,211,102,0.35)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
              </div>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#111', marginBottom:8 }}>ההזמנה נשלחה! 🎉</h2>
              <p style={{ fontSize:13, color:'#6b7280', marginBottom:28, lineHeight:1.6 }}>פתחנו וואטסאפ עם פרטי ההזמנה.<br/>זהו דמו — בחנות אמיתית יישלח לבעל החנות.</p>
              <button onClick={onClose} style={{ width:'100%', padding:'14px', borderRadius:14, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', fontWeight:800, fontSize:15, border:'none', cursor:'pointer' }}>סגור</button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:'16px 20px 36px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:900, color:'#111', margin:0 }}>סיום הזמנה</h2>
                  <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>דמו — כך יראה ללקוח</p>
                </div>
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ background:'#f9fafb', borderRadius:14, padding:'12px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:12 }}>
                {data.image && <img src={data.image} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>}
                <div style={{ flex:1 }}><p style={{ fontSize:13, fontWeight:700, color:'#111', margin:0 }}>{data.name||'המוצר'}</p></div>
                <p style={{ fontSize:16, fontWeight:900, color:accent, margin:0 }}>₪{data.price||'0'}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>שם (אופציונלי)</label>
                  <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="ישראל ישראלי"
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>הערה (אופציונלי)</label>
                  <input value={note} onChange={e=>setNote(e.target.value)} placeholder="צבע, מידה, הוראות..."
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                </div>
              </div>
              <button onClick={sendWhatsApp}
                style={{ width:'100%', padding:'15px', borderRadius:14, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', fontWeight:900, fontSize:15, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 4px 20px rgba(37,211,102,0.35)', marginBottom:16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                שלח הזמנה בוואטסאפ
              </button>
              <div style={{ border:'1.5px solid #f3f4f6', borderRadius:16, padding:'12px 14px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:8, left:8, background:'linear-gradient(135deg,#F4938C,#5BC4C8)', borderRadius:20, padding:'2px 8px' }}>
                  <span style={{ fontSize:9, fontWeight:900, color:'white' }}>בקרוב</span>
                </div>
                <div style={{ opacity:0.4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, marginTop:4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span style={{ fontSize:12, fontWeight:800, color:'#374151' }}>סליקת אשראי ישירה</span>
                  </div>
                  <p style={{ fontSize:10, color:'#9ca3af', margin:0 }}>תשלום בכרטיס אשראי יתווסף בקרוב</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Multi-Store Preview ───────────────────────────────────────────────────────
function MultiStorePreview({ ms, cart, onAddToCart, onCartOpen }) {
  const accent = ms.accentColor || '#F4938C';
  const [popupCat, setPopupCat] = useState(null);
  const cartCount = (cart || []).reduce((s, i) => s + (i.qty || 1), 0);
  const hasSocial = ms.social?.whatsapp || ms.social?.instagram || ms.social?.facebook || ms.social?.tiktok || ms.social?.website;
  const featuredProducts = (ms.categories || []).flatMap(cat => (cat.products || []).filter(p => p.name && p.featured));

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Segoe UI',sans-serif", background: 'white', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto', overflowX: 'hidden' }}>

      {/* Sticky top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 10px', height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onCartOpen} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 12, background: cartCount > 0 ? accent : '#f3f4f6', color: cartCount > 0 ? 'white' : '#6b7280', fontWeight: 700, fontSize: 8, border: 'none', cursor: 'pointer' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          {cartCount > 0 ? cartCount : 'סל'}
        </button>
        {ms.logoImage
          ? <img src={ms.logoImage} alt="" style={{ height: 22, maxWidth: 80, objectFit: 'contain' }} />
          : <p style={{ fontWeight: 900, fontSize: 10, color: '#111', margin: 0 }}>{ms.storeName || 'החנות שלי'}</p>
        }
      </div>

      {/* Hero */}
      {ms.coverImage ? (
        <div style={{ position: 'relative', height: 120, overflow: 'hidden', flexShrink: 0 }}>
          <img src={ms.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.6))' }} />
          <div style={{ position: 'absolute', bottom: 8, right: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            {ms.logoImage && <img src={ms.logoImage} alt="" style={{ width: 22, height: 22, borderRadius: 6, border: '1.5px solid rgba(255,255,255,0.7)', objectFit: 'cover', flexShrink: 0 }} />}
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 10, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{ms.storeName || 'החנות שלי'}</p>
              {ms.tagline && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 7, margin: 0 }}>{ms.tagline}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', height: 100, background: `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0, overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${accent}18` }} />
          <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(91,196,200,0.12)' }} />
          {/* Add cover hint */}
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1.5px dashed rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 7, margin: 0, letterSpacing: '0.8px' }}>הוסף תמונת כריכה</p>
          {ms.storeName && <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 900, fontSize: 9, margin: 0 }}>{ms.storeName}</p>}
        </div>
      )}

      {/* About */}
      {(ms.aboutText || ms.aboutTitle) && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 8.5, fontWeight: 800, color: '#111', margin: '0 0 3px' }}>{ms.aboutTitle || 'אז מה אנחנו?'}</p>
          <p style={{ fontSize: 7.5, color: '#666', lineHeight: 1.6, margin: 0 }}>{ms.aboutText?.slice(0, 100)}{ms.aboutText?.length > 100 ? '...' : ''}</p>
        </div>
      )}

      {/* Categories */}
      {(ms.categories || []).length > 0 && (() => {
        const firstShape = (ms.categories[0] || {}).displayShape || 'banner';
        const gridCols = firstShape === 'circle' ? '1fr 1fr 1fr' : '1fr 1fr';
        return (
          <div style={{ padding: '10px 10px 6px' }}>
            <p style={{ fontSize: 8, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: '0.3px' }}>קטגוריות מובילות</p>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: firstShape === 'banner' ? 3 : 5, padding: firstShape !== 'banner' ? '0 2px' : 0 }}>
              {ms.categories.slice(0, firstShape === 'circle' ? 6 : 4).map((cat, i) => {
                const phEl = (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${accent}15`, gap: 3 }}>
                    <span style={{ fontSize: firstShape === 'circle' ? 20 : 16 }}>{cat.icon || '🛍️'}</span>
                  </div>
                );

                if (firstShape === 'circle') {
                  return (
                    <div key={i} onClick={() => cat.displayMode !== 'page' && setPopupCat(i)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 2px' }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${accent}33`, flexShrink: 0, background: '#f5f5f5' }}>
                        {cat.image ? <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : phEl}
                      </div>
                      <p style={{ fontSize: 6.5, fontWeight: 700, color: '#111', margin: 0, textAlign: 'center', lineHeight: 1.2 }}>{cat.name || 'קטגוריה'}</p>
                    </div>
                  );
                }

                if (firstShape === 'square') {
                  return (
                    <div key={i} onClick={() => cat.displayMode !== 'page' && setPopupCat(i)}
                      style={{ borderRadius: 8, overflow: 'hidden', border: '1.5px solid #ebebeb', cursor: 'pointer', background: 'white', gridColumn: cat.size === 'full' ? 'span 2' : 'span 1' }}>
                      <div style={{ width: '100%', aspectRatio: '1', background: '#f5f5f5', overflow: 'hidden' }}>
                        {cat.image ? <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : phEl}
                      </div>
                      <div style={{ padding: '4px 6px 5px' }}>
                        <p style={{ fontSize: 7.5, fontWeight: 800, color: '#111', margin: 0 }}>{cat.name || 'קטגוריה'}</p>
                        <p style={{ fontSize: 6.5, color: '#aaa', margin: 0 }}>{(cat.products||[]).filter(p=>p.name).length} פריטים</p>
                      </div>
                    </div>
                  );
                }

                // Banner (default)
                return (
                  <div key={i} onClick={() => cat.displayMode !== 'page' && setPopupCat(i)}
                    style={{ borderRadius: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative', height: cat.size === 'full' ? 70 : 56, background: '#1a1a1a', gridColumn: cat.size === 'full' ? 'span 2' : 'span 1' }}>
                    {cat.image
                      ? <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : phEl
                    }
                    {cat.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 25%, rgba(0,0,0,0.6))' }} />}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '3px 6px 5px' }}>
                      <p style={{ color: 'white', fontWeight: 800, fontSize: 7.5, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{cat.name || 'קטגוריה'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <div style={{ padding: '10px 10px 6px', borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 8, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>מוצרים מובילים</p>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {featuredProducts.map((p, i) => (
              <div key={i} style={{ flexShrink: 0, width: 72, cursor: 'pointer' }}>
                <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: '#f5f5f5', position: 'relative', marginBottom: 3 }}>
                  {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 22 }}>🛍️</span></div>}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 45%, rgba(0,0,0,0.45))' }} />
                </div>
                <p style={{ fontSize: 7, fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                {p.price && <p style={{ fontSize: 7.5, fontWeight: 900, color: accent, margin: 0 }}>₪{p.price}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: '#0f0f0f', padding: '14px 14px 18px', marginTop: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          {/* Brand */}
          <div>
            {ms.logoImage
              ? <img src={ms.logoImage} alt="" style={{ height: 20, maxWidth: 64, objectFit: 'contain', borderRadius: 4, marginBottom: 4 }} />
              : <p style={{ color: 'white', fontWeight: 900, fontSize: 9, margin: '0 0 3px' }}>{ms.storeName || 'החנות שלי'}</p>
            }
            {ms.tagline && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 6.5, margin: 0 }}>{ms.tagline?.slice(0,30)}</p>}
          </div>
          {/* Social icons */}
          {hasSocial && (
            <div style={{ display: 'flex', gap: 4 }}>
              {ms.social?.whatsapp && <div style={{ width: 14, height: 14, borderRadius: 4, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg></div>}
              {ms.social?.instagram && <div style={{ width: 14, height: 14, borderRadius: 4, background: 'linear-gradient(45deg,#f09433,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>}
              {ms.social?.facebook && <div style={{ width: 14, height: 14, borderRadius: 4, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="6" height="6" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></div>}
              {ms.social?.tiktok && <div style={{ width: 14, height: 14, borderRadius: 4, background: '#000', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="6" height="6" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.82 1.55V6.79a4.85 4.85 0 01-1.05-.1z"/></svg></div>}
              {ms.social?.website && <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>}
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.18)', margin: 0 }}>© {new Date().getFullYear()} {ms.storeName}</p>
          {(ms.terms || ms.cancelPolicy) && (
            <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.3)', margin: 0, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>תקנון</p>
          )}
        </div>
      </div>

      {/* Category Popup overlay */}
      <AnimatePresence>
        {popupCat !== null && ms.categories?.[popupCat] && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', zIndex:20, display:'flex', alignItems:'flex-end' }}
            onClick={() => setPopupCat(null)}>
            <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:320 }}
              onClick={e => e.stopPropagation()}
              style={{ width:'100%', background:'white', borderRadius:'14px 14px 0 0', padding:'10px', maxHeight:'70%', overflowY:'auto' }}>
              <div style={{ width:24, height:3, background:'#e5e7eb', borderRadius:2, margin:'0 auto 8px' }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <p style={{ fontSize:9, fontWeight:800, color:'#111', margin:0 }}>{ms.categories[popupCat].name}</p>
                <button onClick={() => setPopupCat(null)} style={{ width:18, height:18, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                {(ms.categories[popupCat].products||[]).filter(p=>p.name).map((p,pi) => (
                  <div key={pi} style={{ borderRadius:8, overflow:'hidden', background:'#f8f8f8' }}>
                    <div style={{ height:50, background: p.image ? 'transparent' : `${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                      {p.image ? <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:16 }}>📦</span>}
                      {p.price && <div style={{ position:'absolute', top:3, right:3, background:'rgba(0,0,0,0.65)', borderRadius:6, padding:'1px 4px' }}><span style={{ color:'white', fontSize:7, fontWeight:800 }}>₪{p.price}</span></div>}
                    </div>
                    <div style={{ padding:'4px 6px 5px' }}>
                      <p style={{ fontSize:7.5, fontWeight:700, color:'#111', margin:'0 0 3px' }}>{p.name}</p>
                      <button onClick={() => onAddToCart(p)} style={{ width:'100%', padding:'3px', borderRadius:5, background:`linear-gradient(135deg,${accent},#5BC4C8)`, color:'white', fontSize:7, fontWeight:800, border:'none', cursor:'pointer' }}>+ סל</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cart Sheet ────────────────────────────────────────────────────────────────
function CartSheet({ cart, onClose, onUpdateQty, onCheckout, accent }) {
  const total = cart.reduce((s, i) => s + (Number(i.price)||0) * i.qty, 0);
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div dir="rtl"
        initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
        transition={{ type:'spring', damping:28, stiffness:320 }}
        style={{ background:'white', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:480, position:'relative', zIndex:1, maxHeight:'85vh', display:'flex', flexDirection:'column' }}
        className="md:rounded-2xl md:mb-0">
        <div style={{ width:40, height:4, background:'#e5e7eb', borderRadius:2, margin:'12px auto 0' }} />
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 style={{ fontSize:16, fontWeight:900, color:'#111', margin:0 }}>🛒 סל קניות</h2>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:36 }}>🛒</p>
              <p style={{ fontSize:14, color:'#9ca3af', marginTop:8 }}>הסל ריק</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:14, border:'1px solid #f3f4f6', background:'#fafafa' }}>
              <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', flexShrink:0, background: item.image ? 'transparent' : `${accent||'#F4938C'}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {item.image ? <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:20 }}>📦</span>}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#111', margin:'0 0 2px' }}>{item.name}</p>
                <p style={{ fontSize:12, fontWeight:900, color: accent||'#F4938C', margin:0 }}>₪{item.price}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={() => onUpdateQty(i, item.qty - 1)} style={{ width:26, height:26, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700 }}>-</button>
                <span style={{ fontSize:13, fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                <button onClick={() => onUpdateQty(i, item.qty + 1)} style={{ width:26, height:26, borderRadius:'50%', background:`${accent||'#F4938C'}22`, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color: accent||'#F4938C' }}>+</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding:'12px 20px 24px', borderTop:'1px solid #f3f4f6', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#374151' }}>סה"כ</span>
              <span style={{ fontSize:20, fontWeight:900, color: accent||'#F4938C' }}>₪{total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} style={{ width:'100%', padding:'14px', borderRadius:14, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', fontWeight:900, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(37,211,102,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
              הזמן בוואטסאפ →
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Store Type Picker ─────────────────────────────────────────────────────────
function StoreTypePicker({ value, onChange, accent }) {
  const types = [
    { id: 'single', label: 'מוצר אחד', icon: '📦' },
    { id: 'multi', label: 'כמה מוצרים', icon: '🛍️' },
  ];
  return (
    <div className="self-stretch bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-gray-100">
      <p className="text-[10px] text-gray-400 text-center font-medium mb-2 tracking-wide uppercase">סוג חנות</p>
      <div className="flex gap-2 justify-center">
        {types.map(t => {
          const sel = value === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border-2 transition-all text-center"
              style={sel ? { borderColor: accent || '#F4938C', background: `${accent || '#F4938C'}11`, color: accent || '#F4938C' } : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Builder ──────────────────────────────────────────────────────────────
const DEFAULT_MULTI = {
  coverImage: '',
  logoImage: '',
  storeName: '',
  tagline: '',
  accentColor: '#F4938C',
  aboutTitle: '',
  aboutText: '',
  social: { instagram: '', facebook: '', tiktok: '', whatsapp: '', website: '' },
  terms: '',
  cancelPolicy: '',
  categories: [
    { id: 1, name: 'קטגוריה 1', icon: '🛍️', image: '', displayMode: 'popup', displayShape: 'banner', products: [{ name: '', price: '', image: '', description: '', videoUrl: '', size: 'full', inStock: true, quantity: '', featured: false }] },
  ],
};

const DEFAULT_DATA = {
  storeType: 'multi',
  storeName: '',
  image: '',
  name: '',
  tagline: '',
  price: '',
  originalPrice: '',
  ctaText: 'קנה עכשיו',
  description: '',
  bullets: ['', '', ''],
  videoUrl: '',
  whatsapp: '',
  paymentMethods: ['visa', 'mastercard', 'bit'],
  reviews: [
    { name: 'דני כהן', rating: 5, text: 'מוצר מעולה, ממליץ בחום!' },
    { name: 'שירה לוי', rating: 5, text: 'שירות מהיר ואיכות גבוהה' },
  ],
  accentColor: '#F4938C',
  multi: DEFAULT_MULTI,
};

export default function StoreBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { storeId: routeStoreId } = useParams();
  const [data, setData] = useState(DEFAULT_DATA);
  const [activeSection, setActiveSection] = useState('product');
  const [showCheckout, setShowCheckout] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(true);
  const [dbStoreId, setDbStoreId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const fileRef = useRef(null);
  const coverRef = useRef(null);
  const logoRef = useRef(null);

  // Load existing store if editing
  useEffect(() => {
    if (!routeStoreId || !user) return;
    getStoreById(routeStoreId).then(store => {
      if (store) {
        setData(store.data);
        setDbStoreId(store.id);
        setPublished(store.is_published);
        setPublishedSlug(store.slug || '');
        setSlugInput(store.slug || '');
      }
    }).catch(console.error);
  }, [routeStoreId, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (dbStoreId) {
        await updateStore(dbStoreId, data);
      } else {
        const store = await createStore(user.id, data);
        setDbStoreId(store.id);
        navigate(`/store-builder/${store.id}`, { replace: true });
      }
    } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!user || !slugInput.trim()) return;
    setPublishing(true);
    try {
      let id = dbStoreId;
      if (!id) {
        const store = await createStore(user.id, data);
        id = store.id;
        setDbStoreId(id);
        navigate(`/store-builder/${id}`, { replace: true });
      } else {
        await updateStore(id, data);
      }
      await publishStore(id, slugInput.trim());
      setPublished(true);
      setPublishedSlug(slugInput.trim());
    } catch(e) { console.error(e); alert('שגיאה בפרסום: ' + e.message); } finally { setPublishing(false); }
  };

  const checkSlug = async (val) => {
    setSlugInput(val);
    if (!val || val.length < 2) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const ok = await checkStoreSlugAvailable(val, dbStoreId);
    setSlugAvailable(ok);
    setSlugChecking(false);
  };

  const storeType = data.storeType || 'single';
  const setStoreType = (t) => upd('storeType', t);
  const ms = data.multi || DEFAULT_MULTI;
  const updMulti = (key, val) => setData(prev => ({ ...prev, multi: { ...(prev.multi || DEFAULT_MULTI), [key]: val } }));
  const updMultiSocial = (key, val) => updMulti('social', { ...ms.social, [key]: val });
  const updCategory = (idx, patch) => {
    const cats = [...(ms.categories || [])];
    cats[idx] = { ...cats[idx], ...patch };
    updMulti('categories', cats);
  };
  const updProduct = (catIdx, prodIdx, patch) => {
    const cats = [...(ms.categories || [])];
    const prods = [...(cats[catIdx].products || [])];
    prods[prodIdx] = { ...prods[prodIdx], ...patch };
    cats[catIdx] = { ...cats[catIdx], products: prods };
    updMulti('categories', cats);
  };

  // Multi-store steps
  const MULTI_STEPS = [
    { id: 'info',    label: 'חנות',     icon: '🏪' },
    { id: 'about',   label: 'אודות',    icon: '📖' },
    { id: 'cats',    label: 'קטגוריות', icon: '📂' },
    { id: 'payment', label: 'תשלום',    icon: '💳' },
    { id: 'footer',  label: 'פוטר ופרסום', icon: '🔗' },
  ];
  const [multiStep, setMultiStep] = useState('info');

  // Cart
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === product.name);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; return n; }
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateCartQty = (idx, qty) => {
    if (qty <= 0) setCart(prev => prev.filter((_, i) => i !== idx));
    else setCart(prev => { const n = [...prev]; n[idx] = { ...n[idx], qty }; return n; });
  };

  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleCoverUpload = async (file) => {
    if (!file || !user) return;
    setUploadingCover(true);
    try { const url = await uploadCardImage(user.id, file); updMulti('coverImage', url); }
    catch(e) { console.error(e); } finally { setUploadingCover(false); }
  };
  const handleLogoUpload = async (file) => {
    if (!file || !user) return;
    setUploadingLogo(true);
    try { const url = await uploadCardImage(user.id, file); updMulti('logoImage', url); }
    catch(e) { console.error(e); } finally { setUploadingLogo(false); }
  };
  const handleProductImageUpload = async (catIdx, prodIdx, file) => {
    if (!file || !user) return;
    try { const url = await uploadCardImage(user.id, file); updProduct(catIdx, prodIdx, { image: url }); }
    catch(e) { console.error(e); }
  };
  const handleCategoryImageUpload = async (catIdx, file) => {
    if (!file || !user) return;
    try { const url = await uploadCardImage(user.id, file); updCategory(catIdx, { image: url }); }
    catch(e) { console.error(e); }
  };

  // Multi-store editing state
  const [editingCatIdx, setEditingCatIdx] = useState(null);
  const [showMultiInfoSheet, setShowMultiInfoSheet] = useState(false);
  const [showCoverLogoSheet, setShowCoverLogoSheet] = useState(false);
  const [showSocialSheet, setShowSocialSheet] = useState(false);

  // Mobile bottom-sheet states
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showPriceSheet, setShowPriceSheet] = useState(false);
  const [showColorSheet, setShowColorSheet] = useState(false);
  const [showDescSheet, setShowDescSheet] = useState(false);
  const [showBulletsSheet, setShowBulletsSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showMultiPaymentSheet, setShowMultiPaymentSheet] = useState(false);
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
    { id: 'product', label: 'מוצר', icon: '📸' },
    { id: 'details', label: 'פרטים', icon: '✍️' },
    { id: 'payment', label: 'תשלום', icon: '💳' },
    { id: 'reviews', label: 'ביקורות', icon: '⭐' },
    { id: 'publish', label: 'פרסום', icon: '🚀' },
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
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60">
              {saving ? 'שומר...' : dbStoreId ? 'שמור' : 'שמור טיוטה'}
            </button>
            {published && publishedSlug && (
              <a href={`/store/${publishedSlug}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: '#10B981', color: 'white' }}>
                צפה בחנות ↗
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile steps bar — single product only */}
      <div className={`${storeType !== 'single' ? 'hidden' : 'md:hidden'} bg-white border-b border-gray-100`}>
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

      {/* Multi-store steps bar — mobile */}
      {storeType === 'multi' && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-3 pt-2.5 pb-2">
            <div className="flex items-start">
              {MULTI_STEPS.map((s, i) => {
                const currentIdx = MULTI_STEPS.findIndex(x => x.id === multiStep);
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mx-auto">
                      <button onClick={() => setMultiStep(s.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                        style={multiStep === s.id
                          ? { background:'linear-gradient(135deg,#F4938C,#5BC4C8)', color:'white', boxShadow:'0 2px 8px rgba(244,147,140,0.4)' }
                          : i < currentIdx
                          ? { background:'#10B981', color:'white' }
                          : { background:'#f3f4f6', color:'#9ca3af' }}>
                        {i < currentIdx ? '✓' : s.icon}
                      </button>
                      <span className="text-[8px] font-medium text-center leading-tight w-10 break-words"
                        style={{ color: multiStep === s.id ? '#F4938C' : i < currentIdx ? '#10B981' : '#9ca3af' }}>
                        {s.label}
                      </span>
                    </div>
                    {i < MULTI_STEPS.length - 1 && (
                      <div className="flex-1 h-px mt-3.5 mx-0.5"
                        style={{ background: i < MULTI_STEPS.findIndex(x => x.id === multiStep) ? '#10B981' : '#e5e7eb' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-6 flex gap-2 md:gap-6 items-start">

        {/* ── Form Panel ── */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">

          {/* Section tabs — desktop only, single product mode */}
          <div className={`${storeType === 'multi' ? 'hidden' : 'hidden md:flex'} gap-2 bg-white rounded-2xl p-1.5 border border-gray-100`} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
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

          {/* Desktop multi steps bar */}
          {storeType === 'multi' && (
            <div className="hidden md:flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              {MULTI_STEPS.map((s, i) => {
                const currentIdx = MULTI_STEPS.findIndex(x => x.id === multiStep);
                return (
                  <button key={s.id} onClick={() => setMultiStep(s.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={multiStep === s.id
                      ? { background:'linear-gradient(135deg,#F4938C22,#5BC4C822)', color:'#F4938C', boxShadow:'0 1px 4px rgba(244,147,140,0.2)' }
                      : i < currentIdx ? { color:'#10B981' } : { color:'#9ca3af' }}>
                    <span style={{ fontSize:14 }}>{i < currentIdx ? '✓' : s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Section: Product ── */}
          {storeType === 'single' && activeSection === 'product' && (
            <motion.div key="product" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* ── Hero image upload — BIG, cinematic ── */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer overflow-hidden transition-all group"
                  style={{ height: data.image ? 200 : 160, background: data.image ? 'transparent' : `linear-gradient(135deg, ${data.accentColor}18 0%, ${data.accentColor}08 100%)` }}
                >
                  {data.image ? (
                    <>
                      <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span className="text-xs font-bold text-gray-700">החלף תמונה</span>
                        </div>
                      </div>
                    </>
                  ) : uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: data.accentColor }}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      <p className="text-sm font-medium text-gray-500">מעלה תמונה...</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${data.accentColor}22`, border: `2px dashed ${data.accentColor}55` }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={data.accentColor} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-800">הוסיפו תמונה שתמכור אתכם</p>
                        <p className="text-xs text-gray-400 mt-1">תמונה אחת טובה שווה אלף מילים — JPG, PNG עד 10MB</p>
                      </div>
                      <div className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${data.accentColor}, #5BC4C8)` }}>
                        בחר תמונה
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files?.[0])} />
                {data.image && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400">התמונה מוצגת בדף המוצר שלך</p>
                    <button onClick={() => upd('image', '')} className="text-[10px] text-red-400 font-medium hover:text-red-500">הסר</button>
                  </div>
                )}
              </div>

              {/* ── Mobile compact buttons ── */}
              <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="px-1 pb-1">
                  <p className="text-xs font-bold text-gray-800">עוד רגע — מלאו את הפרטים</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">3 שדות ותהיה מוכן להשיק</p>
                </div>
                <button onClick={() => setShowProductSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: data.name ? '#d1fae5' : '#f9fafb' }}>
                    <span className="text-sm">{data.name ? '✓' : '🏷️'}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">{data.name || 'שם המוצר'}</p>
                    <p className="text-[10px] text-gray-400">{data.name ? (data.tagline || 'הוסיפו תגית') : 'על מה אתם מוכרים?'}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={() => setShowPriceSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: data.price ? '#d1fae5' : '#f9fafb' }}>
                    <span className="text-sm">{data.price ? '✓' : '💰'}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">{data.price ? `₪${data.price}` : 'מחיר'}</p>
                    <p className="text-[10px] text-gray-400">{data.originalPrice ? `היה ₪${data.originalPrice} — ${Math.round((1-data.price/data.originalPrice)*100)}% הנחה` : 'כמה עולה המוצר?'}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={() => setShowColorSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow" style={{ background: data.accentColor }} />
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">{data.storeName || 'שם החנות'}</p>
                    <p className="text-[10px] text-gray-400">צבע מותג + שם העסק</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* ── Desktop full form ── */}
              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div>
                  <p className="text-sm font-bold text-gray-900">המוצר שלך</p>
                  <p className="text-xs text-gray-400 mt-0.5">כמה שניות מפרידות בינך לבין דף מכירה מקצועי</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">שם החנות / העסק</label>
                    <input value={data.storeName} onChange={e => upd('storeName', e.target.value)} placeholder="הממתקים של תמי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                    <p className="text-[10px] text-gray-400 mt-1">מופיע בפינה העליונה של הדף</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">צבע מותג</label>
                    <div className="flex items-center gap-2.5">
                      <input type="color" value={data.accentColor} onChange={e => upd('accentColor', e.target.value)} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                      <div className="flex gap-1.5 flex-wrap">
                        {['#F4938C','#5BC4C8','#6366f1','#10B981','#F59E0B','#8B5CF6','#EC4899','#EF4444'].map(c => (
                          <button key={c} onClick={() => upd('accentColor', c)} className="w-6 h-6 rounded-full border-2 transition-all flex-shrink-0"
                            style={{ background:c, borderColor: data.accentColor===c ? '#111' : 'transparent', transform: data.accentColor===c ? 'scale(1.2)' : 'scale(1)' }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">צבע הכפתורים והפרטים בדף</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">שם המוצר *</label>
                  <input value={data.name} onChange={e => upd('name', e.target.value)} placeholder="קורס צילום מקצועי · שמלת כלה · עיסוי שוודי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                  <p className="text-[10px] text-gray-400 mt-1">הכותרת הראשית — תהיה ברורה וממוקדת</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">משפט שיווקי</label>
                  <input value={data.tagline} onChange={e => upd('tagline', e.target.value)} placeholder="למשל: &quot;הקורס שישנה את הדרך שאתה רואה את העולם&quot;" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                  <p className="text-[10px] text-gray-400 mt-1">שורה קצרה מתחת לכותרת — מה הופך את המוצר שלך לייחודי?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">מחיר מכירה ₪ *</label>
                    <input type="number" value={data.price} onChange={e => upd('price', e.target.value)} placeholder="199" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors font-bold" dir="ltr" />
                    <p className="text-[10px] text-gray-400 mt-1">המחיר שהלקוח משלם היום</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">מחיר מקורי ₪ <span className="font-normal text-gray-400">(אופציונלי)</span></label>
                    <input type="number" value={data.originalPrice} onChange={e => upd('originalPrice', e.target.value)} placeholder="299" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" dir="ltr" />
                    <p className="text-[10px] text-gray-400 mt-1">יוצג עם קו ממחיקה — מדגיש את ההנחה</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">טקסט כפתור הקנייה</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { text: 'קנה עכשיו', emoji: '🛒' },
                      { text: 'הזמן עכשיו', emoji: '📲' },
                      { text: 'לרכישה', emoji: '✨' },
                      { text: 'שלם ורכוש', emoji: '💳' },
                    ].map(opt => (
                      <button key={opt.text} onClick={() => upd('ctaText', opt.text)}
                        className="px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5"
                        style={data.ctaText === opt.text
                          ? { borderColor: data.accentColor, background: data.accentColor + '12', color: data.accentColor }
                          : { borderColor: '#e5e7eb', color: '#6b7280', background: 'white' }}>
                        <span>{opt.emoji}</span>{opt.text}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">הטקסט שיופיע על כפתור הרכישה הירוק</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Section: Details ── */}
          {storeType === 'single' && activeSection === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* Mobile compact */}
              <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="px-1 pb-1">
                  <p className="text-xs font-bold text-gray-800">ספרו את הסיפור של המוצר</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">תיאור טוב מכפיל את הסיכוי לרכישה</p>
                </div>
                <button onClick={() => setShowDescSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: data.description ? '#d1fae5' : '#f9fafb' }}>
                    <span className="text-sm">{data.description ? '✓' : '✍️'}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">{data.description ? 'תיאור נוסף ✓' : 'תיאור המוצר'}</p>
                    <p className="text-[10px] text-gray-400">למה הלקוח חייב את זה?</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={() => setShowBulletsSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: data.bullets.filter(b=>b.trim()).length > 0 ? '#d1fae5' : '#f9fafb' }}>
                    <span className="text-sm">{data.bullets.filter(b=>b.trim()).length > 0 ? '✓' : '✅'}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">מה כלול?</p>
                    <p className="text-[10px] text-gray-400">
                      {data.bullets.filter(b=>b.trim()).length > 0
                        ? `${data.bullets.filter(b=>b.trim()).length} יתרונות מוגדרים`
                        : 'פרטו מה הלקוח מקבל'}
                    </p>
                  </div>
                  {data.bullets.filter(b => b.trim()).length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#10B981' }}>{data.bullets.filter(b => b.trim()).length}</span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* Desktop full */}
              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div>
                  <p className="text-sm font-bold text-gray-900">ספרו את הסיפור של המוצר</p>
                  <p className="text-xs text-gray-400 mt-0.5">לקוחות שקוראים תיאור מפורט — קונים פי 3 יותר</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">תיאור המוצר</label>
                  <textarea value={data.description} onChange={e => upd('description', e.target.value)}
                    placeholder="תארו את המוצר: מה הוא עושה, למי הוא מתאים, למה כדאי לרכוש אותו עכשיו..."
                    rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none transition-colors" />
                  <p className="text-[10px] text-gray-400 mt-1">כתבו בגוף ראשון, בשפה חמה וישירה — כאילו אתם מדברים עם לקוח</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">סרטון מוצר <span className="font-normal text-gray-400">(אופציונלי)</span></label>
                  <input value={data.videoUrl||''} onChange={e => upd('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... או קישור ישיר לוידאו"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors" dir="ltr" />
                  <p className="text-[10px] text-gray-400 mt-1">סרטון מגביר אמון — YouTube, Vimeo או קישור ישיר mp4</p>
                </div>
              </div>

              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">מה כלול במוצר?</p>
                    <p className="text-xs text-gray-400 mt-0.5">רשימת יתרונות — הדבר הראשון שלקוחות מחפשים</p>
                  </div>
                  <button onClick={() => upd('bullets', [...data.bullets, ''])}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    הוסף
                  </button>
                </div>
                {data.bullets.length === 0 && (
                  <div className="text-center py-4 rounded-xl border-2 border-dashed border-gray-100">
                    <p className="text-xs text-gray-400">לחצו "+ הוסף" כדי להוסיף יתרון ראשון</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">לדוגמה: "גישה לכל החומרים לצמיתות"</p>
                  </div>
                )}
                {data.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: data.accentColor + '22' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={data.accentColor} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <input value={b} onChange={e => { const next = [...data.bullets]; next[i] = e.target.value; upd('bullets', next); }}
                      placeholder={['גישה לכל החומרים לצמיתות','תמיכה אישית 24/7','ערבות להחזר כסף 30 יום'][i] || `יתרון ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                    <button onClick={() => upd('bullets', data.bullets.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Section: Payment ── */}
          {storeType === 'single' && activeSection === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* Mobile compact */}
              <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <button onClick={() => setShowPaymentSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <span className="text-base">💬</span>
                  <span className="text-xs font-medium text-gray-700 flex-1 text-right">וואטסאפ להזמנות</span>
                  {data.whatsapp ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#25D366' }}>✓</span> : null}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <span className="text-xs text-gray-400 flex-1 text-right">סליקת אשראי — בקרוב</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                </div>
              </div>

              {/* Desktop full — WhatsApp */}
              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">וואטסאפ להזמנות</p>
                    <p className="text-xs text-gray-400">כפתור ה-CTA יפתח שיחת וואטסאפ</p>
                  </div>
                  <span className="mr-auto text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#25D366' }}>פעיל</span>
                </div>
                <input value={data.whatsapp || ''} onChange={e => upd('whatsapp', e.target.value)}
                  placeholder="050-0000000" dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#25D366] transition-colors" />
              </div>

              {/* Desktop full — Credit card coming soon */}
              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: 0.7 }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f3f4f6' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500">סליקת אשראי ישירה</p>
                    <p className="text-xs text-gray-400">Visa · Mastercard · Bit · Apple Pay</p>
                  </div>
                  <span className="mr-auto text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                </div>
                <div className="flex gap-2 opacity-50">
                  {PAYMENT_METHODS.map(pm => <PaymentBadge key={pm.id} id={pm.id} />)}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Section: Reviews ── */}
          {storeType === 'single' && activeSection === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* Mobile compact */}
              <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="px-1 pb-1">
                  <p className="text-xs font-bold text-gray-800">הוכחה חברתית = מכירות</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">92% מהלקוחות קוראים ביקורות לפני קנייה</p>
                </div>
                <button onClick={() => setShowReviewsSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: data.reviews.filter(r=>r.text).length ? '#fef3c7' : '#f9fafb' }}>
                    <span className="text-sm">⭐</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-gray-800">ביקורות לקוחות</p>
                    <p className="text-[10px] text-gray-400">
                      {data.reviews.filter(r=>r.text).length > 0
                        ? `${data.reviews.filter(r=>r.text).length} ביקורות מוכנות`
                        : 'הוסיפו עדויות מלקוחות מרוצים'}
                    </p>
                  </div>
                  {data.reviews.filter(r => r.text).length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#F59E0B' }}>{data.reviews.filter(r => r.text).length}</span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* Desktop full */}
              <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">מה אומרים הלקוחות שלכם?</p>
                    <p className="text-xs text-gray-400 mt-0.5">92% מהאנשים קוראים ביקורות — הוסיפו לפחות 2-3</p>
                  </div>
                  <button onClick={() => upd('reviews', [...data.reviews, { name: '', rating: 5, text: '' }])}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    הוסף ביקורת
                  </button>
                </div>
                {data.reviews.length === 0 && (
                  <div className="text-center py-6 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-2xl mb-2">⭐</p>
                    <p className="text-sm font-bold text-amber-800">הוסיפו ביקורת ראשונה</p>
                    <p className="text-xs text-amber-600 mt-1">ביקורת אחת יכולה להכפיל את שיעור ההמרה</p>
                  </div>
                )}
                {data.reviews.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => { const next = [...data.reviews]; next[i] = { ...r, rating: s }; upd('reviews', next); }}
                            className="transition-transform hover:scale-110">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={s <= r.rating ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => upd('reviews', data.reviews.filter((_, idx) => idx !== i))}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">מחק</button>
                    </div>
                    <input value={r.name} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, name: e.target.value }; upd('reviews', next); }}
                      placeholder="שם הלקוח — למשל: דנה ל."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white transition-colors" />
                    <textarea value={r.text} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, text: e.target.value }; upd('reviews', next); }}
                      placeholder="&quot;המוצר שינה לי את החיים — מומלץ בחום לכולם!&quot;"
                      rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Section: Publish (single product) ── */}
          {storeType === 'single' && activeSection === 'publish' && (
            <motion.div key="publish" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-3">

              {/* Hero publish card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                {!published ? (
                  <>
                    <div className="text-center mb-5">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #F4938C22, #5BC4C822)' }}>🚀</div>
                      <p className="text-base font-black text-gray-900">מוכנים להשיק?</p>
                      <p className="text-xs text-gray-400 mt-1">בחרו כתובת קצרה ושלחו ללקוחות — זה כל מה שנשאר</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">כתובת החנות שלך</label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border-2 transition-colors"
                          style={{ borderColor: slugAvailable === true ? '#10B981' : slugAvailable === false ? '#EF4444' : '#e5e7eb' }}>
                          <span className="text-xs text-gray-400 flex-shrink-0 font-medium">vizzit.online/store/</span>
                          <input value={slugInput} onChange={e => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                            placeholder="my-store" dir="ltr"
                            className="flex-1 bg-transparent text-sm font-bold text-gray-900 outline-none" />
                          {slugChecking && <svg className="animate-spin w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                          {!slugChecking && slugAvailable === true && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                          {!slugChecking && slugAvailable === false && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                        </div>
                        {slugInput.length < 2 && (
                          <button onClick={() => { const s = toSlug(data.storeName || data.name || 'my-store'); checkSlug(s); }}
                            className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: data.accentColor }}>
                            ⚡ הצע כתובת אוטומטית
                          </button>
                        )}
                        {slugAvailable === false && <p className="text-xs text-red-500 mt-1 font-medium">הכתובת תפוסה — נסו שם אחר</p>}
                        {slugAvailable === true && <p className="text-xs text-green-600 mt-1 font-medium">✓ הכתובת פנויה ומוכנה!</p>}
                        {slugAvailable === true && <p className="text-[10px] text-gray-400 mt-0.5">vizzit.online/store/{slugInput}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg,#10B98122,#10B98111)' }}>🎉</div>
                    <p className="text-base font-black text-gray-900">החנות שלך חיה!</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">שתפו את הקישור עם לקוחות — כבר עכשיו</p>
                    <div className="bg-green-50 rounded-xl p-3 border border-green-200 mb-3">
                      <a href={`/store/${publishedSlug}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-green-700 break-all hover:underline">
                        vizzit.online/store/{publishedSlug} ↗
                      </a>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 text-right">עדכון כתובת</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                        <span className="text-xs text-gray-400 flex-shrink-0">vizzit.online/store/</span>
                        <input value={slugInput} onChange={e => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                          placeholder="my-store" dir="ltr" className="flex-1 bg-transparent text-sm font-bold text-gray-800 outline-none" />
                        {slugAvailable === true && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        {slugAvailable === false && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200 disabled:opacity-60 hover:bg-gray-50 transition-colors">
                  {saving ? 'שומר...' : 'שמור טיוטה'}
                </button>
                <button onClick={handlePublish} disabled={publishing || !slugInput || slugAvailable === false}
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-white disabled:opacity-50 transition-all"
                  style={{ background: published ? '#10B981' : 'linear-gradient(135deg,#F4938C,#5BC4C8)', boxShadow: published ? '0 4px 16px rgba(16,185,129,0.35)' : '0 4px 16px rgba(244,147,140,0.35)' }}>
                  {publishing ? 'מפרסם...' : published ? '✓ עדכן ופרסם מחדש' : '🚀 פרסמו את החנות שלכם'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Single product step nav buttons ── */}
          {storeType === 'single' && (() => {
            const ids = SECTIONS.map(s => s.id);
            const idx = ids.indexOf(activeSection);
            const prevId = ids[idx - 1] || null;
            const nextId = ids[idx + 1] || null;
            const nextLabels = {
              details: 'המשיכו לפרטי המוצר →',
              payment: 'הגדירו את אמצעי התשלום →',
              reviews: 'הוסיפו ביקורות →',
              publish: 'מוכנים לפרסם! →',
            };
            if (!prevId && !nextId) return null;
            return (
              <div className="flex gap-2 mt-2">
                {prevId && (
                  <button onClick={() => setActiveSection(prevId)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    חזרה
                  </button>
                )}
                {nextId && (
                  <button onClick={() => setActiveSection(nextId)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 4px 12px rgba(244,147,140,0.3)' }}>
                    {nextLabels[nextId] || 'המשך →'}
                  </button>
                )}
              </div>
            );
          })()}

          {/* ══ MULTI-STORE STEPS ══ */}
          {storeType === 'multi' && (
            <motion.div key={`multi-${multiStep}`} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} className="space-y-3">

              {/* STEP: info */}
              {multiStep === 'info' && (<>
                {/* Mobile compact buttons */}
                <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <button onClick={() => setShowMultiInfoSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-base">🏪</span>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-medium text-gray-700">{ms.storeName || 'שם החנות'}</p>
                      {ms.tagline && <p className="text-[10px] text-gray-400">{ms.tagline}</p>}
                    </div>
                    <div className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: ms.accentColor }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button onClick={() => setShowCoverLogoSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-base">🖼️</span>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-medium text-gray-700">כריכה ולוגו</p>
                      <p className="text-[10px] text-gray-400">{[ms.coverImage && 'כריכה ✓', ms.logoImage && 'לוגו ✓'].filter(Boolean).join(' · ') || 'לא הועלה עדיין'}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
                {/* Desktop full form */}
                <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-4" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-sm font-bold text-gray-800">פרטי החנות</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">שם החנות *</label>
                      <input value={ms.storeName} onChange={e => updMulti('storeName', e.target.value)} placeholder="הממתקים של תמי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">תגית</label>
                      <input value={ms.tagline} onChange={e => updMulti('tagline', e.target.value)} placeholder="הטוב ביותר בעיר" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">צבע ראשי</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={ms.accentColor} onChange={e => updMulti('accentColor', e.target.value)} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5" />
                      <div className="flex gap-2 flex-wrap">
                        {['#F4938C','#5BC4C8','#6366f1','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'].map(c => (
                          <button key={c} onClick={() => updMulti('accentColor', c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background:c, borderColor: ms.accentColor===c ? '#111' : 'transparent' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cover */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">תמונת כריכה</label>
                      <div onClick={() => coverRef.current?.click()} className="cursor-pointer hover:opacity-90 transition-opacity rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center" style={{ height:100, background: ms.coverImage ? 'transparent' : '#f9fafb' }}>
                        {ms.coverImage ? <img src={ms.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : uploadingCover ? <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <div className="text-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p className="text-[10px] text-gray-400">העלה כריכה</p></div>}
                      </div>
                      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => handleCoverUpload(e.target.files?.[0])} />
                      {ms.coverImage && <button onClick={() => updMulti('coverImage','')} className="text-[10px] text-red-400 mt-1">הסר</button>}
                    </div>
                    {/* Logo */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">לוגו</label>
                      <div onClick={() => logoRef.current?.click()} className="cursor-pointer hover:opacity-90 transition-opacity rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center" style={{ height:100, background: ms.logoImage ? 'transparent' : '#f9fafb' }}>
                        {ms.logoImage ? <img src={ms.logoImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : uploadingLogo ? <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <div className="text-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p className="text-[10px] text-gray-400">העלה לוגו</p></div>}
                      </div>
                      <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e.target.files?.[0])} />
                      {ms.logoImage && <button onClick={() => updMulti('logoImage','')} className="text-[10px] text-red-400 mt-1">הסר</button>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setMultiStep('about')} className="w-full py-3 rounded-2xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)', boxShadow:'0 4px 16px rgba(244,147,140,0.3)' }}>
                  הבא: אודות החנות →
                </button>
              </>)}

              {/* STEP: about */}
              {multiStep === 'about' && (<>
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 space-y-4" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-0.5">אודות החנות</p>
                    <p className="text-xs text-gray-400">סיפור אישי, מי אתם, מה מיוחד בכם — יוצג בדף החנות</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">כותרת (אופציונלי)</label>
                    <input value={ms.aboutTitle||''} onChange={e => updMulti('aboutTitle', e.target.value)} placeholder="הסיפור שלנו" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">הסיפור / אודות</label>
                    <textarea value={ms.aboutText||''} onChange={e => updMulti('aboutText', e.target.value)}
                      placeholder="ספרו על העסק שלכם — מתי הוקם, מה הערכים שלכם, מה מייחד אתכם מאחרים..."
                      rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMultiStep('info')} className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200">← חזור</button>
                  <button onClick={() => setMultiStep('cats')} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>הבא: קטגוריות →</button>
                </div>
              </>)}

              {/* STEP: cats */}
              {multiStep === 'cats' && (<>
                {/* Mobile compact */}
                <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-3" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  {/* Global shape picker - mobile */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">צורת תצוגה לכל הקטגוריות</p>
                    <div className="flex gap-2">
                      {[
                        { v:'banner', label:'באנר', icon:'🖼' },
                        { v:'square', label:'כרטיס', icon:'▪️' },
                        { v:'circle', label:'עיגול', icon:'⬤' },
                      ].map(opt => (
                        <button key={opt.v}
                          onClick={() => updMulti('categories', (ms.categories||[]).map(c => ({ ...c, displayShape: opt.v })))}
                          className="flex-1 py-1.5 px-1 rounded-xl border-2 text-[10px] font-bold transition-all text-center"
                          style={((ms.categories||[])[0]?.displayShape||'banner')===opt.v
                            ? { borderColor:ms.accentColor||'#F4938C', background:`${ms.accentColor||'#F4938C'}11`, color:ms.accentColor||'#F4938C' }
                            : { borderColor:'#e5e7eb', color:'#9ca3af' }}>
                          <div className="text-sm">{opt.icon}</div>
                          <div>{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setEditingCatIdx(-1)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-base">📂</span>
                    <span className="text-xs font-medium text-gray-700 flex-1 text-right">
                      {(ms.categories||[]).length > 0
                        ? `${ms.categories.length} קטגוריות · ${(ms.categories||[]).reduce((s,c)=>s+(c.products||[]).filter(p=>p.name).length,0)} מוצרים`
                        : 'הוסף קטגוריות ומוצרים'}
                    </span>
                    {(ms.categories||[]).length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: ms.accentColor||'#F4938C' }}>{ms.categories.length}</span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
                {/* Desktop full form */}
                <div className="hidden md:block bg-white rounded-2xl p-4 md:p-5 border border-gray-100 space-y-4" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800">קטגוריות ומוצרים</p>
                    <button onClick={() => updMulti('categories',[...(ms.categories||[]),{ id:Date.now(), name:'', icon:'🛍️', image:'', displayMode:'popup', displayShape: (ms.categories||[])[0]?.displayShape || 'banner', products:[{ name:'', price:'', image:'', description:'' }] }])}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>+ קטגוריה</button>
                  </div>
                  {/* Global shape picker */}
                  <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2">צורת תצוגה לכל הקטגוריות</p>
                    <div className="flex gap-2">
                      {[
                        { v:'banner', label:'באנר', icon:'🖼' },
                        { v:'square', label:'כרטיס', icon:'▪️' },
                        { v:'circle', label:'עיגול', icon:'⬤' },
                      ].map(opt => (
                        <button key={opt.v}
                          onClick={() => updMulti('categories', (ms.categories||[]).map(c => ({ ...c, displayShape: opt.v })))}
                          className="flex-1 py-2 px-2 rounded-xl border-2 text-xs font-bold transition-all text-center"
                          style={((ms.categories||[])[0]?.displayShape||'banner')===opt.v
                            ? { borderColor:ms.accentColor||'#F4938C', background:`${ms.accentColor||'#F4938C'}11`, color:ms.accentColor||'#F4938C' }
                            : { borderColor:'#e5e7eb', color:'#9ca3af' }}>
                          <div className="text-base">{opt.icon}</div>
                          <div>{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {(ms.categories||[]).map((cat, ci) => (
                    <div key={ci} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50">
                      {/* Category header */}
                      <div className="flex items-center gap-2">
                        <div onClick={() => { document.getElementById(`cat-img-${ci}`)?.click(); }}
                          style={{ width:40, height:40, borderRadius:10, overflow:'hidden', flexShrink:0, background: cat.image ? 'transparent' : '#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border: cat.image ? 'none' : '1.5px dashed #d1d5db' }}>
                          {cat.image ? <img src={cat.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                        </div>
                        <input id={`cat-img-${ci}`} type="file" accept="image/*" className="hidden" onChange={e => handleCategoryImageUpload(ci, e.target.files?.[0])} />
                        <input value={cat.icon} onChange={e => updCategory(ci,{ icon:e.target.value })} className="w-10 border border-gray-200 rounded-xl px-2 py-1.5 text-center text-base focus:outline-none bg-white" maxLength={2} />
                        <input value={cat.name} onChange={e => updCategory(ci,{ name:e.target.value })} placeholder="שם קטגוריה" className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none bg-white" />
                        <button onClick={() => updMulti('categories',(ms.categories||[]).filter((_,i)=>i!==ci))} className="text-xs text-red-400 px-2">מחק</button>
                      </div>
                      {/* Display mode */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">אופן הצגה בלחיצה</p>
                        <div className="flex gap-2">
                          {[{ v:'popup', label:'פופ-אפ ⬆', desc:'חלונית מעל' },{ v:'page', label:'רשימה ↓', desc:'פתח מתחת' }].map(opt => (
                            <button key={opt.v} onClick={() => updCategory(ci,{ displayMode:opt.v })}
                              className="flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all text-right"
                              style={cat.displayMode===opt.v ? { borderColor:ms.accentColor||'#F4938C', background:`${ms.accentColor||'#F4938C'}11`, color:ms.accentColor||'#F4938C' } : { borderColor:'#e5e7eb', color:'#9ca3af' }}>
                              <div>{opt.label}</div>
                              <div className="font-normal text-[10px] opacity-70">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Display shape */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">צורת הצגת הקטגוריה</p>
                        <div className="flex gap-2">
                          {[
                            { v:'banner', label:'באנר', icon:'🖼' },
                            { v:'square', label:'כרטיס', icon:'▪️' },
                            { v:'circle', label:'עיגול', icon:'⬤' },
                          ].map(opt => (
                            <button key={opt.v} onClick={() => updCategory(ci,{ displayShape:opt.v })}
                              className="flex-1 py-2 px-2 rounded-xl border-2 text-xs font-bold transition-all text-center"
                              style={(cat.displayShape||'banner')===opt.v ? { borderColor:ms.accentColor||'#F4938C', background:`${ms.accentColor||'#F4938C'}11`, color:ms.accentColor||'#F4938C' } : { borderColor:'#e5e7eb', color:'#9ca3af' }}>
                              <div className="text-base">{opt.icon}</div>
                              <div>{opt.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Size */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">גודל בגריד</p>
                        <div className="flex gap-2">
                          {[{ v:'half', label:'חצי מסך' },{ v:'full', label:'100% מסך' }].map(opt => (
                            <button key={opt.v} onClick={() => updCategory(ci,{ size:opt.v })}
                              className="flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all"
                              style={(cat.size||'half')===opt.v ? { borderColor:ms.accentColor||'#F4938C', background:`${ms.accentColor||'#F4938C'}11`, color:ms.accentColor||'#F4938C' } : { borderColor:'#e5e7eb', color:'#9ca3af' }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Products */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">מוצרים</p>
                        {(cat.products||[]).map((p,pi) => (
                          <div key={pi} className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Product image mini-upload */}
                              <div onClick={() => { const inp = document.getElementById(`prod-img-${ci}-${pi}`); inp?.click(); }}
                                style={{ width:40, height:40, borderRadius:10, overflow:'hidden', flexShrink:0, background: p.image ? 'transparent' : '#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border: p.image ? 'none' : '1.5px dashed #d1d5db' }}>
                                {p.image ? <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                              </div>
                              <input id={`prod-img-${ci}-${pi}`} type="file" accept="image/*" className="hidden" onChange={e => handleProductImageUpload(ci, pi, e.target.files?.[0])} />
                              <input value={p.name} onChange={e => updProduct(ci,pi,{ name:e.target.value })} placeholder="שם המוצר" className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" />
                              <input value={p.price} onChange={e => updProduct(ci,pi,{ price:e.target.value })} placeholder="₪מחיר" className="w-16 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" dir="ltr" />
                              <button onClick={() => updCategory(ci,{ products:(cat.products||[]).filter((_,i)=>i!==pi) })} className="text-xs text-red-400 px-1">✕</button>
                            </div>
                            <input value={p.description||''} onChange={e => updProduct(ci,pi,{ description:e.target.value })} placeholder="תיאור קצר (אופציונלי)" className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" />
                            <input value={p.videoUrl||''} onChange={e => updProduct(ci,pi,{ videoUrl:e.target.value })} placeholder="🎬 קישור לסרטון (YouTube / ישיר)" className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" dir="ltr" />
                            {/* Inventory */}
                            <div className="flex items-center gap-2">
                              <button onClick={() => updProduct(ci,pi,{ inStock: !(p.inStock ?? true) })}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex-shrink-0"
                                style={(p.inStock ?? true)
                                  ? { borderColor:'#10B981', background:'#f0fdf4', color:'#10B981' }
                                  : { borderColor:'#EF4444', background:'#fef2f2', color:'#EF4444' }}>
                                <div className="w-2 h-2 rounded-full" style={{ background:(p.inStock ?? true) ? '#10B981' : '#EF4444' }} />
                                {(p.inStock ?? true) ? 'במלאי' : 'אזל'}
                              </button>
                              {(p.inStock ?? true) && (
                                <input value={p.quantity||''} onChange={e => updProduct(ci,pi,{ quantity:e.target.value })}
                                  placeholder="כמות (ריק = ∞)" dir="ltr" type="number" min="0"
                                  className="flex-1 border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-green-400" />
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              {[{v:'full',label:'רוחב מלא'},{v:'half',label:'חצי רוחב'}].map(opt => (
                                <button key={opt.v} onClick={() => updProduct(ci,pi,{size:opt.v})}
                                  className="flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all"
                                  style={(p.size||'full')===opt.v ? {borderColor:ms.accentColor||'#F4938C',background:`${ms.accentColor||'#F4938C'}15`,color:ms.accentColor||'#F4938C'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            {/* Featured product toggle */}
                            <button onClick={() => updProduct(ci,pi,{ featured: !p.featured })}
                              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                              style={p.featured
                                ? { borderColor:'#F59E0B', background:'#fffbeb', color:'#D97706' }
                                : { borderColor:'#e5e7eb', background:'white', color:'#9ca3af' }}>
                              <span>{p.featured ? '⭐' : '☆'}</span>
                              {p.featured ? 'מוצר מוביל — יוצג בקרוסלה' : 'הפוך למוצר מוביל'}
                            </button>
                          </div>
                        ))}
                        <button onClick={() => updCategory(ci,{ products:[...(cat.products||[]),{ name:'', price:'', image:'', description:'', size:'full', inStock:true, quantity:'' }] })}
                          className="text-xs text-indigo-500 hover:text-indigo-600 font-medium py-1">+ הוסף מוצר</button>
                      </div>
                    </div>
                  ))}
                  {(ms.categories||[]).length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                      <p className="text-3xl mb-2">📂</p>
                      <p className="text-sm text-gray-400">עדיין אין קטגוריות</p>
                    </div>
                  )}
                </div>
                {/* Warehouse tip */}
                {dbStoreId && (
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                    <span className="text-lg flex-shrink-0">🏠</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-amber-800">ניהול מלאי מתקדם — במחסן</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">הוסף מוצרים, ערוך, סדר מחדש ונהל כמויות</p>
                    </div>
                    <button onClick={() => navigate(`/warehouse/${dbStoreId}`)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      מחסן →
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setMultiStep('about')} className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200">← חזור</button>
                  <button onClick={() => setMultiStep('payment')} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>הבא: תשלום →</button>
                </div>
              </>)}

              {/* STEP: payment */}
              {multiStep === 'payment' && (
                <motion.div key="multi-payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

                  {/* Mobile compact */}
                  <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                    <button onClick={() => setShowMultiPaymentSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <span className="text-base">💬</span>
                      <span className="text-xs font-medium text-gray-700 flex-1 text-right">וואטסאפ להזמנות</span>
                      {ms.social?.whatsapp ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#25D366' }}>✓</span> : null}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      <span className="text-xs text-gray-400 flex-1 text-right">סליקת אשראי — בקרוב</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                    </div>
                  </div>

                  {/* Desktop full — WhatsApp */}
                  <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,#25D366,#128C7E)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">וואטסאפ להזמנות</p>
                        <p className="text-xs text-gray-400">הלקוח ישלח את הסל ישירות לוואטסאפ שלך</p>
                      </div>
                      <span className="mr-auto text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:'#25D366' }}>פעיל</span>
                    </div>
                    <input value={ms.social?.whatsapp || ''} onChange={e => updMultiSocial('whatsapp', e.target.value)}
                      placeholder="050-0000000" dir="ltr"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#25D366] transition-colors" />
                  </div>

                  {/* Desktop full — Credit card coming soon */}
                  <div className="hidden md:block bg-white rounded-2xl p-5 border border-gray-100 space-y-3" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)', opacity:0.7 }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#f3f4f6' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500">סליקת אשראי ישירה</p>
                        <p className="text-xs text-gray-400">Visa · Mastercard · Bit · Apple Pay</p>
                      </div>
                      <span className="mr-auto text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                    </div>
                    <div className="flex gap-2 opacity-50">
                      {PAYMENT_METHODS.map(pm => <PaymentBadge key={pm.id} id={pm.id} />)}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setMultiStep('cats')} className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200">← חזור</button>
                    <button onClick={() => setMultiStep('footer')} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>הבא: פוטר →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP: footer */}
              {multiStep === 'footer' && (<>
                {/* Mobile compact */}
                <div className="md:hidden bg-white rounded-2xl p-3 border border-gray-100 space-y-2" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <button onClick={() => setShowSocialSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-base">🔗</span>
                    <span className="text-xs font-medium text-gray-700 flex-1 text-right">רשתות חברתיות</span>
                    {(ms.social?.instagram || ms.social?.facebook || ms.social?.whatsapp || ms.social?.tiktok) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: ms.accentColor||'#F4938C' }}>✓</span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button onClick={() => setShowSocialSheet(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <span className="text-base">📋</span>
                    <span className="text-xs font-medium text-gray-700 flex-1 text-right">{ms.terms ? 'תקנון ✓' : 'הוסף תקנון'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
                {/* Desktop full forms */}
                <div className="hidden md:block bg-white rounded-2xl p-4 md:p-5 border border-gray-100 space-y-4" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-sm font-bold text-gray-800">רשתות חברתיות</p>
                  <p className="text-xs text-gray-400">הקישורים יוצגו כאייקונים בפוטר החנות</p>
                  {[
                    { key:'instagram', label:'Instagram', placeholder:'@username', icon:'📸', color:'#E1306C' },
                    { key:'facebook',  label:'Facebook',  placeholder:'שם הדף',   icon:'👥', color:'#1877F2' },
                    { key:'tiktok',    label:'TikTok',    placeholder:'@username', icon:'🎵', color:'#000' },
                    { key:'whatsapp',  label:'WhatsApp',  placeholder:'050-0000000', icon:'💬', color:'#25D366' },
                    { key:'website',   label:'אתר',       placeholder:'https://...', icon:'🌐', color:'#6366f1' },
                  ].map(s => (
                    <div key={s.key} className="flex items-center gap-3">
                      <div style={{ width:32, height:32, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:14 }}>{s.icon}</span>
                      </div>
                      <input value={ms.social?.[s.key]||''} onChange={e => updMultiSocial(s.key, e.target.value)}
                        placeholder={s.placeholder} dir="ltr"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                  ))}
                </div>
                <div className="hidden md:block bg-white rounded-2xl p-4 md:p-5 border border-gray-100 space-y-3" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-sm font-bold text-gray-800">תקנון / תנאי שימוש</p>
                  <p className="text-xs text-gray-400">יוצג בלשונית "אז מה אנחנו"</p>
                  <textarea value={ms.terms||''} onChange={e => updMulti('terms', e.target.value)}
                    placeholder="כל הזכויות שמורות. ביטול עד 14 ימים מיום הרכישה..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                  <div className="h-px bg-gray-100" />
                  <p className="text-sm font-bold text-gray-800">מדיניות ביטולים ↩️</p>
                  <textarea value={ms.cancelPolicy||''} onChange={e => updMulti('cancelPolicy', e.target.value)}
                    placeholder="ניתן לבטל הזמנה עד 48 שעות לאחר הרכישה..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                </div>
                {/* Slug + publish */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 space-y-3" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-sm font-bold text-gray-800">כתובת החנות</p>
                  <p className="text-xs text-gray-400">הכתובת שבה הלקוחות יגיעו לחנות שלך</p>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                    <span className="text-xs text-gray-400 flex-shrink-0">vizzit.online/store/</span>
                    <input value={slugInput} onChange={e => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                      placeholder="my-store" dir="ltr"
                      className="flex-1 bg-transparent text-sm font-bold text-gray-800 outline-none" />
                    {slugChecking && <svg className="animate-spin w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                    {!slugChecking && slugAvailable === true && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    {!slugChecking && slugAvailable === false && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                  {slugInput.length < 2 && <button onClick={() => { const s = toSlug(ms.storeName || 'my-store'); checkSlug(s); }} className="text-xs text-indigo-500 font-medium">⚡ הצע כתובת אוטומטית</button>}
                  {slugAvailable === false && <p className="text-xs text-red-500">הכתובת תפוסה, נסה אחרת</p>}
                  {published && <p className="text-xs text-green-600 font-bold">✓ החנות פורסמה בהצלחה</p>}
                </div>

                {published && dbStoreId && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏠</span>
                      <div>
                        <p className="text-sm font-bold text-amber-800">החנות פורסמה! עכשיו נהל את המלאי</p>
                        <p className="text-xs text-amber-600">במחסן תוכל לעדכן כמויות, להוסיף מוצרים ולראות אנליטיקס</p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/warehouse/${dbStoreId}`)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      כנס למחסן 🏠
                    </button>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setMultiStep('payment')} className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200">← חזור</button>
                  <button onClick={handlePublish} disabled={publishing || !slugInput || slugAvailable === false}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)', boxShadow:'0 4px 16px rgba(244,147,140,0.35)' }}>
                    {publishing ? 'מפרסם...' : published ? 'עדכן ופרסם מחדש 🚀' : 'פרסם חנות 🚀'}
                  </button>
                </div>
              </>)}

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
                          {storeType === 'multi'
                            ? <MultiStorePreview ms={ms} cart={cart} onAddToCart={addToCart} onCartOpen={() => setShowCart(true)} />
                            : <StorePreview data={data} onBuy={() => setShowCheckout(true)} />}
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

            {/* Mobile type picker */}
            <div className="w-full px-1">
              <StoreTypePicker value={storeType} onChange={setStoreType} accent={storeType === 'multi' ? ms.accentColor : data.accentColor} />
            </div>
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
                  {storeType === 'multi'
                    ? <MultiStorePreview ms={ms} cart={cart} onAddToCart={addToCart} onCartOpen={() => setShowCart(true)} />
                    : <StorePreview data={data} onBuy={() => setShowCheckout(true)} />}
                </div>
              </div>
            </div>

            <StoreTypePicker value={storeType} onChange={setStoreType} accent={storeType === 'multi' ? ms.accentColor : data.accentColor} />
            <p className="text-xs text-gray-400 text-center">{storeType === 'single' ? 'לחץ "קנה עכשיו" לסליקה דמו' : 'לחץ על קטגוריה להצגת מוצרים'}</p>
          </div>
        </div>
      </div>

      {/* ════ Mobile Bottom Sheets ════ */}

      <AnimatePresence>
        {/* ── Product name + tagline sheet ── */}
        {showProductSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProductSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">פרטי המוצר</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">שם המוצר *</label>
                  <input value={data.name} onChange={e => upd('name', e.target.value)} placeholder="למשל: קורס צילום מקצועי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">תגית / טקסט משנה</label>
                  <input value={data.tagline} onChange={e => upd('tagline', e.target.value)} placeholder="תיאור קצר שמופיע מתחת לשם" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">טקסט כפתור</label>
                  <div className="flex gap-2 flex-wrap">
                    {['קנה עכשיו','הזמן עכשיו','לרכישה','שלם ורכוש'].map(opt => (
                      <button key={opt} onClick={() => upd('ctaText', opt)} className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                        style={data.ctaText === opt ? { borderColor: '#F4938C', background: '#fff5f4', color: '#F4938C' } : { borderColor: '#e5e7eb', color: '#6b7280' }}>{opt}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowProductSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Price sheet ── */}
        {showPriceSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPriceSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">מחיר המוצר</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">מחיר (₪) *</label>
                  <input type="number" value={data.price} onChange={e => upd('price', e.target.value)} placeholder="199" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" dir="ltr" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">מחיר מקורי (לפני הנחה)</label>
                  <input type="number" value={data.originalPrice} onChange={e => upd('originalPrice', e.target.value)} placeholder="299" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" dir="ltr" />
                </div>
                {data.price && data.originalPrice && Number(data.price) < Number(data.originalPrice) && (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f0fdf4' }}>
                    <span className="text-base">🏷️</span>
                    <span className="text-xs font-bold text-green-600">{Math.round((1 - Number(data.price)/Number(data.originalPrice))*100)}% הנחה יוצג בדף</span>
                  </div>
                )}
                <button onClick={() => setShowPriceSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Color + store name sheet ── */}
        {showColorSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowColorSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">מיתוג</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-2">צבע ראשי</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={data.accentColor} onChange={e => upd('accentColor', e.target.value)} className="w-14 h-14 rounded-2xl border border-gray-200 cursor-pointer p-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{data.accentColor}</p>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {['#F4938C','#5BC4C8','#6366f1','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'].map(c => (
                          <button key={c} onClick={() => upd('accentColor', c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: data.accentColor === c ? '#111' : 'transparent' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">שם העסק / חנות</label>
                  <input value={data.storeName} onChange={e => upd('storeName', e.target.value)} placeholder="הממתקים של תמי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <button onClick={() => setShowColorSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Description sheet ── */}
        {showDescSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDescSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" style={{ maxHeight: '80vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-900">תיאור המוצר</h3>
                <textarea value={data.description} onChange={e => upd('description', e.target.value)} placeholder="ספר על המוצר — מה הוא עושה, למה כדאי לקנות אותו, מה מיוחד בו..." rows={6} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" autoFocus />
                <button onClick={() => setShowDescSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Bullets sheet ── */}
        {showBulletsSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulletsSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" style={{ maxHeight: '80vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">יתרונות המוצר</h3>
                  <button onClick={() => upd('bullets', [...data.bullets, ''])} className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>+ הוסף</button>
                </div>
                {data.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F4938C22' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F4938C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <input value={b} onChange={e => { const next = [...data.bullets]; next[i] = e.target.value; upd('bullets', next); }} placeholder={`יתרון ${i + 1}`} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                    {data.bullets.length > 1 && <button onClick={() => upd('bullets', data.bullets.filter((_, idx) => idx !== i))} className="text-xs text-red-400 px-2">✕</button>}
                  </div>
                ))}
                <button onClick={() => setShowBulletsSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white mt-2" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Payment sheet ── */}
        {showPaymentSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                {/* WhatsApp — active */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">וואטסאפ להזמנות</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#25D366' }}>פעיל</span>
                  </div>
                  <input value={data.whatsapp || ''} onChange={e => upd('whatsapp', e.target.value)}
                    placeholder="050-0000000" dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#25D366] transition-colors" />
                  <p className="text-xs text-gray-400 mt-1.5">הלקוח ילחץ על הכפתור ויפתח שיחת וואטסאפ</p>
                </div>

                {/* Credit card — coming soon */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-500">סליקת אשראי ישירה</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                  </div>
                  <div className="flex gap-2 opacity-50">
                    {PAYMENT_METHODS.map(pm => <PaymentBadge key={pm.id} id={pm.id} />)}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Visa · Mastercard · Bit · Apple Pay · PayPal</p>
                </div>

                <button onClick={() => setShowPaymentSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Multi-store Payment sheet ── */}
        {showMultiPaymentSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMultiPaymentSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">וואטסאפ להזמנות</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#25D366' }}>פעיל</span>
                  </div>
                  <input value={ms.social?.whatsapp || ''} onChange={e => updMultiSocial('whatsapp', e.target.value)}
                    placeholder="050-0000000" dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#25D366] transition-colors" />
                  <p className="text-xs text-gray-400 mt-1.5">הלקוח ילחץ על "הזמן בוואטסאפ" ויפתח שיחה עם פרטי הסל</p>
                </div>
                <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-500">סליקת אשראי ישירה</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</span>
                  </div>
                  <div className="flex gap-2 opacity-50">
                    {PAYMENT_METHODS.map(pm => <PaymentBadge key={pm.id} id={pm.id} />)}
                  </div>
                </div>
                <button onClick={() => setShowMultiPaymentSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Reviews modal ── */}
        {showReviewsSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviewsSheet(false)} />
            <motion.div className="fixed inset-x-4 top-16 bottom-4 bg-white rounded-2xl z-50 md:hidden flex flex-col overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">ביקורות לקוחות</h3>
                <button onClick={() => setShowReviewsSheet(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      <button onClick={() => upd('reviews', data.reviews.filter((_, idx) => idx !== i))} className="text-xs text-red-400">מחק</button>
                    </div>
                    <input value={r.name} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, name: e.target.value }; upd('reviews', next); }} placeholder="שם הלקוח" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                    <textarea value={r.text} onChange={e => { const next = [...data.reviews]; next[i] = { ...r, text: e.target.value }; upd('reviews', next); }} placeholder="מה אמר הלקוח?" rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white" />
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <button onClick={() => upd('reviews', [...data.reviews, { name: '', rating: 5, text: '' }])} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700">+ הוסף</button>
                <button onClick={() => setShowReviewsSheet(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>סגור ✓</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Multi-store sheets ── */}
      <AnimatePresence>
        {/* Cover + Logo sheet */}
        {showCoverLogoSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-50" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowCoverLogoSheet(false)} />
            <motion.div dir="rtl"
              className="fixed inset-x-4 top-16 bottom-4 bg-white rounded-2xl z-50 flex flex-col overflow-hidden"
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.18 }}
              style={{ boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">כריכה ולוגו</h3>
                <button onClick={() => setShowCoverLogoSheet(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Cover */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">תמונת כריכה</p>
                  <p className="text-xs text-gray-400 mb-2">רקע ראש החנות · JPG, PNG · מומלץ 1200×400</p>
                  <div onClick={() => coverRef.current?.click()} className="relative cursor-pointer rounded-2xl overflow-hidden transition-all hover:opacity-90"
                    style={{ height: ms.coverImage ? 160 : 120, background: ms.coverImage ? 'transparent' : 'linear-gradient(135deg,#f9fafb,#f3f4f6)', border: ms.coverImage ? 'none' : '2px dashed #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {ms.coverImage ? (
                      <img src={ms.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    ) : uploadingCover ? (
                      <div className="flex items-center gap-2"><svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><p className="text-xs text-gray-500">מעלה...</p></div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#F4938C22,#5BC4C822)' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4938C" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">לחץ להעלאת כריכה</p>
                      </div>
                    )}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => handleCoverUpload(e.target.files?.[0])} />
                  {ms.coverImage && <button onClick={() => updMulti('coverImage','')} className="text-xs text-red-400 mt-1 block">הסר</button>}
                </div>
                <div className="h-px bg-gray-100" />
                {/* Logo */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">לוגו החנות</p>
                  <p className="text-xs text-gray-400 mb-2">יוצג מעל הכריכה · PNG שקוף עדיף · 200×200</p>
                  <div className="flex items-center gap-4">
                    <div onClick={() => logoRef.current?.click()} className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                      style={{ width:80, height:80, borderRadius:20, overflow:'hidden', background: ms.logoImage ? 'transparent' : 'linear-gradient(135deg,#f9fafb,#f3f4f6)', border: ms.logoImage ? 'none' : '2px dashed #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {ms.logoImage ? (
                        <img src={ms.logoImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : uploadingLogo ? (
                        <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">לחץ על הריבוע להעלאה</p>
                      {ms.logoImage && <button onClick={() => updMulti('logoImage','')} className="text-xs text-red-400 mt-1 block">הסר</button>}
                    </div>
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e.target.files?.[0])} />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowCoverLogoSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* Store info sheet */}
        <AnimatePresence>
        {showMultiInfoSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMultiInfoSheet(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">פרטי החנות</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">שם החנות</label>
                  <input value={ms.storeName} onChange={e => updMulti('storeName', e.target.value)} placeholder="הממתקים של תמי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">תגית</label>
                  <input value={ms.tagline} onChange={e => updMulti('tagline', e.target.value)} placeholder="חנות הבגדים שלנו" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-2">צבע ראשי</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={ms.accentColor} onChange={e => updMulti('accentColor', e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1" />
                    <div className="flex gap-2 flex-wrap">
                      {['#F4938C','#5BC4C8','#6366f1','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'].map(c => (
                        <button key={c} onClick={() => updMulti('accentColor', c)} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: c, borderColor: ms.accentColor === c ? '#111' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowMultiInfoSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>

        {/* Social sheet */}
        {showSocialSheet && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocialSheet(false)} />
            <motion.div className="fixed inset-x-4 top-16 bottom-4 bg-white rounded-2xl z-50 md:hidden flex flex-col overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">פוטר החנות</h3>
                <button onClick={() => setShowSocialSheet(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">רשתות חברתיות</p>
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: '@username', icon: '📸' },
                  { key: 'facebook', label: 'Facebook', placeholder: 'שם הדף', icon: '👥' },
                  { key: 'tiktok', label: 'TikTok', placeholder: '@username', icon: '🎵' },
                  { key: 'whatsapp', label: 'WhatsApp', placeholder: '050-0000000', icon: '💬' },
                  { key: 'website', label: 'אתר', placeholder: 'https://...', icon: '🌐' },
                ].map(s => (
                  <div key={s.key}>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">{s.icon} {s.label}</label>
                    <input value={ms.social?.[s.key] || ''} onChange={e => updMultiSocial(s.key, e.target.value)}
                      placeholder={s.placeholder} dir="ltr"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                ))}
                <div className="h-px bg-gray-100" />
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">📋 תקנון / תנאי שימוש</label>
                  <textarea value={ms.terms||''} onChange={e => updMulti('terms', e.target.value)}
                    placeholder="כל הזכויות שמורות. ביטול עד 14 ימים מיום הרכישה..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">↩️ מדיניות ביטולים</label>
                  <textarea value={ms.cancelPolicy||''} onChange={e => updMulti('cancelPolicy', e.target.value)}
                    placeholder="ניתן לבטל הזמנה עד 48 שעות לאחר הרכישה..."
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowSocialSheet(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>שמור ✓</button>
              </div>
            </motion.div>
          </>
        )}

        {/* Categories modal */}
        {editingCatIdx === -1 && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCatIdx(null)} />
            <motion.div className="fixed inset-x-4 top-16 bottom-4 bg-white rounded-2xl z-50 md:hidden flex flex-col overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-900">קטגוריות ומוצרים</h3>
                <button onClick={() => setEditingCatIdx(null)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(ms.categories || []).map((cat, ci) => (
                  <div key={ci} className="border border-gray-100 rounded-2xl p-3 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <div onClick={() => { document.getElementById(`cat-img-m-${ci}`)?.click(); }}
                        style={{ width:40, height:40, borderRadius:10, overflow:'hidden', flexShrink:0, background: cat.image ? 'transparent' : '#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border: cat.image ? 'none' : '1.5px dashed #d1d5db' }}>
                        {cat.image ? <img src={cat.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                      </div>
                      <input id={`cat-img-m-${ci}`} type="file" accept="image/*" className="hidden" onChange={e => handleCategoryImageUpload(ci, e.target.files?.[0])} />
                      <input value={cat.icon} onChange={e => updCategory(ci, { icon: e.target.value })} className="w-10 border border-gray-200 rounded-xl px-2 py-1.5 text-center text-base focus:outline-none bg-white" maxLength={2} />
                      <input value={cat.name} onChange={e => updCategory(ci, { name: e.target.value })} placeholder="שם קטגוריה" className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none bg-white" />
                      <button onClick={() => updMulti('categories', (ms.categories || []).filter((_, i) => i !== ci))} className="text-xs text-red-400 px-1">מחק</button>
                    </div>
                    {/* Display mode */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">אופן הצגה בלחיצה</p>
                      <div className="flex gap-1.5">
                        {[{ v:'popup', label:'פופ-אפ ⬆' },{ v:'page', label:'רשימה ↓' }].map(opt => (
                          <button key={opt.v} onClick={() => updCategory(ci,{ displayMode:opt.v })}
                            className="flex-1 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                            style={cat.displayMode===opt.v ? {borderColor:ms.accentColor||'#F4938C',background:`${ms.accentColor||'#F4938C'}11`,color:ms.accentColor||'#F4938C'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Display shape */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1">צורת הצגה</p>
                      <div className="flex gap-1.5">
                        {[{v:'banner',label:'באנר',icon:'🖼'},{v:'square',label:'כרטיס',icon:'▪️'},{v:'circle',label:'עיגול',icon:'⬤'}].map(opt => (
                          <button key={opt.v} onClick={() => updCategory(ci,{ displayShape:opt.v })}
                            className="flex-1 py-1.5 rounded-xl border-2 text-xs font-bold transition-all text-center"
                            style={(cat.displayShape||'banner')===opt.v ? {borderColor:ms.accentColor||'#F4938C',background:`${ms.accentColor||'#F4938C'}11`,color:ms.accentColor||'#F4938C'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                            <span>{opt.icon}</span> {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Size */}
                    <div className="flex gap-1.5">
                      {[{v:'half',label:'חצי מסך'},{v:'full',label:'100% מסך'}].map(opt => (
                        <button key={opt.v} onClick={() => updCategory(ci,{size:opt.v})}
                          className="flex-1 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                          style={(cat.size||'half')===opt.v ? {borderColor:ms.accentColor||'#F4938C',background:`${ms.accentColor||'#F4938C'}15`,color:ms.accentColor||'#F4938C'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {/* Products */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500">מוצרים</p>
                      {(cat.products || []).map((p, pi) => (
                        <div key={pi} className="bg-white rounded-xl p-2.5 border border-gray-100 space-y-2">
                          <div className="flex items-center gap-2">
                            <div onClick={() => document.getElementById(`prod-img-m-${ci}-${pi}`)?.click()}
                              style={{ width:36,height:36,borderRadius:8,overflow:'hidden',flexShrink:0,background:p.image?'transparent':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:p.image?'none':'1.5px dashed #d1d5db' }}>
                              {p.image ? <img src={p.image} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                            </div>
                            <input id={`prod-img-m-${ci}-${pi}`} type="file" accept="image/*" className="hidden" onChange={e => handleProductImageUpload(ci,pi,e.target.files?.[0])} />
                            <input value={p.name} onChange={e => updProduct(ci, pi, { name: e.target.value })} placeholder="שם מוצר" className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" />
                            <input value={p.price} onChange={e => updProduct(ci, pi, { price: e.target.value })} placeholder="₪" className="w-14 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" dir="ltr" />
                            <button onClick={() => updCategory(ci, { products: (cat.products || []).filter((_, i) => i !== pi) })} className="text-xs text-red-400">✕</button>
                          </div>
                          <input value={p.description||''} onChange={e => updProduct(ci,pi,{description:e.target.value})} placeholder="תיאור קצר (אופציונלי)" className="w-full border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none" />
                          <div className="flex gap-1.5">
                            <button onClick={() => updProduct(ci,pi,{ inStock: !(p.inStock ?? true) })}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all flex-shrink-0"
                              style={(p.inStock??true) ? {borderColor:'#10B981',background:'#f0fdf4',color:'#10B981'} : {borderColor:'#EF4444',background:'#fef2f2',color:'#EF4444'}}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background:(p.inStock??true)?'#10B981':'#EF4444' }} />
                              {(p.inStock??true) ? 'במלאי' : 'אזל'}
                            </button>
                            {[{v:'full',label:'מלא'},{v:'half',label:'חצי'}].map(opt => (
                              <button key={opt.v} onClick={() => updProduct(ci,pi,{size:opt.v})}
                                className="flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all"
                                style={(p.size||'full')===opt.v ? {borderColor:ms.accentColor||'#F4938C',background:`${ms.accentColor||'#F4938C'}15`,color:ms.accentColor||'#F4938C'} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => updProduct(ci,pi,{ featured: !p.featured })}
                            className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all"
                            style={p.featured ? {borderColor:'#F59E0B',background:'#fffbeb',color:'#D97706'} : {borderColor:'#e5e7eb',background:'white',color:'#9ca3af'}}>
                            <span>{p.featured ? '⭐' : '☆'}</span>
                            {p.featured ? 'מוצר מוביל — יוצג בקרוסלה' : 'הפוך למוצר מוביל'}
                          </button>
                        </div>
                      ))}
                      <button onClick={() => updCategory(ci, { products: [...(cat.products || []), { name: '', price: '', image: '', description: '', size: 'full', inStock: true, quantity: '', featured: false }] })}
                        className="text-xs text-indigo-500 font-medium py-1">+ הוסף מוצר</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <button onClick={() => updMulti('categories', [...(ms.categories || []), { id: Date.now(), name: '', icon: '🛍️', image: '', displayMode: 'popup', products: [{ name: '', price: '', image: '', description: '' }] }])}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700">+ קטגוריה</button>
                <button onClick={() => setEditingCatIdx(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>סגור ✓</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <AnimatePresence>
        {showCart && (
          <CartSheet
            cart={cart}
            accent={ms.accentColor || '#F4938C'}
            onClose={() => setShowCart(false)}
            onUpdateQty={updateCartQty}
            onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
          />
        )}
      </AnimatePresence>

      {/* Checkout demo modal */}
      <AnimatePresence>
        {showCheckout && <CheckoutModal data={data} onClose={() => setShowCheckout(false)} />}
      </AnimatePresence>
    </div>
  );
}
