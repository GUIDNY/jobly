import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getAllBots, getAllOrders, getAllProfiles } from '../lib/api';
import {
  Shield, Users, Briefcase, ShoppingBag, Star, TrendingUp,
  Eye, EyeOff, Trash2, CheckCircle, XCircle, BarChart2,
  Bot, Building2, AlertTriangle
} from 'lucide-react';

function StatCard({ icon, label, value, sub, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

const TABS = ['סקירה כללית', 'בוטים', 'הזמנות', 'משתמשים'];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [bots, setBots] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (!user?.is_admin) return;
    getAllBots().then(setBots).catch(() => {});
    getAllOrders().then(setOrders).catch(() => {});
    getAllProfiles().then(setProfiles).catch(() => {});
  }, [user?.is_admin]);

  if (!user || !user.is_admin) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">אין הרשאה</h1>
        <p className="text-gray-500 mb-6">הדף הזה מוגבל למנהלי מערכת בלבד.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-500 text-gray-900 rounded-xl font-semibold text-sm"
        >
          חזור לדף הבית
        </button>
      </div>
    );
  }

  const freelancerBots = bots.filter(b => b.bot_type === 'freelancer');
  const employerBots = bots.filter(b => b.bot_type === 'employer');
  const publishedBots = bots.filter(b => b.is_published);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);

  const togglePublish = (id) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, is_published: !b.is_published } : b));
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לוח אדמין</h1>
          <p className="text-gray-500 text-sm">ניהול מערכת Jobly</p>
        </div>
        <div className="mr-auto px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          Admin Only
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Bot size={18} />} label="סה״כ בוטים" value={bots.length} sub={`${publishedBots.length} פעילים`} color="orange" />
            <StatCard icon={<ShoppingBag size={18} />} label="הזמנות" value={mockOrders.length} sub={`${mockOrders.filter(o=>o.status==='completed').length} הושלמו`} color="green" />
            <StatCard icon={<TrendingUp size={18} />} label="הכנסות" value={`₪${totalRevenue.toLocaleString()}`} color="blue" />
            <StatCard icon={<Star size={18} />} label="דירוג ממוצע" value="4.8" sub="מכל הבוטים" color="purple" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bot size={16} className="text-orange-500" /> פרילנסרים vs מעסיקים
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">פרילנסרים</span>
                    <span className="font-medium">{freelancerBots.length}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-orange-400 rounded-full" style={{ width: `${(freelancerBots.length / bots.length) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">מעסיקים</span>
                    <span className="font-medium">{employerBots.length}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${(employerBots.length / bots.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-orange-500" /> הזמנות אחרונות
              </h3>
              <div className="space-y-3">
                {mockOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{o.bot_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₪{o.price}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {o.status === 'completed' ? 'הושלם' : 'בתהליך'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bots */}
      {tab === 1 && (
        <div className="space-y-3">
          {bots.map(bot => (
            <div key={bot.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <img src={bot.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{bot.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full ${
                    bot.bot_type === 'freelancer' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {bot.bot_type === 'freelancer' ? 'פרילנסר' : 'מעסיק'}
                  </span>
                  <span>{bot.category}</span>
                  {bot.rating && <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-500" />{bot.rating}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  bot.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {bot.is_published ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {bot.is_published ? 'פעיל' : 'מושהה'}
                </span>
                <button
                  onClick={() => togglePublish(bot.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={bot.is_published ? 'השהה' : 'פרסם'}
                >
                  {bot.is_published ? <EyeOff size={15} className="text-gray-500" /> : <Eye size={15} className="text-orange-500" />}
                </button>
                <button
                  onClick={() => navigate(`/BotProfile?id=${bot.id}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye size={15} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {tab === 2 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">בוט</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">לקוח</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">סכום</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">תאריך</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{o.bot_name}</td>
                  <td className="px-4 py-3 text-gray-500">{o.client_email}</td>
                  <td className="px-4 py-3 text-gray-900">₪{o.price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.status === 'completed' ? 'הושלם' : 'בתהליך'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{o.created_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users */}
      {tab === 3 && (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <img src={mockUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{mockUser.full_name}</div>
              <div className="text-xs text-gray-500">{mockUser.email}</div>
            </div>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1">
              <Shield size={10} /> Admin
            </span>
          </div>
          <div className="text-center py-10 text-gray-400 text-sm">
            משתמשים נוספים יופיעו כאן לאחר חיבור לבסיס נתונים אמיתי
          </div>
        </div>
      )}
    </div>
  );
}
