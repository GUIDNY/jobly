import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function LoginModal({ onClose }) {
  const { loginWithEmail, signupWithEmail } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'login') {
        const { error } = await loginWithEmail(form.email, form.password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await signupWithEmail(form.email, form.password, form.name);
        if (error) throw error;
        setSuccess('נרשמת בהצלחה! אתה מחובר עכשיו.');
        setTimeout(onClose, 1200);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) setError('אימייל או סיסמה שגויים');
      else if (msg.includes('already registered')) setError('האימייל הזה כבר רשום — נסה להתחבר');
      else setError(msg || 'שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div dir="rtl" className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'ברוך הבא ל-Jobly' : 'הצטרף ל-Jobly'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {mode === 'login' ? 'התחבר כדי להמשיך' : 'צור חשבון חינמי'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="שם מלא"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/60"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="אימייל"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/60"
            />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="סיסמה (מינימום 6 תווים)"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/60"
            />
          </div>

          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'טוען...' : mode === 'login' ? 'התחבר' : 'הצטרף'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? 'אין לך חשבון?' : 'יש לך חשבון?'}
          {' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            {mode === 'login' ? 'הירשם' : 'התחבר'}
          </button>
        </p>
      </div>
    </div>
  );
}
