import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [rawUser, setRawUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (authUser) => {
    if (!authUser) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setProfile(data);
        return;
      }

      // פרופיל לא קיים — ניצור בלי לחכות לתשובה
      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        avatar_url: authUser.user_metadata?.avatar_url || null,
      };
      await supabase.from('profiles').upsert(newProfile);
      setProfile(newProfile);
    } catch (e) {
      console.warn('profile fetch error:', e.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Load existing session on mount (persisted in localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const authUser = session?.user ?? null;
      setRawUser(authUser);
      setLoading(false);
      if (authUser) fetchOrCreateProfile(authUser);
    });

    // Listen for future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const authUser = session?.user ?? null;
      setRawUser(authUser);
      setLoading(false);
      if (authUser) {
        fetchOrCreateProfile(authUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signupWithEmail = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

  const logout = async () => {
    await supabase.auth.signOut();
    setRawUser(null);
    setProfile(null);
  };

  const updateMe = async (data) => {
    if (!rawUser) return;
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: rawUser.id, email: rawUser.email, ...data });
    if (error) {
      console.warn('updateMe error:', error.message);
      throw error;
    }
    // Update local state immediately without needing a SELECT
    setProfile(prev => ({ ...(prev || {}), id: rawUser.id, email: rawUser.email, ...data }));
    return { ...(profile || {}), id: rawUser.id, email: rawUser.email, ...data };
  };

  const isPro = profile?.plan === 'pro' &&
    (!profile?.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const user = rawUser
    ? {
        ...rawUser,
        id: rawUser.id,
        email: rawUser.email,
        full_name:
          profile?.full_name ||
          rawUser.user_metadata?.full_name ||
          rawUser.email?.split('@')[0] || '',
        avatar_url:
          profile?.avatar_url ||
          rawUser.user_metadata?.avatar_url || null,
        user_type: profile?.user_type ?? null,
        is_admin: profile?.is_admin ?? false,
        bio: profile?.bio ?? '',
        headline: profile?.headline ?? '',
        whatsapp: profile?.whatsapp ?? '',
        plan: profile?.plan ?? 'free',
      }
    : null;

  // Used only for testing — marks the current user as pro in the DB
  const activatePro = async () => {
    if (!rawUser) return;
    await updateMe({ plan: 'pro', plan_expires_at: null });
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isPro, activatePro,
      loginWithEmail, signupWithEmail, logout, updateMe,
      loginWithGoogle: () => {}, login: () => {}, redirectToLogin: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
