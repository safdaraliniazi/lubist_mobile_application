import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AppRole } from '@/navigation/navigation.types';
import { getUser, setTokens, setUser, clearAuth } from '@/services/storage/tokenStorage';
import { setOnAuthExpired } from '@/services/api/client';

type AuthContextValue = {
  isAuthenticated: boolean;
  role: AppRole | null;
  user: any | null;
  isLoading: boolean;
  signIn: (user: any, tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  updateUser: (user: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUserState] = useState<any | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const storedUser = await getUser();
        if (storedUser) {
          setUserState(storedUser);
          const backendRole = storedUser.user_role || storedUser.role || 'client';
          setRole(backendRole === 'customer' ? 'client' : backendRole);
        }
      } catch (err) {
        console.error('Failed to load auth from storage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  // When the API client can't recover the session (refresh failed/expired), it
  // clears SecureStore and fires this. Reset in-memory state so isAuthenticated
  // flips to false and navigation sends the user back to the login screen.
  useEffect(() => {
    setOnAuthExpired(() => {
      setUserState(null);
      setRole(null);
    });
    return () => setOnAuthExpired(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      role,
      user,
      isLoading,
      signIn: async (newUser: any, tokens: { access_token: string; refresh_token: string }) => {
        await setTokens(tokens.access_token, tokens.refresh_token);
        await setUser(newUser);
        setUserState(newUser);
        const backendRole = newUser.user_role || newUser.role || 'client';
        setRole(backendRole === 'customer' ? 'client' : backendRole);
      },
      updateUser: async (updatedUser: any) => {
        await setUser(updatedUser);
        setUserState(updatedUser);
        const backendRole = updatedUser.user_role || updatedUser.role || 'client';
        setRole(backendRole === 'customer' ? 'client' : backendRole);
      },
      signOut: async () => {
        await clearAuth();
        setUserState(null);
        setRole(null);
      },
    }),
    [role, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
