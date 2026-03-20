import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useBots } from '../lib/useBots';
import { Edit, User, Briefcase, Users } from 'lucide-react';
import BotCard from '../components/BotCard';

export default function UserProfile() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const allBots = useBots();
  const navigate = useNavigate();
  const email = params.get('email');

  // Simulate fetching user by email — in a real app would call getUserPublicInfo
  const profileUser = email === user?.email ? user : {
    full_name: 'פרילנסר לדוגמה',
    headline: 'Full Stack Developer',
    bio: 'מפתח עם ניסיון רב בבניית מוצרים דיגיטליים',
    avatar_url: `https://i.pravatar.cc/150?u=${email}`,
    banner_url: null,
    email,
  };

  const userBots = allBots.filter(b => b.owner_email === email && b.is_published);
  const freelancerBots = userBots.filter(b => b.bot_type === 'freelancer');
  const employerBots = userBots.filter(b => b.bot_type === 'employer');
  const isOwnProfile = user?.email === email;

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative h-40 md:h-56 rounded-2xl overflow-hidden mb-16 bg-gradient-to-br from-orange-100 to-purple-900/60">
        {profileUser.banner_url && (
          <img src={profileUser.banner_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80" />
        {/* Avatar */}
        <div className="absolute bottom-0 translate-y-1/2 right-6">
          <div className="relative">
            <img
              src={profileUser.avatar_url || `https://i.pravatar.cc/120?u=${email}`}
              alt=""
              className="w-24 h-24 rounded-2xl ring-4 ring-white object-cover"
            />
          </div>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/MyDashboard')}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 border border-gray-200 rounded-lg text-xs text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Edit size={12} />
            ערוך פרופיל
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileUser.full_name}</h1>
        <p className="text-orange-500 mb-3">{profileUser.headline}</p>
        {profileUser.bio && <p className="text-gray-500 text-sm max-w-xl">{profileUser.bio}</p>}
      </div>

      {/* Bots */}
      {freelancerBots.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-orange-500" />
            שירותים ({freelancerBots.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancerBots.map(bot => <BotCard key={bot.id} bot={bot} />)}
          </div>
        </section>
      )}

      {employerBots.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-orange-500" />
            משרות פתוחות ({employerBots.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employerBots.map(bot => <BotCard key={bot.id} bot={bot} />)}
          </div>
        </section>
      )}

      {userBots.length === 0 && (
        <div className="text-center py-16 bg-gray-50/30 rounded-2xl">
          <User size={40} className="mx-auto mb-3 text-gray-500" />
          <p className="text-gray-500">אין סוכנים מפורסמים עדיין</p>
        </div>
      )}
    </div>
  );
}
