import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  signup: (email: string, password: string, name: string) => { success: boolean; error?: string };
  getAllUsers: () => User[];
  updateUserRole: (userId: string, newRole: UserRole) => boolean;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users database
const INITIAL_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'm.azeem.talib@gmail.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    avatar: 'AU'
  },
  {
    id: '2',
    email: 'doctor1@demo.com',
    password: 'doctor123',
    name: 'Dr. Sarah Smith',
    role: 'doctor',
    status: 'active',
    avatar: 'SS'
  },
  {
    id: '3',
    email: 'doctor2@demo.com',
    password: 'doctor123',
    name: 'Dr. Michael Brown',
    role: 'doctor',
    status: 'active',
    avatar: 'MB'
  },
  {
    id: '4',
    email: 'patient1@demo.com',
    password: 'patient123',
    name: 'John Anderson',
    role: 'patient',
    status: 'active',
    avatar: 'JA'
  },
  {
    id: '5',
    email: 'patient2@demo.com',
    password: 'patient123',
    name: 'Emily Johnson',
    role: 'patient',
    status: 'active',
    avatar: 'EJ'
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>([]);

  useEffect(() => {
    // Load users from localStorage or use initial users
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('app_users', JSON.stringify(INITIAL_USERS));
    }

    // Load current user session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUsers = (updatedUsers: (User & { password: string })[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (foundUser.status === 'inactive') {
      return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
    }

    const userData: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      status: foundUser.status,
      avatar: foundUser.avatar
    };
    
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const signup = (email: string, password: string, name: string): { success: boolean; error?: string } => {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'patient', // Default role for new signups
      status: 'active',
      avatar: initials
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto-login after signup
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      avatar: newUser.avatar
    };
    
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    
    return { success: true };
  };

  const getAllUsers = (): User[] => {
    return users.map(({ password, ...user }) => user);
  };

  const updateUserRole = (userId: string, newRole: UserRole): boolean => {
    if (user?.role !== 'admin') return false;
    
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    saveUsers(updatedUsers);
    return true;
  };

  const updateUserStatus = (userId: string, status: 'active' | 'inactive'): boolean => {
    if (user?.role !== 'admin') return false;
    
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status } : u
    );
    saveUsers(updatedUsers);
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      signup,
      getAllUsers,
      updateUserRole,
      updateUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
