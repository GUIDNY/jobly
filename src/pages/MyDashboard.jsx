import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import FreelancerView from '../components/dashboard/FreelancerView';
import EmployerView from '../components/dashboard/EmployerView';
import LoginModal from '../components/LoginModal';
import { Briefcase, Users, LogIn, UserCircle, Save, Check } from 'lucide-react';

function ProfileEditor({ user, updateMe }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    whatsapp: user?.whatsapp || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
      whatsapp: user?.whatsapp || '',
      avatar_url: user?.avatar_url || '',
    });
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateMe(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const field = (label, key, opts = {}) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      {opts.textarea ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          rows={4}
          placeholder={opts.placeholder}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/60 resize-none"
        />
      ) : (
        <input
          type={opts.type || 'text'}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={opts.placeholder}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/60"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl">
      {/* Avatar preview */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
        <img
          src={form.avatar_url || `https://i.pravatar.cc/80?u=${user?.email}`}
          alt=""
          className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-400/30 shrink-0"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{form.full_name || 'שם משתמש'}</p>
          <p className="text-orange-500 text-sm mt-0.5">{form.headline || 'כותרת'}</p>
          <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {field('שם מלא', 'full_name', { placeholder: 'שם מלא' })}
        {field('כותרת (headline)', 'headline', { placeholder: 'למשל: Full Stack Developer' })}
        {field('ביוגרפיה', 'bio', { textarea: true, placeholder: 'ספר על עצמך...' })}
        {field('וואטסאפ', 'whatsapp', { placeholder: '050-0000000', type: 'tel' })}
        {field('קישור לתמונת פרופיל', 'avatar_url', { placeholder: 'https://...' })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
      >
        {saved ? <Check size={16} /> : <Save size={16} />}
        {saving ? 'שומר...' : saved ? 'נשמר!' : 'שמור שינויים'}
      </button>
    </div>
  );
}

export default function MyDashboard() {
  const { user, loading, updateMe } = useAuth();
  const [settingType, setSettingType] = useState(false);
  const [settingError, setSettingError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [pageTab, setPageTab] = useState('dashboard');

  if (loading) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">התחבר ל-Jobly</h2>
            <p className="text-gray-500 mb-6 text-sm">כדי לגשת לאזור האישי שלך</p>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              התחבר / הירשם
            </button>
          </div>
        </div>
      </>
    );
  }

  const setUserType = async (type) => {
    setSettingType(true);
    setSettingError('');
    try {
      const result = await updateMe({ user_type: type });
      if (!result) setSettingError('שגיאה בשמירה — נסה שוב');
    } catch {
      setSettingError('שגיאה בשמירה — נסה שוב');
    } finally {
      setSettingType(false);
    }
  };

  // בחירת תפקיד ראשונית
  if (!user.user_type) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ברוך הבא{user.full_name ? `, ${user.full_name}` : ''}!
        </h2>
        <p className="text-gray-500 mb-8">מה התפקיד שלך ב-Jobly?</p>
        {settingError && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{settingError}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setUserType('freelancer')}
            disabled={settingType}
            className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 hover:bg-orange-50 transition-all text-right disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              {settingType ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Briefcase size={24} className="text-orange-500" />
              )}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">פרילנסר</h3>
            <p className="text-xs text-gray-500">אני מציע שירותים וכישורים</p>
          </button>
          <button
            onClick={() => setUserType('employer')}
            disabled={settingType}
            className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 hover:bg-orange-50 transition-all text-right disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              {settingType ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users size={24} className="text-orange-500" />
              )}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">מעסיק</h3>
            <p className="text-xs text-gray-500">אני מחפש כישרון לגייס</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-8">
      {/* Top tab bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
          <button
            onClick={() => setPageTab('dashboard')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              pageTab === 'dashboard' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {user.user_type === 'freelancer' ? <Briefcase size={15} /> : <Users size={15} />}
            {user.user_type === 'freelancer' ? 'פרילנסר' : 'מעסיק'}
          </button>
          <button
            onClick={() => setPageTab('profile')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              pageTab === 'profile' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserCircle size={15} />
            פרופיל
          </button>
        </div>

        {/* Switch role */}
        {pageTab === 'dashboard' && (
          <button
            onClick={() => setUserType(user.user_type === 'freelancer' ? 'employer' : 'freelancer')}
            disabled={settingType}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            עבור ל{user.user_type === 'freelancer' ? 'מעסיק' : 'פרילנסר'}
          </button>
        )}
      </div>

      {pageTab === 'profile' && (
        <ProfileEditor user={user} updateMe={updateMe} />
      )}

      {pageTab === 'dashboard' && (
        user.user_type === 'freelancer'
          ? <FreelancerView user={user} />
          : <EmployerView user={user} />
      )}
    </div>
  );
}
