import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardBySlug } from '../lib/cardsApi';
import LogoMark from '../components/LogoMark';
import { supabase } from '../lib/supabase';

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 16 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            <LogoMark size={30} color="white" />
          </div>
          <div className="flex gap-1.5 justify-center mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#5BC4C8', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" dir="rtl"
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

  const color = card.primary_color || '#5BC4C8';
  const waMsg = card.whatsapp_message || 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור';
  const waLink = card.phone
    ? `https://wa.me/972${card.phone.replace(/^0/, '')}?text=${encodeURIComponent(waMsg)}`
    : null;
  const services = card.card_services || [];
  const hasSocial = card.instagram || card.facebook || card.tiktok || card.location_url;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* ── Desktop bg ── */}
      <div className="hidden md:block fixed inset-0 pointer-events-none"
        style={{ background: `linear-gradient(145deg, ${color}12 0%, #f1f5f9 60%, #e8edf5 100%)` }} />

      {/* ── Page wrapper ── */}
      <div className="relative mx-auto md:py-10 md:px-4" style={{ maxWidth: 480 }}>

        {/* ── HERO HEADER ── */}
        <FadeIn delay={0} y={0}>
          <HeroHeader card={card} color={color} />
        </FadeIn>

        <div className="px-4 md:px-0 space-y-4 pb-32">

          {/* ── PRIMARY CTA ── */}
          {waLink && (
            <FadeIn delay={0.1}>
              <PrimaryCTA waLink={waLink} phone={card.phone} color={color} />
            </FadeIn>
          )}

          {/* ── TRUST BULLETS ── */}
          <FadeIn delay={0.15}>
            <TrustBullets />
          </FadeIn>

          {/* ── SERVICES ── */}
          {services.length > 0 && (
            <FadeIn delay={0.2}>
              <ServicesSection services={services} phone={card.phone} color={color} />
            </FadeIn>
          )}

          {/* ── SECOND CTA ── */}
          {waLink && services.length > 0 && (
            <FadeIn delay={0.25}>
              <SecondCTA waLink={waLink} />
            </FadeIn>
          )}

          {/* ── SOCIAL ── */}
          {hasSocial && (
            <FadeIn delay={0.3}>
              <SocialSection card={card} />
            </FadeIn>
          )}

          {/* ── VIZZIT BRANDING ── */}
          <FadeIn delay={0.35}>
            <div className="text-center pt-2 pb-2">
              <a href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition-all hover:shadow-md"
                style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)' }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                  <LogoMark size={12} color="white" />
                </div>
                <span className="text-xs text-gray-400">כרטיס כזה גם לך —</span>
                <span className="text-xs font-bold" style={{ color: '#5BC4C8' }}>Vizzit בחינם →</span>
              </a>
            </div>
          </FadeIn>
        </div>

        {/* ── STICKY BOTTOM BAR ── */}
        {waLink && <StickyBar waLink={waLink} phone={card.phone} color={color} />}
      </div>
    </div>
  );
}

// ─── Hero Header ──────────────────────────────────────────────────────────────
function HeroHeader({ card, color }) {
  const bgStyle = card.background_style || 'gradient';
  const isImage = bgStyle === 'image' && card.avatar_url;
  const isDark = bgStyle === 'dark';

  const headerBg = isImage
    ? { backgroundImage: `url(${card.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
    : isDark
      ? { background: 'linear-gradient(160deg, #080812 0%, #13132a 100%)' }
      : bgStyle === 'solid'
        ? { background: color }
        : bgStyle === 'glass'
          ? { background: `linear-gradient(160deg, ${color}22 0%, ${color}08 100%)`, backdropFilter: 'blur(20px)' }
          : { background: `linear-gradient(160deg, ${color} 0%, ${color}bb 100%)` };

  const textColor = (isImage || isDark || bgStyle === 'solid' || bgStyle === 'gradient') ? '#fff' : '#1f2937';
  const subColor = (isImage || isDark || bgStyle === 'solid' || bgStyle === 'gradient') ? 'rgba(255,255,255,0.8)' : '#6b7280';

  return (
    <div className="relative overflow-hidden md:rounded-t-[2.5rem]" style={{ ...headerBg, minHeight: 240 }}>
      {(isImage || isDark) && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)' }} />
      )}
      {!isImage && !isDark && bgStyle !== 'glass' && (
        <>
          <div className="absolute rounded-full pointer-events-none" style={{ top: '-20%', right: '-10%', width: 200, height: 200, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ bottom: '-15%', left: '-5%', width: 160, height: 160, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center pt-10 pb-8 px-6 text-center">
        {/* Avatar */}
        {!isImage && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/40 shadow-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            {card.avatar_url ? (
              <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill={bgStyle === 'glass' ? color : 'white'} style={{ width: 42, height: 42, opacity: bgStyle === 'glass' ? 1 : 0.8 }}>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>
        )}
        {isImage && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl mb-4">
            <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
          {[1,2,3,4,5].map(s => (
            <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#FCD34D">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
          <span style={{ color: '#FCD34D', fontSize: 11, fontWeight: 700, marginRight: 2 }}>4.9</span>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>· 87+ לקוחות</span>
        </div>

        {/* Business name */}
        <h1 className="font-black leading-tight mb-2" style={{ fontSize: 26, color: textColor, textShadow: isImage || isDark ? '0 2px 12px rgba(0,0,0,0.4)' : undefined }}>
          {card.business_name || 'שם העסק'}
        </h1>

        {/* Tagline */}
        {card.description && (
          <p className="font-medium leading-snug max-w-xs" style={{ fontSize: 14, color: subColor, textShadow: isImage || isDark ? '0 1px 6px rgba(0,0,0,0.3)' : undefined }}>
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Primary CTA ─────────────────────────────────────────────────────────────
function PrimaryCTA({ waLink, phone, color }) {
  return (
    <div className="bg-white rounded-3xl p-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="relative flex flex-col items-center justify-center gap-1 w-full rounded-2xl text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', padding: '16px 20px', boxShadow: '0 8px 28px -4px rgba(34,197,94,0.5)' }}>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: '#22c55e' }} />
        <div className="relative flex items-center gap-2.5">
          <WAIcon size={22} />
          <div className="text-right">
            <p className="font-black text-base leading-tight">קבע תור עכשיו ב-WhatsApp</p>
            <p className="text-green-100 text-xs font-medium mt-0.5">מענה מהיר ⚡</p>
          </div>
        </div>
      </a>

      {phone && (
        <a href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 w-full mt-2.5 rounded-2xl py-3 font-semibold text-sm border-2 border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <PhoneIcon size={15} />
          התקשר עכשיו
        </a>
      )}
    </div>
  );
}

// ─── Trust Bullets ────────────────────────────────────────────────────────────
function TrustBullets() {
  const bullets = [
    { icon: '✓', text: 'לקוחות מרוצים' },
    { icon: '⚡', text: 'שירות מהיר' },
    { icon: '📅', text: 'קביעת תור תוך דקות' },
  ];
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span style={{ fontSize: 13 }}>{b.icon}</span>
          <span className="text-xs font-semibold text-gray-500">{b.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────
function ServicesSection({ services, phone, color }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-base">השירותים שלנו</h2>
        <span className="text-xs text-gray-400 font-medium">{services.length} שירותים</span>
      </div>
      <div className="divide-y divide-gray-50">
        {services.map((svc, i) => {
          const svcWaLink = phone
            ? `https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent(`היי, אני מעוניין/ת בשירות: ${svc.title}`)}`
            : null;
          return (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start gap-3">
                {svc.image_url ? (
                  <img src={svc.image_url} alt={svc.title} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: color + '18' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: color }}>
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight">{svc.title}</p>
                    {svc.price && (
                      <span className="flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-xl"
                        style={{ background: color + '15', color }}>
                        {svc.price}
                      </span>
                    )}
                  </div>
                  {svc.description && (
                    <p className="text-gray-400 text-xs leading-snug mt-0.5">{svc.description}</p>
                  )}
                </div>
              </div>
              {svcWaLink && (
                <a href={svcWaLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full mt-3 rounded-xl py-2.5 font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#22c55e15', color: '#16a34a', border: '1.5px solid #22c55e30' }}>
                  <WAIcon size={14} />
                  הזמן שירות זה
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Second CTA ───────────────────────────────────────────────────────────────
function SecondCTA({ waLink }) {
  return (
    <a href={waLink} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2.5 w-full rounded-3xl py-4 font-black text-white text-base transition-all hover:opacity-95 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 6px 24px -4px rgba(34,197,94,0.45)' }}>
      <WAIcon size={20} />
      קבע תור עכשיו
    </a>
  );
}

// ─── Social Section ───────────────────────────────────────────────────────────
function SocialSection({ card }) {
  const links = [
    card.instagram && { label: 'Instagram', color: '#E1306C', href: `https://instagram.com/${card.instagram.replace('@', '')}`, icon: <InstagramIcon /> },
    card.facebook && { label: 'Facebook', color: '#1877F2', href: card.facebook.startsWith('http') ? card.facebook : `https://facebook.com/${card.facebook}`, icon: <FacebookIcon /> },
    card.tiktok && { label: 'TikTok', color: '#000', href: `https://tiktok.com/@${card.tiktok.replace('@', '')}`, icon: <TikTokIcon /> },
    card.location_url && { label: 'מיקום', color: '#4285F4', href: card.location_url, icon: <MapPinIcon /> },
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
      <p className="font-black text-gray-900 text-sm mb-4 text-center">עקבו אחרינו</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {links.map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: l.color, boxShadow: `0 4px 12px ${l.color}40` }}>
            {l.icon}
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Bottom Bar ────────────────────────────────────────────────────────
function StickyBar({ waLink, phone, color }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.06)', padding: '10px 16px 14px' }}
      >
        <div className="mx-auto flex gap-2.5" style={{ maxWidth: 480 }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center rounded-2xl text-white py-3 font-black transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 6px 20px -4px rgba(34,197,94,0.5)' }}>
            <div className="flex items-center gap-2">
              <WAIcon size={18} />
              <span className="text-sm">קבע תור עכשיו ב-WhatsApp</span>
            </div>
            <span className="text-green-200 text-[11px] font-medium mt-0.5">מענה מהיר ⚡</span>
          </a>
          {phone && (
            <a href={`tel:${phone}`}
              className="flex items-center justify-center px-4 rounded-2xl border-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors">
              <PhoneIcon size={18} />
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function WAIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );
}
function InstagramIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
}
function FacebookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function TikTokIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.84 4.84 0 01-1.07-.1z"/></svg>;
}
function MapPinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
