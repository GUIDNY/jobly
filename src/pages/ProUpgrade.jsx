import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import LogoMark from '../components/LogoMark';

const PAYMENT_LINK = 'https://mrng.to/cm2FVDePZr';

const FREE_FEATURES = [
  { text: 'כרטיס ביקור דיגיטלי', ok: true },
  { text: 'עיצוב קלאסי', ok: true },
  { text: 'שירותים ותמונות', ok: true },
  { text: 'עיצוב פרמיום (dark)', ok: false },
  { text: 'פופ-אפ שירותים עם תמונות', ok: false },
  { text: 'שיתוף פומבי של העמוד', ok: false },
];

const PRO_FEATURES = [
  { text: 'כרטיס ביקור דיגיטלי', ok: true },
  { text: 'עיצוב קלאסי', ok: true },
  { text: 'שירותים ותמונות', ok: true },
  { text: 'עיצוב פרמיום (dark) ✦', ok: true },
  { text: 'פופ-אפ שירותים עם תמונות', ok: true },
  { text: 'שיתוף פומבי של העמוד', ok: true },
];

const BG = '#070910';
const CARD_BG = '#0d0f1a';
const BORDER = 'rgba(255,255,255,0.07)';

export default function ProUpgrade() {
  const { user, isPro } = useAuth();
  const navigate = useNavigate();

  if (isPro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" dir="rtl"
        style={{ background: BG }}>
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 20px 40px -10px rgba(244,147,140,0.4)' }}>
            <LogoMark size={40} color="white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">אתה כבר Pro ✦</h2>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>נהנה מכל הפיצ׳רים הפרמיום של Vizzit.</p>
          <button onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            לדאשבורד שלי
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: BG }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.7} }
        .pro-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mb-8 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← חזרה
        </button>
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(244,147,140,0.12)', border: '1px solid rgba(244,147,140,0.3)', color: '#F4938C' }}>
            ✦ שדרג לחוויה מלאה
          </div>
          <h1 className="text-4xl font-black text-white mb-3">בחר את התוכנית שלך</h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>כרטיס הביקור הדיגיטלי שלך — פשוט, יפה, ומקצועי</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-3xl p-7" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <h2 className="text-lg font-black text-white mb-1">Free</h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>להתחיל ולגלות</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">₪0</span>
              <span className="text-sm mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/ חודש</span>
            </div>
            <div className="space-y-2.5 mb-7">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm"
                  style={{ color: f.ok ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: 12 }}>{f.ok ? '✓' : '✕'}</span>
                  {f.text}
                </div>
              ))}
            </div>
            <button disabled
              className="w-full py-3 rounded-2xl text-sm font-semibold cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
              {user ? 'התוכנית הנוכחית' : 'הרשמה חינם'}
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-3xl p-7 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #1a0f1f 0%, #0d0f1a 60%)', border: '1px solid rgba(244,147,140,0.3)' }}>
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black text-white pro-shimmer"
              style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
              מומלץ
            </div>
            <h2 className="text-lg font-black text-white mb-1">Pro ✦</h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>לעסקים רציניים</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">₪39</span>
              <span className="text-sm mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/ חודש</span>
            </div>
            <div className="space-y-2.5 mb-7">
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-white">
                  <span style={{ fontSize: 12, color: '#5BC4C8' }}>✓</span>
                  {f.text}
                </div>
              ))}
            </div>
            <a href={PAYMENT_LINK} target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 rounded-2xl text-center text-white font-black text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', boxShadow: '0 8px 24px -6px rgba(244,147,140,0.5)' }}>
              שדרג ל-Pro — ₪39/חודש
            </a>
            <p className="text-[11px] text-center mt-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ביטול בכל עת. ללא התחייבות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
