import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import mahasiswaData from '@/data/mahasiswa.json';

interface User {
  nim: string;
  nama: string;
  jurusan: string;
  semester: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (nim: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bau_user');
    const savedActivity = localStorage.getItem('bau_last_activity');
    
    if (savedUser) {
      const lastActivityTime = savedActivity ? parseInt(savedActivity, 10) : Date.now();
      const now = Date.now();
      
      // Check if session has expired due to idle timeout
      if (now - lastActivityTime > IDLE_TIMEOUT) {
        // Session expired - clear storage
        localStorage.removeItem('bau_user');
        localStorage.removeItem('bau_last_activity');
      } else {
        setUser(JSON.parse(savedUser));
        setLastActivity(lastActivityTime);
      }
    }
  }, []);

  // Track user activity
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem('bau_last_activity', now.toString());
  }, []);

  // Add activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for idle timeout periodically
    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      const savedActivity = localStorage.getItem('bau_last_activity');
      const lastActivityTime = savedActivity ? parseInt(savedActivity, 10) : lastActivity;
      
      if (now - lastActivityTime > IDLE_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(idleCheckInterval);
    };
  }, [user, lastActivity, updateActivity]);

  const login = (nim: string, password: string): boolean => {
    // Password is the same as NIM
    const foundUser = mahasiswaData.find(
      (m) => m.nim === nim && nim === password
    );

    if (foundUser) {
      const userData: User = {
        nim: foundUser.nim,
        nama: foundUser.nama,
        jurusan: foundUser.jurusan,
        semester: foundUser.semester,
        isAdmin: foundUser.isAdmin || false,
      };
      setUser(userData);
      localStorage.setItem('bau_user', JSON.stringify(userData));
      updateActivity();
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bau_user');
    localStorage.removeItem('bau_last_activity');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
