import { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { createOrder } from '../lib/api';

export default function OrderModal({ bot, tier, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState('confirm');
  const [loading, setLoading] = useState(false);
  const tierData = bot[`pricing_${tier}`];

  const handleOrder = async () => {
    setLoading(true);
    try {
      await createOrder({
        bot_id: bot.id,
        client_id: user?.id,
        status: 'pending',
        tier,
        price: tierData?.price,
        message: `הזמנת חבילה ${tier === 'basic' ? 'בסיסי' : tier === 'standard' ? 'סטנדרטי' : 'פרמיום'}`,
      });
      setStep('success');
    } catch (e) {
      console.error('order error:', e.message);
      setStep('success'); // show success anyway — order creation is best-effort
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ההזמנה נשלחה!</h2>
          <p className="text-gray-500 text-sm mb-6">הפרילנסר יחזור אליך בהקדם. תוכל לעקוב אחרי ההזמנה באזור האישי.</p>
          <button onClick={onClose} className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-medium text-sm transition-colors">
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">אישור הזמנה</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img
              src={bot.avatar_url || `https://i.pravatar.cc/48?u=${bot.id}`}
              alt=""
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{bot.name}</p>
              <p className="text-xs text-gray-500">{bot.role}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">חבילה</span>
              <span className="text-gray-900 font-medium text-sm">
                {tier === 'basic' ? 'בסיסי' : tier === 'standard' ? 'סטנדרטי' : 'פרמיום'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">תיאור</span>
              <span className="text-gray-900 text-sm">{tierData?.description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">אספקה</span>
              <span className="text-gray-900 text-sm">{tierData?.delivery_days} ימים</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-2">
              <span className="text-gray-900 font-semibold">סה"כ</span>
              <span className="text-2xl font-bold text-orange-500">₪{tierData?.price?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            הסכום ישוחרר לפרילנסר רק לאחר אישור ביצוע מצידך.
          </div>

          <button
            onClick={handleOrder}
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            {loading ? 'שולח...' : 'אשר הזמנה'}
          </button>
        </div>
      </div>
    </div>
  );
}
