import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Check, Zap, Star, X } from 'lucide-react';

const FREE_FEATURES = [
  { text: 'סוכן פרילנסר אחד', included: true },
  { text: 'גישה לשוק', included: true },
  { text: 'שיחות בסיסיות', included: true },
  { text: 'עד 3 סוכנים', included: false },
  { text: 'CRM Dashboard', included: false },
  { text: 'תיק עבודות', included: false },
  { text: 'סטטיסטיקות מתקדמות', included: false },
  { text: 'תמיכה מועדפת', included: false },
];

const PRO_FEATURES = [
  { text: 'עד 3 סוכנים', included: true },
  { text: 'גישה לשוק', included: true },
  { text: 'שיחות ללא הגבלה', included: true },
  { text: 'CRM Dashboard', included: true },
  { text: 'תיק עבודות מרכזי', included: true },
  { text: 'סטטיסטיקות מתקדמות', included: true },
  { text: 'תמיכה מועדפת', included: true },
  { text: 'תג "Pro" בפרופיל', included: true },
];

export default function ProUpgrade() {
  const { user, updateMe } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Simulate Stripe redirect / payment success
    updateMe({ role: 'pro' });
    alert('שדרגת בהצלחה ל-Pro! (סימולציה)');
    navigate('/MyDashboard');
  };

  if (user?.role === 'pro') {
    return (
      <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Star size={36} className="text-gray-900 fill-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">כבר Pro!</h2>
        <p className="text-gray-500 mb-6">אתה כבר נהנה מכל הפיצ'רים של Pro.</p>
        <button onClick={() => navigate('/MyDashboard')} className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-medium transition-colors">
          לאזור האישי
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/40 rounded-full text-orange-600 text-sm mb-6">
          <Zap size={14} />
          שדרג לחוויה מלאה
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">בחר את התוכנית שלך</h1>
        <p className="text-gray-500 text-lg">גדל מהר יותר עם כלים מתקדמים</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <p className="text-gray-500 text-sm mb-5">להתחיל ולחקור</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-gray-900">₪0</span>
            <span className="text-gray-500"> / חודש</span>
          </div>
          <div className="space-y-3 mb-8">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm ${f.included ? 'text-gray-700' : 'text-gray-600'}`}>
                {f.included ? <Check size={16} className="text-green-400 shrink-0" /> : <X size={16} className="shrink-0" />}
                {f.text}
              </div>
            ))}
          </div>
          <button
            disabled
            className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl text-sm cursor-not-allowed"
          >
            התוכנית הנוכחית שלך
          </button>
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-b from-orange-50 to-orange-50 border border-orange-400/50 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-xs font-bold text-gray-900">
            מומלץ
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Pro</h2>
          <p className="text-gray-500 text-sm mb-5">לפרילנסרים רציניים</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-gray-900">₪199</span>
            <span className="text-gray-500"> / חודש</span>
          </div>
          <div className="space-y-3 mb-8">
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                <Check size={16} className="text-green-400 shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
          <button
            onClick={handleUpgrade}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-gray-900 rounded-xl text-sm font-semibold transition-opacity"
          >
            שדרג ל-Pro — ₪199/חודש
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">ביטול בכל עת. ללא התחייבות.</p>
        </div>
      </div>
    </div>
  );
}
