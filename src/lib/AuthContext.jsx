import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [rawUser, setRawUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // שולף פרופיל — אם לא קיים, יוצר אותו
  const fetchOrCreateProfile = async (authUser) => {
    if (!authUser) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setProfile(data);
      return data;
    }

    // פרופיל לא קיים (הטריגר נכשל) — ניצור אותו ידנית
    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.email?.split('@')[0] ||
      'משתמש';

    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: fullName,
        avatar_url: authUser.user_metadata?.avatar_url ?? null,
      })
      .select()
      .single();

    if (created) setProfile(created);
    return created;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setRawUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setRawUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
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
    setProfile(null);
  };

  // מעדכן פרופיל — upsert כולל email כדי לוודא שיצליח גם אם שורה לא קיימת
  const updateMe = async (data) => {
    if (!rawUser) return;

    const { data: updated, error } = await supabase
      .from('profiles')
      .upsert({
        id: rawUser.id,
        email: rawUser.email,
        ...data,
      })
      .select()
      .single();

    if (updated) setProfile(updated);
    return updated;
  };

  // user מאוחד: auth user + פרופיל DB
  const user = rawUser
    ? {
        ...rawUser,
        id: rawUser.id,
        email: rawUser.email,
        full_name:
          profile?.full_name ||
          rawUser.user_metadata?.full_name ||
          rawUser.email?.split('@')[0] ||
          '',
        avatar_url:
          profile?.avatar_url ||
          rawUser.user_metadata?.avatar_url ||
          null,
        // שדות מהפרופיל
        user_type: profile?.user_type ?? null,
        is_admin: profile?.is_admin ?? false,
        bio: profile?.bio ?? '',
        headline: profile?.headline ?? '',
        whatsapp: profile?.whatsapp ?? '',
      }
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithEmail,
      signupWithEmail,
      logout,
      updateMe,
      // compat
      loginWithGoogle: () => {},
      login: () => {},
      redirectToLogin: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
