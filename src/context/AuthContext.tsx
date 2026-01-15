import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('bau_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bau_user');
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
