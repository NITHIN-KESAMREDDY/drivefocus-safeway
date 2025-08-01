import { useState, useEffect } from 'react';
import { User } from '@/types/trip';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const savedUser = localStorage.getItem('drivefocus-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        ...parsedUser,
        createdAt: new Date(parsedUser.createdAt)
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple validation for demo
    if (email && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date()
      };
      
      setUser(newUser);
      localStorage.setItem('drivefocus-user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple validation for demo
    if (email && password.length >= 6 && name.length >= 2) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date()
      };
      
      setUser(newUser);
      localStorage.setItem('drivefocus-user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('drivefocus-user');
    localStorage.removeItem('drivefocus-trips');
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
};