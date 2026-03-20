import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useBots } from '../lib/useBots';
import { updateBot, deleteBot } from '../lib/botsStore';
import { Trash2, Eye, EyeOff, Star, ShoppingBag, Users, Bot, Shield } from 'lucide-react';
import { mockUser } from '../lib/mockData';

const MOCK_USERS = [
  mockUser,
  { id: 'u2', email: 'uri@example.com', full_name: 'אורי כהן', role: 'pro', avatar_url: 'https://i.pravatar.cc/40?img=11' },
  { id: 'u3', email: 'maya@example.com', full_name: 'מאיה ברק', role: 'user', avatar_url: 'https://i.pravatar.cc/40?img=5' },
];

export default function ExpertsEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allBots = useBots();
  const [activeTab, setActiveTab] = useState('bots');
  const [mockUsers, setMockUsers] = useState(MOCK_USERS);

  if (!user || user.role !== 'admin') {
    return (
      <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
        <Shield size={40} className="mx-auto mb-4 text-red-400" />
        <p className="text-gray-500">גישה מוגבלת לאדמין בלבד</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-orange-500 text-gray-900 rounded-xl text-sm">חזור לדף הבית</button>
      </div>
    );
  }

  const handleToggleBot = (id, val) => updateBot(id, { is_published: val });
  const handleDeleteBot = (id) => {
    if (confirm('מחק?')) deleteBot(id);
  };

  const toggleUserPro = (userId) => {
    setMockUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: u.role === 'pro' ? 'user' : 'pro' } : u
    ));
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול Admin</h1>
          <p className="text-gray-500 text-sm">ניהול בוטים ומשתמשים</p>
        </div>
      </div>

      <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('bots')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bots' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Bot size={15} />
          בוטים ({allBots.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Users size={15} />
          משתמשים ({mockUsers.length})
        </button>
      </div>

      {activeTab === 'bots' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-right">
                <th className="pb-3 text-gray-500 text-sm font-medium">סוכן</th>
                <th className="pb-3 text-gray-500 text-sm font-medium">סוג</th>
                <th className="pb-3 text-gray-500 text-sm font-medium">בעלים</th>
                <th className="pb-3 text-gray-500 text-sm font-medium">דירוג</th>
                <th className="pb-3 text-gray-500 text-sm font-medium">סטטוס</th>
                <th className="pb-3 text-gray-500 text-sm font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {allBots.map(bot => (
                <tr key={bot.id} className="border-b border-gray-100 hover:bg-white/2 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={bot.avatar_url || `https://i.pravatar.cc/40?u=${bot.id}`} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <span className="text-gray-900 text-sm font-medium">{bot.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{bot.bot_type === 'freelancer' ? 'פרילנסר' : 'מעסיק'}</td>
                  <td className="py-3 text-sm text-gray-500">{bot.owner_email}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={12} className="text-yellow-400" />
                      <span className="text-gray-900">{bot.rating?.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${bot.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-200 text-gray-500'}`}>
                      {bot.is_published ? 'מפורסם' : 'מוסתר'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBot(bot.id, !bot.is_published)}
                        className={`p-1.5 rounded-lg border transition-colors ${bot.is_published ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'}`}
                      >
                        {bot.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => navigate(`/EditBot?id=${bot.id}`)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors text-xs px-2">
                        ערוך
                      </button>
                      <button onClick={() => handleDeleteBot(bot.id)} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-3">
          {mockUsers.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <img src={u.avatar_url || `https://i.pravatar.cc/48?u=${u.email}`} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{u.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                  u.role === 'pro' ? 'bg-orange-400/20 text-orange-500' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {u.role}
                </span>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => toggleUserPro(u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      u.role === 'pro'
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'border-orange-400/40 text-orange-500 hover:bg-orange-400/10'
                    }`}
                  >
                    {u.role === 'pro' ? 'הסר Pro' : 'הענק Pro'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
