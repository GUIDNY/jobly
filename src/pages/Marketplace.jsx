import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import BotCard from '../components/BotCard';
import { useBots } from '../lib/useBots';
import { CATEGORIES } from '../lib/mockData';

const SORT_OPTIONS = [
  { value: 'rating', label: 'דירוג' },
  { value: 'price_asc', label: 'מחיר עולה' },
  { value: 'price_desc', label: 'מחיר יורד' },
  { value: 'popular', label: 'פופולרי' },
  { value: 'new', label: 'חדש' },
];

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'freelancer';
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const [sort, setSort] = useState('rating');
  const [searchInput, setSearchInput] = useState(q);

  const { bots: allBots, loading } = useBots({ botType: tab, category: category || undefined, search: q || undefined });

  const setTab = (t) => {
    const p = new URLSearchParams(params);
    p.set('tab', t);
    setParams(p);
  };
  const setCategory = (c) => {
    const p = new URLSearchParams(params);
    if (c) p.set('category', c); else p.delete('category');
    setParams(p);
  };
  const setQ = (v) => {
    const p = new URLSearchParams(params);
    if (v) p.set('q', v); else p.delete('q');
    setParams(p);
  };

  const filteredBots = useMemo(() => {
    let bots = [...allBots];
    switch (sort) {
      case 'rating': bots = [...bots].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price_asc': bots = [...bots].sort((a, b) => (a.pricing_basic?.price || 0) - (b.pricing_basic?.price || 0)); break;
      case 'price_desc': bots = [...bots].sort((a, b) => (b.pricing_basic?.price || 0) - (a.pricing_basic?.price || 0)); break;
      case 'popular': bots = [...bots].sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0)); break;
      case 'new': bots = [...bots].reverse(); break;
    }
    return bots;
  }, [allBots, tab, category, q, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQ(searchInput);
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {tab === 'freelancer' ? 'שוק הפרילנסרים' : 'משרות פתוחות'}
        </h1>
        <p className="text-gray-500">
          {tab === 'freelancer'
            ? 'מצא את הפרילנסר המושלם עבור הפרויקט שלך'
            : 'גלה הזדמנויות תעסוקה מרתקות'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6">
        {['freelancer', 'employer'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? t === 'freelancer' ? 'bg-orange-500 text-gray-900' : 'bg-orange-500 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t === 'freelancer' ? 'פרילנסרים' : 'משרות'}
          </button>
        ))}
      </div>

      {/* Search + Filters Row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="חיפוש..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setQ(''); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl text-sm transition-colors">
            חפש
          </button>
        </form>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400/50 transition-colors"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">קטגוריות</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCategory('')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-right ${
                  !category ? 'bg-orange-100 text-orange-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                הכל
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-right ${
                    category === cat.id ? 'bg-orange-100 text-orange-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Active filters */}
          {(category || q) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 border border-orange-400/40 rounded-full text-xs text-orange-600">
                  {CATEGORIES.find(c => c.id === category)?.label}
                  <button onClick={() => setCategory('')}><X size={12} /></button>
                </span>
              )}
              {q && (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 border border-orange-400/40 rounded-full text-xs text-orange-600">
                  "{q}"
                  <button onClick={() => { setQ(''); setSearchInput(''); }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          <p className="text-gray-500 text-sm mb-4">{filteredBots.length} תוצאות</p>

          {filteredBots.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">לא נמצאו תוצאות</p>
              <p className="text-gray-600 text-sm">נסה לשנות את פרמטרי החיפוש</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBots.map(bot => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
