/**
 * LogoMark — Vizzit V logo
 * color: if provided, renders in that solid color (e.g. "white" on dark bg)
 * size: icon size in px
 */
export default function LogoMark({ size = 32, color = null, className = '' }) {
  const gradId = 'vg1';
  const stroke = color || `url(#${gradId})`;
  const accent = color || '#5BC4C8';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 82"
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
      <line x1="10" y1="14" x2="40" y2="68" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
      {/* Right arm of V */}
      <line x1="56" y1="14" x2="40" y2="68" stroke={stroke} strokeWidth="10" strokeLinecap="round" />

      {/* Curved arrow from right arm toward upper-right */}
      <path
        d="M 51 32 Q 62 18 67 13"
        stroke={accent}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead */}
      <polyline
        points="62,11 67,13 66,19"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Network nodes — main hub */}
      <circle cx="72" cy="19" r="4.5" fill={accent} />
      {/* Node top */}
      <circle cx="66" cy="8"  r="3" fill={accent} />
      {/* Node bottom-right */}
      <circle cx="80" cy="28" r="3" fill={accent} />
      {/* Connecting lines */}
      <line x1="72" y1="19" x2="66" y2="8"  stroke={accent} strokeWidth="1.5" />
      <line x1="72" y1="19" x2="80" y2="28" stroke={accent} strokeWidth="1.5" />
    </svg>
  );
}
