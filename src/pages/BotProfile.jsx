import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, MessageCircle, MapPin, Briefcase, ChevronLeft, User, Image } from 'lucide-react';
import { getBotById } from '../lib/api';
import ChatModal from '../components/ChatModal';
import OrderModal from '../components/OrderModal';

export default function BotProfile() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get('id');

  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');
  const [showChat, setShowChat] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [selectedTier, setSelectedTier] = useState('basic');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBotById(id)
      .then(setBot)
      .catch(() => setBot(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">טוען...</div>;
  }

  if (!bot) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-xl mb-4">הסוכן לא נמצא</p>
        <button onClick={() => navigate('/Marketplace')} className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl transition-colors text-sm">
          חזור לשוק
        </button>
      </div>
    );
  }

  const isFreelancer = bot.bot_type === 'freelancer';
  const tiers = isFreelancer ? [
    { key: 'basic', label: 'בסיסי', data: bot.pricing_basic },
    { key: 'standard', label: 'סטנדרטי', data: bot.pricing_standard },
    { key: 'premium', label: 'פרמיום', data: bot.pricing_premium },
  ].filter(t => t.data) : [];

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-10">
      {showChat && <ChatModal bot={bot} onClose={() => setShowChat(false)} />}
      {showOrder && <OrderModal bot={bot} tier={selectedTier} onClose={() => setShowOrder(false)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/Marketplace" className="hover:text-gray-900 transition-colors">שוק</Link>
        <ChevronLeft size={14} className="rtl-flip" />
        <span className="text-gray-900">{bot.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-6">
            {/* Banner */}
            {bot.banner_url ? (
              <img src={bot.banner_url} alt="" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-orange-100 via-orange-50 to-purple-100" />
            )}
            <div className="p-6 flex items-start gap-5">
              <img
                src={bot.avatar_url || `https://i.pravatar.cc/100?u=${bot.id}`}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md shrink-0 -mt-10"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{bot.name}</h1>
                <p className="text-orange-500 mb-2">{bot.role}</p>
                {isFreelancer && (
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-900 font-semibold">{bot.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag size={14} />
                      <span>{bot.total_orders} הזמנות</span>
                    </div>
                  </div>
                )}
                {!isFreelancer && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {bot.location && <div className="flex items-center gap-1"><MapPin size={14} /><span>{bot.location}</span></div>}
                    {bot.job_type && <div className="flex items-center gap-1"><Briefcase size={14} /><span>{bot.job_type === 'fulltime' ? 'משרה מלאה' : 'חלקית'}</span></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6">
            <button
              onClick={() => setTab('about')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'about' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              אודות
            </button>
            {isFreelancer && (
              <button
                onClick={() => setTab('portfolio')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'portfolio' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                תיק עבודות
              </button>
            )}
          </div>

          {tab === 'about' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {isFreelancer ? 'אודות הפרילנסר' : 'תיאור המשרה'}
                </h2>
                <p className="text-gray-600 leading-relaxed">{bot.description || bot.job_description}</p>
              </div>

              {(bot.skills || []).length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">כישורים</h2>
                  <div className="flex flex-wrap gap-2">
                    {bot.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-orange-100 border border-orange-400/40 text-orange-600 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {!isFreelancer && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">פרטי המשרה</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {bot.salary_range && <div><p className="text-gray-500 text-xs mb-1">שכר</p><p className="text-gray-900 font-semibold">{bot.salary_range}</p></div>}
                    {bot.job_type && <div><p className="text-gray-500 text-xs mb-1">סוג משרה</p><p className="text-gray-900 font-semibold">{bot.job_type === 'fulltime' ? 'משרה מלאה' : 'חלקית'}</p></div>}
                    {bot.location && <div><p className="text-gray-500 text-xs mb-1">מיקום</p><p className="text-gray-900 font-semibold">{bot.location}</p></div>}
                    {bot.company_name && <div><p className="text-gray-500 text-xs mb-1">חברה</p><p className="text-gray-900 font-semibold">{bot.company_name}</p></div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {(bot.portfolio || []).length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Image size={40} className="mx-auto mb-3 opacity-30" />
                  <p>אין פרויקטים עדיין</p>
                </div>
              ) : (bot.portfolio || []).map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  {item.image_url && <img src={item.image_url} alt="" className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            {isFreelancer ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">בחר חבילה</h3>
                <div className="flex flex-col gap-2 mb-5">
                  {tiers.map(tier => (
                    <button
                      key={tier.key}
                      onClick={() => setSelectedTier(tier.key)}
                      className={`p-3 rounded-xl border text-right transition-all ${selectedTier === tier.key ? 'border-orange-400 bg-orange-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{tier.label}</span>
                        <span className="text-orange-500 font-bold">₪{tier.data.price?.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{tier.data.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">אספקה: {tier.data.delivery_days} ימים</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowOrder(true)} className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors mb-3">
                  הזמן עכשיו
                </button>
                <button onClick={() => setShowChat(true)} className="w-full py-3 border border-orange-400/50 text-orange-500 hover:bg-orange-50 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} />שוחח עם הסוכן
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">מעוניין/ת במשרה?</h3>
                <p className="text-sm text-gray-500 mb-5">שוחח עם הבוט המראיין של {bot.company_name}</p>
                <button onClick={() => setShowChat(true)} className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} />שוחח עם הסוכן
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-white/95 border-t border-gray-200 z-40">
        <div className="flex gap-3">
          {isFreelancer && (
            <button onClick={() => setShowOrder(true)} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors">
              הזמן עכשיו
            </button>
          )}
          <button onClick={() => setShowChat(true)} className="flex-1 py-3 border border-orange-400/50 text-orange-500 hover:bg-orange-50 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={16} />שוחח עם הסוכן
          </button>
        </div>
      </div>
    </div>
  );
}
