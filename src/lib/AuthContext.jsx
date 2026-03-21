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

      // פרופיל לא קיים — ניצור
      const { data: created } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0] ||
            '',
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (created) setProfile(created);
    } catch (e) {
      // שגיאה בטעינת פרופיל — לא חוסמים את הטעינה
      console.warn('profile fetch error:', e.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setRawUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      }
      if (mounted) setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setRawUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
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
    try {
      const { data: updated } = await supabase
        .from('profiles')
        .upsert({ id: rawUser.id, email: rawUser.email, ...data })
        .select()
        .single();
      if (updated) setProfile(updated);
      return updated;
    } catch (e) {
      console.warn('updateMe error:', e.message);
    }
  };

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
      }
    : null;

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
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
