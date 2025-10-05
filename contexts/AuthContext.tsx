import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  active: boolean;
  profileImageUri?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (user: Omit<User, 'id' | 'role' | 'active'> & { password: string }) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

async function setUsers(users: User[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

async function setCurrentUser(user: User | null) {
  if (user) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const existing = await getCurrentUser();
      if (existing) setUser(existing);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // Hardcoded admin fallback
    if (email === 'admin' && password === '123') {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrator',
        email: 'admin',
        password: '123',
        role: 'admin',
        active: true,
      };
      setUser(adminUser);
      await setCurrentUser(adminUser);
      return true;
    }
    const users = await getUsers();
    const match = users.find((u) => u.email === email && u.password === password);
    if (match && match.active !== false) {
      setUser(match);
      await setCurrentUser(match);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await setCurrentUser(null);
  };

  const register = async (data: Omit<User, 'id' | 'role' | 'active'> & { password: string }) => {
    const users = await getUsers();
    const exists = users.some((u) => u.email === data.email);
    if (exists) return false;
    const newUser: User = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'user',
      active: true,
      profileImageUri: null,
    };
    const next = [...users, newUser];
    await setUsers(next);
    setUser(newUser);
    await setCurrentUser(newUser);
    return true;
  };

  const refresh = async () => {
    const current = await getCurrentUser();
    setUser(current);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, register, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


