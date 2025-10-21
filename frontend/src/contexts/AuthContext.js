import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, username, password, grade) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('students')
      .insert([{
        id: authData.user.id,
        email,
        username,
        password_hash: '',
        grade,
        xp: 0,
        level: 1,
        streak: 0
      }]);

    if (profileError) throw profileError;

    await loadUserProfile(authData.user.id);
    return { user: authData.user };
  };

  const login = async (username, password) => {
    const { data: student } = await supabase
      .from('students')
      .select('email')
      .eq('username', username)
      .maybeSingle();

    if (!student) throw new Error('Invalid credentials');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: student.email,
      password,
    });

    if (error) throw error;

    await loadUserProfile(data.user.id);
    return { user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
