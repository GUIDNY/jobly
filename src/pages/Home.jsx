import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Code2, Palette, Megaphone, PenTool, Video, BarChart2, Cloud, Smartphone, ChevronLeft, Star, Users, Briefcase, Zap, Bot } from 'lucide-react';
import { CATEGORIES } from '../lib/mockData';

const CATEGORY_ICONS = {
  development: <Code2 size={22} />,
  design: <Palette size={22} />,
  marketing: <Megaphone size={22} />,
  content: <PenTool size={22} />,
  video: <Video size={22} />,
  data: <BarChart2 size={22} />,
  devops: <Cloud size={22} />,
  mobile: <Smartphone size={22} />,
};

const HOW_IT_WORKS_FREELANCER = [
  { step: '01', title: 'הירשם ובחר פרילנסר', desc: 'צור חשבון וגלה סוכני AI של פרילנסרים בתחומך' },
  { step: '02', title: 'שוחח עם הסוכן', desc: 'הסוכן ישאל על הצרכים שלך ויציע חבילות מחיר מתאימות' },
  { step: '03', title: 'הזמן שירות', desc: 'בחר חבילה, שלם בצורה מאובטחת וקבל אישור' },
  { step: '04', title: 'קבל את העבודה', desc: 'הפרילנסר מתחיל לעבוד ואתה מקבל תוצאות איכותיות' },
];

const HOW_IT_WORKS_EMPLOYER = [
  { step: '01', title: 'פרסם משרה', desc: 'צור בוט מראיין עם קריטריונים מותאמים אישית' },
  { step: '02', title: 'מועמדים מגיעים', desc: 'הבוט מראיין מועמדים 24/7 ואוסף מידע' },
  { step: '03', title: 'AI מסנן', desc: 'קבל רק את המועמדים המתאימים ביותר' },
  { step: '04', title: 'תאם ראיון אנושי', desc: 'דבר ישירות עם המועמדים המתאימים בוואטסאפ' },
];

const STATS = [
  { icon: <Users size={24} />, value: '2,000+', label: 'פרילנסרים פעילים' },
  { icon: <Star size={24} />, value: '4.8', label: 'דירוג ממוצע' },
  { icon: <Briefcase size={24} />, value: '5,000+', label: 'פרויקטים הושלמו' },
  { icon: <Zap size={24} />, value: '24/7', label: 'זמינות הסוכנים' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('freelancer');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/Marketplace?q=${encodeURIComponent(query)}`);
  };

  return (
    <div dir="rtl">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-50 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-orange-50 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-400/40 rounded-full text-orange-600 text-sm mb-8">
            <Bot size={14} />
            <span>פלטפורמת הפרילנסרים עם AI — הדור הבא</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            חבר בין פרילנסרים
            <br />
            <span className="text-gradient">למעסיקים באמצעות AI</span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            כל פרילנסר מקבל סוכן AI אישי שמייצג אותו. כל מעסיק יכול לפרסם משרה עם בוט מראיין.
            Jobly — המקום שבו כישרון ועסקים נפגשים.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="חפש שירות, כישור או תפקיד..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-12 pl-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/60 text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
            >
              חיפוש
              <ArrowLeft size={16} className="rtl-flip" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>פופולרי:</span>
            {['React Developer', 'UI/UX Designer', 'Full Stack'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/Marketplace?q=${encodeURIComponent(tag)}`)}
                className="text-orange-500 hover:text-orange-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-orange-500 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What suits you */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">מה מתאים לך?</h2>
          <p className="text-gray-500 mb-10">בחר את התפקיד שלך ונחה אותך לאזור הנכון</p>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/MyDashboard')}
              className="group p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 hover:bg-orange-50 transition-all text-right"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500/30 transition-colors">
                <Briefcase size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">אני פרילנסר</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                צור סוכן AI שמייצג אותך, מוכר את השירותים שלך, ומנהל לקוחות עבורך — אפילו כשאתה ישן.
              </p>
              <div className="flex items-center gap-1 text-orange-500 text-sm mt-4 group-hover:gap-2 transition-all">
                <span>התחל עכשיו</span>
                <ChevronLeft size={16} />
              </div>
            </button>

            <button
              onClick={() => navigate('/MyDashboard')}
              className="group p-8 bg-gray-50 border border-gray-200 rounded-2xl hover:border-orange-400/50 hover:bg-purple-950/30 transition-all text-right"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                <Users size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">אני מעסיק</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                פרסם משרה עם בוט מראיין AI, או מצא פרילנסר מתאים בעזרת חיפוש AI מתקדם.
              </p>
              <div className="flex items-center gap-1 text-orange-500 text-sm mt-4 group-hover:gap-2 transition-all">
                <span>מצא כישרון</span>
                <ChevronLeft size={16} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">גלה לפי קטגוריה</h2>
          <p className="text-gray-500 mb-10 text-center">מאות מומחים בכל תחום מחכים לך</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/Marketplace?category=${cat.id}`)}
                className="group p-5 bg-gray-50 border border-gray-200 rounded-xl hover:border-orange-400/50 hover:bg-orange-50/20 transition-all text-right"
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">איך זה עובד?</h2>
          <p className="text-gray-500 mb-10 text-center">תהליך פשוט ב-4 שלבים</p>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('freelancer')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'freelancer' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                לפרילנסרים
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'employer' ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                למעסיקים
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {(activeTab === 'freelancer' ? HOW_IT_WORKS_FREELANCER : HOW_IT_WORKS_EMPLOYER).map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-gradient-to-l from-transparent via-orange-500/30 to-transparent" />
                )}
                <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div className="text-3xl font-black text-blue-500/30 mb-3">{item.step}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-orange-50 to-orange-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">מוכן להתחיל?</h2>
          <p className="text-gray-500 mb-8 text-lg">
            הצטרף לאלפי פרילנסרים ומעסיקים שכבר עובדים חכם יותר עם Jobly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/MyDashboard')}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-base transition-colors"
            >
              הצטרף בחינם
            </button>
            <button
              onClick={() => navigate('/Marketplace')}
              className="px-8 py-4 bg-white/10 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-base transition-colors border border-gray-300"
            >
              גלה את השוק
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
