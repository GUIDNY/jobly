import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import FreelancerView from '../components/dashboard/FreelancerView';
import EmployerView from '../components/dashboard/EmployerView';
import LoginModal from '../components/LoginModal';
import { Briefcase, Users, LogIn } from 'lucide-react';

export default function MyDashboard() {
  const { user, loading, updateMe } = useAuth();
  const [settingType, setSettingType] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
    await updateMe({ user_type: type });
    setSettingType(false);
  };

  // בחירת תפקיד ראשונית
  if (!user.user_type) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ברוך הבא{user.full_name ? `, ${user.full_name}` : ''}!
        </h2>
        <p className="text-gray-500 mb-8">מה התפקיד שלך ב-Jobly?</p>
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
      {/* Toggle bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
          <button
            onClick={() => setUserType('freelancer')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              user.user_type === 'freelancer' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Briefcase size={15} />
            פרילנסר
          </button>
          <button
            onClick={() => setUserType('employer')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              user.user_type === 'employer' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={15} />
            מעסיק
          </button>
        </div>
      </div>

      {user.user_type === 'freelancer'
        ? <FreelancerView user={user} />
        : <EmployerView user={user} />
      }
    </div>
  );
}
