import { useState } from 'react';
import LogoMark from './LogoMark';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { loginWithEmail, signupWithEmail } = useAuth();
  const reset = () => { setError(''); setSuccessMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('יש למלא את כל השדות'); return; }
    if (mode === 'signup' && !name) { setError('יש להזין שם'); return; }
    if (password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error: err } = await loginWithEmail(email, password);
        if (err) throw err;
        onSuccess?.();
        onClose?.();
      } else {
        const { error: err } = await signupWithEmail(email, password, name);
        if (err) throw err;
        setSuccessMsg('נרשמת בהצלחה! בדוק את המייל לאישור.');
        setTimeout(() => { onSuccess?.(); onClose?.(); }, 1500);
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'אימייל או סיסמה שגויים',
        'Email not confirmed': 'יש לאשר את כתובת המייל תחילה',
        'User already registered': 'משתמש עם מייל זה כבר קיים',
        'Password should be at least 6 characters': 'הסיסמה קצרה מדי',
      };
      setError(msgs[err.message] || 'אירעה שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Phone shell */}
          <motion.div
            dir="rtl"
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 32 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{
              width: 340,
              borderRadius: 52,
              background: '#0a0a0a',
              boxShadow: '0 0 0 1.5px #2a2a2a, 0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
              position: 'relative',
              zIndex: 10,
              overflow: 'hidden',
              padding: 10,
            }}
          >
            {/* Side buttons (decorative) */}
            <div style={{ position: 'absolute', left: -3, top: 100, width: 3, height: 32, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 142, width: 3, height: 56, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 208, width: 3, height: 56, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', right: -3, top: 150, width: 3, height: 80, background: '#1a1a1a', borderRadius: '0 2px 2px 0' }} />

            {/* Screen */}
            <div style={{
              borderRadius: 44,
              overflow: 'hidden',
              position: 'relative',
              background: '#0f0f14',
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                width: 120, height: 34, background: '#000', borderRadius: 20, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
              </div>

              {/* Status bar */}
              <div style={{ height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 24px 8px', position: 'relative', zIndex: 5 }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.3px' }}>9:41</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Signal */}
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    {[0,1,2,3].map(i => (
                      <rect key={i} x={i*4.5} y={12 - (i+1)*3} width="3" height={(i+1)*3} rx="1"
                        fill={i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'} />
                    ))}
                  </svg>
                  {/* WiFi */}
                  <svg width="15" height="12" viewBox="0 0 15 12" fill="rgba(255,255,255,0.9)">
                    <path d="M7.5 9.5a1 1 0 110 2 1 1 0 010-2z"/>
                    <path d="M4.5 7a4.5 4.5 0 016 0" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <path d="M2 4.5a7.5 7.5 0 0111 0" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                  {/* Battery */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ width: 22, height: 11, borderRadius: 3, border: '1px solid rgba(255,255,255,0.5)', padding: 1.5, display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '75%', height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.9)' }} />
                    </div>
                    <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.5)', borderRadius: '0 1px 1px 0' }} />
                  </div>
                </div>
              </div>

              {/* Wallpaper / hero area */}
              <div style={{
                height: 180,
                background: 'linear-gradient(160deg, #1a0533 0%, #0d1f3c 40%, #0a2a2a 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px',
              }}>
                {/* Decorative glow orbs */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,147,140,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,196,200,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Close button */}
                <button onClick={onClose} style={{
                  position: 'absolute', top: 12, left: 16,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Logo + brand */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'linear-gradient(135deg, #F4938C, #5BC4C8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(91,196,200,0.35)',
                  }}>
                    <LogoMark size={28} color="white" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', lineHeight: 1 }}>
                      {mode === 'login' ? 'ברוך הבא 👋' : 'הצטרף עכשיו ✨'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 5 }}>
                      {mode === 'login' ? 'התחבר כדי לנהל את הדפים שלך' : 'תוך 2 דקות יהיה לך עמוד'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form card — glass bottom sheet */}
              <div style={{
                background: 'white',
                borderRadius: '28px 28px 0 0',
                padding: '20px 20px 12px',
                marginTop: -16,
                position: 'relative',
                zIndex: 2,
              }}>
                {/* Drag handle */}
                <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f0f4f8', borderRadius: 14, marginBottom: 16 }}>
                  {[['login', 'התחברות'], ['signup', 'הרשמה']].map(([m, label]) => (
                    <button key={m} onClick={() => { setMode(m); reset(); }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10,
                        fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                        background: mode === m ? 'white' : 'transparent',
                        color: mode === m ? '#5BC4C8' : '#9ca3af',
                        boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                        border: 'none', cursor: 'pointer',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="שם מלא"
                          style={{ width: '100%', background: '#f4f7f9', border: '1.5px solid #e5eaef', borderRadius: 12, padding: '11px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', textAlign: 'right', marginBottom: 0 }} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    dir="ltr"
                    style={{ width: '100%', background: '#f4f7f9', border: '1.5px solid #e5eaef', borderRadius: 12, padding: '11px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', textAlign: 'left' }} />

                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="סיסמה (6+ תווים)"
                    style={{ width: '100%', background: '#f4f7f9', border: '1.5px solid #e5eaef', borderRadius: 12, padding: '11px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: '#fff1f0', color: '#e53935', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
                        {error}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
                        {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 14,
                      background: 'linear-gradient(135deg, #F4938C 0%, #5BC4C8 100%)',
                      color: 'white', fontWeight: 800, fontSize: 14,
                      boxShadow: '0 4px 16px rgba(91,196,200,0.35)',
                      border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                      marginTop: 2,
                    }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        רגע...
                      </span>
                    ) : mode === 'login' ? 'כניסה לחשבון' : 'יצירת חשבון חינמי'}
                  </button>
                </form>

                <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                  על ידי הרשמה אתה מסכים ל
                  <span style={{ color: '#5BC4C8', cursor: 'pointer' }}> תנאי השימוש</span>
                </p>

                {/* Home indicator */}
                <div style={{ width: 120, height: 4, background: '#111', borderRadius: 2, margin: '14px auto 2px' }} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
