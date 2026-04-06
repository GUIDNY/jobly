import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoreBySlug } from '../lib/cardsApi';

// ─── Desktop detection ────────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isDesktop;
}

// ─── Payment Badge ────────────────────────────────────────────────────────────
function PaymentBadge({ id }) {
  if (id === 'visa') return <div style={{ background:'#1a1f71', borderRadius:6, padding:'3px 8px' }}><span style={{ color:'white', fontWeight:900, fontSize:11, fontStyle:'italic' }}>VISA</span></div>;
  if (id === 'mastercard') return <div style={{ background:'white', borderRadius:6, padding:'3px 6px', display:'flex', gap:2, border:'1px solid #eee' }}><div style={{ width:14, height:14, borderRadius:'50%', background:'#EB001B' }}/><div style={{ width:14, height:14, borderRadius:'50%', background:'#F79E1B', marginLeft:-6 }}/></div>;
  if (id === 'bit') return <div style={{ background:'#ff6b35', borderRadius:6, padding:'3px 8px' }}><span style={{ color:'white', fontWeight:900, fontSize:11 }}>bit</span></div>;
  if (id === 'paypal') return <div style={{ background:'#003087', borderRadius:6, padding:'3px 8px' }}><span style={{ color:'white', fontWeight:900, fontSize:10 }}>Pay<span style={{ color:'#009cde' }}>Pal</span></span></div>;
  if (id === 'apple') return <div style={{ background:'#000', borderRadius:6, padding:'3px 8px', display:'flex', alignItems:'center', gap:3 }}><svg width="10" height="12" viewBox="0 0 14 17" fill="white"><path d="M12.5 8.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.8-.8-3-.8C2.8 3.5.7 4.8.7 7.9c0 2 .8 4.1 1.8 5.5.9 1.3 1.8 2.6 3 2.6 1.2-.1 1.6-.8 3-.8s1.8.8 3 .8c1.3 0 2.1-1.3 2.9-2.6.5-.7.9-1.5 1.2-2.4-2.7-1.1-2.1-4.5-.1-5.2zM9.8 2.3C10.6 1.3 11.1.1 11 .1 9.9.1 8.5.8 7.6 1.8c-.8 1-.6 2-.5 2.1 1.1 0 2.2-.8 2.7-1.6z"/></svg><span style={{ color:'white', fontWeight:700, fontSize:9 }}>Pay</span></div>;
  return null;
}

// ─── WhatsApp Checkout ────────────────────────────────────────────────────────
function WhatsAppCheckout({ items, storeName, whatsappNumber, accent, total, onClose }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const hasWhatsApp = !!whatsappNumber;

  const buildMessage = () => {
    const lines = items.map(i =>
      `• ${i.name}${i.qty > 1 ? ` x${i.qty}` : ''} — ₪${(Number(i.price || 0) * (i.qty || 1)).toFixed(0)}`
    ).join('\n');
    const parts = [
      `שלום${storeName ? ` ${storeName}` : ''},`,
      `אני מעוניין/ת להזמין:`,
      ``,
      lines,
      ``,
      `סה"כ: ₪${Number(total).toFixed(2)}`,
    ];
    if (customerName) parts.push(``, `שם: ${customerName}`);
    if (customerPhone) parts.push(`טלפון: ${customerPhone}`);
    if (note) parts.push(`הערה: ${note}`);
    return parts.join('\n');
  };

  const sendToWhatsApp = () => {
    const cleaned = whatsappNumber.replace(/\D/g, '');
    const waNum = cleaned.startsWith('0') ? '972' + cleaned.slice(1) : cleaned;
    const msg = buildMessage();
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div dir="rtl" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, position: 'relative', zIndex: 1, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '12px auto 0' }} />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ padding: '32px 24px 48px', textAlign: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#25D366,#128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(37,211,102,0.35)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 8 }}>ההזמנה נשלחה! 🎉</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>פתחנו שיחת וואטסאפ עם הספק.<br/>תוכלו לתאם פרטים ישירות.</p>
              <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' }}>סגור</button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '16px 20px 36px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 900, color: '#111', margin: 0 }}>סיום הזמנה</h2>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>פרטי ההזמנה ישלחו לוואטסאפ</p>
                </div>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Order summary */}
              <div style={{ background: '#f9fafb', borderRadius: 14, padding: '12px 14px', marginBottom: 20 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < items.length - 1 ? 10 : 0, marginBottom: i < items.length - 1 ? 10 : 0, borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    {item.image && <img src={item.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>{item.name}</p>
                      {item.qty > 1 && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>כמות: {item.qty}</p>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 900, color: accent, margin: 0 }}>₪{(Number(item.price || 0) * (item.qty || 1)).toFixed(0)}</p>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>סה"כ לתשלום</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: accent }}>₪{Number(total).toFixed(2)}</span>
                </div>
              </div>

              {/* Customer details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>שם (אופציונלי)</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>טלפון (אופציונלי)</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="050-0000000" dir="ltr"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>הערה להזמנה (אופציונלי)</label>
                  <input value={note} onChange={e => setNote(e.target.value)}
                    placeholder="למשל: צבע, מידה, הוראות משלוח..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* WhatsApp CTA */}
              {hasWhatsApp ? (
                <button onClick={sendToWhatsApp}
                  style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 20px rgba(37,211,102,0.35)', marginBottom: 16 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                  שלח הזמנה בוואטסאפ
                </button>
              ) : (
                <div style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#f3f4f6', marginBottom: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>לא הוגדר מספר וואטסאפ לחנות זו</p>
                </div>
              )}

              {/* Credit card — coming soon */}
              <div style={{ border: '1.5px solid #f3f4f6', borderRadius: 16, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#F4938C,#5BC4C8)', borderRadius: 20, padding: '2px 10px' }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>בקרוב</span>
                </div>
                <div style={{ opacity: 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#374151' }}>סליקת אשראי ישירה</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>תשלום בכרטיס אשראי, bit ו-Apple Pay יהיה זמין בקרוב — הנה מה שמגיע:</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {['visa','mastercard','bit','apple'].map(id => <PaymentBadge key={id} id={id}/>)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Single Product Page ──────────────────────────────────────────────────────
function SingleStorePage({ d }) {
  const accent = d.accentColor || '#F4938C';
  const whatsappNumber = d.whatsapp || d.multi?.social?.whatsapp || '';
  const [showCheckout, setShowCheckout] = useState(false);
  const isDesktop = useIsDesktop();

  const item = { name: d.name || 'מוצר', image: d.image, price: d.price || '0', qty: 1 };

  if (isDesktop) {
    return (
      <div dir="rtl" style={{ fontFamily:"'Heebo','Segoe UI',sans-serif", background:'#f0f2f5', minHeight:'100vh' }}>
        {/* Desktop nav */}
        <div style={{ background:'white', borderBottom:'1px solid #e5e7eb', padding:'12px 40px', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:40, boxShadow:'0 1px 0 rgba(0,0,0,0.06)' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${accent},#5BC4C8)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:18 }}>🛍️</span></div>
          <span style={{ fontWeight:900, fontSize:16, color:'#111' }}>{d.storeName||'החנות שלי'}</span>
        </div>

        {/* Desktop 2-col layout */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          {/* Left: sticky image */}
          <div style={{ position:'sticky', top:100 }}>
            <div style={{ borderRadius:24, overflow:'hidden', aspectRatio:'1', background: d.image ? 'transparent' : `linear-gradient(135deg,${accent}22,${accent}11)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
              {d.image
                ? <img src={d.image} alt={d.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              }
            </div>
          </div>

          {/* Right: product info */}
          <div style={{ background:'white', borderRadius:24, padding:'36px', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
            <h1 style={{ fontSize:32, fontWeight:900, color:'#111', margin:'0 0 8px', lineHeight:1.2 }}>{d.name||'שם המוצר'}</h1>
            {d.tagline && <p style={{ fontSize:16, color:'#6b7280', margin:'0 0 16px' }}>{d.tagline}</p>}

            {d.reviews?.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
                {[1,2,3,4,5].map(s => { const g=s<=4.5; return <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={g?'#F59E0B':'#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; })}
                <span style={{ fontSize:14, color:'#6b7280' }}>({d.reviews.length} ביקורות)</span>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:28 }}>
              <span style={{ fontSize:42, fontWeight:900, color:accent }}>₪{d.price||'0'}</span>
              {d.originalPrice && <span style={{ fontSize:20, color:'#9ca3af', textDecoration:'line-through' }}>₪{d.originalPrice}</span>}
              {d.originalPrice && d.price && <span style={{ fontSize:13, fontWeight:700, color:'#10B981', background:'#d1fae5', padding:'4px 10px', borderRadius:20 }}>{Math.round((1-Number(d.price)/Number(d.originalPrice))*100)}% הנחה</span>}
            </div>

            <button onClick={() => setShowCheckout(true)}
              style={{ width:'100%', padding:'18px', borderRadius:16, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', fontWeight:900, fontSize:17, border:'none', cursor:'pointer', marginBottom:14, boxShadow:'0 6px 24px rgba(37,211,102,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
              {d.ctaText || 'הזמן עכשיו בוואטסאפ'}
            </button>

            {d.paymentMethods?.length > 0 && <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>{d.paymentMethods.map(id=><PaymentBadge key={id} id={id}/>)}</div>}

            <div style={{ height:1, background:'#f3f4f6', margin:'20px 0' }}/>

            {d.bullets?.filter(b=>b.trim()).length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:15, fontWeight:800, color:'#374151', marginBottom:12 }}>מה כלול?</p>
                {d.bullets.filter(b=>b.trim()).map((b,i) => (
                  <div key={i} style={{ display:'flex', gap:12, marginBottom:10 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:`${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <span style={{ fontSize:14, color:'#374151', lineHeight:1.6 }}>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {d.description && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:15, fontWeight:800, color:'#374151', marginBottom:8 }}>אודות המוצר</p>
                <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{d.description}</p>
              </div>
            )}

            {d.reviews?.filter(r=>r.text).length > 0 && (
              <div>
                <p style={{ fontSize:15, fontWeight:800, color:'#374151', marginBottom:14 }}>מה אומרים הלקוחות</p>
                {d.reviews.filter(r=>r.text).map((r,i) => (
                  <div key={i} style={{ background:'#f9fafb', borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${accent},#5BC4C8)`, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'white', fontSize:14, fontWeight:800 }}>{(r.name||'א')[0]}</span></div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:'#111', margin:0 }}>{r.name||'לקוח מרוצה'}</p>
                        <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s<=(r.rating||5)?'#F59E0B':'#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7, margin:0 }}>"{r.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showCheckout && <WhatsAppCheckout items={[item]} storeName={d.storeName} whatsappNumber={whatsappNumber} accent={accent} total={d.price||'0'} onClose={() => setShowCheckout(false)}/>}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile layout (existing)
  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Segoe UI',sans-serif", background: '#f8f9fa', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: d.image ? 300 : 200, background: d.image ? 'transparent' : `linear-gradient(135deg,${accent}33,${accent}11)`, overflow: 'hidden' }}>
        {d.image
          ? <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
        }
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent,rgba(0,0,0,0.3))' }} />
        {d.storeName && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px' }}><span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{d.storeName}</span></div>}
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: -20, padding: '20px 16px 100px', position: 'relative' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111', margin: '0 0 4px' }}>{d.name || 'שם המוצר'}</h1>
        {d.tagline && <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 12px' }}>{d.tagline}</p>}
        {d.reviews?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            {[1,2,3,4,5].map(s => { const gold = s <= 4.5; return <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={gold ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; })}
            <span style={{ fontSize: 12, color: '#6b7280' }}>({d.reviews.length} ביקורות)</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: accent }}>₪{d.price || '0'}</span>
          {d.originalPrice && <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>₪{d.originalPrice}</span>}
          {d.originalPrice && d.price && <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', background: '#d1fae5', padding: '3px 8px', borderRadius: 20 }}>{Math.round((1 - Number(d.price) / Number(d.originalPrice)) * 100)}% הנחה</span>}
        </div>

        {/* WhatsApp CTA */}
        <button onClick={() => setShowCheckout(true)}
          style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 20px rgba(37,211,102,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
          {d.ctaText || 'הזמן עכשיו בוואטסאפ'}
        </button>

        {d.paymentMethods?.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>{d.paymentMethods.map(id => <PaymentBadge key={id} id={id} />)}</div>}
        <div style={{ height: 1, background: '#f3f4f6', margin: '16px 0' }} />
        {d.bullets?.filter(b => b.trim()).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#374151', marginBottom: 10 }}>מה כלול?</p>
            {d.bullets.filter(b => b.trim()).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        )}
        {d.description && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#374151', marginBottom: 8 }}>אודות המוצר</p>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{d.description}</p>
          </div>
        )}
        {d.reviews?.filter(r => r.text).length > 0 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#374151', marginBottom: 12 }}>מה אומרים הלקוחות</p>
            {d.reviews.filter(r => r.text).map((r, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>{(r.name || 'א')[0]}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>{r.name || 'לקוח מרוצה'}</p>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= (r.rating || 5) ? '#F59E0B' : '#e5e7eb'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bar */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderTop: '1px solid #f3f4f6', padding: '12px 16px', display: 'flex', gap: 12, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 50 }}>
        <div><p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>מחיר</p><p style={{ fontSize: 18, fontWeight: 900, color: accent, margin: 0 }}>₪{d.price || '0'}</p></div>
        <button onClick={() => setShowCheckout(true)}
          style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
          הזמן בוואטסאפ
        </button>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <WhatsAppCheckout
            items={[item]}
            storeName={d.storeName}
            whatsappNumber={whatsappNumber}
            accent={accent}
            total={d.price || '0'}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Multi Store Page ─────────────────────────────────────────────────────────
function MultiStorePage({ ms }) {
  const accent = ms.accentColor || '#F4938C';
  const whatsappNumber = ms.social?.whatsapp || '';
  const [activeCat, setActiveCat] = useState(null);
  const [popupCat, setPopupCat] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const isDesktop = useIsDesktop();

  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const cartTotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);

  const addToCart = (p) => setCart(prev => {
    const idx = prev.findIndex(i => i.name === p.name);
    if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; return n; }
    return [...prev, { ...p, qty: 1 }];
  });
  const updateQty = (idx, qty) => {
    if (qty <= 0) setCart(prev => prev.filter((_, i) => i !== idx));
    else setCart(prev => { const n = [...prev]; n[idx] = { ...n[idx], qty }; return n; });
  };

  const [activeTab, setActiveTab] = useState('cats');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleCatClick = (cat, i) => {
    if (cat.displayMode === 'popup') setPopupCat(i);
    else setActiveCat(activeCat === i ? null : i);
  };

  const ProductCard = ({ p, cols }) => (
    <div onClick={() => setSelectedProduct(p)}
      style={{ borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
      {/* Image with price badge */}
      <div style={{ position: 'relative', width: '100%', height: cols === 3 ? 160 : 130, background: p.image ? 'transparent' : `${accent}22`, flexShrink: 0, overflow: 'hidden' }}>
        {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 36 }}>📦</span></div>}
        {/* Price badge */}
        {p.price && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '4px 10px' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 13 }}>₪{p.price}</span>
          </div>
        )}
        {/* Info button */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
      </div>
      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: cols === 3 ? 14 : 12, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.3 }}>{p.name}</p>
        <button onClick={e => { e.stopPropagation(); addToCart(p); }}
          style={{ padding: '8px', borderRadius: 10, background: `linear-gradient(135deg,${accent},#5BC4C8)`, color: 'white', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', width: '100%' }}>
          + הוסף לסל
        </button>
      </div>
    </div>
  );

  const CartModal = () => (
    <AnimatePresence>
      {showCart && (
        <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)}>
          <motion.div dir="rtl" initial={isDesktop ? { scale: 0.9, opacity: 0 } : { y: '100%' }} animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }} exit={isDesktop ? { scale: 0.9, opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: isDesktop ? 24 : '24px 24px 0 0', width: isDesktop ? 480 : '100%', maxWidth: isDesktop ? 480 : 640, maxHeight: isDesktop ? '80vh' : '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: isDesktop ? '0 24px 64px rgba(0,0,0,0.2)' : undefined }}>
            {!isDesktop && <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '12px auto 0' }} />}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#111', margin: 0 }}>🛒 סל קניות</h2>
              <button onClick={() => setShowCart(false)} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.length === 0
                ? <div style={{ textAlign: 'center', padding: '40px 0' }}><p style={{ fontSize: 36 }}>🛒</p><p style={{ fontSize: 14, color: '#9ca3af' }}>הסל ריק</p></div>
                : cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, border: '1px solid #f3f4f6', background: '#fafafa' }}>
                    {item.image && <img src={item.image} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{item.name}</p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: accent, margin: 0 }}>₪{item.price}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(i, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>-</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(i, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}22`, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: accent }}>+</button>
                    </div>
                  </div>
                ))
              }
            </div>
            {cart.length > 0 && (
              <div style={{ padding: '12px 20px 24px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>סה"כ</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>₪{cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                  הזמן בוואטסאפ →
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ProductDetailModal = () => {
    const p = selectedProduct;
    if (!p) return null;
    const isYouTube = p.videoUrl && (p.videoUrl.includes('youtube.com') || p.videoUrl.includes('youtu.be'));
    const ytId = isYouTube ? (p.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]) : null;
    return (
      <AnimatePresence>
        <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 80, display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
          <motion.div dir="rtl" initial={isDesktop ? { scale: 0.92, opacity: 0 } : { y: '100%' }} animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }} exit={isDesktop ? { scale: 0.92, opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: isDesktop ? 24 : '24px 24px 0 0', width: isDesktop ? 480 : '100%', maxWidth: isDesktop ? 480 : 640, maxHeight: isDesktop ? '85vh' : '88vh', overflowY: 'auto', boxShadow: isDesktop ? '0 24px 80px rgba(0,0,0,0.2)' : undefined }}>
            {!isDesktop && <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '12px auto 0' }} />}
            {/* Image */}
            {p.image && (
              <div style={{ width: '100%', height: 260, overflow: 'hidden', flexShrink: 0 }}>
                <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '20px 20px 36px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ flex: 1, paddingLeft: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111', margin: '0 0 6px', lineHeight: 1.2 }}>{p.name}</h2>
                  {p.price && <p style={{ fontSize: 24, fontWeight: 900, color: accent, margin: 0 }}>₪{p.price}</p>}
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Description */}
              {p.description && (
                <div style={{ background: '#f9fafb', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{p.description}</p>
                </div>
              )}
              {/* Video */}
              {p.videoUrl && (
                <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden' }}>
                  {ytId ? (
                    <iframe width="100%" height="220" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen style={{ display: 'block' }} />
                  ) : (
                    <video src={p.videoUrl} controls style={{ width: '100%', borderRadius: 14, maxHeight: 220 }} />
                  )}
                </div>
              )}
              {/* Add to cart */}
              <button onClick={() => { addToCart(p); setSelectedProduct(null); }}
                style={{ width: '100%', padding: '15px', borderRadius: 14, background: `linear-gradient(135deg,${accent},#5BC4C8)`, color: 'white', fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: `0 4px 20px ${accent}55` }}>
                + הוסף לסל
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const CategoryPopup = () => (
    <AnimatePresence>
      {popupCat !== null && ms.categories?.[popupCat] && (
        <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPopupCat(null)}>
          <motion.div dir="rtl" initial={isDesktop ? { scale: 0.9, opacity: 0 } : { y: '100%' }} animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }} exit={isDesktop ? { scale: 0.9, opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: isDesktop ? 24 : '24px 24px 0 0', width: isDesktop ? 600 : '100%', maxWidth: isDesktop ? 600 : 640, maxHeight: isDesktop ? '80vh' : '80vh', overflowY: 'auto', padding: 20, boxShadow: isDesktop ? '0 24px 64px rgba(0,0,0,0.2)' : undefined }}>
            {!isDesktop && <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 14px' }} />}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{ms.categories[popupCat].icon || '🛍️'}</span>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>{ms.categories[popupCat].name}</p>
              </div>
              <button onClick={() => setPopupCat(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr 1fr' : '1fr 1fr', gap: 12 }}>
              {(ms.categories[popupCat].products || []).filter(p => p.name).map((p, pi) => <ProductCard key={pi} p={p} cols={isDesktop ? 3 : 2} />)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const DT_TABS = [
    { id: 'cats',    label: 'קטגוריות',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'about',   label: 'אז מה אנחנו', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { id: 'contact', label: 'צרו קשר',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  ];
  const dtHasSocial = ms.social?.instagram || ms.social?.facebook || ms.social?.whatsapp || ms.social?.tiktok || ms.social?.website;

  if (isDesktop) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Heebo','Segoe UI',sans-serif", background: '#ffffff', minHeight: '100vh' }}>
        {/* Sticky nav */}
        <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 0 #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {ms.logoImage
              ? <img src={ms.logoImage} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
              : <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 22 }}>🛍️</span></div>
            }
            <div>
              <p style={{ fontWeight: 900, fontSize: 18, color: '#111', margin: 0, letterSpacing: '-0.3px' }}>{ms.storeName || 'החנות שלי'}</p>
              {ms.tagline && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{ms.tagline}</p>}
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 8, background: cartCount > 0 ? accent : 'transparent', color: cartCount > 0 ? 'white' : '#374151', fontWeight: 600, fontSize: 14, border: cartCount > 0 ? 'none' : '1.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {cartCount > 0 ? `סל (${cartCount}) · ₪${cartTotal.toFixed(0)}` : 'סל קניות'}
          </button>
        </div>

        {/* Hero */}
        {ms.coverImage ? (
          <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
            <img src={ms.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.55))' }} />
            <div style={{ position: 'absolute', bottom: 40, right: 0, left: 0, maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
              {ms.logoImage && <img src={ms.logoImage} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0 }} />}
              <div>
                <h1 style={{ color: 'white', fontWeight: 900, fontSize: 40, margin: '0 0 6px', letterSpacing: '-0.5px', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>{ms.storeName || 'החנות שלי'}</h1>
                {ms.tagline && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: 0 }}>{ms.tagline}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '56px 48px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><span style={{ fontSize: 32 }}>🛍️</span></div>
            <h1 style={{ fontSize: 38, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>{ms.storeName || 'החנות שלי'}</h1>
            {ms.tagline && <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>{ms.tagline}</p>}
          </div>
        )}

        {/* About — shown above categories if exists, elegant centered block */}
        {ms.aboutText && (
          <div style={{ borderBottom: '1px solid #f0f0f0', padding: '56px 48px' }}>
            <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
              {ms.aboutTitle && <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 20px' }}>{ms.aboutTitle}</h2>}
              <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.aboutText}</p>
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 48px 160px' }}>

          {/* SECTION: קטגוריות */}
          <section style={{ marginBottom: 80 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 32px', textAlign: 'right' }}>קטגוריות</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {(ms.categories || []).map((cat, i) => {
                const isWide = (cat.size === 'full');
                return (
                  <div key={i} onClick={() => handleCatClick(cat, i)}
                    style={{ gridColumn: isWide ? 'span 2' : 'span 1', borderRadius: 0, overflow: 'hidden', cursor: 'pointer', transition: 'opacity 0.2s',
                      opacity: activeCat !== null && activeCat !== i ? 0.7 : 1 }}>
                    <div style={{ position: 'relative', height: isWide ? 280 : 220, background: cat.image ? 'transparent' : `linear-gradient(135deg,${accent}33,${accent}11)`, overflow: 'hidden' }}>
                      {cat.image
                        ? <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: activeCat === i ? 'scale(1.04)' : 'scale(1)' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}18` }}><span style={{ fontSize: 64 }}>{cat.icon || '🛍️'}</span></div>
                      }
                      {cat.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 35%, rgba(0,0,0,0.6))' }} />}
                      <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '16px 18px' }}>
                        <p style={{ color: cat.image ? 'white' : '#111', fontWeight: 900, fontSize: isWide ? 22 : 16, margin: 0, textShadow: cat.image ? '0 1px 8px rgba(0,0,0,0.5)' : 'none' }}>{cat.name || 'קטגוריה'}</p>
                        {(cat.products||[]).filter(p=>p.name).length > 0 && <p style={{ color: cat.image ? 'rgba(255,255,255,0.75)' : '#9ca3af', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>{(cat.products||[]).filter(p=>p.name).length} פריטים</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <AnimatePresence>
              {activeCat !== null && ms.categories?.[activeCat]?.displayMode !== 'popup' && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  style={{ marginTop: 40, borderTop: `3px solid ${accent}`, paddingTop: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111', margin: 0 }}>{ms.categories[activeCat].name}</h3>
                    <button onClick={() => setActiveCat(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      סגור
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                    {(ms.categories[activeCat].products||[]).filter(p=>p.name).map((p,pi) => <ProductCard key={pi} p={p} cols={3} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* SECTION: צרו קשר */}
          {dtHasSocial && (
            <section style={{ marginBottom: 80 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 32px', textAlign: 'right' }}>צרו קשר</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {ms.social?.whatsapp && (
                  <a href={`https://wa.me/${ms.social.whatsapp.replace(/\D/g,'').replace(/^0/,'972')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 4, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'border-color 0.2s' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg></div>
                    <div><p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>WhatsApp</p><p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{ms.social.whatsapp}</p></div>
                  </a>
                )}
                {ms.social?.instagram && (
                  <a href={`https://instagram.com/${ms.social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 4, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>
                    <div><p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Instagram</p><p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{ms.social.instagram}</p></div>
                  </a>
                )}
                {ms.social?.facebook && (
                  <a href={`https://facebook.com/${ms.social.facebook}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 4, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></div>
                    <div><p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Facebook</p><p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{ms.social.facebook}</p></div>
                  </a>
                )}
                {ms.social?.tiktok && (
                  <a href={`https://tiktok.com/@${ms.social.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 4, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.82 1.55V6.79a4.85 4.85 0 01-1.05-.1z"/></svg></div>
                    <div><p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>TikTok</p><p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{ms.social.tiktok}</p></div>
                  </a>
                )}
                {ms.social?.website && (
                  <a href={ms.social.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 4, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
                    <div><p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>אתר</p><p style={{ fontSize: 12, color: '#6b7280', margin: 0, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ms.social.website}</p></div>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* SECTION: תקנון */}
          {(ms.terms || ms.cancelPolicy) && (
            <section>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 32px', textAlign: 'right' }}>תקנון ומדיניות</h2>
              <div style={{ display: 'grid', gridTemplateColumns: ms.terms && ms.cancelPolicy ? '1fr 1fr' : '1fr', gap: 20 }}>
                {ms.terms && (
                  <div style={{ padding: '28px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1px' }}>תקנון ותנאי שימוש</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.terms}</p>
                  </div>
                )}
                {ms.cancelPolicy && (
                  <div style={{ padding: '28px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1px' }}>מדיניות ביטולים</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.cancelPolicy}</p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Sticky cart bar */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '14px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, boxShadow: '0 -4px 30px rgba(0,0,0,0.1)', zIndex: 50 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 16, padding: '10px 20px', border: '1px solid #e5e7eb' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>{cartCount} פריטים</span>
                <span style={{ width: 1, height: 16, background: '#e5e7eb' }} />
                <span style={{ fontWeight: 900, fontSize: 16, color: '#111' }}>₪{cartTotal.toFixed(0)}</span>
                <button onClick={() => setShowCart(true)} style={{ fontSize: 12, color: accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>הצג סל</button>
              </div>
              <button onClick={() => setShowCheckout(true)}
                style={{ padding: '12px 32px', borderRadius: 16, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                הזמן בוואטסאפ
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <CartModal />
        <CategoryPopup />
        {selectedProduct && <ProductDetailModal />}
        <AnimatePresence>
          {showCheckout && <WhatsAppCheckout items={cart} storeName={ms.storeName} whatsappNumber={whatsappNumber} accent={accent} total={cartTotal.toFixed(2)} onClose={() => setShowCheckout(false)} />}
        </AnimatePresence>
      </div>
    );
  }

  // ── Mobile layout (redesigned) ───────────────────────────────────────────────
  const TABS = [
    { id: 'cats',    label: 'קטגוריות', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'about',   label: 'אז מה אנחנו', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { id: 'contact', label: 'צרו קשר',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  ];

  const hasSocial = ms.social?.instagram || ms.social?.facebook || ms.social?.whatsapp || ms.social?.tiktok || ms.social?.website;

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Segoe UI',sans-serif", background: '#f4f5f7', minHeight: '100vh', maxWidth: 640, margin: '0 auto', position: 'relative' }}>

      {/* ── Sticky top bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 16px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {ms.logoImage
            ? <img src={ms.logoImage} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: `2px solid ${accent}33` }} />
            : <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 16 }}>🛍️</span></div>
          }
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, color: '#111', margin: 0, lineHeight: 1.2 }}>{ms.storeName || 'החנות שלי'}</p>
            {ms.tagline && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{ms.tagline}</p>}
          </div>
        </div>
        <button onClick={() => setShowCart(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 24, background: cartCount > 0 ? `linear-gradient(135deg,${accent},#5BC4C8)` : '#f3f4f6', color: cartCount > 0 ? 'white' : '#6b7280', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          סל {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
      </div>

      {/* ── Compact hero ── */}
      <div style={{ position: 'relative', height: 160, background: ms.coverImage ? 'transparent' : `linear-gradient(135deg,${accent},${accent}bb 60%,#5BC4C8)`, overflow: 'hidden' }}>
        {ms.coverImage
          ? <img src={ms.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ position: 'absolute', bottom: -50, left: 20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {ms.logoImage
                  ? <img src={ms.logoImage} alt="" style={{ width: 56, height: 56, borderRadius: 16, border: '3px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 26 }}>🛍️</span></div>
                }
                <p style={{ color: 'white', fontWeight: 900, fontSize: 20, margin: 0, textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>{ms.storeName || 'החנות שלי'}</p>
              </div>
            </>
          )
        }
        {ms.coverImage && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.5))' }} />}
        {ms.coverImage && (
          <div style={{ position: 'absolute', bottom: 14, right: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            {ms.logoImage && <img src={ms.logoImage} alt="" style={{ width: 40, height: 40, borderRadius: 11, border: '2px solid white', objectFit: 'cover', flexShrink: 0 }} />}
            <p style={{ color: 'white', fontWeight: 900, fontSize: 17, margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{ms.storeName || 'החנות שלי'}</p>
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', position: 'sticky', top: 54, zIndex: 39, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveCat(null); }}
            style={{ flex: 1, padding: '11px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', position: 'relative', color: activeTab === tab.id ? accent : '#9ca3af', transition: 'color 0.2s' }}>
            {tab.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2.5, borderRadius: 2, background: `linear-gradient(90deg,${accent},#5BC4C8)` }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: '16px 14px 120px' }}>

        {/* TAB: קטגוריות */}
        {activeTab === 'cats' && (
          <motion.div key="cats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {(ms.categories || []).map((cat, i) => (
                <div key={i} onClick={() => handleCatClick(cat, i)}
                  style={{ borderRadius: 18, overflow: 'hidden', background: 'white', cursor: 'pointer',
                    boxShadow: activeCat === i ? `0 0 0 2px ${accent}, 0 8px 24px rgba(0,0,0,0.12)` : '0 2px 10px rgba(0,0,0,0.07)',
                    transform: activeCat === i ? 'translateY(-2px)' : 'none', transition: 'all 0.2s' }}>
                  <div style={{ height: 110, background: cat.image ? 'transparent' : `linear-gradient(135deg,${accent}44,${accent}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {cat.image
                      ? <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 36 }}>{cat.icon || '🛍️'}</span>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.35))' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '2px 8px' }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#374151' }}>{(cat.products||[]).filter(p=>p.name).length} פריטים</span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#111', margin: 0 }}>{cat.name || 'קטגוריה'}</p>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </div>
                  </div>
                </div>
              ))}
              {(ms.categories || []).length === 0 && (
                <div style={{ gridColumn: 'span 2', height: 100, borderRadius: 18, border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>אין קטגוריות עדיין</p>
                </div>
              )}
            </div>

            {/* Inline products (page mode) */}
            <AnimatePresence>
              {activeCat !== null && ms.categories?.[activeCat]?.displayMode !== 'popup' && (
                <motion.div key="inline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ background: 'white', borderRadius: 18, padding: '14px 12px', marginBottom: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{ms.categories[activeCat].icon || '🛍️'}</span>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: 0 }}>{ms.categories[activeCat].name}</p>
                    <button onClick={() => setActiveCat(null)} style={{ marginRight: 'auto', width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(ms.categories[activeCat].products || []).filter(p => p.name).map((p, pi) => <ProductCard key={pi} p={p} cols={2} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB: אז מה אנחנו */}
        {activeTab === 'about' && (
          <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(ms.aboutText || ms.aboutTitle) ? (
              <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>📖</span></div>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#111', margin: 0 }}>{ms.aboutTitle || 'אז מה אנחנו?'}</p>
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.aboutText}</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg,${accent},#5BC4C8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><span style={{ fontSize: 26 }}>🏪</span></div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>{ms.storeName || 'החנות שלי'}</p>
                {ms.tagline && <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{ms.tagline}</p>}
              </div>
            )}
            {ms.terms && (
              <div style={{ background: 'white', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>📋</span>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: 0 }}>תקנון ותנאי שימוש</p>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.terms}</p>
              </div>
            )}
            {ms.cancelPolicy && (
              <div style={{ background: 'white', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>↩️</span>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#374151', margin: 0 }}>מדיניות ביטולים</p>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{ms.cancelPolicy}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: צרו קשר */}
        {activeTab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hasSocial && (
              <div style={{ background: 'white', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 14 }}>עקבו אחרינו</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {ms.social?.whatsapp && (
                    <a href={`https://wa.me/${ms.social.whatsapp.replace(/\D/g,'').replace(/^0/,'972')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 calc(50% - 6px)', padding: '10px 14px', borderRadius: 14, background: '#f0fdf4', textDecoration: 'none', border: '1px solid #bbf7d0' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg></div>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>WhatsApp</p><p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ms.social.whatsapp}</p></div>
                    </a>
                  )}
                  {ms.social?.instagram && (
                    <a href={`https://instagram.com/${ms.social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 calc(50% - 6px)', padding: '10px 14px', borderRadius: 14, background: '#fdf2f8', textDecoration: 'none', border: '1px solid #f9a8d4' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>Instagram</p><p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ms.social.instagram}</p></div>
                    </a>
                  )}
                  {ms.social?.facebook && (
                    <a href={`https://facebook.com/${ms.social.facebook}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 calc(50% - 6px)', padding: '10px 14px', borderRadius: 14, background: '#eff6ff', textDecoration: 'none', border: '1px solid #bfdbfe' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></div>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>Facebook</p><p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ms.social.facebook}</p></div>
                    </a>
                  )}
                  {ms.social?.tiktok && (
                    <a href={`https://tiktok.com/@${ms.social.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 calc(50% - 6px)', padding: '10px 14px', borderRadius: 14, background: '#f9fafb', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.82 1.55V6.79a4.85 4.85 0 01-1.05-.1z"/></svg></div>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>TikTok</p><p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{ms.social.tiktok}</p></div>
                    </a>
                  )}
                  {ms.social?.website && (
                    <a href={ms.social.website} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 calc(50% - 6px)', padding: '10px 14px', borderRadius: 14, background: '#f5f3ff', textDecoration: 'none', border: '1px solid #ddd6fe' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>אתר</p><p style={{ fontSize: 10, color: '#6b7280', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ms.social.website}</p></div>
                    </a>
                  )}
                </div>
              </div>
            )}
            {ms.terms && (
              <div style={{ background: 'white', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>תקנון ותנאי שימוש</p>
                <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{ms.terms}</p>
              </div>
            )}
            {!hasSocial && !ms.terms && (
              <div style={{ background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 32, margin: '0 0 12px' }}>📱</p>
                <p style={{ fontSize: 14, color: '#9ca3af' }}>אין פרטי קשר להצגה</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Sticky cart bar ── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 640, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '12px 16px 16px', zIndex: 50, boxShadow: '0 -6px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Cart summary */}
              <button onClick={() => setShowCart(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 14, background: '#f3f4f6', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#111' }}>{cartCount}</span>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>· ₪{cartTotal.toFixed(0)}</span>
              </button>
              {/* WhatsApp order button */}
              <button onClick={() => setShowCheckout(true)}
                style={{ flex: 1, padding: '13px 16px', borderRadius: 14, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 18px rgba(37,211,102,0.35)' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                הזמן בוואטסאפ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartModal />
      <CategoryPopup />
      {selectedProduct && <ProductDetailModal />}

      <AnimatePresence>
        {showCheckout && (
          <WhatsAppCheckout
            items={cart}
            storeName={ms.storeName}
            whatsappNumber={whatsappNumber}
            accent={accent}
            total={cartTotal.toFixed(2)}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main StorePage ───────────────────────────────────────────────────────────
export default function StorePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getStoreBySlug(slug)
      .then(setStore)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <svg className="animate-spin w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>
  );

  if (notFound || !store) return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-8">
      <p style={{ fontSize: 56 }}>🛍️</p>
      <h1 className="text-2xl font-black text-gray-800 mt-4 mb-2">החנות לא נמצאה</h1>
      <p className="text-gray-400 mb-6">הכתובת לא קיימת או שהחנות לא פורסמה</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: 'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>לדף הבית</button>
    </div>
  );

  const d = store.data || {};
  const storeType = d.storeType || store.store_type || 'multi';

  return storeType === 'single'
    ? <SingleStorePage d={d} />
    : <MultiStorePage ms={d.multi || d} />;
}
