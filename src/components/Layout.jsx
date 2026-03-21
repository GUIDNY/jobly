import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap, LogIn, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import LoginModal from './LoginModal';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'דף הבית' },
    { to: '/Marketplace', label: 'שוק' },
    { to: '/MyDashboard', label: 'אזור אישי' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap size={16} className="text-gray-900" />
            </div>
            <span className="text-xl font-bold text-gray-900">Jobly</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-orange-100 text-orange-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {user.role !== 'pro' && (
                  <Link
                    to="/ProUpgrade"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    שדרג ל-Pro
                  </Link>
                )}
                {user.is_admin && (
                  <Link
                    to="/Admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    <Shield size={14} />
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={user.avatar_url || `https://i.pravatar.cc/40?u=${user.email}`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-400/50"
                    />
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-50 border border-gray-200 rounded-xl shadow-2xl py-1">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={`/UserProfile?id=${user.id}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <User size={14} />
                        הפרופיל שלי
                      </Link>
                      <button
                        onClick={async () => { await logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut size={14} />
                        התנתק
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-gray-900 text-sm font-medium transition-colors"
              >
                <LogIn size={16} />
                התחברות
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-gray-50 border-l border-gray-200 h-full mr-0 ml-auto p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Zap size={16} className="text-gray-900" />
                </div>
                <span className="text-xl font-bold">Jobly</span>
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-400/50" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.role === 'pro' ? '⭐ Pro' : 'משתמש'}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to) ? 'bg-orange-100 text-orange-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link to="/ExpertsEdit" onClick={() => setDrawerOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  ניהול (Admin)
                </Link>
              )}
            </div>

            <div className="mt-auto">
              {user ? (
                <button
                  onClick={() => { logout(); setDrawerOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                >
                  <LogOut size={16} />
                  התנתק
                </button>
              ) : (
                <button
                  onClick={() => { setShowLogin(true); setDrawerOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-gray-900 text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  התחברות
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Page Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50/50 border-t border-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Zap size={16} className="text-gray-900" />
                </div>
                <span className="text-xl font-bold">Jobly</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                פלטפורמה דיגיטלית לחיבור פרילנסרים ומעסיקים באמצעות סוכני AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">מוצר</h4>
              <div className="flex flex-col gap-2">
                <Link to="/Marketplace" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">שוק הפרילנסרים</Link>
                <Link to="/ProUpgrade" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Pro Plan</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">חברה</h4>
              <div className="flex flex-col gap-2">
                <Link to="/Contact" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">צור קשר</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">משפטי</h4>
              <div className="flex flex-col gap-2">
                <Link to="/Privacy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">מדיניות פרטיות</Link>
                <Link to="/Terms" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">תנאי שימוש</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 Jobly. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}
