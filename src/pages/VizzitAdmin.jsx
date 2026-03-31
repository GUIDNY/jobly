import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import LogoMark from '../components/LogoMark';

function StatCard({ label, value, sub, color }) {
  const bg = { teal: '#5BC4C8', coral: '#F4938C', purple: '#a78bfa', gold: '#fbbf24' };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: (bg[color] || bg.teal) + '22' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: bg[color] || bg.teal }} />
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

const TABS = ['סקירה', 'משתמשים', 'כרטיסים'];

export default function VizzitAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: profs }, { data: cds }] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, plan, plan_expires_at, is_admin, created_at').order('created_at', { ascending: false }),
      supabase.from('cards').select('id, user_id, business_name, card_style, is_published, views_count, created_at, slug').order('created_at', { ascending: false }),
    ]);
    setProfiles(profs || []);
    setCards(cds || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.is_admin) loadData();
  }, [user?.is_admin, loadData]);

  const togglePro = async (profile) => {
    const nowPro = profile.plan === 'pro' &&
      (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());
    const newPlan = nowPro ? 'free' : 'pro';
    setTogglingId(profile.id);
    await supabase.from('profiles').update({ plan: newPlan, plan_expires_at: null }).eq('id', profile.id);
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, plan: newPlan, plan_expires_at: null } : p));
    setTogglingId(null);
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" dir="rtl"
        style={{ background: '#070910' }}>
        <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          <LogoMark size={32} color="white" />
        </div>
        <h1 className="text-xl font-black text-white mb-2">אין הרשאה</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>דף זה מוגבל למנהלים בלבד.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
          חזור לדף הבית
        </button>
      </div>
    );
  }

  const proUsers = profiles.filter(p =>
    p.plan === 'pro' && (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date())
  );
  const freeUsers = profiles.filter(p => !proUsers.find(u => u.id === p.id));
  const publishedCards = cards.filter(c => c.is_published);
  const premiumCards = cards.filter(c => c.card_style === 'premium');
  const totalViews = cards.reduce((s, c) => s + (c.views_count || 0), 0);

  const cardsByUser = {};
  cards.forEach(c => { cardsByUser[c.user_id] = (cardsByUser[c.user_id] || 0) + 1; });

  const filteredProfiles = profiles.filter(p =>
    !search || p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

  return (
    <div dir="rtl" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-75 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F4938C, #5BC4C8)' }}>
            <LogoMark size={18} color="white" />
          </div>
          <div className="text-right">
            <h1 className="font-black text-gray-900 text-lg leading-tight">Vizzit Admin</h1>
            <p className="text-xs text-gray-400">לוח ניהול</p>
          </div>
        </button>
        {loading && <div className="mr-auto flex gap-1">{[0,1,2].map(i =>
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: '#5BC4C8', animationDelay: `${i*0.15}s` }} />
        )}</div>}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-8 w-fit shadow-sm">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === i
                ? { background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', color: 'white' }
                : { color: '#9ca3af' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 0 && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="משתמשים רשומים" value={profiles.length} sub={`${proUsers.length} Pro`} color="teal" />
              <StatCard label="משתמשי Pro" value={proUsers.length}
                sub={profiles.length ? `${Math.round(proUsers.length/profiles.length*100)}% מסה״כ` : '0%'} color="gold" />
              <StatCard label="כרטיסים פעילים" value={publishedCards.length}
                sub={`${premiumCards.length} פרמיום`} color="purple" />
              <StatCard label="צפיות כרטיסים" value={totalViews.toLocaleString()} sub="סה״כ" color="coral" />
            </div>

            {/* Pro vs Free breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">Pro לעומת Free</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Pro', count: proUsers.length, color: '#fbbf24' },
                    { label: 'Free', count: freeUsers.length, color: '#5BC4C8' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{row.label}</span>
                        <span className="font-semibold">{row.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 rounded-full transition-all"
                          style={{ width: profiles.length ? `${(row.count/profiles.length)*100}%` : '0%', background: row.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">משתמשים אחרונים</h3>
                <div className="space-y-2.5">
                  {profiles.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 truncate">{p.full_name || p.email}</p>
                        <p className="text-xs text-gray-400 truncate">{p.email}</p>
                      </div>
                      <span className="flex-shrink-0 mr-3 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={p.plan === 'pro'
                          ? { background: '#fef3c7', color: '#92400e' }
                          : { background: '#f1f5f9', color: '#64748b' }}>
                        {p.plan === 'pro' ? 'Pro ✦' : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 1 && (
          <div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם / אימייל..."
              className="w-full mb-4 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
            />
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">משתמש</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">הצטרף</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">כרטיסים</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">תוכנית</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProfiles.map(p => {
                    const isPro = p.plan === 'pro' && (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date());
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.full_name || '—'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.email}</p>
                          {p.is_admin && (
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">Admin</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{fmt(p.created_at)}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{cardsByUser[p.id] || 0}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold"
                            style={isPro
                              ? { background: '#fef3c7', color: '#92400e' }
                              : { background: '#f1f5f9', color: '#64748b' }}>
                            {isPro ? 'Pro ✦' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <button
                            disabled={togglingId === p.id}
                            onClick={() => togglePro(p)}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                            style={isPro
                              ? { background: '#fee2e2', color: '#b91c1c' }
                              : { background: 'linear-gradient(135deg, #F4938C, #5BC4C8)', color: 'white' }}>
                            {togglingId === p.id ? '...' : isPro ? 'הסר Pro' : 'הפעל Pro'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProfiles.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">אין תוצאות</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cards */}
        {tab === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">שם עסק</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">נוצר</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">סגנון</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">צפיות</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cards.map(c => {
                  const owner = profiles.find(p => p.id === c.user_id);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-[160px]">{c.business_name || '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{owner?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{fmt(c.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={c.card_style === 'premium'
                            ? { background: 'rgba(124,92,224,0.12)', color: '#7c5ce0' }
                            : { background: '#f1f5f9', color: '#64748b' }}>
                          {c.card_style === 'premium' ? '✦ פרמיום' : 'קלאסי'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{(c.views_count || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={c.is_published
                            ? { background: '#dcfce7', color: '#166534' }
                            : { background: '#f1f5f9', color: '#64748b' }}>
                          {c.is_published ? 'פורסם' : 'טיוטה'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {cards.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">אין כרטיסים עדיין</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
