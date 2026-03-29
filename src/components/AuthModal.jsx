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

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all";
  const inputStyle = { background: '#f4f7f9', border: '1.5px solid #e5eaef' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-sm z-10 overflow-hidden"
            style={{ borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            dir="rtl"
          >
            {/* ── Header (dark) ── */}
            <div className="relative px-7 pt-8 pb-7" style={{ background: '#0f0f14' }}>
              {/* Close */}
              <button onClick={onClose}
                className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                  <LogoMark size={22} color="white" />
                </div>
                <span className="font-black text-white text-base tracking-tight">Vizzit</span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-1">
                {mode === 'login' ? 'ברוך הבא 👋' : 'צור חשבון חינמי'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {mode === 'login'
                  ? 'התחבר כדי לנהל את הדפים שלך'
                  : 'תוך שתי דקות יהיה לך עמוד שעובד בשבילך'}
              </p>

              {/* Feature pills (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div className="flex flex-wrap gap-2 mt-5"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    {['חינם לגמרי', 'בלי קוד', 'מוכן תוך 2 דקות'].map((t, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(91,196,200,0.12)', color: '#5BC4C8' }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: '#5BC4C8' }} />
                        {t}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Form (white) ── */}
            <div className="bg-white px-7 pt-6 pb-7">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: '#f0f4f8' }}>
                {[['login', 'התחברות'], ['signup', 'הרשמה']].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); reset(); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={mode === m
                      ? { background: 'white', color: '#5BC4C8', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }
                      : { color: '#9ca3af' }}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">שם מלא</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="ישראל ישראלי"
                        className={inputClass} style={inputStyle} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">אימייל</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputClass} style={inputStyle} dir="ltr" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">סיסמה</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="לפחות 6 תווים"
                    className={inputClass} style={inputStyle} />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-sm rounded-xl px-4 py-3"
                      style={{ background: '#fff1f0', color: '#e53935', border: '1px solid #fecaca' }}>
                      {error}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-sm rounded-xl px-4 py-3"
                      style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60 mt-1"
                  style={{ background: 'linear-gradient(135deg, #F4938C 0%, #5BC4C8 100%)', boxShadow: '0 4px 16px rgba(91,196,200,0.3)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      רגע...
                    </span>
                  ) : mode === 'login' ? 'כניסה לחשבון' : 'יצירת חשבון חינמי'}
                </button>
              </form>

              <p className="text-[11px] text-gray-400 text-center mt-4">
                על ידי הרשמה אתה מסכים ל
                <span className="cursor-pointer" style={{ color: '#5BC4C8' }}> תנאי השימוש</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
