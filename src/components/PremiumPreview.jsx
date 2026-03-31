import { useState } from 'react';

export default function PremiumPreview({ data }) {
  const [popupSvc, setPopupSvc] = useState(null);
  const [popupImgIdx, setPopupImgIdx] = useState(0);
  const accent = data.primary_color || '#7c5ce0';
  const name = data.business_name || 'שם העסק';
  const desc = data.description || '';
  const services = data.card_services || [];
  const contactPos = data.contact_position || 'above';

  const openPopup = (svc) => { setPopupSvc(svc); setPopupImgIdx(0); };

  const contactGridEl = (data.phone || data.location_url || data.booking_url) ? (() => {
    const items = [
      data.phone && { label: 'CALL US', color: accent, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg> },
      data.phone && { label: 'WHATSAPP', color: '#22c55e', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
      data.location_url && { label: 'LOCATION', color: '#4285F4', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
      data.booking_url && { label: 'BOOKING', color: accent, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    ].filter(Boolean);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '0 14px 12px' }}>
        {items.map(({ label, color, icon }) => (
          <div key={label} style={{ height: 44, borderRadius: 10, background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <span style={{ fontSize: 6, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
    );
  })() : null;

  return (
    <div dir="rtl" style={{ background: '#070910', minHeight: '100%', color: 'white', fontFamily: 'inherit', fontSize: 12, position: 'relative', overflow: 'hidden' }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {data.avatar_url
            ? <img src={data.avatar_url} style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover' }} alt="" />
            : <div style={{ width: 20, height: 20, borderRadius: 5, background: accent + '33' }} />}
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[10,7,9].map((w,i) => <div key={i} style={{ width: w, height: 1, background: 'rgba(255,255,255,0.35)', borderRadius: 1 }} />)}
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', height: (data.avatar_url || data.background_video_url) ? 130 : 50 }}>
        {data.background_video_url ? (
          <>
            <video src={data.background_video_url} autoPlay loop muted playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: data.background_video_position || '50% 30%', opacity: 0.65 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #070910 0%, transparent 25%, transparent 75%, #070910 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #070910 0%, transparent 18%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(7,9,16,0.55) 68%, #070910 100%)' }} />
          </>
        ) : data.avatar_url ? (
          <>
            <img src={data.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 0.65 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #070910 0%, transparent 25%, transparent 75%, #070910 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #070910 0%, transparent 18%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(7,9,16,0.55) 68%, #070910 100%)' }} />
          </>
        ) : null}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', zIndex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, fontStyle: 'italic', lineHeight: 1.2, marginBottom: 4, color: 'white', textShadow: '0 2px 16px rgba(0,0,0,0.9)', textAlign: 'center' }}>{name}</div>
          {desc && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, textAlign: 'center', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>{desc.slice(0, 50)}{desc.length > 50 ? '...' : ''}</div>}
        </div>
      </div>

      {contactPos === 'above' && contactGridEl}

      {/* Services */}
      {services.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>OUR EXPERTISE</div>
          <div style={{ fontSize: 12, fontWeight: 900, fontStyle: 'italic', marginBottom: 8 }}>
            {data.services_section_title || 'השירותים שלנו'}
          </div>
          {data.services_layout === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {services.slice(0, 4).map((svc, i) => {
                const isHalf = (svc.size || 'full') === 'half';
                return (
                  <div key={i} onClick={() => openPopup(svc)}
                    style={{ gridColumn: isHalf ? 'span 1' : 'span 2', height: isHalf ? 72 : 110, borderRadius: 8, background: '#0d0f1a', border: `1px solid ${accent}33`, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                    {svc.image_url && <img src={svc.image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} alt="" />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,9,16,0.88) 0%, rgba(7,9,16,0.15) 55%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 7px', zIndex: 1 }}>
                      {svc.price && <div style={{ fontSize: 5, fontWeight: 700, color: accent, marginBottom: 1 }}>{svc.price}</div>}
                      <div style={{ fontSize: isHalf ? 7 : 9, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{svc.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {services.slice(0, 3).map((svc, i) => (
                <div key={i} onClick={() => openPopup(svc)}
                  style={{ background: '#0d0f1a', border: `1px solid ${accent}33`, borderRadius: 9, padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                  {svc.image_url && <img src={svc.image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} alt="" />}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {svc.price && <div style={{ fontSize: 6, fontWeight: 700, color: accent, marginBottom: 2 }}>{svc.price}</div>}
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>{svc.title}</div>
                    {svc.description && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{svc.description.slice(0, 30)}</div>}
                  </div>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent + '22', border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke={accent} strokeWidth="2"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contactPos === 'below' && contactGridEl}

      {/* FAQ */}
      {data.faq && data.faq.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>שאלות נפוצות</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.faq.slice(0, 3).map((item, i) => (
              <div key={i} style={{ background: '#0d0f1a', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.question}</div>
                {item.answer && <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item.answer.slice(0, 60)}{item.answer.length > 60 ? '...' : ''}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social */}
      {(data.instagram || data.facebook || data.tiktok) && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ borderRadius: 10, background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.07)', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>עקבו אחרינו</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 7 }}>
              {data.instagram && (
                <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(225,48,108,0.15)', border: '1px solid rgba(225,48,108,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
              )}
              {data.facebook && (
                <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
              )}
              {data.tiktok && (
                <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.84 4.84 0 01-1.07-.1z"/></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini popup overlay */}
      {popupSvc && (() => {
        const imgs = [popupSvc.popup_image_url, popupSvc.image_url].filter(Boolean).filter((v,i,a) => a.indexOf(v) === i);
        const heroImg = imgs[popupImgIdx] || null;
        return (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 20 }}
            onClick={() => setPopupSvc(null)}>
            <div style={{ background: '#0d0f1a', borderRadius: '14px 14px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
              onClick={e => e.stopPropagation()}>
              {heroImg && (
                <div style={{ position: 'relative', height: 110, overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
                  <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #0d0f1a 100%)' }} />
                  {imgs.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
                      {imgs.map((_, di) => (
                        <div key={di} onClick={e => { e.stopPropagation(); setPopupImgIdx(di); }}
                          style={{ width: popupImgIdx === di ? 14 : 5, height: 5, borderRadius: 3, background: popupImgIdx === di ? accent : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div style={{ padding: '8px 12px 10px' }}>
                {popupSvc.price && (
                  <div style={{ display: 'inline-block', fontSize: 7, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: accent + '22', color: accent, border: `1px solid ${accent}44`, marginBottom: 5 }}>{popupSvc.price}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 900, fontStyle: 'italic', color: 'white', marginBottom: 3 }}>{popupSvc.title}</div>
                {popupSvc.description && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 8 }}>{popupSvc.description.slice(0, 80)}</div>}
                <div style={{ height: 26, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: 'white' }}>שלחו הודעה על שירות זה</span>
                </div>
                <div onClick={() => setPopupSvc(null)} style={{ height: 20, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>סגור</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
