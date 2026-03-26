/**
 * LogoMark — the stylized M logo
 * color: fill/stroke color (default: brand purple)
 * size: icon size in px
 * onDark: if true, renders suitable for dark backgrounds (uses white variant if needed)
 */
export default function LogoMark({ size = 32, color = '#5B5BD6', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-label="MyCard"
    >
      {/* Left outer leg — straight down, teardrop circle at bottom */}
      <line x1="18" y1="10" x2="18" y2="54" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <circle cx="18" cy="65" r="8" stroke={color} strokeWidth="7" fill="none" />

      {/* Left inner diagonal to center V */}
      <line x1="30" y1="10" x2="40" y2="50" stroke={color} strokeWidth="7" strokeLinecap="round" />

      {/* Center drip dot */}
      <circle cx="40" cy="58" r="4.5" fill={color} />

      {/* Right inner diagonal from center V */}
      <line x1="50" y1="10" x2="40" y2="50" stroke={color} strokeWidth="7" strokeLinecap="round" />

      {/* Right outer — loop/hook at top, straight down with rounded bottom */}
      <path
        d="M50 10 Q64 10 64 24 L64 68"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
