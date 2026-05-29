import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi } from '../api/auth';
import { SessionData, Usuario } from '../types/auth';
import { clearSession, getSession, saveSession } from '../storage/sessionStorage';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.usuario) setUsuario(session.usuario);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);

    if (!response.ok || !response.usuario) {
      throw new Error(response.error || 'No se pudo iniciar sesión');
    }

    const session: SessionData = {
      usuario: response.usuario,
      loginAt: new Date().toISOString(),
    };

    await saveSession(session);
    setUsuario(response.usuario);
  };

  const logout = async () => {
    await clearSession();
    setUsuario(null);
  };

  const value = useMemo(
    () => ({ usuario, loading, login, logout }),
    [usuario, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
