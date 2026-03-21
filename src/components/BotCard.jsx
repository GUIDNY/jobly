import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, MapPin, Briefcase, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function BotCard({ bot }) {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const isFreelancer = bot.bot_type === 'freelancer';

  const minPrice = isFreelancer
    ? Math.min(
        bot.pricing_basic?.price || Infinity,
        bot.pricing_standard?.price || Infinity,
        bot.pricing_premium?.price || Infinity
      )
    : null;

  const handleMouseEnter = () => {
    if (bot.gallery_media?.length > 1) {
      setImgIdx(1);
    }
  };
  const handleMouseLeave = () => setImgIdx(0);

  return (
    <div
      onClick={() => navigate(`/BotProfile?id=${bot.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-400/10 transition-all duration-300 cursor-pointer"
    >
      {/* Image / Avatar area */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {bot.banner_url ? (
          <img
            src={bot.banner_url}
            alt=""
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : bot.avatar_url ? (
          <img
            src={bot.avatar_url}
            alt=""
            className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 blur-sm scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-purple-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent" />
        <img
          src={bot.avatar_url || `https://i.pravatar.cc/80?u=${bot.id}`}
          alt=""
          className="absolute bottom-3 right-3 w-12 h-12 rounded-xl ring-2 ring-white object-cover"
        />
        {isFreelancer && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-900 font-medium">{bot.rating?.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{bot.name}</h3>
        <p className="text-xs text-orange-500 mb-2">{bot.role}</p>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{bot.description || bot.job_description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(bot.skills || []).slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-white/5 border border-gray-200 rounded-full text-xs text-gray-600">
              {s}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          {isFreelancer ? (
            <>
              <span className="text-xs text-gray-500">{bot.total_orders} הזמנות</span>
              <span className="text-sm font-bold text-gray-900">
                מ-<span className="text-orange-500">₪{minPrice?.toLocaleString()}</span>
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} />
                <span>{bot.location}</span>
              </div>
              <span className="text-xs font-medium text-orange-500">{bot.salary_range}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
