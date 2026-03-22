import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, EyeOff, Trash2, BarChart2, Edit, Star, ShoppingBag, Lock } from 'lucide-react';
import { getMyBots, updateBot, deleteBot } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

export default function FreelancerView({ user }) {
  const navigate = useNavigate();
  const { updateMe } = useAuth();
  const [activeTab, setActiveTab] = useState('bots');
  const [myBots, setMyBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getMyBots(user.id)
      .then(data => setMyBots(data.filter(b => b.bot_type === 'freelancer')))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const isPro = user.role === 'pro';
  const botLimit = isPro ? 3 : 1;
  const canCreate = myBots.length < botLimit;

  const handleTogglePublish = async (bot) => {
    await updateBot(bot.id, { is_published: !bot.is_published });
    setMyBots(prev => prev.map(b => b.id === bot.id ? { ...b, is_published: !b.is_published } : b));
  };

  const handleDelete = async (botId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הסוכן?')) {
      await deleteBot(botId);
      setMyBots(prev => prev.filter(b => b.id !== botId));
    }
  };

  return (
    <div>
      {/* Profile Hero */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <img
            src={user.avatar_url || `https://i.pravatar.cc/80?u=${user.email}`}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-400/30"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
          <p className="text-orange-500 text-sm">{user.headline || 'פרילנסר'}</p>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{user.bio}</p>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          {!isPro && (
            <button
              onClick={() => navigate('/ProUpgrade')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              שדרג ל-Pro
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6">
        {['bots', 'portfolio'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t === 'bots' ? 'הסוכנים שלי' : 'תיק עבודות'}
            {t === 'portfolio' && !isPro && <Lock size={12} className="inline mr-1 opacity-60" />}
          </button>
        ))}
        {isPro && (
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'crm' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            CRM
          </button>
        )}
      </div>

      {activeTab === 'bots' && (
        <div>
          {/* Bot limit info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">
              {myBots.length} / {botLimit} סוכנים
              {!isPro && <span className="text-gray-600"> (שדרג ל-Pro לקבל עד 3)</span>}
            </p>
            <button
              onClick={() => canCreate ? navigate('/CreateBot?type=freelancer') : navigate('/ProUpgrade')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                canCreate
                  ? 'bg-orange-500 hover:bg-orange-400 text-gray-900'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {canCreate ? <Plus size={16} /> : <Lock size={16} />}
              {canCreate ? 'צור סוכן חדש' : 'הגעת למגבלה'}
            </button>
          </div>

          {myBots.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">אין לך סוכנים עדיין</h3>
              <p className="text-gray-500 text-sm mb-6">צור את הסוכן הראשון שלך ותתחיל לקבל לקוחות</p>
              <button
                onClick={() => navigate('/CreateBot?type=freelancer')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-medium text-sm transition-colors"
              >
                צור סוכן ראשון
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBots.map(bot => (
                <div key={bot.id} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-200">
                    {bot.banner_url ? (
                      <img src={bot.banner_url} alt="" className="w-full h-full object-cover" />
                    ) : bot.avatar_url ? (
                      <img src={bot.avatar_url} alt="" className="w-full h-full object-cover blur-sm scale-110" />
                    ) : <div className="w-full h-full bg-gradient-to-br from-orange-50 to-purple-900/30" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900" />
                    <img
                      src={bot.avatar_url || `https://i.pravatar.cc/60?u=${bot.id}`}
                      alt=""
                      className="absolute bottom-2 right-3 w-10 h-10 rounded-xl ring-2 ring-white object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      bot.is_published ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {bot.is_published ? 'מפורסם' : 'טיוטה'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{bot.name}</h3>
                    <p className="text-xs text-orange-500 mb-3">{bot.role}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" />{bot.rating?.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><ShoppingBag size={11} />{bot.total_orders}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/EditBot?id=${bot.id}`)}
                        className="flex-1 py-2 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit size={12} />
                        ערוך
                      </button>
                      <button
                        onClick={() => handleTogglePublish(bot)}
                        className={`p-2 rounded-lg border transition-colors ${
                          bot.is_published
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                        title={bot.is_published ? 'הסתר' : 'פרסם'}
                      >
                        {bot.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(bot.id)}
                        className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && !isPro && (
        <div className="text-center py-16 bg-gray-50/50 border border-gray-100 rounded-2xl">
          <Lock size={40} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-gray-900 font-semibold text-lg mb-2">תיק עבודות זמין ל-Pro</h3>
          <p className="text-gray-500 text-sm mb-6">שדרג לחשבון Pro לנהל תיק עבודות מרכזי</p>
          <button onClick={() => navigate('/ProUpgrade')} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-xl text-sm font-medium">
            שדרג ל-Pro
          </button>
        </div>
      )}

      {activeTab === 'crm' && isPro && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <BarChart2 size={40} className="mx-auto mb-4 text-orange-500" />
          <h3 className="text-gray-900 font-semibold text-lg mb-2">CRM Dashboard</h3>
          <p className="text-gray-500 text-sm">נתוני ביצועים, שיחות והזמנות</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[['שיחות', '127'], ['הזמנות', '23'], ['הכנסה', '₪45,000']].map(([label, val]) => (
              <div key={label} className="bg-gray-100 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
