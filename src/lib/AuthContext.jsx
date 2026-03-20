import { createContext, useContext, useState } from 'react';
import { mockUser } from './mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in

  const login = () => setUser(mockUser);
  const logout = () => setUser(null);
  const updateMe = (data) => setUser(prev => ({ ...prev, ...data }));
  const redirectToLogin = (returnUrl) => {
    // In a real app, would redirect to OAuth. Here we just log in with mock user.
    login();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateMe, redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
