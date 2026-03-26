import { motion, AnimatePresence } from 'framer-motion';

// ─── Background style helpers (used also in picker thumbnails) ────────────────
export function resolveHeaderTheme(bgStyle, color, avatarUrl) {
  switch (bgStyle) {
    case 'glass':
      return { textColor: '#1e1b4b', subColor: `${color}cc`, starColor: color, badgeBg: `${color}18`, isLight: true };
    case 'dark':
      return { textColor: '#ffffff', subColor: 'rgba(255,255,255,0.65)', starColor: '#fbbf24', badgeBg: 'rgba(255,255,255,0.1)', isLight: false };
    default:
      return { textColor: '#ffffff', subColor: 'rgba(255,255,255,0.82)', starColor: 'rgba(255,255,255,0.9)', badgeBg: 'rgba(255,255,255,0.18)', isLight: false };
  }
}

// ─── Main CardPreview ─────────────────────────────────────────────────────────
export default function CardPreview({ data = {}, compact = false, showActions = true }) {
  const {
    business_name = '',
    description = '',
    phone = '',
    avatar_url = '',
    whatsapp_message = 'היי, הגעתי דרך הכרטיס שלך ורוצה לקבוע תור',
    instagram = '',
    facebook = '',
    tiktok = '',
    location_url = '',
    booking_url = '',
    template = 1,
    primary_color = '#4F46E5',
    background_style = 'gradient',
    card_services = [],
    services_layout = 'list',
    whatsapp_position = 'bottom',
    title_align = 'center',
    name_size = 'md',
  } = data;

  const waLink = phone
    ? `https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent(whatsapp_message)}`
    : '#';
  const callLink = phone ? `tel:${phone}` : '#';

  const placeholderName = business_name || 'שם העסק';
  const placeholderDesc = description || 'תיאור קצר על העסק שלך';

  if (template === 2) return <Template2 {...{ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact, showActions, services_layout, whatsapp_position, title_align, name_size }} />;
  if (template === 3) return <Template3 {...{ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact, showActions, services_layout, whatsapp_position, title_align, name_size }} />;

  const hasPhone = !!phone;
  const hasServices = card_services && card_services.length > 0;
  const hasSocial = instagram || facebook || tiktok || location_url;
  const theme = resolveHeaderTheme(background_style, primary_color, avatar_url);

  const displayServices = hasServices ? card_services : compact ? [
    { title: 'תספורת גבר', description: 'קצר, קלאסי, מודרני' },
    { title: 'צביעה', description: 'כל הגוונים, תוצאה מושלמת' },
  ] : [];

  // Button colors depend on the card content bg (always white below header)
  const waButtonStyle = {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    boxShadow: '0 4px 14px -4px rgba(34,197,94,0.45)',
    padding: compact ? '10px 14px' : '13px 16px',
    fontSize: compact ? 12 : 14,
  };
  const callButtonStyle = {
    border: '1.5px solid #e5e7eb',
    color: '#374151',
    padding: compact ? '9px 14px' : '12px 16px',
    fontSize: compact ? 12 : 14,
  };

  // ── Action buttons block (reused in top or bottom position) ──
  const actionButtons = showActions && (
    <div style={{ padding: compact ? '14px 14px 0' : '18px 16px 0', background: background_style === 'dark' ? '#0a0a12' : '#fff' }}>
      {hasPhone ? (
          <div className="space-y-2">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-2xl text-white font-bold"
              style={waButtonStyle}>
              <WhatsAppIcon size={compact ? 15 : 17} /><span>שלח WhatsApp</span>
            </a>
            <a href={callLink}
              className="flex items-center justify-center gap-2 w-full rounded-2xl font-semibold"
              style={background_style === 'dark'
                ? { border: `1.5px solid ${primary_color}55`, color: '#e2e8f0', ...callButtonStyle, borderColor: `${primary_color}55` }
                : callButtonStyle}>
              <PhoneIcon size={compact ? 13 : 15} /><span>התקשר עכשיו</span>
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 w-full rounded-2xl font-bold"
              style={{ background: '#dcfce7', color: '#86efac', padding: compact ? '10px 14px' : '13px 16px', fontSize: compact ? 12 : 14 }}>
              <WhatsAppIcon size={compact ? 15 : 17} /><span>שלח WhatsApp</span>
            </div>
            <div className="flex items-center justify-center gap-2 w-full rounded-2xl font-semibold"
              style={{ border: '1.5px solid #f3f4f6', color: '#d1d5db', padding: compact ? '9px 14px' : '12px 16px', fontSize: compact ? 12 : 14 }}>
              <PhoneIcon size={compact ? 13 : 15} /><span>התקשר עכשיו</span>
            </div>
          </div>
        )}
        {booking_url && (
          <a href={booking_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-semibold text-white mt-2"
            style={{ background: primary_color, padding: compact ? '9px 14px' : '12px 16px', fontSize: compact ? 12 : 14 }}>
            <CalendarIcon size={compact ? 13 : 15} /><span>קבע תור</span>
          </a>
        )}
    </div>
  );

  return (
    <div className="min-h-full overflow-y-auto" dir="rtl"
      style={{ fontFamily: "'Heebo', sans-serif", background: background_style === 'dark' ? '#0a0a12' : '#ffffff' }}
    >
      {/* ── Animated Header ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${background_style}-${primary_color}`}
          initial={{ opacity: 0.6, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <CardHeader
            bgStyle={background_style}
            color={primary_color}
            avatarUrl={avatar_url}
            name={placeholderName}
            desc={placeholderDesc}
            theme={theme}
            compact={compact}
            titleAlign={title_align}
            nameSize={name_size}
          />
        </motion.div>
      </AnimatePresence>

      {/* WhatsApp — top position (default) */}
      {whatsapp_position === 'top' && actionButtons}

      {/* ── Services ── */}
      {displayServices.length > 0 && (
        <div style={{ padding: compact ? '14px 14px 0' : '18px 16px 0', background: background_style === 'dark' ? '#0a0a12' : '#fff' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black" style={{ fontSize: compact ? 12 : 14, color: background_style === 'dark' ? '#e2e8f0' : '#1f2937' }}>
              השירותים שלנו
            </h2>
            {!hasServices && <span style={{ color: '#6b7280', fontSize: 9 }}>דוגמה</span>}
          </div>

          {services_layout === 'grid' ? (
            /* ── Grid layout ── */
            <div className="grid grid-cols-2 gap-2" style={{ opacity: !hasServices ? 0.45 : 1 }}>
              {displayServices.map((svc, i) => (
                <div key={i} className="rounded-xl overflow-hidden relative"
                  style={{ height: compact ? 72 : 90, background: background_style === 'dark' ? '#13132a' : primary_color + '12' }}>
                  {svc.image_url ? (
                    <>
                      <img src={svc.image_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex flex-col justify-end p-1.5"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' }}>
                        <p className="text-white font-bold leading-tight truncate" style={{ fontSize: compact ? 9 : 11 }}>{svc.title}</p>
                        {svc.description && <p className="truncate" style={{ fontSize: compact ? 7.5 : 9, color: 'rgba(255,255,255,0.72)' }}>{svc.description}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1">
                      <div className="rounded-lg flex items-center justify-center"
                        style={{ width: compact ? 24 : 30, height: compact ? 24 : 30, background: primary_color + '25' }}>
                        <svg viewBox="0 0 24 24" style={{ width: compact ? 12 : 15, height: compact ? 12 : 15, fill: primary_color }}>
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                        </svg>
                      </div>
                      <p className="font-bold text-center px-0.5 truncate w-full" style={{ fontSize: compact ? 9 : 11, color: background_style === 'dark' ? '#e2e8f0' : '#1f2937' }}>{svc.title}</p>
                      {svc.description && <p className="text-center truncate w-full px-0.5" style={{ fontSize: compact ? 7.5 : 9, color: '#9ca3af' }}>{svc.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* ── List layout (default) ── */
            <div className="space-y-2">
              {displayServices.map((svc, i) => {
                const svcWaLink = hasPhone
                  ? `https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent(`היי, אני מעוניין/ת בשירות: ${svc.title}`)}`
                  : null;
                return (
                <div key={i} className="rounded-xl"
                  style={{
                    background: background_style === 'dark' ? '#13132a' : '#f9fafb',
                    border: `1px solid ${background_style === 'dark' ? '#1e1e3a' : '#f3f4f6'}`,
                    padding: compact ? '8px 10px' : '10px 12px',
                    opacity: !hasServices ? 0.45 : 1,
                  }}>
                  <div className="flex items-center gap-3">
                    {svc.image_url
                      ? <img src={svc.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      : <div className="rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ width: compact ? 32 : 38, height: compact ? 32 : 38, background: primary_color + '20' }}>
                          <svg viewBox="0 0 24 24" style={{ width: compact ? 14 : 17, height: compact ? 14 : 17, fill: primary_color }}>
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                          </svg>
                        </div>
                    }
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate" style={{ fontSize: compact ? 11 : 13, color: background_style === 'dark' ? '#e2e8f0' : '#1f2937' }}>{svc.title}</p>
                      {svc.description && <p className="truncate mt-0.5" style={{ fontSize: compact ? 9 : 11, color: background_style === 'dark' ? '#6b7280' : '#9ca3af' }}>{svc.description}</p>}
                    </div>
                    {svc.price && (
                      <span className="flex-shrink-0 font-bold rounded-lg px-2 py-1"
                        style={{ fontSize: compact ? 9 : 11, background: primary_color + '18', color: primary_color }}>
                        {svc.price}
                      </span>
                    )}
                  </div>
                  {svcWaLink && hasServices && !compact && (
                    <a href={svcWaLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full mt-2 rounded-lg font-semibold"
                      style={{ background: '#22c55e18', color: '#16a34a', fontSize: 11, padding: '6px 0' }}>
                      <WhatsAppIcon size={11} /> הזמן שירות זה
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Social ── */}
      {hasSocial && (
        <div className="flex gap-2.5 justify-center" style={{ padding: compact ? '12px 14px 0' : '16px 16px 0', background: background_style === 'dark' ? '#0a0a12' : '#fff' }}>
          {instagram && <SocialBtn href={`https://instagram.com/${instagram.replace('@', '')}`} color="#E1306C"><InstagramIcon size={compact ? 14 : 18} /></SocialBtn>}
          {facebook && <SocialBtn href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} color="#1877F2"><FacebookIcon size={compact ? 14 : 18} /></SocialBtn>}
          {tiktok && <SocialBtn href={`https://tiktok.com/@${tiktok.replace('@', '')}`} color="#000"><TikTokIcon size={compact ? 14 : 18} /></SocialBtn>}
          {location_url && <SocialBtn href={location_url} color="#4285F4"><MapPinIcon size={compact ? 14 : 18} /></SocialBtn>}
        </div>
      )}

      {/* WhatsApp — bottom position */}
      {whatsapp_position === 'bottom' && actionButtons}

      {/* ── Footer ── */}
      <div className="text-center pb-5 mt-3" style={{ fontSize: compact ? 9 : 11, color: background_style === 'dark' ? '#374151' : '#d1d5db', background: background_style === 'dark' ? '#0a0a12' : '#fff' }}>
        נוצר עם <span style={{ color: background_style === 'dark' ? '#6366f1' : '#c4b5fd' }}>Vizzit</span>
      </div>
    </div>
  );
}

// ─── Card Header (the visual centerpiece) ─────────────────────────────────────
function CardHeader({ bgStyle, color, avatarUrl, name, desc, theme, compact, titleAlign = 'center', nameSize = 'md' }) {
  const avatarSize  = compact ? 72 : 88;
  const avatarBorder = compact ? 3 : 4;
  const pt = compact ? 28 : 36;
  const pb = compact ? 40 : 48;

  const avatarEl = (
    <div className="relative z-10 rounded-full overflow-hidden shadow-xl flex-shrink-0"
      style={{
        width: avatarSize, height: avatarSize,
        borderWidth: avatarBorder, borderStyle: 'solid',
        borderColor: bgStyle === 'glass' ? color : 'white',
        boxShadow: bgStyle === 'glass'
          ? `0 4px 20px ${color}44`
          : '0 8px 24px rgba(0,0,0,0.25)',
      }}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"
            style={{ background: bgStyle === 'glass' ? `${color}20` : 'rgba(255,255,255,0.22)' }}>
            <svg viewBox="0 0 24 24" fill={bgStyle === 'glass' ? color : 'white'}
              style={{ width: compact ? 30 : 38, height: compact ? 30 : 38, opacity: bgStyle === 'glass' ? 0.7 : 1 }}>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
      }
    </div>
  );

  // ── gradient ──────────────────────────────────────────────────────────────
  if (bgStyle === 'gradient') {
    return (
      <div className="relative flex flex-col items-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}aa 100%)`, paddingTop: pt, paddingBottom: pb }}>
        <Orb top="-40%" right="-20%" size={180} />
        <Orb bottom="-30%" left="-10%" size={140} />
        {avatarEl}
        <HeaderText name={name} desc={desc} theme={theme} compact={compact} titleAlign={titleAlign} nameSize={nameSize} />
        <RatingBadge theme={theme} compact={compact} />
      </div>
    );
  }

  // ── glass ─────────────────────────────────────────────────────────────────
  if (bgStyle === 'glass') {
    return (
      <div className="relative flex flex-col items-center overflow-hidden"
        style={{ paddingTop: pt, paddingBottom: pb, background: `linear-gradient(160deg, ${color}18 0%, ${color}08 100%)` }}>
        {/* Color blobs */}
        <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: color, opacity: 0.18, filter: 'blur(28px)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: color, opacity: 0.12, filter: 'blur(20px)' }} />
        {/* Frosted glass plate */}
        <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.55)', borderBottom: `1px solid ${color}22` }} />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {avatarEl}
          <HeaderText name={name} desc={desc} theme={theme} compact={compact} titleAlign={titleAlign} nameSize={nameSize} />
          <RatingBadge theme={theme} compact={compact} />
        </div>
      </div>
    );
  }

  // ── dark ──────────────────────────────────────────────────────────────────
  if (bgStyle === 'dark') {
    return (
      <div className="relative flex flex-col items-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #080812 0%, #13132a 100%)', paddingTop: pt, paddingBottom: pb }}>
        {/* Subtle color glow */}
        <div className="absolute pointer-events-none" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: color, opacity: 0.12, filter: 'blur(40px)' }} />
        {/* Grid lines (subtle) */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        {avatarEl}
        <HeaderText name={name} desc={desc} theme={theme} compact={compact} titleAlign={titleAlign} nameSize={nameSize} />
        <RatingBadge theme={theme} compact={compact} />
      </div>
    );
  }

  // ── solid ─────────────────────────────────────────────────────────────────
  if (bgStyle === 'solid') {
    return (
      <div className="relative flex flex-col items-center overflow-hidden"
        style={{ background: color, paddingTop: pt, paddingBottom: pb }}>
        {avatarEl}
        <HeaderText name={name} desc={desc} theme={theme} compact={compact} titleAlign={titleAlign} nameSize={nameSize} />
        <RatingBadge theme={theme} compact={compact} />
      </div>
    );
  }

  // ── image ─────────────────────────────────────────────────────────────────
  if (bgStyle === 'image') {
    return (
      <div className="relative flex flex-col items-center overflow-hidden"
        style={{ paddingTop: pt, paddingBottom: pb, minHeight: compact ? 160 : 200 }}>
        {/* Background image or fallback */}
        {avatarUrl
          ? <div className="absolute inset-0" style={{ backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
          : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}99 100%)` }} />
        }
        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{ background: avatarUrl ? 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.65) 100%)' : 'rgba(0,0,0,0.2)' }} />
        {/* Avatar is hidden in image mode (it IS the background) */}
        {!avatarUrl && (
          <div className="relative z-10 rounded-full overflow-hidden shadow-xl"
            style={{ width: avatarSize, height: avatarSize, borderWidth: avatarBorder, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.18)' }}>
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" style={{ width: compact ? 30 : 38, height: compact ? 30 : 38, opacity: 0.8 }}>
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          </div>
        )}
        <HeaderText name={name} desc={desc} theme={theme} compact={compact} titleAlign={titleAlign} nameSize={nameSize} addShadow />
        <RatingBadge theme={theme} compact={compact} />
      </div>
    );
  }

  return null;
}

const NAME_SIZES = { sm: [14, 17], md: [17, 21], lg: [20, 26] };

function HeaderText({ name, desc, theme, compact, addShadow, titleAlign = 'center', nameSize = 'md' }) {
  const shadow = addShadow ? '0 1px 8px rgba(0,0,0,0.5)' : undefined;
  const [compactSize, fullSize] = NAME_SIZES[nameSize] || NAME_SIZES.md;
  const align = titleAlign || 'center';
  return (
    <>
      <h1 className="font-black px-5 mt-3 leading-tight relative z-10 w-full"
        style={{ fontSize: compact ? compactSize : fullSize, color: theme.textColor, textShadow: shadow, textAlign: align }}>
        {name}
      </h1>
      <p className="px-6 mt-1 relative z-10 w-full"
        style={{ color: theme.subColor, fontSize: compact ? 11 : 13, lineHeight: 1.4, textShadow: shadow, textAlign: align }}>
        {desc}
      </p>
    </>
  );
}

function RatingBadge({ theme, compact }) {
  return (
    <div className="flex items-center gap-1 mt-3 px-3 py-1 rounded-full relative z-10"
      style={{ background: theme.badgeBg, backdropFilter: 'blur(8px)' }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="9" height="9" viewBox="0 0 24 24" fill={theme.starColor}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ color: theme.starColor, fontSize: compact ? 8 : 9, marginRight: 2 }}>מצוין</span>
    </div>
  );
}

function Orb({ top, bottom, left, right, size }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ top, bottom, left, right, width: size, height: size, background: 'rgba(255,255,255,0.1)' }} />
  );
}

// Template 2: Photo Hero (full bleed image)
function Template2({ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact, showActions = true, whatsapp_position = 'bottom', title_align = 'center', name_size = 'md' }) {
  const actionBar = showActions && phone && (
    <div className={`px-4 space-y-2.5 ${compact ? 'mt-3' : 'mt-4'}`}>
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-xl text-white font-medium"
        style={{ background: '#25D366', padding: compact ? '10px' : '13px', fontSize: compact ? '13px' : '15px' }}>
        <WhatsAppIcon size={compact ? 16 : 18} /><span>WhatsApp</span>
      </a>
      <a href={callLink}
        className="flex items-center justify-center gap-2 w-full rounded-xl font-medium border-2 border-gray-200 text-gray-700"
        style={{ padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
        <PhoneIcon size={compact ? 14 : 16} /><span>התקשר</span>
      </a>
      {booking_url && (
        <a href={booking_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl font-medium text-white"
          style={{ background: primary_color, padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
          <CalendarIcon size={compact ? 14 : 16} /><span>קבע תור</span>
        </a>
      )}
    </div>
  );
  const [compactSize, fullSize] = NAME_SIZES[name_size] || NAME_SIZES.md;
  return (
    <div className="bg-white h-full overflow-y-auto" dir="rtl">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {avatar_url ? (
          <img src={avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary_color}33, ${primary_color}66)` }}>
            <svg viewBox="0 0 24 24" className="w-16 h-16" style={{ fill: primary_color }}>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
          <h1 className="font-bold" style={{ fontSize: compact ? compactSize : fullSize, textAlign: title_align }}>{placeholderName}</h1>
          <p className="text-white/80 mt-0.5" style={{ fontSize: compact ? 11 : 13, textAlign: title_align }}>{placeholderDesc}</p>
        </div>
      </div>
      {whatsapp_position === 'top' && actionBar}
      <ServicesList services={card_services} compact={compact} phone={phone} />
      {whatsapp_position === 'bottom' && actionBar}
      <SocialRow {...{ instagram, facebook, tiktok, location_url, compact }} />
      <div className="text-center text-gray-300 text-xs pb-6">נוצר עם Vizzit</div>
    </div>
  );
}

// Template 3: Minimal / Linktree style
function Template3({ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact, showActions = true, whatsapp_position = 'bottom', title_align = 'center', name_size = 'md' }) {
  const [compactSize, fullSize] = NAME_SIZES[name_size] || NAME_SIZES.md;
  const actionBar = showActions && phone && (
    <div className="w-full space-y-2.5">
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-2xl text-white font-medium shadow-sm"
        style={{ background: '#25D366', padding: compact ? '10px' : '13px', fontSize: compact ? '13px' : '15px' }}>
        <WhatsAppIcon size={compact ? 16 : 18} /><span>WhatsApp</span>
      </a>
      <a href={callLink}
        className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium bg-white border border-gray-200 text-gray-700 shadow-sm"
        style={{ padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
        <PhoneIcon size={compact ? 14 : 16} /><span>התקשר</span>
      </a>
      {booking_url && (
        <a href={booking_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium text-white shadow-sm"
          style={{ background: primary_color, padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
          <CalendarIcon size={compact ? 14 : 16} /><span>קבע תור</span>
        </a>
      )}
    </div>
  );
  return (
    <div className="min-h-full overflow-y-auto flex flex-col items-center py-6 px-4" dir="rtl"
      style={{ background: `linear-gradient(160deg, ${primary_color}15 0%, #f8fafc 60%)` }}>
      <div className="w-16 h-16 rounded-full border-3 border-white overflow-hidden bg-gray-200 shadow-lg">
        {avatar_url ? (
          <img src={avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: primary_color }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>
      <h1 className="font-bold text-gray-900 mt-3 w-full" style={{ fontSize: compact ? compactSize : fullSize, textAlign: title_align }}>{placeholderName}</h1>
      <p className="text-gray-500 mt-1 w-full" style={{ fontSize: compact ? 11 : 13, textAlign: title_align }}>{placeholderDesc}</p>
      {whatsapp_position === 'top' && <div className="w-full mt-5">{actionBar}</div>}
      {instagram && (
        <div className="w-full mt-5">
          <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium text-white shadow-sm"
            style={{ background: '#E1306C', padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <InstagramIcon size={compact ? 14 : 16} /><span>Instagram</span>
          </a>
        </div>
      )}
      <ServicesList services={card_services} compact={compact} fullWidth phone={phone} />
      {whatsapp_position === 'bottom' && <div className="w-full mt-4">{actionBar}</div>}
      <div className="text-center text-gray-300 text-xs mt-4 pb-2">נוצר עם Vizzit</div>
    </div>
  );
}

function ServicesList({ services, compact, fullWidth }) {
  if (!services || services.length === 0) return null;
  return (
    <div className={`px-4 ${compact ? 'mt-4' : 'mt-6'} ${fullWidth ? 'w-full' : ''}`}>
      <h2 className={`font-bold text-gray-800 mb-2.5 ${compact ? 'text-sm' : 'text-base'}`}>השירותים שלנו</h2>
      <div className="space-y-2">
        {services.map((svc, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            {svc.image_url && <img src={svc.image_url} alt={svc.title} className="w-full h-24 object-cover rounded-lg mb-2" />}
            <p className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>{svc.title}</p>
            {svc.description && <p className="text-gray-500 text-xs mt-0.5">{svc.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialRow({ instagram, facebook, tiktok, location_url, compact }) {
  if (!instagram && !facebook && !tiktok && !location_url) return null;
  return (
    <div className={`flex gap-3 justify-center ${compact ? 'mt-4 mb-4' : 'mt-5 mb-6'}`}>
      {instagram && <SocialBtn href={`https://instagram.com/${instagram.replace('@', '')}`} color="#E1306C"><InstagramIcon size={compact ? 16 : 20} /></SocialBtn>}
      {facebook && <SocialBtn href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} color="#1877F2"><FacebookIcon size={compact ? 16 : 20} /></SocialBtn>}
      {tiktok && <SocialBtn href={`https://tiktok.com/@${tiktok.replace('@', '')}`} color="#000"><TikTokIcon size={compact ? 16 : 20} /></SocialBtn>}
      {location_url && <SocialBtn href={location_url} color="#4285F4"><MapPinIcon size={compact ? 16 : 20} /></SocialBtn>}
    </div>
  );
}

function SocialBtn({ href, color, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110"
      style={{ background: color }}>
      {children}
    </a>
  );
}

// Icon components
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.74a8.27 8.27 0 004.84 1.55V6.84a4.85 4.85 0 01-1.07-.15z" />
    </svg>
  );
}

function MapPinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
