import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

import { AppRole } from '@/navigation/navigation.types';

type AuthContextValue = {
  isAuthenticated: boolean;
  role: AppRole | null;
  signIn: (nextRole: AppRole) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<AppRole | null>(null);

  const value = useMemo(
    () => ({
      isAuthenticated: role !== null,
      role,
      signIn: (nextRole: AppRole) => setRole(nextRole),
      signOut: () => setRole(null),
    }),
    [role],
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
