import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getMyOrders } from '../lib/api';
import { ShoppingBag, Star, Check, Clock, XCircle, AlertCircle } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'ממתין', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: <Clock size={12} /> },
  in_progress: { label: 'בביצוע', color: 'text-orange-500 bg-orange-300/10 border-blue-400/30', icon: <AlertCircle size={12} /> },
  completed: { label: 'הושלם', color: 'text-green-400 bg-green-400/10 border-green-400/30', icon: <Check size={12} /> },
  cancelled: { label: 'בוטל', color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: <XCircle size={12} /> },
};

const TIER_LABELS = { basic: 'בסיסי', standard: 'סטנדרטי', premium: 'פרמיום' };

export default function OrdersManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getMyOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) {
    return (
      <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">עליך להתחבר כדי לצפות בהזמנות</p>
        <button onClick={() => navigate('/MyDashboard')} className="px-6 py-3 bg-orange-500 text-gray-900 rounded-xl text-sm">התחבר</button>
      </div>
    );
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול הזמנות</h1>
      <p className="text-gray-500 mb-8">כל ההזמנות שלך במקום אחד</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', 'הכל'], ['pending', 'ממתין'], ['in_progress', 'בביצוע'], ['completed', 'הושלם'], ['cancelled', 'בוטל']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === val ? 'bg-orange-500 text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/30 rounded-2xl">
          <ShoppingBag size={40} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-500">אין הזמנות</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const status = STATUS_MAP[order.status];
            return (
              <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{order.bots?.name || '—'}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    חבילה: {TIER_LABELS[order.tier] || order.tier} | תאריך: {order.created_at ? new Date(order.created_at).toLocaleDateString('he-IL') : '—'}
                  </p>
                  {order.status === 'completed' && order.rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < order.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                      ))}
                      <span className="text-xs text-gray-500 mr-1">{order.review}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-gray-900">₪{order.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {order.client_email === user.email ? 'שילמת' : 'קיבלת'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
