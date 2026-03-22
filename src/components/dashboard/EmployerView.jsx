import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, EyeOff, Trash2, Send, Bot, ChevronLeft } from 'lucide-react';
import { getMyBots, getBots, updateBot, deleteBot } from '../../lib/api';

export default function EmployerView({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'שלום! אני סוכן החיפוש של Jobly. תאר לי את הפרויקט שלך ואמצא עבורך את הפרילנסרים המתאימים ביותר.' }
  ]);
  const [suggestedBots, setSuggestedBots] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    getMyBots(user.id).then(data => setMyJobs(data.filter(b => b.bot_type === 'employer')));
    getBots({ botType: 'freelancer' }).then(data => setTopFreelancers(data.slice(0, 3)));
  }, [user?.id]);

  const sendAiMessage = async () => {
    if (!inputMsg.trim() || typing) return;
    const newMessages = [...aiMessages, { role: 'user', content: inputMsg }];
    setAiMessages(newMessages);
    setInputMsg('');
    setTyping(true);
    try {
      const systemBot = {
        name: 'סוכן חיפוש Jobly',
        role: 'עוזר חיפוש פרילנסרים',
        bot_type: 'freelancer',
        instructions: `אתה סוכן חיפוש חכם של פלטפורמת Jobly.
עזור למעסיקים למצוא פרילנסרים מתאימים.
שאל על סוג הפרויקט, תקציב, ציר זמן וכישורים נדרשים.
ענה בעברית, בצורה ידידותית ומקצועית.
לאחר שאספת מידע, הסבר אילו סוגי פרילנסרים מתאימים.`,
      };
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, bot: systemBot }),
      });
      const data = await res.json();
      const reply = data.reply || 'מצטער, לא הצלחתי להגיב. נסה שוב.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (newMessages.filter(m => m.role === 'user').length >= 2) {
        setSuggestedBots(topFreelancers);
      }
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'שגיאה בחיבור. נסה שוב.' }]);
    } finally {
      setTyping(false);
    }
  };

  const handleToggleJob = async (bot) => {
    await updateBot(bot.id, { is_published: !bot.is_published });
    setMyJobs(prev => prev.map(b => b.id === bot.id ? { ...b, is_published: !b.is_published } : b));
  };
  const handleDeleteJob = async (id) => {
    if (confirm('מחק את המשרה?')) {
      await deleteBot(id);
      setMyJobs(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div>
      {/* Profile Hero */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <img src={user.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-400/30 shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
          <p className="text-orange-500 text-sm">{user.headline || 'מעסיק'}</p>
          <p className="text-gray-500 text-sm mt-1 line-clamp-1">{user.bio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          חיפוש פרילנסר
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'jobs' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          משרות שפרסמתי
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Chat */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Bot size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">סוכן חיפוש AI</p>
                <p className="text-xs text-green-400">מחובר</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-orange-500 text-gray-900 rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-end">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(d => (
                        <span key={d} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d*150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                placeholder="תאר את הפרויקט שלך..."
                className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors"
              />
              <button
                onClick={sendAiMessage}
                disabled={!inputMsg.trim() || typing}
                className="p-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 rounded-xl text-gray-900 transition-colors"
              >
                <Send size={16} className="rtl-flip" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">
              {suggestedBots.length > 0 ? `המלצות AI (${suggestedBots.length})` : 'הפרילנסרים המובילים'}
            </h3>
            <div className="flex flex-col gap-3">
              {(suggestedBots.length > 0 ? suggestedBots : topFreelancers).map(bot => (
                <div
                  key={bot.id}
                  onClick={() => navigate(`/BotProfile?id=${bot.id}`)}
                  className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-orange-400/50 cursor-pointer transition-all"
                >
                  <img src={bot.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{bot.name}</p>
                    <p className="text-xs text-orange-500">{bot.role}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{bot.description}</p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-500 rtl-flip shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">{myJobs.length} משרות</p>
            <button
              onClick={() => navigate('/CreateBot?type=employer')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              פרסם משרה
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">אין לך משרות עדיין</h3>
              <p className="text-gray-500 text-sm mb-6">פרסם משרה עם בוט מראיין AI</p>
              <button
                onClick={() => navigate('/CreateBot?type=employer')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-medium text-sm transition-colors"
              >
                פרסם משרה ראשונה
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myJobs.map(bot => (
                <div key={bot.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={bot.avatar_url || `https://i.pravatar.cc/48?u=${bot.id}`} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{bot.company_name}</p>
                      <p className="text-xs text-orange-500">{bot.job_title}</p>
                    </div>
                  </div>
                  <div className={`inline-flex px-2 py-0.5 rounded-full text-xs mb-3 ${
                    bot.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {bot.is_published ? 'פעיל' : 'מוסתר'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/EditBot?id=${bot.id}`)}
                      className="flex-1 py-2 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs transition-colors"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => handleToggleJob(bot)}
                      className={`p-2 rounded-lg border transition-colors ${bot.is_published ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'}`}
                    >
                      {bot.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => handleDeleteJob(bot.id)} className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
