import { motion } from 'framer-motion';

export const BG_STYLES = [
  { id: 'gradient', label: 'גרדיאנט' },
  { id: 'glass',    label: 'זכוכית'  },
  { id: 'dark',     label: 'כהה'     },
  { id: 'solid',    label: 'אחיד'    },
  { id: 'image',    label: 'תמונה'   },
];

// Returns the CSS background value used in the card header
export function getHeaderBg(bgStyle, color, avatarUrl) {
  switch (bgStyle) {
    case 'glass':
      return null; // handled by wrapper
    case 'dark':
      return 'linear-gradient(160deg, #080812 0%, #13132a 100%)';
    case 'solid':
      return color;
    case 'image':
      return avatarUrl ? null : `linear-gradient(160deg, ${color} 0%, ${color}cc 100%)`;
    case 'gradient':
    default:
      return `linear-gradient(160deg, ${color} 0%, ${color}aa 100%)`;
  }
}

// Text color on the header
export function getHeaderTextColor(bgStyle) {
  return bgStyle === 'glass' ? '#1e1b4b' : '#ffffff';
}

// Sub-text color on the header
export function getHeaderSubColor(bgStyle) {
  return bgStyle === 'glass' ? 'rgba(79,70,229,0.7)' : 'rgba(255,255,255,0.82)';
}

// ─── Visual picker ────────────────────────────────────────────────────────────
export default function BgStylePicker({ value, onChange, primaryColor, avatarUrl }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">סגנון רקע</p>
      <div className="flex gap-2.5 flex-wrap">
        {BG_STYLES.map(s => (
          <StyleOption
            key={s.id}
            style={s}
            active={value === s.id}
            primaryColor={primaryColor}
            avatarUrl={avatarUrl}
            onSelect={() => onChange(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StyleOption({ style, active, primaryColor, avatarUrl, onSelect }) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-1.5 focus:outline-none"
    >
      {/* Mini card preview */}
      <div
        className="relative overflow-hidden transition-all"
        style={{
          width: 60,
          height: 72,
          borderRadius: 12,
          border: active ? `2.5px solid ${primaryColor}` : '2px solid #e5e7eb',
          boxShadow: active ? `0 0 0 3px ${primaryColor}33, 0 4px 12px rgba(0,0,0,0.1)` : '0 1px 4px rgba(0,0,0,0.06)',
          background: '#fff',
        }}
      >
        {/* Header section */}
        <MiniHeader type={style.id} color={primaryColor} avatarUrl={avatarUrl} />

        {/* Body section: two placeholder lines */}
        <div className="px-1.5 pt-4 space-y-1">
          <div className="h-1.5 rounded-full bg-gray-200" style={{ width: '80%' }} />
          <div className="h-1.5 rounded-full bg-gray-100" style={{ width: '60%' }} />
          <div className="h-3.5 rounded-md mt-1.5" style={{ background: '#dcfce7' }} />
          <div className="h-3 rounded-md" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }} />
        </div>

        {/* Active checkmark */}
        {active && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: primaryColor, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </motion.div>
        )}
      </div>
      <span className="text-[11px] font-semibold" style={{ color: active ? primaryColor : '#6b7280' }}>
        {style.label}
      </span>
    </motion.button>
  );
}

function MiniHeader({ type, color, avatarUrl }) {
  const height = 36;

  if (type === 'gradient') {
    return (
      <div className="relative flex flex-col items-center justify-end" style={{ height, background: `linear-gradient(160deg, ${color} 0%, ${color}aa 100%)`, paddingBottom: 6 }}>
        <Blobs color={color} />
        <MiniAvatar color={color} avatarUrl={null} />
      </div>
    );
  }

  if (type === 'glass') {
    return (
      <div className="relative flex flex-col items-center justify-end overflow-hidden" style={{ height, paddingBottom: 6, background: `${color}15` }}>
        {/* Blur blobs */}
        <div className="absolute" style={{ top: -8, right: -8, width: 30, height: 30, borderRadius: '50%', background: color, opacity: 0.35, filter: 'blur(10px)' }} />
        <div className="absolute" style={{ bottom: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: color, opacity: 0.25, filter: 'blur(8px)' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(6px)' }} />
        <div className="relative z-10">
          <MiniAvatar color={color} border="white" />
        </div>
      </div>
    );
  }

  if (type === 'dark') {
    return (
      <div className="relative flex flex-col items-center justify-end" style={{ height, background: 'linear-gradient(160deg,#080812,#13132a)', paddingBottom: 6 }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, ${color}30, transparent 70%)` }} />
        <MiniAvatar color={color} />
      </div>
    );
  }

  if (type === 'solid') {
    return (
      <div className="flex flex-col items-center justify-end" style={{ height, background: color, paddingBottom: 6 }}>
        <MiniAvatar color={color} />
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className="relative flex flex-col items-center justify-end overflow-hidden" style={{ height, paddingBottom: 6 }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}88, ${color}44)` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.25))' }} />
        <div className="relative z-10">
          <MiniAvatar color="rgba(255,255,255,0.3)" border="white" />
        </div>
      </div>
    );
  }

  return null;
}

function MiniAvatar({ color, border = 'white', avatarUrl }) {
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: 16, height: 16, border: `1.5px solid ${border}`, background: `${color}55`, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
    >
      <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
    </div>
  );
}

function Blobs({ color }) {
  return (
    <>
      <div className="absolute" style={{ top: -8, right: -8, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
      <div className="absolute" style={{ bottom: 0, left: -4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
    </>
  );
}
