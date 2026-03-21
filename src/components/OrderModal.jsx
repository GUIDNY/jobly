import { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';

export default function OrderModal({ bot, tier, onClose }) {
  const [step, setStep] = useState('confirm'); // confirm | success
  const tierData = bot[`pricing_${tier}`];

  const handleOrder = () => {
    // In a real app, would create an Order entity and process payment
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
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
      <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">אישור הזמנה</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
            <img src={bot.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{bot.name}</p>
              <p className="text-xs text-gray-500">{bot.role}</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">חבילה</span>
              <span className="text-gray-900 font-medium text-sm capitalize">
                {tier === 'basic' ? 'בסיסי' : tier === 'standard' ? 'סטנדרטי' : 'פרמיום'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">תיאור</span>
              <span className="text-gray-900 text-sm">{tierData?.description}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">אספקה</span>
              <span className="text-gray-900 text-sm">{tierData?.delivery_days} ימים</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-2">
              <span className="text-gray-900 font-semibold">סה"כ</span>
              <span className="text-2xl font-bold text-orange-500">₪{tierData?.price?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-400/20 rounded-xl p-4 text-sm text-orange-600">
            <p>ההזמנה תישלח לפרילנסר. הסכום ישוחרר רק לאחר אישור ביצוע.</p>
          </div>

          <button
            onClick={handleOrder}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            אשר הזמנה
          </button>
        </div>
      </div>
    </div>
  );
}
