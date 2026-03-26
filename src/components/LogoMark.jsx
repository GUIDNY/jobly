/**
 * LogoMark — Vizzit V logo
 * color: if provided, renders in that solid color (e.g. "white" on dark bg)
 * size: icon size in px
 */
export default function LogoMark({ size = 32, color = null, className = '' }) {
  const gradId = 'vizzit-g';
  const stroke = color || `url(#${gradId})`;
  const accent = color || '#5BC4C8';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-label="Vizzit"
    >
      {!color && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4938C" />
            <stop offset="100%" stopColor="#5BC4C8" />
          </linearGradient>
        </defs>
      )}

      {/* Left arm of V */}
      <line x1="10" y1="13" x2="40" y2="66" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
      {/* Right arm of V */}
      <line x1="55" y1="13" x2="40" y2="66" stroke={stroke} strokeWidth="9" strokeLinecap="round" />

      {/* Curved arrow from right arm */}
      <path
        d="M 50 30 Q 62 16 67 11"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead */}
      <polyline points="61,9 67,11 65,17" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Network nodes */}
      <circle cx="71" cy="17" r="4" fill={accent} />
      <circle cx="65" cy="7"  r="2.8" fill={accent} />
      <circle cx="78" cy="26" r="2.8" fill={accent} />
      <line x1="71" y1="17" x2="65" y2="7"  stroke={accent} strokeWidth="1.5" />
      <line x1="71" y1="17" x2="78" y2="26" stroke={accent} strokeWidth="1.5" />
    </svg>
  );
}
