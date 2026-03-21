import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import FreelancerView from '../components/dashboard/FreelancerView';
import EmployerView from '../components/dashboard/EmployerView';
import { Briefcase, Users, LogIn } from 'lucide-react';

export default function MyDashboard() {
  const { user, loading, loginWithGoogle, updateMe } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center text-gray-400">טוען...</div>;
  }

  if (!user) {
    return (
      <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">התחבר ל-Jobly</h2>
          <p className="text-gray-500 mb-6 text-sm">כדי לגשת לאזור האישי שלך, עליך להתחבר תחילה</p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            התחבר עם Google
          </button>
        </div>
      </div>
    );
  }

  const setUserType = (type) => updateMe({ user_type: type });

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-8">
      {/* User type toggle */}
      {!user.user_type && (
        <div className="max-w-lg mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ברוך הבא, {user.full_name}!</h2>
          <p className="text-gray-500 mb-8">מה התפקיד שלך ב-Jobly?</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('freelancer')}
              className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 transition-all text-right"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase size={24} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">פרילנסר</h3>
              <p className="text-xs text-gray-500">אני מציע שירותים ורוצה ללקוחות</p>
            </button>
            <button
              onClick={() => setUserType('employer')}
              className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 transition-all text-right"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">מעסיק</h3>
              <p className="text-xs text-gray-500">אני מחפש כישרון ורוצה לגייס</p>
            </button>
          </div>
        </div>
      )}

      {user.user_type && (
        <>
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

          {user.user_type === 'freelancer' ? <FreelancerView user={user} /> : <EmployerView user={user} />}
        </>
      )}
    </div>
  );
}
