// Live preview of the card, used inside PhoneMockup and on CardPage
export default function CardPreview({ data = {}, compact = false }) {
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
    card_services = [],
  } = data;

  const waLink = phone
    ? `https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent(whatsapp_message)}`
    : '#';
  const callLink = phone ? `tel:${phone}` : '#';

  const placeholderName = business_name || 'שם העסק';
  const placeholderDesc = description || 'תיאור קצר על העסק שלך';

  if (template === 2) return <Template2 {...{ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact }} />;
  if (template === 3) return <Template3 {...{ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact }} />;

  // Default: Template 1 - Gradient Header
  return (
    <div className="bg-white h-full overflow-y-auto" dir="rtl">
      {/* Gradient header */}
      <div
        className="relative flex flex-col items-center pb-10 pt-6"
        style={{ background: `linear-gradient(160deg, ${primary_color} 0%, ${primary_color}cc 100%)` }}
      >
        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white/30 shadow-lg">
          {avatar_url ? (
            <img src={avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-white/20">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-current">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          )}
        </div>
        <h1 className={`text-white font-bold mt-3 text-center px-4 ${compact ? 'text-lg' : 'text-xl'}`}>
          {placeholderName}
        </h1>
        <p className={`text-white/80 mt-1 text-center px-6 ${compact ? 'text-xs' : 'text-sm'}`}>
          {placeholderDesc}
        </p>
      </div>

      {/* Action buttons */}
      <div className={`px-4 space-y-2.5 ${compact ? 'mt-3' : 'mt-4'}`}>
        {phone && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl text-white font-medium shadow-sm"
            style={{
              background: '#25D366',
              padding: compact ? '10px 16px' : '13px 16px',
              fontSize: compact ? '13px' : '15px',
            }}
          >
            <WhatsAppIcon size={compact ? 16 : 18} />
            <span>שלח הודעה ב-WhatsApp</span>
          </a>
        )}
        {phone && (
          <a
            href={callLink}
            className="flex items-center justify-center gap-2 w-full rounded-xl font-medium border-2 border-gray-200 text-gray-700"
            style={{ padding: compact ? '9px 16px' : '12px 16px', fontSize: compact ? '13px' : '15px' }}
          >
            <PhoneIcon size={compact ? 14 : 16} />
            <span>התקשר</span>
          </a>
        )}
        {booking_url && (
          <a
            href={booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl font-medium text-white"
            style={{
              background: primary_color,
              padding: compact ? '9px 16px' : '12px 16px',
              fontSize: compact ? '13px' : '15px',
            }}
          >
            <CalendarIcon size={compact ? 14 : 16} />
            <span>קבע תור</span>
          </a>
        )}
      </div>

      {/* Services */}
      {card_services && card_services.length > 0 && (
        <div className={`px-4 ${compact ? 'mt-4' : 'mt-6'}`}>
          <h2 className={`font-bold text-gray-800 mb-2.5 ${compact ? 'text-sm' : 'text-base'}`}>השירותים שלנו</h2>
          <div className="space-y-2">
            {card_services.map((svc, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                {svc.image_url && (
                  <img src={svc.image_url} alt={svc.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                )}
                <p className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>{svc.title}</p>
                {svc.description && (
                  <p className={`text-gray-500 mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>{svc.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social links */}
      {(instagram || facebook || tiktok || location_url) && (
        <div className={`px-4 flex gap-3 justify-center ${compact ? 'mt-4 mb-4' : 'mt-5 mb-6'}`}>
          {instagram && (
            <SocialBtn href={`https://instagram.com/${instagram.replace('@', '')}`} color="#E1306C">
              <InstagramIcon size={compact ? 16 : 20} />
            </SocialBtn>
          )}
          {facebook && (
            <SocialBtn href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} color="#1877F2">
              <FacebookIcon size={compact ? 16 : 20} />
            </SocialBtn>
          )}
          {tiktok && (
            <SocialBtn href={`https://tiktok.com/@${tiktok.replace('@', '')}`} color="#000000">
              <TikTokIcon size={compact ? 16 : 20} />
            </SocialBtn>
          )}
          {location_url && (
            <SocialBtn href={location_url} color="#4285F4">
              <MapPinIcon size={compact ? 16 : 20} />
            </SocialBtn>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`text-center text-gray-300 ${compact ? 'text-xs pb-4' : 'text-xs pb-6'}`}>
        נוצר עם MyCard
      </div>
    </div>
  );
}

// Template 2: Photo Hero (full bleed image)
function Template2({ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact }) {
  return (
    <div className="bg-white h-full overflow-y-auto" dir="rtl">
      {/* Full hero image */}
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
          <h1 className={`font-bold ${compact ? 'text-base' : 'text-xl'}`}>{placeholderName}</h1>
          <p className={`text-white/80 ${compact ? 'text-xs' : 'text-sm'} mt-0.5`}>{placeholderDesc}</p>
        </div>
      </div>
      <div className={`px-4 space-y-2.5 ${compact ? 'mt-3' : 'mt-4'}`}>
        {phone && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl text-white font-medium"
            style={{ background: '#25D366', padding: compact ? '10px' : '13px', fontSize: compact ? '13px' : '15px' }}>
            <WhatsAppIcon size={compact ? 16 : 18} /><span>WhatsApp</span>
          </a>
        )}
        {phone && (
          <a href={callLink}
            className="flex items-center justify-center gap-2 w-full rounded-xl font-medium border-2 border-gray-200 text-gray-700"
            style={{ padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <PhoneIcon size={compact ? 14 : 16} /><span>התקשר</span>
          </a>
        )}
        {booking_url && (
          <a href={booking_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl font-medium text-white"
            style={{ background: primary_color, padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <CalendarIcon size={compact ? 14 : 16} /><span>קבע תור</span>
          </a>
        )}
      </div>
      <ServicesList services={card_services} compact={compact} />
      <SocialRow {...{ instagram, facebook, tiktok, location_url, compact }} />
      <div className="text-center text-gray-300 text-xs pb-6">נוצר עם MyCard</div>
    </div>
  );
}

// Template 3: Minimal / Linktree style
function Template3({ placeholderName, placeholderDesc, avatar_url, phone, waLink, callLink, primary_color, instagram, facebook, tiktok, location_url, booking_url, card_services, compact }) {
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
      <h1 className={`font-bold text-gray-900 mt-3 text-center ${compact ? 'text-base' : 'text-xl'}`}>{placeholderName}</h1>
      <p className={`text-gray-500 mt-1 text-center ${compact ? 'text-xs' : 'text-sm'}`}>{placeholderDesc}</p>

      <div className="w-full space-y-2.5 mt-5">
        {phone && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl text-white font-medium shadow-sm"
            style={{ background: '#25D366', padding: compact ? '10px' : '13px', fontSize: compact ? '13px' : '15px' }}>
            <WhatsAppIcon size={compact ? 16 : 18} /><span>WhatsApp</span>
          </a>
        )}
        {phone && (
          <a href={callLink}
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium bg-white border border-gray-200 text-gray-700 shadow-sm"
            style={{ padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <PhoneIcon size={compact ? 14 : 16} /><span>התקשר</span>
          </a>
        )}
        {booking_url && (
          <a href={booking_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium text-white shadow-sm"
            style={{ background: primary_color, padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <CalendarIcon size={compact ? 14 : 16} /><span>קבע תור</span>
          </a>
        )}
        {instagram && (
          <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-medium text-white shadow-sm"
            style={{ background: '#E1306C', padding: compact ? '9px' : '12px', fontSize: compact ? '13px' : '15px' }}>
            <InstagramIcon size={compact ? 14 : 16} /><span>Instagram</span>
          </a>
        )}
      </div>
      <ServicesList services={card_services} compact={compact} fullWidth />
      <div className="text-center text-gray-300 text-xs mt-4 pb-2">נוצר עם MyCard</div>
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
