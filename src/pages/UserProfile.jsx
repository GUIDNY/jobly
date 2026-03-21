import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { getMyBots } from '../lib/api';
import BotCard from '../components/BotCard';
import { Edit, User, Briefcase, Users } from 'lucide-react';

export default function UserProfile() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const emailParam = params.get('email');
  const idParam = params.get('id');

  const [profileUser, setProfileUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // אם זה הפרופיל של המשתמש המחובר
        if (!emailParam && !idParam && currentUser) {
          setProfileUser(currentUser);
          const myBots = await getMyBots(currentUser.id).catch(() => []);
          setBots(myBots.filter(b => b.is_published));
          return;
        }

        if (!idParam && !emailParam) return;

        // חיפוש לפי id / email
        let query = supabase.from('profiles').select('*');
        if (idParam) query = query.eq('id', idParam);
        else query = query.eq('email', emailParam);

        const { data: profile, error } = await query.single();
        if (profile && !error) {
          setProfileUser(profile);
          const userBots = await getMyBots(profile.id).catch(() => []);
          setBots(userBots.filter(b => b.is_published));
        }
      } catch (e) {
        console.warn('UserProfile load error:', e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [emailParam, idParam, currentUser?.id]);

  const isOwnProfile = currentUser && profileUser &&
    (currentUser.id === profileUser.id || currentUser.email === profileUser.email);

  const freelancerBots = bots.filter(b => b.bot_type === 'freelancer');
  const employerBots = bots.filter(b => b.bot_type === 'employer');

  if (loading) {
    return (
      <div dir="rtl" className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-xl mb-4">המשתמש לא נמצא</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 text-gray-900 rounded-xl text-sm">
          חזור לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative h-40 md:h-56 rounded-2xl overflow-hidden mb-16 bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0 bg-gradient-to-t from-white/80" />
        {/* Avatar */}
        <div className="absolute bottom-0 translate-y-1/2 right-6">
          <img
            src={profileUser.avatar_url || `https://i.pravatar.cc/120?u=${profileUser.email}`}
            alt=""
            className="w-24 h-24 rounded-2xl ring-4 ring-white object-cover"
          />
        </div>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/MyDashboard')}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Edit size={12} />
            ערוך פרופיל
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileUser.full_name || profileUser.email}</h1>
        {profileUser.headline && <p className="text-orange-500 mb-3">{profileUser.headline}</p>}
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

      {bots.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <User size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">אין סוכנים מפורסמים עדיין</p>
          {isOwnProfile && (
            <button
              onClick={() => navigate('/CreateBot?type=freelancer')}
              className="mt-4 px-6 py-2.5 bg-orange-500 text-gray-900 rounded-xl text-sm font-medium"
            >
              צור סוכן ראשון
            </button>
          )}
        </div>
      )}
    </div>
  );
}
