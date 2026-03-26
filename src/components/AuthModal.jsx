import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { loginWithEmail, signupWithEmail } = useAuth();

  const reset = () => {
    setError('');
    setSuccessMsg('');
  };

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
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 1500);
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            dir="rtl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            {/* Logo/Title */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
                M
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'login' ? 'ברוך הבא ל-Vizzit' : 'צור חשבון חינמי'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'login' ? 'התחבר כדי לשמור ולפרסם את הדף שלך' : 'תוך שניות הדף שלך יהיה חי'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              {['login', 'signup'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); reset(); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={mode === m ? { background: 'white', color: '#4F46E5', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: '#6b7280' }}
                >
                  {m === 'login' ? 'התחברות' : 'הרשמה'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3"
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl px-4 py-3"
                >
                  {successMsg}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-70 mt-1"
                style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    רגע...
                  </span>
                ) : mode === 'login' ? 'התחבר' : 'יצור חשבון'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              על ידי הרשמה, אתה מסכים ל
              <span className="text-indigo-500 cursor-pointer"> תנאי השימוש</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
